import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

interface TemplateStats {
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  open_rate: number;
  click_rate: number;
}

interface Template {
  id: string;
  name: string;
  segment: string;
  sequence_step: number;
  subject_line: string;
  body_template: string;
  is_triggered: boolean;
  trigger_type: string | null;
  created_at: string;
  updated_at: string;
  category: 'sequence' | 'triggered' | 'lifecycle' | 'system';
  source: 'database' | 'file';
  stats?: TemplateStats;
}

// File-based system templates with embedded HTML content
const SYSTEM_TEMPLATES = [
  {
    id: 'system-daily-hit-website',
    name: 'Daily Hit Website Email',
    segment: 'user',
    sequence_step: 0,
    subject_line: 'Your Daily Hit is Ready!',
    body_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
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
                Your Daily Hit is Ready! 🎯
              </h1>
              <p style="margin: 0 0 8px; font-size: 18px; line-height: 1.6; color: #374151;">
                Start your day with 2 minutes of mental reps
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
            <td align="center" style="padding: 30px 40px;">
              <a href="https://www.mindandmuscle.ai/daily-hit" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #fb923c); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px;">
                🎧 Listen Now
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700;">
                <span style="color: #3b82f6;">Discipline the Mind.</span> <span style="color: #fb923c;">Dominate the Game.</span>
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
    is_triggered: false,
    trigger_type: null,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    category: 'system' as const,
    source: 'file' as const,
  },
  {
    id: 'system-daily-hit-followup',
    name: 'Daily Hit Follow-up',
    segment: 'user',
    sequence_step: 0,
    subject_line: 'Great job completing your Daily Hit!',
    body_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
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
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; background: rgba(59, 130, 246, 0.08);">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #1e40af;">
                  💭 Got thoughts on this session?
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
                  Share your reflections in Dugout Talk and get personalized insights from your AI coach.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <a href="https://mindandmuscle.ai/dugout-talk" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #fb923c); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px;">
                🗣️ Add Your Thoughts
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700;">
                <span style="color: #3b82f6;">Discipline the Mind.</span> <span style="color: #fb923c;">Dominate the Game.</span>
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
    is_triggered: false,
    trigger_type: null,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    category: 'system' as const,
    source: 'file' as const,
  },
  {
    id: 'system-content-reflection',
    name: 'Content Reflection',
    segment: 'user',
    sequence_step: 0,
    subject_line: 'Reflect on Today\'s Session',
    body_template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
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
              <a href="mindmuscle://dugout-talk?source=reflection&content={{ contentId }}" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #1e40af); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px;">
                🗣️ Open Dugout Talk
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700;">
                <span style="color: #3b82f6;">Discipline the Mind.</span> <span style="color: #fb923c;">Dominate the Game.</span>
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
    is_triggered: false,
    trigger_type: null,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    category: 'system' as const,
    source: 'file' as const,
  },
];

