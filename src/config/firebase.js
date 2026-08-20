import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootServiceAccountPath = path.resolve(__dirname, '../../../ab-s-marketplace-firebase-adminsdk-fbsvc-600cf58ac0.json');
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 'ab-s-marketplace.firebasestorage.app';

let serviceAccountObj = null;

if (fs.existsSync(rootServiceAccountPath)) {
  try {
    serviceAccountObj = JSON.parse(fs.readFileSync(rootServiceAccountPath, 'utf8'));
  } catch (e) {}
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccountObj = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (e) {}
}

export const isFirebaseConfigured = Boolean(serviceAccountObj && storageBucket);

if (isFirebaseConfigured && getApps().length === 0) {
  try {
    initializeApp({
      credential: cert(serviceAccountObj),
      storageBucket: storageBucket,
    });
    console.log('🔥 Google Firebase Storage initialized successfully! Bucket:', storageBucket);
  } catch (error) {
    console.warn('⚠️ Firebase init warning:', error.message);
  }
}

export const firebaseBucket = getApps().length > 0 ? getStorage().bucket() : null;

/**
 * Uploads a high-resolution image buffer directly to Google Firebase Storage
 */
export const uploadToFirebase = async (fileBuffer, originalName, mimeType) => {
  if (!firebaseBucket) {
    throw new Error('Google Firebase Storage is not configured properly.');
  }

  const extension = originalName.split('.').pop() || 'png';
  const fileName = `brutal-age-images/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
  const file = firebaseBucket.file(fileName);
  const downloadToken = crypto.randomUUID();

  await file.save(fileBuffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });

  // Construct Firebase Storage Public Download URL
  const bucketName = firebaseBucket.name;
  const encodedPath = encodeURIComponent(fileName);
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;

  return publicUrl;
};
