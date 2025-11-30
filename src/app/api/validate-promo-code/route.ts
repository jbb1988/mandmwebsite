import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema
const validatePromoCodeSchema = z.object({
  code: z.string().min(6).max(12).regex(/^[A-Z0-9]+$/),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = validatePromoCodeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid input format',
        },
        { status: 400 }
      );
    }

    const { code, email } = validationResult.data;

    // Call Supabase function to validate code
    const { data, error } = await supabase.rpc('validate_promo_code', {
      p_code: code.toUpperCase(),
      p_email: email.toLowerCase(),
    });

    if (error) {
      console.error('Error validating promo code:', error);
      return NextResponse.json(
        {
          valid: false,
          error: 'Failed to validate promo code',
        },
        { status: 500 }
      );
    }

    // Return validation result
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in validate-promo-code API:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
