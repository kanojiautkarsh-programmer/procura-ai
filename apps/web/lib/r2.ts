// Client-side helper for uploading to R2 via Cloudflare Pages Function

const R2_UPLOAD_ENDPOINT = '/api/upload';

export async function uploadInvoiceToR2(file: File, authToken: string, organizationId: string) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(R2_UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'X-Organization-Id': organizationId,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Upload failed');
  }

  return response.json() as Promise<{
    success: boolean;
    key: string;
    url: string;
    size: number;
    type: string;
  }>;
}
