const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { signAccessToken, signRefreshToken, verifyRefreshToken, cookieOptions } = require('../utils/tokens');
const emailService = require('../services/emailService');

function issueAuth(res, user) {
  const payload = { id: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie('refreshToken', refreshToken, cookieOptions());
  res.cookie('accessToken', accessToken, cookieOptions());
  return { accessToken, refreshToken, user: user.toSafeObject() };
}

exports.register = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw new AppError('Email is already registered', 409);

  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone || '',
  });

  emailService.sendRegistrationEmail(user).catch(() => {});
  return success(res, {
    status: 201,
    message: 'Account created',
    data: issueAuth(res, user),
  });
});

exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);
  const ok = await user.comparePassword(req.body.password);
  if (!ok) throw new AppError('Invalid credentials', 401);
  return success(res, { message: 'Logged in', data: issueAuth(res, user) });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', { path: '/' });
  res.clearCookie('accessToken', { path: '/' });
  return success(res, { message: 'Logged out', data: null });
});

exports.me = asyncHandler(async (req, res) => {
  return success(res, { message: 'Authenticated user', data: req.user.toSafeObject() });
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) throw new AppError('Refresh token missing', 401);
  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new AppError('Account is not available', 401);
  return success(res, { message: 'Token refreshed', data: issueAuth(res, user) });
});
