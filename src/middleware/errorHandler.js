module.exports = (err, req, res, next) => {
  if (err.type === "StripeCardError") {
    return res.status(402).send({ error: err.message });
  }

  if (err.type === "StripeInvalidRequestError") {
    return res.status(400).send({ error: err.message });
  }

  if (err.type === "StripeAPIError") {
    return res.status(500).send({ error: "Something went wrong with Stripe" });
  }

  if (err.type === "StripeConnectionError") {
    return res.status(500).send({ error: "Something went wrong with Stripe" });
  }

  if (err.type === "StripeAuthenticationError") {
    return res.status(500).send({ error: "Something went wrong with Stripe" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).send({ error: err.message });
  }

  res.status(500).send({ error: "Something went wrong" });
};
