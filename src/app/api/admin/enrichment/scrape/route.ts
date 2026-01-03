import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

function verifyAdmin(request: NextRequest): boolean {
  const password = request.headers.get('X-Admin-Password');
  return password === ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { organization_ids, segment, limit = 10, create_contacts = true } = body;

    // Call the enhanced smart discovery edge function
    const { data, error } = await supabase.functions.invoke('smart-contact-discovery', {
      body: {
        organization_ids,
        segment_filter: segment,
        limit,
        create_contacts,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error triggering scrape:', error);
    return NextResponse.json({ success: false, message: 'Failed to trigger scrape' }, { status: 500 });
  }
}
