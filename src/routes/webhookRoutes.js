const express = require("express");
const webhookController = require("../controllers/webhookController");

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  webhookController.handleWebhook
);

module.exports = router;
