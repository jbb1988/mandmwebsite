import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

export async function GET(request: NextRequest) {
  // Auth check
  const password = request.headers.get('X-Admin-Password');
  if (password !== adminPassword) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.trim() || '';

  if (query.length < 2) {
    return NextResponse.json({ success: true, users: [] });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Search users by email or name
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, display_name, subscription_status, created_at')
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%,display_name.ilike.%${query}%`)
      .not('email', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users: users || [],
    });
  } catch (err) {
    console.error('Search users error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
