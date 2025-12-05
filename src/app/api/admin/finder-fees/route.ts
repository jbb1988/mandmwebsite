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
