import { auth } from '@/auth';
import { upload } from '@/app/api/utils/upload';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Multipart form-data
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('image') || form.get('file');
      if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await upload({ buffer });
      if (!result?.url) return Response.json({ error: 'Upload failed' }, { status: 500 });
      return Response.json({ url: result.url, mimeType: result.mimeType || null });
    }

    // JSON body: { base64 } or { url }
    const body = await request.json().catch(() => ({}));
    if (body?.base64) {
      const result = await upload({ base64: body.base64 });
      if (!result?.url) return Response.json({ error: 'Upload failed' }, { status: 500 });
      return Response.json({ url: result.url, mimeType: result.mimeType || null });
    }
    if (body?.url) {
      const result = await upload({ url: body.url });
      if (!result?.url) return Response.json({ error: 'Upload failed' }, { status: 500 });
      return Response.json({ url: result.url, mimeType: result.mimeType || null });
    }

    return Response.json({ error: 'Unsupported upload request' }, { status: 400 });
  } catch (e) {
    console.error('Upload error:', e);
    return Response.json({ error: 'Failed to upload' }, { status: 500 });
  }
}


