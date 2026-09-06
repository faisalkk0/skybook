const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { searchFlights } = require('../services/flightService');
const { getOccupiedSeats } = require('../services/bookingService');
const { calculateFare } = require('../utils/fare');

exports.search = asyncHandler(async (req, res) => {
  const result = await searchFlights(req.query);
  return success(res, {
    message: 'Flights found',
    data: { flights: result.flights, returnFlights: result.returnFlights },
    meta: result.meta,
  });
});

exports.getFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.findById(req.params.id).populate(
    'airline aircraft departureAirport arrivalAirport'
  );
  if (!flight) throw new AppError('Flight not found', 404);
  return success(res, { message: 'Flight details', data: flight });
});

exports.getSeats = asyncHandler(async (req, res) => {
  const flight = await Flight.findById(req.params.id).populate('aircraft');
  if (!flight) throw new AppError('Flight not found', 404);
  const seats = await Seat.find({ aircraft: flight.aircraft._id, isActive: true }).sort({
    row: 1,
    column: 1,
  });
  const occupied = await getOccupiedSeats(flight._id);
  const payload = seats.map((seat) => ({
    ...seat.toObject(),
    occupied: occupied.has(seat.seatNumber),
  }));
  return success(res, {
    message: 'Seat map',
    data: { seats: payload, aircraft: flight.aircraft },
  });
});

exports.quoteFare = asyncHandler(async (req, res) => {
  const flight = await Flight.findById(req.params.id);
  if (!flight) throw new AppError('Flight not found', 404);
  const fare = calculateFare({
    flight,
    passengers: req.body.passengers || [],
    selectedSeats: req.body.selectedSeats || [],
    cabinClass: req.body.cabinClass || 'economy',
  });
  return success(res, { message: 'Fare quote', data: fare });
});
