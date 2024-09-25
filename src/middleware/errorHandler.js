module.exports = (err, req, res, next) => {
  console.error(err.stack);

  if (err.type === 'StripeCardError') {
    return res.status(402).send({ error: err.message });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).send({ error: err.message });
  }

  res.status(500).send({ error: 'Something went wrong' });
};
