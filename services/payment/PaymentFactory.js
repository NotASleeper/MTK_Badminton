const VnPayStrategy = require("./strategies/VnPayStrategy");
const CashStrategy = require("./strategies/CashStrategy");
const PaypalStrategy = require("./strategies/PayPalStrategy");

class PaymentFactory {
  /**
   * Factory Method: Nhận vào tên phương thức và trả về Instance tương ứng
   */
  static getPaymentStrategy(paymentMethod) {
    // Chuẩn hóa input (về chữ thường để dễ so sánh)
    const method = paymentMethod ? paymentMethod.toLowerCase() : "";

    switch (method) {
      case "vnpay":
        return new VnPayStrategy();
      case "paypal":
        return new PaypalStrategy();
      case "cash":
        return new CashStrategy();
      default:
        throw new Error(
          `Phương thức thanh toán '${paymentMethod}' không được hỗ trợ.`
        );
    }
  }
}

module.exports = PaymentFactory;
