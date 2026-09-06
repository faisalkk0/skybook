const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { uploadImage } = require('../services/uploadService');

exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    'firstName',
    'lastName',
    'phone',
    'dateOfBirth',
    'gender',
    'address',
    'country',
    'nationality',
    'passportNumber',
  ];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  return success(res, { message: 'Profile updated', data: req.user.toSafeObject() });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const ok = await user.comparePassword(req.body.currentPassword);
  if (!ok) throw new AppError('Current password is incorrect', 400);
  user.password = req.body.newPassword;
  await user.save();
  return success(res, { message: 'Password updated', data: null });
});

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Avatar file is required', 400);
  const uploaded = await uploadImage(req.file, 'skybook/avatars');
  req.user.avatar = uploaded.url;
  await req.user.save();
  return success(res, { message: 'Avatar updated', data: req.user.toSafeObject() });
});
