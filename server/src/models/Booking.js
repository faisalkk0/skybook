const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    nationality: { type: String, required: true },
    passportNumber: { type: String, required: true },
    passportExpiry: { type: Date, required: true },
    seatNumber: { type: String, required: true },
    passengerType: { type: String, enum: ['adult', 'child', 'infant'], default: 'adult' },
  },
  { _id: false }
);

const selectedSeatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true },
    class: { type: String, required: true },
    extraPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const fareBreakdownSchema = new mongoose.Schema(
  {
    baseFare: { type: Number, required: true },
    taxes: { type: Number, required: true },
    airportCharges: { type: Number, required: true },
    baggage: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    seatPremium: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    cabinClass: { type: String, default: 'economy' },
    passengerCount: { type: Number, default: 1 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: { type: String, required: true, unique: true, uppercase: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    returnFlight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
    passengers: { type: [passengerSchema], required: true },
    selectedSeats: { type: [selectedSeatSchema], required: true },
    fareBreakdown: { type: fareBreakdownSchema, required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
    },
    cancellationReason: { type: String, default: '' },
    bookedAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ flight: 1, status: 1 });
bookingSchema.index({ 'selectedSeats.seatNumber': 1, flight: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
