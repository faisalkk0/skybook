const Airport = require('../models/Airport');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

exports.searchAirports = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const filter = { active: true };
  if (q) {
    filter.$or = [
      { code: new RegExp(q, 'i') },
      { city: new RegExp(q, 'i') },
      { name: new RegExp(q, 'i') },
      { country: new RegExp(q, 'i') },
    ];
  }
  const airports = await Airport.find(filter).sort({ city: 1 }).limit(20);
  return success(res, { message: 'Airports', data: airports });
});

exports.listAirports = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20, active } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { code: new RegExp(q, 'i') },
      { city: new RegExp(q, 'i') },
      { name: new RegExp(q, 'i') },
    ];
  }
  if (active !== undefined) filter.active = active === 'true';
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const [items, total] = await Promise.all([
    Airport.find(filter)
      .sort({ city: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Airport.countDocuments(filter),
  ]);
  return success(res, {
    message: 'Airports',
    data: items,
    meta: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

exports.createAirport = asyncHandler(async (req, res) => {
  const airport = await Airport.create(req.body);
  return success(res, { status: 201, message: 'Airport created', data: airport });
});

exports.updateAirport = asyncHandler(async (req, res) => {
  const airport = await Airport.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!airport) throw new AppError('Airport not found', 404);
  return success(res, { message: 'Airport updated', data: airport });
});

exports.deleteAirport = asyncHandler(async (req, res) => {
  const airport = await Airport.findByIdAndDelete(req.params.id);
  if (!airport) throw new AppError('Airport not found', 404);
  return success(res, { message: 'Airport deleted', data: null });
});
