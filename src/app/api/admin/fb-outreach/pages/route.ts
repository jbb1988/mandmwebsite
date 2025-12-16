import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

// Normalize Facebook URLs to prevent duplicates with slight variations
function normalizeFacebookUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash
    let path = parsed.pathname.replace(/\/$/, '');
    // Remove /about suffix if present
    path = path.replace(/\/about$/, '');
    // Reconstruct clean URL without query params
    return `https://www.facebook.com${path}`.toLowerCase();
  } catch {
    // If URL parsing fails, just clean up basic variations
    return url
      .toLowerCase()
      .replace(/\/about\/?$/, '')
      .replace(/\/$/, '')
      .replace(/\?.*$/, '');
  }
}

function verifyAdmin(request: NextRequest): boolean {
  const password = request.headers.get('X-Admin-Password');
  return password === ADMIN_PASSWORD;
}

// GET - Fetch pages with filters
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || 'all';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // First get pages
    let query = supabase
      .from('fb_page_outreach')
      .select('*')
      .order('priority_score', { ascending: false })
      .order('member_count', { ascending: false, nullsFirst: false });

    if (state !== 'all') {
      query = query.eq('state', state);
    }

    if (status !== 'all') {
      query = query.eq('outreach_status', status);
    }

    if (search) {
      query = query.or(`page_name.ilike.%${search}%,admin_name.ilike.%${search}%`);
    }

    const { data: pages, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching pages:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Then get admins for these pages with their linked partner data
    if (pages && pages.length > 0) {
      const pageIds = pages.map(p => p.id);

      // Try to fetch with partner join first
      let admins = null;
      let adminsError = null;

      try {
        const result = await supabase
          .from('fb_page_admins')
          .select(`
            *,
            finder_fee_partner:finder_fee_partner_id (
              id,
              partner_code,
              partner_email,
              partner_name,
              enabled,
              is_recurring
            )
          `)
          .in('page_id', pageIds);

        admins = result.data;
        adminsError = result.error;
      } catch (e) {
        console.error('Error with partner join, falling back:', e);
        // Fallback to simple query without join
        const result = await supabase
          .from('fb_page_admins')
          .select('*')
          .in('page_id', pageIds);
        admins = result.data;
        adminsError = result.error;
      }

      if (adminsError) {
        console.error('Error fetching admins:', adminsError);
      }

      if (admins) {
        // Attach admins to their pages
        const adminsByPage: Record<string, typeof admins> = {};
        admins.forEach(admin => {
          if (!adminsByPage[admin.page_id]) {
            adminsByPage[admin.page_id] = [];
          }
          adminsByPage[admin.page_id].push(admin);
        });

        pages.forEach(page => {
          (page as typeof page & { fb_page_admins: typeof admins }).fb_page_admins = adminsByPage[page.id] || [];
        });
      }
    }

    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch pages';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST - Add new page
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      page_name,
      page_url,
      admins, // Array of { name, profile_url }
      state,
      member_count,
      group_type,
      sport,
      priority_score,
      notes,
    } = body;

    if (!page_name || !page_url) {
      return NextResponse.json({ success: false, message: 'Page name and URL are required' }, { status: 400 });
    }

    // Auto-calculate priority (1-5) based on member count if not provided
    function calculatePriority(members: number | null): number {
      if (!members || members < 500) return 1;
      if (members < 1000) return 2;
      if (members < 5000) return 3;
      if (members < 10000) return 4;
      return 5; // 10K+ members
    }

    const calculatedPriority = priority_score || calculatePriority(member_count);

    // Normalize the URL to prevent duplicates with variations
    const normalizedUrl = normalizeFacebookUrl(page_url);

    // Check for duplicate
    const { data: existing, error: checkError } = await supabase
      .from('fb_page_outreach')
      .select('id, page_name')
      .eq('page_url', normalizedUrl)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking duplicate:', checkError);
      return NextResponse.json({ success: false, message: `Database error: ${checkError.message}` }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({
        success: false,
        message: `This group already exists as "${existing.page_name}"`
      }, { status: 400 });
    }

    // Insert the page first
    const { data: pageData, error: pageError } = await supabase
      .from('fb_page_outreach')
      .insert({
        page_name,
        page_url: normalizedUrl, // Store normalized URL
        page_type: 'group', // Required field - default to 'group'
        sport: sport || 'baseball', // Required field - accept from body or default to 'baseball'
        state: state || null,
        member_count: member_count || null,
        group_type: group_type || null,
        priority_score: calculatedPriority,
        notes: notes || null,
        outreach_status: 'not_started',
      })
      .select()
      .single();

    if (pageError) {
      console.error('Error inserting page:', pageError);
      return NextResponse.json({ success: false, message: `Insert error: ${pageError.message}` }, { status: 500 });
    }

    // Insert admins if provided
    if (admins && Array.isArray(admins) && admins.length > 0) {
      const adminRecords = admins
        .filter((a: { name: string; profile_url?: string; email?: string }) => a.name?.trim())
        .map((a: { name: string; profile_url?: string; email?: string }, index: number) => ({
          page_id: pageData.id,
          admin_name: a.name.trim(),
          admin_profile_url: a.profile_url?.trim() || null,
          admin_email: a.email?.trim() || null, // For auto-linking to finder_fee_partners
          is_primary: index === 0, // First admin is primary
        }));

      if (adminRecords.length > 0) {
        const { error: adminsError } = await supabase
          .from('fb_page_admins')
          .insert(adminRecords);

        if (adminsError) {
          console.error('Error inserting admins:', adminsError);
          // Page was created, just warn about admins
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Page added successfully!', page: pageData });
  } catch (error) {
    console.error('Error adding page:', error);
    const message = error instanceof Error ? error.message : 'Failed to add page';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PATCH - Update page status
export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Page ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('fb_page_outreach')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Page updated successfully!', page: data });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({ success: false, message: 'Failed to update page' }, { status: 500 });
  }
}

// DELETE - Remove page
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Page ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('fb_page_outreach')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Page deleted successfully!' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete page' }, { status: 500 });
  }
}
