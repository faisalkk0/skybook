const Stripe = require('stripe');
const env = require('../config/env');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const AppError = require('../utils/AppError');
const emailService = require('./emailService');

function getStripe() {
  if (!env.stripeSecretKey) return null;
  return new Stripe(env.stripeSecretKey);
}

function isStripeEnabled() {
  return Boolean(env.stripeSecretKey);
}

async function createPaymentIntent(booking, user) {
  const amount = Math.round(Number(booking.totalAmount) * 100);
  if (amount <= 0) throw new AppError('Invalid booking amount', 400);

  const stripe = getStripe();
  let payment = await Payment.findOne({ booking: booking._id, status: { $in: ['pending', 'succeeded'] } });

  if (payment && payment.status === 'succeeded') {
    throw new AppError('Booking is already paid', 409);
  }

  if (stripe) {
    let intent;
    if (payment?.stripePaymentIntentId) {
      intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
    } else {
      intent = await stripe.paymentIntents.create({
        amount,
        currency: (booking.currency || 'usd').toLowerCase(),
        metadata: {
          bookingId: String(booking._id),
          bookingReference: booking.bookingReference,
          userId: String(user._id),
        },
        automatic_payment_methods: { enabled: true },
      });
    }

    if (!payment) {
      payment = await Payment.create({
        booking: booking._id,
        user: user._id,
        stripePaymentIntentId: intent.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        status: 'pending',
        paymentMethod: 'card',
      });
    }

    return {
      provider: 'stripe',
      clientSecret: intent.client_secret,
      publishableKey: env.stripePublishableKey,
      paymentId: payment._id,
      amount: booking.totalAmount,
      currency: booking.currency,
    };
  }

  if (!payment) {
    payment = await Payment.create({
      booking: booking._id,
      user: user._id,
      stripePaymentIntentId: `dev_${booking.bookingReference}`,
      amount: booking.totalAmount,
      currency: booking.currency,
      status: 'pending',
      paymentMethod: 'test_card',
    });
  }

  return {
    provider: 'development',
    clientSecret: null,
    publishableKey: '',
    paymentId: payment._id,
    amount: booking.totalAmount,
    currency: booking.currency,
    developmentFallback: true,
  };
}

async function confirmSuccessfulPayment(bookingId, { paymentIntentId, paymentMethod = 'card' } = {}) {
  const booking = await Booking.findById(bookingId).populate('user flight');
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status === 'cancelled') throw new AppError('Cancelled bookings cannot be paid', 400);

  const stripe = getStripe();
  if (stripe && paymentIntentId) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      throw new AppError('Payment has not succeeded', 400);
    }
    const expected = Math.round(Number(booking.totalAmount) * 100);
    if (intent.amount !== expected) {
      throw new AppError('Payment amount does not match booking', 400);
    }
  }

  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  booking.expiresAt = undefined;
  await booking.save();

  const payment = await Payment.findOneAndUpdate(
    { booking: booking._id },
    {
      status: 'succeeded',
      paidAt: new Date(),
      paymentMethod,
      stripePaymentIntentId: paymentIntentId || `dev_${booking.bookingReference}`,
      amount: booking.totalAmount,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!payment.user) {
    payment.user = booking.user._id || booking.user;
    await payment.save();
  }

  const user = booking.user;
  await emailService.sendPaymentConfirmationEmail(user, booking, payment);
  const populatedFlight = await Flight.findById(booking.flight).populate('airline departureAirport arrivalAirport');
  await emailService.sendBookingConfirmationEmail(user, booking, populatedFlight || booking.flight);

  return { booking, payment };
}

async function refundPayment(booking, amount) {
  const payment = await Payment.findOne({ booking: booking._id, status: 'succeeded' });
  const refundAmount = amount ?? booking.totalAmount;
  const stripe = getStripe();

  if (stripe && payment?.stripePaymentIntentId && !String(payment.stripePaymentIntentId).startsWith('dev_')) {
    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100),
    });
  }

  if (payment) {
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundAmount = refundAmount;
    await payment.save();
  }

  booking.paymentStatus = 'refunded';
  await booking.save();
  return payment;
}

module.exports = {
  createPaymentIntent,
  confirmSuccessfulPayment,
  refundPayment,
  isStripeEnabled,
};
