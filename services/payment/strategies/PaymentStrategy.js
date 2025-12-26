class PaymentStrategy {
  /**
   * Hàm xử lý thanh toán (Mọi class con bắt buộc phải có hàm này)
   * @param {Object} req - Request từ Express (để lấy ip, v.v nếu cần)
   * @param {Object} res - Response từ Express
   * @param {Number} amount - Tổng tiền
   * @param {String|Number} orderId - Mã đơn hàng
   */
  async pay(req, res, amount, orderId) {
    throw new Error("Method 'pay' must be implemented");
  }
}

module.exports = PaymentStrategy;
