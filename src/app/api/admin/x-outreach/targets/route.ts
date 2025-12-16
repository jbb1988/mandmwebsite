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

// GET - Fetch targets with filters
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';

    let query = supabase
      .from('x_target_accounts')
      .select('*')
      .order('priority_score', { ascending: false, nullsFirst: false })
      .order('follower_count', { ascending: false, nullsFirst: false });

    if (status !== 'all') {
      query = query.eq('outreach_status', status);
    }

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`handle.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    const { data: targets, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching targets:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, targets });
  } catch (error) {
    console.error('Error fetching targets:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch targets';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST - Add new target
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      handle,
      display_name,
      follower_count,
      category,
      bio,
      priority_score,
      notes,
    } = body;

    if (!handle) {
      return NextResponse.json({ success: false, message: 'Handle is required' }, { status: 400 });
    }

    // Clean handle (remove @ if present)
    const cleanHandle = handle.replace(/^@/, '').toLowerCase();

    // Check for duplicate
    const { data: existing, error: checkError } = await supabase
      .from('x_target_accounts')
      .select('id, handle')
      .eq('handle', cleanHandle)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking duplicate:', checkError);
      return NextResponse.json({ success: false, message: `Database error: ${checkError.message}` }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({
        success: false,
        message: `@${existing.handle} already exists in the database`
      }, { status: 400 });
    }

    // Auto-calculate priority based on follower count if not provided
    function calculatePriority(followers: number | null): number {
      if (!followers || followers < 10000) return 1;
      if (followers < 50000) return 2;
      if (followers < 100000) return 3;
      if (followers < 500000) return 4;
      return 5; // 500K+ followers
    }

    const { data, error } = await supabase
      .from('x_target_accounts')
      .insert({
        handle: cleanHandle,
        display_name: display_name || null,
        follower_count: follower_count || null,
        category: category || 'influencer',
        bio: bio || null,
        priority_score: priority_score || calculatePriority(follower_count),
        notes: notes || null,
        outreach_status: 'not_started',
        response_status: 'no_response',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting target:', error);
      return NextResponse.json({ success: false, message: `Insert error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Target added successfully!', target: data });
  } catch (error) {
    console.error('Error adding target:', error);
    const message = error instanceof Error ? error.message : 'Failed to add target';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PATCH - Update target
export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Target ID is required' }, { status: 400 });
    }

    // If marking as dm_sent, set dm_sent_at
    if (updates.outreach_status === 'dm_sent' && !updates.dm_sent_at) {
      updates.dm_sent_at = new Date().toISOString();
    }

    // If marking as responded, set response_at
    if (updates.response_status && updates.response_status !== 'no_response' && !updates.response_at) {
      updates.response_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('x_target_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Target updated successfully!', target: data });
  } catch (error) {
    console.error('Error updating target:', error);
    return NextResponse.json({ success: false, message: 'Failed to update target' }, { status: 500 });
  }
}

// DELETE - Remove target
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Target ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('x_target_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Target deleted successfully!' });
  } catch (error) {
    console.error('Error deleting target:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete target' }, { status: 500 });
  }
}
