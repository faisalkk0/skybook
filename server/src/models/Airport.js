const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    timezone: { type: String, default: 'UTC' },
    latitude: { type: Number },
    longitude: { type: Number },
    terminalCount: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

airportSchema.index({ city: 1 });
airportSchema.index({ name: 'text', city: 'text', code: 'text', country: 'text' });

module.exports = mongoose.model('Airport', airportSchema);
