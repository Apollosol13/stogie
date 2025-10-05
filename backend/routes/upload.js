import express from 'express';
import multer from 'multer';

const router = express.Router();
const mem = multer();

async function uploadToCreate({ buffer, base64, url }) {
  const r = await fetch('https://api.create.xyz/v0/upload', {
    method: 'POST',
    headers: { 'Content-Type': buffer ? 'application/octet-stream' : 'application/json' },
    body: buffer ? buffer : JSON.stringify({ base64, url }),
  });
  const data = await r.json();
  return { url: data.url, mimeType: data.mimeType || null };
}

router.post('/', mem.single('image'), async (req, res) => {
  try {
    const ct = req.headers['content-type'] || '';
    
    // Handle multipart form-data
    if (ct.includes('multipart/form-data')) {
      if (!req.file?.buffer) {
        return res.status(400).json({ error: 'No file provided' });
      }
      const result = await uploadToCreate({ buffer: req.file.buffer });
      return res.json(result);
    }
    
    // Handle JSON body with base64 or url
    const body = req.body || {};
    if (body.base64) {
      const result = await uploadToCreate({ base64: body.base64 });
      return res.json(result);
    }
    if (body.url) {
      const result = await uploadToCreate({ url: body.url });
      return res.json(result);
    }
    
    return res.status(400).json({ error: 'Unsupported upload request' });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;

