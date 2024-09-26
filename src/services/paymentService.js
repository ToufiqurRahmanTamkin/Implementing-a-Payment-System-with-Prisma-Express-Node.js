const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/database");

const createPaymentIntent = async (
  userId,
  amount,
  currency,
  paymentMethodId,
  returnUrl
) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // * 100
        currency,
        payment_method: paymentMethodId,
        confirm: true,
        return_url: returnUrl,
        metadata: { userId },
      });

      await prisma.payment.create({
        data: {
          userId,
          stripePaymentIntentId: paymentIntent.id,
          amount,
          currency,
          status: paymentIntent.status,
        },
      });

      return paymentIntent;
    });

    return result;
  } catch (error) {
    throw error;
  }
};

const getPaymentStatus = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: paymentIntent.status },
    });

    return paymentIntent.status;
  } catch (error) {
    console.error("Error getting payment status:", error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  getPaymentStatus,
};
