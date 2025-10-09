import express from 'express';
import multer from 'multer';
import supabase from '../config/database.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Whitelist of allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic', // iPhone default format
  'image/heif'  // iPhone format variant
];

// MIME type validation function
const fileFilter = (req, file, cb) => {
  logger.debug('[Upload] Validating MIME type:', file.mimetype);
  
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true); // Accept file
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images (JPEG, PNG, WebP, HEIC) are allowed.`), false);
  }
};

// Configure multer for memory storage with MIME filtering
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 12 * 1024 * 1024, // 12MB (matches server.js config)
    files: 1 // Only allow 1 file per request
  },
  fileFilter: fileFilter
});

async function uploadToSupabase(buffer, mimetype) {
  logger.debug('[Upload] Uploading to Supabase Storage...');
  
  const fileName = `post-${Date.now()}.${mimetype.split('/')[1] || 'jpg'}`;
  const filePath = `posts/${fileName}`;

  const { data: uploadData, error: uploadError} = await supabase.storage
    .from('profile-images') // Using same bucket as profile images
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: false
    });

  if (uploadError) {
    logger.error('[Upload] Supabase error:', uploadError);
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath);
  
  logger.info('[Upload] File uploaded successfully');
  return { url: publicUrl, mimeType: mimetype };
}

router.post('/', upload.single('image'), async (req, res) => {
  try {
    logger.debug('[Upload] Request received');
    logger.debug('[Upload] Has file:', !!req.file);
    
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    // Server-side MIME type validation (second layer of defense)
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype.toLowerCase())) {
      logger.warn('[Upload] Rejected invalid MIME type:', req.file.mimetype);
      return res.status(400).json({ 
        success: false,
        error: `Invalid file type: ${req.file.mimetype}. Only images (JPEG, PNG, WebP, HEIC) are allowed.` 
      });
    }
    
    // Additional validation: check file size
    if (req.file.size > 12 * 1024 * 1024) {
      logger.warn('[Upload] File too large:', req.file.size, 'bytes');
      return res.status(400).json({ 
        success: false,
        error: 'File too large. Maximum size is 12MB.' 
      });
    }
    
    logger.debug('[Upload] File validated:', {
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
    });
    
    const result = await uploadToSupabase(req.file.buffer, req.file.mimetype);
    return res.json({ success: true, ...result });
  } catch (e) {
    logger.error('[Upload] Error:', e);
    
    // Handle multer errors specifically
    if (e instanceof multer.MulterError) {
      if (e.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false,
          error: 'File too large. Maximum size is 12MB.' 
        });
      }
      return res.status(400).json({ 
        success: false,
        error: `Upload error: ${e.message}` 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: e.message || 'Upload failed' 
    });
  }
});

export default router;
