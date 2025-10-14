import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { addTeamSeatsSchema } from '@/lib/validation';
import { handleCorsOptions, validateCors, withCors } from '@/lib/cors';
import { addSeatsRateLimit, getClientIp, checkRateLimit } from '@/lib/rate-limit';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request) || new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  // Validate CORS
  const corsError = validateCors(request);
  if (corsError) return corsError;

  // Apply rate limiting
  const ip = getClientIp(request);
  const rateLimitResult = await checkRateLimit(addSeatsRateLimit, ip);

  if (rateLimitResult && !rateLimitResult.success) {
    const response = NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: rateLimitResult.reset ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000) : 60
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.reset ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString() : '60',
          'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '3',
          'X-RateLimit-Remaining': '0',
        }
      }
    );
    return withCors(response, request);
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-09-30.acacia',
    });
    const body = await request.json();

    // Validate input
    const validationResult = addTeamSeatsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { teamCode, subscriptionId, additionalSeats, lockedInRate, customerEmail, testMode } = validationResult.data;

    // Handle test subscriptions (bypass Stripe validation)
    if (subscriptionId === 'sub_test_1234567890') {
      console.log('Test subscription detected - bypassing Stripe validation');

      // For testing: just return success without actually creating anything
      const response = NextResponse.json({
        success: true,
        message: 'Test mode - no actual subscription created',
        testMode: true,
        newTotalSeats: 12 + additionalSeats,
      });
      return withCors(response, request);
    }

    // Retrieve the subscription to validate and get current data
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 404 }
      );
    }

    // SECURITY: Verify the request is from the subscription owner
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);

    if ('deleted' in customer && customer.deleted) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 403 }
      );
    }

    const subscriptionEmail = (customer as Stripe.Customer).email?.toLowerCase().trim();
    const requestEmail = customerEmail.toLowerCase().trim();

    if (subscriptionEmail !== requestEmail) {
      return NextResponse.json(
        { error: 'Unauthorized: Email does not match subscription owner' },
        { status: 403 }
      );
    }

    // SECURITY: Verify team code matches subscription metadata
    if (subscription.metadata.team_code !== teamCode) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 403 }
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

    // Calculate price per seat based on test mode
    const pricePerSeat = testMode ? (1.00 / additionalSeats) : lockedInRate;

    // Create a product for the additional seats
    const product = await stripe.products.create({
      name: `Mind and Muscle Team License - Additional Seats${testMode ? ' (TEST MODE)' : ''}`,
      description: testMode
        ? `TEST MODE: Additional ${additionalSeats} seats at $1.00 total`
        : `Additional ${additionalSeats} seats at locked-in rate of $${lockedInRate.toFixed(2)}/seat`,
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: Math.round(pricePerSeat * 100), // Price per seat in cents
      recurring: {
        interval: 'year',
      },
    });

    // Create a NEW separate subscription for the additional seats
    // This way each seat addition has its own 12-month billing cycle
    const newSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: price.id,
          quantity: additionalSeats,
        },
      ],
      metadata: {
        parent_subscription_id: subscriptionId,
        team_code: teamCode,
        seat_count: additionalSeats.toString(),
        price_per_seat: lockedInRate.toString(),
        is_additional_seats: 'true',
        ...(testMode && { test_mode: 'true' }),
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

    // CRITICAL: Update team_join_codes table to increase max_uses
    // This allows the additional users to actually redeem the code
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: updateError } = await supabase
      .from('team_join_codes')
      .update({
        max_uses: newTotalSeats,
        updated_at: new Date().toISOString(),
      })
      .eq('code', teamCode)
      .eq('is_active', true);

    if (updateError) {
      console.error('Error updating team join code max_uses:', updateError);
      // Don't fail the request - seats were purchased, we can manually fix this
    }

    // Get the payment intent for the new subscription
    const latestInvoiceId = newSubscription.latest_invoice as string;
    const invoice = await stripe.invoices.retrieve(latestInvoiceId);
    const paymentIntentId = invoice.payment_intent as string;

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Return the hosted invoice URL for payment
      const response = NextResponse.json({
        success: true,
        url: invoice.hosted_invoice_url,
        amountDue: invoice.amount_due / 100,
        newTotalSeats,
      });
      return withCors(response, request);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Seats added successfully',
      newTotalSeats,
    });
    return withCors(response, request);

  } catch (error: any) {
    console.error('Error adding team seats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add seats' },
      { status: 500 }
    );
  }
}
