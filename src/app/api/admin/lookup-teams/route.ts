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

    // Query teams by admin email
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .eq('admin_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error querying teams:', error);
      return NextResponse.json(
        { error: 'Failed to query teams' },
        { status: 500 }
      );
    }

    return NextResponse.json({ teams: teams || [] });
  } catch (error: any) {
    console.error('Error in team lookup:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
