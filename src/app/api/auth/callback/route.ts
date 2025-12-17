import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authCallbackLimiter, getClientIP } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  // Rate limiting - 10 requests per minute per IP
  const clientIP = getClientIP(request);
  const rateLimit = authCallbackLimiter.check(clientIP);

  if (rateLimit.limited) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Please wait a moment before trying again',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
        },
      }
    );
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const type = requestUrl.searchParams.get('type'); // Check auth type

  // Debug logging - LOG ALL PARAMETERS
  console.log('=== AUTH CALLBACK DEBUG ===');
  console.log('Full URL:', requestUrl.toString());
  console.log('Code:', code ? 'present' : 'missing');
  console.log('Type parameter:', type);
  console.log('Error:', error);
  console.log('All search params:', Object.fromEntries(requestUrl.searchParams.entries()));
  console.log('==========================');

  // If there's an error, redirect appropriately based on type
  if (error) {
    // For password recovery errors, go to reset password page
    if (type === 'recovery') {
      const resetUrl = new URL('/auth/reset-password', requestUrl.origin);
      resetUrl.searchParams.set('error', error);
      if (errorDescription) {
        resetUrl.searchParams.set('error_description', errorDescription);
      }
      return NextResponse.redirect(resetUrl);
    }
    // For signup/other errors, go to homepage
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  // If there's no code, redirect to homepage
  if (!code) {
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Handle password recovery (uses PKCE flow)
    if (type === 'recovery') {
      console.log('Password recovery flow detected');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !data.session) {
        console.log('Password recovery code exchange failed:', exchangeError?.message);
        const resetUrl = new URL('/auth/reset-password', requestUrl.origin);
        resetUrl.searchParams.set('error', 'invalid_code');
        resetUrl.searchParams.set('error_description', exchangeError?.message || 'Failed to verify reset link');
        return NextResponse.redirect(resetUrl);
      }

      console.log('Password recovery successful, redirecting to reset password page');
      const resetUrl = new URL('/auth/reset-password', requestUrl.origin);
      resetUrl.searchParams.set('access_token', data.session.access_token);
      resetUrl.searchParams.set('refresh_token', data.session.refresh_token);
      resetUrl.searchParams.set('type', 'recovery');
      return NextResponse.redirect(resetUrl);
    }

    // Handle email confirmation (PKCE flow)
    // The code MUST be exchanged to confirm the email - this is required for PKCE
    console.log('Email confirmation flow detected');
    console.log('Exchanging code to confirm email...');

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Email confirmation code exchange failed:', exchangeError.message);
      // Redirect to homepage with error - user will need to request a new confirmation email
      const errorUrl = new URL('/', requestUrl.origin);
      errorUrl.searchParams.set('error', 'email_confirmation_failed');
      errorUrl.searchParams.set('error_description', exchangeError.message || 'Failed to confirm email');
      return NextResponse.redirect(errorUrl);
    }

    console.log('Email confirmed successfully for user:', data.user?.email);
    console.log('Redirecting to confirming page with loading animation');

    // Redirect to confirming page which shows loading animation before welcome page
    const confirmingUrl = new URL('/auth/confirming', requestUrl.origin);
    return NextResponse.redirect(confirmingUrl);
  } catch (error) {
    console.error('Auth callback error:', error);
    // Default to homepage for errors
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }
}
