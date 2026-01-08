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

const GITHUB_REPO = 'jbb1988/mind-muscle';

// Fetch commits from GitHub API
async function fetchGitHubCommits(since?: string): Promise<{ commits: string[], count: number, latestSha: string }> {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'MindMuscle-Admin',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Build URL with optional since parameter
  let url = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=100`;
  if (since) {
    url += `&since=${since}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GitHub API error:', response.status, errorText);
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();

  // Extract commit messages, skip merge commits
  const commits = data
    .filter((c: any) => !c.commit.message.startsWith('Merge'))
    .map((c: any) => `- ${c.commit.message.split('\n')[0]}`)
    .slice(0, 50); // Limit to 50 commits

  return {
    commits,
    count: commits.length,
    latestSha: data[0]?.sha || '',
  };
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

    // FETCH-COMMITS: Get commits from GitHub since last release
    if (action === 'fetch-commits') {
      // Get the last published release to find the cutoff
      const { data: lastRelease } = await supabase
        .from('app_releases')
        .select('published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      const sinceDate = lastRelease?.published_at || lastRelease?.created_at;

      try {
        const { commits, count, latestSha } = await fetchGitHubCommits(sinceDate);

        return NextResponse.json({
          success: true,
          commits: commits.join('\n'),
          count,
          latestSha,
          since: sinceDate,
        });
      } catch (error) {
        console.error('Failed to fetch commits:', error);
        return NextResponse.json({
          error: 'Failed to fetch commits from GitHub. Make sure GITHUB_TOKEN is set.',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // CREATE: Auto-fetch from GitHub and create release
    if (action === 'create') {
      const { version } = body;

      if (!version) {
        return NextResponse.json({ error: 'Version is required' }, { status: 400 });
      }

      // Get the last published release to find the cutoff
      const { data: lastRelease } = await supabase
        .from('app_releases')
        .select('published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      const sinceDate = lastRelease?.published_at || lastRelease?.created_at;

      let raw_notes: string;
      let commit_count: number;
      let commit_sha: string;

      try {
        const { commits, count, latestSha } = await fetchGitHubCommits(sinceDate);
        raw_notes = commits.join('\n') || 'No new commits found';
        commit_count = count;
        commit_sha = latestSha;
      } catch (error) {
        console.error('GitHub fetch failed, using placeholder:', error);
        raw_notes = 'Failed to fetch commits from GitHub';
        commit_count = 0;
        commit_sha = '';
      }

      const { data, error } = await supabase
        .from('app_releases')
        .insert({
          version: version.replace(/^v/, ''),
          raw_notes,
          commit_count,
          commit_sha,
          platform: 'both',
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Releases API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
