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
    // Get all pages with dm_sent_at for follow-up calculation
    const { data: pages, error } = await supabase
      .from('fb_page_outreach')
      .select('outreach_status, state, dm_sent_at');

    if (error) throw error;

    // Calculate stats
    const byStatus: Record<string, number> = {};
    const byState: Record<string, number> = {};
    let needsFollowUp = 0;
    let readyToPost = 0;
    const now = new Date();

    pages?.forEach((page) => {
      // Count by status
      const status = page.outreach_status || 'not_started';
      byStatus[status] = (byStatus[status] || 0) + 1;

      // Count by state
      if (page.state) {
        byState[page.state] = (byState[page.state] || 0) + 1;
      }

      // Count pages needing follow-up (DM sent 3+ days ago, not yet approved/declined/posted)
      if (page.dm_sent_at && ['dm_sent', 'awaiting_response'].includes(status)) {
        const dmSentDate = new Date(page.dm_sent_at);
        const daysSinceDm = Math.floor((now.getTime() - dmSentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceDm >= 3) {
          needsFollowUp++;
        }
      }

      // Count pages ready to post (approved but not yet posted)
      if (status === 'approved') {
        readyToPost++;
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        total: pages?.length || 0,
        byStatus,
        byState,
        needsFollowUp,
        readyToPost,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 });
  }
}
