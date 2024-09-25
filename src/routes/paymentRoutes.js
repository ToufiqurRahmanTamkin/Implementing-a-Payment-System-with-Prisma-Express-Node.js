const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // Protect all payment routes

router.post(
  '/create-intent',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('currency').isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency'),
    body('autoPayment').isBoolean().withMessage('autoPayment must be a boolean'),
  ],
  paymentController.createPaymentIntent
);

router.post(
  '/confirm',
  [
    body('paymentIntentId').notEmpty().withMessage('Payment Intent ID is required'),
  ],
  paymentController.confirmPayment
);

router.get('/history', paymentController.getPaymentHistory);

module.exports = router;
