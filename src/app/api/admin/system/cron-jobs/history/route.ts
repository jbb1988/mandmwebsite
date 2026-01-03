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
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = `
      SELECT
        r.runid,
        r.jobid,
        j.jobname,
        r.status,
        r.return_message,
        r.start_time,
        r.end_time,
        EXTRACT(EPOCH FROM (r.end_time - r.start_time)) * 1000 as duration_ms
      FROM cron.job_run_details r
      JOIN cron.job j ON j.jobid = r.jobid
    `;

    if (jobId) {
      sql += ` WHERE r.jobid = ${jobId}`;
    }

    sql += ` ORDER BY r.start_time DESC LIMIT ${limit}`;

    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching cron history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
