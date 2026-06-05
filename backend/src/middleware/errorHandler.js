function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || "Something went wrong.",
      ...(error.details ? { details: error.details } : {}),
    },
  });
}

module.exports = errorHandler;
