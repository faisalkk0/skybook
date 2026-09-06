const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const paymentService = require('../services/paymentService');
const env = require('../config/env');

exports.createIntent = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    user: req.user._id,
  });
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status === 'cancelled') throw new AppError('Cancelled booking cannot be paid', 400);
  const intent = await paymentService.createPaymentIntent(booking, req.user);
  return success(res, { message: 'Payment initialized', data: intent });
});

exports.confirm = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    user: req.user._id,
  });
  if (!booking) throw new AppError('Booking not found', 404);
  const result = await paymentService.confirmSuccessfulPayment(booking._id, {
    paymentIntentId: req.body.paymentIntentId,
    paymentMethod: req.body.paymentMethod || (paymentService.isStripeEnabled() ? 'card' : 'test_card'),
  });
  return success(res, { message: 'Payment confirmed', data: result });
});

exports.config = asyncHandler(async (req, res) => {
  return success(res, {
    message: 'Payment config',
    data: {
      stripeEnabled: paymentService.isStripeEnabled(),
      publishableKey: env.stripePublishableKey || '',
    },
  });
});
