/**
 * Simple In-Memory Cache Utility
 *
 * Provides lightweight caching for frequently accessed data
 * to reduce database queries and improve performance.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.store = new Map();
    this.cleanupInterval = null;

    // Auto-cleanup expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Store a value in cache with optional TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttlSeconds Time-to-live in seconds (default: 5 minutes)
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Retrieve a value from cache
   * @param key Cache key
   * @returns Cached value or null if expired/not found
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   * @param key Cache key
   * @param fetchFn Function to compute value if not cached
   * @param ttlSeconds TTL in seconds
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Delete a specific cache entry
   * @param key Cache key
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Delete all cache entries matching a pattern
   * @param pattern String pattern to match (simple prefix matching)
   */
  deletePattern(pattern: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.store.keys()) {
      if (key.startsWith(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: Removed ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }

  /**
   * Cleanup interval on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Global singleton instance
const globalForCache = global as unknown as { cache: Cache };

export const cache = globalForCache.cache || new Cache();

if (process.env.NODE_ENV !== 'production') {
  globalForCache.cache = cache;
}

// Cache key helpers for common patterns
export const CacheKeys = {
  jobList: (page: number, query?: string) =>
    `jobs:list:${page}:${query || 'all'}`,
  jobDetail: (id: string) =>
    `jobs:detail:${id}`,
  userProfile: (userId: string) =>
    `profile:${userId}`,
  triageJobs: (userId: string) =>
    `triage:${userId}`,
  pipelineStats: (userId: string) =>
    `pipeline:stats:${userId}`,
};

// Invalidation helpers
export const invalidateJobCache = () => {
  cache.deletePattern('jobs:');
};

export const invalidateUserCache = (userId: string) => {
  cache.deletePattern(`profile:${userId}`);
  cache.deletePattern(`triage:${userId}`);
  cache.deletePattern(`pipeline:${userId}`);
};
