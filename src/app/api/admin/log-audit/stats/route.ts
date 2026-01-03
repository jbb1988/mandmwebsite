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
    // Get issue counts by status
    const { data: issues, error: issuesError } = await supabase
      .from('log_audit_issues')
      .select('status');

    if (issuesError) throw issuesError;

    const stats = {
      totalIssues: issues?.length || 0,
      newIssues: issues?.filter(i => i.status === 'new').length || 0,
      investigatingIssues: issues?.filter(i => i.status === 'investigating').length || 0,
      resolvedIssues: issues?.filter(i => i.status === 'resolved').length || 0,
      ignoredIssues: issues?.filter(i => i.status === 'ignored').length || 0,
      recurringIssues: issues?.filter(i => i.status === 'recurring').length || 0,
      lastAuditRun: null as any,
    };

    // Get last audit run
    const { data: lastRun } = await supabase
      .from('log_audit_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    stats.lastAuditRun = lastRun;

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching log audit stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
