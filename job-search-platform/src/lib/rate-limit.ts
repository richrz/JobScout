import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
})

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  keyPrefix: string
}

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
    const current = await redis.incr(redisKey)
    
    if (current === 1) {
      // Set expiry on first request
      await redis.pexpire(redisKey, this.windowMs)
    }
    
    return current > this.maxRequests
  }

  async getRemainingRequests(key: string): Promise<number> {
    const redisKey = `${this.keyPrefix}:${key}`
    const current = await redis.get(redisKey)
    return Math.max(0, this.maxRequests - (parseInt(current || '0')))
  }

  async reset(key: string): Promise<void> {
    const redisKey = `${this.keyPrefix}:${key}`
    await redis.del(redisKey)
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