const { Payment, Orders } = require("../models");
const PaymentFactory = require("../services/payment/PaymentFactory");
const { PaymentPaypal, capturePayment } = require("../services/paypal");
const { paymentVNPAY } = require("../services/vnpay");
const crypto = require("crypto");
require("dotenv").config();

const createPayment = async (req, res) => {
  try {
    const { orderid, paymentmethod } = req.body;
    const payingorder = await Orders.findOne({
      where: { id: orderid },
    });
    const paymentStrategy = PaymentFactory.getPaymentStrategy(paymentmethod);
    await paymentStrategy.pay(req, res, payingorder.totalprice, orderid);
    // if (paymentmethod === "cash") {
    //   const newPayment = await Payment.create({
    //     orderid,
    //     paymentmethod,
    //     status: 0, // Assuming 0 means pending
    //   });
    //   res.status(201).send(newPayment);
    // } else if (paymentmethod === "paypal") {
    //   const payingorder = await Orders.findOne({
    //     where: { id: orderid },
    //   });
    //   if (!payingorder) {
    //     return res.status(404).send({ message: "Order not found" });
    //   }
    //   await PaymentPaypal(payingorder.id, payingorder.totalprice, res);
    // } else {
    //   const payingorder = await Orders.findOne({
    //     where: { id: orderid },
    //   });
    //   if (!payingorder) {
    //     return res.status(404).send({ message: "Order not found" });
    //   }
    //   await paymentVNPAY(payingorder.id, payingorder.totalprice, res);
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

const checkPaymentVNPAY = async (req, res) => {
  console.log(req.query);
  try {
    let vnpParams = req.query; // VNPAY trả về qua query string

    const secureHash = vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHashType"];

    vnpParams = sortObject(vnpParams); // Sắp xếp key theo thứ tự a-z

    const signData = new URLSearchParams(vnpParams).toString();
    const hmac = crypto.createHmac("sha512", process.env.VNPAY_SECRET);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash !== signed) {
      return res
        .status(400)
        .json({ message: "Sai chữ ký (invalid signature)" });
    }

    const orderid = vnpParams["vnp_TxnRef"];
    const transactionid = vnpParams["vnp_TransactionNo"];
    const amount = Number(vnpParams["vnp_Amount"]) / 100; // convert từ VND ×100
    const statusCode = vnpParams["vnp_ResponseCode"];
    const transactionStatus = vnpParams["vnp_TransactionStatus"];

    const order = await Orders.findOne({ where: { id: orderid } });
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Nếu thanh toán thành công
    if (statusCode === "00" && transactionStatus === "00") {
      await Payment.create({
        transactionid: transactionid,
        orderid: orderid,
        paymentmethod: "VNPAY",
        status: 1, // 1 = PAID
      });

      return res.redirect(
        `http://localhost:3030/paymentsuccess?orderId=${orderid}`
      );
    } else {
      return res.redirect(
        `http://localhost:3030/paymentfailed?orderId=${orderid}`
      );
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Lỗi server trong khi xác thực thanh toán" });
  }
};

const checkPaymentPaypal = async (req, res) => {
  try {
    const data = await capturePayment(req.query.token);
    const orderid = req.query.orderid;
    if (data.status === "COMPLETED") {
      await Payment.create({
        transactionid: data.id,
        orderid: orderid,
        paymentmethod: "Paypal",
        status: 1, // 1 = PAID
      });

      return res.redirect(
        `http://localhost:3030/paymentsuccess?orderId=${orderid}`
      );
    } else {
      return res.redirect(
        `http://localhost:3030/paymentfailed?orderId=${orderid}`
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error processing PayPal payment" });
  }
};

module.exports = {
  createPayment,
  checkPaymentVNPAY,
  checkPaymentPaypal,
};
