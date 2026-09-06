const Airline = require('../models/Airline');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { uploadImage } = require('../services/uploadService');

exports.listPublic = asyncHandler(async (req, res) => {
  const airlines = await Airline.find({ active: true }).sort({ name: 1 });
  return success(res, { message: 'Airlines', data: airlines });
});

exports.listAirlines = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20, active } = req.query;
  const filter = {};
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { code: new RegExp(q, 'i') }];
  if (active !== undefined) filter.active = active === 'true';
  const [items, total] = await Promise.all([
    Airline.find(filter)
      .sort({ name: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Airline.countDocuments(filter),
  ]);
  return success(res, {
    message: 'Airlines',
    data: items,
    meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

exports.createAirline = asyncHandler(async (req, res) => {
  const airline = await Airline.create(req.body);
  return success(res, { status: 201, message: 'Airline created', data: airline });
});

exports.updateAirline = asyncHandler(async (req, res) => {
  const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!airline) throw new AppError('Airline not found', 404);
  return success(res, { message: 'Airline updated', data: airline });
});

exports.deleteAirline = asyncHandler(async (req, res) => {
  const airline = await Airline.findByIdAndDelete(req.params.id);
  if (!airline) throw new AppError('Airline not found', 404);
  return success(res, { message: 'Airline deleted', data: null });
});

exports.uploadLogo = asyncHandler(async (req, res) => {
  const airline = await Airline.findById(req.params.id);
  if (!airline) throw new AppError('Airline not found', 404);
  if (!req.file) throw new AppError('Logo file is required', 400);
  const uploaded = await uploadImage(req.file, 'skybook/airlines');
  airline.logo = uploaded.url;
  await airline.save();
  return success(res, { message: 'Logo updated', data: airline });
});
