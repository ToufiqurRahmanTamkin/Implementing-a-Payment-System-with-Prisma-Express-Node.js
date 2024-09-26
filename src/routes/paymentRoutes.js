const express = require("express");
const { body } = require("express-validator");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const cronJobs = require("../utils/cronJobs");

const router = express.Router();

router.post(
  "/create-intent",
  authMiddleware,
  [
    body("amount")
      .isInt({ gt: 0 })
      .withMessage("Amount must be greater than 0"),
    body("currency").notEmpty().withMessage("Currency is required"),
  ],
  paymentController.createPaymentIntent
);

router.post(
  "/confirm",
  authMiddleware,
  body("paymentIntentId")
    .notEmpty()
    .withMessage("Payment Intent ID is required"),
  paymentController.confirmPayment
);

router.post(
  "/setup-auto-payment",
  authMiddleware,
  [
    body("paymentIntentId")
      .notEmpty()
      .withMessage("Payment Intent ID is required"),
    body("nextPaymentDate")
      .isISO8601()
      .withMessage("Next Payment Date must be a valid date"),
  ],
  paymentController.setupAutoPayment
);

// manually trigger the CRON job (just for checking purposes)
router.post("/trigger-cron", async (req, res) => {
  try {
    await cronJobs();
    res.status(200).send("CRON job triggered successfully");
  } catch (error) {
    res.status(500).send(`Error triggering CRON job: ${error.message}`);
  }
});

router.get("/history", authMiddleware, paymentController.getPaymentHistory);

router.post(
  "/refund",
  authMiddleware,
  [
    body("paymentIntentId")
      .notEmpty()
      .withMessage("Payment Intent ID is required"),
  ],
  paymentController.refundPayment
);

module.exports = router;
