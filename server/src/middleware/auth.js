const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/tokens');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new AppError('Account is not available', 401);
  }

  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  else if (req.cookies && req.cookies.accessToken) token = req.cookies.accessToken;

  if (!token) return next();
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch (_err) {
    // Guest continues without auth
  }
  next();
});

module.exports = { protect, adminOnly, optionalAuth };
