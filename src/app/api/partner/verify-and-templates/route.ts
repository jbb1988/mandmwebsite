import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email exists in partners table
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('name, first_name, referral_url, referral_slug')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Email not found in partner program' },
        { status: 404 }
      );
    }

    // Fetch email templates
    const { data: templates, error: templatesError } = await supabase
      .from('marketing_email_templates')
      .select('segment, sequence_step, subject_line, body_template')
      .in('segment', ['national_org', 'travel_org', 'facility', 'influencer'])
      .order('segment')
      .order('sequence_step');

    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      partner: {
        name: partner.name,
        firstName: partner.first_name,
        referralUrl: partner.referral_url,
        referralSlug: partner.referral_slug,
      },
      templates: templates || [],
    });
  } catch (error) {
    console.error('Error in partner verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
