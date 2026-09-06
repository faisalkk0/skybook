const Aircraft = require('../models/Aircraft');
const Seat = require('../models/Seat');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

function seatPosition(column, columns) {
  const index = columns.indexOf(column);
  if (index === 0 || index === columns.length - 1) return 'window';
  const aisleBreak = Math.floor(columns.length / 2);
  if (index === aisleBreak - 1 || index === aisleBreak) return 'aisle';
  return 'middle';
}

async function generateSeats(aircraft) {
  await Seat.deleteMany({ aircraft: aircraft._id });
  const docs = [];
  const config = aircraft.seatConfiguration || {};
  Object.entries(config).forEach(([cabin, layout]) => {
    if (!layout || !layout.rows || !layout.columns?.length) return;
    const startRow = layout.startRow || 1;
    for (let r = 0; r < layout.rows; r += 1) {
      const row = startRow + r;
      layout.columns.forEach((column) => {
        const extra =
          cabin === 'first' ? 120 : cabin === 'business' ? 70 : cabin === 'premiumEconomy' ? 25 : 0;
        docs.push({
          aircraft: aircraft._id,
          seatNumber: `${row}${column}`,
          class: cabin,
          row,
          column,
          position: seatPosition(column, layout.columns),
          extraPrice: extra,
          isActive: true,
        });
      });
    }
  });
  if (docs.length) await Seat.insertMany(docs);
  aircraft.totalSeats = docs.length || aircraft.totalSeats;
  await aircraft.save();
  return docs.length;
}

exports.listAircraft = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [{ model: new RegExp(q, 'i') }, { registrationNumber: new RegExp(q, 'i') }];
  }
  const [items, total] = await Promise.all([
    Aircraft.find(filter)
      .populate('airline')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Aircraft.countDocuments(filter),
  ]);
  return success(res, {
    message: 'Aircraft',
    data: items,
    meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

exports.getAircraft = asyncHandler(async (req, res) => {
  const aircraft = await Aircraft.findById(req.params.id).populate('airline');
  if (!aircraft) throw new AppError('Aircraft not found', 404);
  const seats = await Seat.find({ aircraft: aircraft._id }).sort({ row: 1, column: 1 });
  return success(res, { message: 'Aircraft details', data: { aircraft, seats } });
});

exports.createAircraft = asyncHandler(async (req, res) => {
  const aircraft = await Aircraft.create(req.body);
  await generateSeats(aircraft);
  return success(res, {
    status: 201,
    message: 'Aircraft created',
    data: await aircraft.populate('airline'),
  });
});

exports.updateAircraft = asyncHandler(async (req, res) => {
  const aircraft = await Aircraft.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!aircraft) throw new AppError('Aircraft not found', 404);
  if (req.body.seatConfiguration) await generateSeats(aircraft);
  return success(res, { message: 'Aircraft updated', data: aircraft });
});

exports.deleteAircraft = asyncHandler(async (req, res) => {
  const aircraft = await Aircraft.findByIdAndDelete(req.params.id);
  if (!aircraft) throw new AppError('Aircraft not found', 404);
  await Seat.deleteMany({ aircraft: aircraft._id });
  return success(res, { message: 'Aircraft deleted', data: null });
});

exports.configureSeats = asyncHandler(async (req, res) => {
  const aircraft = await Aircraft.findById(req.params.id);
  if (!aircraft) throw new AppError('Aircraft not found', 404);
  aircraft.seatConfiguration = req.body.seatConfiguration || aircraft.seatConfiguration;
  await generateSeats(aircraft);
  return success(res, { message: 'Seats configured', data: aircraft });
});

exports.generateSeats = generateSeats;
