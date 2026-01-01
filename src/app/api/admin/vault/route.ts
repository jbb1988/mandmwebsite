import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all drills for moderation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, pending, published, private
    const instructor = searchParams.get('instructor') || '';
    const category = searchParams.get('category') || '';
    const ageRange = searchParams.get('ageRange') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('drills')
      .select(`
        *,
        owner:profiles!drills_owner_id_fkey(id, name, email, avatar_url)
      `, { count: 'exact' });

    // Apply status filter
    switch (filter) {
      case 'pending':
        query = query.eq('publish_requested', true).eq('is_published', false);
        break;
      case 'published':
        query = query.eq('is_published', true);
        break;
      case 'private':
        query = query.eq('is_private', true).eq('is_published', false);
        break;
      // 'all' doesn't need additional filter
    }

    // Apply additional filters
    if (instructor) {
      query = query.eq('owner_name', instructor);
    }
    if (category) {
      query = query.eq('skill_category', category);
    }
    if (ageRange) {
      query = query.eq('age_range', ageRange);
    }

    const { data: drills, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching drills:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get stats and filter options
    const { data: allDrills } = await supabase
      .from('drills')
      .select('is_published, publish_requested, is_private, owner_name, skill_category, age_range');

    const stats = {
      total: allDrills?.length || 0,
      published: allDrills?.filter(d => d.is_published).length || 0,
      pending: allDrills?.filter(d => d.publish_requested && !d.is_published).length || 0,
      private: allDrills?.filter(d => d.is_private && !d.is_published).length || 0,
    };

    // Get unique filter options
    const filterOptions = {
      instructors: [...new Set(allDrills?.map(d => d.owner_name).filter(Boolean))].sort(),
      categories: [...new Set(allDrills?.map(d => d.skill_category).filter(Boolean))].sort(),
      ageRanges: [...new Set(allDrills?.map(d => d.age_range).filter(Boolean))].sort(),
    };

    return NextResponse.json({
      drills,
      stats,
      filterOptions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in vault GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Perform moderation actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, drillId, drillIds } = body;

    // Support both single drill and bulk operations
    const targetIds = drillIds || (drillId ? [drillId] : []);

    if (!action || targetIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing action or drillId(s)' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'approve': {
        // Approve and publish drill(s)
        const { data, error } = await supabase
          .from('drills')
          .update({
            is_published: true,
            publish_requested: false,
            published_at: new Date().toISOString(),
          })
          .in('id', targetIds)
          .select();

        if (error) throw error;
        result = { success: true, approved: data?.length || 0 };
        break;
      }

      case 'reject': {
        // Reject publish request (keeps drill private)
        const { data, error } = await supabase
          .from('drills')
          .update({ publish_requested: false })
          .in('id', targetIds)
          .select();

        if (error) throw error;
        result = { success: true, rejected: data?.length || 0 };
        break;
      }

      case 'unpublish': {
        // Unpublish drill(s)
        const { data, error } = await supabase
          .from('drills')
          .update({
            is_published: false,
            is_private: true,
          })
          .in('id', targetIds)
          .select();

        if (error) throw error;
        result = { success: true, unpublished: data?.length || 0 };
        break;
      }

      case 'delete': {
        // First get the drills to find their video/thumbnail URLs
        const { data: drillsToDelete } = await supabase
          .from('drills')
          .select('id, video_url, thumbnail_url')
          .in('id', targetIds);

        // Delete from database
        const { error } = await supabase
          .from('drills')
          .delete()
          .in('id', targetIds);

        if (error) throw error;

        // Attempt to delete storage files (non-blocking)
        if (drillsToDelete) {
          for (const drill of drillsToDelete) {
            try {
              // Extract path from URL and delete
              if (drill.video_url) {
                const videoPath = extractStoragePath(drill.video_url, 'drill-videos');
                if (videoPath) {
                  await supabase.storage.from('drill-videos').remove([videoPath]);
                }
              }
              if (drill.thumbnail_url) {
                const thumbPath = extractStoragePath(drill.thumbnail_url, 'drill-thumbnails');
                if (thumbPath) {
                  await supabase.storage.from('drill-thumbnails').remove([thumbPath]);
                }
              }
            } catch (storageError) {
              console.error('Error deleting storage files:', storageError);
              // Continue even if storage deletion fails
            }
          }
        }

        result = { success: true, deleted: targetIds.length };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in vault POST:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to extract storage path from URL
function extractStoragePath(url: string, bucketName: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf(bucketName);
    if (bucketIndex === -1) return null;
    return pathParts.slice(bucketIndex + 1).join('/');
  } catch {
    return null;
  }
}
