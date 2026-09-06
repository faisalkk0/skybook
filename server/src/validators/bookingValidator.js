const { body } = require('express-validator');

const bookingRules = [
  body('flightId').notEmpty().withMessage('Flight is required'),
  body('cabinClass')
    .optional()
    .isIn(['economy', 'premiumEconomy', 'business', 'first'])
    .withMessage('Invalid cabin class'),
  body('passengers').isArray({ min: 1 }).withMessage('At least one passenger is required'),
  body('passengers.*.firstName').trim().notEmpty().withMessage('Passenger first name is required'),
  body('passengers.*.lastName').trim().notEmpty().withMessage('Passenger last name is required'),
  body('passengers.*.dateOfBirth').notEmpty().withMessage('Passenger date of birth is required'),
  body('passengers.*.gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('passengers.*.nationality').notEmpty().withMessage('Nationality is required'),
  body('passengers.*.passportNumber').notEmpty().withMessage('Passport number is required'),
  body('passengers.*.passportExpiry').notEmpty().withMessage('Passport expiry is required'),
  body('passengers.*.passengerType')
    .isIn(['adult', 'child', 'infant'])
    .withMessage('Invalid passenger type'),
  body('selectedSeats').isArray({ min: 1 }).withMessage('Seat selection is required'),
  body('selectedSeats.*.seatNumber').notEmpty().withMessage('Seat number is required'),
];

module.exports = { bookingRules };
