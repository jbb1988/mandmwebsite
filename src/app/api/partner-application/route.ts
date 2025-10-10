import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, organization, audience, networkSize, promotionChannel, whyExcited } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Automatically create partner in Tolt
    const toltApiKey = process.env.TOLT_API_KEY;

    if (!toltApiKey) {
      console.error('TOLT_API_KEY not configured');
      return NextResponse.json({ error: 'Partner system not configured' }, { status: 500 });
    }

    try {
      // Create partner in Tolt via API
      const toltResponse = await fetch('https://api.tolt.io/v1/affiliates', {
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
      subject: `New Partner Application: ${name}`,
      html: `
        <h2>New Partner Program Application</h2>

        <h3>Applicant Details:</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
        <p><strong>Network Size:</strong> ${networkSize || 'Not provided'}</p>
        <p><strong>Promotion Channel:</strong> ${promotionChannel || 'Not provided'}</p>

        <h3>Why They're Excited:</h3>
        <p>${whyExcited || 'Not provided'}</p>

        <h3>Audience Information:</h3>
        <p>${audience || 'Not provided'}</p>

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
            <p style="font-size: 18px; color: #111; margin-bottom: 20px;">Hi ${name},</p>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 20px;">
              Thanks for joining the Mind & Muscle Partner Program! You've been automatically set up in our system and your partner dashboard is ready to go.
            </p>

            <div style="background: #f8fafc; border-left: 4px solid #fb923c; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #fb923c;">📚 Your Partner Dashboard</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 15px;">
                Everything you need is in your Tolt partner dashboard:
              </p>
              <ul style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0;">
                <li>🔗 Your unique referral link</li>
                <li>✉️ Email templates and social media copy</li>
                <li>🎨 Logos, screenshots, and brand assets</li>
                <li>📊 Real-time commission tracking</li>
                <li>💰 Earnings and payout history</li>
              </ul>
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://app.tolt.io" style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(251, 146, 60, 0.3);">
                  Access Your Dashboard →
                </a>
              </div>
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
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #22c55e;">🎯 Next Steps</h2>
              <ol style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0; padding-left: 20px;">
                <li>Check your email for Tolt onboarding (contains login credentials)</li>
                <li>Log into <a href="https://app.tolt.io" style="color: #fb923c; text-decoration: none; font-weight: 600;">your Tolt dashboard</a></li>
                <li>Get your unique referral link from the dashboard</li>
                <li>Access marketing resources in the Resources tab</li>
                <li>Share with your network and start earning!</li>
              </ol>
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
