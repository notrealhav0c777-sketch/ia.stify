import { handleUpload } from '@vercel/blob/client';
import { r } from './_r.js';
export default async function handler(req, res) {
  try {
    const out = await handleUpload({
      body: req.body, request: req,
      onBeforeGenerateToken: async (_path, payload) => {
        if (!payload || !(await r.get('s:' + payload))) throw new Error('Faça login.');
        return { allowedContentTypes: ['audio/*', 'image/*', 'video/*'], maximumSizeInBytes: 60 * 1024 * 1024, addRandomSuffix: true };
      },
      onUploadCompleted: async () => {},
    });
    res.json(out);
  } catch (e) { res.status(400).json({ error: e.message }); }
}
