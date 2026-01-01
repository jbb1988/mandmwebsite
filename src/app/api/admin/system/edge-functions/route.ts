import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// List of known edge functions (from your codebase)
const EDGE_FUNCTIONS = [
  'admin-reset-password',
  'attendance-notifications',
  'calendar-feed',
  'calendar-feed-generator',
  'calendly-webhook',
  'cleanup_inactive_sessions',
  'cleanup-team-storage',
  'coach-attendance-daily-digest',
  'coach-attendance-weekly-digest',
  'coaching_drills_service',
  'complete-password-reset',
  'daily_motivation_push',
  'daily-activity-reminder',
  'daily-activity-reminder-v2',
  'daily-x-outreach-email',
  'event-reminder-notifications',
  'fuel_ai_service',
  'generate-daily-hit-topics',
  'generate-mind-ai-batch',
  'generate-muscle-ai-batch',
  'generate-weekly-ai-batch',
  'generate-weekly-reports-batch',
  'goal_sharing_notification',
  'goal-feedback',
  'goals_crud',
  'goals_framework',
  'goals_rollup_processor',
  'lab-drill-reminder',
  'log-auditor',
  'mind_ai_service',
  'new-event-notifications',
  'notify-promo-redemption',
  'notify-topic-suggestion',
  'openai_service',
  'parent_link_athlete',
  'parent_link_notification',
  'parent_link_response',
  'pitch-lab-analysis',
  'populate-ai-queue',
  'post-daily-hit-to-facebook',
  'post-daily-hit-to-x',
  'post-scheduled-content-to-facebook',
  'post-scheduled-content-to-x',
  'post-to-instagram',
  'process-ai-queue',
  'process-campaign-followups',
  'process-daily-hit',
  'process-engagement-triggers',
  'report_sharing_notification',
  'report-error',
  'request-account-deletion',
  'request-password-reset',
  'resend-webhook-handler',
  'revenuecat-webhook',
  'send_content_reflection_email',
  'send-admin-alert-email',
  'send-campaign-email',
  'send-daily-hit-followup',
  'send-daily-hit-website',
  'send-fcm-notification',
  'send-feature-spotlight-email',
  'send-feedback-notification',
  'send-marketing-trial-email',
  'send-parental-consent-email',
  'send-streak-milestone-email',
  'send-test-campaign-email',
  'send-trial-gift-email',
  'send-user-lifecycle-email',
  'send-weekly-champion-notification',
  'send-weekly-report-notifications',
  'send-welcome-email',
  'send-winback-campaign',
  'share-handler',
  'swing-lab-analysis',
  'team_code_join',
  'trial-expiration-checker',
  'uniform-reminder-notifications',
  'unsubscribe-email',
  'unsubscribe-page',
  'weekly_reports_ai_service',
  'weekly-feature-spotlight-cron',
];

export async function GET(request: NextRequest) {
  try {
    // Get logged edge function stats
    const { data: loggedStats } = await supabase
      .from('edge_function_logs')
      .select('function_name, status, duration_ms, invoked_at')
      .gte('invoked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('invoked_at', { ascending: false });

    // Aggregate stats by function
    const statsMap = new Map<string, {
      function_name: string;
      total_calls: number;
      success_count: number;
      error_count: number;
      avg_duration_ms: number;
      last_invoked: string | null;
      last_status: string | null;
    }>();

    // Initialize with all known functions
    EDGE_FUNCTIONS.forEach(fn => {
      statsMap.set(fn, {
        function_name: fn,
        total_calls: 0,
        success_count: 0,
        error_count: 0,
        avg_duration_ms: 0,
        last_invoked: null,
        last_status: null
      });
    });

    // Populate with actual data
    loggedStats?.forEach(log => {
      const existing = statsMap.get(log.function_name) || {
        function_name: log.function_name,
        total_calls: 0,
        success_count: 0,
        error_count: 0,
        avg_duration_ms: 0,
        last_invoked: null,
        last_status: null
      };

      existing.total_calls++;
      if (log.status === 'success') {
        existing.success_count++;
      } else {
        existing.error_count++;
      }

      // Update last invoked
      if (!existing.last_invoked || log.invoked_at > existing.last_invoked) {
        existing.last_invoked = log.invoked_at;
        existing.last_status = log.status;
      }

      // Update avg duration
      if (log.duration_ms) {
        const prevTotal = existing.avg_duration_ms * (existing.total_calls - 1);
        existing.avg_duration_ms = (prevTotal + log.duration_ms) / existing.total_calls;
      }

      statsMap.set(log.function_name, existing);
    });

    // Also fetch from cron job history to get edge function invocation data
    const { data: cronData } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          SUBSTRING(j.command FROM 'functions/v1/([^''\"]+)') as function_name,
          COUNT(*) as cron_calls_24h,
          COUNT(*) FILTER (WHERE r.status = 'succeeded') as cron_success,
          COUNT(*) FILTER (WHERE r.status = 'failed') as cron_failed,
          MAX(r.start_time) as last_cron_run
        FROM cron.job_run_details r
        JOIN cron.job j ON j.jobid = r.jobid
        WHERE r.start_time > NOW() - INTERVAL '24 hours'
          AND j.command LIKE '%functions/v1/%'
        GROUP BY SUBSTRING(j.command FROM 'functions/v1/([^''\"]+)')
      `
    });

    // Fetch recent error messages for each function
    const { data: recentErrors } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT DISTINCT ON (function_name)
          SUBSTRING(j.command FROM 'functions/v1/([^''\"]+)') as function_name,
          r.return_message as error_message,
          r.start_time as error_time
        FROM cron.job_run_details r
        JOIN cron.job j ON j.jobid = r.jobid
        WHERE r.start_time > NOW() - INTERVAL '24 hours'
          AND j.command LIKE '%functions/v1/%'
          AND r.status = 'failed'
        ORDER BY function_name, r.start_time DESC
      `
    });

    // Create error message map
    const errorMap = new Map<string, { error_message: string; error_time: string }>();
    recentErrors?.forEach((err: any) => {
      if (err.function_name && err.error_message) {
        errorMap.set(err.function_name, {
          error_message: err.error_message,
          error_time: err.error_time
        });
      }
    });

    // Merge cron data
    cronData?.forEach((cron: any) => {
      if (cron.function_name) {
        const existing = statsMap.get(cron.function_name);
        if (existing) {
          existing.total_calls += cron.cron_calls_24h || 0;
          existing.success_count += cron.cron_success || 0;
          existing.error_count += cron.cron_failed || 0;
          if (!existing.last_invoked || (cron.last_cron_run && cron.last_cron_run > existing.last_invoked)) {
            existing.last_invoked = cron.last_cron_run;
          }
          // Add error details if available
          const errorInfo = errorMap.get(cron.function_name);
          if (errorInfo) {
            (existing as any).last_error_message = errorInfo.error_message;
            (existing as any).last_error_time = errorInfo.error_time;
          }
        }
      }
    });

    const functions = Array.from(statsMap.values()).sort((a, b) => {
      // Sort by error count desc, then by total calls desc
      if (b.error_count !== a.error_count) return b.error_count - a.error_count;
      return b.total_calls - a.total_calls;
    });

    return NextResponse.json({
      functions,
      totalFunctions: EDGE_FUNCTIONS.length,
      activeFunctions: functions.filter(f => f.total_calls > 0).length,
      erroringFunctions: functions.filter(f => f.error_count > 0).length
    });
  } catch (error) {
    console.error('Error fetching edge function stats:', error);
    return NextResponse.json({ error: 'Failed to fetch edge function stats' }, { status: 500 });
  }
}
