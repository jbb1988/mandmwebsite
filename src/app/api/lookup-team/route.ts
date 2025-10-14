import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { lookupTeamSchema } from '@/lib/validation';
import { lookupTeamRateLimit, getClientIp, checkRateLimit } from '@/lib/rate-limit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Handle test team codes
    const TEST_CODES = ['TEAM-PKRM-L75S-6A29'];
    if (TEST_CODES.includes(teamCode.toUpperCase())) {
      return NextResponse.json({
        teamCode: teamCode.toUpperCase(),
        currentSeats: 12,
        seatsUsed: 0,
        seatsRemaining: 12,
        lockedInRate: 107.10,
        discountPercentage: 10,
        purchaseDate: new Date().toISOString(),
        subscriptionId: 'test_subscription_id',
        customerEmail: 'test@mindandmuscle.ai',
      });
    }

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

    // Get team_id from team_join_codes table
    const { data: teamJoinCode } = await supabase
      .from('team_join_codes')
      .select('team_id')
      .eq('code', teamCode.toUpperCase())
      .eq('is_active', true)
      .single();

    let seatsUsed = 0;

    // Count seats used (only Athletes and Coaches consume seats)
    if (teamJoinCode?.team_id) {
      const { count } = await supabase
        .from('team_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamJoinCode.team_id)
        .in('role_in_team', ['athlete', 'coach']);

      seatsUsed = count || 0;
    }

    const currentSeats = parseInt(metadata.seat_count || '12');
    const seatsRemaining = Math.max(0, currentSeats - seatsUsed);

    return NextResponse.json({
      teamCode: metadata.team_code,
      currentSeats: currentSeats,
      seatsUsed: seatsUsed,
      seatsRemaining: seatsRemaining,
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
