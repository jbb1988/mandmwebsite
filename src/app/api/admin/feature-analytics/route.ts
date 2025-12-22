import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Feature categories for grouping
const FEATURE_CATEGORIES: Record<string, string> = {
  swing_lab: 'Labs',
  pitch_lab: 'Labs',
  speed_lab: 'Labs',
  plate_iq: 'Labs',
  ai_coach: 'Training',
  arm_care: 'Training',
  mind_training: 'Training',
  muscle_training: 'Training',
  daily_hit: 'Daily',
  media_hub: 'Daily',
  chatter: 'Social',
  teams: 'Social',
  events: 'Social',
  journal: 'Social',
  gameflow: 'Gamification',
  achievements: 'Gamification',
  goals: 'Progress',
  reports: 'Progress',
  coach_dashboard: 'Coaching',
  parent_dashboard: 'Coaching',
  breathing: 'Mind',
  visualization: 'Mind',
  focus_zone: 'Mind',
  identity_blueprint: 'Mind',
  mental_warmup: 'Mind',
  fuel_hub: 'Muscle',
  workout_log: 'Muscle',
  shopping_list: 'Muscle',
  long_toss: 'Arm Care',
  drill_library: 'Training',
  practice_plans: 'Coaching',
  team_albums: 'Social',
  team_polls: 'Social',
  uniforms: 'Events',
  sound_lab: 'Media',
  favorites: 'Content',
  profile: 'Account',
  settings: 'Account',
};

interface FeatureStats {
  feature_name: string;
  category: string;
  opens_7d: number;
  users_7d: number;
  completions_7d: number;
  completion_rate: number;
  trend_pct: number | null;
}

interface SegmentCounts {
  power_users: number;
  growing: number;
  at_risk: number;
  dormant: number;
}

interface HealthDistribution {
  low: number;
  medium: number;
  at_risk: number;
  high_risk: number;
  unknown: number;
}

