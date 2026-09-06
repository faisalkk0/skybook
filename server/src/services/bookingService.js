const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const AppError = require('../utils/AppError');
const { generateBookingReference } = require('../utils/bookingReference');
const { calculateFare } = require('../utils/fare');
const paymentService = require('./paymentService');
const emailService = require('./emailService');

const ACTIVE_STATUSES = ['pending', 'confirmed'];

async function getOccupiedSeats(flightId, excludeBookingId) {
  const filter = {
    flight: flightId,
    status: { $in: ACTIVE_STATUSES },
  };
  if (excludeBookingId) filter._id = { $ne: excludeBookingId };
  const bookings = await Booking.find(filter).select('selectedSeats');
  return new Set(bookings.flatMap((b) => b.selectedSeats.map((s) => s.seatNumber)));
}

async function uniqueReference() {
  for (let i = 0; i < 8; i += 1) {
    const ref = generateBookingReference();
    const existing = await Booking.findOne({ bookingReference: ref });
    if (!existing) return ref;
  }
  throw new AppError('Could not generate booking reference', 500);
}

function canCancel(booking, flight) {
  if (booking.status === 'cancelled' || booking.status === 'completed') return false;
  if (!flight || ['departed', 'completed', 'cancelled'].includes(flight.status)) return false;
  const departure = new Date(flight.departureDate);
  const [hh, mm] = String(flight.departureTime || '00:00').split(':');
  departure.setHours(Number(hh) || 0, Number(mm) || 0, 0, 0);
  return departure.getTime() - Date.now() > 6 * 60 * 60 * 1000;
}

async function createBooking({ user, flightId, passengers, selectedSeats, cabinClass, returnFlightId }) {
  const flight = await Flight.findById(flightId).populate(
    'airline aircraft departureAirport arrivalAirport'
  );
  if (!flight) throw new AppError('Flight not found', 404);
  if (!['scheduled', 'delayed', 'boarding'].includes(flight.status)) {
    throw new AppError('This flight cannot be booked', 400);
  }

  const seatNumbers = selectedSeats.map((s) => s.seatNumber);
  if (new Set(seatNumbers).size !== seatNumbers.length) {
    throw new AppError('Duplicate seats in selection', 400);
  }
  if (passengers.length !== selectedSeats.length) {
    throw new AppError('Each passenger must have one seat', 400);
  }

  const occupied = await getOccupiedSeats(flight._id);
  const conflict = seatNumbers.find((seat) => occupied.has(seat));
  if (conflict) throw new AppError(`Seat ${conflict} is no longer available`, 409);

  const catalogSeats = await Seat.find({
    aircraft: flight.aircraft._id || flight.aircraft,
    seatNumber: { $in: seatNumbers },
    isActive: true,
  });
  const seatMap = new Map(catalogSeats.map((s) => [s.seatNumber, s]));
  const normalizedSeats = selectedSeats.map((seat) => {
    const catalog = seatMap.get(seat.seatNumber);
    if (!catalog) throw new AppError(`Seat ${seat.seatNumber} is invalid for this aircraft`, 400);
    return {
      seatNumber: catalog.seatNumber,
      class: catalog.class,
      extraPrice: catalog.extraPrice || 0,
    };
  });

  const normalizedPassengers = passengers.map((passenger, index) => ({
    ...passenger,
    seatNumber: normalizedSeats[index].seatNumber,
  }));

  const reserved = await Flight.findOneAndUpdate(
    {
      _id: flight._id,
      availableSeats: { $gte: normalizedSeats.length },
      status: { $in: ['scheduled', 'delayed', 'boarding'] },
    },
    { $inc: { availableSeats: -normalizedSeats.length } },
    { new: true }
  );
  if (!reserved) throw new AppError('Not enough seats remaining on this flight', 409);

  const fareBreakdown = calculateFare({
    flight,
    passengers: normalizedPassengers,
    selectedSeats: normalizedSeats,
    cabinClass,
  });

  let booking;
  try {
    booking = await Booking.create({
      bookingReference: await uniqueReference(),
      user: user._id,
      flight: flight._id,
      returnFlight: returnFlightId || undefined,
      passengers: normalizedPassengers,
      selectedSeats: normalizedSeats,
      fareBreakdown,
      totalAmount: fareBreakdown.totalAmount,
      currency: fareBreakdown.currency,
      status: 'pending',
      paymentStatus: 'unpaid',
      bookedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const occupiedAfter = await getOccupiedSeats(flight._id, booking._id);
    const lateConflict = seatNumbers.find((seat) => occupiedAfter.has(seat));
    if (lateConflict) {
      await Booking.findByIdAndDelete(booking._id);
      await Flight.findByIdAndUpdate(flight._id, { $inc: { availableSeats: normalizedSeats.length } });
      throw new AppError(`Seat ${lateConflict} is no longer available`, 409);
    }
  } catch (error) {
    if (!booking) {
      await Flight.findByIdAndUpdate(flight._id, { $inc: { availableSeats: normalizedSeats.length } });
    }
    throw error;
  }

  return Booking.findById(booking._id)
    .populate({
      path: 'flight',
      populate: { path: 'airline aircraft departureAirport arrivalAirport' },
    })
    .populate('user', '-password');
}

async function cancelBooking(booking, reason, actor) {
  const flight = await Flight.findById(booking.flight);
  if (!canCancel(booking, flight) && actor?.role !== 'admin') {
    throw new AppError('This booking can no longer be cancelled', 400);
  }
  if (booking.status === 'cancelled') {
    throw new AppError('Booking is already cancelled', 400);
  }

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason || 'Cancelled by user';
  await booking.save();

  if (flight) {
    await Flight.findByIdAndUpdate(flight._id, { $inc: { availableSeats: booking.selectedSeats.length } });
  }

  if (booking.paymentStatus === 'paid') {
    await paymentService.refundPayment(booking);
    await emailService.sendRefundEmail(booking.user, booking, booking.totalAmount);
  }

  await emailService.sendCancellationEmail(booking.user.email ? booking.user : actor, booking);
  return booking;
}

async function expireStaleBookings() {
  const stale = await Booking.find({
    status: 'pending',
    paymentStatus: 'unpaid',
    expiresAt: { $lte: new Date() },
  });

  for (const booking of stale) {
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = 'Payment window expired';
    booking.paymentStatus = 'failed';
    await booking.save();
    await Flight.findByIdAndUpdate(booking.flight, {
      $inc: { availableSeats: booking.selectedSeats.length },
    });
  }

  return stale.length;
}

module.exports = {
  createBooking,
  cancelBooking,
  getOccupiedSeats,
  canCancel,
  expireStaleBookings,
};
