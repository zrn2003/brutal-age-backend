import { isFirebaseConfigured, uploadToFirebase } from '../config/firebase.js';

/**
 * Image Storage Pipeline Microservice
 * Priority: 
 * 1. Google Firebase Storage
 * 2. Local Disk Storage (/uploads fallback)
 */
export const processImageUploadPipeline = async (files) => {
  if (!files || files.length === 0) {
    throw new Error('No files provided for image upload pipeline');
  }

  let imageUrls = [];
  let storageProvider = 'Local Disk';

  if (isFirebaseConfigured) {
    // 1. Google Firebase Storage Upload Pipeline
    storageProvider = 'Google Firebase Storage';
    const uploadPromises = files.map((file) =>
      uploadToFirebase(file.buffer, file.originalname, file.mimetype)
    );
    imageUrls = await Promise.all(uploadPromises);
  } else {
    // 2. Fallback Local Storage Pipeline
    storageProvider = 'Local Disk (/uploads)';
    imageUrls = files.map((file) => `/uploads/${file.filename}`);
  }

  return {
    imageUrls,
    storageProvider,
    fileCount: files.length,
  };
};
