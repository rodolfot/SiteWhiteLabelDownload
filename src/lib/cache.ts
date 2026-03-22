/**
 * Simple cache layer with in-memory fallback and optional Redis support.
 *
 * Usage:
 *   const data = await cached('key', 300, () => fetchExpensiveData());
 *
 * Set REDIS_URL env var to enable Redis (e.g., redis://localhost:6379).
 * Without REDIS_URL, uses in-memory Map with TTL (suitable for single-instance).
 */

// In-memory cache store
const memoryCache = new Map<string, { data: string; expiresAt: number }>();

// Redis client (lazy-initialized)
let redisClient: {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options: { EX: number }) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
  isOpen: boolean;
  connect: () => Promise<void>;
} | null = null;

let redisInitialized = false;

async function getRedisClient() {
  if (redisInitialized) return redisClient;
  redisInitialized = true;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    // Dynamic import to avoid bundling redis when not used
    // Install redis package: npm install redis
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = await (Function('return import("redis")')() as Promise<{ createClient: (opts: { url: string }) => typeof redisClient }>);
    redisClient = mod.createClient({ url });
    await redisClient!.connect();
    console.log('[Cache] Redis connected:', url);
    return redisClient;
  } catch (err) {
    console.warn('[Cache] Redis unavailable, using in-memory cache:', err);
    redisClient = null;
    return null;
  }
}

/**
 * Get cached value or compute and store it.
 * @param key Cache key
 * @param ttlSeconds Time to live in seconds
 * @param fetcher Function to compute the value if cache miss
 */
export async function cached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  const cacheKey = `downdoor:${key}`;

  // Try Redis first
  const redis = await getRedisClient();
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as T;
    } catch {
      // Redis read failed, fall through
    }
  }

  // Try memory cache
  const mem = memoryCache.get(cacheKey);
  if (mem && mem.expiresAt > Date.now()) {
    return JSON.parse(mem.data) as T;
  }

  // Cache miss — fetch data
  const data = await fetcher();
  const serialized = JSON.stringify(data);

  // Store in Redis
  if (redis) {
    try {
      await redis.set(cacheKey, serialized, { EX: ttlSeconds });
    } catch {
      // Redis write failed, continue
    }
  }

  // Store in memory
  memoryCache.set(cacheKey, {
    data: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  return data;
}

/**
 * Invalidate a cache key.
 */
export async function invalidateCache(key: string): Promise<void> {
  const cacheKey = `downdoor:${key}`;
  memoryCache.delete(cacheKey);

  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.del(cacheKey);
    } catch {
      // ignore
    }
  }
}

/**
 * Invalidate all cache keys matching a prefix.
 */
export function invalidateCachePrefix(prefix: string): void {
  const fullPrefix = `downdoor:${prefix}`;
  for (const key of memoryCache.keys()) {
    if (key.startsWith(fullPrefix)) {
      memoryCache.delete(key);
    }
  }
  // Note: Redis prefix invalidation requires SCAN, skipped for simplicity
}
