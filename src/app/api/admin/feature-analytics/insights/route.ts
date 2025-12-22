import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Pro-only features that trial/pro users should be using
const PRO_FEATURES = [
  'swing_lab', 'pitch_lab', 'plate_iq', 'speed_lab',
  'ai_coach', 'goals', 'reports', 'media_hub', 'sound_lab'
];

interface ConversionOpportunity {
  user_id: string;
  email: string;
  name: string | null;
  tier: string;
  features_used: number;
  total_opens: number;
  days_active: number;
  last_activity: string | null;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface ChurnRisk {
  user_id: string;
  email: string;
  name: string | null;
  tier: string;
  promo_tier_expires_at: string | null;
  days_until_expiry: number | null;
  days_inactive: number;
  pro_features_used: number;
  total_pro_features: number;
  health_score: number;
  risk_reason: string;
  risk_level: 'critical' | 'high' | 'medium';
}

interface FeatureHealth {
  feature_name: string;
  opens: number;
  completions: number;
  completion_rate: number;
  unique_users: number;
  issue: string | null;
}

// GET: Fetch actionable insights
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // ============================================
    // 1. CONVERSION OPPORTUNITIES
    // ============================================

    // Get all free users with their engagement
    const { data: freeUsers } = await supabase
      .from('profiles')
      .select('id, email, name, tier, created_at')
      .eq('tier', 'core');

    const freeUserIds = freeUsers?.map(u => u.id) || [];

    // Get engagement for free users
    const { data: freeUserEngagement } = await supabase
      .from('user_feature_engagement')
      .select('user_id, feature_name, total_opens, last_used_at')
      .in('user_id', freeUserIds)
      .gt('total_opens', 0);

    // Aggregate engagement per free user
    const freeUserStats = new Map<string, {
      features: Set<string>;
      totalOpens: number;
      lastActivity: string | null;
      activeDays: Set<string>;
    }>();

    freeUserEngagement?.forEach(e => {
      const stats = freeUserStats.get(e.user_id) || {
        features: new Set(),
        totalOpens: 0,
        lastActivity: null,
        activeDays: new Set(),
      };
      stats.features.add(e.feature_name);
      stats.totalOpens += e.total_opens;
      if (e.last_used_at) {
        if (!stats.lastActivity || e.last_used_at > stats.lastActivity) {
          stats.lastActivity = e.last_used_at;
        }
        stats.activeDays.add(e.last_used_at.split('T')[0]);
      }
      freeUserStats.set(e.user_id, stats);
    });

    // Identify conversion opportunities
    const conversionOpportunities: ConversionOpportunity[] = [];

    freeUsers?.forEach(user => {
      const stats = freeUserStats.get(user.id);
      if (!stats) return;

      let priority: 'high' | 'medium' | 'low' = 'low';
      let reason = '';

      // High priority: 5+ features used OR 20+ total opens OR 5+ active days
      if (stats.features.size >= 5) {
        priority = 'high';
        reason = `Power user: ${stats.features.size} features explored`;
      } else if (stats.totalOpens >= 20) {
        priority = 'high';
        reason = `Highly engaged: ${stats.totalOpens} total feature opens`;
      } else if (stats.activeDays.size >= 5) {
        priority = 'high';
        reason = `Consistent user: active ${stats.activeDays.size} days`;
      }
      // Medium priority: 3+ features OR 10+ opens OR recent activity
      else if (stats.features.size >= 3) {
        priority = 'medium';
        reason = `Growing engagement: ${stats.features.size} features used`;
      } else if (stats.totalOpens >= 10) {
        priority = 'medium';
        reason = `Regular user: ${stats.totalOpens} feature opens`;
      } else if (stats.lastActivity && new Date(stats.lastActivity) > sevenDaysAgo) {
        priority = 'medium';
        reason = 'Recently active free user';
      }

      // Only include medium and high priority
      if (priority !== 'low') {
        conversionOpportunities.push({
          user_id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          features_used: stats.features.size,
          total_opens: stats.totalOpens,
          days_active: stats.activeDays.size,
          last_activity: stats.lastActivity,
          reason,
          priority,
        });
      }
    });

