import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-initialized Supabase client for rate limiting
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MINUTES = 15;

/**
 * Get the client IP address from the request
 * Works with Vercel, Cloudflare, and standard proxies
 */
function getClientIP(request: NextRequest): string {
  // Try various headers in order of reliability
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs; take the first (client)
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  // Vercel-specific header
  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) {
    return vercelIP.split(',')[0].trim();
  }

  // Fallback - shouldn't happen in production
  return 'unknown';
}

/**
 * Check rate limit for an IP address
 * Returns: 'allowed' | 'blocked' | 'rate_limited'
 */
async function checkRateLimit(ip: string, success: boolean = false): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('check_admin_rate_limit', {
      p_ip_address: ip,
      p_success: success,
      p_max_attempts: MAX_ATTEMPTS,
      p_block_duration_minutes: BLOCK_DURATION_MINUTES,
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // On error, allow the request (fail open for availability)
      return 'allowed';
    }

    return data as string;
  } catch (err) {
    console.error('Rate limit exception:', err);
    return 'allowed';
  }
}

export interface AdminAuthResult {
  authorized: boolean;
  error?: string;
  status?: number;
}

/**
 * Verify admin authentication with rate limiting
 *
 * Usage:
 * ```
 * const auth = await verifyAdminWithRateLimit(request);
 * if (!auth.authorized) {
 *   return NextResponse.json({ error: auth.error }, { status: auth.status });
 * }
 * ```
 */
export async function verifyAdminWithRateLimit(request: NextRequest): Promise<AdminAuthResult> {
  const ip = getClientIP(request);
  const authHeader = request.headers.get('X-Admin-Password');
  const correctPassword = process.env.ADMIN_DASHBOARD_PASSWORD;

  // First check if IP is already blocked
  const preCheck = await checkRateLimit(ip, false);

  // If blocked, don't even check password
  if (preCheck === 'blocked') {
    return {
      authorized: false,
      error: 'Too many failed attempts. Please try again in 15 minutes.',
      status: 429,
    };
  }

  // Check password
  const isCorrect = authHeader === correctPassword;

  if (isCorrect) {
    // Reset rate limit on successful auth
    await checkRateLimit(ip, true);
    return { authorized: true };
  }

  // Wrong password - record failed attempt
  const result = await checkRateLimit(ip, false);

  if (result === 'rate_limited') {
    return {
      authorized: false,
      error: 'Too many failed attempts. You are blocked for 15 minutes.',
      status: 429,
    };
  }

  return {
    authorized: false,
    error: 'Unauthorized',
    status: 401,
  };
}

/**
 * Simple password verification without rate limiting
 * Use this for read-only endpoints where brute force is less critical
 */
export function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('X-Admin-Password');
  return authHeader === process.env.ADMIN_DASHBOARD_PASSWORD;
}

/**
 * Create a standard unauthorized response
 */
export function unauthorizedResponse(error: string = 'Unauthorized', status: number = 401): NextResponse {
  return NextResponse.json({ error }, { status });
}
