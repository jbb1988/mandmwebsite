import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

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

// File-based system templates
const SYSTEM_TEMPLATES = [
  {
    id: 'system-daily-hit-website',
    name: 'Daily Hit Website Email',
    segment: 'user',
    sequence_step: 0,
    subject_line: 'Your Daily Hit is Ready!',
    body_template: '', // Will be loaded from file
    is_triggered: false,
    trigger_type: null,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    category: 'system' as const,
    source: 'file' as const,
    file_path: 'daily_hit_website.html',
  },
  {
    id: 'system-daily-hit-followup',
    name: 'Daily Hit Follow-up',
    segment: 'user',
    sequence_step: 0,
    subject_line: 'Great job completing your Daily Hit!',
    body_template: '',
    is_triggered: false,
    trigger_type: null,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    category: 'system' as const,
    source: 'file' as const,
    file_path: 'daily_hit_followup.html',
  },
  {
    id: 'system-content-reflection',
    name: 'Content Reflection',
    segment: 'user',
    sequence_step: 0,
    subject_line: 'Time to reflect on your session',
    body_template: '',
    is_triggered: false,
    trigger_type: null,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    category: 'system' as const,
    source: 'file' as const,
    file_path: 'content_reflection.html',
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
