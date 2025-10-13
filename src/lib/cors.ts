import { NextRequest, NextResponse } from 'next/server';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://mindandmuscle.ai',
  'https://www.mindandmuscle.ai',
  // Add localhost for development
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean) as string[];

/**
 * Validates the origin of a request against allowed origins
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Adds CORS headers to a response
 */
export function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !isAllowedOrigin(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Handles preflight OPTIONS requests
 */
export function handleCorsOptions(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }
  return null;
}

/**
 * Validates CORS and returns error response if invalid
 */
export function validateCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');

  // Allow requests without origin (same-origin requests, or tools like Postman)
  if (!origin) {
    return null;
  }

  if (!isAllowedOrigin(origin)) {
    return NextResponse.json(
      { error: 'Forbidden: Invalid origin' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Wraps a response with CORS headers
 */
export function withCors(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
