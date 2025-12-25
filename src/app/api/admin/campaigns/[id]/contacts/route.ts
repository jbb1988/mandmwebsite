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
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  try {
    // Build query for campaign contacts with related data
    let query = supabase
      .from('marketing_campaign_contacts')
      .select(`
        id,
        sequence_step,
        status,
        sent_at,
        opened_at,
        clicked_at,
        replied_at,
        bounced_at,
        unsubscribed_at,
        next_send_at,
        reply_sentiment,
        created_at,
        contact:marketing_contacts!inner(
          id,
          first_name,
          last_name,
          email,
          title,
          organization:marketing_organizations(
            id,
            name
          )
        )
      `, { count: 'exact' })
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: contacts, error, count } = await query;

    if (error) throw error;

    // Get status breakdown for this campaign
    const { data: statusBreakdown } = await supabase
      .from('marketing_campaign_contacts')
      .select('status')
      .eq('campaign_id', campaignId);

    const statusCounts = {
      total: statusBreakdown?.length || 0,
      pending: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      call_booked: 0,
    };

    statusBreakdown?.forEach((row) => {
      const s = row.status as keyof typeof statusCounts;
      if (s in statusCounts && s !== 'total') {
        statusCounts[s]++;
      }
    });

    // Get click activity for these contacts
    const contactIds = contacts?.map((c: any) => c.contact?.id).filter(Boolean) || [];

    let clickData: any[] = [];
    if (contactIds.length > 0) {
      const { data: clicks } = await supabase
        .from('email_link_clicks')
        .select('contact_id, link_type, clicked_at, is_likely_bot')
        .eq('campaign_id', campaignId)
        .in('contact_id', contactIds)
        .eq('is_likely_bot', false);

      clickData = clicks || [];
    }

    // Map click data to contacts
    const clicksByContact = clickData.reduce((acc: any, click: any) => {
      if (!acc[click.contact_id]) {
        acc[click.contact_id] = [];
      }
      acc[click.contact_id].push(click);
      return acc;
    }, {});

    // Format response
    const formattedContacts = contacts?.map((cc: any) => ({
      id: cc.id,
      contact_id: cc.contact?.id,
      email: cc.contact?.email,
      first_name: cc.contact?.first_name,
      last_name: cc.contact?.last_name,
      title: cc.contact?.title,
      organization_name: cc.contact?.organization?.name,
      organization_id: cc.contact?.organization?.id,
      sequence_step: cc.sequence_step,
      status: cc.status,
      sent_at: cc.sent_at,
      opened_at: cc.opened_at,
      clicked_at: cc.clicked_at,
      replied_at: cc.replied_at,
      bounced_at: cc.bounced_at,
      unsubscribed_at: cc.unsubscribed_at,
      next_send_at: cc.next_send_at,
      reply_sentiment: cc.reply_sentiment,
      created_at: cc.created_at,
      clicks: clicksByContact[cc.contact?.id] || [],
    })) || [];

    return NextResponse.json({
      success: true,
      contacts: formattedContacts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      statusCounts,
    });
  } catch (error) {
    console.error('Error fetching campaign contacts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch campaign contacts' },
      { status: 500 }
    );
  }
}
