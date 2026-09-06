const { cloudinary, isConfigured } = require('../config/cloudinary');
const AppError = require('../utils/AppError');

async function uploadImage(file, folder = 'skybook') {
  if (!file) throw new AppError('No file provided', 400);

  if (!isConfigured) {
    const base64 = file.buffer.toString('base64');
    return {
      url: `data:${file.mimetype};base64,${base64}`,
      publicId: '',
      provider: 'inline',
    };
  }

  const uploaded = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });

  return {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
    provider: 'cloudinary',
  };
}

module.exports = { uploadImage };
