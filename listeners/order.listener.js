const eventEmitter = require("../utils/eventEmitter");
const { sendEmail } = require("../services/emailservice");
const { Users } = require("../models");

eventEmitter.on("ORDER_CREATED", async (order) => {
    try {
        console.log(`[EVENT] Processing sending email for order #${order.id}`);

        const user = await Users.findByPk(order.userid);

        if (!user?.email) {
            console.log("User email not found.");
            return;
        }

        const subject = "Order Confirmation - MTK Badminton";
        const text = `Thank you for your order! Your Order ID is #${order.id}. Total amount: ${order.totalprice} VND.`;
        const html = `
        <h1>Order placed Successfully!</h1>
        <p>Dear <b>${user.name}</b>,</p>
        <p>Thank you for shopping with MTK Badminton. Your order has been received and is being processed.</p>
        <p>Order ID: <b>#${order.id}</b></p>
        <p>Total amount: <b>${order.totalprice} VNĐ</b></p>
        <p>Shipping address: ${order.address}</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br/>The MTK Badminton Team</p>
    `;

        // Gửi email
        await sendEmail(user.email, subject, text, html);
        console.log(`[EVENT] Successfully sent email to ${user.email}`);

    } catch (error) {
        console.error(`[EVENT] Error sending email:`, error);
    }
});