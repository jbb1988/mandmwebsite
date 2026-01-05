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

    // Get contact counts per segment AND count of orgs with contacts, plus stage breakdown
    const { data: contactStats } = await supabase
      .from('marketing_contacts')
      .select('organization_id, stage, organization:marketing_organizations!inner(segment)')
      .not('email', 'is', null);

    const contactsBySegment = new Map<string, number>();
    const orgsWithContactsBySegment = new Map<string, Set<string>>();
    const stagesBySegment = new Map<string, Record<string, number>>();

    for (const contact of contactStats || []) {
      const segment = (contact.organization as any)?.segment || 'unknown';
      const orgId = contact.organization_id;
      const stage = (contact as any).stage || 'new';

      // Count total contacts per segment
      contactsBySegment.set(segment, (contactsBySegment.get(segment) || 0) + 1);

      // Track unique orgs with contacts per segment
      if (!orgsWithContactsBySegment.has(segment)) {
        orgsWithContactsBySegment.set(segment, new Set());
      }
      orgsWithContactsBySegment.get(segment)!.add(orgId);

      // Track stage counts per segment
      if (!stagesBySegment.has(segment)) {
        stagesBySegment.set(segment, { new: 0, email_sent: 0, responded: 0, meeting: 0, won: 0, lost: 0 });
      }
      const segmentStages = stagesBySegment.get(segment)!;
      segmentStages[stage] = (segmentStages[stage] || 0) + 1;
    }

    // Add contact counts to stats and calculate accurate coverage
    const enrichedStats = (stats || []).map((s: any) => {
      const contacts = contactsBySegment.get(s.segment) || 0;
      const orgsWithContacts = orgsWithContactsBySegment.get(s.segment)?.size || 0;
      const stages = stagesBySegment.get(s.segment) || { new: 0, email_sent: 0, responded: 0, meeting: 0, won: 0, lost: 0 };

      // Calculate conversion metrics
      const responseRate = stages.email_sent > 0 ? Math.round((stages.responded / stages.email_sent) * 100) : 0;
      const meetingRate = stages.responded > 0 ? Math.round((stages.meeting / stages.responded) * 100) : 0;
      const winRate = contacts > 0 ? Math.round((stages.won / contacts) * 100) : 0;

      return {
        segment: s.segment,
        total: s.total || 0,
        pending: s.pending || 0,
        processing: s.processing || 0,
        completed: s.completed || 0,
        failed: s.failed || 0,
        skipped: s.skipped || 0,
        has_website: s.has_website || 0,
        emails_found: s.emails_found || 0,
        contacts,
        orgsWithContacts,
        // Coverage = % of orgs that have at least one contact
        coverage: s.total > 0 ? Math.round((orgsWithContacts / s.total) * 100) : 0,
        // Stage breakdown
        stages,
        // Conversion metrics
        responseRate,
        meetingRate,
        winRate,
      };
    });

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
