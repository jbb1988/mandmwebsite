import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

function verifyAdmin(request: NextRequest): boolean {
  const password = request.headers.get('X-Admin-Password');
  return password === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '48');
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // 1. Recent replies (with sentiment)
    const { data: recentReplies, error: repliesError } = await supabase
      .from('marketing_campaign_contacts')
      .select(`
        id,
        replied_at,
        reply_sentiment,
        reply_content,
        contact:marketing_contacts!inner(
          id,
          email,
          first_name,
          last_name,
          stage,
          organization:marketing_organizations(name, segment)
        ),
        campaign:marketing_campaigns(id, name, segment)
      `)
      .eq('status', 'replied')
      .gte('replied_at', cutoffTime)
      .order('replied_at', { ascending: false })
      .limit(20);

    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
    }

    // 2. Recent Calendly bookings
    const { data: recentBookings, error: bookingsError } = await supabase
      .from('calendly_bookings')
      .select(`
        id,
        booked_at,
        scheduled_at,
        event_name,
        status,
        invitee_email,
        invitee_name,
        contact:marketing_contacts(
          id,
          email,
          first_name,
          last_name,
          stage,
          organization:marketing_organizations(name, segment)
        ),
        campaign:marketing_campaigns(id, name, segment)
      `)
      .gte('booked_at', cutoffTime)
      .neq('status', 'canceled')
      .order('booked_at', { ascending: false })
      .limit(20);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
    }

    // 3. High engagement contacts (3+ opens in last 48h)
    const { data: highEngagement, error: engagementError } = await supabase
      .from('marketing_campaign_contacts')
      .select(`
        id,
        open_count,
        last_activity_at,
        clicked_at,
        contact:marketing_contacts!inner(
          id,
          email,
          first_name,
          last_name,
          stage,
          organization:marketing_organizations(name, segment)
        ),
        campaign:marketing_campaigns(id, name, segment)
      `)
      .gte('open_count', 3)
      .gte('last_activity_at', cutoffTime)
      .is('replied_at', null) // Not yet replied
      .order('open_count', { ascending: false })
      .limit(15);

    if (engagementError) {
      console.error('Error fetching high engagement:', engagementError);
    }

    // 4. Summary stats
    const stats = {
      totalReplies: recentReplies?.length || 0,
      positiveReplies: recentReplies?.filter(r => r.reply_sentiment === 'positive').length || 0,
      neutralReplies: recentReplies?.filter(r => r.reply_sentiment === 'neutral').length || 0,
      negativeReplies: recentReplies?.filter(r => r.reply_sentiment === 'negative').length || 0,
      totalBookings: recentBookings?.length || 0,
      upcomingBookings: recentBookings?.filter(b => new Date(b.scheduled_at) > new Date()).length || 0,
      highEngagementContacts: highEngagement?.length || 0,
    };

    // Format responses for frontend
    const formattedReplies = (recentReplies || []).map(r => ({
      id: r.id,
      repliedAt: r.replied_at,
      sentiment: r.reply_sentiment,
      replyPreview: r.reply_content?.substring(0, 150) + (r.reply_content?.length > 150 ? '...' : ''),
      contact: {
        id: (r.contact as any)?.id,
        email: (r.contact as any)?.email,
        name: `${(r.contact as any)?.first_name || ''} ${(r.contact as any)?.last_name || ''}`.trim(),
        stage: (r.contact as any)?.stage,
        organization: (r.contact as any)?.organization?.name,
        segment: (r.contact as any)?.organization?.segment,
      },
      campaign: {
        id: (r.campaign as any)?.id,
        name: (r.campaign as any)?.name,
        segment: (r.campaign as any)?.segment,
      },
    }));

    const formattedBookings = (recentBookings || []).map(b => ({
      id: b.id,
      bookedAt: b.booked_at,
      scheduledAt: b.scheduled_at,
      eventName: b.event_name,
      status: b.status,
      contact: b.contact ? {
        id: (b.contact as any)?.id,
        email: (b.contact as any)?.email || b.invitee_email,
        name: `${(b.contact as any)?.first_name || ''} ${(b.contact as any)?.last_name || ''}`.trim() || b.invitee_name,
        stage: (b.contact as any)?.stage,
        organization: (b.contact as any)?.organization?.name,
        segment: (b.contact as any)?.organization?.segment,
      } : {
        email: b.invitee_email,
        name: b.invitee_name,
      },
      campaign: b.campaign ? {
        id: (b.campaign as any)?.id,
        name: (b.campaign as any)?.name,
        segment: (b.campaign as any)?.segment,
      } : null,
    }));

    const formattedEngagement = (highEngagement || []).map(e => ({
      id: e.id,
      openCount: e.open_count,
      lastActivityAt: e.last_activity_at,
      hasClicked: !!e.clicked_at,
      contact: {
        id: (e.contact as any)?.id,
        email: (e.contact as any)?.email,
        name: `${(e.contact as any)?.first_name || ''} ${(e.contact as any)?.last_name || ''}`.trim(),
        stage: (e.contact as any)?.stage,
        organization: (e.contact as any)?.organization?.name,
        segment: (e.contact as any)?.organization?.segment,
      },
      campaign: {
        id: (e.campaign as any)?.id,
        name: (e.campaign as any)?.name,
        segment: (e.campaign as any)?.segment,
      },
    }));

    return NextResponse.json({
      success: true,
      stats,
      replies: formattedReplies,
      bookings: formattedBookings,
      highEngagement: formattedEngagement,
      timeframe: `Last ${hours} hours`,
    });
  } catch (error) {
    console.error('Hot leads error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch hot leads' }, { status: 500 });
  }
}
