import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (source) {
      query = query.eq('source', source);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: logs, error: logsError } = await query;

    // Get aggregated stats
    const { data: stats } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          source,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'processed') as processed,
          COUNT(*) FILTER (WHERE status = 'failed') as failed,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
          AVG(processing_time_ms) as avg_processing_time,
          MAX(created_at) as last_received
        FROM webhook_logs
        GROUP BY source
        ORDER BY total DESC
      `
    });

    if (logsError) throw logsError;

    return NextResponse.json({
      logs: logs || [],
      stats: stats || []
    });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    return NextResponse.json({ error: 'Failed to fetch webhook logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ids } = await request.json();

    if (action === 'retry') {
      // Mark failed webhooks for retry
      const { error } = await supabase
        .from('webhook_logs')
        .update({ status: 'pending', error_message: null })
        .in('id', ids);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'clear_old') {
      // Delete logs older than 30 days
      const { error } = await supabase
        .from('webhook_logs')
        .delete()
        .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error with webhook action:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
