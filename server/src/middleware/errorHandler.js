export default function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error status and message
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  // Send error response
  res.status(status).json({
    error: {
      message: message,
      status: status,
      timestamp: new Date().toISOString()
    }
  });
}
