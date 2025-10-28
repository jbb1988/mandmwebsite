import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
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

    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.session) {
      // If exchange fails, redirect based on type
      if (type === 'recovery') {
        const resetUrl = new URL('/auth/reset-password', requestUrl.origin);
        resetUrl.searchParams.set('error', 'invalid_code');
        resetUrl.searchParams.set('error_description', exchangeError?.message || 'Failed to verify reset link');
        return NextResponse.redirect(resetUrl);
      }
      // For signup errors, redirect to homepage
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    }

    // Successfully exchanged code for session
    // Check the type to determine where to redirect
    console.log('Session exchanged successfully');
    console.log('Type check: type === "recovery"?', type === 'recovery');
    console.log('Redirecting to:', type === 'recovery' ? 'reset-password' : 'welcome');

    if (type === 'recovery') {
      // Password reset flow - redirect to reset password page with tokens
      console.log('Taking password reset flow');
      const resetUrl = new URL('/auth/reset-password', requestUrl.origin);
      resetUrl.searchParams.set('access_token', data.session.access_token);
      resetUrl.searchParams.set('refresh_token', data.session.refresh_token);
      resetUrl.searchParams.set('type', 'recovery');
      return NextResponse.redirect(resetUrl);
    } else {
      // Email confirmation flow - redirect to welcome page
      console.log('Taking email confirmation flow - redirecting to /welcome');
      const welcomeUrl = new URL('/welcome', requestUrl.origin);
      return NextResponse.redirect(welcomeUrl);
    }
  } catch (error) {
    console.error('Auth callback error:', error);
    // Default to homepage for errors
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }
}
