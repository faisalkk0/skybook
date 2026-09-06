const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    logo: { type: String, default: '' },
    country: { type: String, required: true },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

airlineSchema.index({ name: 1 });

module.exports = mongoose.model('Airline', airlineSchema);
