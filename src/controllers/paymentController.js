const { validationResult } = require("express-validator");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/database"); // Correct path

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency, paymentMethodId, returnUrl } = req.body; // Ensure returnUrl is retrieved from the request body

    if (!paymentMethodId) {
      return res.status(400).json({ message: "Payment Method ID is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirmation_method: "automatic",
      confirm: true,
      return_url: returnUrl, // Specify the return_url
      metadata: { userId: req.userId },
    });

    await prisma.payment.create({
      data: {
        userId: req.userId,
        stripePaymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body; // Ensure paymentIntentId is retrieved from the request body

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment Intent ID is required" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntentId },
        data: { status: "succeeded" },
      });
    } else {
      await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntentId },
        data: { status: "failed" },
      });
    }

    res.json({ status: paymentIntent.status });
  } catch (error) {
    next(error);
  }
};

exports.setupAutoPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentIntentId, nextPaymentDate } = req.body;

    const payment = await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntentId },
      data: {
        autoPayment: true,
        nextPaymentDate: new Date(nextPaymentDate),
      },
    });

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.query.userId;
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { id: "desc" }, // mostly i use createdAt and updatedAt for storting but as i don't put them in the schema so i used id
    });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};
