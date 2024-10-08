const cron = require("node-cron");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/database");
const emailService = require("../services/emailService");

const processAutoPayments = async () => {
  const payments = await prisma.payment.findMany({
    where: {
      autoPayment: true,
      nextPaymentDate: { lte: new Date() },
    },
  });

  for (const payment of payments) {
    try {
      console.log(`Processing payment for user ${payment.userId}`);

      // lets assume that the user has a saved payment method
      // const user = await prisma.user.findUnique({ where: { id: payment.userId } });
      // const paymentMethodId = user.savedPaymentMethodId;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: payment.amount,
        currency: payment.currency,
        payment_method: "pm_card_visa", // Hardcoded payment method
        confirm: true,
        metadata: { userId: payment.userId },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        off_session: true,
      });

      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
      });

      if (paymentIntent.status === "succeeded") {
        await emailService.sendPaymentSuccessEmail(
          user.email,
          payment.amount,
          payment.currency
        );

        // Create a new payment entry instead of updating the existing one
        await prisma.payment.create({
          data: {
            userId: payment.userId,
            stripePaymentIntentId: paymentIntent.id,
            amount: payment.amount,
            currency: payment.currency,
            status: paymentIntent.status,
            nextPaymentDate: new Date(
              new Date().setDate(new Date().getDate() + 7) // Example: weekly payments
            ),
            autoPayment: payment.autoPayment,
          },
        });
      } else {
        await emailService.sendPaymentFailureEmail(
          user.email,
          payment.amount,
          payment.currency
        );
      }
    } catch (error) {
      console.error(
        `Failed to process auto-payment for user ${payment.userId}:`,
        error
      );

      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
      });

      await emailService.sendPaymentFailureEmail(
        user.email,
        payment.amount,
        payment.currency
      );

      // Disable auto-payments after repeated failures
      await prisma.payment.update({
        where: { id: payment.id },
        data: { autoPayment: false },
      });
    }
  }
};

// Schedule the CRON job
cron.schedule("0 0 * * *", processAutoPayments);

module.exports = processAutoPayments;
