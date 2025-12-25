import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('log_audit_issues')
      .select('*')
      .order('last_seen_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching log audit issues:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
