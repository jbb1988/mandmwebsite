import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface LabUser {
  user_id: string;
  email: string;
  name: string | null;
  app_version: string | null;
  tier: string;
  swing_lab_count: number;
  pitch_lab_count: number;
  last_swing_analysis: string | null;
  last_pitch_analysis: string | null;
  total_analyses: number;
}

export interface LabActivityStats {
  total_swing_analyses: number;
  total_pitch_analyses: number;
  unique_swing_users: number;
  unique_pitch_users: number;
  analyses_today: number;
  analyses_this_week: number;
}

// GET: Fetch lab activity data
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const labType = searchParams.get('lab') || 'all'; // 'all', 'swing', 'pitch'
    const sortBy = searchParams.get('sort') || 'last_activity'; // 'last_activity', 'total', 'swing', 'pitch'

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get Swing Lab analyses with user info
    const { data: swingData, error: swingError } = await supabase
      .from('swing_lab_analyses')
      .select(`
        user_id,
        created_at
      `)
      .gte('created_at', startDate.toISOString());

    if (swingError) {
      console.error('Error fetching swing analyses:', swingError);
    }

    // Get Pitch Lab analyses with user info
    const { data: pitchData, error: pitchError } = await supabase
      .from('pitch_lab_analyses')
      .select(`
        user_id,
        created_at
      `)
      .gte('created_at', startDate.toISOString());

    if (pitchError) {
      console.error('Error fetching pitch analyses:', pitchError);
    }

    // Aggregate by user
    const userMap = new Map<string, {
      swing_count: number;
      pitch_count: number;
      last_swing: Date | null;
      last_pitch: Date | null;
    }>();

    // Process swing analyses
    swingData?.forEach(analysis => {
      const existing = userMap.get(analysis.user_id) || {
        swing_count: 0,
        pitch_count: 0,
        last_swing: null,
        last_pitch: null,
      };
      existing.swing_count++;
      const analysisDate = new Date(analysis.created_at);
      if (!existing.last_swing || analysisDate > existing.last_swing) {
        existing.last_swing = analysisDate;
      }
      userMap.set(analysis.user_id, existing);
    });

    // Process pitch analyses
    pitchData?.forEach(analysis => {
      const existing = userMap.get(analysis.user_id) || {
        swing_count: 0,
        pitch_count: 0,
        last_swing: null,
        last_pitch: null,
      };
      existing.pitch_count++;
      const analysisDate = new Date(analysis.created_at);
      if (!existing.last_pitch || analysisDate > existing.last_pitch) {
        existing.last_pitch = analysisDate;
      }
      userMap.set(analysis.user_id, existing);
    });

    // Get user details for all users with lab activity
    const userIds = Array.from(userMap.keys());

    let users: LabUser[] = [];

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, name, first_name, last_name, app_version, tier')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Build user list
      users = (profiles || []).map(profile => {
        const labData = userMap.get(profile.id)!;
        const displayName = profile.name ||
          (profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile.first_name || profile.last_name || null);

        return {
          user_id: profile.id,
          email: profile.email,
          name: displayName,
          app_version: profile.app_version,
          tier: profile.tier || 'free',
          swing_lab_count: labData.swing_count,
          pitch_lab_count: labData.pitch_count,
          last_swing_analysis: labData.last_swing?.toISOString() || null,
          last_pitch_analysis: labData.last_pitch?.toISOString() || null,
          total_analyses: labData.swing_count + labData.pitch_count,
        };
      });

      // Filter by lab type
      if (labType === 'swing') {
        users = users.filter(u => u.swing_lab_count > 0);
      } else if (labType === 'pitch') {
        users = users.filter(u => u.pitch_lab_count > 0);
      }

      // Sort
      users.sort((a, b) => {
        switch (sortBy) {
          case 'total':
            return b.total_analyses - a.total_analyses;
          case 'swing':
            return b.swing_lab_count - a.swing_lab_count;
          case 'pitch':
            return b.pitch_lab_count - a.pitch_lab_count;
          case 'last_activity':
          default:
            const aLast = Math.max(
              a.last_swing_analysis ? new Date(a.last_swing_analysis).getTime() : 0,
              a.last_pitch_analysis ? new Date(a.last_pitch_analysis).getTime() : 0
            );
            const bLast = Math.max(
              b.last_swing_analysis ? new Date(b.last_swing_analysis).getTime() : 0,
              b.last_pitch_analysis ? new Date(b.last_pitch_analysis).getTime() : 0
            );
            return bLast - aLast;
        }
      });
    }

    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const analysesToday = (swingData?.filter(a => new Date(a.created_at) >= today).length || 0) +
                          (pitchData?.filter(a => new Date(a.created_at) >= today).length || 0);

    const analysesThisWeek = (swingData?.filter(a => new Date(a.created_at) >= weekAgo).length || 0) +
                             (pitchData?.filter(a => new Date(a.created_at) >= weekAgo).length || 0);

    const stats: LabActivityStats = {
      total_swing_analyses: swingData?.length || 0,
      total_pitch_analyses: pitchData?.length || 0,
      unique_swing_users: new Set(swingData?.map(a => a.user_id)).size,
      unique_pitch_users: new Set(pitchData?.map(a => a.user_id)).size,
      analyses_today: analysesToday,
      analyses_this_week: analysesThisWeek,
    };

    return NextResponse.json({
      success: true,
      stats,
      users,
      timeRange: `${days}d`,
    });
  } catch (error) {
    console.error('Error fetching lab activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
