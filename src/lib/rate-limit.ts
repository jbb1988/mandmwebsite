import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
// In development, rate limiting is disabled if env vars not set
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Rate limiter for team code lookup endpoint
 * 5 requests per minute per IP to prevent brute force attacks
 */
export const lookupTeamRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ratelimit:lookup-team',
    })
  : null;

/**
 * Rate limiter for checkout session creation
 * 3 requests per minute per IP to prevent abuse
 */
export const checkoutRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      analytics: true,
      prefix: 'ratelimit:checkout',
    })
  : null;

/**
 * Rate limiter for partner application submissions
 * 2 requests per 5 minutes per IP to prevent spam
 */
export const partnerApplicationRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(2, '5 m'),
      analytics: true,
      prefix: 'ratelimit:partner-app',
    })
  : null;

/**
 * Rate limiter for adding team seats
 * 3 requests per minute per IP
 */
export const addSeatsRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      analytics: true,
      prefix: 'ratelimit:add-seats',
    })
  : null;

/**
 * Generic strict rate limiter for sensitive operations
 * 10 requests per minute per IP
 */
export const strictRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ratelimit:strict',
    })
  : null;

/**
 * Helper function to get client IP from request
 * Works with Vercel, Cloudflare, and other proxies
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback to a default if no IP found (shouldn't happen in production)
  return 'unknown';
}

/**
 * Apply rate limiting to a request and return appropriate response if limited
 * @param rateLimit - The rate limiter to use
 * @param identifier - Usually the client IP address
 * @returns null if allowed, NextResponse with 429 if rate limited
 */
export async function checkRateLimit(
  rateLimit: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number } | null> {
  // If rate limiting is not configured (dev environment), allow all requests
  if (!rateLimit) {
    return { success: true };
  }

  const { success, limit, remaining, reset } = await rateLimit.limit(identifier);

  if (!success) {
    return {
      success: false,
      limit,
      remaining,
      reset,
    };
  }

  return { success: true, limit, remaining, reset };
}
