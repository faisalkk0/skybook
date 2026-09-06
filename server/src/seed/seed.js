const env = require('../config/env');
const { connectDatabase, disconnectDatabase } = require('../config/db');
const User = require('../models/User');
const Airline = require('../models/Airline');
const Airport = require('../models/Airport');
const Aircraft = require('../models/Aircraft');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { generateSeats } = require('../controllers/aircraftController');

function addDays(base, days) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

function durationMinutes(depH, depM, arrH, arrM, extra = 0) {
  return ((arrH * 60 + arrM) - (depH * 60 + depM) + extra + 24 * 60) % (24 * 60);
}

async function runSeed({ clear = true } = {}) {
  if (clear) {
  await Promise.all([
    User.deleteMany({}),
    Airline.deleteMany({}),
    Airport.deleteMany({}),
    Aircraft.deleteMany({}),
    Flight.deleteMany({}),
    Seat.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
  ]);
  }

  const [admin, demoUser] = await User.create([
    {
      firstName: 'Amina',
      lastName: 'Khan',
      email: 'admin@skybook.dev',
      password: env.seedAdminPassword,
      phone: '+971500000001',
      role: 'admin',
      country: 'United Arab Emirates',
      nationality: 'Pakistani',
      gender: 'female',
    },
    {
      firstName: 'Hassan',
      lastName: 'Malik',
      email: 'user@skybook.dev',
      password: env.seedUserPassword,
      phone: '+923001112233',
      role: 'user',
      dateOfBirth: new Date('1994-04-18'),
      gender: 'male',
      country: 'Pakistan',
      nationality: 'Pakistani',
      passportNumber: 'AB1234567',
      address: { line1: '12 Margalla Road', city: 'Islamabad', state: 'ICT', postalCode: '44000' },
    },
  ]);

  const airlines = await Airline.create([
    {
      name: 'Emirates',
      code: 'EK',
      country: 'United Arab Emirates',
      website: 'https://www.emirates.com',
      description: 'Award-winning global airline connecting Dubai with the world.',
      logo: 'https://logo.clearbit.com/emirates.com',
    },
    {
      name: 'Qatar Airways',
      code: 'QR',
      country: 'Qatar',
      website: 'https://www.qatarairways.com',
      description: 'Five-star airline operating from Hamad International Airport.',
      logo: 'https://logo.clearbit.com/qatarairways.com',
    },
    {
      name: 'Turkish Airlines',
      code: 'TK',
      country: 'Turkey',
      website: 'https://www.turkishairlines.com',
      description: 'Europe’s largest carrier flying to more countries than any other airline.',
      logo: 'https://logo.clearbit.com/turkishairlines.com',
    },
    {
      name: 'Etihad Airways',
      code: 'EY',
      country: 'United Arab Emirates',
      website: 'https://www.etihad.com',
      description: 'The national airline of the UAE, based in Abu Dhabi.',
      logo: 'https://logo.clearbit.com/etihad.com',
    },
    {
      name: 'Pakistan International Airlines',
      code: 'PK',
      country: 'Pakistan',
      website: 'https://www.piac.com.pk',
      description: 'The flag carrier of Pakistan serving domestic and international routes.',
      logo: 'https://logo.clearbit.com/piac.com.pk',
    },
  ]);

  const airports = await Airport.create([
    {
      name: 'Islamabad International Airport',
      code: 'ISB',
      city: 'Islamabad',
      country: 'Pakistan',
      timezone: 'Asia/Karachi',
      latitude: 33.5607,
      longitude: 72.8518,
      terminalCount: 1,
    },
    {
      name: 'Dubai International Airport',
      code: 'DXB',
      city: 'Dubai',
      country: 'United Arab Emirates',
      timezone: 'Asia/Dubai',
      latitude: 25.2532,
      longitude: 55.3657,
      terminalCount: 3,
    },
    {
      name: 'Hamad International Airport',
      code: 'DOH',
      city: 'Doha',
      country: 'Qatar',
      timezone: 'Asia/Qatar',
      latitude: 25.2731,
      longitude: 51.6081,
      terminalCount: 1,
    },
    {
      name: 'Istanbul Airport',
      code: 'IST',
      city: 'Istanbul',
      country: 'Turkey',
      timezone: 'Europe/Istanbul',
      latitude: 41.2753,
      longitude: 28.7519,
      terminalCount: 1,
    },
    {
      name: 'Jinnah International Airport',
      code: 'KHI',
      city: 'Karachi',
      country: 'Pakistan',
      timezone: 'Asia/Karachi',
      latitude: 24.9065,
      longitude: 67.1608,
      terminalCount: 2,
    },
    {
      name: 'Heathrow Airport',
      code: 'LHR',
      city: 'London',
      country: 'United Kingdom',
      timezone: 'Europe/London',
      latitude: 51.47,
      longitude: -0.4543,
      terminalCount: 4,
    },
  ]);

  const byCode = (code) => airports.find((a) => a.code === code);
  const byAirline = (code) => airlines.find((a) => a.code === code);

  const aircraftDocs = await Aircraft.create([
    {
      airline: byAirline('EK')._id,
      model: 'Boeing 777-300ER',
      registrationNumber: 'A6-ENV',
      totalSeats: 84,
      seatConfiguration: {
        first: { rows: 2, columns: ['A', 'F'], startRow: 1 },
        business: { rows: 4, columns: ['A', 'C', 'D', 'F'], startRow: 3 },
        premiumEconomy: { rows: 3, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 7 },
        economy: { rows: 10, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 10 },
      },
    },
    {
      airline: byAirline('QR')._id,
      model: 'Airbus A350-900',
      registrationNumber: 'A7-ALA',
      totalSeats: 84,
      seatConfiguration: {
        first: { rows: 2, columns: ['A', 'F'], startRow: 1 },
        business: { rows: 4, columns: ['A', 'C', 'D', 'F'], startRow: 3 },
        premiumEconomy: { rows: 3, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 7 },
        economy: { rows: 10, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 10 },
      },
    },
    {
      airline: byAirline('TK')._id,
      model: 'Boeing 787-9',
      registrationNumber: 'TC-LLO',
      totalSeats: 84,
      seatConfiguration: {
        first: { rows: 2, columns: ['A', 'F'], startRow: 1 },
        business: { rows: 4, columns: ['A', 'C', 'D', 'F'], startRow: 3 },
        premiumEconomy: { rows: 3, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 7 },
        economy: { rows: 10, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 10 },
      },
    },
    {
      airline: byAirline('EY')._id,
      model: 'Airbus A380-800',
      registrationNumber: 'A6-APA',
      totalSeats: 84,
      seatConfiguration: {
        first: { rows: 2, columns: ['A', 'F'], startRow: 1 },
        business: { rows: 4, columns: ['A', 'C', 'D', 'F'], startRow: 3 },
        premiumEconomy: { rows: 3, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 7 },
        economy: { rows: 10, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 10 },
      },
    },
    {
      airline: byAirline('PK')._id,
      model: 'Airbus A320-200',
      registrationNumber: 'AP-BLD',
      totalSeats: 84,
      seatConfiguration: {
        first: { rows: 2, columns: ['A', 'F'], startRow: 1 },
        business: { rows: 4, columns: ['A', 'C', 'D', 'F'], startRow: 3 },
        premiumEconomy: { rows: 3, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 7 },
        economy: { rows: 10, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 10 },
      },
    },
  ]);

  for (const aircraft of aircraftDocs) {
    await generateSeats(aircraft);
  }

  const aircraftFor = (code) => aircraftDocs.find((a) => String(a.airline) === String(byAirline(code)._id));

  const routes = [
    { from: 'ISB', to: 'DXB', airline: 'EK', no: 'EK611', dep: '09:15', arr: '11:40', eco: 310, bus: 780, first: 1450, gate: 'B12', terminal: 'T3' },
    { from: 'DXB', to: 'ISB', airline: 'EK', no: 'EK610', dep: '14:20', arr: '18:50', eco: 295, bus: 760, first: 1390, gate: 'C4', terminal: 'T3' },
    { from: 'ISB', to: 'DXB', airline: 'PK', no: 'PK211', dep: '06:40', arr: '09:10', eco: 240, bus: 610, first: 980, gate: 'A3', terminal: 'T1' },
    { from: 'DXB', to: 'ISB', airline: 'PK', no: 'PK212', dep: '19:30', arr: '23:50', eco: 235, bus: 590, first: 960, gate: 'A7', terminal: 'T1' },
    { from: 'ISB', to: 'DOH', airline: 'QR', no: 'QR621', dep: '08:05', arr: '10:00', eco: 280, bus: 720, first: 1280, gate: 'D2', terminal: 'T1' },
    { from: 'DOH', to: 'ISB', airline: 'QR', no: 'QR620', dep: '16:15', arr: '21:35', eco: 275, bus: 710, first: 1260, gate: 'C11', terminal: 'T1' },
    { from: 'ISB', to: 'IST', airline: 'TK', no: 'TK0712', dep: '05:50', arr: '10:20', eco: 420, bus: 980, first: 1680, gate: 'E1', terminal: 'T1' },
    { from: 'IST', to: 'ISB', airline: 'TK', no: 'TK0713', dep: '18:40', arr: '01:10', eco: 410, bus: 960, first: 1640, gate: 'D8', terminal: 'T1' },
    { from: 'KHI', to: 'DXB', airline: 'EK', no: 'EK603', dep: '11:00', arr: '12:35', eco: 260, bus: 690, first: 1180, gate: 'B6', terminal: 'T3' },
    { from: 'DXB', to: 'KHI', airline: 'EK', no: 'EK602', dep: '21:10', arr: '00:45', eco: 255, bus: 680, first: 1160, gate: 'B9', terminal: 'T3' },
    { from: 'DXB', to: 'LHR', airline: 'EK', no: 'EK005', dep: '07:45', arr: '12:20', eco: 540, bus: 1420, first: 2650, gate: 'A1', terminal: 'T3' },
    { from: 'LHR', to: 'DXB', airline: 'EK', no: 'EK006', dep: '21:50', arr: '07:20', eco: 530, bus: 1390, first: 2580, gate: 'A5', terminal: 'T3' },
    { from: 'DOH', to: 'LHR', airline: 'QR', no: 'QR011', dep: '01:40', arr: '06:55', eco: 510, bus: 1360, first: 2490, gate: 'C3', terminal: 'T1' },
    { from: 'LHR', to: 'DOH', airline: 'QR', no: 'QR010', dep: '09:15', arr: '17:40', eco: 500, bus: 1340, first: 2450, gate: 'B2', terminal: 'T1' },
    { from: 'IST', to: 'LHR', airline: 'TK', no: 'TK1980', dep: '13:25', arr: '15:10', eco: 220, bus: 540, first: 890, gate: 'D14', terminal: 'T1' },
    { from: 'LHR', to: 'IST', airline: 'TK', no: 'TK1981', dep: '16:40', arr: '22:35', eco: 215, bus: 530, first: 870, gate: 'D16', terminal: 'T1' },
    { from: 'KHI', to: 'ISB', airline: 'PK', no: 'PK302', dep: '07:00', arr: '09:05', eco: 95, bus: 210, first: 340, gate: 'A1', terminal: 'T1' },
    { from: 'ISB', to: 'KHI', airline: 'PK', no: 'PK303', dep: '18:15', arr: '20:20', eco: 95, bus: 210, first: 340, gate: 'A2', terminal: 'T1' },
    { from: 'DXB', to: 'IST', airline: 'EY', no: 'EY123', dep: '10:30', arr: '14:10', eco: 330, bus: 820, first: 1510, gate: 'F4', terminal: 'T1' },
    { from: 'IST', to: 'DXB', airline: 'EY', no: 'EY124', dep: '15:45', arr: '21:05', eco: 325, bus: 810, first: 1490, gate: 'F6', terminal: 'T1' },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const flights = [];

  for (let day = 1; day <= 45; day += 1) {
    if (day % 6 === 0) continue;
    const date = addDays(today, day);
    routes.forEach((route, index) => {
      if ((day + index) % 3 === 0) return;
      const [dh, dm] = route.dep.split(':').map(Number);
      const [ah, am] = route.arr.split(':').map(Number);
      const overnight = ah < dh || (ah === dh && am < dm);
      flights.push({
        flightNumber: `${route.no}-${date.getMonth() + 1}${date.getDate()}`,
        airline: byAirline(route.airline)._id,
        aircraft: aircraftFor(route.airline)._id,
        departureAirport: byCode(route.from)._id,
        arrivalAirport: byCode(route.to)._id,
        departureDate: date,
        departureTime: route.dep,
        arrivalDate: overnight ? addDays(date, 1) : date,
        arrivalTime: route.arr,
        duration: durationMinutes(dh, dm, ah, am, overnight ? 24 * 60 : 0),
        economyPrice: route.eco + (day % 5) * 8,
        businessPrice: route.bus + (day % 4) * 15,
        firstClassPrice: route.first,
        availableSeats: 72,
        status: 'scheduled',
        baggageAllowance: route.airline === 'PK' ? '30kg' : '25kg',
        refundable: route.airline !== 'PK',
        mealIncluded: true,
        gate: route.gate,
        terminal: route.terminal,
        stops: 0,
      });
    });
  }

  await Flight.insertMany(flights);

  console.log('SkyBook database seeded.');
  console.log(`Admin: admin@skybook.dev / ${env.seedAdminPassword}`);
  console.log(`User:  user@skybook.dev / ${env.seedUserPassword}`);
  console.log(`Flights created: ${flights.length}`);
}

async function seed() {
  await connectDatabase();
  await runSeed({ clear: true });
  await disconnectDatabase();
}

if (require.main === module) {
  seed().catch(async (error) => {
    console.error(error);
    await disconnectDatabase();
    process.exit(1);
  });
}

module.exports = { runSeed, seed };
