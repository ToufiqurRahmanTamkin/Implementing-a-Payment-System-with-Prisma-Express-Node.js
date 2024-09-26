const express = require("express");
const { body } = require("express-validator");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

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

module.exports = router;
