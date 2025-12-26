import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

// System templates metadata
const SYSTEM_TEMPLATES: Record<string, {
  id: string;
  name: string;
  subject_line: string;
  file_path: string;
}> = {
  'system-daily-hit-website': {
    id: 'system-daily-hit-website',
    name: 'Daily Hit Website Email',
    subject_line: 'Your Daily Hit is Ready!',
    file_path: 'daily_hit_website.html',
  },
  'system-daily-hit-followup': {
    id: 'system-daily-hit-followup',
    name: 'Daily Hit Follow-up',
    subject_line: 'Great job completing your Daily Hit!',
    file_path: 'daily_hit_followup.html',
  },
  'system-content-reflection': {
    id: 'system-content-reflection',
    name: 'Content Reflection',
    subject_line: 'Time to reflect on your session',
    file_path: 'content_reflection.html',
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
          body_template: `<!-- File-based template: ${systemTemplate.file_path} -->`,
          is_triggered: false,
          trigger_type: null,
          created_at: '2024-12-01T00:00:00Z',
          updated_at: '2024-12-01T00:00:00Z',
          category: 'system',
          source: 'file',
          file_path: systemTemplate.file_path,
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
