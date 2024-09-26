const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/database");

exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: "succeeded" },
    });
  } else if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: "failed" },
    });
  }

  res.json({ received: true });
};
