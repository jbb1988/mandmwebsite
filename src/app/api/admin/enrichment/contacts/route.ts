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

  const { searchParams } = new URL(request.url);
  const segment = searchParams.get('segment');
  const search = searchParams.get('search');
  const stage = searchParams.get('stage');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const followUpOverdue = searchParams.get('follow_up_overdue') === 'true';
  const orgId = searchParams.get('org_id');

  try {
    // Build query for contacts with their organizations
    let query = supabase
      .from('marketing_contacts')
      .select(`
        id,
        email,
        first_name,
        last_name,
        title,
        phone,
        linkedin_url,
        source,
        confidence,
        quality_score,
        stage,
        notes,
        last_contacted_at,
        next_follow_up,
        created_at,
        organization_id,
        organization:marketing_organizations!inner(
          id,
          name,
          segment,
          website,
          city,
          state
        )
      `, { count: 'exact' })
      .not('email', 'is', null);

    // Filter by segment
    if (segment && segment !== 'all') {
      query = query.eq('organization.segment', segment);
    }

    // Filter by organization ID
    if (orgId) {
      query = query.eq('organization_id', orgId);
    }

    // Filter by stage
    if (stage && stage !== 'all') {
      query = query.eq('stage', stage);
    }

    // Search
    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    // Filter for overdue follow-ups
    if (followUpOverdue) {
      query = query.lt('next_follow_up', new Date().toISOString());
      query = query.not('next_follow_up', 'is', null);
      query = query.order('next_follow_up', { ascending: true });
    } else {
      // Order by created_at desc by default
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: contacts, error, count } = await query;

    if (error) throw error;

    // Get stage counts for the segment
    let stageCountsQuery = supabase
      .from('marketing_contacts')
      .select('stage, organization:marketing_organizations!inner(segment)', { count: 'exact' })
      .not('email', 'is', null);

    if (segment && segment !== 'all') {
      stageCountsQuery = stageCountsQuery.eq('organization.segment', segment);
    }

    const { data: stageData } = await stageCountsQuery;

    const stageCounts = {
      all: stageData?.length || 0,
      new: stageData?.filter(c => !c.stage || c.stage === 'new').length || 0,
      email_sent: stageData?.filter(c => c.stage === 'email_sent').length || 0,
      responded: stageData?.filter(c => c.stage === 'responded').length || 0,
      meeting: stageData?.filter(c => c.stage === 'meeting').length || 0,
      won: stageData?.filter(c => c.stage === 'won').length || 0,
      lost: stageData?.filter(c => c.stage === 'lost').length || 0,
    };

    return NextResponse.json({
      success: true,
      contacts: contacts || [],
      total: count || 0,
      stageCounts,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch contacts' }, { status: 500 });
  }
}

// Update contact stage or details
export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Contact ID required' }, { status: 400 });
    }

    // Allowed fields to update
    const allowedFields = ['stage', 'notes', 'last_contacted_at', 'next_follow_up', 'quality_score'];
    const filteredUpdates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    const { data, error } = await supabase
      .from('marketing_contacts')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, contact: data });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ success: false, message: 'Failed to update contact' }, { status: 500 });
  }
}
