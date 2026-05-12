const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Ensure documents directory exists
const docsDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Memory storage to process images with Sharp before saving
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|webp|pdf/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname || mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png, webp) and PDFs are allowed!'), false);
  }
};

const uploadOptimizer = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 }, // 500 KB per document
  fileFilter: fileFilter
});

/**
 * Middleware to process uploaded files (Sharp for images, direct save for PDFs)
 */
const processFiles = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    req.body.documents = []; // We will store final file paths here

    await Promise.all(
      req.files.map(async (file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = `doc-${uniqueSuffix}${extension}`;
        const filepath = path.join(docsDir, filename);

        // Save original file buffer directly to maintain exact type and size
        fs.writeFileSync(filepath, file.buffer);
        
        req.body.documents.push(`/uploads/documents/${filename}`);
      })
    );

    next();
  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).json({ success: false, message: "Error processing files during upload" });
  }
};

/**
 * Save multipart files to disk and attach paths to req.savedDocumentPaths (for appending to an application).
 */
const saveDocumentsToDisk = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  try {
    const paths = [];
    await Promise.all(
      req.files.map(async (file) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = `doc-${uniqueSuffix}${extension}`;
        const filepath = path.join(docsDir, filename);
        fs.writeFileSync(filepath, file.buffer);
        paths.push(`/uploads/documents/${filename}`);
      })
    );
    req.savedDocumentPaths = paths;
    next();
  } catch (error) {
    console.error("Error saving documents:", error);
    res.status(500).json({ success: false, message: "Error saving uploaded files" });
  }
};

module.exports = {
  uploadOptimizer,
  processFiles,
  saveDocumentsToDisk,
};
