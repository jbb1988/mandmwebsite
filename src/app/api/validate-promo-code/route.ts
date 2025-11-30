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
  code: z.string().min(4).max(12).regex(/^[A-Z0-9]+$/),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  console.log('[validate-promo-code] Request received');
  
  try {
    const body = await request.json();
    console.log('[validate-promo-code] Request body:', JSON.stringify(body));

    // Validate input
    const validationResult = validatePromoCodeSchema.safeParse(body);
    console.log('[validate-promo-code] Validation result:', validationResult.success);

    if (!validationResult.success) {
      const errors = validationResult.error.issues;
      let errorMessage = 'Invalid input format';
      
      // Provide more specific error messages
      if (errors.some((e: any) => e.path[0] === 'code')) {
        errorMessage = 'Promo code must be 4-12 uppercase letters/numbers only';
      } else if (errors.some((e: any) => e.path[0] === 'email')) {
        errorMessage = 'Please enter a valid email address';
      }
      
      return NextResponse.json(
        {
          valid: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }

    const { code, email } = validationResult.data;
    console.log('[validate-promo-code] Calling Supabase with code:', code);

    // Call Supabase function to validate code
    const { data, error } = await supabase.rpc('validate_promo_code', {
      p_code: code.toUpperCase(),
      p_email: email.toLowerCase(),
    });
    
    console.log('[validate-promo-code] Supabase response - data:', data, 'error:', error);

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

    // Supabase RPC returns an array, get the first element
    const result = Array.isArray(data) ? data[0] : data;
    
    // Return validation result
    console.log('[validate-promo-code] Returning success response:', result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[validate-promo-code] Caught error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
