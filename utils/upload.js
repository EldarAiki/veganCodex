const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vegancodex',
    format: async (req, file) => 'webp', // Convert to WebP for smaller size
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
    quality: 'auto:good',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

// Configure multer with limits
const upload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_IMAGE_SIZE_MB * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Error deleting image:', publicId, err);
  }
};

module.exports = upload, { deleteFromCloudinary };