import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

// System templates with embedded HTML content
const SYSTEM_TEMPLATES: Record<string, {
  id: string;
  name: string;
  subject_line: string;
  body_template: string;
}> = {
  'system-daily-hit-website': {
    id: 'system-daily-hit-website',
    name: 'Daily Hit Website Email',
    subject_line: 'Your Daily Hit is Ready!',
    body_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-color: #f3f4f6; }
    .email-container { background: linear-gradient(to bottom, #ffffff, #f9fafb); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
    .header-text { color: #111827; }
    .subheader-text { color: #374151; }
    .body-text { color: #4b5563; }
    .muted-text { color: #6b7280; }
    .info-box { background: rgba(59, 130, 246, 0.08); }
    .info-box-text { color: #1e40af; }
    .warning-box { background: rgba(251, 146, 60, 0.08); }
    .warning-box-text { color: #c2410c; }
    .success-box { background: rgba(34, 197, 94, 0.08); }
    .success-box-text { color: #15803d; }
    .footer-border { border-top: 1px solid #e5e7eb; }
    .info-list-text { color: #374151; }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="padding: 40px 20px; background-color: #f3f4f6;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" class="email-container" style="border-radius: 16px; overflow: hidden; max-width: 600px; background: linear-gradient(to bottom, #ffffff, #f9fafb);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <a href="https://www.mindandmuscle.ai" style="display: block; text-decoration: none;">
                <img src="https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/New%20MM%20Logo-transparent%20(1).png" alt="Mind & Muscle" width="120" style="display: block; max-width: 120px; height: auto;">
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <h1 class="header-text" style="margin: 0 0 16px; font-size: 32px; font-weight: 900; color: #111827;">
                Your Daily Hit is Ready! 🎯
              </h1>
              <p class="subheader-text" style="margin: 0 0 8px; font-size: 18px; line-height: 1.6; color: #374151;">
                Start your day with 2 minutes of mental reps
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px;">
              <div class="success-box" style="border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; text-align: center; background: rgba(34, 197, 94, 0.08);">
                <p class="success-box-text" style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #15803d;">
                  {{ contentTitle }}
                </p>
                <img src="{{ contentThumbnail }}" alt="Daily Hit" style="width: 100%; max-width: 400px; border-radius: 12px; margin-top: 12px; display: block; margin-left: auto; margin-right: auto;">
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div class="warning-box" style="border-left: 4px solid #fb923c; padding: 16px; border-radius: 8px; background: rgba(251, 146, 60, 0.08);">
                <p class="warning-box-text" style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #c2410c;">
                  🔥 Today's Challenge:
                </p>
                <p class="info-list-text" style="margin: 0; font-size: 14px; line-height: 1.8; color: #374151;">
                  {{ contentChallenge }}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <a href="https://www.mindandmuscle.ai/daily-hit" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #fb923c); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);">
                🎧 Listen Now
              </a>
              <p class="body-text" style="margin: 12px 0 0; font-size: 14px; font-weight: 500; color: #4b5563;">
                Takes just 2 minutes
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div class="info-box" style="border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; background: rgba(59, 130, 246, 0.08);">
                <p class="info-box-text" style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #1e40af;">
                  📱 Want the full experience?
                </p>
                <p class="info-list-text" style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #374151;">
                  Get daily notifications at 8 AM, track your streaks, and access the full library of mental training content.
                </p>
                <div style="text-align: center;">
                  <a href="https://www.mindandmuscle.ai/download" style="display: inline-block; background: linear-gradient(to right, #1e40af, #3b82f6); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    📲 Download the App
                  </a>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="footer-border" style="padding: 30px 40px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700;">
                <span style="color: #3b82f6;">Discipline the Mind.</span> <span style="color: #fb923c;">Dominate the Game.</span>
              </p>
              <p class="body-text" style="margin: 0 0 16px; font-size: 14px; color: #4b5563;">
                100% Baseball. Zero Generic Content.
              </p>
              <p class="muted-text" style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
                © 2026 Mind & Muscle Performance. All rights reserved.
              </p>
              <p class="muted-text" style="margin: 0 0 8px; font-size: 11px; color: #6b7280;">
                <a href="https://www.mindandmuscle.ai/unsubscribe?token={{ unsubscribeToken }}" style="color: #3b82f6; text-decoration: underline;">Unsubscribe from Daily Hit emails</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  'system-daily-hit-followup': {
    id: 'system-daily-hit-followup',
    name: 'Daily Hit Follow-up',
    subject_line: 'Great job completing your Daily Hit!',
    body_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-color: #f3f4f6; }
    .email-container { background: linear-gradient(to bottom, #ffffff, #f9fafb); }
    .header-text { color: #111827; }
    .subheader-text { color: #374151; }
    .body-text { color: #4b5563; }
    .muted-text { color: #6b7280; }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px; background-color: #f3f4f6;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="border-radius: 16px; overflow: hidden; max-width: 600px; background: linear-gradient(to bottom, #ffffff, #f9fafb);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <a href="https://www.mindandmuscle.ai" style="display: block; text-decoration: none;">
                <img src="https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/New%20MM%20Logo-transparent%20(1).png" alt="Mind & Muscle" width="120" style="display: block; max-width: 120px; height: auto;">
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 900; color: #111827;">
                Great Job! 🎯
              </h1>
              <p style="margin: 0 0 8px; font-size: 18px; line-height: 1.6; color: #374151;">
                You completed today's Daily Hit
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; text-align: center; background: rgba(34, 197, 94, 0.08);">
                <p style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #15803d;">
                  {{ contentTitle }}
                </p>
                <img src="{{ contentThumbnail }}" alt="Daily Hit" style="width: 100%; max-width: 400px; border-radius: 12px; margin-top: 12px; display: block; margin-left: auto; margin-right: auto;">
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="border-left: 4px solid #fb923c; padding: 16px; border-radius: 8px; background: rgba(251, 146, 60, 0.08);">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #c2410c;">
                  🔥 Today's Challenge:
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #374151;">
                  {{ contentChallenge }}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; background: rgba(59, 130, 246, 0.08);">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #1e40af;">
                  💭 Got thoughts on this session?
                </p>
                <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #374151;">
                  Share your reflections in Dugout Talk and get personalized insights from your AI coach.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <a href="https://mindandmuscle.ai/dugout-talk" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #fb923c); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);">
                🗣️ Add Your Thoughts
              </a>
              <p style="margin: 12px 0 0; font-size: 14px; font-weight: 500; color: #4b5563;">
                Opens Dugout Talk in the app
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700;">
                <span style="color: #3b82f6;">Discipline the Mind.</span> <span style="color: #fb923c;">Dominate the Game.</span>
              </p>
              <p style="margin: 0 0 16px; font-size: 14px; color: #4b5563;">
                100% Baseball. Zero Generic Content.
              </p>
              <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
                © 2026 Mind & Muscle Performance. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  'system-content-reflection': {
    id: 'system-content-reflection',
    name: 'Content Reflection',
    subject_line: 'Reflect on Today\'s Session',
    body_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-color: #f3f4f6; }
    .email-container { background: linear-gradient(to bottom, #ffffff, #f9fafb); }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px; background-color: #f3f4f6;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="border-radius: 16px; overflow: hidden; max-width: 600px; background: linear-gradient(to bottom, #ffffff, #f9fafb);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <a href="https://www.mindandmuscle.ai" style="display: block; text-decoration: none;">
                <img src="https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/New%20MM%20Logo-transparent%20(1).png" alt="Mind & Muscle" width="120" style="display: block; max-width: 120px; height: auto;">
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 900; color: #111827;">
                Reflect on Today's Session 🌅
              </h1>
              <p style="margin: 0 0 8px; font-size: 18px; line-height: 1.6; color: #374151;">
                {{ contentTitle }}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 30px;">
              <img src="{{ contentThumbnail }}" alt="Session Content" style="width: 100%; max-width: 520px; border-radius: 12px; display: block;">
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; background: rgba(59, 130, 246, 0.08);">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #1e40af;">
                  💭 Take a moment to reflect:
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #374151;">
                  Process today's session with your personal AI coach in Dugout Talk. It's free and helps cement your mental training.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <a href="mindmuscle://dugout-talk?source=reflection&content={{ contentId }}" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #1e40af); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);">
                🗣️ Open Dugout Talk
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="border-left: 4px solid #fb923c; padding: 16px; border-radius: 8px; background: rgba(251, 146, 60, 0.08);">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #c2410c;">
                  📲 Share This Session:
                </p>
                <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #374151;">
                  Think a teammate could benefit? Share this session with them.
                </p>
                <a href="mindmuscle://content/{{ contentId }}" style="display: inline-block; background: linear-gradient(to right, #fb923c, #f97316); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Get Shareable Link
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700;">
                <span style="color: #3b82f6;">Discipline the Mind.</span> <span style="color: #fb923c;">Dominate the Game.</span>
              </p>
              <p style="margin: 0 0 16px; font-size: 14px; color: #4b5563;">
                100% Baseball. Zero Generic Content.
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                © 2026 Mind & Muscle Performance. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if it's a system template
    if (id.startsWith('system-')) {
      const systemTemplate = SYSTEM_TEMPLATES[id];
      if (!systemTemplate) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      // For system templates, return the metadata
      // The actual file content would need to be fetched from storage
      return NextResponse.json({
        success: true,
        template: {
          id: systemTemplate.id,
          name: systemTemplate.name,
          segment: 'user',
          sequence_step: 0,
          subject_line: systemTemplate.subject_line,
          body_template: systemTemplate.body_template,
          is_triggered: false,
          trigger_type: null,
          created_at: '2024-12-01T00:00:00Z',
          updated_at: '2024-12-01T00:00:00Z',
          category: 'system',
          source: 'file',
        },
        stats: {
          emails_sent: 0,
          emails_opened: 0,
          emails_clicked: 0,
          open_rate: 0,
          click_rate: 0,
        },
        campaigns: [],
        variables: [],
      });
    }

    // Check marketing_email_templates first
    const { data: marketingTemplate, error: marketingError } = await supabase
      .from('marketing_email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (marketingTemplate) {
      // Get stats based on template type
      let stats = {
        emails_sent: 0,
        emails_opened: 0,
        emails_clicked: 0,
        open_rate: 0,
        click_rate: 0,
      };

      let campaigns: Array<{ id: string; name: string; segment: string }> = [];

      if (marketingTemplate.is_triggered) {
        // Get triggered email stats
        const { data: sentEmails } = await supabase
          .from('triggered_emails_sent')
          .select('id, campaign_id')
          .eq('email_template_id', id);

        stats.emails_sent = sentEmails?.length || 0;

        // Get unique campaigns
        const campaignIds = [...new Set(sentEmails?.map(e => e.campaign_id) || [])];
        if (campaignIds.length > 0) {
          const { data: campaignData } = await supabase
            .from('marketing_campaigns')
            .select('id, name, segment')
            .in('id', campaignIds);
          campaigns = campaignData || [];
        }
      } else {
        // Get sequence template stats
        const { data: campaignData } = await supabase
          .from('marketing_campaigns')
          .select('id, name, segment')
          .eq('segment', marketingTemplate.segment);

        campaigns = campaignData || [];

        if (campaignData && campaignData.length > 0) {
          const { data: contacts } = await supabase
            .from('marketing_campaign_contacts')
            .select('sent_at, opened_at, clicked_at')
            .eq('sequence_step', marketingTemplate.sequence_step)
            .in('campaign_id', campaignData.map(c => c.id));

          const sent = contacts?.filter(c => c.sent_at).length || 0;
          const opened = contacts?.filter(c => c.opened_at).length || 0;
          const clicked = contacts?.filter(c => c.clicked_at).length || 0;

          stats = {
            emails_sent: sent,
            emails_opened: opened,
            emails_clicked: clicked,
            open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
            click_rate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
          };
        }
      }

      // Extract variables from template
      const variableMatches = marketingTemplate.body_template.match(/\{\{([^}]+)\}\}/g) || [];
      const uniqueMatches = Array.from(new Set(variableMatches)) as string[];
      const variables = uniqueMatches.map((v) => ({
        key: v.replace(/\{\{|\}\}/g, ''),
        found_count: (marketingTemplate.body_template.match(new RegExp(v.replace(/[{}]/g, '\\$&'), 'g')) || []).length,
      }));

      return NextResponse.json({
        success: true,
        template: {
          ...marketingTemplate,
          category: marketingTemplate.is_triggered ? 'triggered' : 'sequence',
          source: 'database',
        },
        stats,
        campaigns,
        variables,
      });
    }

    // Check lifecycle campaigns
    const { data: lifecycleTemplate, error: lifecycleError } = await supabase
      .from('user_lifecycle_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (lifecycleTemplate) {
      // Get lifecycle email stats
      const { data: emails } = await supabase
        .from('user_lifecycle_emails')
        .select('status')
        .eq('campaign_id', id);

      const sent = emails?.filter(e => ['sent', 'opened', 'clicked'].includes(e.status)).length || 0;
      const opened = emails?.filter(e => ['opened', 'clicked'].includes(e.status)).length || 0;
      const clicked = emails?.filter(e => e.status === 'clicked').length || 0;

      // Extract variables
      const variableMatches = lifecycleTemplate.body_template.match(/\{\{([^}]+)\}\}/g) || [];
      const uniqueVars = Array.from(new Set(variableMatches)) as string[];
      const variables = uniqueVars.map((v) => ({
        key: v.replace(/\{\{|\}\}/g, ''),
        found_count: (lifecycleTemplate.body_template.match(new RegExp(v.replace(/[{}]/g, '\\$&'), 'g')) || []).length,
      }));

      return NextResponse.json({
        success: true,
        template: {
          id: lifecycleTemplate.id,
          name: lifecycleTemplate.name,
          segment: lifecycleTemplate.campaign_type,
          sequence_step: lifecycleTemplate.sequence_step || 0,
          subject_line: lifecycleTemplate.subject_line,
          body_template: lifecycleTemplate.body_template,
          is_triggered: false,
          trigger_type: null,
          created_at: lifecycleTemplate.created_at,
          updated_at: lifecycleTemplate.updated_at || lifecycleTemplate.created_at,
          category: 'lifecycle',
          source: 'database',
          is_active: lifecycleTemplate.is_active,
          campaign_type: lifecycleTemplate.campaign_type,
          trigger_type_lifecycle: lifecycleTemplate.trigger_type,
        },
        stats: {
          emails_sent: sent,
          emails_opened: opened,
          emails_clicked: clicked,
          open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
          click_rate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
        },
        campaigns: [],
        variables,
      });
    }

    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  } catch (error) {
    console.error('Template detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// Update template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { subject_line, body_template, category } = body;

    // Determine which table to update
    if (category === 'lifecycle') {
      const { error } = await supabase
        .from('user_lifecycle_campaigns')
        .update({
          subject_line,
          body_template,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } else if (category === 'system') {
      // System templates are file-based - can't be edited through API
      return NextResponse.json(
        { error: 'System templates cannot be edited through the admin panel' },
        { status: 400 }
      );
    } else {
      // Marketing templates (sequence and triggered)
      const { error } = await supabase
        .from('marketing_email_templates')
        .update({
          subject_line,
          body_template,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}
