import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;
const adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

const resend = new Resend(resendApiKey);

interface SendRequest {
  from: string;
  fromName: string;
  mode: 'individual' | 'bulk';
  recipients?: string[]; // For individual mode
  segment?: string; // For bulk mode
  subject: string;
  body: string;
}

// HTML email wrapper with Mind & Muscle branding
function wrapEmailHtml(body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mind & Muscle</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      padding: 24px;
      text-align: center;
    }
    .header img {
      height: 40px;
    }
    .header-text {
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    .content {
      padding: 32px 24px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    p { margin: 0 0 16px 0; }
    ul, ol { margin: 0 0 16px 0; padding-left: 24px; }
    li { margin-bottom: 8px; }
    a { color: #3b82f6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="header-text">Mind & Muscle</p>
    </div>
    <div class="content">
      ${body}
    </div>
    <div class="footer">
      <p>Mind & Muscle - Train Your Mind. Build Your Muscle.</p>
      <p><a href="https://mindandmuscle.ai">mindandmuscle.ai</a></p>
      <p style="margin-top: 16px; font-size: 11px; color: #9ca3af;">
        You're receiving this email because you're a Mind & Muscle user.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// Replace template variables with user data
function personalizeEmail(body: string, userData: { email: string; first_name?: string; full_name?: string }): string {
  let personalized = body;

  // Extract first name from full_name if not provided
  const firstName = userData.first_name
    || userData.full_name?.split(' ')[0]
    || userData.email.split('@')[0];

  personalized = personalized.replace(/\{\{first_name\}\}/gi, firstName);
  personalized = personalized.replace(/\{\{name\}\}/gi, firstName);
  personalized = personalized.replace(/\{\{email\}\}/gi, userData.email);
  personalized = personalized.replace(/\{\{full_name\}\}/gi, userData.full_name || firstName);

  return personalized;
}

export async function POST(request: NextRequest) {
  // Auth check
  const password = request.headers.get('X-Admin-Password');
  if (password !== adminPassword) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body: SendRequest = await request.json();
  const { from, fromName, mode, recipients, segment, subject, body: emailBody } = body;

  // Validation
  if (!from || !subject || !emailBody) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  if (mode === 'individual' && (!recipients || recipients.length === 0)) {
    return NextResponse.json({ success: false, error: 'No recipients specified' }, { status: 400 });
  }

  if (mode === 'bulk' && !segment) {
    return NextResponse.json({ success: false, error: 'No segment specified' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    let emailsToSend: { email: string; first_name?: string; full_name?: string }[] = [];

    if (mode === 'individual') {
      // Get user data for personalization
      const { data: users } = await supabase
        .from('profiles')
        .select('email, full_name')
        .in('email', recipients!);

      emailsToSend = recipients!.map(email => {
        const user = users?.find(u => u.email === email);
        return {
          email,
          first_name: user?.full_name?.split(' ')[0],
          full_name: user?.full_name,
        };
      });
    } else {
      // Bulk mode - fetch segment users
      let query = supabase
        .from('profiles')
        .select('email, full_name')
        .not('email', 'is', null);

      switch (segment) {
        case 'trial':
          query = query.eq('subscription_status', 'trial');
          break;
        case 'pro':
          query = query.eq('subscription_status', 'pro');
          break;
        case 'free':
          query = query.or('subscription_status.is.null,subscription_status.eq.free,subscription_status.eq.expired');
          break;
        case 'inactive':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          query = query.lt('last_active_at', thirtyDaysAgo.toISOString());
          break;
        case 'new':
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          query = query.gte('created_at', sevenDaysAgo.toISOString());
          break;
      }

      const { data: users, error } = await query.limit(1000); // Limit to 1000 for safety

      if (error) {
        console.error('Failed to fetch segment users:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
      }

      emailsToSend = (users || []).map(user => ({
        email: user.email,
        first_name: user.full_name?.split(' ')[0],
        full_name: user.full_name,
      }));
    }

    if (emailsToSend.length === 0) {
      return NextResponse.json({ success: false, error: 'No users found to email' }, { status: 400 });
    }

    // Send emails
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process in batches of 10 to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < emailsToSend.length; i += batchSize) {
      const batch = emailsToSend.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(async (user) => {
          const personalizedBody = personalizeEmail(emailBody, user);
          const personalizedSubject = personalizeEmail(subject, user);
          const wrappedHtml = wrapEmailHtml(personalizedBody);

          const result = await resend.emails.send({
            from: `${fromName} <${from}>`,
            to: user.email,
            subject: personalizedSubject,
            html: wrappedHtml,
          });

          if (result.error) {
            throw new Error(result.error.message);
          }

          return result;
        })
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          sent++;
        } else {
          failed++;
          errors.push(`${batch[index].email}: ${result.reason}`);
        }
      });

      // Small delay between batches
      if (i + batchSize < emailsToSend.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Log the send action (table might not exist, ignore errors)
    try {
      await supabase.from('admin_activity_log').insert({
        action: 'email_send',
        details: {
          from,
          mode,
          segment: mode === 'bulk' ? segment : undefined,
          recipient_count: emailsToSend.length,
          sent,
          failed,
          subject,
        },
      });
    } catch {
      // Table might not exist, ignore
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Only return first 10 errors
    });
  } catch (err) {
    console.error('Send email error:', err);
    return NextResponse.json({ success: false, error: 'Failed to send emails' }, { status: 500 });
  }
}
