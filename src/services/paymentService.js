const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../prismaClient");

const createPaymentIntent = async (userId, amount, currency) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
  });
  await prisma.payment.create({
    data: {
      userId,
      stripePaymentIntent: paymentIntent.id,
      amount,
      currency,
      status: "pending",
    },
  });
  return paymentIntent.client_secret;
};

const confirmPayment = async (paymentIntentId, status) => {
  return prisma.payment.update({
    where: { stripePaymentIntent: paymentIntentId },
    data: { status },
  });
};

module.exports = { createPaymentIntent, confirmPayment };
