const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cron = require("node-cron");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");
const cronJobs = require("./utils/cronJobs");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);

app.use(errorHandler);

cron.schedule("0 0 * * *", async () => {
  await cronJobs();
});

module.exports = app;
