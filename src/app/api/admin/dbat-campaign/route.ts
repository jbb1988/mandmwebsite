import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch D-BAT campaign data
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeContacts = searchParams.get('includeContacts') === 'true';
    const status = searchParams.get('status');

    // Get D-BAT campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('segment', 'dbat_facility')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (campaignError && campaignError.code !== 'PGRST116') {
      throw campaignError;
    }

    // Get D-BAT organizations count and list
    let orgQuery = supabase
      .from('marketing_organizations')
      .select('*')
      .eq('segment', 'dbat_facility');

    if (status) {
      orgQuery = orgQuery.eq('status', status);
    }

    const { data: organizations, error: orgError } = await orgQuery.order('name');

    if (orgError) throw orgError;

    // Get contacts if requested
    let contacts = null;
    if (includeContacts && organizations) {
      const orgIds = organizations.map(o => o.id);
      const { data: contactData, error: contactError } = await supabase
        .from('marketing_contacts')
        .select('*')
        .in('organization_id', orgIds);

      if (contactError) throw contactError;
      contacts = contactData;
    }

    // Get email templates
    const { data: templates, error: templateError } = await supabase
      .from('marketing_email_templates')
      .select('id, name, sequence_step, subject_line')
      .eq('segment', 'dbat_facility')
      .order('sequence_step');

    if (templateError) throw templateError;

    // Get state breakdown
    const stateBreakdown: Record<string, number> = {};
    organizations?.forEach(org => {
      const state = org.metadata?.state || 'Unknown';
      stateBreakdown[state] = (stateBreakdown[state] || 0) + 1;
    });

    return NextResponse.json({
      campaign,
      organizations: organizations || [],
      organizationCount: organizations?.length || 0,
      contacts: contacts,
      contactCount: contacts?.length || null,
      templates: templates || [],
      stateBreakdown,
      stats: {
        total: organizations?.length || 0,
        byStatus: {
          ready: organizations?.filter(o => o.status === 'ready').length || 0,
          contacted: organizations?.filter(o => o.status === 'contacted').length || 0,
          replied: organizations?.filter(o => o.status === 'replied').length || 0,
          meeting_scheduled: organizations?.filter(o => o.status === 'meeting_scheduled').length || 0,
          negotiating: organizations?.filter(o => o.status === 'negotiating').length || 0,
          won: organizations?.filter(o => o.status === 'won').length || 0,
          lost: organizations?.filter(o => o.status === 'lost').length || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching D-BAT campaign data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch D-BAT campaign data' },
      { status: 500 }
    );
  }
}

// POST: Update D-BAT organization status or add notes
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, organizationId, status, notes, campaignStatus } = body;

    if (action === 'updateOrganization') {
      if (!organizationId) {
        return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
      }

      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await supabase
        .from('marketing_organizations')
        .update(updates)
        .eq('id', organizationId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, organization: data });
    }

    if (action === 'updateCampaignStatus') {
      if (!campaignStatus) {
        return NextResponse.json({ error: 'Campaign status required' }, { status: 400 });
      }

      const updates: Record<string, any> = { status: campaignStatus };
      if (campaignStatus === 'active') {
        updates.started_at = new Date().toISOString();
      } else if (campaignStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('marketing_campaigns')
        .update(updates)
        .eq('segment', 'dbat_facility')
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, campaign: data });
    }

    if (action === 'bulkUpdateStatus') {
      const { organizationIds, newStatus } = body;
      if (!organizationIds?.length || !newStatus) {
        return NextResponse.json({ error: 'Organization IDs and new status required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('marketing_organizations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', organizationIds)
        .select();

      if (error) throw error;

      return NextResponse.json({ success: true, updated: data?.length || 0 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating D-BAT campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update D-BAT campaign' },
      { status: 500 }
    );
  }
}
