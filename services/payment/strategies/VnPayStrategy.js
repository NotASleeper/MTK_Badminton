const { paymentVNPAY } = require("../../vnpay");
const PaymentStrategy = require("./PaymentStrategy");
// Import hàm xử lý cũ của bạn (điều chỉnh đường dẫn cho đúng với project của bạn)

class VnPayStrategy extends PaymentStrategy {
  async pay(req, res, amount, orderId) {
    console.log(`[Strategy] Đang xử lý thanh toán VNPay cho đơn: ${orderId}`);
    // Legacy function signature: paymentVNPAY(orderid, totalprice, res)
    return await paymentVNPAY(orderId, amount, res);
  }
}

module.exports = VnPayStrategy;
