import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

function verifyAdmin(request: NextRequest): boolean {
  const password = request.headers.get('X-Admin-Password');
  return password === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all X targets
    const { data: targets, error } = await supabase
      .from('x_target_accounts')
      .select('outreach_status, response_status, deal_status, category, follower_count');

    if (error) throw error;

    // Calculate stats
    const byStatus: Record<string, number> = {};
    const byResponse: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalFollowers = 0;
    let dmsSent = 0;
    let responses = 0;
    let partnerships = 0;

    targets?.forEach((target) => {
      // Count by outreach status
      const status = target.outreach_status || 'not_started';
      byStatus[status] = (byStatus[status] || 0) + 1;

      if (status !== 'not_started') {
        dmsSent++;
      }

      // Count by response status
      const respStatus = target.response_status || 'no_response';
      byResponse[respStatus] = (byResponse[respStatus] || 0) + 1;

      if (respStatus !== 'no_response' && respStatus !== 'pending') {
        responses++;
      }

      // Count by category
      if (target.category) {
        byCategory[target.category] = (byCategory[target.category] || 0) + 1;
      }

      // Total followers
      totalFollowers += target.follower_count || 0;

      // Count partnerships
      if (target.deal_status === 'partner' || target.deal_status === 'active') {
        partnerships++;
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        total: targets?.length || 0,
        byStatus,
        byResponse,
        byCategory,
        dmsSent,
        responses,
        partnerships,
        totalFollowers,
        responseRate: dmsSent > 0 ? Math.round((responses / dmsSent) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching X stats:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 });
  }
}
