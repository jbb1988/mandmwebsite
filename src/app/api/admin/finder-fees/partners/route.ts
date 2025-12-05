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

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query for partners
    let query = supabase
      .from('finder_fee_partners')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`partner_name.ilike.%${search}%,partner_code.ilike.%${search}%,partner_email.ilike.%${search}%`);
    }

    // Apply status filter
    if (status === 'enabled') {
      query = query.eq('enabled', true);
    } else if (status === 'disabled') {
      query = query.eq('enabled', false);
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data: partners, error, count } = await query;

    if (error) {
      console.error('Error fetching partners:', error);
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    // Get earnings for each partner
    const partnerCodes = partners?.map(p => p.partner_code) || [];

    let earnings: Record<string, number> = {};
    if (partnerCodes.length > 0) {
      const { data: earningsData } = await supabase
        .from('finder_fees')
        .select('finder_code, fee_amount, status')
        .in('finder_code', partnerCodes);

      if (earningsData) {
        earningsData.forEach((tx: { finder_code: string; fee_amount: number; status: string }) => {
          if (!earnings[tx.finder_code]) {
            earnings[tx.finder_code] = 0;
          }
          earnings[tx.finder_code] += parseFloat(String(tx.fee_amount));
        });
      }
    }

    // Transform data
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mindandmuscle.ai';
    const transformedPartners = partners?.map(p => ({
      id: p.id,
      partner_code: p.partner_code,
      partner_email: p.partner_email,
      partner_name: p.partner_name,
      enabled: p.enabled,
      is_recurring: p.is_recurring,
      finder_link: `${baseUrl}/team-licensing?finder=${p.partner_code}`,
      total_earnings: earnings[p.partner_code] || 0,
      created_at: p.created_at,
    })) || [];

    const totalPages = Math.ceil((count || 0) / pageSize);

    return NextResponse.json({
      success: true,
      partners: transformedPartners,
      pagination: {
        page,
        totalPages,
        totalCount: count || 0,
      },
    });
  } catch (error) {
    console.error('Error in partners route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Toggle partner enabled status
export async function PATCH(request: NextRequest) {
  try {
    const adminPassword = request.headers.get('X-Admin-Password');
    if (adminPassword !== process.env.ADMIN_DASHBOARD_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { partnerId, enabled } = body;

    if (!partnerId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Missing partnerId or enabled status' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('finder_fee_partners')
      .update({
        enabled,
        disabled_at: enabled ? null : new Date().toISOString(),
      })
      .eq('id', partnerId);

    if (error) {
      console.error('Error updating partner:', error);
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Partner ${enabled ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    console.error('Error in partner toggle:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