export async function GET(request: NextRequest) {
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const segment = searchParams.get('segment');
    const includeStats = searchParams.get('includeStats') === 'true';

    // Fetch marketing email templates (sequence + triggered)
    let query = supabase
      .from('marketing_email_templates')
      .select('*')
      .order('segment')
      .order('sequence_step');

    if (segment) {
      query = query.eq('segment', segment);
    }

    const { data: marketingTemplates, error: marketingError } = await query;
    if (marketingError) throw marketingError;

    // Fetch lifecycle campaign templates
    const { data: lifecycleTemplates, error: lifecycleError } = await supabase
      .from('user_lifecycle_campaigns')
      .select('id, name, campaign_type, subject_line, body_template, created_at, is_active')
      .order('campaign_type')
      .order('sequence_step');

    if (lifecycleError) throw lifecycleError;

    // Transform marketing templates
    const transformedMarketing: Template[] = (marketingTemplates || []).map(t => ({
      ...t,
      category: t.is_triggered ? 'triggered' : 'sequence',
      source: 'database',
    }));

    // Transform lifecycle templates
    const transformedLifecycle: Template[] = (lifecycleTemplates || []).map(t => ({
      id: t.id,
      name: t.name,
      segment: t.campaign_type,
      sequence_step: 0,
      subject_line: t.subject_line,
      body_template: t.body_template,
      is_triggered: false,
      trigger_type: null,
      created_at: t.created_at,
      updated_at: t.created_at,
      category: 'lifecycle',
      source: 'database',
    }));

    // Add system templates
    const systemTemplates: Template[] = SYSTEM_TEMPLATES.map(t => ({
      ...t,
      stats: undefined,
    }));

    // Combine all templates based on category filter
    let allTemplates: Template[] = [];

    if (category === 'all' || category === 'sequence') {
      allTemplates = [...allTemplates, ...transformedMarketing.filter(t => t.category === 'sequence')];
    }
    if (category === 'all' || category === 'triggered') {
      allTemplates = [...allTemplates, ...transformedMarketing.filter(t => t.category === 'triggered')];
    }
    if (category === 'all' || category === 'lifecycle') {
      allTemplates = [...allTemplates, ...transformedLifecycle];
    }
    if (category === 'all' || category === 'system') {
      allTemplates = [...allTemplates, ...systemTemplates];
    }

    // Add stats if requested
    if (includeStats) {
      // Get stats for sequence templates
      const sequenceTemplates = allTemplates.filter(t => t.category === 'sequence');
      for (const template of sequenceTemplates) {
        const { data: contacts } = await supabase
          .from('marketing_campaign_contacts')
          .select('sent_at, opened_at, clicked_at')
          .eq('sequence_step', template.sequence_step)
          .in('campaign_id', (await supabase
            .from('marketing_campaigns')
            .select('id')
            .eq('segment', template.segment)).data?.map(c => c.id) || []);

        const sent = contacts?.filter(c => c.sent_at).length || 0;
        const opened = contacts?.filter(c => c.opened_at).length || 0;
        const clicked = contacts?.filter(c => c.clicked_at).length || 0;

        template.stats = {
          emails_sent: sent,
          emails_opened: opened,
          emails_clicked: clicked,
          open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
          click_rate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
        };
      }

      // Get stats for triggered templates
      const triggeredTemplates = allTemplates.filter(t => t.category === 'triggered');
      for (const template of triggeredTemplates) {
        const { data: sentEmails } = await supabase
          .from('triggered_emails_sent')
          .select('id')
          .eq('email_template_id', template.id);

        template.stats = {
          emails_sent: sentEmails?.length || 0,
          emails_opened: 0,
          emails_clicked: 0,
          open_rate: 0,
          click_rate: 0,
        };
      }

      // Get stats for lifecycle templates
      const lifecycleTemplatesWithStats = allTemplates.filter(t => t.category === 'lifecycle');
      for (const template of lifecycleTemplatesWithStats) {
        const { data: emails } = await supabase
          .from('user_lifecycle_emails')
          .select('status')
          .eq('campaign_id', template.id);

        const sent = emails?.filter(e => ['sent', 'opened', 'clicked'].includes(e.status)).length || 0;
        const opened = emails?.filter(e => ['opened', 'clicked'].includes(e.status)).length || 0;
        const clicked = emails?.filter(e => e.status === 'clicked').length || 0;

        template.stats = {
          emails_sent: sent,
          emails_opened: opened,
          emails_clicked: clicked,
          open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
          click_rate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
        };
      }
    }

    // Calculate summary
    const summary = {
      total: allTemplates.length,
      byCategory: {
        sequence: allTemplates.filter(t => t.category === 'sequence').length,
        triggered: allTemplates.filter(t => t.category === 'triggered').length,
        lifecycle: allTemplates.filter(t => t.category === 'lifecycle').length,
        system: allTemplates.filter(t => t.category === 'system').length,
      },
      bySegment: allTemplates.reduce((acc, t) => {
        acc[t.segment] = (acc[t.segment] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      templates: allTemplates,
      summary,
    });
  } catch (error) {
    console.error('Templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// Update a template
export async function PATCH(request: NextRequest) {
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, subject_line, body_template, table } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    // Determine which table to update based on category
    const tableName = table === 'lifecycle' ? 'user_lifecycle_campaigns' : 'marketing_email_templates';

    const { error } = await supabase
      .from(tableName)
      .update({
        subject_line,
        body_template,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}
