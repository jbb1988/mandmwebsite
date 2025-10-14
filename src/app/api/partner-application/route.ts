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

    // Split name into first and last for Tolt API
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Automatically create partner in Tolt
    const toltApiKey = process.env.TOLT_API_KEY;

    if (!toltApiKey) {
      console.error('TOLT_API_KEY not configured');
      return NextResponse.json({ error: 'Partner system not configured' }, { status: 500 });
    }

    let toltCreationSucceeded = false;

    try {
      // Prepare the request body with required program_id
      const toltRequestBody: any = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        program_id: "prg_XZjuxmy3JkyE9oTFKEFDbcLD", // Mind & Muscle's Program ID
      };

      // Add optional fields if provided
      if (organization && organization.trim()) {
        toltRequestBody.company_name = organization;
      }

      // Add country code (default to US for now)
      toltRequestBody.country_code = "US";

      // Set payout method to none by default (partner can configure later in dashboard)
      toltRequestBody.payout_method = "none";

      console.log('=== TOLT API REQUEST ===');
      console.log('Endpoint:', 'https://api.tolt.com/v1/partners');
      console.log('API Key (first 20 chars):', toltApiKey.substring(0, 20) + '...');
      console.log('Request Body:', JSON.stringify(toltRequestBody, null, 2));

      // Create partner in Tolt via API
      const toltResponse = await fetch('https://api.tolt.com/v1/partners', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${toltApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toltRequestBody),
      });

      console.log('=== TOLT API RESPONSE ===');
      console.log('Status Code:', toltResponse.status);
      console.log('Status Text:', toltResponse.statusText);

      if (!toltResponse.ok) {
        const errorData = await toltResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Tolt API Error Response:', JSON.stringify(errorData, null, 2));
        console.error('Full error details:', { status: toltResponse.status, statusText: toltResponse.statusText, body: errorData });
      } else {
        const toltData = await toltResponse.json();
        console.log('✅ Partner created in Tolt successfully!');
        console.log('Response Data:', JSON.stringify(toltData, null, 2));
        toltCreationSucceeded = true;
      }
    } catch (toltError: any) {
      console.error('❌ Exception calling Tolt API:', toltError.message);
      console.error('Full error:', toltError);
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

        ${toltCreationSucceeded
          ? `<p style="color: #28a745; font-weight: bold;">✅ Partner automatically created in Tolt!</p>
             <p style="color: #666; font-size: 12px;">
               The partner has been added to Tolt and will receive their onboarding email with dashboard access.<br />
               View them in your <a href="https://app.tolt.io">Tolt dashboard</a> → Partners.<br /><br />
               If needed, you can remove or block the partner in the dashboard.
             </p>`
          : `<p style="color: #dc3545; font-weight: bold;">⚠️ Tolt partner creation failed</p>
             <p style="color: #666; font-size: 12px;">
               The partner was NOT created in Tolt automatically. Check Vercel logs for details.<br />
               You'll need to manually create this partner in your <a href="https://app.tolt.io">Tolt dashboard</a>.<br /><br />
               User details: ${safeEmail} (${safeName})
             </p>`
        }
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
            <img src="https://mindandmuscle.ai/assets/images/logo.png" alt="Mind & Muscle Logo" style="max-width: 180px; height: auto; margin-bottom: 20px;" />
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800;">Welcome to the Team!</h1>
          </div>

          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 18px; color: #111; margin-bottom: 20px;">Hi ${safeName},</p>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 20px;">
              Thanks for joining the Mind & Muscle Partner Program! You've been automatically set up in our system and your partner dashboard is ready to go.
            </p>

            <div style="background: #fff3e0; border-left: 4px solid #fb923c; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #fb923c;">🚀 Access Your Partner Dashboard Now</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                Your partner account has been created! Here's how to access your dashboard:
              </p>

              <div style="background: #f0fdf4; border: 2px solid #22c55e; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 10px 0;">
                  <strong style="color: #22c55e;">Step 1:</strong> Go to <a href="https://mind-and-muscle.tolt.io" style="color: #fb923c; text-decoration: none; font-weight: 600;">mind-and-muscle.tolt.io</a>
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 10px 0;">
                  <strong style="color: #22c55e;">Step 2:</strong> Enter your email: <strong>${safeEmail}</strong>
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0;">
                  <strong style="color: #22c55e;">Step 3:</strong> Click "Send magic link" - check your email for the login link
                </p>
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <a href="https://mind-and-muscle.tolt.io" style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(251, 146, 60, 0.4);">
                  Access Partner Dashboard →
                </a>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 15px; font-style: italic; text-align: center;">
                💡 No password needed - Tolt uses magic links for secure, easy login!
              </p>
            </div>

            <div style="background: #f8fafc; border-left: 4px solid #fb923c; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #fb923c;">📚 What You'll Find in Your Dashboard</h2>
              <ul style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0;">
                <li>🔗 Create custom referral links (track performance per link)</li>
                <li>✉️ Email templates and social media copy</li>
                <li>🎨 Logos, screenshots, and brand assets</li>
                <li>📊 Real-time click and commission tracking</li>
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
                <li><strong>Log in to your portal</strong> - Click the button above or go to mind-and-muscle.tolt.io</li>
                <li><strong>Request magic link</strong> - Enter ${safeEmail} and click "Send magic link"</li>
                <li><strong>Check your email</strong> - Click the login link from Tolt (check spam if needed)</li>
                <li><strong>Create your referral link</strong> - Click "Create link" in the dashboard and customize it</li>
                <li><strong>Download marketing assets</strong> - Find templates, graphics, and copy in the Resources tab</li>
                <li><strong>Start sharing</strong> - Promote your link and earn 10% lifetime commission!</li>
              </ol>
              <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 15px; font-style: italic;">
                💡 Tip: Your referral link works immediately - no approval needed! Start earning as soon as you share it.
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
            <p style="margin: 0; font-weight: 600;">Mind and Muscle</p>
            <p style="margin: 5px 0; font-style: italic;">Discipline the Mind. Dominate the Game.</p>
            <p style="margin: 10px 0 5px 0; font-size: 12px;">
              <strong>Partner Program:</strong> Earn 10% lifetime commission
            </p>
            <p style="margin: 5px 0 0 0;">
              <a href="https://mindandmuscle.ai/partner-program" style="color: #fb923c; text-decoration: none;">Learn More</a> |
              <a href="https://mindandmuscle.ai" style="color: #fb923c; text-decoration: none; margin-left: 8px;">mindandmuscle.ai</a>
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
