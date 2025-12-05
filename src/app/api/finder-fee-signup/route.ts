import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Turnstile verification
async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      organization,
      howYouKnowUs,
      networkDescription,
      expectedReferrals,
      turnstileToken,
      programType, // 'standard' or 'vip'
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Security verification required' },
        { status: 400 }
      );
    }

    const isValidToken = await verifyTurnstile(turnstileToken);
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Security verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email already submitted
    const { data: existing } = await supabase
      .from('finder_fee_signups')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This email has already been submitted. We will be in touch!' },
        { status: 400 }
      );
    }

    // Insert the signup
    const { error: insertError } = await supabase
      .from('finder_fee_signups')
      .insert({
        name,
        email,
        phone: phone || null,
        organization: organization || null,
        how_you_know_us: howYouKnowUs || null,
        network_description: networkDescription || null,
        expected_referrals: expectedReferrals || null,
        program_type: programType || 'standard',
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error inserting finder fee signup:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      );
    }

    // Send notification email (optional - could integrate with Resend/SendGrid)
    // For now, just log it
    console.log(`New finder fee signup: ${name} (${email}) - ${programType}`);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Error in finder fee signup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
