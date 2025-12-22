import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin, verifyAdminWithRateLimit } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'update';
  priority: number;
  active: boolean;
  target_audience: 'all' | 'free' | 'premium' | 'coach';
  target_user_ids: string[] | null;
  created_at: string;
  expires_at: string | null;
  created_by: string | null;
}

// GET: List all announcements
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = supabase
      .from('system_announcements')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data: announcements, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get stats
    const stats = {
      total: announcements?.length || 0,
      active: announcements?.filter((a: SystemAnnouncement) => a.active).length || 0,
      inactive: announcements?.filter((a: SystemAnnouncement) => !a.active).length || 0,
      byType: {
        info: announcements?.filter((a: SystemAnnouncement) => a.type === 'info').length || 0,
        warning: announcements?.filter((a: SystemAnnouncement) => a.type === 'warning').length || 0,
        success: announcements?.filter((a: SystemAnnouncement) => a.type === 'success').length || 0,
        update: announcements?.filter((a: SystemAnnouncement) => a.type === 'update').length || 0,
      },
    };

    return NextResponse.json({
      success: true,
      announcements: announcements || [],
      stats,
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create, update, delete, or toggle announcements (rate limited)
export async function POST(request: NextRequest) {
  const auth = await verifyAdminWithRateLimit(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { action } = body;

    // CREATE announcement
    if (action === 'create') {
      const { title, message, type, priority, target_audience, target_user_ids, expires_at, created_by } = body;

      if (!title || !message) {
        return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('system_announcements')
        .insert({
          title,
          message,
          type: type || 'info',
          priority: priority || 0,
          active: true,
          target_audience: target_audience || 'all',
          target_user_ids: target_user_ids || null,
          expires_at: expires_at || null,
          created_by: created_by || 'Admin',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, announcement: data, message: 'Announcement created' });
    }

    // UPDATE announcement
    if (action === 'update') {
      const { id, title, message, type, priority, target_audience, target_user_ids, expires_at, active } = body;

      if (!id) {
        return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
      }

      const updateData: Partial<SystemAnnouncement> = {};
      if (title !== undefined) updateData.title = title;
      if (message !== undefined) updateData.message = message;
      if (type !== undefined) updateData.type = type;
      if (priority !== undefined) updateData.priority = priority;
      if (target_audience !== undefined) updateData.target_audience = target_audience;
      if (target_user_ids !== undefined) updateData.target_user_ids = target_user_ids;
      if (expires_at !== undefined) updateData.expires_at = expires_at;
      if (active !== undefined) updateData.active = active;

      const { data, error } = await supabase
        .from('system_announcements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, announcement: data, message: 'Announcement updated' });
    }

    // TOGGLE active status
    if (action === 'toggle') {
      const { id } = body;

      if (!id) {
        return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
      }

      // Get current status
      const { data: current, error: fetchError } = await supabase
        .from('system_announcements')
        .select('active')
        .eq('id', id)
        .single();

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      // Toggle
      const { data, error } = await supabase
        .from('system_announcements')
        .update({ active: !current.active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        announcement: data,
        message: data.active ? 'Announcement activated' : 'Announcement deactivated',
      });
    }

    // DELETE announcement
    if (action === 'delete') {
      const { id } = body;

      if (!id) {
        return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('system_announcements')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Announcement deleted' });
    }

    // SEARCH USERS for targeting
    if (action === 'search-users') {
      const { query } = body;

      if (!query || query.length < 2) {
        return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
      }

      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, email, name')
        .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(10);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, users: users || [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in announcement management:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
