import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

function verifyAdmin(request: NextRequest): boolean {
  const password = request.headers.get('X-Admin-Password');
  return password === ADMIN_PASSWORD;
}

interface SendRequest {
  contactId: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  updateStage?: boolean;
}

// B2B email wrapper - more professional, partnership-focused
function wrapB2BEmailHtml(body: string): string {
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
      line-height: 1.7;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      padding: 24px;
      text-align: center;
    }
    .header-text {
      color: #ffffff;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px 28px;
      font-size: 15px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    p { margin: 0 0 16px 0; }
    ul, ol { margin: 0 0 16px 0; padding-left: 24px; }
    li { margin-bottom: 8px; }
    a { color: #3b82f6; }
    .cta-button {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header">
        <p class="header-text">Mind & Muscle</p>
      </div>
      <div class="content">
        ${body}
      </div>
      <div class="footer">
        <p><strong>Mind & Muscle</strong> - Baseball & Softball Training Platform</p>
        <p><a href="https://mindandmuscle.ai">mindandmuscle.ai</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Replace template variables
function personalizeEmail(
  text: string,
  contact: {
    first_name: string;
    last_name: string;
    email: string;
    title?: string | null;
    organization?: { name: string; address?: string | null } | null;
  }
): string {
  let result = text;

  result = result.replace(/\{\{first_name\}\}/gi, contact.first_name || 'there');
  result = result.replace(/\{\{last_name\}\}/gi, contact.last_name || '');
  result = result.replace(/\{\{name\}\}/gi, contact.first_name || 'there');
  result = result.replace(/\{\{full_name\}\}/gi, `${contact.first_name} ${contact.last_name}`.trim() || 'there');
  result = result.replace(/\{\{email\}\}/gi, contact.email);
  result = result.replace(/\{\{title\}\}/gi, contact.title || '');
  result = result.replace(/\{\{org_name\}\}/gi, contact.organization?.name || 'your organization');
  result = result.replace(/\{\{organization\}\}/gi, contact.organization?.name || 'your organization');
  result = result.replace(/\{\{address\}\}/gi, contact.organization?.address || '');

  return result;
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: SendRequest = await request.json();
    const { contactId, from, fromName, subject, body: emailBody, updateStage = true } = body;

    // Validation
    if (!contactId || !from || !subject || !emailBody) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Fetch contact with organization
    const { data: contact, error: contactError } = await supabase
      .from('marketing_contacts')
      .select(`
        id,
        email,
        first_name,
        last_name,
        title,
        organization:marketing_organizations(
          name,
          address
        )
      `)
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404 });
    }

    // Personalize email
    const personalizedSubject = personalizeEmail(subject, contact as any);
    const personalizedBody = personalizeEmail(emailBody, contact as any);
    const wrappedHtml = wrapB2BEmailHtml(personalizedBody);

    // Send email via Resend
    const result = await resend.emails.send({
      from: `${fromName} <${from}>`,
      to: contact.email,
      subject: personalizedSubject,
      html: wrappedHtml,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json({
        success: false,
        message: `Failed to send: ${result.error.message}`,
      }, { status: 500 });
    }

    // Update contact stage and last_contacted_at
    if (updateStage) {
      const { error: updateError } = await supabase
        .from('marketing_contacts')
        .update({
          stage: 'email_sent',
          last_contacted_at: new Date().toISOString(),
        })
        .eq('id', contactId);

      if (updateError) {
        console.error('Failed to update contact stage:', updateError);
        // Don't fail the request, email was still sent
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error('Send B2B email error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
  }
}

// Bulk send to multiple contacts
export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contactIds, from, fromName, subject, body: emailBody, updateStage = true } = body;

    if (!contactIds?.length || !from || !subject || !emailBody) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Fetch all contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('marketing_contacts')
      .select(`
        id,
        email,
        first_name,
        last_name,
        title,
        organization:marketing_organizations(
          name,
          address
        )
      `)
      .in('id', contactIds);

    if (contactsError || !contacts?.length) {
      return NextResponse.json({ success: false, message: 'Contacts not found' }, { status: 404 });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send in batches
    for (const contact of contacts) {
      try {
        const personalizedSubject = personalizeEmail(subject, contact as any);
        const personalizedBody = personalizeEmail(emailBody, contact as any);
        const wrappedHtml = wrapB2BEmailHtml(personalizedBody);

        const result = await resend.emails.send({
          from: `${fromName} <${from}>`,
          to: contact.email,
          subject: personalizedSubject,
          html: wrappedHtml,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        sent++;

        // Update contact
        if (updateStage) {
          await supabase
            .from('marketing_contacts')
            .update({
              stage: 'email_sent',
              last_contacted_at: new Date().toISOString(),
            })
            .eq('id', contact.id);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err: any) {
        failed++;
        errors.push(`${contact.email}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    console.error('Bulk send error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send emails' }, { status: 500 });
  }
}
