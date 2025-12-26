import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all cron jobs
    const { data: jobs, error: jobsError } = await supabase.rpc('get_cron_jobs');

    if (jobsError) {
      // Fallback to direct query if RPC doesn't exist
      const { data: jobsDirect, error: directError } = await supabase
        .from('cron.job' as any)
        .select('*');

      if (directError) {
        // Use raw SQL as last resort
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
            },
            body: JSON.stringify({
              query: `
                SELECT
                  j.jobid,
                  j.jobname,
                  j.schedule,
                  j.active,
                  j.nodename,
                  (SELECT COUNT(*) FROM cron.job_run_details WHERE jobid = j.jobid AND status = 'succeeded' AND start_time > NOW() - INTERVAL '24 hours') as success_24h,
                  (SELECT COUNT(*) FROM cron.job_run_details WHERE jobid = j.jobid AND status = 'failed' AND start_time > NOW() - INTERVAL '24 hours') as failed_24h,
                  (SELECT start_time FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1) as last_run,
                  (SELECT status FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1) as last_status,
                  (SELECT return_message FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1) as last_message,
                  (SELECT AVG(EXTRACT(EPOCH FROM (end_time - start_time)) * 1000) FROM cron.job_run_details WHERE jobid = j.jobid AND start_time > NOW() - INTERVAL '7 days') as avg_duration_ms
                FROM cron.job j
                ORDER BY j.jobname
              `
            })
          }
        );
      }
    }

    // Get cron jobs with stats using direct SQL
    const { data: cronData, error: cronError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          j.jobid,
          j.jobname,
          j.schedule,
          j.active,
          (SELECT COUNT(*) FROM cron.job_run_details WHERE jobid = j.jobid AND status = 'succeeded' AND start_time > NOW() - INTERVAL '24 hours')::int as success_24h,
          (SELECT COUNT(*) FROM cron.job_run_details WHERE jobid = j.jobid AND status = 'failed' AND start_time > NOW() - INTERVAL '24 hours')::int as failed_24h,
          (SELECT start_time FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1) as last_run,
          (SELECT status FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1) as last_status,
          (SELECT return_message FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1) as last_message,
          (SELECT ROUND(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) * 1000)) FROM cron.job_run_details WHERE jobid = j.jobid AND end_time IS NOT NULL AND start_time > NOW() - INTERVAL '7 days')::int as avg_duration_ms
        FROM cron.job j
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
