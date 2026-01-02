import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

export async function GET(request: NextRequest) {
  // Auth check
  const password = request.headers.get('X-Admin-Password');
  if (password !== adminPassword) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const segment = searchParams.get('segment') || 'all';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    let query = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .not('email', 'is', null);

    // Apply segment filters
    switch (segment) {
      case 'trial':
        query = query.eq('subscription_status', 'trial');
        break;
      case 'pro':
        query = query.eq('subscription_status', 'pro');
        break;
      case 'free':
        query = query.or('subscription_status.is.null,subscription_status.eq.free,subscription_status.eq.expired');
        break;
      case 'inactive':
        // Users who haven't been active in 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.lt('last_active_at', thirtyDaysAgo.toISOString());
        break;
      case 'new':
        // Users who signed up in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('created_at', sevenDaysAgo.toISOString());
        break;
      case 'all':
      default:
        // No additional filters
        break;
    }

    const { count, error } = await query;

    if (error) {
      console.error('Segment count error:', error);
      return NextResponse.json({ success: false, error: 'Failed to count segment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      segment,
      count: count || 0,
    });
  } catch (err) {
    console.error('Segment count error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
