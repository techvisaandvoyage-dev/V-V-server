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

const { getFirebaseAdminApp } = require('./firebaseAdmin');

/**
 * Upload a buffer to Firebase Storage.
 */
const uploadToFirebase = async (buffer, filename, mimetype) => {
  try {
    const app = await getFirebaseAdminApp();
    const bucket = app.storage().bucket();
    
    if (!bucket.name) {
      throw new Error('Firebase Storage bucket is not configured. Add it in Admin -> Settings.');
    }

    const file = bucket.file(`documents/${filename}`);
    await file.save(buffer, {
      metadata: { contentType: mimetype },
    });

    // Make the file public so we can use the direct URL. 
    // In production, you might want to use signed URLs for better security.
    await file.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/documents/${filename}`;
  } catch (error) {
    console.error('Firebase Upload Error:', error);
    throw error;
  }
};

/**
 * Middleware to process uploaded files and upload them to Firebase Storage
 */
const processFiles = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    req.body.documents = [];

    await Promise.all(
      req.files.map(async (file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = `doc-${uniqueSuffix}${extension}`;
        
        const firebaseUrl = await uploadToFirebase(file.buffer, filename, file.mimetype);
        req.body.documents.push(firebaseUrl);
      })
    );

    next();
  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message.includes('Firebase') 
        ? error.message 
        : "Error uploading documents to cloud storage" 
    });
  }
};

/**
 * Upload multipart files to Firebase Storage and attach URLs to req.savedDocumentPaths.
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
        
        const firebaseUrl = await uploadToFirebase(file.buffer, filename, file.mimetype);
        paths.push(firebaseUrl);
      })
    );
    req.savedDocumentPaths = paths;
    next();
  } catch (error) {
    console.error("Error saving documents:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message.includes('Firebase') 
        ? error.message 
        : "Error uploading documents to cloud storage" 
    });
  }
};

module.exports = {
  uploadOptimizer,
  processFiles,
  saveDocumentsToDisk,
  uploadToFirebase,
};
