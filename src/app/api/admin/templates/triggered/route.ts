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

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: templates, error } = await supabase
      .from('marketing_email_templates')
      .select('id, name, segment, trigger_type, subject_line, body_template')
      .eq('is_triggered', true)
      .order('trigger_type')
      .order('segment');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      templates: templates || [],
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
