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
    // Fetch all campaigns with calculated rates
    const { data: campaigns, error: campaignsError } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campaignsError) throw campaignsError;

    // Calculate rates and fetch breakdowns for each campaign
    const campaignsWithDetails = await Promise.all(
      (campaigns || []).map(async (campaign) => {
        // Calculate rates
        const openRate = campaign.emails_sent > 0
          ? Math.round((campaign.emails_opened / campaign.emails_sent) * 100 * 10) / 10
          : 0;
        const clickRate = campaign.emails_sent > 0
          ? Math.round((campaign.emails_clicked / campaign.emails_sent) * 100 * 10) / 10
          : 0;
        const replyRate = campaign.emails_sent > 0
          ? Math.round((campaign.replies_received / campaign.emails_sent) * 100 * 10) / 10
          : 0;

        // Get status breakdown for this campaign
        const { data: statusData } = await supabase
          .from('marketing_campaign_contacts')
          .select('status')
          .eq('campaign_id', campaign.id);

        const statusBreakdown = {
          pending: 0,
          sent: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
        };
        statusData?.forEach((row) => {
          if (row.status in statusBreakdown) {
            statusBreakdown[row.status as keyof typeof statusBreakdown]++;
          }
        });

        // Get sequence step breakdown
        const { data: sequenceData } = await supabase
          .from('marketing_campaign_contacts')
          .select('sequence_step')
          .eq('campaign_id', campaign.id);

        const sequenceBreakdown = { step1: 0, step2: 0, step3: 0, step4: 0 };
        sequenceData?.forEach((row) => {
          const step = row.sequence_step;
          if (step >= 1 && step <= 4) {
            sequenceBreakdown[`step${step}` as keyof typeof sequenceBreakdown]++;
          }
        });

        // Get recent activity (last 5 opens/clicks/replies)
        const { data: recentActivity } = await supabase
          .from('marketing_campaign_contacts')
          .select(`
            status,
            opened_at,
            clicked_at,
            replied_at,
            contact_id,
            marketing_contacts!inner(email)
          `)
          .eq('campaign_id', campaign.id)
          .or('opened_at.not.is.null,clicked_at.not.is.null,replied_at.not.is.null')
          .order('updated_at', { ascending: false })
          .limit(5);

        const formattedActivity = (recentActivity || []).map((row: any) => ({
          type: row.replied_at ? 'replied' : row.clicked_at ? 'clicked' : 'opened',
          email: row.marketing_contacts?.email || 'Unknown',
          timestamp: row.replied_at || row.clicked_at || row.opened_at,
        }));

        // Get link click breakdown (from our tracking)
        const { data: linkClicks } = await supabase
          .from('email_link_clicks')
          .select('link_type, is_likely_bot')
          .eq('campaign_id', campaign.id);

        const clickBreakdown = {
          cta_calendly: 0,
          logo: 0,
          unsubscribe: 0,
          other: 0,
          bot_clicks: 0,
          human_clicks: 0,
        };
        linkClicks?.forEach((click: any) => {
          if (click.is_likely_bot) {
            clickBreakdown.bot_clicks++;
          } else {
            clickBreakdown.human_clicks++;
            const linkType = click.link_type || 'other';
            if (linkType in clickBreakdown) {
              clickBreakdown[linkType as keyof typeof clickBreakdown]++;
            } else {
              clickBreakdown.other++;
            }
          }
        });

        // Get Calendly bookings for this campaign
        const { data: calendlyBookings } = await supabase
          .from('calendly_bookings')
          .select('status')
          .eq('campaign_id', campaign.id);

        const calendlyBreakdown = {
          total: calendlyBookings?.length || 0,
          scheduled: calendlyBookings?.filter((b: any) => b.status === 'scheduled').length || 0,
          completed: calendlyBookings?.filter((b: any) => b.status === 'completed').length || 0,
          canceled: calendlyBookings?.filter((b: any) => b.status === 'canceled').length || 0,
        };

        return {
          ...campaign,
          open_rate: openRate,
          click_rate: clickRate,
          reply_rate: replyRate,
          statusBreakdown,
          sequenceBreakdown,
          recentActivity: formattedActivity,
          clickBreakdown,
          calendlyBreakdown,
        };
      })
    );

    // Calculate summary stats
    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
    const totalContacts = campaigns?.reduce((sum, c) => sum + (c.total_contacts || 0), 0) || 0;
    const totalSent = campaigns?.reduce((sum, c) => sum + (c.emails_sent || 0), 0) || 0;
    const totalOpened = campaigns?.reduce((sum, c) => sum + (c.emails_opened || 0), 0) || 0;
    const totalClicked = campaigns?.reduce((sum, c) => sum + (c.emails_clicked || 0), 0) || 0;
    const overallOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100 * 10) / 10 : 0;
    const overallClickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100 * 10) / 10 : 0;

    // Get scheduled emails count (next 24h and 7d)
    const now = new Date().toISOString();
    const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const in7d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { count: scheduled24h } = await supabase
      .from('marketing_campaign_contacts')
      .select('*', { count: 'exact', head: true })
      .gt('next_send_at', now)
      .lte('next_send_at', in24h);

    const { count: scheduled7d } = await supabase
      .from('marketing_campaign_contacts')
      .select('*', { count: 'exact', head: true })
      .gt('next_send_at', now)
      .lte('next_send_at', in7d);

    // Get upcoming sends (next 48h) with contact details
    const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const { data: upcomingSends } = await supabase
      .from('marketing_campaign_contacts')
      .select(`
        next_send_at,
        sequence_step,
        campaign_id,
        marketing_contacts!inner(email),
        marketing_campaigns!inner(name)
      `)
      .gt('next_send_at', now)
      .lte('next_send_at', in48h)
      .in('status', ['sent', 'opened', 'clicked'])
      .order('next_send_at', { ascending: true })
      .limit(50);

    const formattedUpcoming = (upcomingSends || []).map((row: any) => ({
      contact_email: row.marketing_contacts?.email || 'Unknown',
      campaign_name: row.marketing_campaigns?.name || 'Unknown',
      sequence_step: row.sequence_step,
      next_send_at: row.next_send_at,
    }));

    // Email-to-user cross-reference: check if any campaign contacts are app users
    const { data: conversionData } = await supabase.rpc('get_campaign_user_conversions');

    // Get total tracked clicks vs bot clicks from new tracking system
    const { data: detailedClickData } = await supabase
      .from('email_link_clicks')
      .select('is_likely_bot');

    // Also get clicks from Resend webhook data (marketing_outreach_activities)
    const { data: resendClickData } = await supabase
      .from('marketing_outreach_activities')
      .select('contact_id')
      .eq('activity_type', 'email_clicked');

    // Use detailed tracking if available, otherwise use Resend data
    const hasDetailedTracking = (detailedClickData?.length || 0) > 0;

    let totalTrackedClicks: number;
    let totalBotClicks: number;
    let totalHumanClicks: number;
    let clickDataSource: string;

    if (hasDetailedTracking) {
      // Use detailed tracking with bot detection
      totalTrackedClicks = detailedClickData?.length || 0;
      totalBotClicks = detailedClickData?.filter((c: any) => c.is_likely_bot).length || 0;
      totalHumanClicks = totalTrackedClicks - totalBotClicks;
      clickDataSource = 'detailed';
    } else {
      // Fall back to Resend webhook data (no bot detection)
      totalTrackedClicks = resendClickData?.length || 0;
      totalBotClicks = 0; // Resend doesn't distinguish bots
      totalHumanClicks = new Set(resendClickData?.map((c: any) => c.contact_id)).size; // Unique clickers
      clickDataSource = 'resend';
    }

    // Get total Calendly bookings
    const { count: totalCalendlyBookings } = await supabase
      .from('calendly_bookings')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithDetails,
      summary: {
        totalCampaigns,
        activeCampaigns,
        totalContacts,
        totalSent,
        overallOpenRate,
        overallClickRate,
        scheduledNext24h: scheduled24h || 0,
        scheduledNext7d: scheduled7d || 0,
      },
      conversionFunnel: {
        contactsInApp: conversionData?.contacts_in_app || 0,
        usersFromDomains: conversionData?.users_from_domains || 0,
        totalTrackedClicks,
        humanClicks: totalHumanClicks,
        botClicks: totalBotClicks,
        calendlyBookings: totalCalendlyBookings || 0,
        clickDataSource, // 'detailed' = new tracking, 'resend' = webhook data
      },
      upcomingSends: formattedUpcoming,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch campaigns' }, { status: 500 });
  }
}
