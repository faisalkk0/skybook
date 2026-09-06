const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    flightNumber: { type: String, required: true, uppercase: true, trim: true },
    airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
    aircraft: { type: mongoose.Schema.Types.ObjectId, ref: 'Aircraft', required: true },
    departureAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    arrivalAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    departureDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    arrivalDate: { type: Date, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: Number, required: true },
    economyPrice: { type: Number, required: true, min: 0 },
    businessPrice: { type: Number, required: true, min: 0 },
    firstClassPrice: { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['scheduled', 'boarding', 'departed', 'delayed', 'cancelled', 'completed'],
      default: 'scheduled',
    },
    baggageAllowance: { type: String, default: '23kg' },
    refundable: { type: Boolean, default: true },
    mealIncluded: { type: Boolean, default: true },
    gate: { type: String, default: '' },
    terminal: { type: String, default: '' },
    stops: { type: Number, default: 0 },
  },
  { timestamps: true }
);

flightSchema.index({ flightNumber: 1 });
flightSchema.index({ departureAirport: 1, arrivalAirport: 1, departureDate: 1 });
flightSchema.index({ departureDate: 1, status: 1 });
flightSchema.index({ airline: 1 });

module.exports = mongoose.model('Flight', flightSchema);
