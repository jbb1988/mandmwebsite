import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

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

    if (error) throw error;

    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch pages' }, { status: 500 });
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
      admin_name,
      admin_profile_url,
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

    // Check for duplicate
    const { data: existing, error: checkError } = await supabase
      .from('fb_page_outreach')
      .select('id')
      .eq('page_url', page_url)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking duplicate:', checkError);
      return NextResponse.json({ success: false, message: `Database error: ${checkError.message}` }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ success: false, message: 'This page URL already exists' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('fb_page_outreach')
      .insert({
        page_name,
        page_url,
        page_type: 'group', // Required field - default to 'group'
        sport: sport || 'baseball', // Required field - accept from body or default to 'baseball'
        admin_name: admin_name || null,
        admin_profile_url: admin_profile_url || null,
        state: state || null,
        member_count: member_count || null,
        group_type: group_type || null,
        priority_score: priority_score || 50,
        notes: notes || null,
        outreach_status: 'not_started',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting page:', error);
      return NextResponse.json({ success: false, message: `Insert error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Page added successfully!', page: data });
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
