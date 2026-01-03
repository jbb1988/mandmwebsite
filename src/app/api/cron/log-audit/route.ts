import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROJECT_REF = 'kuswlvbjplkgrqlmqtok';
const SERVICES_TO_CHECK = ['api', 'edge-function', 'auth', 'postgres'];

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

function generateSignature(path: string, method: string, statusCode: number, errorPattern: string): string {
  const input = `${path}:${method}:${statusCode}:${errorPattern}`;
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

    // Map service names to Supabase log endpoint names
    const serviceEndpointMap: Record<string, string> = {
      'api': 'logs.edge.reports',
      'edge-function': 'logs.edge.functions',
      'auth': 'logs.auth.reports',
      'postgres': 'logs.postgres.reports',
    };

    // Fetch logs from Management API - use service-specific endpoints
    for (const service of SERVICES_TO_CHECK) {
      try {
        const endpoint = serviceEndpointMap[service] || 'logs.all';
        const response = await fetch(
          `https://api.supabase.com/v1/projects/${PROJECT_REF}/analytics/endpoints/${endpoint}?` +
          new URLSearchParams({
            iso_timestamp_start: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            iso_timestamp_end: new Date().toISOString(),
          }),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch ${service} logs:`, response.status);
          continue;
        }

        const data = await response.json();

        // Handle different response formats from Supabase Management API
        let logs: any[] = [];
        if (Array.isArray(data)) {
          logs = data;
        } else if (data.result && Array.isArray(data.result)) {
          logs = data.result;
        } else if (data.data && Array.isArray(data.data)) {
          logs = data.data;
        } else {
          console.error(`Unexpected log format for ${service}:`, JSON.stringify(data).substring(0, 500));
          continue;
        }

        totalLogsScanned += logs.length;
        logsPerService[service] = { scanned: logs.length, errors: 0 };

        // Log first entry for debugging if we have logs but find no errors
        if (logs.length > 0 && service === 'postgres') {
          const sample = logs.find((l: any) => l.error_severity === 'ERROR');
          if (sample) {
            console.log(`Sample ${service} error:`, JSON.stringify(sample).substring(0, 300));
          }
        }

        for (const log of logs) {
          // Get status code from various possible locations
          const statusCode = log.status_code ||
            log.metadata?.response?.[0]?.status_code ||
            log.response_status_code;
          const errorSeverity = log.error_severity;

          // Check for HTTP errors (status >= 400) OR postgres errors (error_severity = ERROR/FATAL/PANIC)
          const isHttpError = statusCode && statusCode >= 400;
          const isPostgresError = errorSeverity && ['ERROR', 'FATAL', 'PANIC'].includes(errorSeverity);

          // Also check for edge function errors via execution_time_ms presence + status
          const isEdgeFunctionError = service === 'edge-function' && log.status_code && log.status_code >= 400;

          if (!isHttpError && !isPostgresError && !isEdgeFunctionError) continue;

          // Count this error
          logsPerService[service].errors++;

          // Extract path - for edge functions, try to get function name from event_message
          let rawPath = log.path || log.metadata?.request?.[0]?.path;
          if (!rawPath && service === 'edge-function' && log.event_message) {
            // Extract function name from URLs like "https://xxx.supabase.co/functions/v1/function-name"
            const funcMatch = log.event_message.match(/\/functions\/v1\/([a-z0-9-]+)/i);
            if (funcMatch) {
              rawPath = `/functions/v1/${funcMatch[1]}`;
            }
          }
          if (!rawPath && isPostgresError) {
            rawPath = '/postgres';
          }
          const path = normalizePath(rawPath || '/unknown');
          const method = log.method || log.metadata?.request?.[0]?.method || (isPostgresError ? 'SQL' : 'UNKNOWN');
          const errorPattern = extractErrorPattern(log.event_message);
          const effectiveStatusCode = statusCode || (isPostgresError ? 500 : 0);
          const signature = generateSignature(path, method, effectiveStatusCode, errorPattern);

          if (errorGroups.has(signature)) {
            const group = errorGroups.get(signature)!;
            group.count++;
            group.lastSeen = new Date(log.timestamp);
          } else {
            errorGroups.set(signature, {
              signature,
              path,
              method,
              statusCode: effectiveStatusCode,
              errorPattern,
              service,
              count: 1,
              firstSeen: new Date(log.timestamp),
              lastSeen: new Date(log.timestamp),
              sampleMessage: log.event_message?.substring(0, 1000) || '',
            });
          }
        }
      } catch (serviceError) {
        console.error(`Error processing ${service} logs:`, serviceError);
      }
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
