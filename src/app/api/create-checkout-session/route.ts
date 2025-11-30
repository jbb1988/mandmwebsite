import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { checkoutSessionSchema } from '@/lib/validation';
import { handleCorsOptions, validateCors, withCors } from '@/lib/cors';
import { checkoutRateLimit, getClientIp, checkRateLimit } from '@/lib/rate-limit';

// Generate unique team code
function generateTeamCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
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
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
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

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request) || new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  // Validate CORS
  const corsError = validateCors(request);
  if (corsError) return corsError;

  // Apply rate limiting
  const ip = getClientIp(request);
  const rateLimitResult = await checkRateLimit(checkoutRateLimit, ip);

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
    const validationResult = checkoutSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { 
      seatCount, 
      email, 
      testMode, 
      toltReferral, 
      finderCode, 
      promoCode,
      utmSource,
      utmMedium,
      utmCampaign,
      isMultiTeamOrg,
      organizationName,
      numberOfTeams,
      seatsPerTeam,
    } = validationResult.data;

    // Validate promo code if provided
    let promoDiscount = 0;
    let stripeCouponId: string | undefined;

    if (promoCode) {
      try {
        const validationResponse = await fetch(`${request.headers.get('origin')}/api/validate-promo-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: promoCode.toUpperCase(),
            email: email.toLowerCase(),
          }),
        });

        const validationData = await validationResponse.json();
        
        if (validationData.valid) {
          promoDiscount = validationData.discount_percent || 0;
          
          // Create or retrieve Stripe coupon
          const couponId = `PROMO_${promoCode.toUpperCase()}`;
          
          try {
            // Try to retrieve existing coupon
            await stripe.coupons.retrieve(couponId);
            stripeCouponId = couponId;
          } catch (retrieveError: any) {
            // Coupon doesn't exist, create it
            if (retrieveError.code === 'resource_missing') {
              const coupon = await stripe.coupons.create({
                id: couponId,
                percent_off: promoDiscount,
                duration: 'once', // Apply only to first payment
                name: `Promo Code: ${promoCode.toUpperCase()}`,
              });
              stripeCouponId = coupon.id;
            } else {
              throw retrieveError;
            }
          }
        }
      } catch (error) {
        console.error('Error processing promo code:', error);
        // Continue without promo code if validation fails
      }
    }

    // TEST MODE: Use $1.00 per seat for testing
    let pricePerSeat: number;
    let discountPercentage: number;

    if (testMode) {
      // Test mode: $1.00 total (not per seat)
      pricePerSeat = 1.00 / seatCount; // Divide $1 by seat count
      discountPercentage = 0;
    } else {
      // Production mode: 6-month pricing at $79/seat
      const basePrice = 79;

      if (seatCount >= 200) {
        discountPercentage = 20;
        pricePerSeat = 63.20; // $79 - 20%
      } else if (seatCount >= 120) {
        discountPercentage = 15;
        pricePerSeat = 67.15; // $79 - 15%
      } else if (seatCount >= 12) {
        discountPercentage = 10;
        pricePerSeat = 71.10; // $79 - 10%
      } else {
        // 1-11 users: no discount
        discountPercentage = 0;
        pricePerSeat = 79.00;
      }
    }

    const totalAmount = Math.round(pricePerSeat * seatCount * 100); // Convert to cents

    // Generate unique coach and team codes
    const coachCode = generateCoachCode();
    const teamCode = generateTeamCode();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: testMode
                ? `[TEST] Mind and Muscle Team License`
                : `Mind and Muscle Team License - 6 Months${discountPercentage > 0 ? ` (${discountPercentage}% discount)` : ''}`,
              description: testMode
                ? `TEST: ${seatCount} seats at $${pricePerSeat.toFixed(2)}/seat`
                : `6-month seasonal team license for ${seatCount} seats at $${pricePerSeat.toFixed(2)}/seat - Unlock Premium for your entire team with AI-powered training, advanced analytics, and personalized coaching.`,
              images: ['https://mindandmuscle.ai/assets/images/logo.png'],
            },
            unit_amount: Math.round(pricePerSeat * 100), // Price per seat in cents
            recurring: {
              interval: 'month',
              interval_count: 6,
            },
          },
          quantity: seatCount,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/team-licensing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/team-licensing?canceled=true`,
      customer_email: email,
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        submit: {
          message: 'Your team will receive Premium access immediately after purchase.',
        },
        terms_of_service_acceptance: {
          message: 'I agree to the [Terms of Service](https://mindandmuscle.ai/support#terms) and [Privacy Policy](https://mindandmuscle.ai/support#privacy)',
        },
      },
      consent_collection: {
        terms_of_service: 'required',
      },
      allow_promotion_codes: true,
      tax_id_collection: {
        enabled: true,
      },
      ...(stripeCouponId && { discounts: [{ coupon: stripeCouponId }] }),
      metadata: {
        seat_count: seatCount.toString(),
        discount_percentage: discountPercentage.toString(),
        price_per_seat: pricePerSeat.toString(),
        coach_code: coachCode,
        team_code: teamCode,
        ...(toltReferral && { tolt_referral: toltReferral }),
        ...(finderCode && { finder_code: finderCode }),
        ...(promoCode && { promo_code: promoCode.toUpperCase() }),
        ...(promoDiscount > 0 && { promo_discount_percent: promoDiscount.toString() }),
        ...(utmSource && { utm_source: utmSource }),
        ...(utmMedium && { utm_medium: utmMedium }),
        ...(utmCampaign && { utm_campaign: utmCampaign }),
      ...(isMultiTeamOrg && {
        is_multi_team_org: 'true',
        organization_name: organizationName,
        number_of_teams: numberOfTeams?.toString() || '0',
        seats_per_team: seatsPerTeam ? JSON.stringify(seatsPerTeam) : '',
      }),
      },
      subscription_data: {
        metadata: {
          seat_count: seatCount.toString(),
          discount_percentage: discountPercentage.toString(),
          price_per_seat: pricePerSeat.toString(),
          coach_code: coachCode,
          team_code: teamCode,
          ...(toltReferral && { tolt_referral: toltReferral }),
          ...(finderCode && { finder_code: finderCode }),
          ...(promoCode && { promo_code: promoCode.toUpperCase() }),
          ...(promoDiscount > 0 && { promo_discount_percent: promoDiscount.toString() }),
          ...(utmSource && { utm_source: utmSource }),
          ...(utmMedium && { utm_medium: utmMedium }),
          ...(utmCampaign && { utm_campaign: utmCampaign }),
        },
      },
    });

    const response = NextResponse.json({ sessionId: session.id, url: session.url });
    return withCors(response, request);
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
