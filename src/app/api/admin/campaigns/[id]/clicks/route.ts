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
    // Build query for click activity
    let query = supabase
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
      query = query.eq('is_likely_bot', false);
    }

    // Filter by link type if provided
    if (linkType && linkType !== 'all') {
      query = query.eq('link_type', linkType);
    }

    const { data: clicks, error, count } = await query;

    if (error) throw error;

    // Get click statistics
    const { data: allClicks } = await supabase
      .from('email_link_clicks')
      .select('link_type, is_likely_bot, contact_id')
      .eq('campaign_id', campaignId);

    const stats = {
      total: allClicks?.length || 0,
      human: allClicks?.filter((c: any) => !c.is_likely_bot).length || 0,
      bot: allClicks?.filter((c: any) => c.is_likely_bot).length || 0,
      uniqueClickers: new Set(allClicks?.filter((c: any) => !c.is_likely_bot).map((c: any) => c.contact_id)).size,
      byLinkType: {
        cta_calendly: allClicks?.filter((c: any) => !c.is_likely_bot && c.link_type === 'cta_calendly').length || 0,
        cta_website: allClicks?.filter((c: any) => !c.is_likely_bot && c.link_type === 'cta_website').length || 0,
        logo: allClicks?.filter((c: any) => !c.is_likely_bot && c.link_type === 'logo').length || 0,
        unsubscribe: allClicks?.filter((c: any) => !c.is_likely_bot && c.link_type === 'unsubscribe').length || 0,
        other: allClicks?.filter((c: any) => !c.is_likely_bot && !['cta_calendly', 'cta_website', 'logo', 'unsubscribe'].includes(c.link_type)).length || 0,
      },
    };

    // Format response
    const formattedClicks = clicks?.map((click: any) => ({
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
    })) || [];

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
