import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

export async function GET(request: NextRequest) {
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all campaigns with analytics
    const { data: campaigns, error: campaignsError } = await supabase
      .from('user_lifecycle_campaigns')
      .select('*')
      .order('campaign_type')
      .order('sequence_step');

    if (campaignsError) throw campaignsError;

    // Get email stats for each campaign
    const campaignsWithStats = await Promise.all(
      (campaigns || []).map(async (campaign) => {
        const { data: stats } = await supabase
          .from('user_lifecycle_emails')
          .select('status')
          .eq('campaign_id', campaign.id);

        const sent = stats?.filter(s => ['sent', 'opened', 'clicked'].includes(s.status)).length || 0;
        const opened = stats?.filter(s => ['opened', 'clicked'].includes(s.status)).length || 0;
        const clicked = stats?.filter(s => s.status === 'clicked').length || 0;

        return {
          ...campaign,
          stats: {
            sent,
            opened,
            clicked,
            openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
            clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
          },
        };
      })
    );

    // Get recent campaign runs
    const { data: recentRuns } = await supabase
      .from('user_lifecycle_campaign_runs')
      .select('*, campaign:user_lifecycle_campaigns(name, campaign_type)')
      .order('started_at', { ascending: false })
      .limit(20);

    // Get overall stats
    const { data: overallStats } = await supabase
      .from('user_lifecycle_emails')
      .select('status, sent_at');

    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const stats7d = overallStats?.filter(s => s.sent_at && s.sent_at >= last7Days) || [];
    const stats30d = overallStats?.filter(s => s.sent_at && s.sent_at >= last30Days) || [];

    // Get partner promo impressions
    const { data: partnerImpressions } = await supabase
      .from('partner_promo_impressions')
      .select('touchpoint, shown_at')
      .gte('shown_at', last30Days);

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats,
      recentRuns,
      overview: {
        totalCampaigns: campaigns?.length || 0,
        activeCampaigns: campaigns?.filter(c => c.is_active).length || 0,
        emailsSent7d: stats7d.length,
        emailsSent30d: stats30d.length,
        openRate7d: stats7d.length > 0
          ? Math.round((stats7d.filter(s => ['opened', 'clicked'].includes(s.status)).length / stats7d.length) * 100)
          : 0,
        partnerPromos30d: partnerImpressions?.length || 0,
      },
    });
  } catch (error) {
    console.error('Lifecycle campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// Trigger a campaign send
export async function POST(request: NextRequest) {
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, campaign_id, campaign_type, user_id, dry_run } = body;

    if (action === 'send') {
      // Call the edge function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-user-lifecycle-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            campaign_id,
            campaign_type,
            user_id,
            dry_run: dry_run || false,
            triggered_by: `admin:manual`,
          }),
        }
      );

      const result = await response.json();
      return NextResponse.json(result);
    }

    if (action === 'toggle') {
      // Toggle campaign active status
      const { data: campaign } = await supabase
        .from('user_lifecycle_campaigns')
        .select('is_active')
        .eq('id', campaign_id)
        .single();

      if (campaign) {
        await supabase
          .from('user_lifecycle_campaigns')
          .update({ is_active: !campaign.is_active })
          .eq('id', campaign_id);
      }

      return NextResponse.json({ success: true, is_active: !campaign?.is_active });
    }

    if (action === 'preview') {
      // Get campaign and render preview
      const { data: campaign } = await supabase
        .from('user_lifecycle_campaigns')
        .select('*')
        .eq('id', campaign_id)
        .single();

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      // Sample variables for preview
      const sampleVariables: Record<string, string> = {
        first_name: 'Alex',
        full_name: 'Alex Johnson',
        tier: 'pro',
        trial_days_remaining: '3',
        features_used: '5',
        last_feature: 'Swing Lab',
        streak_count: '12',
        app_url: 'https://mindandmuscle.ai/download',
        partner_link: 'https://mindandmuscle.ai/partner-program?ref=sample',
        current_year: new Date().getFullYear().toString(),
      };

      let previewSubject = campaign.subject_line;
      let previewBody = campaign.body_template;

      for (const [key, value] of Object.entries(sampleVariables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        previewSubject = previewSubject.replace(regex, value);
        previewBody = previewBody.replace(regex, value);
      }

      return NextResponse.json({
        success: true,
        preview: {
          subject: previewSubject,
          body: previewBody,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Lifecycle campaign action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}

// Update campaign
export async function PATCH(request: NextRequest) {
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { error } = await supabase
      .from('user_lifecycle_campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
