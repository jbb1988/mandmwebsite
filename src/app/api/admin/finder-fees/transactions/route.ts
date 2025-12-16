import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Validate admin password
    const adminPassword = request.headers.get('X-Admin-Password');
    if (adminPassword !== process.env.ADMIN_DASHBOARD_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query
    let query = supabase
      .from('finder_fees')
      .select(`
        *,
        finder_fee_partners!inner(
          partner_name,
          is_recurring
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply type filter
    if (type === 'standard') {
      query = query.eq('finder_fee_partners.is_recurring', false);
    } else if (type === 'vip') {
      query = query.eq('finder_fee_partners.is_recurring', true);
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const transactions = data?.map((tx: any) => ({
      id: tx.id,
      finder_code: tx.finder_code,
      partner_name: tx.finder_fee_partners?.partner_name || 'Unknown',
      referred_org_email: tx.referred_org_email,
      purchase_amount: parseFloat(tx.purchase_amount),
      fee_percentage: parseFloat(tx.fee_percentage),
      fee_amount: parseFloat(tx.fee_amount),
      is_recurring: tx.is_recurring || false,
      is_first_purchase: tx.is_first_purchase ?? true,
      status: tx.status,
      created_at: tx.created_at,
    })) || [];

    const totalPages = Math.ceil((count || 0) / pageSize);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        totalPages,
        totalCount: count || 0,
      },
    });
  } catch (error) {
    console.error('Error in transactions route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create manual finder fee record
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
    const { finderCode, referredOrgEmail, purchaseAmount, isFirstPurchase = true } = body;

    // Validate required fields
    if (!finderCode || !referredOrgEmail || !purchaseAmount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: finderCode, referredOrgEmail, purchaseAmount' },
        { status: 400 }
      );
    }

    // Validate purchase amount
    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Purchase amount must be a positive number' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up the partner
    const { data: partner, error: partnerError } = await supabase
      .from('finder_fee_partners')
      .select('*')
      .eq('partner_code', finderCode.toUpperCase())
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { success: false, message: `Partner with code "${finderCode}" not found` },
        { status: 404 }
      );
    }

    if (!partner.enabled) {
      return NextResponse.json(
        { success: false, message: `Partner "${partner.partner_name}" is disabled` },
        { status: 400 }
      );
    }

    // Check for duplicate (same org email for standard partners)
    if (!partner.is_recurring) {
      const { data: existing } = await supabase
        .from('finder_fees')
        .select('id')
        .eq('finder_code', partner.partner_code)
        .eq('referred_org_email', referredOrgEmail.toLowerCase())
        .single();

      if (existing) {
        return NextResponse.json(
          { success: false, message: `A finder fee already exists for this org email with partner ${partner.partner_name}` },
          { status: 409 }
        );
      }
    }

    // Calculate fee percentage and amount
    // Standard: 10% always
    // VIP: 10% first purchase, 5% renewals
    let feePercentage: number;
    if (partner.is_recurring) {
      feePercentage = isFirstPurchase ? 10 : 5;
    } else {
      feePercentage = 10;
    }
    const feeAmount = (amount * feePercentage) / 100;

    // Create the finder fee record
    const { data: newFee, error: insertError } = await supabase
      .from('finder_fees')
      .insert({
        finder_code: partner.partner_code,
        finder_email: partner.partner_email,
        referred_org_email: referredOrgEmail.toLowerCase(),
        purchase_amount: amount,
        fee_amount: feeAmount,
        fee_percentage: feePercentage,
        is_first_purchase: isFirstPurchase,
        is_recurring: partner.is_recurring,
        status: 'pending',
        admin_notes: 'Manually created via admin dashboard',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating finder fee:', insertError);
      return NextResponse.json(
        { success: false, message: `Failed to create finder fee: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Finder fee created for ${partner.partner_name}`,
      transaction: {
        id: newFee.id,
        fee_amount: feeAmount,
        fee_percentage: feePercentage,
        partner_name: partner.partner_name,
      },
    });
  } catch (error) {
    console.error('Error creating manual finder fee:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
