import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { Resend } from 'resend';

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Simple rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

// Welcome email template
const getWelcomeEmailHtml = (unsubscribeToken: string, todayContent?: { title: string; thumbnail_url: string }) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
    .header { padding: 40px 40px 20px; text-align: center; }
    .logo { width: 120px; height: auto; }
    .title { margin: 20px 0 16px; font-size: 32px; font-weight: 900; color: #111827; }
    .subtitle { margin: 0 0 8px; font-size: 18px; color: #374151; }
    .content { padding: 0 40px 20px; }
    .success-box { background: rgba(34, 197, 94, 0.08); border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; text-align: center; }
    .success-title { margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #15803d; }
    .thumbnail { width: 100%; max-width: 400px; border-radius: 12px; margin-top: 12px; }
    .info-box { background: rgba(59, 130, 246, 0.08); border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0; }
    .info-title { margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #1e40af; }
    .info-text { margin: 0; font-size: 14px; line-height: 1.8; color: #374151; }
    .warning-box { background: rgba(251, 146, 60, 0.08); border-left: 4px solid #fb923c; padding: 16px; border-radius: 8px; margin: 20px 0; }
    .warning-title { margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #c2410c; }
    .button { display: inline-block; background: linear-gradient(to right, #3b82f6, #fb923c); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4); }
    .app-badges { text-align: center; margin-top: 16px; }
    .app-badge { height: 40px; margin: 0 8px; }
    .footer { padding: 30px 40px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
    .checklist { text-align: left; margin: 16px 0; }
    .checklist-item { padding: 8px 0; font-size: 15px; color: #374151; }
    .check { color: #22c55e; font-weight: bold; margin-right: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/New%20MM%20Logo-transparent%20(1).png" alt="Mind & Muscle" class="logo">
      <h1 class="title">Welcome to the Daily Hit! 🎯</h1>
      <p class="subtitle">You're now signed up for 2 minutes of mental training every morning</p>
    </div>
    <div class="content">
      <div class="success-box">
        <p class="success-title">✅ You're All Set!</p>
        <p style="margin: 0; font-size: 15px; color: #374151;">Starting tomorrow, you'll receive your Daily Hit every morning.</p>
      </div>

      <div class="warning-box">
        <p class="warning-title">🔥 What to Expect</p>
        <div class="checklist">
          <div class="checklist-item"><span class="check">✓</span> 2-minute mental training audiogram</div>
          <div class="checklist-item"><span class="check">✓</span> Daily challenge to apply what you learned</div>
          <div class="checklist-item"><span class="check">✓</span> 100% baseball-specific content</div>
          <div class="checklist-item"><span class="check">✓</span> Delivered every morning to start your day right</div>
        </div>
      </div>

      ${todayContent ? `
      <div class="info-box">
        <p class="info-title">🎧 Don't Wait - Listen to Today's Daily Hit Now!</p>
        <p class="info-text" style="margin-bottom: 12px;">${todayContent.title}</p>
        <img src="${todayContent.thumbnail_url || 'https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/New%20MM%20Logo-transparent%20(1).png'}" alt="Today's Daily Hit" class="thumbnail">
      </div>
      ` : ''}

      <div style="text-align: center; padding: 30px 0;">
        <a href="https://www.mindandmuscle.ai/daily-hit" class="button">🎧 Listen Now</a>
        <p style="margin: 12px 0 0; font-size: 14px; color: #4b5563; font-weight: 500;">Takes just 2 minutes</p>
      </div>

      <div class="info-box">
        <p class="info-title">📱 Want the full experience?</p>
        <p class="info-text">Get push notifications, track your streaks, and access the full library of mental training content in the app.</p>
        <div class="app-badges">
          <a href="https://apps.apple.com/app/mind-muscle-baseball/id6737125498">
            <img src="https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/App_Store_Badge.png" alt="App Store" class="app-badge">
          </a>
          <a href="https://play.google.com/store/apps/details?id=ai.mindandmuscle.app">
            <img src="https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/google_play_badge.png" alt="Google Play" class="app-badge">
          </a>
        </div>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700;"><span style="color: #3b82f6;">Discipline the Mind.</span> <span style="color: #fb923c;">Dominate the Game.</span></p>
      <p style="margin: 0 0 16px; font-size: 14px; color: #4b5563;">100% Baseball. Zero Generic Content.</p>
      <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">© 2026 Mind & Muscle Performance. All rights reserved.</p>
      <p style="margin: 0 0 8px; font-size: 11px; color: #9ca3af;">
        <a href="https://www.mindandmuscle.ai/unsubscribe?token=${unsubscribeToken}" style="color: #ef4444; text-decoration: underline;">Unsubscribe from Daily Hit emails</a>
      </p>
      <p style="margin: 0; font-size: 10px; color: #9ca3af; line-height: 1.5;">
        Mind & Muscle Performance<br>
        You're receiving this because you signed up for the Daily Hit on our website.
      </p>
    </div>
  </div>
</body>
</html>`;

// Helper to get day of year in Central timezone
function getDayOfYearCentral(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '2025');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');

  const centralDate = new Date(year, month, day);
  const start = new Date(year, 0, 0);
  const diff = centralDate.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Send welcome email
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendWelcomeEmail(
  email: string,
  unsubscribeToken: string,
  supabase: any
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return;
  }

  try {
    // Fetch today's content
    const dayOfYear = getDayOfYearCentral();
    const { data: content } = await supabase
      .from('motivation_content')
      .select('title, thumbnail_url')
      .eq('day_of_year', dayOfYear)
      .eq('status', 'active')
      .single();

    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: 'Mind & Muscle <hello@mindandmuscle.ai>',
      to: email,
      subject: '🎯 Welcome to the Daily Hit!',
      html: getWelcomeEmailHtml(unsubscribeToken, content || undefined),
    });

    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || record.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate
    const body = await request.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('daily_hit_email_subscribers')
      .select('id, status, unsubscribe_token')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === 'active') {
        // Already subscribed
        return NextResponse.json({
          success: true,
          message: "You're already subscribed! Check your inbox tomorrow morning.",
          alreadySubscribed: true,
        });
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('daily_hit_email_subscribers')
          .update({
            status: 'active',
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error reactivating subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to reactivate subscription' },
            { status: 500 }
          );
        }

        // Send welcome back email
        if (existing.unsubscribe_token) {
          sendWelcomeEmail(email.toLowerCase(), existing.unsubscribe_token, supabase);
        }

        return NextResponse.json({
          success: true,
          message: "Welcome back! Check your inbox for a welcome email.",
          reactivated: true,
        });
      }
    }

    // New subscription
    const { data: newSubscriber, error: insertError } = await supabase
      .from('daily_hit_email_subscribers')
      .insert({
        email: email.toLowerCase(),
        source: 'website',
      })
      .select('unsubscribe_token')
      .single();

    if (insertError) {
      console.error('Error inserting subscriber:', insertError);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    // Send welcome email (don't block the response)
    if (newSubscriber?.unsubscribe_token) {
      sendWelcomeEmail(email.toLowerCase(), newSubscriber.unsubscribe_token, supabase);
    }

    return NextResponse.json({
      success: true,
      message: "You're in! Check your inbox for a welcome email.",
    });
  } catch (error) {
    console.error('Unexpected error in subscribe API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
