const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const bookingService = require('../services/bookingService');
const { generateTicketPdf } = require('../services/ticketService');
const emailService = require('../services/emailService');

const populateBooking = {
  path: 'flight',
  populate: { path: 'airline aircraft departureAirport arrivalAirport' },
};

exports.create = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking({
    user: req.user,
    flightId: req.body.flightId,
    passengers: req.body.passengers,
    selectedSeats: req.body.selectedSeats,
    cabinClass: req.body.cabinClass || 'economy',
    returnFlightId: req.body.returnFlightId,
  });
  return success(res, { status: 201, message: 'Booking created', data: booking });
});

exports.listMine = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate(populateBooking)
    .sort({ createdAt: -1 });
  return success(res, { message: 'Bookings', data: bookings });
});

exports.getMine = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
    .populate(populateBooking)
    .populate('user', '-password');
  if (!booking) throw new AppError('Booking not found', 404);
  return success(res, {
    message: 'Booking details',
    data: {
      ...booking.toObject(),
      cancellable: bookingService.canCancel(booking, booking.flight),
    },
  });
});

exports.cancelMine = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id }).populate('user');
  if (!booking) throw new AppError('Booking not found', 404);
  const updated = await bookingService.cancelBooking(booking, req.body.reason, req.user);
  return success(res, { message: 'Booking cancelled', data: updated });
});

exports.downloadTicket = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') filter.user = req.user._id;
  const booking = await Booking.findOne(filter).populate(populateBooking).populate('user', '-password');
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.paymentStatus !== 'paid' && booking.status !== 'confirmed') {
    throw new AppError('Ticket is available after payment', 400);
  }
  const pdf = await generateTicketPdf(booking);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${booking.bookingReference}.pdf`);
  return res.send(pdf);
});

exports.emailTicket = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
    .populate(populateBooking)
    .populate('user');
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.paymentStatus !== 'paid') throw new AppError('Ticket is available after payment', 400);
  const pdf = await generateTicketPdf(booking);
  const result = await emailService.sendTicketEmail(booking.user, booking, pdf);
  return success(res, {
    message: result.delivered ? 'Ticket emailed' : 'Email is not configured; ticket was generated',
    data: result,
  });
});

exports.dashboardStats = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate(populateBooking);
  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.flight?.departureDate).getTime() >= now
  );
  const past = bookings.filter(
    (b) =>
      b.status === 'completed' ||
      (b.status === 'confirmed' && new Date(b.flight?.departureDate).getTime() < now)
  );
  const cancelled = bookings.filter((b) => b.status === 'cancelled');
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid' || b.paymentStatus === 'refunded')
    .reduce((sum, b) => sum + (b.paymentStatus === 'refunded' ? 0 : b.totalAmount), 0);

  return success(res, {
    message: 'Dashboard',
    data: {
      upcomingCount: upcoming.length,
      pastCount: past.length,
      cancelledCount: cancelled.length,
      totalSpent,
      upcoming: upcoming.slice(0, 3),
      recent: bookings.slice(0, 5),
    },
  });
});
