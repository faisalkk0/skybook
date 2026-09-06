const env = require('../config/env');

function errorHandler(err, req, res, _next) {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors || [];

  if (err.name === 'ValidationError') {
    status = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors || {}).map((e) => e.message);
  }

  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }

  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  }

  if (status >= 500 && env.nodeEnv === 'production') {
    message = 'Something went wrong';
  }

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    errors,
  });
}

module.exports = errorHandler;
