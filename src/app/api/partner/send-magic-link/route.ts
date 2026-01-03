import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists in partners table
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('name, first_name, email')
      .eq('email', normalizedEmail)
      .single();

    if (partnerError || !partner) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If this email is registered as a partner, you will receive a login link shortly.'
      });
    }

    // Rate limit: Max 3 magic link requests per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('partner_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('partner_email', normalizedEmail)
      .gte('created_at', oneHourAgo);

    if (count && count >= 3) {
      return NextResponse.json(
        { error: 'Too many login requests. Please try again in an hour.' },
        { status: 429 }
      );
    }

    // Generate secure token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store token in database
    const { error: insertError } = await supabase
      .from('partner_sessions')
      .insert({
        partner_email: normalizedEmail,
        token,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (insertError) {
      console.error('Error creating session:', insertError);
      return NextResponse.json(
        { error: 'Failed to create login session' },
        { status: 500 }
      );
    }

    // Generate login link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mindandmuscle.ai';
    const loginLink = `${baseUrl}/partner/dashboard?token=${token}`;

    // Send magic link email
    const firstName = partner.first_name || partner.name.split(' ')[0];

    await resend.emails.send({
      from: 'Mind & Muscle <partners@mindandmuscle.ai>',
      to: normalizedEmail,
      subject: 'Your Partner Dashboard Login Link',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0A0B14;color:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/New%20MM%20Logo-transparent%20(1).png"
           alt="Mind & Muscle" width="80" style="display:inline-block;">
    </div>

    <!-- Main Content -->
    <div style="background:linear-gradient(135deg,#0F1123 0%,#1B1F39 100%);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:32px;text-align:center;">
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">
        Partner Dashboard Login
      </h1>
      <p style="margin:0 0 24px;font-size:16px;color:rgba(255,255,255,0.7);line-height:1.6;">
        Hi ${firstName}, click the button below to access your partner dashboard.
      </p>

      <!-- Login Button -->
      <a href="${loginLink}"
         style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:12px;font-weight:600;font-size:16px;box-shadow:0 8px 24px rgba(59,130,246,0.35);">
        Access Dashboard
      </a>

      <p style="margin:24px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">
        This link expires in 30 minutes and can only be used once.
      </p>
    </div>

    <!-- Security Note -->
    <div style="margin-top:24px;padding:16px;background:rgba(255,255,255,0.05);border-radius:8px;text-align:center;">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);">
        If you didn't request this login link, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top:32px;text-align:center;">
      <p style="margin:0;font-size:14px;font-weight:600;">
        <span style="color:#3b82f6;">Discipline the Mind.</span>
        <span style="color:#fb923c;">Dominate the Game.</span>
      </p>
      <p style="margin:12px 0 0;font-size:12px;color:rgba(255,255,255,0.4);">
        © 2026 Mind & Muscle Performance. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
      `
    });

    return NextResponse.json({
      success: true,
      message: 'If this email is registered as a partner, you will receive a login link shortly.'
    });

  } catch (error) {
    console.error('Error in send-magic-link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
