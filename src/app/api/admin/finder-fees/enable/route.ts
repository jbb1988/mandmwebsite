import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Validate admin password
    const adminPassword = request.headers.get('X-Admin-Password');
    if (adminPassword !== process.env.ADMIN_DASHBOARD_PASSWORD &&
        adminPassword !== process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD) {
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
        { success: false, message: 'Partner code, email, and name are required' },
        { status: 400 }
      );
    }

    // Validate partner code format (alphanumeric, no spaces)
    if (!/^[a-zA-Z0-9]+$/.test(partnerCode)) {
      return NextResponse.json(
        { success: false, message: 'Partner code must be alphanumeric with no spaces' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if partner code already exists
    const { data: existingPartner } = await supabase
      .from('finder_fee_partners')
      .select('id')
      .eq('finder_code', partnerCode.toUpperCase())
      .single();

    if (existingPartner) {
      return NextResponse.json(
        { success: false, message: 'This partner code already exists' },
        { status: 400 }
      );
    }

    // Create the partner
    const { data: partner, error } = await supabase
      .from('finder_fee_partners')
      .insert({
        finder_code: partnerCode.toUpperCase(),
        partner_email: partnerEmail,
        partner_name: partnerName,
        is_recurring: isRecurring || false,
        is_active: true,
        fee_percentage_first: 10, // 10% for first purchase
        fee_percentage_renewal: isRecurring ? 5 : 0, // 5% for renewals if VIP
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating partner:', error);
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    // Generate the finder link
    const finderLink = `https://mindandmuscle.ai/team-licensing?ref=${partnerCode.toUpperCase()}`;

    return NextResponse.json({
      success: true,
      message: `Successfully enabled ${isRecurring ? 'VIP' : 'standard'} finder partner: ${partnerName}`,
      finderLink,
      partner: {
        id: partner.id,
        code: partner.finder_code,
        name: partner.partner_name,
        email: partner.partner_email,
        isRecurring: partner.is_recurring,
      },
    });
  } catch (error) {
    console.error('Error in enable partner route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
