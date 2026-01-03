import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('log_audit_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching log audit runs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
