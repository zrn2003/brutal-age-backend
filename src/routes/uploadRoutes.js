import express from 'express';
import multer from 'multer';
import path from 'path';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { processImageUploadPipeline } from '../services/storageService.js';

const router = express.Router();

// Memory Storage for buffer processing
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    const err = new Error('Only image files are allowed! (jpg, jpeg, png, webp)');
    err.status = 400;
    cb(err);
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Expanded to 50MB per image file
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array('images', 10);

// @route   POST /api/upload
// @desc    High-resolution Image Upload Pipeline (Google Firebase / Base64 Data URL)
// @access  Private (Admin)
router.post('/', protectAdmin, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'Uploaded image file exceeds the 50MB file size limit. Please compress or select smaller images.',
          });
        }
        return res.status(400).json({ message: `Image Upload Error: ${err.message}` });
      }
      return res.status(400).json({ message: err.message || 'Image upload failed. Please verify file format.' });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No image files uploaded. Please select at least one image.' });
      }

      const result = await processImageUploadPipeline(req.files);
      return res.json(result);
    } catch (pipelineErr) {
      console.error('[STORAGE MICROSERVICE ERROR]:', pipelineErr.message);
      return res.status(500).json({ message: pipelineErr.message || 'Error processing image storage pipeline.' });
    }
  });
});

export default router;
