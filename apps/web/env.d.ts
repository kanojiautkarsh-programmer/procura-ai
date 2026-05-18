// Type declarations for Cloudflare Pages environment bindings
interface CloudflareEnv {
  INVOICE_BUCKET: R2Bucket;
  CACHE: KVNamespace;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  NEXT_PUBLIC_API_URL: string;
  R2_PUBLIC_URL: string;
  KV_CACHE_TTL: string;
}

// Make env available in pages functions
declare global {
  namespace NodeJS {
    interface ProcessEnv extends CloudflareEnv {}
  }
}

export {};
