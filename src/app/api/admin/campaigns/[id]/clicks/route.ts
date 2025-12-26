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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id: campaignId } = await params;
  const { searchParams } = new URL(request.url);
  const includeBots = searchParams.get('includeBots') === 'true';
  const linkType = searchParams.get('linkType');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = (page - 1) * limit;

  try {
    // First check for detailed clicks in email_link_clicks (new tracking system with bot detection)
    let detailedQuery = supabase
      .from('email_link_clicks')
      .select(`
        id,
        link_type,
        destination_url,
        clicked_at,
        is_likely_bot,
        user_agent,
        contact:marketing_contacts(
          id,
          email,
          first_name,
          last_name,
          organization:marketing_organizations(
            name
          )
        )
      `, { count: 'exact' })
      .eq('campaign_id', campaignId)
      .order('clicked_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter out bots by default
    if (!includeBots) {
      detailedQuery = detailedQuery.eq('is_likely_bot', false);
    }

    // Filter by link type if provided
    if (linkType && linkType !== 'all') {
      detailedQuery = detailedQuery.eq('link_type', linkType);
    }

    const { data: detailedClicks, error: detailedError, count: detailedCount } = await detailedQuery;

    // Check if we have detailed tracking data
    const hasDetailedClicks = (detailedClicks?.length || 0) > 0;

    let clicks: any[] = [];
    let count = 0;
    let stats: any;

    if (hasDetailedClicks) {
      // Use detailed tracking data
      clicks = detailedClicks || [];
      count = detailedCount || 0;

      // Get stats from detailed clicks
      const { data: allDetailedClicks } = await supabase
        .from('email_link_clicks')
        .select('link_type, is_likely_bot, contact_id')
        .eq('campaign_id', campaignId);

      stats = {
        total: allDetailedClicks?.length || 0,
        human: allDetailedClicks?.filter((c: any) => !c.is_likely_bot).length || 0,
        bot: allDetailedClicks?.filter((c: any) => c.is_likely_bot).length || 0,
        uniqueClickers: new Set(allDetailedClicks?.filter((c: any) => !c.is_likely_bot).map((c: any) => c.contact_id)).size,
        byLinkType: {
          cta_calendly: allDetailedClicks?.filter((c: any) => !c.is_likely_bot && c.link_type === 'cta_calendly').length || 0,
          cta_website: allDetailedClicks?.filter((c: any) => !c.is_likely_bot && c.link_type === 'cta_website').length || 0,
          logo: allDetailedClicks?.filter((c: any) => !c.is_likely_bot && c.link_type === 'logo').length || 0,
          unsubscribe: allDetailedClicks?.filter((c: any) => !c.is_likely_bot && c.link_type === 'unsubscribe').length || 0,
          other: allDetailedClicks?.filter((c: any) => !c.is_likely_bot && !['cta_calendly', 'cta_website', 'logo', 'unsubscribe'].includes(c.link_type)).length || 0,
        },
        dataSource: 'detailed' as const,
      };
    } else {
      // Fall back to campaign_contacts with clicked_at (from Resend webhooks)
      const { data: clickedContacts, error: clickedError, count: clickedCount } = await supabase
        .from('marketing_campaign_contacts')
        .select(`
          id,
          clicked_at,
          contact:marketing_contacts(
            id,
            email,
            first_name,
            last_name,
            organization:marketing_organizations(
              name
            )
          )
        `, { count: 'exact' })
        .eq('campaign_id', campaignId)
        .not('clicked_at', 'is', null)
        .order('clicked_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (clickedError) throw clickedError;

      clicks = clickedContacts || [];
      count = clickedCount || 0;

      stats = {
        total: clickedCount || 0,
        human: clickedCount || 0, // Resend doesn't distinguish bots
        bot: 0,
        uniqueClickers: clickedCount || 0, // Each row is a unique contact
        byLinkType: {}, // Resend doesn't provide link type
        dataSource: 'resend' as const,
      };
    }

    if (detailedError) throw detailedError;

    // Format response based on data source
    const formattedClicks = hasDetailedClicks
      ? clicks.map((click: any) => ({
          id: click.id,
          contact_id: click.contact?.id,
          email: click.contact?.email,
          first_name: click.contact?.first_name,
          last_name: click.contact?.last_name,
          organization_name: click.contact?.organization?.name,
          link_type: click.link_type,
          destination_url: click.destination_url,
          clicked_at: click.clicked_at,
          is_likely_bot: click.is_likely_bot,
        }))
      : clicks.map((click: any) => ({
          id: click.id,
          contact_id: click.contact?.id,
          email: click.contact?.email,
          first_name: click.contact?.first_name,
          last_name: click.contact?.last_name,
          organization_name: click.contact?.organization?.name,
          link_type: 'unknown', // Resend doesn't track which link
          destination_url: null,
          clicked_at: click.clicked_at,
          is_likely_bot: false,
        }));

    return NextResponse.json({
      success: true,
      clicks: formattedClicks,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching click activity:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch click activity' },
      { status: 500 }
    );
  }
}
