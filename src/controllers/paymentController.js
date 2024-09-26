const { validationResult } = require("express-validator");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/database");
const emailService = require("../services/emailService");

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency, paymentMethodId, returnUrl } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ message: "Payment Method ID is required" });
    }

    if (amount < 50) {
      return res
        .status(400)
        .json({ message: "Amount must be at least $0.50 USD" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirmation_method: "automatic",
      confirm: true,
      return_url: returnUrl,
      metadata: { userId: req.userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (paymentIntent.status === "succeeded") {
      await emailService.sendPaymentSuccessEmail(
        user.email,
        paymentIntent.amount,
        paymentIntent.currency
      );

      await prisma.payment.create({
        data: {
          userId: req.userId,
          stripePaymentIntentId: paymentIntent.id,
          amount,
          currency,
          status: paymentIntent.status,
        },
      });
    } else {
      await emailService.sendPaymentFailureEmail(
        user.email,
        paymentIntent.amount,
        paymentIntent.currency
      );
    }

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

    if (payment) {
      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
      });

      await emailService.sendScheduledPaymentEmail(
        user.email,
        payment.amount,
        payment.currency
      );
    }

    res.json(payment);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.query.userId;
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { id: "desc" }, // mostly i use createdAt or updatedAt for storting but as i don't put them in the schema so i used id
    });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment Intent ID is required" });
    }

    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized request" });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: payment.amount,
    });

    if (refund?.status === "succeeded") {
      await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntentId },
        data: { status: "refunded" },
      });

      // send a refund email
      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
      });

      await emailService.sendRefundEmail(
        user.email,
        payment.amount,
        payment.currency
      );
      return res.status(200).json({ message: "Refund processed successfully" });
    } else {
      return res.status(500).json({ error: "Failed to process refund" });
    }
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ error: "Failed to process refund" });
  }
};
