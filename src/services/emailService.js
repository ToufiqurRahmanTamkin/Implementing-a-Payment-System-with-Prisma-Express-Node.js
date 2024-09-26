const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPaymentSuccessEmail = async (email, amount, currency) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Payment Successful",
    text: `Your payment of ${currency}-${amount} was successful.`,
  };

  await transporter.sendMail(mailOptions);
};

const sendPaymentFailureEmail = async (email, amount, currency) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Payment Failed",
    text: `Your payment of ${currency}-${amount} failed. Please check your payment method.`,
  };

  await transporter.sendMail(mailOptions);
};

const sendScheduledPaymentEmail = async (email, amount, currency) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Scheduled Payment",
    text: `Scheduled payment of ${currency}-${amount} successful.`,
  };

  await transporter.sendMail(mailOptions);
};

const sendRefundEmail = async (email, amount, currency) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Refund Processed",
    text: `Refund of ${currency}-${amount} successful.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPaymentSuccessEmail,
  sendPaymentFailureEmail,
  sendScheduledPaymentEmail,
  sendRefundEmail,
};
