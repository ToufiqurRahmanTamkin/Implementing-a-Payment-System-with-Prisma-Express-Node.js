const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require("@prisma/client");
const emailService = require("../services/emailService");

const prisma = new PrismaClient();

const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { user: true },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "succeeded" },
    });

    await emailService.sendPaymentSuccessEmail(
      payment.user.email,
      payment.amount,
      payment.currency
    );
  }
};

const handlePaymentIntentFailed = async (paymentIntent) => {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { user: true },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    });

    await emailService.sendPaymentFailureEmail(
      payment.user.email,
      payment.amount,
      payment.currency
    );
  }
};

module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
