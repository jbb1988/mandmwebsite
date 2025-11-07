import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('[API Test] Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlValue: supabaseUrl,
    });

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('media_hub')
      .select('id, title, description, thumbnail_url')
      .eq('id', '1a137f68-ecaa-43dc-9a82-5297d714f262')
      .single();

    console.log('[API Test] Query result:', { data, error });

    if (error) {
      return NextResponse.json({
        error: error.message,
        details: error,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('[API Test] Caught error:', err);
    return NextResponse.json({
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
