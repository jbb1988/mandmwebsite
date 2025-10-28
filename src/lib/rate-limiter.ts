/**
 * Simple in-memory rate limiter for API routes
 * Uses sliding window algorithm
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry>;
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.requests = new Map();
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Usually IP address or user ID
   * @returns Object with { limited: boolean, remaining: number, resetAt: number }
   */
  check(identifier: string): { limited: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // Clean up expired entries periodically
    if (this.requests.size > 1000) {
      this.cleanup();
    }

    // No previous requests or window expired
    if (!entry || entry.resetAt < now) {
      const resetAt = now + this.windowMs;
      this.requests.set(identifier, { count: 1, resetAt });
      return {
        limited: false,
        remaining: this.limit - 1,
        resetAt,
      };
    }

    // Increment counter
    entry.count++;

    // Check if over limit
    if (entry.count > this.limit) {
      return {
        limited: true,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    return {
      limited: false,
      remaining: this.limit - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetAt < now) {
        this.requests.delete(key);
      }
    }
  }
}

// Export a singleton instance for auth callbacks
// 10 requests per minute per IP
export const authCallbackLimiter = new RateLimiter(10, 60 * 1000);

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check various headers that might contain the IP
  const headers = request.headers;

  // Vercel-specific headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }

  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Standard header
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}
