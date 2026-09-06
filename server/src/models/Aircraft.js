const mongoose = require('mongoose');

const cabinConfigSchema = new mongoose.Schema(
  {
    rows: { type: Number, required: true },
    columns: [{ type: String }],
    startRow: { type: Number, default: 1 },
  },
  { _id: false }
);

const aircraftSchema = new mongoose.Schema(
  {
    airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
    model: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true },
    totalSeats: { type: Number, required: true },
    seatConfiguration: {
      first: { type: cabinConfigSchema },
      business: { type: cabinConfigSchema },
      premiumEconomy: { type: cabinConfigSchema },
      economy: { type: cabinConfigSchema },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

aircraftSchema.index({ airline: 1 });

module.exports = mongoose.model('Aircraft', aircraftSchema);
