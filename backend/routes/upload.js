import express from 'express';
import multer from 'multer';
import supabase from '../config/database.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

async function uploadToSupabase(buffer, mimetype) {
  console.log('[Upload] Uploading to Supabase Storage...');
  
  const fileName = `post-${Date.now()}.${mimetype.split('/')[1] || 'jpg'}`;
  const filePath = `posts/${fileName}`;

  const { data: uploadData, error: uploadError} = await supabase.storage
    .from('profile-images') // Using same bucket as profile images
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: false
    });

  if (uploadError) {
    console.error('[Upload] Supabase error:', uploadError);
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath);
  
  console.log('[Upload] Success! URL:', publicUrl);
  return { url: publicUrl, mimeType: mimetype };
}

router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('[Upload] Request received');
    console.log('[Upload] Content-Type:', req.headers['content-type']);
    console.log('[Upload] Has file:', !!req.file);
    
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const result = await uploadToSupabase(req.file.buffer, req.file.mimetype);
    return res.json(result);
  } catch (e) {
    console.error('[Upload] Error:', e);
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

export default router;
