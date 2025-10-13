import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { lookupTeamSchema } from '@/lib/validation';
import { lookupTeamRateLimit, getClientIp, checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = getClientIp(request);
    const rateLimitResult = await checkRateLimit(lookupTeamRateLimit, ip);

    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.reset ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000) : 60
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.reset ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString() : '60',
            'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '5',
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-09-30.acacia',
    });
    const body = await request.json();

    // Validate input
    const validationResult = lookupTeamSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid team code format' },
        { status: 400 }
      );
    }

    const { teamCode } = validationResult.data;

    // Search for subscription by team code in metadata
    const subscriptions = await stripe.subscriptions.search({
      query: `metadata['team_code']:'${teamCode}' AND status:'active'`,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid team code' },
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
