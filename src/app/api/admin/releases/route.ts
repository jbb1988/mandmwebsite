import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin, verifyAdminWithRateLimit } from '@/lib/admin-auth';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface AppRelease {
  id: string;
  version: string;
  raw_notes: string;
  polished_notes: string | null;
  status: 'draft' | 'polished' | 'published';
  platform: 'ios' | 'android' | 'both';
  commit_count: number;
  tag_name: string | null;
  commit_sha: string | null;
  created_at: string;
  polished_at: string | null;
  published_at: string | null;
  created_by: string;
}

// GET: List all releases
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabase = getSupabaseClient();

    let query = supabase
      .from('app_releases')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: releases, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get stats
    const stats = {
      total: releases?.length || 0,
      draft: releases?.filter((r: AppRelease) => r.status === 'draft').length || 0,
      polished: releases?.filter((r: AppRelease) => r.status === 'polished').length || 0,
      published: releases?.filter((r: AppRelease) => r.status === 'published').length || 0,
    };

    return NextResponse.json({
      success: true,
      releases: releases || [],
      stats,
    });
  } catch (error) {
    console.error('[Releases API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Actions on releases
export async function POST(request: NextRequest) {
  const auth = await verifyAdminWithRateLimit(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { action } = body;

    // POLISH: Trigger AI polishing for a release
    if (action === 'polish') {
      const { id } = body;

      if (!id) {
        return NextResponse.json({ error: 'Release ID is required' }, { status: 400 });
      }

      // Call the edge function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/polish-release-notes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ release_id: id }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return NextResponse.json({ error: result.error || 'Polishing failed' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Release notes polished',
        polished_notes: result.polished_notes,
      });
    }

    // UPDATE: Update polished notes manually
    if (action === 'update') {
      const { id, polished_notes } = body;

      if (!id) {
        return NextResponse.json({ error: 'Release ID is required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('app_releases')
        .update({
          polished_notes,
          status: 'polished',
          polished_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Release updated' });
    }

    // PUBLISH: Mark as published
    if (action === 'publish') {
      const { id } = body;

      if (!id) {
        return NextResponse.json({ error: 'Release ID is required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('app_releases')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Release marked as published' });
    }

    // DELETE: Delete a release
    if (action === 'delete') {
      const { id } = body;

      if (!id) {
        return NextResponse.json({ error: 'Release ID is required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('app_releases')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Release deleted' });
    }

    // CREATE: Manual release creation
    if (action === 'create') {
      const { version, raw_notes, platform } = body;

      if (!version || !raw_notes) {
        return NextResponse.json({ error: 'Version and raw_notes are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('app_releases')
        .insert({
          version,
          raw_notes,
          platform: platform || 'both',
          status: 'draft',
          created_by: 'admin',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, release: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Releases API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
