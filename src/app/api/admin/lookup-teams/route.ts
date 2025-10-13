import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Query teams by admin email and join their join codes
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_join_codes (
          code,
          max_uses,
          uses_count,
          is_active,
          tier,
          expires_at
        )
      `)
      .eq('admin_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error querying teams:', error);
      return NextResponse.json(
        { error: 'Failed to query teams' },
        { status: 500 }
      );
    }

    // Transform the data to flatten join code info
    const transformedTeams = teams?.map(team => ({
      ...team,
      join_code: team.team_join_codes?.[0]?.code || null,
      max_seats: team.team_join_codes?.[0]?.max_uses || team.license_seats_total || 0,
      seats_used: team.team_join_codes?.[0]?.uses_count || team.license_seats_consumed || 0,
      code_active: team.team_join_codes?.[0]?.is_active ?? true,
      tier: team.team_join_codes?.[0]?.tier || 'team',
    })) || [];

    return NextResponse.json({ teams: transformedTeams });
  } catch (error: any) {
    console.error('Error in team lookup:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
