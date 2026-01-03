import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

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

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

    if (!accessToken) {
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

    // Fetch logs from Management API
    for (const service of SERVICES_TO_CHECK) {
      try {
        const response = await fetch(
          `https://api.supabase.com/v1/projects/${PROJECT_REF}/analytics/endpoints/logs.all?` +
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

        const logs = await response.json();
        totalLogsScanned += logs.length;

        for (const log of logs) {
          const statusCode = log.status_code || log.metadata?.response?.[0]?.status_code;
          if (!statusCode || statusCode < 400) continue;

          const path = normalizePath(log.path || log.metadata?.request?.[0]?.path || '/unknown');
          const method = log.method || log.metadata?.request?.[0]?.method || 'UNKNOWN';
          const errorPattern = extractErrorPattern(log.event_message);
          const signature = generateSignature(path, method, statusCode, errorPattern);

          if (errorGroups.has(signature)) {
            const group = errorGroups.get(signature)!;
            group.count++;
            group.lastSeen = new Date(log.timestamp);
          } else {
            errorGroups.set(signature, {
              signature,
              path,
              method,
              statusCode,
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

    return NextResponse.json({
      success: true,
      duration_ms: Date.now() - startTime,
      logs_scanned: totalLogsScanned,
      errors_found: errorGroups.size,
      new_issues: newIssues,
      recurring_issues: recurringIssues,
      alerts_sent: alertableIssues.length,
    });
  } catch (error: any) {
    console.error('Log audit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
