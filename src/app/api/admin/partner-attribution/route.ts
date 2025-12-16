import { NextRequest, NextResponse } from 'next/server';

// POST - Create manual Tolt conversion
export async function POST(request: NextRequest) {
  try {
    // Validate admin password
    const adminPassword = request.headers.get('X-Admin-Password');
    if (adminPassword !== process.env.ADMIN_DASHBOARD_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { referralCode, customerEmail, amount } = body;

    // Validate required fields
    if (!referralCode || !customerEmail || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: referralCode, customerEmail, amount' },
        { status: 400 }
      );
    }

    // Validate amount
    const purchaseAmount = parseFloat(amount);
    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Get Tolt API key
    const toltApiKey = process.env.TOLT_API_KEY;
    if (!toltApiKey) {
      console.error('TOLT_API_KEY not configured');
      return NextResponse.json(
        { success: false, message: 'Tolt API not configured' },
        { status: 500 }
      );
    }

    // Generate unique external ID for this manual attribution
    const externalId = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // First, we need to create a click to associate the partner with the customer
    // Then create a transaction for the sale

    // Create the transaction in Tolt
    // Tolt API: POST https://api.tolt.com/v1/transactions
    const toltResponse = await fetch('https://api.tolt.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${toltApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        partner_code: referralCode.toUpperCase(),
        customer_email: customerEmail.toLowerCase(),
        amount: purchaseAmount,
        currency: 'usd',
        external_id: externalId,
        metadata: {
          source: 'manual_admin_attribution',
          created_at: new Date().toISOString(),
        },
      }),
    });

    if (!toltResponse.ok) {
      const errorData = await toltResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Tolt API Error:', { status: toltResponse.status, body: errorData });

      // Provide helpful error messages based on common issues
      let userMessage = `Tolt API error: ${errorData.message || toltResponse.statusText}`;
      if (toltResponse.status === 404) {
        userMessage = `Partner with code "${referralCode}" not found in Tolt. Check the code is correct.`;
      } else if (toltResponse.status === 400) {
        userMessage = `Invalid request: ${errorData.message || 'Check all fields are correct'}`;
      }

      return NextResponse.json(
        { success: false, message: userMessage },
        { status: toltResponse.status }
      );
    }

    const toltData = await toltResponse.json();
    console.log('✅ Manual Tolt conversion created:', toltData);

    return NextResponse.json({
      success: true,
      message: `Tolt conversion created for partner ${referralCode}`,
      conversion: {
        id: toltData.id || externalId,
        amount: purchaseAmount,
        customer_email: customerEmail,
        partner_code: referralCode,
      },
    });
  } catch (error) {
    console.error('Error creating manual Tolt attribution:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
