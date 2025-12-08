interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  keyPrefix: string
}

// In-memory fallback for rate limiting when Redis is not available
const inMemoryStore = new Map<string, { count: number; expires: number }>()

export class RateLimiter {
  private windowMs: number
  private maxRequests: number
  private keyPrefix: string

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs
    this.maxRequests = options.maxRequests
    this.keyPrefix = options.keyPrefix
  }

  async isRateLimited(key: string): Promise<boolean> {
    const redisKey = `${this.keyPrefix}:${key}`
    const now = Date.now()

    // Use in-memory store (works in Edge Runtime)
    const entry = inMemoryStore.get(redisKey)

    if (!entry || entry.expires < now) {
      // Create new entry
      inMemoryStore.set(redisKey, {
        count: 1,
        expires: now + this.windowMs
      })
      return false
    }

    entry.count++
    return entry.count > this.maxRequests
  }

  async getRemainingRequests(key: string): Promise<number> {
    const redisKey = `${this.keyPrefix}:${key}`
    const now = Date.now()
    const entry = inMemoryStore.get(redisKey)

    if (!entry || entry.expires < now) {
      return this.maxRequests
    }

    return Math.max(0, this.maxRequests - entry.count)
  }

  async reset(key: string): Promise<void> {
    const redisKey = `${this.keyPrefix}:${key}`
    inMemoryStore.delete(redisKey)
  }
}

// Login rate limiter: 5 attempts per 15 minutes
export const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyPrefix: 'login',
})

// General API rate limiter: 100 requests per hour
export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100,
  keyPrefix: 'api',
})

// Password reset rate limiter: 3 attempts per hour
export const passwordResetRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  keyPrefix: 'password-reset',
})