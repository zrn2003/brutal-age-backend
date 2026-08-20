import express from 'express';
import multer from 'multer';
import path from 'path';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { processImageUploadPipeline } from '../services/storageService.js';

const router = express.Router();

// Use Memory Storage so uploaded images are converted to Base64 or Firebase URLs reliably
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only high-quality image files are allowed! (jpg, jpeg, png, webp)'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit per image
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @route   POST /api/upload
// @desc    High-resolution Image Upload Pipeline (Google Firebase Storage / Base64 Data URL)
// @access  Private (Admin)
router.post('/', protectAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded' });
    }

    const result = await processImageUploadPipeline(req.files);
    res.json(result);
  } catch (error) {
    console.error('[STORAGE MICROSERVICE ERROR]:', error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
