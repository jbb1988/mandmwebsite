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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id: campaignId } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = (page - 1) * limit;

  try {
    // First check for detailed clicks in email_link_clicks (new tracking with bot detection)
    const { data: detailedClicks, count: detailedCount } = await supabase
      .from('email_link_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    const hasDetailedClicks = (detailedCount || 0) > 0;

    if (hasDetailedClicks) {
      // Use detailed tracking with bot detection
      const { data: clicks, error, count } = await supabase
        .from('email_link_clicks')
        .select(`
          id,
          contact_id,
          link_type,
          destination_url,
          clicked_at,
          is_likely_bot
        `, { count: 'exact' })
        .eq('campaign_id', campaignId)
        .eq('is_likely_bot', false)
        .order('clicked_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get contact details separately
      const contactIds = [...new Set(clicks?.map(c => c.contact_id).filter(Boolean))];
      const { data: contacts } = await supabase
        .from('marketing_contacts')
        .select('id, email, first_name, last_name, organization_id')
        .in('id', contactIds.length > 0 ? contactIds : ['00000000-0000-0000-0000-000000000000']);

      // Get organization names
      const orgIds = [...new Set(contacts?.map(c => c.organization_id).filter(Boolean))];
      const { data: orgs } = await supabase
        .from('marketing_organizations')
        .select('id, name')
        .in('id', orgIds.length > 0 ? orgIds : ['00000000-0000-0000-0000-000000000000']);

      const contactMap = new Map(contacts?.map(c => [c.id, c]) || []);
      const orgMap = new Map(orgs?.map(o => [o.id, o.name]) || []);

      const formattedClicks = clicks?.map(click => {
        const contact = contactMap.get(click.contact_id);
        return {
          id: click.id,
          contact_id: click.contact_id,
          email: contact?.email || 'Unknown',
          first_name: contact?.first_name || '',
          last_name: contact?.last_name || '',
          organization_name: contact?.organization_id ? orgMap.get(contact.organization_id) : null,
          link_type: click.link_type,
          destination_url: click.destination_url,
          clicked_at: click.clicked_at,
          is_likely_bot: click.is_likely_bot,
        };
      }) || [];

      // Get stats
      const { data: allClicks } = await supabase
        .from('email_link_clicks')
        .select('link_type, is_likely_bot, contact_id')
        .eq('campaign_id', campaignId);

      const stats = {
        total: allClicks?.length || 0,
        human: allClicks?.filter(c => !c.is_likely_bot).length || 0,
        bot: allClicks?.filter(c => c.is_likely_bot).length || 0,
        uniqueClickers: new Set(allClicks?.filter(c => !c.is_likely_bot).map(c => c.contact_id)).size,
        byLinkType: {
          cta_calendly: allClicks?.filter(c => !c.is_likely_bot && c.link_type === 'cta_calendly').length || 0,
          logo: allClicks?.filter(c => !c.is_likely_bot && c.link_type === 'logo').length || 0,
          unsubscribe: allClicks?.filter(c => !c.is_likely_bot && c.link_type === 'unsubscribe').length || 0,
        },
        dataSource: 'detailed' as const,
      };

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
    }

    // Fall back to campaign_contacts with clicked_at (from Resend webhooks)
    const { data: clickedContacts, error, count } = await supabase
      .from('marketing_campaign_contacts')
      .select('id, contact_id, clicked_at', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .not('clicked_at', 'is', null)
      .order('clicked_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get contact details separately
    const contactIds = [...new Set(clickedContacts?.map(c => c.contact_id).filter(Boolean))];
    const { data: contacts } = await supabase
      .from('marketing_contacts')
      .select('id, email, first_name, last_name, organization_id')
      .in('id', contactIds.length > 0 ? contactIds : ['00000000-0000-0000-0000-000000000000']);

    // Get organization names
    const orgIds = [...new Set(contacts?.map(c => c.organization_id).filter(Boolean))];
    const { data: orgs } = await supabase
      .from('marketing_organizations')
      .select('id, name')
      .in('id', orgIds.length > 0 ? orgIds : ['00000000-0000-0000-0000-000000000000']);

    const contactMap = new Map(contacts?.map(c => [c.id, c]) || []);
    const orgMap = new Map(orgs?.map(o => [o.id, o.name]) || []);

    const formattedClicks = clickedContacts?.map(click => {
      const contact = contactMap.get(click.contact_id);
      return {
        id: click.id,
        contact_id: click.contact_id,
        email: contact?.email || 'Unknown',
        first_name: contact?.first_name || '',
        last_name: contact?.last_name || '',
        organization_name: contact?.organization_id ? orgMap.get(contact.organization_id) : null,
        link_type: 'unknown',
        destination_url: null,
        clicked_at: click.clicked_at,
        is_likely_bot: false,
      };
    }) || [];

    const stats = {
      total: count || 0,
      human: count || 0,
      bot: 0,
      uniqueClickers: count || 0,
      byLinkType: {},
      dataSource: 'resend' as const,
    };

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
