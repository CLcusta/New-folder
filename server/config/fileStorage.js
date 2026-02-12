const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Save image to local storage
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} filename - Original filename
 * @param {string} folder - Subfolder name (products, vendors, etc)
 * @returns {Object} File info with url and filename
 */
const uploadImage = async (fileBuffer, filename, folder = 'products') => {
  try {
    // Create folder if it doesn't exist
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(filename);
    const uniqueFilename = `${timestamp}_${Math.random().toString(36).substr(2, 9)}${fileExtension}`;
    
    // Save file
    const filePath = path.join(folderPath, uniqueFilename);
    fs.writeFileSync(filePath, fileBuffer);

    return {
      url: `/uploads/${folder}/${uniqueFilename}`,
      filename: uniqueFilename,
      path: filePath,
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Delete image from local storage
 * @param {string} filename - Filename to delete
 * @param {string} folder - Subfolder name
 * @returns {void}
 */
const deleteImage = async (filename, folder = 'products') => {
  try {
    const filePath = path.join(uploadsDir, folder, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  uploadsDir,
};
