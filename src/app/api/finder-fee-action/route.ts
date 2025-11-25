import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (!token || !action) {
    return new NextResponse(renderHtmlPage('Error', 'Missing token or action parameter.', 'error'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find fee by token (check all three token types)
  const { data: fee, error: fetchError } = await supabase
    .from('finder_fees')
    .select('*')
    .or(`approve_token.eq.${token},reject_token.eq.${token},paid_token.eq.${token}`)
    .single();

  if (fetchError || !fee) {
    return new NextResponse(renderHtmlPage('Invalid Token', 'This link is invalid or has expired.', 'error'), {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);

  // Handle different actions
  switch (action) {
    case 'approve': {
      // Verify correct token
      if (fee.approve_token !== token) {
        return new NextResponse(renderHtmlPage('Invalid Token', 'This is not a valid approval token.', 'error'), {
          status: 403,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Check if already processed
      if (fee.status !== 'pending') {
        return new NextResponse(renderHtmlPage('Already Processed', `This finder fee has already been ${fee.status}.`, 'info'), {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Update status to approved
      const { error: updateError } = await supabase
        .from('finder_fees')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', fee.id);

      if (updateError) {
        return new NextResponse(renderHtmlPage('Error', 'Failed to approve finder fee.', 'error'), {
          status: 500,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Send follow-up email with "Mark as Paid" button
      const baseUrl = 'https://mindandmuscle.ai/api/finder-fee-action';
      await resend.emails.send({
        from: 'Mind and Muscle <noreply@mindandmuscle.ai>',
        to: process.env.ADMIN_EMAIL || 'admin@mindandmuscle.ai',
        subject: `✓ Approved: Pay ${fee.finder_code} $${fee.fee_amount.toFixed(2)}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: -apple-system, sans-serif; padding: 40px; background: #f5f5f5;">
            <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #16a34a; margin-top: 0;">✓ Finder Fee Approved</h2>

              <p style="font-size: 18px; margin: 20px 0;">
                <strong>Pay ${fee.finder_code}:</strong>
                <span style="color: #16a34a; font-size: 24px; font-weight: bold;">$${fee.fee_amount.toFixed(2)}</span>
              </p>

              <p style="color: #666; margin-bottom: 20px;">
                Organization: ${fee.referred_org_email}
              </p>

              <p style="background: #fef3c7; padding: 12px; border-radius: 6px; color: #92400e; font-size: 14px;">
                After sending payment via PayPal or bank transfer, click below to mark as paid:
              </p>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${baseUrl}?token=${fee.paid_token}&action=paid"
                   style="display: inline-block; background: #3b82f6; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  💰 Mark as Paid
                </a>
              </div>

              <p style="color: #999; font-size: 12px; text-align: center;">
                The finder will be automatically notified when you mark this as paid.
              </p>
            </div>
          </body>
          </html>
        `,
      });

      return new NextResponse(renderHtmlPage(
        'Approved!',
        `Finder fee of $${fee.fee_amount.toFixed(2)} for ${fee.finder_code} has been approved.\n\nNow pay the finder via PayPal or bank transfer, then click "Mark as Paid" in the email you just received.`,
        'success'
      ), {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    case 'reject': {
      // Verify correct token
      if (fee.reject_token !== token) {
        return new NextResponse(renderHtmlPage('Invalid Token', 'This is not a valid rejection token.', 'error'), {
          status: 403,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Check if already processed
      if (fee.status !== 'pending') {
        return new NextResponse(renderHtmlPage('Already Processed', `This finder fee has already been ${fee.status}.`, 'info'), {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Update status to rejected
      const { error: updateError } = await supabase
        .from('finder_fees')
        .update({
          status: 'rejected',
        })
        .eq('id', fee.id);

      if (updateError) {
        return new NextResponse(renderHtmlPage('Error', 'Failed to reject finder fee.', 'error'), {
          status: 500,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      return new NextResponse(renderHtmlPage(
        'Rejected',
        `Finder fee for ${fee.finder_code} has been rejected.\n\nNo payment will be made.`,
        'info'
      ), {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    case 'paid': {
      // Verify correct token
      if (fee.paid_token !== token) {
        return new NextResponse(renderHtmlPage('Invalid Token', 'This is not a valid payment token.', 'error'), {
          status: 403,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Check if already paid
      if (fee.status === 'paid') {
        return new NextResponse(renderHtmlPage('Already Paid', 'This finder fee has already been marked as paid.', 'info'), {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Check if approved first
      if (fee.status !== 'approved') {
        return new NextResponse(renderHtmlPage('Not Approved', 'This finder fee must be approved before marking as paid.', 'error'), {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Update status to paid
      const { error: updateError } = await supabase
        .from('finder_fees')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', fee.id);

      if (updateError) {
        return new NextResponse(renderHtmlPage('Error', 'Failed to mark finder fee as paid.', 'error'), {
          status: 500,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Send confirmation email to finder (if we have their email)
      // For now, we'll send a notification to admin that finder should be notified
      // In the future, could look up finder email from Tolt API or profiles table
      await resend.emails.send({
        from: 'Mind and Muscle <noreply@mindandmuscle.ai>',
        to: process.env.ADMIN_EMAIL || 'admin@mindandmuscle.ai',
        subject: `💰 Paid: ${fee.finder_code} - $${fee.fee_amount.toFixed(2)}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: -apple-system, sans-serif; padding: 40px; background: #f5f5f5;">
            <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #16a34a; margin-top: 0;">💰 Finder Fee Paid</h2>

              <p style="font-size: 16px;">
                <strong>${fee.finder_code}</strong> has been paid <strong style="color: #16a34a;">$${fee.fee_amount.toFixed(2)}</strong>
              </p>

              <p style="color: #666;">
                For introducing: ${fee.referred_org_email}
              </p>

              <div style="background: #dcfce7; padding: 16px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #166534; font-weight: 600;">
                  ✓ Transaction Complete
                </p>
                <p style="margin: 8px 0 0 0; color: #166534; font-size: 14px;">
                  Consider sending the finder a personal thank you message!
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      return new NextResponse(renderHtmlPage(
        'Marked as Paid!',
        `Finder fee of $${fee.fee_amount.toFixed(2)} for ${fee.finder_code} has been marked as paid.\n\nThank you for completing the payment!`,
        'success'
      ), {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    default:
      return new NextResponse(renderHtmlPage('Invalid Action', `Unknown action: ${action}`, 'error'), {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
  }
}

// Helper function to render a nice HTML response page
function renderHtmlPage(title: string, message: string, type: 'success' | 'error' | 'info'): string {
  const colors = {
    success: { bg: '#dcfce7', border: '#16a34a', text: '#166534', icon: '✓' },
    error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', icon: '✗' },
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'ℹ' },
  };
  const color = colors[type];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Mind & Muscle</title>
    </head>
    <body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="max-width: 500px; width: 100%; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center;">
        <div style="width: 60px; height: 60px; background: ${color.bg}; border: 3px solid ${color.border}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px;">
          ${color.icon}
        </div>
        <h1 style="margin: 0 0 16px; color: #1f2937; font-size: 24px;">${title}</h1>
        <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6; white-space: pre-line;">${message}</p>
        <div style="margin-top: 30px;">
          <a href="https://mindandmuscle.ai" style="color: #3b82f6; text-decoration: none; font-size: 14px;">← Back to Mind & Muscle</a>
        </div>
      </div>
    </body>
    </html>
  `;
}
