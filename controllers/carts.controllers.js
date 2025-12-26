const {
  Carts,
  Products,
  Promotions,
  Ordersdetail,
  Orders,
  Users,
} = require("../models");
const checkoutFacade = require("../services/checkout/CheckoutFacade");

const createCarts = async (req, res) => {
  try {
    const { userid, productid, quantity, notes } = req.body;
    const existingCart = await Carts.findOne({
      where: { userid, productid },
    });
    if (existingCart) {
      existingCart.quantity += quantity;
      existingCart.notes = notes;
      await existingCart.save();
      return res.status(200).send(existingCart);
    }
    const newCart = await Carts.create({
      userid,
      productid,
      quantity,
      notes,
    });
    res.status(201).send(newCart);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getAllCartsbyUserId = async (req, res) => {
  try {
    const { userid } = req.params;
    const cartsList = await Carts.findAll({
      where: { userid },
      include: {
        model: Products,
        attributes: ["id", "name", "price", "description", "brand"],
      },
      include: {
        model: Users,
        attributes: ["id", "name", "email"],
      },
    });
    res.status(200).send(cartsList);
  } catch (error) {
    res.status;
  }
};

const getDetailCarts = async (req, res) => {
  const { id } = req.params;
  try {
    const detailCarts = await Carts.findOne({
      where: { id },
    });
    res.status(200).send(detailCarts);
  } catch (error) {
    res.status(500).send(error);
  }
};

const updateCarts = async (req, res) => {
  const { id } = req.params;
  const { userid, productid, quantity, notes } = req.body;
  try {
    const detailCarts = await Carts.findOne({
      where: { id },
    });
    detailCarts.userid = userid;
    detailCarts.productid = productid;
    detailCarts.quantity = quantity;
    detailCarts.notes = notes;
    await detailCarts.save();
    res.status(200).send(detailCarts);
  } catch (error) {
    res.status(500).send(error);
  }
};

const deleteCarts = async (req, res) => {
  const { id } = req.params;
  try {
    const detailCarts = await Carts.findOne({
      where: { id },
    });
    await detailCarts.destroy();
    res.status(200).send("Cart deleted successfully");
  } catch (error) {
    res.status(500).send(error);
  }
};

const CheckoutCarts = async (req, res) => {
  const { userid, cartitemid, phonenumber, address, promotioncode } = req.body;
  try {
    const newOrder = await checkoutFacade.checkoutCart({
      userId: userid,
      cartItemId: cartitemid,
      phoneNumber: phonenumber,
      address,
      promotionCode: promotioncode,
    });

    res
      .status(201)
      .json({ message: "Order created successfully", orderId: newOrder.id });
  } catch (error) {
    console.error("Checkout error:", error);
    const isClientError =
      error.message === "No items found in the cart" ||
      error.message === "Promotion code not found" ||
      error.message === "Promotion code is not valid" ||
      error.message === "Insufficient product quantity";

    res
      .status(isClientError ? 400 : 500)
      .json({ message: error.message || "Checkout failed" });
  }
};

module.exports = {
  createCarts,
  getAllCartsbyUserId,
  getDetailCarts,
  updateCarts,
  deleteCarts,
  CheckoutCarts,
};
