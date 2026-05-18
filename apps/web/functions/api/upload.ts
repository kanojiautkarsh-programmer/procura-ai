// Cloudflare Pages Function — handles file upload directly to R2
// Avoids proxying large files through the NestJS API on Render

import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  INVOICE_BUCKET: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = context.request.headers.get('X-Organization-Id');
  if (!orgId) {
    return Response.json({ error: 'Missing organization ID' }, { status: 400 });
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'];
    if (!allowed.includes(file.type)) {
      return Response.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }

    // Validate file size (20 MB max)
    if (file.size > 20 * 1024 * 1024) {
      return Response.json({ error: 'File too large (max 20 MB)' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const key = `${orgId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    await context.env.INVOICE_BUCKET.put(key, buffer, {
      httpMetadata: { contentType: file.type },
      customMetadata: { organizationId: orgId, originalName: file.name },
    });

    const publicUrl = `${process.env.R2_PUBLIC_URL || ''}/${key}`;

    return Response.json({
      success: true,
      key,
      url: publicUrl,
      size: file.size,
      type: file.type,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 },
    );
  }
};
