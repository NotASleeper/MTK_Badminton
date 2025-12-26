// services/checkout/CheckoutFacade.js
const {
  Orders,
  Ordersdetail,
  Promotions,
  Products,
  Carts,
  sequelize,
} = require("../../models");

class CheckoutFacade {
  // Xử lý toàn bộ quy trình checkout trong một giao dịch
  async checkoutCart({
    userId,
    cartItemId,
    phoneNumber,
    address,
    promotionCode,
  }) {
    const t = await sequelize.transaction();

    try {
      const cartItems = await Carts.findAll({
        where: { id: cartItemId, userid: userId },
        include: [{ model: Products }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!cartItems.length) {
        throw new Error("No items found in the cart");
      }

      let promotion = null;
      if (promotionCode) {
        promotion = await Promotions.findOne({
          where: { code: promotionCode },
          transaction: t,
        });
        if (!promotion) {
          throw new Error("Promotion code not found");
        }
        if (promotion.status === 0) {
          throw new Error("Promotion code is not valid");
        }
      }

      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + item.quantity * (item.Product ? item.Product.price : 0);
      }, 0);

      const discountedTotal = promotion
        ? totalAmount * (1 - promotion.value / 100)
        : totalAmount;

      const newOrder = await Orders.create(
        {
          userid: userId,
          totalprice: discountedTotal,
          phonenumber: phoneNumber,
          address,
          promotionid: promotion ? promotion.id : null,
          status: 0,
        },
        { transaction: t }
      );

      const orderDetails = cartItems.map((item) => ({
        orderid: newOrder.id,
        productid: item.productid,
        quantity: item.quantity,
      }));
      await Ordersdetail.bulkCreate(orderDetails, { transaction: t });

      for (const item of cartItems) {
        const currentQty = item.Product ? item.Product.quantity : 0;
        if (currentQty < item.quantity) {
          throw new Error("Insufficient product quantity");
        }
        await Products.update(
          { quantity: currentQty - item.quantity },
          { where: { id: item.productid }, transaction: t }
        );
      }

      await Carts.destroy({
        where: { id: cartItemId, userid: userId },
        transaction: t,
      });

      await t.commit();
      return newOrder;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new CheckoutFacade();
