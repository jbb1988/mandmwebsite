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
    // Get cron jobs with stats using exec_sql RPC (optimized with CTEs)
    const { data: cronData, error: cronError } = await supabase.rpc('exec_sql', {
      sql: `
        WITH run_stats AS (
          SELECT
            jobid,
            COUNT(*) FILTER (WHERE status = 'succeeded' AND start_time > NOW() - INTERVAL '24 hours') as success_24h,
            COUNT(*) FILTER (WHERE status = 'failed' AND start_time > NOW() - INTERVAL '24 hours') as failed_24h,
            ROUND(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) * 1000) FILTER (WHERE end_time IS NOT NULL))::int as avg_duration_ms
          FROM cron.job_run_details
          WHERE start_time > NOW() - INTERVAL '7 days'
          GROUP BY jobid
        ),
        last_runs AS (
          SELECT DISTINCT ON (jobid)
            jobid,
            start_time as last_run,
            status as last_status,
            return_message as last_message
          FROM cron.job_run_details
          ORDER BY jobid, start_time DESC
        )
        SELECT
          j.jobid,
          j.jobname,
          j.schedule,
          j.active,
          COALESCE(rs.success_24h, 0)::int as success_24h,
          COALESCE(rs.failed_24h, 0)::int as failed_24h,
          lr.last_run,
          lr.last_status,
          lr.last_message,
          rs.avg_duration_ms
        FROM cron.job j
        LEFT JOIN run_stats rs ON rs.jobid = j.jobid
        LEFT JOIN last_runs lr ON lr.jobid = j.jobid
        ORDER BY j.jobname
      `
    });

    return NextResponse.json(cronData || []);
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch cron jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, jobId } = await request.json();

    if (action === 'toggle') {
      // Toggle job active status
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `UPDATE cron.job SET active = NOT active WHERE jobid = ${jobId} RETURNING active`
      });

      if (error) throw error;
      return NextResponse.json({ success: true, active: data?.[0]?.active });
    }

    if (action === 'run_now') {
      // Trigger immediate run by calling the function directly
      const { data: jobData } = await supabase.rpc('exec_sql', {
        sql: `SELECT command FROM cron.job WHERE jobid = ${jobId}`
      });

      if (jobData?.[0]?.command) {
        await supabase.rpc('exec_sql', { sql: jobData[0].command });
        return NextResponse.json({ success: true, message: 'Job triggered' });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error with cron action:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
