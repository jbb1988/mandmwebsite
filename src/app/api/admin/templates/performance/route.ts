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
    // Get all templates
    const { data: templates, error: templatesError } = await supabase
      .from('marketing_email_templates')
      .select('id, name, segment, sequence_step, subject_line')
      .order('segment')
      .order('sequence_step');

    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      return NextResponse.json({ success: false, message: 'Failed to fetch templates' }, { status: 500 });
    }

    // Get campaign contact stats grouped by campaign (which links to templates via segment + sequence_step)
    const { data: campaignStats, error: statsError } = await supabase
      .from('marketing_campaigns')
      .select(`
        id,
        name,
        segment,
        sequence_step,
        emails_sent,
        emails_opened,
        emails_clicked,
        replies_received
      `);

    if (statsError) {
      console.error('Error fetching campaign stats:', statsError);
    }

    // Get detailed metrics per campaign from campaign_contacts
    const { data: detailedStats, error: detailedError } = await supabase
      .from('marketing_campaign_contacts')
      .select(`
        campaign_id,
        status,
        sent_at,
        opened_at,
        clicked_at,
        replied_at,
        reply_sentiment,
        campaign:marketing_campaigns!inner(segment, sequence_step)
      `)
      .not('sent_at', 'is', null);

    if (detailedError) {
      console.error('Error fetching detailed stats:', detailedError);
    }

    // Get Calendly bookings per campaign
    const { data: bookingStats, error: bookingError } = await supabase
      .from('calendly_bookings')
      .select('campaign_id, status')
      .not('campaign_id', 'is', null);

    if (bookingError) {
      console.error('Error fetching bookings:', bookingError);
    }

    // Aggregate stats by template (segment + sequence_step)
    const templateStatsMap = new Map<string, {
      templateId: string;
      templateName: string;
      segment: string;
      sequenceStep: number;
      subjectLine: string;
      totalSent: number;
      totalOpened: number;
      totalClicked: number;
      totalReplied: number;
      totalBookings: number;
      positiveReplies: number;
      negativeReplies: number;
      neutralReplies: number;
      campaigns: number;
    }>();

    // Initialize with templates
    for (const template of templates || []) {
      const key = `${template.segment}_${template.sequence_step}`;
      templateStatsMap.set(key, {
        templateId: template.id,
        templateName: template.name || `Step ${template.sequence_step}`,
        segment: template.segment,
        sequenceStep: template.sequence_step,
        subjectLine: template.subject_line || '',
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalReplied: 0,
        totalBookings: 0,
        positiveReplies: 0,
        negativeReplies: 0,
        neutralReplies: 0,
        campaigns: 0,
      });
    }

    // Aggregate from campaign stats
    for (const campaign of campaignStats || []) {
      const key = `${campaign.segment}_${campaign.sequence_step || 1}`;
      const stats = templateStatsMap.get(key);
      if (stats) {
        stats.totalSent += campaign.emails_sent || 0;
        stats.totalOpened += campaign.emails_opened || 0;
        stats.totalClicked += campaign.emails_clicked || 0;
        stats.totalReplied += campaign.replies_received || 0;
        stats.campaigns += 1;
      }
    }

    // Count sentiment from detailed stats
    for (const contact of detailedStats || []) {
      const campaign = contact.campaign as any;
      if (!campaign) continue;
      const key = `${campaign.segment}_${campaign.sequence_step || 1}`;
      const stats = templateStatsMap.get(key);
      if (stats && contact.replied_at) {
        if (contact.reply_sentiment === 'positive') stats.positiveReplies++;
        else if (contact.reply_sentiment === 'negative') stats.negativeReplies++;
        else if (contact.reply_sentiment === 'neutral') stats.neutralReplies++;
      }
    }

    // Count bookings per campaign -> template
    const bookingsByCampaign = new Map<string, number>();
    for (const booking of bookingStats || []) {
      if (booking.campaign_id && booking.status !== 'canceled') {
        bookingsByCampaign.set(
          booking.campaign_id,
          (bookingsByCampaign.get(booking.campaign_id) || 0) + 1
        );
      }
    }

    // Map bookings back to templates
    for (const campaign of campaignStats || []) {
      const key = `${campaign.segment}_${campaign.sequence_step || 1}`;
      const stats = templateStatsMap.get(key);
      if (stats) {
        stats.totalBookings += bookingsByCampaign.get(campaign.id) || 0;
      }
    }

    // Calculate rates and format response
    const performanceData = Array.from(templateStatsMap.values()).map(stats => ({
      ...stats,
      openRate: stats.totalSent > 0 ? Math.round((stats.totalOpened / stats.totalSent) * 1000) / 10 : 0,
      clickRate: stats.totalSent > 0 ? Math.round((stats.totalClicked / stats.totalSent) * 1000) / 10 : 0,
      replyRate: stats.totalSent > 0 ? Math.round((stats.totalReplied / stats.totalSent) * 1000) / 10 : 0,
      bookingRate: stats.totalSent > 0 ? Math.round((stats.totalBookings / stats.totalSent) * 1000) / 10 : 0,
      positiveReplyRate: stats.totalReplied > 0 ? Math.round((stats.positiveReplies / stats.totalReplied) * 100) : 0,
    }));

    // Sort by reply rate descending (best performing first)
    performanceData.sort((a, b) => b.replyRate - a.replyRate);

    // Summary stats
    const summary = {
      totalTemplates: performanceData.length,
      totalSent: performanceData.reduce((sum, t) => sum + t.totalSent, 0),
      totalReplies: performanceData.reduce((sum, t) => sum + t.totalReplied, 0),
      totalBookings: performanceData.reduce((sum, t) => sum + t.totalBookings, 0),
      avgOpenRate: performanceData.length > 0
        ? Math.round(performanceData.reduce((sum, t) => sum + t.openRate, 0) / performanceData.length * 10) / 10
        : 0,
      avgReplyRate: performanceData.length > 0
        ? Math.round(performanceData.reduce((sum, t) => sum + t.replyRate, 0) / performanceData.length * 10) / 10
        : 0,
      bestPerformer: performanceData.find(t => t.totalSent > 10) || null,
    };

    return NextResponse.json({
      success: true,
      templates: performanceData,
      summary,
    });
  } catch (error) {
    console.error('Template performance error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch template performance' }, { status: 500 });
  }
}
