import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the deletion request in database
    const { error: logError } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: userId,
        email: email,
        requested_at: new Date().toISOString(),
        status: 'pending'
      });

    if (logError) {
      console.error('Error logging deletion request:', logError);
    }

    // Send notification email to support team
    await resend.emails.send({
      from: 'Mind & Muscle <noreply@mindandmuscle.ai>',
      to: 'support@mindandmuscle.ai',
      subject: `🗑️ Account Deletion Request - ${email}`,
      html: `
        <h2>Account Deletion Request</h2>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Requested:</strong> ${new Date().toISOString()}</p>
        <p><strong>Timeline:</strong> Must be completed within 30 days</p>
        <hr />
        <p><em>This request was submitted via the self-service account deletion page.</em></p>
      `
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: 'Mind & Muscle <noreply@mindandmuscle.ai>',
      to: email,
      subject: 'Account Deletion Request Received',
      html: `
        <h2>Account Deletion Request Received</h2>
        <p>We have received your request to delete your Mind & Muscle account.</p>
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>Your account and all associated data will be permanently deleted within 30 days</li>
          <li>You will receive a confirmation email once the deletion is complete</li>
          <li>This action cannot be undone</li>
        </ul>
        <p><strong>Important:</strong> If you have an active subscription, please cancel it through the App Store or Google Play to avoid future charges.</p>
        <hr />
        <p>If you did not request this deletion, please contact us immediately at support@mindandmuscle.ai</p>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Account deletion request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process deletion request' },
      { status: 500 }
    );
  }
}
