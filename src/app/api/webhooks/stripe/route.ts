import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Force dynamic rendering - don't try to statically generate this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
            <title>Your Team License is Active</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Mind and Muscle!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your 6-month seasonal team license is now active</p>
            </div>

            <!-- IMPORTANT NOTICE -->
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #92400e; font-size: 18px;">⚠️ Two Codes - Use in Order!</h3>
              <p style="color: #78350f; margin: 0; font-size: 14px; font-weight: bold;">
                You must redeem YOUR COACH CODE first before sharing the team code with others.
              </p>
            </div>

            <!-- COACH CODE -->
            <div style="background: #f0fdf4; padding: 30px; border-radius: 10px; margin-bottom: 20px; border: 3px solid #10b981;">
              <h2 style="margin-top: 0; color: #065f46; font-size: 20px;">
                ①  YOUR COACH CODE (Use First!)
              </h2>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 2px dashed #10b981; text-align: center; margin: 20px 0;">
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #10b981; font-family: 'Courier New', monospace;">
                  ${coachCode}
                </div>
              </div>
              <ul style="color: #065f46; padding-left: 20px; font-size: 14px; margin: 15px 0;">
                <li><strong>Single use only - for YOU as the coach</strong></li>
                <li>Creates your team and makes you the owner</li>
                <li>Unlocks Premium features for you</li>
                <li>Makes team visible in Chatter</li>
              </ul>
              <p style="color: #047857; font-weight: bold; margin: 15px 0 0 0; text-align: center;">
                👉 Redeem this code FIRST in the app: More → Settings → Redeem Team Code
              </p>
            </div>

            <!-- TEAM CODE -->
            <div style="background: #eff6ff; padding: 30px; border-radius: 10px; margin-bottom: 30px; border: 2px solid #3b82f6;">
              <h2 style="margin-top: 0; color: #1e40af; font-size: 20px;">
                ②  TEAM MEMBER CODE (Share with Your Team)
              </h2>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 2px dashed #3b82f6; text-align: center; margin: 20px 0;">
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #3b82f6; font-family: 'Courier New', monospace;">
                  ${teamCode}
                </div>
              </div>
              <ul style="color: #1e40af; padding-left: 20px; font-size: 14px; margin: 15px 0;">
                <li><strong>Share with ${seatCount} athletes/coaches</strong></li>
                <li>Athletes & coaches get Premium access</li>
                <li>Parents get free read-only access (unlimited!)</li>
                <li>Adds everyone to your team</li>
              </ul>
              <p style="color: #2563eb; font-weight: bold; margin: 15px 0 0 0; text-align: center;">
                📱 Share this code with your team members
              </p>
            </div>

            <!-- NEXT STEPS -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; font-size: 20px;">Setup Instructions:</h2>
              <ol style="color: #4b5563; padding-left: 20px;">
                <li style="margin-bottom: 15px;">
                  <strong>Download the app</strong><br>
                  <span style="font-size: 14px;">Get Mind and Muscle from the App Store or Google Play</span>
                </li>
                <li style="margin-bottom: 15px;">
                  <strong>YOU redeem your coach code first</strong><br>
                  <span style="font-size: 14px;">Go to More → Settings → Redeem Team Code → Enter: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${coachCode}</code></span>
                </li>
                <li style="margin-bottom: 15px;">
                  <strong>Name your team</strong><br>
                  <span style="font-size: 14px;">After redeeming, you can customize your team name and settings</span>
                </li>
                <li style="margin-bottom: 15px;">
                  <strong>Share the team code</strong><br>
                  <span style="font-size: 14px;">Send <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${teamCode}</code> to your athletes and parents</span>
                </li>
              </ol>
            </div>

            <!-- LICENSE INFO -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #4b5563; font-size: 16px;">License Details:</h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px; font-size: 14px;">
                <li><strong>${seatCount} Premium seats</strong> for athletes and coaches</li>
                <li><strong>Unlimited parent access</strong> (read-only, doesn't consume seats)</li>
                <li>Subscription renews every 6 months</li>
                <li>Manage subscription at mindandmuscle.ai/team-licensing/manage</li>
              </ul>
            </div>

            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
              <p>Questions? Contact us at <a href="mailto:support@mindandmuscle.ai" style="color: #667eea; text-decoration: none;">support@mindandmuscle.ai</a></p>
              <p style="margin-top: 15px;">© ${new Date().getFullYear()} Mind and Muscle. All rights reserved.</p>
            </div>
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

      if (!seatCount || !customerEmail || !coachCode || !teamCode) {
        console.error('Missing required metadata in session:', session.id);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
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

      // Send email with both codes
      await sendTeamCodeEmail(customerEmail, coachCode, teamCode, seatCount);

      // Notify Tolt of conversion (for partner commission tracking)
      if (toltReferral) {
        try {
          const totalAmount = (session.amount_total || 0) / 100; // Convert cents to dollars

          await fetch(`${request.url.split('/api')[0]}/api/webhooks/tolt-conversion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              referralCode: toltReferral,
              amount: totalAmount,
              customerEmail: customerEmail,
              subscriptionId: session.subscription as string,
              isRenewal: false,
            }),
          });

          console.log('Tolt conversion notification sent for:', toltReferral);
        } catch (error) {
          console.error('Failed to notify Tolt:', error);
          // Don't throw - we don't want Tolt failures to break checkout
        }
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

        // Notify Tolt of renewal commission (recurring revenue)
        // Get the original tolt_referral from team metadata or subscription metadata
        let toltReferral: string | null = null;

        if (teamData?.metadata && typeof teamData.metadata === 'object') {
          const metadata = teamData.metadata as { tolt_referral?: string };
          toltReferral = metadata.tolt_referral || null;
        }

        // If not in team metadata, fetch from subscription
        if (!toltReferral && typeof invoice.subscription === 'string') {
          try {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            toltReferral = subscription.metadata?.tolt_referral || null;
          } catch (error) {
            console.error('Error fetching subscription:', error);
          }
        }

        // Send renewal commission to Tolt
        if (toltReferral) {
          try {
            const totalAmount = (invoice.amount_paid || 0) / 100; // Convert cents to dollars

            await fetch(`${request.url.split('/api')[0]}/api/webhooks/tolt-conversion`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                referralCode: toltReferral,
                amount: totalAmount,
                customerEmail: invoice.customer_email || teamData?.admin_email || 'unknown@email.com',
                subscriptionId: invoice.subscription,
                isRenewal: true, // This is a renewal, not initial purchase
              }),
            });

            console.log('Tolt renewal commission sent for:', toltReferral);
          } catch (error) {
            console.error('Failed to notify Tolt of renewal:', error);
            // Don't throw - we don't want Tolt failures to break webhook
          }
        }
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
