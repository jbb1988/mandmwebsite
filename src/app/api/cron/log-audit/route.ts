import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROJECT_REF = 'kuswlvbjplkgrqlmqtok';
const SERVICES_TO_CHECK = ['api', 'edge-function', 'auth', 'postgres'];

// Paths to ignore - deprecated tables/endpoints that don't need alerts
const IGNORED_PATHS = [
  '/rest/v1/user_notifications',
  '/rest/v1/feature_usage',
  '/rest/v1/log_audit_issues',  // Don't alert on our own audit table
  '/rest/v1/log_audit_runs',
];

interface ErrorGroup {
  signature: string;
  path: string;
  method: string;
  statusCode: number;
  errorPattern: string;
  service: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  sampleMessage: string;
}

function generateSignature(path: string, method: string, statusCode: number): string {
  // Use only path/method/statusCode for stable signatures (not error pattern which varies)
  const input = `${path}:${method}:${statusCode}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `err_${Math.abs(hash).toString(16)}`;
}

function extractErrorPattern(message: string): string {
  if (!message) return 'unknown';
  let pattern = message.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '{uuid}');
  pattern = pattern.replace(/\b\d{5,}\b/g, '{id}');
  pattern = pattern.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '{timestamp}');
  pattern = pattern.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '{ip}');
  return pattern.substring(0, 500);
}

function normalizePath(path: string): string {
  if (!path) return '/unknown';
  let normalized = path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '{id}');
  normalized = normalized.replace(/\/\d+\//g, '/{id}/');
  normalized = normalized.replace(/\/\d+$/g, '/{id}');
  normalized = normalized.split('?')[0];
  return normalized;
}

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow if no CRON_SECRET is set (development) or if called from admin
    if (process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const startTime = Date.now();

  try {
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

    if (!accessToken) {
      console.error('SUPABASE_ACCESS_TOKEN not configured');
      return NextResponse.json({ error: 'SUPABASE_ACCESS_TOKEN not configured' }, { status: 500 });
    }

    // Create audit run record
    const { data: auditRun } = await supabase
      .from('log_audit_runs')
      .insert({ services_checked: SERVICES_TO_CHECK })
      .select()
      .single();

    const errorGroups = new Map<string, ErrorGroup>();
    let totalLogsScanned = 0;
    const logsPerService: Record<string, { scanned: number; errors: number }> = {};

    const timestampStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const timestampEnd = new Date().toISOString();

    // Query 1: Get HTTP errors from edge_logs using SQL with UNNEST
    try {
      console.log('Fetching HTTP errors from edge_logs using SQL query...');

      const edgeErrorsSql = `
        SELECT
          timestamp,
          event_message,
          status_code,
          r.method,
          r.path
        FROM edge_logs
        CROSS JOIN UNNEST(metadata) AS m
        CROSS JOIN UNNEST(m.request) AS r
        CROSS JOIN UNNEST(m.response) AS resp
        WHERE status_code >= 400
        ORDER BY timestamp DESC
        LIMIT 500
      `;

      const edgeParams = new URLSearchParams({
        sql: edgeErrorsSql,
        iso_timestamp_start: timestampStart,
        iso_timestamp_end: timestampEnd,
      });

      const edgeResponse = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/analytics/endpoints/logs.all?${edgeParams}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (edgeResponse.ok) {
        const edgeData = await edgeResponse.json();
        // Ensure edgeLogs is always an array
        let edgeLogs: any[] = [];
        if (Array.isArray(edgeData.result)) {
          edgeLogs = edgeData.result;
        } else if (Array.isArray(edgeData)) {
          edgeLogs = edgeData;
        }

        console.log(`Found ${edgeLogs.length} HTTP errors from edge_logs`);
        totalLogsScanned += edgeLogs.length;

        for (const log of edgeLogs) {
          const statusCode = log.status_code;
          const rawPath = normalizePath(log.path || '/unknown');

          // Skip ignored paths (deprecated tables, etc.)
          if (IGNORED_PATHS.some(ignored => rawPath.startsWith(ignored))) {
            continue;
          }

          const method = log.method || 'UNKNOWN';
          const errorPattern = extractErrorPattern(log.event_message);

          // Determine service from path
          let service = 'api';
          if (log.path?.includes('/functions/v1/') || log.event_message?.includes('/functions/v1/')) {
            service = 'edge-function';
          } else if (log.path?.includes('/auth/') || log.event_message?.includes('auth')) {
            service = 'auth';
          }

          logsPerService[service] = logsPerService[service] || { scanned: 0, errors: 0 };
          logsPerService[service].scanned++;
          logsPerService[service].errors++;

          const signature = generateSignature(rawPath, method, statusCode);

          if (errorGroups.has(signature)) {
            const group = errorGroups.get(signature)!;
            group.count++;
            group.lastSeen = new Date(log.timestamp / 1000); // Convert microseconds to ms
          } else {
            errorGroups.set(signature, {
              signature,
              path: rawPath,
              method,
              statusCode,
              errorPattern,
              service,
              count: 1,
              firstSeen: new Date(log.timestamp / 1000),
              lastSeen: new Date(log.timestamp / 1000),
              sampleMessage: log.event_message?.substring(0, 1000) || '',
            });
          }
        }
      } else {
        console.error('Failed to fetch edge errors:', edgeResponse.status, await edgeResponse.text());
      }
    } catch (edgeError) {
      console.error('Error fetching edge errors:', edgeError);
    }

    // Query 2: Get Postgres errors
    try {
      console.log('Fetching Postgres errors...');

      const pgErrorsSql = `
        SELECT
          timestamp,
          event_message,
          error_severity
        FROM postgres_logs
        WHERE error_severity IN ('ERROR', 'FATAL', 'PANIC')
        ORDER BY timestamp DESC
        LIMIT 200
      `;

      const pgParams = new URLSearchParams({
        sql: pgErrorsSql,
        iso_timestamp_start: timestampStart,
        iso_timestamp_end: timestampEnd,
      });

      const pgResponse = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/analytics/endpoints/logs.all?${pgParams}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (pgResponse.ok) {
        const pgData = await pgResponse.json();
        // Ensure pgLogs is always an array
        let pgLogs: any[] = [];
        if (Array.isArray(pgData.result)) {
          pgLogs = pgData.result;
        } else if (Array.isArray(pgData)) {
          pgLogs = pgData;
        }

        console.log(`Found ${pgLogs.length} Postgres errors`);
        totalLogsScanned += pgLogs.length;
        logsPerService['postgres'] = { scanned: pgLogs.length, errors: pgLogs.length };

        for (const log of pgLogs) {
          const path = '/postgres';
          const method = 'SQL';
          const statusCode = 500;
          const errorPattern = extractErrorPattern(log.event_message);
          const signature = generateSignature(path, method, statusCode);

          if (errorGroups.has(signature)) {
            const group = errorGroups.get(signature)!;
            group.count++;
            group.lastSeen = new Date(log.timestamp / 1000);
          } else {
            errorGroups.set(signature, {
              signature,
              path,
              method,
              statusCode,
              errorPattern,
              service: 'postgres',
              count: 1,
              firstSeen: new Date(log.timestamp / 1000),
              lastSeen: new Date(log.timestamp / 1000),
              sampleMessage: log.event_message?.substring(0, 1000) || '',
            });
          }
        }
      } else {
        console.error('Failed to fetch Postgres errors:', pgResponse.status, await pgResponse.text());
      }
    } catch (pgError) {
      console.error('Error fetching Postgres errors:', pgError);
    }

    // Also fetch raw logs count for stats
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/analytics/endpoints/logs.all?` +
        new URLSearchParams({
          iso_timestamp_start: timestampStart,
          iso_timestamp_end: timestampEnd,
        }),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Ensure logs is always an array
        let logs: any[] = [];
        if (Array.isArray(data.result)) {
          logs = data.result;
        } else if (Array.isArray(data)) {
          logs = data;
        }
        // Add to total logs scanned for stats (SQL queries counted errors directly)
        if (logs.length > totalLogsScanned) {
          totalLogsScanned = logs.length;
        }
        console.log(`Total logs in time window: ${logs.length}`);
      }
    } catch (statsError) {
      console.error('Error fetching stats:', statsError);
    }

    // Process errors against known issues
    let newIssues = 0;
    let recurringIssues = 0;
    const alertableIssues: ErrorGroup[] = [];

    for (const [signature, errorGroup] of errorGroups) {
      const { data: existingIssue } = await supabase
        .from('log_audit_issues')
        .select('*')
        .eq('error_signature', signature)
        .single();

      if (existingIssue) {
        const newStatus = existingIssue.status === 'resolved' ? 'recurring' : existingIssue.status;

        await supabase
          .from('log_audit_issues')
          .update({
            last_seen_at: errorGroup.lastSeen.toISOString(),
            occurrence_count: existingIssue.occurrence_count + errorGroup.count,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingIssue.id);

        if (existingIssue.status === 'resolved') {
          recurringIssues++;
          if (!existingIssue.suppress_alerts) {
            alertableIssues.push(errorGroup);
          }
        }
      } else {
        await supabase
          .from('log_audit_issues')
          .insert({
            error_signature: signature,
            path: errorGroup.path,
            method: errorGroup.method,
            status_code: errorGroup.statusCode,
            error_pattern: errorGroup.errorPattern,
            service: errorGroup.service,
            first_seen_at: errorGroup.firstSeen.toISOString(),
            last_seen_at: errorGroup.lastSeen.toISOString(),
            occurrence_count: errorGroup.count,
            status: 'new',
          });

        newIssues++;
        alertableIssues.push(errorGroup);
      }
    }

    // Send alerts for new/recurring issues
    if (alertableIssues.length > 0) {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, email, fcm_token, first_name')
        .eq('role', 'admin')
        .not('fcm_token', 'is', null);

      const alertTitle = `Log Audit: ${alertableIssues.length} Error${alertableIssues.length > 1 ? 's' : ''} Detected`;
      const alertBody = alertableIssues
        .slice(0, 5)
        .map(e => `${e.statusCode} ${e.method} ${e.path} (${e.count}x)`)
        .join('\n');

      for (const admin of admins || []) {
        try {
          await supabase.functions.invoke('send-fcm-notification', {
            body: {
              userId: admin.id,
              title: alertTitle,
              body: alertBody.substring(0, 200),
              data: {
                type: 'log_audit_alert',
                deepLink: 'mindmuscle://admin/logs',
                issueCount: alertableIssues.length.toString(),
              },
            },
          });
        } catch (notifError) {
          console.error(`Failed to notify admin ${admin.id}:`, notifError);
        }
      }

      // Also send email alert for critical issues
      try {
        await supabase.functions.invoke('send-admin-alert-email', {
          body: {
            alertId: `log_audit_${Date.now()}`,
            alertType: 'error',
            message: `Log audit detected ${alertableIssues.length} error(s) in the last hour that require attention.`,
            metadata: {
              'New Issues': newIssues,
              'Recurring Issues': recurringIssues,
              'Top Errors': alertableIssues.slice(0, 5).map(e =>
                `${e.statusCode} ${e.method} ${e.path} (${e.count}x)`
              ).join(', '),
              'View Details': 'https://mindandmuscle.ai/admin/system → Log Audit tab'
            }
          }
        });
        console.log('Log audit email alert sent');
      } catch (emailError) {
        console.error('Failed to send log audit email:', emailError);
      }

      const signatures = alertableIssues.map(e => e.signature);
      await supabase
        .from('log_audit_issues')
        .update({ alert_sent_at: new Date().toISOString() })
        .in('error_signature', signatures);
    }

    // Update audit run record
    if (auditRun) {
      await supabase
        .from('log_audit_runs')
        .update({
          completed_at: new Date().toISOString(),
          logs_scanned: totalLogsScanned,
          errors_found: errorGroups.size,
          new_issues: newIssues,
          recurring_issues: recurringIssues,
        })
        .eq('id', auditRun.id);
    }

    // Log per-service breakdown
    console.log('Log Audit per-service breakdown:', JSON.stringify(logsPerService));
    console.log(`Log Audit completed: ${totalLogsScanned} logs, ${errorGroups.size} unique errors, ${newIssues} new, ${recurringIssues} recurring`);

    return NextResponse.json({
      success: true,
      duration_ms: Date.now() - startTime,
      logs_scanned: totalLogsScanned,
      errors_found: errorGroups.size,
      new_issues: newIssues,
      recurring_issues: recurringIssues,
      alerts_sent: alertableIssues.length,
      per_service: logsPerService,
    });
  } catch (error: any) {
    console.error('Log audit cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
