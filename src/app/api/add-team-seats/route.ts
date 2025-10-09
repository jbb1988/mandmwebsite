import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { teamCode, subscriptionId, additionalSeats, lockedInRate } = await request.json();

    if (!teamCode || !subscriptionId || !additionalSeats || !lockedInRate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (additionalSeats < 1) {
      return NextResponse.json(
        { error: 'Additional seats must be at least 1' },
        { status: 400 }
      );
    }

    // Retrieve the subscription to validate and get current data
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription not found or not active' },
        { status: 404 }
      );
    }

    const currentSeats = parseInt(subscription.metadata.seat_count || '12');
    const maxAllowedSeats = currentSeats * 2;
    const newTotalSeats = currentSeats + additionalSeats;

    // Enforce 2x maximum rule
    if (newTotalSeats > maxAllowedSeats) {
      return NextResponse.json(
        { error: `Cannot exceed ${maxAllowedSeats} total seats (2x your original ${currentSeats} seats). Please contact support for larger teams.` },
        { status: 400 }
      );
    }

    // Get customer ID from the subscription
    const customerId = subscription.customer as string;

    // Create a NEW separate subscription for the additional seats
    // This way each seat addition has its own 12-month billing cycle
    const newSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Mind and Muscle Team License - Additional Seats`,
              description: `Additional ${additionalSeats} seats at locked-in rate of $${lockedInRate.toFixed(2)}/seat`,
            },
            unit_amount: Math.round(lockedInRate * 100), // Price per seat in cents
            recurring: {
              interval: 'year',
            },
          },
          quantity: additionalSeats,
        },
      ],
      metadata: {
        parent_subscription_id: subscriptionId,
        team_code: teamCode,
        seat_count: additionalSeats.toString(),
        price_per_seat: lockedInRate.toString(),
        is_additional_seats: 'true',
      },
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
    });

    // Update the original subscription metadata to track total seats
    await stripe.subscriptions.update(subscriptionId, {
      metadata: {
        ...subscription.metadata,
        seat_count: newTotalSeats.toString(),
      },
    });

    // Get the payment intent for the new subscription
    const latestInvoiceId = newSubscription.latest_invoice as string;
    const invoice = await stripe.invoices.retrieve(latestInvoiceId);
    const paymentIntentId = invoice.payment_intent as string;

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Return the hosted invoice URL for payment
      return NextResponse.json({
        success: true,
        url: invoice.hosted_invoice_url,
        amountDue: invoice.amount_due / 100,
        newTotalSeats,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Seats added successfully',
      newTotalSeats,
    });

  } catch (error: any) {
    console.error('Error adding team seats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add seats' },
      { status: 500 }
    );
  }
}
