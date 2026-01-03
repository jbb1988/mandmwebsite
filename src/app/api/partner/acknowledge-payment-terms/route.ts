import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get partner email from session cookie
    const cookieStore = await cookies();
    const partnerEmail = cookieStore.get('partner_email')?.value;

    if (!partnerEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { acknowledgments } = body;

    if (!acknowledgments || typeof acknowledgments !== 'object') {
      return NextResponse.json({ error: 'Invalid acknowledgments' }, { status: 400 });
    }

    // Build update object based on what was acknowledged
    const updates: Record<string, string> = {};
    const now = new Date().toISOString();

    if (acknowledgments.paymentTerms) {
      updates.payment_terms_acknowledged_at = now;
    }
    if (acknowledgments.paypalSetup) {
      updates.paypal_setup_confirmed_at = now;
    }
    if (acknowledgments.taxForm) {
      updates.tax_form_confirmed_at = now;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No acknowledgments provided' }, { status: 400 });
    }

    // Update partner_banners table
    const { data, error } = await supabase
      .from('partner_banners')
      .update(updates)
      .eq('partner_email', partnerEmail)
      .select('payment_terms_acknowledged_at, paypal_setup_confirmed_at, tax_form_confirmed_at')
      .single();

    if (error) {
      console.error('Error updating acknowledgments:', error);
      return NextResponse.json({ error: 'Failed to save acknowledgments' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      acknowledgments: {
        paymentTerms: !!data?.payment_terms_acknowledged_at,
        paypalSetup: !!data?.paypal_setup_confirmed_at,
        taxForm: !!data?.tax_form_confirmed_at,
      }
    });
  } catch (error) {
    console.error('Error in acknowledge-payment-terms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET to check current acknowledgment status
export async function GET(request: NextRequest) {
  try {
    // Get partner email from session cookie
    const cookieStore = await cookies();
    const partnerEmail = cookieStore.get('partner_email')?.value;

    if (!partnerEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('partner_banners')
      .select('payment_terms_acknowledged_at, paypal_setup_confirmed_at, tax_form_confirmed_at')
      .eq('partner_email', partnerEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching acknowledgments:', error);
      return NextResponse.json({ error: 'Failed to fetch acknowledgments' }, { status: 500 });
    }

    return NextResponse.json({
      acknowledgments: {
        paymentTerms: !!data?.payment_terms_acknowledged_at,
        paymentTermsAt: data?.payment_terms_acknowledged_at,
        paypalSetup: !!data?.paypal_setup_confirmed_at,
        paypalSetupAt: data?.paypal_setup_confirmed_at,
        taxForm: !!data?.tax_form_confirmed_at,
        taxFormAt: data?.tax_form_confirmed_at,
        allComplete: !!(data?.payment_terms_acknowledged_at && data?.paypal_setup_confirmed_at && data?.tax_form_confirmed_at),
      }
    });
  } catch (error) {
    console.error('Error in acknowledge-payment-terms GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
