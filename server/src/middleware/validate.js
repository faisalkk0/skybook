const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((item) => item.msg);
  next(new AppError(errors[0] || 'Validation failed', 422, errors));
}

module.exports = validate;
