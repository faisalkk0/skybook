const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Airline = require('../models/Airline');
const Airport = require('../models/Airport');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const bookingService = require('../services/bookingService');
const paymentService = require('../services/paymentService');

exports.overview = asyncHandler(async (req, res) => {
  const [users, flights, bookings, payments, activeFlights, cancelledFlights] = await Promise.all([
    User.countDocuments(),
    Flight.countDocuments(),
    Booking.countDocuments(),
    Payment.find({ status: 'succeeded' }),
    Flight.countDocuments({ status: { $in: ['scheduled', 'boarding', 'delayed'] } }),
    Flight.countDocuments({ status: 'cancelled' }),
  ]);

  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const lastSixMonths = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return { key, label: date.toLocaleString('en', { month: 'short' }), revenue: 0, bookings: 0 };
  });

  const allBookings = await Booking.find().select('createdAt totalAmount paymentStatus status flight');
  allBookings.forEach((booking) => {
    const d = new Date(booking.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = lastSixMonths.find((m) => m.key === key);
    if (bucket) {
      bucket.bookings += 1;
      if (booking.paymentStatus === 'paid') bucket.revenue += booking.totalAmount;
    }
  });

  const destAgg = await Booking.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    { $lookup: { from: 'flights', localField: 'flight', foreignField: '_id', as: 'flight' } },
    { $unwind: '$flight' },
    { $lookup: { from: 'airports', localField: 'flight.arrivalAirport', foreignField: '_id', as: 'airport' } },
    { $unwind: '$airport' },
    { $group: { _id: '$airport.city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);

  const airlineAgg = await Booking.aggregate([
    { $lookup: { from: 'flights', localField: 'flight', foreignField: '_id', as: 'flight' } },
    { $unwind: '$flight' },
    { $lookup: { from: 'airlines', localField: 'flight.airline', foreignField: '_id', as: 'airline' } },
    { $unwind: '$airline' },
    { $group: { _id: '$airline.name', bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    { $sort: { bookings: -1 } },
    { $limit: 6 },
  ]);

  const statusDist = ['pending', 'confirmed', 'cancelled', 'completed'].map((status) => ({
    status,
    count: allBookings.filter((b) => b.status === status).length,
  }));

  return success(res, {
    message: 'Admin overview',
    data: {
      cards: { users, flights, bookings, revenue, activeFlights, cancelledFlights },
      revenueOverTime: lastSixMonths,
      bookingsOverTime: lastSixMonths,
      popularDestinations: destAgg.map((d) => ({ city: d._id, count: d.count })),
      airlinePerformance: airlineAgg,
      bookingStatus: statusDist,
    },
  });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const { q, role, page = 1, limit = 12 } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { firstName: new RegExp(q, 'i') },
      { lastName: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
    ];
  }
  if (role) filter.role = role;
  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  return success(res, {
    message: 'Users',
    data: items,
    meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (req.body.role) user.role = req.body.role;
  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  await user.save();
  return success(res, { message: 'User updated', data: user.toSafeObject() });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw new AppError('You cannot delete your own account', 400);
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  return success(res, { message: 'User deleted', data: null });
});

exports.listFlights = asyncHandler(async (req, res) => {
  const { q, status, page = 1, limit = 12 } = req.query;
  const filter = {};
  if (q) filter.flightNumber = new RegExp(q, 'i');
  if (status) filter.status = status;
  const [items, total] = await Promise.all([
    Flight.find(filter)
      .populate('airline aircraft departureAirport arrivalAirport')
      .sort({ departureDate: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Flight.countDocuments(filter),
  ]);
  return success(res, {
    message: 'Flights',
    data: items,
    meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

exports.createFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.create(req.body);
  return success(res, {
    status: 201,
    message: 'Flight created',
    data: await flight.populate('airline aircraft departureAirport arrivalAirport'),
  });
});

exports.updateFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('airline aircraft departureAirport arrivalAirport');
  if (!flight) throw new AppError('Flight not found', 404);
  return success(res, { message: 'Flight updated', data: flight });
});

exports.deleteFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true }
  );
  if (!flight) throw new AppError('Flight not found', 404);
  return success(res, { message: 'Flight cancelled', data: flight });
});

exports.listBookings = asyncHandler(async (req, res) => {
  const { q, status, page = 1, limit = 12 } = req.query;
  const filter = {};
  if (q) filter.bookingReference = new RegExp(q, 'i');
  if (status) filter.status = status;
  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate('user', '-password')
      .populate({ path: 'flight', populate: { path: 'airline departureAirport arrivalAirport' } })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);
  return success(res, {
    message: 'Bookings',
    data: items,
    meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

exports.updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('user');
  if (!booking) throw new AppError('Booking not found', 404);
  if (req.body.status === 'cancelled') {
    await bookingService.cancelBooking(booking, req.body.cancellationReason || 'Cancelled by admin', req.user);
  } else if (req.body.status) {
    booking.status = req.body.status;
    await booking.save();
  }
  return success(res, { message: 'Booking updated', data: booking });
});

exports.refundBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('user');
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.paymentStatus !== 'paid') throw new AppError('Booking is not paid', 400);
  const payment = await paymentService.refundPayment(booking, req.body.amount);
  return success(res, { message: 'Refund processed', data: { booking, payment } });
});

exports.listPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('user', 'firstName lastName email')
    .populate({ path: 'booking', select: 'bookingReference totalAmount status paymentStatus' })
    .sort({ createdAt: -1 })
    .limit(100);
  return success(res, { message: 'Payments', data: payments });
});

exports.lookups = asyncHandler(async (req, res) => {
  const [airlines, airports, aircraft] = await Promise.all([
    Airline.find({ active: true }).sort({ name: 1 }),
    Airport.find({ active: true }).sort({ city: 1 }),
    require('../models/Aircraft').find({ active: true }).populate('airline').sort({ model: 1 }),
  ]);
  return success(res, { message: 'Lookups', data: { airlines, airports, aircraft } });
});
