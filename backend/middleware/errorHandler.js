export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = status === 500 ? 'Something went wrong.' : err.message;
  if (status === 500) {
    console.error(err.message);
  }
  res.status(status).json({ error: message });
}

export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found.' });
}
