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

// Unified contact interface
export interface UnifiedContact {
  id: string;
  source: 'facebook' | 'twitter';
  source_id: string;
  name: string;
  handle?: string;
  group_name?: string;
  profile_url: string;
  follower_count?: number;
  member_count?: number;
  stage: 'not_contacted' | 'dm_sent' | 'responded' | 'won';
  dm_sent_at: string | null;
  days_since_dm: number | null;
  response_status: string;
  next_follow_up: string | null;
  follow_up_overdue: boolean;
  partner_signed_up: boolean;
  trial_granted_at: string | null;
  template_used: string | null;
  notes: string | null;
  priority_score: number;
  created_at: string;
  // Additional fields for display
  category?: string;
  state?: string;
  is_member?: boolean;
  bio?: string;
  contact_email?: string;
}

// Calculate stage from contact data
function calculateStage(contact: {
  partner_signed_up?: boolean;
  response_status?: string;
  dm_sent_at?: string | null;
}): UnifiedContact['stage'] {
  if (contact.partner_signed_up) return 'won';

  const respondedStatuses = ['interested', 'responded', 'negotiating', 'trial_requested', 'positive', 'maybe'];
  if (contact.response_status && respondedStatuses.includes(contact.response_status.toLowerCase())) {
    return 'responded';
  }

  if (contact.dm_sent_at) return 'dm_sent';

  return 'not_contacted';
}

// Calculate days since DM
function daysSinceDm(dmSentAt: string | null): number | null {
  if (!dmSentAt) return null;
  const dmDate = new Date(dmSentAt);
  const now = new Date();
  const diffMs = now.getTime() - dmDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// Check if follow-up is overdue
function isFollowUpOverdue(nextFollowUp: string | null): boolean {
  if (!nextFollowUp) return false;
  const followUpDate = new Date(nextFollowUp);
  const now = new Date();
  return followUpDate < now;
}

// GET - Fetch unified pipeline
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all'; // 'all', 'facebook', 'twitter'
    const stage = searchParams.get('stage') || 'all';
    const search = searchParams.get('search') || '';

    const contacts: UnifiedContact[] = [];

    // Fetch Facebook admins with page info
    if (source === 'all' || source === 'facebook') {
      const { data: pages, error: pagesError } = await supabase
        .from('fb_page_outreach')
        .select('*');

      if (pagesError) throw pagesError;

      if (pages && pages.length > 0) {
        const pageIds = pages.map(p => p.id);
        const pageMap = new Map(pages.map(p => [p.id, p]));

        const { data: admins, error: adminsError } = await supabase
          .from('fb_page_admins')
          .select('*')
          .in('page_id', pageIds);

        if (adminsError) throw adminsError;

        if (admins) {
          admins.forEach(admin => {
            const page = pageMap.get(admin.page_id);
            if (!page) return;

            const contact: UnifiedContact = {
              id: `fb_${admin.id}`,
              source: 'facebook',
              source_id: admin.id,
              name: admin.admin_name || 'Unknown Admin',
              group_name: page.page_name,
              profile_url: admin.admin_profile_url || page.page_url,
              member_count: page.member_count,
              stage: calculateStage({
                partner_signed_up: admin.partner_signed_up,
                response_status: admin.response_status,
                dm_sent_at: admin.dm_sent_at,
              }),
              dm_sent_at: admin.dm_sent_at,
              days_since_dm: daysSinceDm(admin.dm_sent_at),
              response_status: admin.response_status || 'not_contacted',
              next_follow_up: admin.next_follow_up,
              follow_up_overdue: isFollowUpOverdue(admin.next_follow_up),
              partner_signed_up: admin.partner_signed_up || false,
              trial_granted_at: admin.trial_granted_at,
              template_used: admin.template_used,
              notes: admin.notes || page.notes,
              priority_score: page.priority_score || 1,
              created_at: admin.created_at || page.created_at,
              state: page.state,
              is_member: page.is_member || admin.is_member,
              contact_email: admin.admin_email,
            };

            contacts.push(contact);
          });
        }
      }
    }

    // Fetch X/Twitter targets
    if (source === 'all' || source === 'twitter') {
      const { data: targets, error: targetsError } = await supabase
        .from('x_target_accounts')
        .select('*');

      if (targetsError) throw targetsError;

      if (targets) {
        targets.forEach(target => {
          const contact: UnifiedContact = {
            id: `x_${target.id}`,
            source: 'twitter',
            source_id: target.id,
            name: target.display_name || `@${target.handle}`,
            handle: target.handle,
            profile_url: `https://x.com/${target.handle}`,
            follower_count: target.follower_count,
            stage: calculateStage({
              partner_signed_up: target.partner_signed_up,
              response_status: target.response_status,
              dm_sent_at: target.dm_sent_at,
            }),
            dm_sent_at: target.dm_sent_at,
            days_since_dm: daysSinceDm(target.dm_sent_at),
            response_status: target.response_status || 'no_response',
            next_follow_up: target.next_follow_up,
            follow_up_overdue: isFollowUpOverdue(target.next_follow_up),
            partner_signed_up: target.partner_signed_up || false,
            trial_granted_at: target.trial_granted_at,
            template_used: target.template_used,
            notes: target.notes,
            priority_score: target.priority_score || 1,
            created_at: target.created_at,
            category: target.category,
            bio: target.bio,
            contact_email: target.contact_email,
          };

          contacts.push(contact);
        });
      }
    }

    // Filter by stage
    let filteredContacts = contacts;
    if (stage !== 'all') {
      filteredContacts = contacts.filter(c => c.stage === stage);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredContacts = filteredContacts.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.handle?.toLowerCase().includes(searchLower) ||
        c.group_name?.toLowerCase().includes(searchLower) ||
        c.bio?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by priority (highest first), then by follow-up urgency
    filteredContacts.sort((a, b) => {
      // Overdue follow-ups first
      if (a.follow_up_overdue && !b.follow_up_overdue) return -1;
      if (!a.follow_up_overdue && b.follow_up_overdue) return 1;
      // Then by priority
      return (b.priority_score || 0) - (a.priority_score || 0);
    });

    // Calculate stats
    const stats = {
      total: contacts.length,
      not_contacted: contacts.filter(c => c.stage === 'not_contacted').length,
      dm_sent: contacts.filter(c => c.stage === 'dm_sent').length,
      responded: contacts.filter(c => c.stage === 'responded').length,
      won: contacts.filter(c => c.stage === 'won').length,
      facebook: contacts.filter(c => c.source === 'facebook').length,
      twitter: contacts.filter(c => c.source === 'twitter').length,
      follow_ups_due: contacts.filter(c => c.follow_up_overdue).length,
    };

    return NextResponse.json({
      success: true,
      contacts: filteredContacts,
      stats,
    });
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch pipeline' }, { status: 500 });
  }
}

// PATCH - Update a contact (routes to appropriate table based on source)
export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Contact ID is required' }, { status: 400 });
    }

    // Parse the id to determine source
    const [source, sourceId] = id.split('_');

    if (source === 'fb') {
      // Update FB admin
      const { data, error } = await supabase
        .from('fb_page_admins')
        .update(updates)
        .eq('id', sourceId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Contact updated', data });
    } else if (source === 'x') {
      // Update X target
      const { data, error } = await supabase
        .from('x_target_accounts')
        .update(updates)
        .eq('id', sourceId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Contact updated', data });
    }

    return NextResponse.json({ success: false, message: 'Invalid contact ID format' }, { status: 400 });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ success: false, message: 'Failed to update contact' }, { status: 500 });
  }
}
