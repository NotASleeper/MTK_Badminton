const PaymentStrategy = require("./PaymentStrategy");
const { Payment } = require("../../../models");

class CashStrategy extends PaymentStrategy {
  async pay(req, res, amount, orderId) {
    console.log(`[Strategy] Xử lý thanh toán Tiền mặt cho đơn: ${orderId}`);
    // Logic đơn giản cho tiền mặt
    const newPayment = await Payment.create({
      orderid: orderId,
      paymentmethod: "Cash",
      status: 1, // Assuming 0 means done
    });
    res.status(201).send(newPayment);
  }
}

module.exports = CashStrategy;
