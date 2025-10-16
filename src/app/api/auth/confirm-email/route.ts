import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'Missing required tokens' },
        { status: 400 }
      );
    }

    // Create a Supabase client
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

    // Set the session using the tokens from the confirmation link
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.session) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: 'Invalid or expired confirmation link. Please request a new confirmation email.' },
        { status: 401 }
      );
    }

    // Email is automatically confirmed when the session is set
    // The user is now authenticated with a confirmed email

    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully',
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
      },
    });
  } catch (error) {
    console.error('Email confirmation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
