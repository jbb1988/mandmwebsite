import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UserFeatureProfile {
  user_id: string;
  email: string;
  name: string | null;
  tier: string;
  features_used: number;
  health_score: number;
  risk_level: string;
  last_activity: string | null;
  segment: string;
  feature_breakdown: {
    feature_name: string;
    total_opens: number;
    total_completions: number;
    last_used_at: string | null;
  }[];
}

interface FeatureUserDetail {
  user_id: string;
  email: string;
  name: string | null;
  tier: string;
  total_opens: number;
  total_completions: number;
  first_used_at: string | null;
  last_used_at: string | null;
  health_score: number;
}

// GET: Drill-down into users by feature or get user profile
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const featureName = searchParams.get('feature');
    const userId = searchParams.get('userId');
    const segment = searchParams.get('segment');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // If userId is provided, get that user's complete feature profile
    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name, tier')
        .eq('id', userId)
        .single();

      if (profileError) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Get all feature engagement for this user
      const { data: engagement } = await supabase
        .from('user_feature_engagement')
        .select('feature_name, total_opens, total_completions, first_used_at, last_used_at')
        .eq('user_id', userId)
        .order('total_opens', { ascending: false });

      // Get health score
      const { data: healthScore } = await supabase
        .from('user_health_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Calculate segment
      const featuresUsed = engagement?.filter(e => e.total_opens > 0).length || 0;
      let userSegment = 'dormant';
      if (featuresUsed >= 10) userSegment = 'power_user';
      else if (featuresUsed >= 3) userSegment = 'growing';
      else if (featuresUsed >= 1) userSegment = 'at_risk';

      const userProfile: UserFeatureProfile = {
        user_id: profile.id,
        email: profile.email,
        name: profile.name,
        tier: profile.tier,
        features_used: featuresUsed,
        health_score: healthScore?.health_score || 0,
        risk_level: healthScore?.risk_level || 'unknown',
        last_activity: engagement?.find(e => e.last_used_at)?.last_used_at || null,
        segment: userSegment,
        feature_breakdown: engagement || [],
      };

      return NextResponse.json({
        success: true,
        user: userProfile,
        healthDetails: healthScore || null,
      });
    }

    // If featureName is provided, get users who use/don't use that feature
    if (featureName) {
      const showNonUsers = searchParams.get('showNonUsers') === 'true';

      if (showNonUsers) {
        // Get users who DON'T use this feature
        const { data: usersWithFeature } = await supabase
          .from('user_feature_engagement')
          .select('user_id')
          .eq('feature_name', featureName)
          .gt('total_opens', 0);

        const userIdsWithFeature = new Set(usersWithFeature?.map(u => u.user_id) || []);

        // Get all users
        let query = supabase
          .from('profiles')
          .select('id, email, name, tier', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (search) {
          query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
        }

        const { data: allUsers, count } = await query.range(offset, offset + limit - 1);

        // Filter out users who have the feature
        const nonUsers = (allUsers || [])
          .filter(u => !userIdsWithFeature.has(u.id))
          .map(u => ({
            user_id: u.id,
            email: u.email,
            name: u.name,
            tier: u.tier,
            total_opens: 0,
            total_completions: 0,
            first_used_at: null,
            last_used_at: null,
            health_score: 0,
          }));

        return NextResponse.json({
          success: true,
          feature: featureName,
          showNonUsers: true,
          users: nonUsers,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        });
      }

      // Get users who DO use this feature
      let query = supabase
        .from('user_feature_engagement')
        .select(`
          user_id,
          total_opens,
          total_completions,
          first_used_at,
          last_used_at
        `, { count: 'exact' })
        .eq('feature_name', featureName)
        .gt('total_opens', 0)
        .order('total_opens', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: featureUsers, count, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get profile info and health scores for these users
      const userIds = featureUsers?.map(u => u.user_id) || [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, name, tier')
        .in('id', userIds);

      const { data: healthScores } = await supabase
        .from('user_health_scores')
        .select('user_id, health_score')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const healthMap = new Map(healthScores?.map(h => [h.user_id, h.health_score]) || []);

      const users: FeatureUserDetail[] = (featureUsers || []).map(fu => {
        const profile = profileMap.get(fu.user_id);
        return {
          user_id: fu.user_id,
          email: profile?.email || 'Unknown',
          name: profile?.name || null,
          tier: profile?.tier || 'core',
          total_opens: fu.total_opens,
          total_completions: fu.total_completions,
          first_used_at: fu.first_used_at,
          last_used_at: fu.last_used_at,
          health_score: healthMap.get(fu.user_id) || 0,
        };
      });

      // Apply search filter if provided
      let filteredUsers = users;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = users.filter(u =>
          u.email.toLowerCase().includes(searchLower) ||
          (u.name && u.name.toLowerCase().includes(searchLower))
        );
      }

      return NextResponse.json({
        success: true,
        feature: featureName,
        showNonUsers: false,
        users: filteredUsers,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // If segment is provided, get users in that segment
    if (segment) {
      // Get all user feature counts
      const { data: engagement } = await supabase
        .from('user_feature_engagement')
        .select('user_id, feature_name, total_opens, last_used_at')
        .gt('total_opens', 0);

      // Count features per user
      const userFeatureCounts = new Map<string, { count: number; lastUsed: string | null }>();
      engagement?.forEach(e => {
        const existing = userFeatureCounts.get(e.user_id);
        if (existing) {
          existing.count++;
          if (e.last_used_at && (!existing.lastUsed || e.last_used_at > existing.lastUsed)) {
            existing.lastUsed = e.last_used_at;
          }
        } else {
          userFeatureCounts.set(e.user_id, { count: 1, lastUsed: e.last_used_at });
        }
      });

      // Filter by segment
      const segmentUserIds: string[] = [];
      userFeatureCounts.forEach((data, userId) => {
        let userSegment = 'dormant';
        if (data.count >= 10) userSegment = 'power_user';
        else if (data.count >= 3) userSegment = 'growing';
        else if (data.count >= 1) userSegment = 'at_risk';

        if (userSegment === segment) {
          segmentUserIds.push(userId);
        }
      });

      // For dormant, get users not in engagement table
      if (segment === 'dormant') {
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id');

        const usersWithActivity = new Set(userFeatureCounts.keys());
        allUsers?.forEach(u => {
          if (!usersWithActivity.has(u.id)) {
            segmentUserIds.push(u.id);
          }
        });
      }

      // Get profiles for segment users
      let query = supabase
        .from('profiles')
        .select('id, email, name, tier', { count: 'exact' })
        .in('id', segmentUserIds.slice(offset, offset + limit));

      if (search) {
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data: profiles, count } = await query;

      // Get health scores
      const { data: healthScores } = await supabase
        .from('user_health_scores')
        .select('user_id, health_score, risk_level')
        .in('user_id', profiles?.map(p => p.id) || []);

      const healthMap = new Map(healthScores?.map(h => [h.user_id, h]) || []);

      const users = (profiles || []).map(p => {
        const featureData = userFeatureCounts.get(p.id);
        const health = healthMap.get(p.id);
        return {
          user_id: p.id,
          email: p.email,
          name: p.name,
          tier: p.tier,
          features_used: featureData?.count || 0,
          last_activity: featureData?.lastUsed || null,
          health_score: health?.health_score || 0,
          risk_level: health?.risk_level || 'unknown',
        };
      });

      return NextResponse.json({
        success: true,
        segment,
        users,
        pagination: {
          page,
          limit,
          total: segmentUserIds.length,
          totalPages: Math.ceil(segmentUserIds.length / limit),
        },
      });
    }

    // Default: return all users with their feature counts
    let query = supabase
      .from('profiles')
      .select('id, email, name, tier', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    const { data: profiles, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get feature counts and health scores
    const userIds = profiles?.map(p => p.id) || [];

    const { data: engagement } = await supabase
      .from('user_feature_engagement')
      .select('user_id, feature_name, total_opens, last_used_at')
      .in('user_id', userIds)
      .gt('total_opens', 0);

    const { data: healthScores } = await supabase
      .from('user_health_scores')
      .select('user_id, health_score, risk_level')
      .in('user_id', userIds);

    // Aggregate per user
    const userFeatureCounts = new Map<string, { count: number; lastUsed: string | null }>();
    engagement?.forEach(e => {
      const existing = userFeatureCounts.get(e.user_id);
      if (existing) {
        existing.count++;
        if (e.last_used_at && (!existing.lastUsed || e.last_used_at > existing.lastUsed)) {
          existing.lastUsed = e.last_used_at;
        }
      } else {
        userFeatureCounts.set(e.user_id, { count: 1, lastUsed: e.last_used_at });
      }
    });

    const healthMap = new Map(healthScores?.map(h => [h.user_id, h]) || []);

    const users = (profiles || []).map(p => {
      const featureData = userFeatureCounts.get(p.id);
      const health = healthMap.get(p.id);
      const featuresUsed = featureData?.count || 0;

      let userSegment = 'dormant';
      if (featuresUsed >= 10) userSegment = 'power_user';
      else if (featuresUsed >= 3) userSegment = 'growing';
      else if (featuresUsed >= 1) userSegment = 'at_risk';

      return {
        user_id: p.id,
        email: p.email,
        name: p.name,
        tier: p.tier,
        features_used: featuresUsed,
        last_activity: featureData?.lastUsed || null,
        health_score: health?.health_score || 0,
        risk_level: health?.risk_level || 'unknown',
        segment: userSegment,
      };
    });

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching feature analytics users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
