import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Validate admin password
    const adminPassword = request.headers.get('X-Admin-Password');
    if (adminPassword !== process.env.ADMIN_DASHBOARD_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { partnerCode, partnerEmail, partnerName, isRecurring } = body;

    if (!partnerCode || !partnerEmail || !partnerName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mindandmuscle.ai';
    const finderLink = `${baseUrl}/team-licensing?finder=${partnerCode}`;

    // Build email HTML
    const emailHtml = buildFinderFeeWelcomeEmail({
      partnerName,
      partnerCode,
      finderLink,
      isRecurring,
    });

    // Send email
    const result = await resend.emails.send({
      from: 'Mind & Muscle <partners@mindandmuscle.ai>',
      to: partnerEmail,
      subject: isRecurring
        ? `Welcome to the Mind & Muscle VIP Finder Program!`
        : `Welcome to the Mind & Muscle Finder Fee Program!`,
      html: emailHtml,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json(
        { success: false, message: `Email error: ${result.error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Welcome email sent to ${partnerEmail}`,
    });
  } catch (error) {
    console.error('Error sending finder fee email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email' },
      { status: 500 }
    );
  }
}

interface EmailParams {
  partnerName: string;
  partnerCode: string;
  finderLink: string;
  isRecurring: boolean;
}

function buildFinderFeeWelcomeEmail({ partnerName, partnerCode, finderLink, isRecurring }: EmailParams): string {
  const programType = isRecurring ? 'VIP' : 'Standard';
  const commissionText = isRecurring
    ? '<strong style="color: #9333ea;">10% on first purchase + 5% on every renewal</strong>'
    : '<strong style="color: #10b981;">10% one-time fee</strong> on the organization\'s first purchase';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #fb923c 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <img src="https://mindandmuscle.ai/assets/images/logo.png" alt="Mind & Muscle Logo" style="max-width: 180px; height: auto; margin-bottom: 20px;" />
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">Welcome to the Finder Fee Program!</h1>
        ${isRecurring ? '<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">VIP Partner Status</p>' : ''}
      </div>

      <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 18px; color: #111; margin-bottom: 20px;">Hi ${partnerName},</p>

        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 20px;">
          You've been enrolled in the Mind & Muscle <strong>${programType} Finder Fee Program</strong>!
          Earn money by introducing organizations to Mind & Muscle.
        </p>

        <!-- Finder Code Box -->
        <div style="background: ${isRecurring ? '#f3e8ff' : '#f0fdf4'}; border: 2px dashed ${isRecurring ? '#9333ea' : '#10b981'}; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Finder Code</p>
          <p style="margin: 0; font-size: 32px; font-weight: 900; font-family: 'Courier New', monospace; color: ${isRecurring ? '#9333ea' : '#10b981'}; letter-spacing: 2px;">${partnerCode}</p>
        </div>

        <!-- Finder Link Box -->
        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #3b82f6;">Your Personal Finder Link</h2>
          <p style="font-size: 14px; color: #555; margin-bottom: 15px;">Share this link with organizations. When they purchase, you earn your commission!</p>
          <div style="background: #1e293b; padding: 15px; border-radius: 8px; overflow-x: auto;">
            <code style="color: #22d3ee; font-size: 14px; word-break: break-all;">${finderLink}</code>
          </div>
        </div>

        <!-- Commission Structure -->
        <div style="background: #fff3e0; border-left: 4px solid #fb923c; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #fb923c;">Your Commission</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0;">
            You earn ${commissionText}
          </p>
          ${isRecurring ? '<p style="font-size: 14px; color: #9333ea; margin: 10px 0 0 0; font-style: italic;">As a VIP partner, you continue earning 5% on every renewal - not just the first purchase!</p>' : ''}
        </div>

        <!-- How It Works -->
        <div style="background: #f8fafc; border-left: 4px solid #64748b; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #475569;">How It Works</h2>
          <ol style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0; padding-left: 20px;">
            <li>Share your link with organizations (travel teams, facilities, leagues)</li>
            <li>They click your link and visit our team licensing page</li>
            <li>When they purchase, we track the referral to you</li>
            <li>You get paid! (Venmo, Zelle, check - your choice)</li>
          </ol>
        </div>

        <!-- Example Earnings -->
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #22c55e;">Example Earnings</h2>
          <table style="width: 100%; font-size: 14px; color: #555;">
            <tr>
              <td style="padding: 8px 0;">Small team ($3,500 purchase)</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #22c55e;">$350</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Large facility ($15,000 purchase)</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #22c55e;">$1,500</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Regional association ($35,000 purchase)</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #22c55e;">$3,500</td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${finderLink}" style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(251, 146, 60, 0.4);">
            View Your Finder Link Page
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 30px 0 20px 0;">
          Questions? Reply to this email or contact us at <a href="mailto:partners@mindandmuscle.ai" style="color: #fb923c; text-decoration: none; font-weight: 600;">partners@mindandmuscle.ai</a>
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 0;">
          <strong>The Mind & Muscle Team</strong>
        </p>
      </div>

      <div style="text-align: center; padding: 20px; color: #999; font-size: 14px;">
        <p style="margin: 0; font-weight: 600;">Mind and Muscle</p>
        <p style="margin: 5px 0; font-style: italic;">Discipline the Mind. Dominate the Game.</p>
        <p style="margin: 10px 0 0 0;">
          <a href="https://mindandmuscle.ai" style="color: #fb923c; text-decoration: none;">mindandmuscle.ai</a>
        </p>
      </div>
    </div>
  `;
}
