import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // If there's an error, redirect to reset password page with error info
  if (error) {
    const resetUrl = new URL('/auth/reset-password', requestUrl.origin);
    resetUrl.searchParams.set('error', error);
    if (errorDescription) {
      resetUrl.searchParams.set('error_description', errorDescription);
    }
    return NextResponse.redirect(resetUrl);
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

    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.session) {
      // If exchange fails, redirect to reset password with error
      const resetUrl = new URL('/auth/reset-password', requestUrl.origin);
      resetUrl.searchParams.set('error', 'invalid_code');
      resetUrl.searchParams.set('error_description', exchangeError?.message || 'Failed to verify reset link');
      return NextResponse.redirect(resetUrl);
    }

    // Successfully exchanged code for session
    // Redirect to reset password page with tokens
    const resetUrl = new URL('/auth/reset-password', requestUrl.origin);
    resetUrl.searchParams.set('access_token', data.session.access_token);
    resetUrl.searchParams.set('refresh_token', data.session.refresh_token);
    resetUrl.searchParams.set('type', 'recovery');

    return NextResponse.redirect(resetUrl);
  } catch (error) {
    console.error('Auth callback error:', error);
    const resetUrl = new URL('/auth/reset-password', requestUrl.origin);
    resetUrl.searchParams.set('error', 'server_error');
    resetUrl.searchParams.set('error_description', 'An unexpected error occurred');
    return NextResponse.redirect(resetUrl);
  }
}
