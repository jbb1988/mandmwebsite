import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Send test welcome email
    const result = await resend.emails.send({
      from: 'Mind & Muscle Partners <partners@mindandmuscle.ai>',
      to: email,
      subject: '[TEST] Welcome to the Mind & Muscle Partner Program! 🎉',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #fb923c 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800;">Welcome to the Team!</h1>
          </div>

          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 18px; color: #111; margin-bottom: 20px;">Hi Test Partner,</p>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 20px;">
              Thanks for joining the Mind & Muscle Partner Program! You've been automatically set up in our system and your partner dashboard is ready to go.
            </p>

            <div style="background: #f8fafc; border-left: 4px solid #fb923c; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #fb923c;">📚 Your Marketing Resources</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 15px;">
                We've created everything you need to start promoting Mind & Muscle:
              </p>
              <ul style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0;">
                <li>✉️ Ready-to-send email templates</li>
                <li>📱 Social media copy for Instagram, X, Facebook & LinkedIn</li>
                <li>💡 Pro tips and best practices</li>
                <li>📊 Commission details and tracking info</li>
              </ul>
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://mindandmuscle.ai/partner-resources" style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(251, 146, 60, 0.3);">
                  Access Your Resources →
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
                <li>Check your email for Tolt onboarding (contains your unique partner link)</li>
                <li>Visit the <a href="https://mindandmuscle.ai/partner-resources" style="color: #fb923c; text-decoration: none; font-weight: 600;">marketing resources page</a></li>
                <li>Copy email templates or social media copy</li>
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

    return NextResponse.json({
      success: true,
      message: 'Test email sent! Check your inbox.',
      emailId: result.data?.id,
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
