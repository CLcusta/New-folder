const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  // Check extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter,
});

// Middleware to convert buffer to base64 for Cloudinary
const convertToBase64 = (req, res, next) => {
  if (req.file) {
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    req.file.base64 = base64;
  } else if (req.files) {
    // Handle multiple files
    if (Array.isArray(req.files)) {
      req.files.forEach(file => {
        file.base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      });
    } else {
      // Handle named fields
      Object.keys(req.files).forEach(key => {
        req.files[key].forEach(file => {
          file.base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        });
      });
    }
  }
  next();
};

module.exports = {
  uploadSingle: upload.single('image'),
  uploadMultiple: upload.array('images', 5), // Max 5 images
  uploadFields: upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ]),
  convertToBase64,
};
