import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { teamCode } = await request.json();

    if (!teamCode) {
      return NextResponse.json(
        { error: 'Team code is required' },
        { status: 400 }
      );
    }

    // Check for master code or test codes first
    const MASTER_FAQ_CODE = 'FAQ-MASTER-ACCESS-2025';
    const TEST_CODES = ['TEAM-PKRM-L75S-6A29']; // Temporary test codes

    if (teamCode.toUpperCase() === MASTER_FAQ_CODE || TEST_CODES.includes(teamCode.toUpperCase())) {
      const response = NextResponse.json({
        success: true,
        message: 'Team code verified successfully'
      });

      response.cookies.set('faq_premium_access', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      return response;
    }

    // Query the team_join_codes table to verify the code exists and is active
    const { data, error } = await supabase
      .from('team_join_codes')
      .select('code, team_id, is_active')
      .eq('code', teamCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invalid or inactive team code' },
        { status: 401 }
      );
    }

    // Create response with secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Team code verified successfully'
    });

    // Set HTTP-only cookie that expires in 30 days
    response.cookies.set('faq_premium_access', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Team code verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

// Check if user has premium access (called from FAQ page)
export async function GET(request: NextRequest) {
  const hasPremiumAccess = request.cookies.get('faq_premium_access')?.value === 'true';

  return NextResponse.json({ hasPremiumAccess });
}