// GET: Fetch feature analytics data
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const category = searchParams.get('category') || 'all';

    // 1. Get overview stats
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Total active users in time period
    const { count: activeUsersCount } = await supabase
      .from('feature_usage_events')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get unique active users
    const { data: activeUsersData } = await supabase
      .from('feature_usage_events')
      .select('user_id')
      .gte('created_at', startDate.toISOString());

    const uniqueActiveUsers = new Set(activeUsersData?.map(u => u.user_id)).size;

    // 2. Get feature daily stats for the period
    const { data: dailyStats, error: dailyStatsError } = await supabase
      .from('feature_daily_stats')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (dailyStatsError) {
      console.error('Error fetching daily stats:', dailyStatsError);
    }

    // 3. Aggregate feature stats
    const featureStatsMap = new Map<string, {
      opens: number;
      users: Set<string>;
      completions: number;
      opens_prev: number;
    }>();

    // Initialize all known features
    Object.keys(FEATURE_CATEGORIES).forEach(feature => {
      featureStatsMap.set(feature, {
        opens: 0,
        users: new Set(),
        completions: 0,
        opens_prev: 0,
      });
    });

    // Get raw events for detailed aggregation
    const midDate = new Date(now);
    midDate.setDate(midDate.getDate() - days);
    const prevStartDate = new Date(midDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    // Current period events
    const { data: currentEvents } = await supabase
      .from('feature_usage_events')
      .select('feature_name, user_id, action')
      .gte('created_at', startDate.toISOString());

    // Previous period events (for trend)
    const { data: prevEvents } = await supabase
      .from('feature_usage_events')
      .select('feature_name, action')
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // Process current events
    currentEvents?.forEach(event => {
      const stats = featureStatsMap.get(event.feature_name);
      if (stats) {
        if (event.action === 'opened') {
          stats.opens++;
          stats.users.add(event.user_id);
        } else if (event.action === 'completed') {
          stats.completions++;
        }
      }
    });

    // Process previous events for trend
    prevEvents?.forEach(event => {
      const stats = featureStatsMap.get(event.feature_name);
      if (stats && event.action === 'opened') {
        stats.opens_prev++;
      }
    });

    // Build feature stats array
    let featureStats: FeatureStats[] = Array.from(featureStatsMap.entries()).map(([feature, stats]) => {
      const trendPct = stats.opens_prev > 0
        ? Math.round(((stats.opens - stats.opens_prev) / stats.opens_prev) * 100)
        : null;

      return {
        feature_name: feature,
        category: FEATURE_CATEGORIES[feature] || 'Other',
        opens_7d: stats.opens,
        users_7d: stats.users.size,
        completions_7d: stats.completions,
        completion_rate: stats.opens > 0 ? Math.round((stats.completions / stats.opens) * 100) : 0,
        trend_pct: trendPct,
      };
    });

    // Filter by category if specified
    if (category !== 'all') {
      featureStats = featureStats.filter(f => f.category === category);
    }

    // Sort by opens descending
    featureStats.sort((a, b) => b.opens_7d - a.opens_7d);

    // 4. Get user segments
    const { data: userEngagement } = await supabase
      .from('user_feature_engagement')
      .select('user_id, feature_name, total_opens, last_used_at');

    // Count features per user
    const userFeatureCounts = new Map<string, { count: number; lastUsed: Date | null }>();
    userEngagement?.forEach(ue => {
      if (ue.total_opens > 0) {
        const existing = userFeatureCounts.get(ue.user_id);
        const lastUsed = ue.last_used_at ? new Date(ue.last_used_at) : null;
        if (existing) {
          existing.count++;
          if (lastUsed && (!existing.lastUsed || lastUsed > existing.lastUsed)) {
            existing.lastUsed = lastUsed;
          }
        } else {
          userFeatureCounts.set(ue.user_id, { count: 1, lastUsed });
        }
      }
    });

    // Get total user count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    // Calculate segments
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let powerUsers = 0;
    let growing = 0;
    let atRisk = 0;
    const usersWithActivity = new Set<string>();

    userFeatureCounts.forEach((data, userId) => {
      usersWithActivity.add(userId);
      if (data.count >= 10) {
        powerUsers++;
      } else if (data.count >= 3) {
        growing++;
      } else {
        atRisk++;
      }
    });

    const dormant = (totalUsers || 0) - usersWithActivity.size;

    const segments: SegmentCounts = {
      power_users: powerUsers,
      growing: growing,
      at_risk: atRisk,
      dormant: dormant,
    };

    // 5. Get health score distribution
    const { data: healthScores } = await supabase
      .from('user_health_scores')
      .select('risk_level');

    const healthDistribution: HealthDistribution = {
      low: 0,
      medium: 0,
      at_risk: 0,
      high_risk: 0,
      unknown: 0,
    };

    healthScores?.forEach(hs => {
      const level = hs.risk_level as keyof HealthDistribution;
      if (level in healthDistribution) {
        healthDistribution[level]++;
      }
    });

    // Users without health scores are unknown
    healthDistribution.unknown = (totalUsers || 0) - (healthScores?.length || 0);

    // 6. Calculate overview stats
    const avgFeaturesPerUser = usersWithActivity.size > 0
      ? Math.round(Array.from(userFeatureCounts.values()).reduce((sum, d) => sum + d.count, 0) / usersWithActivity.size * 10) / 10
      : 0;

    const mostUsedFeature = featureStats.length > 0 ? featureStats[0].feature_name : null;

    // Find most underutilized (lowest usage among non-zero)
    const usedFeatures = featureStats.filter(f => f.opens_7d > 0);
    const mostUnderutilized = usedFeatures.length > 0
      ? usedFeatures[usedFeatures.length - 1].feature_name
      : featureStats.length > 0 ? featureStats[featureStats.length - 1].feature_name : null;

    // Get unique categories
    const categories = [...new Set(Object.values(FEATURE_CATEGORIES))].sort();

    return NextResponse.json({
      success: true,
      overview: {
        activeUsers: uniqueActiveUsers,
        totalUsers: totalUsers || 0,
        avgFeaturesPerUser,
        mostUsedFeature,
        mostUnderutilized,
        timeRange: `${days}d`,
      },
      features: featureStats,
      segments,
      healthDistribution,
      categories,
    });
  } catch (error) {
    console.error('Error fetching feature analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Trigger recalculation or aggregate stats
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, date } = await request.json();

    if (action === 'aggregate-daily') {
      // Aggregate stats for a specific date (or yesterday)
      const targetDate = date || new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const { error } = await supabase.rpc('aggregate_feature_daily_stats', {
        p_date: targetDate,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Aggregated stats for ${targetDate}` });
    }

    if (action === 'recalculate-health-scores') {
      // Recalculate all user health scores
      const { data, error } = await supabase.rpc('recalculate_all_health_scores');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Recalculated ${data} health scores` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in feature analytics action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
