import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

export async function GET(request: NextRequest) {
  // Auth check
  const password = request.headers.get('X-Admin-Password');
  if (password !== adminPassword) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Fetch admin email templates
    // First check if there's a dedicated admin_email_templates table
    const { data: templates, error } = await supabase
      .from('marketing_email_templates')
      .select('id, name, subject, body_html, segment')
      .order('name');

    if (error) {
      // Table might not exist, return empty templates
      console.error('Error fetching templates:', error);
      return NextResponse.json({
        success: true,
        templates: getDefaultTemplates(),
      });
    }

    // Transform to expected format
    const formattedTemplates = templates.map(t => ({
      id: t.id,
      name: t.name || `Template ${t.id}`,
      subject: t.subject || '',
      body: t.body_html || '',
      category: t.segment || 'general',
    }));

    // Add default templates if none exist
    const allTemplates = formattedTemplates.length > 0
      ? formattedTemplates
      : getDefaultTemplates();

    return NextResponse.json({
      success: true,
      templates: allTemplates,
    });
  } catch (err) {
    console.error('Templates error:', err);
    return NextResponse.json({
      success: true,
      templates: getDefaultTemplates(),
    });
  }
}

function getDefaultTemplates() {
  return [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to Mind & Muscle, {{first_name}}!',
      body: `<p>Hi {{first_name}},</p>
<p>Welcome to Mind & Muscle! We're thrilled to have you join our community of athletes dedicated to mental and physical excellence.</p>
<p>Here's what you can do to get started:</p>
<ul>
<li>Complete your profile</li>
<li>Explore The Vault for training drills</li>
<li>Try The Zone for mental performance</li>
</ul>
<p>If you have any questions, just reply to this email - we're here to help!</p>
<p>Let's train,<br>The Mind & Muscle Team</p>`,
      category: 'onboarding',
    },
    {
      id: 'feature-announcement',
      name: 'Feature Announcement',
      subject: 'New Feature: {{feature_name}}',
      body: `<p>Hi {{first_name}},</p>
<p>We're excited to announce a new feature that we think you'll love!</p>
<p><strong>[Feature Name]</strong></p>
<p>[Feature description goes here]</p>
<p>Open the app to try it out!</p>
<p>Best,<br>The Mind & Muscle Team</p>`,
      category: 'marketing',
    },
    {
      id: 'feedback-request',
      name: 'Feedback Request',
      subject: 'Quick question for you, {{first_name}}',
      body: `<p>Hi {{first_name}},</p>
<p>We'd love to hear your thoughts on Mind & Muscle!</p>
<p>What's been your favorite feature so far? Is there anything you wish we had?</p>
<p>Just reply to this email - we read every response.</p>
<p>Thanks for being part of our community!</p>
<p>Best,<br>The Mind & Muscle Team</p>`,
      category: 'engagement',
    },
    {
      id: 'trial-reminder',
      name: 'Trial Reminder',
      subject: 'Your trial ends soon, {{first_name}}',
      body: `<p>Hi {{first_name}},</p>
<p>Just a heads up - your Mind & Muscle trial ends in a few days.</p>
<p>To continue accessing all features including:</p>
<ul>
<li>Unlimited video analysis</li>
<li>Full access to The Vault</li>
<li>The Zone mental training</li>
<li>And more...</li>
</ul>
<p>Upgrade to Pro today and keep your momentum going!</p>
<p>Best,<br>The Mind & Muscle Team</p>`,
      category: 'conversion',
    },
  ];
}
