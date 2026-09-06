const Flight = require('../models/Flight');
const Airport = require('../models/Airport');
const AppError = require('../utils/AppError');

async function resolveAirport(codeOrId) {
  if (!codeOrId) return null;
  if (codeOrId.match(/^[a-fA-F0-9]{24}$/)) {
    return Airport.findById(codeOrId);
  }
  return Airport.findOne({ code: String(codeOrId).toUpperCase(), active: true });
}

function cabinPriceField(cabinClass) {
  if (cabinClass === 'business') return 'businessPrice';
  if (cabinClass === 'first') return 'firstClassPrice';
  return 'economyPrice';
}

async function searchFlights(query) {
  const {
    from,
    to,
    departureDate,
    returnDate,
    passengers = 1,
    cabinClass = 'economy',
    sort = 'cheapest',
    minPrice,
    maxPrice,
    airline,
    departureTime,
    arrivalTime,
    stops,
    page = 1,
    limit = 10,
  } = query;

  const origin = await resolveAirport(from);
  const destination = await resolveAirport(to);
  if (!origin || !destination) {
    throw new AppError('Origin and destination airports are required', 400);
  }
  if (String(origin._id) === String(destination._id)) {
    throw new AppError('Origin and destination cannot be the same', 400);
  }

  const pax = Math.max(Number(passengers) || 1, 1);
  const start = new Date(departureDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(departureDate);
  end.setHours(23, 59, 59, 999);

  const filter = {
    departureAirport: origin._id,
    arrivalAirport: destination._id,
    departureDate: { $gte: start, $lte: end },
    status: { $in: ['scheduled', 'delayed', 'boarding'] },
    availableSeats: { $gte: pax },
  };

  if (airline) filter.airline = airline;
  if (stops !== undefined && stops !== '') filter.stops = Number(stops);

  const priceField = cabinPriceField(cabinClass);
  if (minPrice || maxPrice) {
    filter[priceField] = {};
    if (minPrice) filter[priceField].$gte = Number(minPrice);
    if (maxPrice) filter[priceField].$lte = Number(maxPrice);
  }

  const timeBucket = (value, field) => {
    if (!value) return;
    const ranges = {
      morning: ['00:00', '11:59'],
      afternoon: ['12:00', '17:59'],
      evening: ['18:00', '23:59'],
    };
    const range = ranges[value];
    if (range) filter[field] = { $gte: range[0], $lte: range[1] };
  };
  timeBucket(departureTime, 'departureTime');
  timeBucket(arrivalTime, 'arrivalTime');

  const sortMap = {
    cheapest: { [priceField]: 1 },
    fastest: { duration: 1 },
    earliest: { departureTime: 1 },
    latest: { departureTime: -1 },
  };

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Flight.find(filter)
      .populate('airline aircraft departureAirport arrivalAirport')
      .sort(sortMap[sort] || sortMap.cheapest)
      .skip(skip)
      .limit(limitNum),
    Flight.countDocuments(filter),
  ]);

  let returnFlights = [];
  if (returnDate) {
    const rStart = new Date(returnDate);
    rStart.setHours(0, 0, 0, 0);
    const rEnd = new Date(returnDate);
    rEnd.setHours(23, 59, 59, 999);
    returnFlights = await Flight.find({
      departureAirport: destination._id,
      arrivalAirport: origin._id,
      departureDate: { $gte: rStart, $lte: rEnd },
      status: { $in: ['scheduled', 'delayed', 'boarding'] },
      availableSeats: { $gte: pax },
    })
      .populate('airline aircraft departureAirport arrivalAirport')
      .sort(sortMap[sort] || sortMap.cheapest)
      .limit(20);
  }

  return {
    flights: items,
    returnFlights,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      from: origin,
      to: destination,
      cabinClass,
      passengers: pax,
    },
  };
}

module.exports = { searchFlights, resolveAirport };
