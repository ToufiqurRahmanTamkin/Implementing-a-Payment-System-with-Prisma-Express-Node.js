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
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

const sendPaymentFailureEmail = async (email, amount, currency) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Payment Failed",
    text: `Your payment of ${currency}-${amount} failed. Please check your payment method.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

const sendScheduledPaymentEmail = async (email, amount, currency) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Scheduled Payment",
    text: `Scheduled payment of ${currency}-${amount} successful.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

const sendRefundEmail = async (email, amount, currency) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Refund Processed",
    text: `Refund of ${currency}-${amount} successful.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendPaymentSuccessEmail,
  sendPaymentFailureEmail,
  sendScheduledPaymentEmail,
  sendRefundEmail,
};
