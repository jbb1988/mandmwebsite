import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

function verifyAdmin(request: NextRequest): boolean {
  const password = request.headers.get('X-Admin-Password');
  return password === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get enrichment status by segment
    const { data: segmentStats, error: segmentError } = await supabase.rpc('get_enrichment_stats_by_segment');

    // If RPC doesn't exist, calculate manually
    let stats;
    if (segmentError) {
      // Get all orgs grouped by segment and enrichment status
      const { data: orgs, error: orgsError } = await supabase
        .from('marketing_organizations')
        .select('id, segment, enrichment_status, website, emails_found');

      if (orgsError) throw orgsError;

      // Calculate stats per segment
      const segmentMap = new Map<string, {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        failed: number;
        skipped: number;
        has_website: number;
        emails_found: number;
      }>();

      for (const org of orgs || []) {
        const segment = org.segment || 'unknown';
        if (!segmentMap.has(segment)) {
          segmentMap.set(segment, {
            total: 0,
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            skipped: 0,
            has_website: 0,
            emails_found: 0,
          });
        }
        const s = segmentMap.get(segment)!;
        s.total++;

        const status = org.enrichment_status || 'pending';
        if (status in s) {
          s[status as keyof typeof s]++;
        }

        if (org.website) s.has_website++;
        if (org.emails_found && org.emails_found.length > 0) s.emails_found++;
      }

      stats = Array.from(segmentMap.entries()).map(([segment, data]) => ({
        segment,
        ...data,
        coverage: data.total > 0 ? Math.round((data.emails_found / data.total) * 100) : 0,
      }));
    } else {
      stats = segmentStats;
    }

    // Get contact counts per segment
    const { data: contactStats, error: contactError } = await supabase
      .from('marketing_contacts')
      .select('organization:marketing_organizations!inner(segment)')
      .not('email', 'is', null);

    const contactsBySegment = new Map<string, number>();
    for (const contact of contactStats || []) {
      const segment = (contact.organization as any)?.segment || 'unknown';
      contactsBySegment.set(segment, (contactsBySegment.get(segment) || 0) + 1);
    }

    // Add contact counts to stats
    const enrichedStats = (stats || []).map((s: any) => ({
      ...s,
      contacts: contactsBySegment.get(s.segment) || 0,
    }));

    // Get recent enrichment activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('marketing_organizations')
      .select('id, name, segment, enrichment_status, enriched_at, emails_found, enrichment_error')
      .not('enriched_at', 'is', null)
      .order('enriched_at', { ascending: false })
      .limit(20);

    // Get orgs ready to enrich (have website, status pending)
    const { data: readyToEnrich, error: readyError } = await supabase
      .from('marketing_organizations')
      .select('id, name, segment, website')
      .eq('enrichment_status', 'pending')
      .not('website', 'is', null)
      .limit(100);

    return NextResponse.json({
      success: true,
      stats: enrichedStats,
      recentActivity: recentActivity || [],
      readyToEnrich: readyToEnrich || [],
      summary: {
        totalOrgs: enrichedStats.reduce((sum: number, s: any) => sum + s.total, 0),
        totalContacts: enrichedStats.reduce((sum: number, s: any) => sum + s.contacts, 0),
        pendingEnrichment: enrichedStats.reduce((sum: number, s: any) => sum + s.pending, 0),
        completedEnrichment: enrichedStats.reduce((sum: number, s: any) => sum + s.completed, 0),
        failedEnrichment: enrichedStats.reduce((sum: number, s: any) => sum + s.failed, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching enrichment stats:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch enrichment stats' }, { status: 500 });
  }
}
