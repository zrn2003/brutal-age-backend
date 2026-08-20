import { isFirebaseConfigured, uploadToFirebase } from '../config/firebase.js';

/**
 * High-Performance Image Storage Pipeline Microservice
 * Priority: 
 * 1. Google Firebase Storage
 * 2. Permanent Base64 Data URL / Full Domain Fallback (Prevents broken images in Render cloud hosting)
 */
export const processImageUploadPipeline = async (files) => {
  if (!files || files.length === 0) {
    throw new Error('No files provided for image upload pipeline');
  }

  let imageUrls = [];
  let storageProvider = 'Local Storage';

  if (isFirebaseConfigured) {
    try {
      // 1. Google Firebase Storage Upload Pipeline
      storageProvider = 'Google Firebase Storage';
      const uploadPromises = files.map((file) =>
        uploadToFirebase(file.buffer || file.originalname, file.originalname, file.mimetype)
      );
      imageUrls = await Promise.all(uploadPromises);
      return { imageUrls, storageProvider, fileCount: files.length };
    } catch (firebaseErr) {
      console.warn('⚠️ Firebase upload failed, switching to Base64/Server storage fallback:', firebaseErr.message);
    }
  }

  // 2. Base64 Data URL & Full Render Server URL Fallback Pipeline
  // Convert buffer directly to Data URL if memory storage used, or format full URL
  const serverHost = process.env.RENDER_EXTERNAL_URL || 'https://brutal-age-backend.onrender.com';
  storageProvider = 'Base64 Cloud Data URL & Render Host';

  imageUrls = files.map((file) => {
    if (file.buffer) {
      const mime = file.mimetype || 'image/png';
      const base64Str = file.buffer.toString('base64');
      return `data:${mime};base64,${base64Str}`;
    }
    if (file.filename) {
      return `${serverHost}/uploads/${file.filename}`;
    }
    return 'https://placehold.co/600x400/ffffff/0f172a?text=Brutal+Age';
  });

  return {
    imageUrls,
    storageProvider,
    fileCount: files.length,
  };
};
