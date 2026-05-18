// KV-based cache client compatible with both Cloudflare Pages (bindings) and Node.js (fetch to Upstash)

type CacheOptions = { ttl?: number };

export async function kvGet(key: string, opts?: CacheOptions): Promise<string | null> {
  // Cloudflare Pages runtime: use binding
  if (typeof globalThis !== 'undefined' && (globalThis as any).CACHE) {
    const value = await (globalThis as any).CACHE.get(key);
    return value;
  }

  // Node.js / Browser: use Upstash REST API (free 1000 req/day)
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as any;
    return data.result;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: string, opts?: CacheOptions): Promise<void> {
  const ttl = opts?.ttl ?? parseInt(process.env.KV_CACHE_TTL || '60', 10);

  if (typeof globalThis !== 'undefined' && (globalThis as any).CACHE) {
    await (globalThis as any).CACHE.put(key, value, { expirationTtl: ttl });
    return;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    await fetch(`${url}/set/${key}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
    // Set expiry separately
    if (ttl > 0) {
      await fetch(`${url}/expire/${key}/${ttl}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {}
}

export async function kvDelete(key: string): Promise<void> {
  if (typeof globalThis !== 'undefined' && (globalThis as any).CACHE) {
    await (globalThis as any).CACHE.delete(key);
    return;
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try { await fetch(`${url}/del/${key}`, { headers: { Authorization: `Bearer ${token}` } }); } catch {}
}

export async function kvIncrement(key: string): Promise<number> {
  if (typeof globalThis !== 'undefined' && (globalThis as any).CACHE) {
    const val = await (globalThis as any).CACHE.get(key);
    const next = (parseInt(val || '0') + 1).toString();
    await (globalThis as any).CACHE.put(key, next, { expirationTtl: 60 });
    return parseInt(next);
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return 0;
  try {
    const res = await fetch(`${url}/incr/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as any;
    return data.result || 0;
  } catch { return 0; }
}
