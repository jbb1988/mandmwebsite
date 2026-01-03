import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    const unacknowledgedOnly = searchParams.get('unacknowledged') === 'true';

    let query = supabase
      .from('system_error_log')
      .select('*')
      .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (unacknowledgedOnly) {
      query = query.is('acknowledged_at', null);
    }

    const { data: errors, error } = await query;

    if (error) throw error;

    // Get stats
    const stats = {
      total: errors?.length || 0,
      critical: errors?.filter(e => e.severity === 'critical').length || 0,
      unacknowledged: errors?.filter(e => !e.acknowledged_at).length || 0,
      byType: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
    };

    errors?.forEach(e => {
      stats.byType[e.error_type] = (stats.byType[e.error_type] || 0) + 1;
      stats.bySource[e.source] = (stats.bySource[e.source] || 0) + 1;
    });

    return NextResponse.json({ errors, stats });
  } catch (error) {
    console.error('Error fetching system errors:', error);
    return NextResponse.json({ error: 'Failed to fetch errors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, errorIds } = await request.json();

    if (action === 'acknowledge') {
      const { error } = await supabase
        .from('system_error_log')
        .update({ acknowledged_at: new Date().toISOString() })
        .in('id', errorIds);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'log') {
      const { error_type, source, error_message, error_details, severity } = await request.json();

      const { data, error } = await supabase
        .from('system_error_log')
        .insert({
          error_type,
          source,
          error_message,
          error_details,
          severity: severity || 'error'
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, error: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error with system error action:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
