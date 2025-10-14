import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { partnerApplicationSchema, escapeHtml } from '@/lib/validation';
import { partnerApplicationRateLimit, getClientIp, checkRateLimit } from '@/lib/rate-limit';

// Verify Cloudflare Turnstile token
async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = getClientIp(request);
    const rateLimitResult = await checkRateLimit(partnerApplicationRateLimit, ip);

    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.reset ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000) : 300
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.reset ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString() : '300',
            'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '2',
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await request.json();

    // Validate and sanitize input
    const validationResult = partnerApplicationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { name, email, organization, audience, networkSize, promotionChannel, whyExcited, turnstileToken } = validationResult.data;

    // Verify Turnstile CAPTCHA token
    const isCaptchaValid = await verifyTurnstileToken(turnstileToken, ip);

    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Escape HTML in user inputs for email display
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeOrganization = organization ? escapeHtml(organization) : 'Not provided';
    const safeNetworkSize = networkSize ? escapeHtml(networkSize) : 'Not provided';
    const safePromotionChannel = promotionChannel ? escapeHtml(promotionChannel) : 'Not provided';
    const safeWhyExcited = whyExcited ? escapeHtml(whyExcited) : 'Not provided';
    const safeAudience = audience ? escapeHtml(audience) : 'Not provided';

    // Automatically create partner in Tolt
    const toltApiKey = process.env.TOLT_API_KEY;

    if (!toltApiKey) {
      console.error('TOLT_API_KEY not configured');
      return NextResponse.json({ error: 'Partner system not configured' }, { status: 500 });
    }

    try {
      // Create partner in Tolt via API
      const toltResponse = await fetch('https://api.tolt.com/v1/partners', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${toltApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          name: name,
          metadata: {
            organization: organization || 'Not provided',
            network_size: networkSize || 'Not provided',
            promotion_channel: promotionChannel || 'Not provided',
            why_excited: whyExcited || 'Not provided',
            audience: audience || 'Not provided',
            applied_at: new Date().toISOString(),
          },
        }),
      });

      if (!toltResponse.ok) {
        const errorData = await toltResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Tolt API error:', toltResponse.status, errorData);

        // If partner already exists in Tolt, that's okay - send success anyway
        if (toltResponse.status === 409 || toltResponse.status === 400) {
          console.log('Partner may already exist in Tolt, continuing...');
        } else {
          throw new Error(`Tolt API failed: ${toltResponse.status}`);
        }
      } else {
        const toltData = await toltResponse.json();
        console.log('Partner created in Tolt:', toltData);
      }
    } catch (toltError: any) {
      console.error('Error creating partner in Tolt:', toltError);
      // Don't fail the whole request - still send notification email
    }

    // Send internal notification email
    await resend.emails.send({
      from: 'Mind & Muscle Partners <partners@mindandmuscle.ai>',
      to: 'support@mindandmuscle.ai',
      replyTo: email,
      subject: `New Partner Application: ${safeName}`,
      html: `
        <h2>New Partner Program Application</h2>

        <h3>Applicant Details:</h3>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Organization:</strong> ${safeOrganization}</p>
        <p><strong>Network Size:</strong> ${safeNetworkSize}</p>
        <p><strong>Promotion Channel:</strong> ${safePromotionChannel}</p>

        <h3>Why They're Excited:</h3>
        <p>${safeWhyExcited}</p>

        <h3>Audience Information:</h3>
        <p>${safeAudience}</p>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />

        <p style="color: #28a745; font-weight: bold;">
          ✅ Partner automatically created in Tolt!
        </p>

        <p style="color: #666; font-size: 12px;">
          The partner has been automatically added to Tolt and will receive their onboarding email.<br />
          You can view them in your <a href="https://app.tolt.io">Tolt dashboard</a>.<br /><br />

          If needed, you can remove or block the partner in Tolt dashboard → Partners.
        </p>
      `,
    });

    // Send welcome email to partner with resources link
    await resend.emails.send({
      from: 'Mind & Muscle Partners <partners@mindandmuscle.ai>',
      to: email,
      subject: 'Welcome to the Mind & Muscle Partner Program! 🎉',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #fb923c 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800;">Welcome to the Team!</h1>
          </div>

          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 18px; color: #111; margin-bottom: 20px;">Hi ${safeName},</p>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 20px;">
              Thanks for joining the Mind & Muscle Partner Program! You've been automatically set up in our system and your partner dashboard is ready to go.
            </p>

            <div style="background: #fff3e0; border-left: 4px solid #fb923c; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #fb923c;">⚠️ Important: Check Your Email for Tolt Dashboard Access</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 15px;">
                <strong>You will receive a separate email from Tolt (noreply@tolt.io)</strong> within the next few minutes. This email contains your dashboard login link.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #d97706; margin-bottom: 15px; background: #fef3c7; padding: 12px; border-radius: 4px;">
                ⚠️ <strong>Check your spam/junk folder!</strong> Tolt emails sometimes get filtered. If you don't see it in your inbox within 10 minutes, check spam and mark it as "Not Spam".
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 15px;">
                The Tolt email will have the subject: <strong>"Welcome to Tolt"</strong> or similar, and will include a link to access your partner dashboard at app.tolt.io.
              </p>
            </div>

            <div style="background: #f8fafc; border-left: 4px solid #fb923c; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #fb923c;">📚 What You'll Find in Your Dashboard</h2>
              <ul style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0;">
                <li>🔗 Your unique referral link (starts earning immediately)</li>
                <li>✉️ Email templates and social media copy</li>
                <li>🎨 Logos, screenshots, and brand assets</li>
                <li>📊 Real-time commission tracking</li>
                <li>💰 Earnings and payout history</li>
              </ul>
            </div>

            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #3b82f6;">💰 Commission Structure</h2>
              <ul style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0;">
                <li><strong>10% lifetime recurring commission</strong> on all sales</li>
                <li><strong>90-day cookie window</strong> for attribution</li>
                <li><strong>$50 minimum payout</strong> threshold</li>
                <li><strong>Monthly PayPal payouts</strong> (NET-60 terms)</li>
              </ul>
            </div>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #22c55e;">🎯 Next Steps to Start Earning</h2>
              <ol style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0; padding-left: 20px;">
                <li><strong>Wait for the Tolt email</strong> - Check your inbox (and spam!) for an email from noreply@tolt.io within 10 minutes</li>
                <li><strong>Click the dashboard link</strong> in the Tolt email to access app.tolt.io (no password needed - magic link!)</li>
                <li><strong>Get your referral link</strong> from the dashboard homepage</li>
                <li><strong>Download marketing assets</strong> from the Resources tab (templates, graphics, etc.)</li>
                <li><strong>Share your link</strong> with your network and start earning 10% commission!</li>
              </ol>
              <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 15px; font-style: italic;">
                💡 Tip: Your referral link works immediately - no waiting period! Share it as soon as you get dashboard access.
              </p>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 30px 0 20px 0;">
              Questions? Just reply to this email or reach out to <a href="mailto:partners@mindandmuscle.ai" style="color: #fb923c; text-decoration: none; font-weight: 600;">partners@mindandmuscle.ai</a>
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 10px;">
              Let's build something great together! 💪🧠
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 0;">
              <strong>The Mind & Muscle Team</strong>
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 14px;">
            <p style="margin: 0;">Mind & Muscle | Developing the Complete Athlete</p>
            <p style="margin: 10px 0 0 0;">
              <a href="https://mindandmuscle.ai" style="color: #fb923c; text-decoration: none;">mindandmuscle.ai</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log('Partner Application:', { name, email, organization, networkSize });

    return NextResponse.json({
      success: true,
      message: 'Application received and partner created in Tolt'
    });
  } catch (error: any) {
    console.error('Error processing partner application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
