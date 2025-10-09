import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { teamCode } = await request.json();

    if (!teamCode) {
      return NextResponse.json(
        { error: 'Team code is required' },
        { status: 400 }
      );
    }

    // Search for subscription by team code in metadata
    const subscriptions = await stripe.subscriptions.search({
      query: `metadata['team_code']:'${teamCode}' AND status:'active'`,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'Team code not found or subscription is not active' },
        { status: 404 }
      );
    }

    const subscription = subscriptions.data[0];
    const metadata = subscription.metadata;

    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer as string);

    return NextResponse.json({
      teamCode: metadata.team_code,
      currentSeats: parseInt(metadata.seat_count || '12'),
      lockedInRate: parseFloat(metadata.price_per_seat || '107.10'),
      discountPercentage: parseInt(metadata.discount_percentage || '10'),
      purchaseDate: new Date(subscription.created * 1000).toISOString(),
      subscriptionId: subscription.id,
      customerEmail: (customer as any).email || '',
    });
  } catch (error: any) {
    console.error('Error looking up team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to lookup team code' },
      { status: 500 }
    );
  }
}
