import { NextResponse } from 'next/server';

/**
 * Notify Tolt of a conversion (purchase or renewal)
 *
 * This endpoint is called by the Stripe webhook when:
 * 1. A new subscription is created (checkout.session.completed)
 * 2. A subscription is renewed (invoice.payment_succeeded)
 *
 * It sends the conversion data to Tolt so partners get credited
 * with their 10% lifetime commission.
 */
export async function POST(request: Request) {
  try {
    const { referralCode, amount, customerEmail, subscriptionId, isRenewal } = await request.json();

    // Skip if no referral code (direct purchase, not from partner)
    if (!referralCode) {
      return NextResponse.json({
        message: 'No referral code - skipping Tolt notification'
      });
    }

    const toltApiKey = process.env.TOLT_API_KEY;

    if (!toltApiKey) {
      console.error('TOLT_API_KEY not configured');
      return NextResponse.json(
        { error: 'Tolt API key not configured' },
        { status: 500 }
      );
    }

    // Notify Tolt of the conversion
    const response = await fetch('https://api.tolt.io/v1/conversions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${toltApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referral_code: referralCode,
        amount: amount, // Amount in dollars (e.g., 1285.20)
        customer_email: customerEmail,
        external_id: subscriptionId, // Track by subscription ID
        metadata: {
          subscription_id: subscriptionId,
          is_renewal: isRenewal || false,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Tolt API error:', response.status, errorData);

      // Don't throw - we don't want Tolt failures to break Stripe webhooks
      return NextResponse.json({
        error: 'Tolt API error',
        status: response.status,
        details: errorData,
      }, { status: response.status });
    }

    const data = await response.json();

    console.log('Tolt conversion recorded:', {
      referralCode,
      amount,
      subscriptionId,
      isRenewal,
      toltResponse: data,
    });

    return NextResponse.json({
      success: true,
      message: 'Conversion recorded in Tolt',
      data,
    });

  } catch (error: any) {
    console.error('Error notifying Tolt:', error);

    // Return 200 even on error - don't break Stripe webhook
    return NextResponse.json({
      error: 'Internal error',
      message: error.message,
    }, { status: 500 });
  }
}
