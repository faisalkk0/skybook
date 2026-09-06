const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    aircraft: { type: mongoose.Schema.Types.ObjectId, ref: 'Aircraft', required: true },
    seatNumber: { type: String, required: true },
    class: {
      type: String,
      enum: ['economy', 'premiumEconomy', 'business', 'first'],
      required: true,
    },
    row: { type: Number, required: true },
    column: { type: String, required: true },
    position: { type: String, enum: ['window', 'middle', 'aisle'], default: 'middle' },
    priceMultiplier: { type: Number, default: 1 },
    extraPrice: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

seatSchema.index({ aircraft: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
