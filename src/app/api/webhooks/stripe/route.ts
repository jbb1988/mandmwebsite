import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Force dynamic rendering - don't try to statically generate this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Generate unique team code
function generateTeamCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 3;
  const segmentLength = 4;

  const code = Array(segments)
    .fill(null)
    .map(() => {
      return Array(segmentLength)
        .fill(null)
        .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
        .join('');
    })
    .join('-');

  return `TEAM-${code}`;
}

// Generate unique coach code
function generateCoachCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 3;
  const segmentLength = 4;

  const code = Array(segments)
    .fill(null)
    .map(() => {
      return Array(segmentLength)
        .fill(null)
        .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
        .join('');
    })
    .join('-');

  return `COACH-${code}`;
}

// Send multi-team organization email
async function sendMultiTeamOrgEmail(
  email: string,
  organizationName: string,
  numberOfTeams: number,
  seatsPerTeam: number[],
  teamCodes: Array<{ teamNumber: number; coachCode: string; teamCode: string; teamId: string }>
) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    
    // Generate team code sections for email
    const teamCodesHtml = teamCodes.map((team) => `
      <tr>
        <td style="padding: 20px 40px;">
          <div style="background: rgba(147, 51, 234, 0.15); border-left: 4px solid #9333ea; padding: 24px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #9333ea;">
              Team ${team.teamNumber} Codes
            </p>
            
            <!-- Coach Code -->
            <div style="background: rgba(16, 185, 129, 0.15); border: 2px dashed #10b981; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #10b981;">
                ① COACH CODE (Single-use)
              </p>
              <div style="text-align: center; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 6px;">
                <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #10b981; font-family: 'Courier New', monospace;">
                  ${team.coachCode}
                </div>
              </div>
            </div>
            
            <!-- Team Code -->
            <div style="background: rgba(59, 130, 246, 0.15); border: 2px dashed #3b82f6; padding: 16px; border-radius: 8px;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #3b82f6;">
                ② TEAM CODE (${seatsPerTeam[team.teamNumber - 1] || 0} seats)
              </p>
              <div style="text-align: center; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 6px;">
                <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #3b82f6; font-family: 'Courier New', monospace;">
                  ${team.teamCode}
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `).join('');

    await resend.emails.send({
      from: 'Mind and Muscle <noreply@mindandmuscle.ai>',
      to: email,
      subject: `${organizationName} - ${numberOfTeams} Team Licenses Active! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #1a1f35;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1f35; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(to bottom, #2a3148, #1f2537); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 20px;">
                      <a href="https://www.mindandmuscle.ai" style="display: block; text-decoration: none;">
                        <img src="https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/New%20MM%20Logo-transparent%20(1).png" alt="Mind & Muscle" width="120" style="display: block; max-width: 120px; height: auto;">
                      </a>
                    </td>
                  </tr>

                  <!-- Welcome Message -->
                  <tr>
                    <td style="padding: 20px 40px; text-align: center;">
                      <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 900; color: #ffffff;">
                        ${organizationName}
                      </h1>
                      <p style="margin: 0 0 8px; font-size: 24px; color: #9333ea; font-weight: 700;">
                        ${numberOfTeams} Team Licenses Active!
                      </p>
                      <p style="margin: 0; font-size: 18px; color: #E5E7EB; line-height: 1.6;">
                        Your 6-month multi-team organization license is now ready
                      </p>
                    </td>
                  </tr>

                  <!-- Important Notice -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <div style="background: rgba(251, 146, 60, 0.15); border-left: 4px solid #fb923c; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #fb923c;">
                          ⚠️ Important: Give Each Coach Their COACH Code First
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #E5E7EB; line-height: 1.6;">
                          Each team below has 2 codes. Each coach MUST redeem their COACH code before sharing the TEAM code with their players.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Team Codes -->
                  ${teamCodesHtml}

                  <!-- Setup Instructions -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #3b82f6;">
                          Setup Instructions:
                        </p>
                        <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #E5E7EB; line-height: 1.8;">
                          <li style="margin-bottom: 12px;">Download Mind & Muscle app (App Store or Google Play)</li>
                          <li style="margin-bottom: 12px;"><strong>Each coach</strong> redeems their COACH code (creates their team)</li>
                          <li style="margin-bottom: 12px;">Coaches customize their team name and settings</li>
                          <li>Coaches share their TEAM code with their athletes (${seatsPerTeam} seats per team)</li>
                        </ol>
                      </div>
                    </td>
                  </tr>

                  <!-- License Summary -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <div style="background: rgba(147, 51, 234, 0.1); border-left: 4px solid #9333ea; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #9333ea;">
                          Organization License Summary:
                        </p>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #E5E7EB; line-height: 1.8;">
                          <li><strong>${numberOfTeams} teams</strong> in your organization</li>
                          <li><strong>Seat allocation:</strong> ${seatsPerTeam.map((seats, idx) => `Team ${idx + 1}: ${seats}`).join(', ')}</li>
                          <li><strong>Total: ${seatsPerTeam.reduce((sum, seats) => sum + seats, 0)} seats</strong> for athletes and coaches</li>
                          <li><strong>Unlimited parent access</strong> (read-only, doesn't consume seats)</li>
                          <li>6-month seasonal license</li>
                        </ul>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px 40px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                      <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #ffffff;">
                        <span style="color: #3b82f6;">Discipline the Mind.</span> <span style="color: #fb923c;">Dominate the Game.</span>
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; color: #D1D5DB;">
                        100% Baseball. Zero Generic Content.
                      </p>
                      <p style="margin: 0 0 8px; font-size: 12px; color: #9CA3AF;">
                        Questions? <a href="mailto:support@mindandmuscle.ai" style="color: #3b82f6; text-decoration: none;">support@mindandmuscle.ai</a>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                        © ${new Date().getFullYear()} Mind & Muscle Performance. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    
    console.log('Multi-team organization email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending multi-team org email:', error);
    // Don't throw - we don't want email failure to break webhook processing
  }
}

// Create finder fee record and send admin notification email
async function createFinderFeeAndNotify(
  supabase: SupabaseClient,
  finderCode: string,
  referredOrgEmail: string,
  stripeSessionId: string,
  purchaseAmount: number
) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const feeAmount = purchaseAmount * 0.10; // 10% finder fee

  try {
    // Check if finder fee already exists for this organization (first purchase only)
    const { data: existingFee } = await supabase
      .from('finder_fees')
      .select('id')
      .eq('referred_org_email', referredOrgEmail)
      .single();

    if (existingFee) {
      console.log('Finder fee already exists for org:', referredOrgEmail);
      return;
    }

    // Create pending finder fee record
    const { data: fee, error } = await supabase
      .from('finder_fees')
      .insert({
        finder_code: finderCode,
        referred_org_email: referredOrgEmail,
        stripe_session_id: stripeSessionId,
        purchase_amount: purchaseAmount,
        fee_amount: feeAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating finder fee record:', error);
      return;
    }

    console.log('Finder fee record created:', fee.id, 'Amount:', feeAmount);

    // Send admin notification email with approve/reject buttons
    const baseUrl = 'https://mindandmuscle.ai/api/finder-fee-action';

    await resend.emails.send({
      from: 'Mind and Muscle <noreply@mindandmuscle.ai>',
      to: process.env.ADMIN_EMAIL || 'marketing@mindandmuscle.ai',
      subject: `Finder Fee: ${finderCode} → $${feeAmount.toFixed(2)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a1f35 0%, #2a3148 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 24px; color: #ffffff;">
                        💰 Finder Fee Pending Approval
                      </h1>
                    </td>
                  </tr>

                  <!-- Details Table -->
                  <tr>
                    <td style="padding: 30px;">
                      <table width="100%" cellpadding="12" cellspacing="0" style="border-collapse: collapse;">
                        <tr style="background: #f8fafc;">
                          <td style="border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Finder (Connector)</td>
                          <td style="border: 1px solid #e2e8f0; color: #1e293b; font-family: monospace; font-size: 16px;">${finderCode}</td>
                        </tr>
                        <tr>
                          <td style="border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Organization Email</td>
                          <td style="border: 1px solid #e2e8f0; color: #1e293b;">${referredOrgEmail}</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                          <td style="border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Purchase Amount</td>
                          <td style="border: 1px solid #e2e8f0; color: #1e293b;">$${purchaseAmount.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Finder Fee (10%)</td>
                          <td style="border: 1px solid #e2e8f0; color: #16a34a; font-weight: 700; font-size: 18px;">$${feeAmount.toFixed(2)}</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                          <td style="border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Stripe Session</td>
                          <td style="border: 1px solid #e2e8f0; color: #64748b; font-size: 12px; font-family: monospace;">${stripeSessionId}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Action Buttons -->
                  <tr>
                    <td style="padding: 0 30px 30px; text-align: center;">
                      <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">
                        Review and take action:
                      </p>
                      <a href="${baseUrl}?token=${fee.approve_token}&action=approve"
                         style="display: inline-block; background: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 12px;">
                        ✓ APPROVE
                      </a>
                      <a href="${baseUrl}?token=${fee.reject_token}&action=reject"
                         style="display: inline-block; background: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        ✗ REJECT
                      </a>
                    </td>
                  </tr>

                  <!-- Instructions -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px;">
                        <p style="margin: 0 0 8px; font-weight: 600; color: #92400e;">After approving:</p>
                        <ol style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.6;">
                          <li>Pay finder $${feeAmount.toFixed(2)} via PayPal or bank transfer</li>
                          <li>Click the "Mark Paid" button in the confirmation email</li>
                          <li>Finder will be automatically notified</li>
                        </ol>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                        Finder Fee System • Mind & Muscle
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log('Finder fee admin notification sent');
  } catch (error) {
    console.error('Error in createFinderFeeAndNotify:', error);
    // Don't throw - we don't want finder fee issues to break the main webhook flow
  }
}

// Send promo code admin notification
async function sendPromoCodeNotification(
  promoCode: string,
  customerEmail: string,
  seatCount: number,
  discountPercent: number,
  totalAmount: number,
  totalSaved: number,
  utmSource?: string,
  utmMedium?: string,
  utmCampaign?: string
) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    
    await resend.emails.send({
      from: 'Mind and Muscle <noreply@mindandmuscle.ai>',
      to: process.env.ADMIN_EMAIL || 'marketing@mindandmuscle.ai',
      subject: `🎉 Promo Code Used: ${promoCode} - ${discountPercent}% off ($${totalSaved.toFixed(2)} saved)`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0EA5E9 0%, #F97316 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 24px; color: #ffffff;">
                        🎉 Promo Code Used!
                      </h1>
                    </td>
                  </tr>

                  <!-- Code Badge -->
                  <tr>
                    <td style="padding: 30px; text-align: center;">
                      <div style="display: inline-block; background: linear-gradient(135deg, #0EA5E9 0%, #F97316 100%); padding: 16px 32px; border-radius: 12px; margin-bottom: 20px;">
                        <div style="font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: 2px; font-family: monospace;">
                          ${promoCode}
                        </div>
                      </div>
                    </td>
                  </tr>

                  <!-- Details Table -->}
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <table width="100%" cellpadding="12" cellspacing="0" style="border-collapse: collapse;">
                        <tr style="background: #f8fafc;">
                          <td style="border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Customer Email</td>
                          <td style="border: 1px solid #e2e8f0; color: #1e293b;">${customerEmail}</td>
                        </tr>
                        <tr>
                          <td style="border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Seats Purchased</td>
                          <td style="border: 1px solid #e2e8f0; color: #1e293b; font-weight: 700;">${seatCount}</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                          <td style="border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Discount Applied</td>
                          <td style="border: 1px solid #e2e8f0; color: #F97316; font-weight: 700; font-size: 18px;">${discountPercent}%</td>
                        </tr>
                        <tr>
                          <td style="border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Amount Charged</td>
                          <td style="border: 1px solid #e2e8f0; color: #16a34a; font-weight: 700; font-size: 18px;">$${totalAmount.toFixed(2)}</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                          <td style="border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Amount Saved</td>
                          <td style="border: 1px solid #e2e8f0; color: #dc2626; font-weight: 700; font-size: 18px;">-$${totalSaved.toFixed(2)}</td>
                        </tr>
                        ${utmSource || utmMedium || utmCampaign ? `
                        <tr>
                          <td colspan="2" style="border: 1px solid #e2e8f0; background: #fef3c7; padding: 16px;">
                            <p style="margin: 0 0 8px; font-weight: 600; color: #92400e; font-size: 14px;">📊 Attribution Data:</p>
                            <table width="100%" cellpadding="4" cellspacing="0">
                              ${utmSource ? `
                              <tr>
                                <td style="color: #78350f; font-size: 12px; padding: 2px 0;">Source:</td>
                                <td style="color: #78350f; font-size: 12px; font-weight: 600; padding: 2px 0;">${utmSource}</td>
                              </tr>
                              ` : ''}
                              ${utmMedium ? `
                              <tr>
                                <td style="color: #78350f; font-size: 12px; padding: 2px 0;">Medium:</td>
                                <td style="color: #78350f; font-size: 12px; font-weight: 600; padding: 2px 0;">${utmMedium}</td>
                              </tr>
                              ` : ''}
                              ${utmCampaign ? `
                              <tr>
                                <td style="color: #78350f; font-size: 12px; padding: 2px 0;">Campaign:</td>
                                <td style="color: #78350f; font-size: 12px; font-weight: 600; padding: 2px 0;">${utmCampaign}</td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                        Promo Code Notification • Mind & Muscle
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log('Promo code admin notification sent:', promoCode);
  } catch (error) {
    console.error('Error sending promo code notification:', error);
    // Don't throw - we don't want email failure to break webhook processing
  }
}

// Send team code email
async function sendTeamCodeEmail(email: string, coachCode: string, teamCode: string, seatCount: number) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: 'Mind and Muscle <noreply@mindandmuscle.ai>',
      to: email,
      subject: 'Your Team License is Active! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #1a1f35;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1f35; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(to bottom, #2a3148, #1f2537); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 20px;">
                      <a href="https://www.mindandmuscle.ai" style="display: block; text-decoration: none;">
                        <img src="https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/New%20MM%20Logo-transparent%20(1).png" alt="Mind & Muscle" width="120" style="display: block; max-width: 120px; height: auto;">
                      </a>
                    </td>
                  </tr>

                  <!-- Welcome Message -->
                  <tr>
                    <td style="padding: 20px 40px; text-align: center;">
                      <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 900; color: #ffffff;">
                        Your Team License is Active!
                      </h1>
                      <p style="margin: 0; font-size: 18px; color: #E5E7EB; line-height: 1.6;">
                        Welcome to Mind & Muscle. Your 6-month seasonal team license is now ready.
                      </p>
                    </td>
                  </tr>

                  <!-- IMPORTANT NOTICE -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <div style="background: rgba(251, 146, 60, 0.15); border-left: 4px solid #fb923c; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #fb923c;">
                          ⚠️ Two Codes - Use in Order!
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #E5E7EB; line-height: 1.6;">
                          You must redeem <strong style="color: #fb923c;">YOUR COACH CODE</strong> first before sharing the team code with others.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- COACH CODE -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <div style="background: rgba(16, 185, 129, 0.15); border-left: 4px solid #10b981; padding: 24px; border-radius: 8px;">
                        <p style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #10b981;">
                          ① YOUR COACH CODE (Use First!)
                        </p>
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; border: 2px dashed #10b981; text-align: center; margin: 16px 0;">
                          <div style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #10b981; font-family: 'Courier New', monospace;">
                            ${coachCode}
                          </div>
                        </div>
                        <ul style="color: #E5E7EB; padding-left: 20px; font-size: 14px; margin: 12px 0; line-height: 1.8;">
                          <li><strong style="color: #10b981;">Single use only</strong> - for YOU as the coach</li>
                          <li>Creates your team and makes you the owner</li>
                          <li>Unlocks Premium features for you</li>
                          <li>Makes team visible in Chatter</li>
                        </ul>
                        <p style="color: #10b981; font-weight: bold; margin: 12px 0 0 0; text-align: center; font-size: 14px;">
                          👉 Redeem this code FIRST: More → Settings → Redeem Team Code
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- TEAM CODE -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <div style="background: rgba(59, 130, 246, 0.15); border-left: 4px solid #3b82f6; padding: 24px; border-radius: 8px;">
                        <p style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #3b82f6;">
                          ② TEAM MEMBER CODE (Share with Your Team)
                        </p>
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; border: 2px dashed #3b82f6; text-align: center; margin: 16px 0;">
                          <div style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #3b82f6; font-family: 'Courier New', monospace;">
                            ${teamCode}
                          </div>
                        </div>

                        <!-- Parent Info Highlight -->
                        <div style="background: rgba(34, 197, 94, 0.15); border: 2px solid #22c55e; padding: 12px; border-radius: 6px; margin: 16px 0;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #22c55e; text-align: center;">
                            💚 Parents Join FREE - No Seat Required!
                          </p>
                          <p style="margin: 4px 0 0 0; font-size: 12px; color: #E5E7EB; text-align: center;">
                            When they register as a parent, they get read-only access without consuming any of your ${seatCount} paid seat${seatCount === 1 ? '' : 's'}
                          </p>
                        </div>

                        <ul style="color: #E5E7EB; padding-left: 20px; font-size: 14px; margin: 12px 0; line-height: 1.8;">
                          <li><strong style="color: #3b82f6;">Share with ${seatCount} athlete${seatCount === 1 ? '' : 's'}/coach${seatCount === 1 ? '' : 'es'}</strong> (each uses 1 seat)</li>
                          <li><strong style="color: #22c55e;">Parents: Unlimited FREE access</strong> (monitor progress, no seat used)</li>
                          <li>Adds everyone to your team chat and updates</li>
                        </ul>
                        <p style="color: #3b82f6; font-weight: bold; margin: 12px 0 0 0; text-align: center; font-size: 14px;">
                          📱 Share this code with your team members and parents
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- NEXT STEPS -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px;">
                        <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #3b82f6;">
                          Setup Instructions:
                        </p>
                        <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #E5E7EB; line-height: 1.8;">
                          <li style="margin-bottom: 8px;">Download Mind & Muscle from App Store or Google Play</li>
                          <li style="margin-bottom: 8px;">YOU redeem your coach code first (${coachCode})</li>
                          <li style="margin-bottom: 8px;">Customize your team name and settings</li>
                          <li>Share the team code (${teamCode}) with your athletes and parents</li>
                        </ol>
                      </div>
                    </td>
                  </tr>

                  <!-- LICENSE INFO -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <div style="background: rgba(251, 146, 60, 0.1); border-left: 4px solid #fb923c; padding: 16px; border-radius: 8px;">
                        <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #fb923c;">
                          License Details:
                        </p>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #E5E7EB; line-height: 1.8;">
                          <li><strong>${seatCount} Premium seats</strong> for athletes and coaches</li>
                          <li><strong>Unlimited parent access</strong> (read-only, doesn't consume seats)</li>
                          <li>Subscription renews every 6 months</li>
                        </ul>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px 40px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                      <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #ffffff;">
                        <span style="color: #3b82f6;">Discipline the Mind.</span> <span style="color: #fb923c;">Dominate the Game.</span>
                      </p>
                      <p style="margin: 0 0 16px; font-size: 14px; color: #D1D5DB;">
                        100% Baseball. Zero Generic Content.
                      </p>
                      <p style="margin: 0 0 8px; font-size: 12px; color: #9CA3AF;">
                        Questions? <a href="mailto:support@mindandmuscle.ai" style="color: #3b82f6; text-decoration: none;">support@mindandmuscle.ai</a>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                        © ${new Date().getFullYear()} Mind & Muscle Performance. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log('Team code email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - we don't want email failure to break webhook processing
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  // Initialize Stripe client
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-09-30.acacia',
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('Checkout session completed:', session.id);

      // Extract metadata
      const seatCount = parseInt(session.metadata?.seat_count || '0');
      const discountPercentage = parseInt(session.metadata?.discount_percentage || '0');
      const pricePerSeat = parseFloat(session.metadata?.price_per_seat || '0');
      const toltReferral = session.metadata?.tolt_referral; // Partner referral code
      const customerEmail = session.customer_email;

      // Get both codes that were generated during checkout
      const coachCode = session.metadata?.coach_code;
      const teamCode = session.metadata?.team_code;
      const promoCode = session.metadata?.promo_code;
      const promoDiscountPercent = session.metadata?.promo_discount_percent 
        ? parseInt(session.metadata.promo_discount_percent) 
        : null;
      
      // Multi-team organization fields
      const isMultiTeamOrg = session.metadata?.is_multi_team_org === 'true';
      const organizationName = session.metadata?.organization_name;
      const numberOfTeams = session.metadata?.number_of_teams 
        ? parseInt(session.metadata.number_of_teams) 
        : 0;
      const seatsPerTeamJson = session.metadata?.seats_per_team;
      const seatsPerTeam: number[] = seatsPerTeamJson ? JSON.parse(seatsPerTeamJson) : [];

      if (!seatCount || !customerEmail || !coachCode || !teamCode) {
        console.error('Missing required metadata in session:', session.id);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }
      
      // Handle multi-team organization setup
      if (isMultiTeamOrg && organizationName && numberOfTeams > 1) {
        console.log('Multi-team organization purchase detected:', organizationName, numberOfTeams, 'teams');
        
        // Use custom seat allocation if provided, otherwise divide equally
        const teamSeatAllocations = seatsPerTeam.length === numberOfTeams 
          ? seatsPerTeam 
          : Array(numberOfTeams).fill(Math.floor(seatCount / numberOfTeams));
        
        // Create parent organization license
        const { data: orgLicense, error: orgError } = await supabase
          .from('organization_licenses')
          .insert({
            organization_name: organizationName,
            admin_email: customerEmail,
            total_license_seats: seatCount,
            seats_per_team: seatsPerTeam,
            number_of_teams: numberOfTeams,
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            subscription_status: 'active',
            discount_percentage: discountPercentage,
            price_per_seat: pricePerSeat,
            metadata: {
              total_amount: session.amount_total ? session.amount_total / 100 : 0,
              created_from_session: session.id,
              ...(toltReferral && { tolt_referral: toltReferral }),
              ...(promoCode && { promo_code: promoCode }),
            },
          })
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization license:', orgError);
          return NextResponse.json({ error: 'Failed to create organization license' }, { status: 500 });
        }

        console.log('Organization license created:', orgLicense.id);

        // Generate codes for each team
        const teamCodes: Array<{ teamNumber: number; coachCode: string; teamCode: string; teamId: string }> = [];

        for (let i = 1; i <= numberOfTeams; i++) {
          const teamCoachCode = generateCoachCode();
          const teamTeamCode = generateTeamCode();
          const teamSeats = teamSeatAllocations[i - 1]; //  Get seats for this specific team

          // Create team record
          const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert({
              name: `${organizationName} - Team ${i}`,
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              admin_email: customerEmail,
              license_seats_total: teamSeats,
              license_seats_consumed: 0,
              is_premium: true,
              subscription_status: 'active',
              // NO created_by_user_id - will be set when coach redeems
              metadata: {
                coach_code: teamCoachCode,
                team_code: teamTeamCode,
                organization_license_id: orgLicense.id,
                team_number: i,
                discount_percentage: discountPercentage,
                price_per_seat: pricePerSeat,
                created_from_session: session.id,
              },
            })
            .select()
            .single();

          if (teamError) {
            console.error(`Error creating team ${i}:`, teamError);
            continue; // Log error but continue with other teams
          }

          // Create coach code (single-use)
          const { data: coachJoinCode, error: coachCodeError } = await supabase
            .from('team_join_codes')
            .insert({
              code: teamCoachCode,
              team_id: team.id,
              max_uses: 1,
              uses_count: 0,
              is_active: true,
              tier: 'premium',
              code_type: 'coach',
              allow_parent_linking: false,
            })
            .select()
            .single();

          if (coachCodeError) {
            console.error(`Error creating coach code for team ${i}:`, coachCodeError);
            continue;
          }

          // Create team member code (multi-use)
          const { data: teamJoinCode, error: teamCodeError } = await supabase
            .from('team_join_codes')
            .insert({
              code: teamTeamCode,
              team_id: team.id,
              max_uses: teamSeats,
              uses_count: 0,
              is_active: true,
              tier: 'premium',
              code_type: 'member',
              allow_parent_linking: true,
              linked_code_id: coachJoinCode.id,
            })
            .select()
            .single();

          if (teamCodeError) {
            console.error(`Error creating team code for team ${i}:`, teamCodeError);
            continue;
          }

          // Link codes bidirectionally
          await supabase
            .from('team_join_codes')
            .update({ linked_code_id: teamJoinCode.id })
            .eq('id', coachJoinCode.id);

          // Record access code in organization_access_codes table
          await supabase
            .from('organization_access_codes')
            .insert({
              code: teamCoachCode,
              code_type: 'coach',
              team_id: team.id,
              parent_organization_id: orgLicense.id,
              max_redemptions: 1,
              is_active: true,
            });

          await supabase
            .from('organization_access_codes')
            .insert({
              code: teamTeamCode,
              code_type: 'team',
              team_id: team.id,
              parent_organization_id: orgLicense.id,
              max_redemptions: teamSeats,
              is_active: true,
            });

          teamCodes.push({
            teamNumber: i,
            coachCode: teamCoachCode,
            teamCode: teamTeamCode,
            teamId: team.id,
          });

          console.log(`Team ${i} created with codes - Coach: ${teamCoachCode}, Team: ${teamTeamCode}`);
        }

        // Send multi-team organization email
        await sendMultiTeamOrgEmail(customerEmail, organizationName, numberOfTeams, teamSeatAllocations, teamCodes);

        console.log('Multi-team organization setup complete:', orgLicense.id);

        // Handle promo tracking and finder fees for multi-team org
        if (promoCode && promoDiscountPercent) {
          // [Same promo tracking code as before]
        }

        if (session.metadata?.finder_code) {
          const purchaseAmount = session.amount_total ? session.amount_total / 100 : 0;
          await createFinderFeeAndNotify(supabase, session.metadata.finder_code, customerEmail, session.id, purchaseAmount);
        }

        // Skip the standard single-team setup below
        break;
      }

      // Create team record WITHOUT owner (will be set when coach redeems)
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: `Team ${coachCode}`, // Temporary name, can be changed by admin later
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
          admin_email: customerEmail,
          license_seats_total: seatCount,
          license_seats_consumed: 0,
          is_premium: true,
          subscription_status: 'active',
          // NO created_by_user_id - will be set when coach redeems
          metadata: {
            coach_code: coachCode,
            team_code: teamCode,
            discount_percentage: discountPercentage,
            price_per_seat: pricePerSeat,
            total_amount: session.amount_total ? session.amount_total / 100 : 0,
            created_from_session: session.id,
            ...(toltReferral && { tolt_referral: toltReferral }), // Store for renewal tracking
          },
        })
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        return NextResponse.json(
          { error: 'Failed to create team' },
          { status: 500 }
        );
      }

      console.log('Team created:', team.id);

      // Create coach code (single-use)
      const { data: coachJoinCode, error: coachCodeError } = await supabase
        .from('team_join_codes')
        .insert({
          code: coachCode,
          team_id: team.id,
          max_uses: 1, // Single use
          uses_count: 0,
          is_active: true,
          tier: 'premium',
          code_type: 'coach',
          allow_parent_linking: false, // Coaches only
        })
        .select()
        .single();

      if (coachCodeError) {
        console.error('Error creating coach code:', coachCodeError);
        await supabase.from('teams').delete().eq('id', team.id);
        return NextResponse.json({ error: 'Failed to create coach code' }, { status: 500 });
      }

      // Create team member code (multi-use)
      const { data: teamJoinCode, error: teamCodeError } = await supabase
        .from('team_join_codes')
        .insert({
          code: teamCode,
          team_id: team.id,
          max_uses: seatCount,
          uses_count: 0,
          is_active: true,
          tier: 'premium',
          code_type: 'member',
          allow_parent_linking: true,
          linked_code_id: coachJoinCode.id, // Link to coach code
        })
        .select()
        .single();

      if (teamCodeError) {
        console.error('Error creating team code:', teamCodeError);
        // Rollback: delete coach code and team
        await supabase.from('team_join_codes').delete().eq('id', coachJoinCode.id);
        await supabase.from('teams').delete().eq('id', team.id);
        return NextResponse.json({ error: 'Failed to create team code' }, { status: 500 });
      }

      // Link codes together (bidirectional)
      await supabase
        .from('team_join_codes')
        .update({ linked_code_id: teamJoinCode.id })
        .eq('id', coachJoinCode.id);

      console.log('Coach code created:', coachCode, 'Team code created:', teamCode, 'for team:', team.id);

      // Track promo code redemption if present
      if (promoCode && promoDiscountPercent) {
        try {
          // Get promo code ID from database
          const { data: promoCodeData } = await supabase
            .from('promo_codes')
            .select('id')
            .eq('code', promoCode.toUpperCase())
            .single();

          if (promoCodeData) {
            // Record redemption
            await supabase
              .from('promo_code_redemptions')
              .insert({
                promo_code_id: promoCodeData.id,
                code: promoCode.toUpperCase(),
                redeemed_by_email: customerEmail,
                stripe_session_id: session.id,
                discount_applied: promoDiscountPercent,
                team_id: team.id,
              });

            // Increment redemption count - fetch current and add 1
            const { data: currentPromo } = await supabase
              .from('promo_codes')
              .select('redemptions_count')
              .eq('id', promoCodeData.id)
              .single();
            
            if (currentPromo) {
              await supabase
                .from('promo_codes')
                .update({ redemptions_count: currentPromo.redemptions_count + 1 })
                .eq('id', promoCodeData.id);
            }

            console.log('Promo code redemption tracked:', promoCode);
            
            // Send admin notification about promo code usage
            const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
            const pricePerSeatBeforePromo = pricePerSeat / (1 - (promoDiscountPercent / 100));
            const totalBeforePromo = pricePerSeatBeforePromo * seatCount;
            const totalSaved = totalBeforePromo - totalAmount;
            
            await sendPromoCodeNotification(
              promoCode.toUpperCase(),
              customerEmail,
              seatCount,
              promoDiscountPercent,
              totalAmount,
              totalSaved,
              session.metadata?.utm_source,
              session.metadata?.utm_medium,
              session.metadata?.utm_campaign
            );
          }
        } catch (error) {
          console.error('Error tracking promo code redemption:', error);
          // Don't fail the webhook if promo tracking fails
        }
      }

      // Send team code email
      await sendTeamCodeEmail(customerEmail, coachCode, teamCode, seatCount);

      // Tolt tracking: Tolt automatically tracks conversions via their Stripe webhook
      // integration. The tolt_referral in session.metadata is all they need.
      if (toltReferral) {
        console.log('Tolt referral tracked in Stripe metadata:', toltReferral);
        console.log('Tolt will automatically track this conversion via Stripe webhook');
      }

      // Finder fee tracking: If a finder code is present, create a pending finder fee
      // This is separate from Tolt's recurring commission - it's a one-time 10% fee
      const finderCode = session.metadata?.finder_code;
      if (finderCode) {
        const purchaseAmount = session.amount_total ? session.amount_total / 100 : 0;
        console.log('Finder code detected:', finderCode, 'Purchase amount:', purchaseAmount);

        // Create finder fee record and send admin notification
        // Note: If both finder and tolt_referral exist, finder takes priority (one-time fee)
        // The tolt_referral won't earn recurring commission on this purchase
        await createFinderFeeAndNotify(
          supabase,
          finderCode,
          customerEmail,
          session.id,
          purchaseAmount
        );
      }

      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;

      // Handle successful renewal payment
      if (invoice.subscription) {
        console.log('Subscription payment succeeded:', invoice.subscription);

        // Update team subscription status to active (in case it was inactive)
        const { data: teamData, error: updateError } = await supabase
          .from('teams')
          .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', invoice.subscription)
          .select('metadata, admin_email')
          .single();

        if (updateError) {
          console.error('Error updating team license status:', updateError);
        }

        // Tolt tracking for renewals: Tolt automatically tracks subscription
        // renewals via their Stripe webhook integration. No manual API call needed.
        // The tolt_referral in the subscription metadata is sufficient.
        console.log('Subscription renewal - Tolt will track via Stripe webhook');
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;

      // Handle failed payment
      if (invoice.subscription) {
        console.log('Subscription payment failed:', invoice.subscription);

        // Update team subscription status to inactive
        const { error: updateError } = await supabase
          .from('teams')
          .update({
            subscription_status: 'inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', invoice.subscription);

        if (updateError) {
          console.error('Error updating team license status:', updateError);
        }

        // TODO: Send email notification to admin about failed payment
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      // Handle subscription cancellation
      console.log('Subscription deleted:', subscription.id);

      const { error: updateError } = await supabase
        .from('teams')
        .update({
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      if (updateError) {
        console.error('Error updating team license status:', updateError);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
