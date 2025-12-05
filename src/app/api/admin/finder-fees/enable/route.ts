import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    const { partnerCode, partnerEmail, partnerName, isRecurring } = body;

    // Validate required fields
    if (!partnerCode || !partnerEmail || !partnerName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if partner code already exists
    const { data: existingPartner } = await supabase
      .from('finder_fee_partners')
      .select('partner_code')
      .eq('partner_code', partnerCode)
      .single();

    if (existingPartner) {
      return NextResponse.json(
        { success: false, message: `Partner code "${partnerCode}" already exists` },
        { status: 400 }
      );
    }

    // Insert new finder partner
    const { data, error } = await supabase
      .from('finder_fee_partners')
      .insert({
        partner_code: partnerCode,
        partner_email: partnerEmail,
        partner_name: partnerName,
        enabled: true,
        is_recurring: isRecurring || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating finder partner:', error);
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    // Generate finder link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://themindandmuscleapp.com';
    const finderLink = `${baseUrl}/team-licensing?finder=${partnerCode}`;

    // TODO: Send email to partner with their finder link
    // You can implement this using your existing email system

    return NextResponse.json({
      success: true,
      message: `Partner "${partnerName}" enabled successfully! ${isRecurring ? '(VIP Recurring)' : '(Standard)'}`,
      finderLink,
      partner: data,
    });
  } catch (error) {
    console.error('Error in enable partner route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
