const { PaymentPaypal } = require("../../paypal");
const PaymentStrategy = require("./PaymentStrategy");

class PaypalStrategy extends PaymentStrategy {
  async pay(req, res, amount, orderId) {
    console.log(`[Strategy] Đang xử lý thanh toán PayPal cho đơn: ${orderId}`);
    // Legacy function signature: PaymentPaypal(orderid, totalprice, res)
    return await PaymentPaypal(orderId, amount, res);
  }
}

module.exports = PaypalStrategy;
