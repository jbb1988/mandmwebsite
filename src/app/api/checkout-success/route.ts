import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-09-30.acacia',
    });
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get subscription metadata
    const subscription = session.subscription as Stripe.Subscription;
    const metadata = subscription?.metadata || session.metadata;

    return NextResponse.json({
      coachCode: metadata.coach_code || '',
      teamCode: metadata.team_code || '',
      email: session.customer_details?.email || '',
      seatCount: parseInt(metadata.seat_count || '12'),
      lockedInRate: parseFloat(metadata.price_per_seat || '107.10'),
      discountPercentage: parseInt(metadata.discount_percentage || '10'),
    });
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
