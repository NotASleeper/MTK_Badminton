const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
  constructor() {
    if (!EmailService.instance) {
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USERNAME, // your email address
          pass: process.env.EMAIL_PASSWORD, // your email password or app password
        },
      });
      EmailService.instance = this;
    }
    return EmailService.instance;
  }

  async sendEmail(email, subject, text, html) {
    return await this.transporter.sendMail({
      from: '"BadmintonWebsite" <no-reply@badminton.com>', // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html,
    });
  }
}

const emailService = new EmailService();
module.exports = {
  sendEmail: emailService.sendEmail.bind(emailService),
};