    // Sort by priority then by engagement
    conversionOpportunities.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.total_opens - a.total_opens;
    });

    // ============================================
    // 2. CHURN RISK ALERTS
    // ============================================

    // Get trial users (pro with promo_tier_expires_at)
    const { data: trialUsers } = await supabase
      .from('profiles')
      .select('id, email, name, tier, promo_tier_expires_at, created_at')
      .eq('tier', 'pro')
      .not('promo_tier_expires_at', 'is', null);

    // Get paid pro users (pro without expiration)
    const { data: paidProUsers } = await supabase
      .from('profiles')
      .select('id, email, name, tier, created_at')
      .eq('tier', 'pro')
      .is('promo_tier_expires_at', null);

    const allProUserIds = [
      ...(trialUsers?.map(u => u.id) || []),
      ...(paidProUsers?.map(u => u.id) || []),
    ];

    // Get engagement for pro users
    const { data: proUserEngagement } = await supabase
      .from('user_feature_engagement')
      .select('user_id, feature_name, total_opens, last_used_at')
      .in('user_id', allProUserIds);

    // Get health scores
    const { data: healthScores } = await supabase
      .from('user_health_scores')
      .select('user_id, health_score')
      .in('user_id', allProUserIds);

    const healthMap = new Map(healthScores?.map(h => [h.user_id, h.health_score]) || []);

    // Aggregate pro user stats
    const proUserStats = new Map<string, {
      proFeaturesUsed: Set<string>;
      lastActivity: string | null;
    }>();

    proUserEngagement?.forEach(e => {
      const stats = proUserStats.get(e.user_id) || {
        proFeaturesUsed: new Set(),
        lastActivity: null,
      };
      if (PRO_FEATURES.includes(e.feature_name) && e.total_opens > 0) {
        stats.proFeaturesUsed.add(e.feature_name);
      }
      if (e.last_used_at) {
        if (!stats.lastActivity || e.last_used_at > stats.lastActivity) {
          stats.lastActivity = e.last_used_at;
        }
      }
      proUserStats.set(e.user_id, stats);
    });

    const churnRisks: ChurnRisk[] = [];

    // Check trial users
    trialUsers?.forEach(user => {
      const stats = proUserStats.get(user.id);
      const expiresAt = user.promo_tier_expires_at ? new Date(user.promo_tier_expires_at) : null;
      const daysUntilExpiry = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
      const lastActivity = stats?.lastActivity ? new Date(stats.lastActivity) : null;
      const daysInactive = lastActivity ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      const proFeaturesUsed = stats?.proFeaturesUsed.size || 0;
      const healthScore = healthMap.get(user.id) || 0;

      let riskLevel: 'critical' | 'high' | 'medium' | null = null;
      let riskReason = '';

      // Critical: Trial expiring in 3 days AND low Pro feature usage
      if (daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry > 0 && proFeaturesUsed < 3) {
        riskLevel = 'critical';
        riskReason = `Trial expires in ${daysUntilExpiry} day(s), only used ${proFeaturesUsed} Pro features`;
      }
      // High: Trial expiring in 7 days with low usage OR inactive for 7+ days
      else if (daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && proFeaturesUsed < 2) {
        riskLevel = 'high';
        riskReason = `Trial expires in ${daysUntilExpiry} day(s), hasn't explored Pro features`;
      } else if (daysInactive >= 7 && daysUntilExpiry !== null && daysUntilExpiry > 0) {
        riskLevel = 'high';
        riskReason = `Inactive for ${daysInactive} days during trial period`;
      }
      // Medium: Trial user with low engagement
      else if (proFeaturesUsed === 0 && daysUntilExpiry !== null && daysUntilExpiry > 0) {
        riskLevel = 'medium';
        riskReason = 'Trial user hasn\'t used any Pro features yet';
      }

      if (riskLevel) {
        churnRisks.push({
          user_id: user.id,
          email: user.email,
          name: user.name,
          tier: 'trial',
          promo_tier_expires_at: user.promo_tier_expires_at,
          days_until_expiry: daysUntilExpiry,
          days_inactive: daysInactive,
          pro_features_used: proFeaturesUsed,
          total_pro_features: PRO_FEATURES.length,
          health_score: healthScore,
          risk_reason: riskReason,
          risk_level: riskLevel,
        });
      }
    });

    // Check paid pro users for churn risk
    paidProUsers?.forEach(user => {
      const stats = proUserStats.get(user.id);
      const lastActivity = stats?.lastActivity ? new Date(stats.lastActivity) : null;
      const daysInactive = lastActivity ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      const proFeaturesUsed = stats?.proFeaturesUsed.size || 0;
      const healthScore = healthMap.get(user.id) || 0;

      let riskLevel: 'critical' | 'high' | 'medium' | null = null;
      let riskReason = '';

      // High: Paid user inactive for 14+ days
      if (daysInactive >= 14) {
        riskLevel = 'high';
        riskReason = `Paid Pro user inactive for ${daysInactive} days`;
      }
      // Medium: Paid user not using Pro features
      else if (proFeaturesUsed === 0) {
        riskLevel = 'medium';
        riskReason = 'Paid Pro user not utilizing Pro features';
      }

      if (riskLevel) {
        churnRisks.push({
          user_id: user.id,
          email: user.email,
          name: user.name,
          tier: 'paid_pro',
          promo_tier_expires_at: null,
          days_until_expiry: null,
          days_inactive: daysInactive,
          pro_features_used: proFeaturesUsed,
          total_pro_features: PRO_FEATURES.length,
          health_score: healthScore,
          risk_reason: riskReason,
          risk_level: riskLevel,
        });
      }
    });

    // Sort by risk level
    churnRisks.sort((a, b) => {
      const riskOrder = { critical: 0, high: 1, medium: 2 };
      return riskOrder[a.risk_level] - riskOrder[b.risk_level];
    });

    // ============================================
    // 3. FEATURE HEALTH (High open, low completion)
    // ============================================

    const { data: featureEvents } = await supabase
      .from('feature_usage_events')
      .select('feature_name, action, user_id')
      .gte('created_at', fourteenDaysAgo.toISOString());

    const featureHealthMap = new Map<string, {
      opens: number;
      completions: number;
      users: Set<string>;
    }>();

    featureEvents?.forEach(e => {
      const stats = featureHealthMap.get(e.feature_name) || {
        opens: 0,
        completions: 0,
        users: new Set(),
      };
      if (e.action === 'opened') {
        stats.opens++;
        stats.users.add(e.user_id);
      } else if (e.action === 'completed') {
        stats.completions++;
      }
      featureHealthMap.set(e.feature_name, stats);
    });

    const featureHealth: FeatureHealth[] = Array.from(featureHealthMap.entries())
      .map(([name, stats]) => {
        const completionRate = stats.opens > 0 ? Math.round((stats.completions / stats.opens) * 100) : 0;
        let issue: string | null = null;

        // Flag features with high opens but low completion
        if (stats.opens >= 10 && completionRate < 20) {
          issue = 'Low completion rate - possible UX issue';
        } else if (stats.opens >= 5 && completionRate === 0) {
          issue = 'No completions - users may be confused';
        }

        return {
          feature_name: name,
          opens: stats.opens,
          completions: stats.completions,
          completion_rate: completionRate,
          unique_users: stats.users.size,
          issue,
        };
      })
      .filter(f => f.issue !== null)
      .sort((a, b) => b.opens - a.opens);

    return NextResponse.json({
      success: true,
      insights: {
        conversion_opportunities: {
          total: conversionOpportunities.length,
          high_priority: conversionOpportunities.filter(c => c.priority === 'high').length,
          users: conversionOpportunities.slice(0, 20), // Top 20
        },
        churn_risks: {
          total: churnRisks.length,
          critical: churnRisks.filter(c => c.risk_level === 'critical').length,
          high: churnRisks.filter(c => c.risk_level === 'high').length,
          users: churnRisks.slice(0, 20), // Top 20
        },
        feature_health: {
          issues_count: featureHealth.length,
          features: featureHealth,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Take action on insights
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, user_ids, days } = await request.json();

    if (action === 'grant-trial-extension') {
      // Extend trial for specified users
      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return NextResponse.json({ error: 'user_ids array required' }, { status: 400 });
      }

      const extensionDays = days || 7;
      const results = [];

      for (const userId of user_ids) {
        // Get current expiration
        const { data: user } = await supabase
          .from('profiles')
          .select('email, promo_tier_expires_at')
          .eq('id', userId)
          .single();

        if (!user) continue;

        let newExpiration: Date;
        if (user.promo_tier_expires_at && new Date(user.promo_tier_expires_at) > new Date()) {
          newExpiration = new Date(user.promo_tier_expires_at);
        } else {
          newExpiration = new Date();
        }
        newExpiration.setDate(newExpiration.getDate() + extensionDays);

        const { error } = await supabase
          .from('profiles')
          .update({
            tier: 'pro',
            promo_tier_expires_at: newExpiration.toISOString(),
          })
          .eq('id', userId);

        results.push({
          user_id: userId,
          email: user.email,
          success: !error,
          new_expiration: newExpiration.toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        message: `Extended trial for ${results.filter(r => r.success).length} users by ${extensionDays} days`,
        results,
      });
    }

    if (action === 'export-csv') {
      // Export user list as CSV
      const { data: users } = await supabase
        .from('profiles')
        .select('email, name, tier')
        .in('id', user_ids || []);

      const csv = [
        'email,name,tier',
        ...(users || []).map(u => `${u.email},${u.name || ''},${u.tier}`),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="users.csv"',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing insight action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
