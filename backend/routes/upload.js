import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

async function uploadToCreate({ buffer, base64, url }) {
  console.log('[Upload] Uploading to Create.xyz, buffer size:', buffer?.length || 'N/A');
  const r = await fetch('https://api.create.xyz/v0/upload', {
    method: 'POST',
    headers: { 'Content-Type': buffer ? 'application/octet-stream' : 'application/json' },
    body: buffer ? buffer : JSON.stringify({ base64, url }),
  });
  
  if (!r.ok) {
    const errorText = await r.text();
    console.error('[Upload] Create.xyz error:', r.status, errorText);
    throw new Error(`Create.xyz upload failed: ${errorText}`);
  }
  
  const data = await r.json();
  console.log('[Upload] Success! URL:', data.url);
  return { url: data.url, mimeType: data.mimeType || null };
}

router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('[Upload] Request received');
    console.log('[Upload] Content-Type:', req.headers['content-type']);
    console.log('[Upload] Has file:', !!req.file);
    
    // Handle multipart form-data (from React Native)
    if (req.file?.buffer) {
      console.log('[Upload] Processing file buffer');
      const result = await uploadToCreate({ buffer: req.file.buffer });
      return res.json(result);
    }
    
    // Handle JSON body with base64 or url
    const body = req.body || {};
    if (body.base64) {
      console.log('[Upload] Processing base64');
      const result = await uploadToCreate({ base64: body.base64 });
      return res.json(result);
    }
    if (body.url) {
      console.log('[Upload] Processing URL');
      const result = await uploadToCreate({ url: body.url });
      return res.json(result);
    }
    
    console.error('[Upload] No valid upload data found');
    return res.status(400).json({ error: 'No file, base64, or url provided' });
  } catch (e) {
    console.error('[Upload] Error:', e);
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

export default router;
