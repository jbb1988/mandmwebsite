import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

// Subscription price for LTV calculations
const MONTHLY_VALUE = 29.99 / 6; // 6-month subscription

export async function GET(request: NextRequest) {
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // ===== COHORT ANALYSIS =====
    // Get users grouped by signup week for the last 12 weeks
    const twelveWeeksAgo = new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000);

    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, created_at, tier, promo_tier_expires_at, last_login_at')
      .gte('created_at', twelveWeeksAgo.toISOString())
      .order('created_at', { ascending: true });

    if (usersError) throw usersError;

    // Get activity data for retention calculation from user_feature_engagement
    const { data: activities, error: actError } = await supabase
      .from('user_feature_engagement')
      .select('user_id, last_used_at')
      .gte('last_used_at', twelveWeeksAgo.toISOString());

    // Build cohort data (weekly cohorts)
    const cohorts: Record<string, {
      week: string;
      signups: number;
      d1: number;
      d7: number;
      d14: number;
      d30: number;
      converted: number;
    }> = {};

    const activityByUser: Record<string, Date[]> = {};
    (activities || []).forEach(a => {
      if (!activityByUser[a.user_id]) activityByUser[a.user_id] = [];
      if (a.last_used_at) {
        activityByUser[a.user_id].push(new Date(a.last_used_at));
      }
    });

    (users || []).forEach(user => {
      const signupDate = new Date(user.created_at);
      const weekStart = getWeekStart(signupDate);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!cohorts[weekKey]) {
        cohorts[weekKey] = {
          week: weekKey,
          signups: 0,
          d1: 0,
          d7: 0,
          d14: 0,
          d30: 0,
          converted: 0,
        };
      }

      cohorts[weekKey].signups++;

      // Check retention
      const userActivities = activityByUser[user.id] || [];
      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

      // D1 retention (returned within 24-48 hours)
      if (userActivities.some(a => {
        const hoursSinceSignup = (a.getTime() - signupDate.getTime()) / (1000 * 60 * 60);
        return hoursSinceSignup >= 24 && hoursSinceSignup <= 72;
      })) {
        cohorts[weekKey].d1++;
      }

      // D7 retention (active on day 6-8)
      if (daysSinceSignup >= 7 && userActivities.some(a => {
        const days = Math.floor((a.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
        return days >= 6 && days <= 8;
      })) {
        cohorts[weekKey].d7++;
      }

      // D14 retention
      if (daysSinceSignup >= 14 && userActivities.some(a => {
        const days = Math.floor((a.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
        return days >= 13 && days <= 15;
      })) {
        cohorts[weekKey].d14++;
      }

      // D30 retention
      if (daysSinceSignup >= 30 && userActivities.some(a => {
        const days = Math.floor((a.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
        return days >= 28 && days <= 32;
      })) {
        cohorts[weekKey].d30++;
      }

      // Converted to paid
      if (user.tier === 'pro' && !user.promo_tier_expires_at) {
        cohorts[weekKey].converted++;
      }
    });

    // Convert to array and calculate percentages
    const cohortData = Object.values(cohorts)
      .sort((a, b) => a.week.localeCompare(b.week))
      .map(c => ({
        ...c,
        d1Rate: c.signups > 0 ? Math.round((c.d1 / c.signups) * 100) : 0,
        d7Rate: c.signups > 0 ? Math.round((c.d7 / c.signups) * 100) : 0,
        d14Rate: c.signups > 0 ? Math.round((c.d14 / c.signups) * 100) : 0,
        d30Rate: c.signups > 0 ? Math.round((c.d30 / c.signups) * 100) : 0,
        conversionRate: c.signups > 0 ? Math.round((c.converted / c.signups) * 100) : 0,
      }));

    // ===== CONVERSION FUNNEL =====
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total signups last 30 days
    const recentUsers = (users || []).filter(u => new Date(u.created_at) > thirtyDaysAgo);
    const totalSignups = recentUsers.length;

    // Users who completed onboarding (have activity within 24 hours)
    const completedOnboarding = recentUsers.filter(u => {
      const signupDate = new Date(u.created_at);
      return (activityByUser[u.id] || []).some(a => {
        const hours = (a.getTime() - signupDate.getTime()) / (1000 * 60 * 60);
        return hours > 0 && hours <= 24;
      });
    }).length;

    // Users who started trial
    const { data: trialGrants } = await supabase
      .from('profiles')
      .select('id')
      .not('promo_tier_expires_at', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString());
    const startedTrial = (trialGrants || []).length;

    // Users who engaged with 3+ features
    const { data: featureEngagement } = await supabase
      .from('user_feature_engagement')
      .select('user_id, feature_name')
      .gte('last_used_at', thirtyDaysAgo.toISOString());

    const featuresByUser: Record<string, Set<string>> = {};
    (featureEngagement || []).forEach(e => {
      if (!featuresByUser[e.user_id]) featuresByUser[e.user_id] = new Set();
      featuresByUser[e.user_id].add(e.feature_name);
    });
    const engagedUsers = Object.values(featuresByUser).filter(s => s.size >= 3).length;

    // Converted to paid (last 30 days)
    const { data: subscriptionEvents } = await supabase
      .from('subscription_events')
      .select('user_id')
      .eq('event_type', 'INITIAL_PURCHASE')
      .gte('created_at', thirtyDaysAgo.toISOString());
    const converted = (subscriptionEvents || []).length;

    const funnel = {
      signups: totalSignups,
      onboarded: completedOnboarding,
      trialStarted: startedTrial,
      engaged: engagedUsers,
      converted: converted,
      // Rates
      onboardingRate: totalSignups > 0 ? Math.round((completedOnboarding / totalSignups) * 100) : 0,
      trialRate: totalSignups > 0 ? Math.round((startedTrial / totalSignups) * 100) : 0,
      engagementRate: totalSignups > 0 ? Math.round((engagedUsers / totalSignups) * 100) : 0,
      conversionRate: totalSignups > 0 ? Math.round((converted / totalSignups) * 100) : 0,
    };

    // ===== LTV & CAC =====
    // Get all paid users with their subscription events
    const { data: allSubEvents } = await supabase
      .from('subscription_events')
      .select('user_id, event_type, price_usd, created_at')
      .in('event_type', ['INITIAL_PURCHASE', 'RENEWAL'])
      .eq('is_sandbox', false);

    // Calculate total revenue per user
    const revenueByUser: Record<string, number> = {};
    (allSubEvents || []).forEach(e => {
      if (!revenueByUser[e.user_id]) revenueByUser[e.user_id] = 0;
      revenueByUser[e.user_id] += e.price_usd || 29.99;
    });

    const paidUserCount = Object.keys(revenueByUser).length;
    const totalRevenue = Object.values(revenueByUser).reduce((sum, v) => sum + v, 0);
    const avgLTV = paidUserCount > 0 ? totalRevenue / paidUserCount : 0;

    // Get credit purchases too
    const { data: creditPurchases } = await supabase
      .from('swing_lab_credit_purchases')
      .select('user_id, price_usd');

    (creditPurchases || []).forEach(p => {
      if (!revenueByUser[p.user_id]) revenueByUser[p.user_id] = 0;
      revenueByUser[p.user_id] += p.price_usd || 0;
    });

    // LTV by signup source (if we have referral data)
    const { data: usersWithReferral } = await supabase
      .from('profiles')
      .select('id, referred_by, partner_code')
      .not('referred_by', 'is', null);

    const ltvBySource: Record<string, { users: number; revenue: number; avgLtv: number }> = {
      organic: { users: 0, revenue: 0, avgLtv: 0 },
      partner: { users: 0, revenue: 0, avgLtv: 0 },
      referral: { users: 0, revenue: 0, avgLtv: 0 },
    };

    // Categorize users
    const referralUserIds = new Set((usersWithReferral || []).map(u => u.id));
    const partnerUserIds = new Set(
      (usersWithReferral || []).filter(u => u.partner_code).map(u => u.id)
    );

    Object.entries(revenueByUser).forEach(([userId, revenue]) => {
      if (partnerUserIds.has(userId)) {
        ltvBySource.partner.users++;
        ltvBySource.partner.revenue += revenue;
      } else if (referralUserIds.has(userId)) {
        ltvBySource.referral.users++;
        ltvBySource.referral.revenue += revenue;
      } else {
        ltvBySource.organic.users++;
        ltvBySource.organic.revenue += revenue;
      }
    });

    // Calculate averages
    Object.keys(ltvBySource).forEach(key => {
      const source = ltvBySource[key];
      source.avgLtv = source.users > 0 ? source.revenue / source.users : 0;
    });

    // ===== USER HEALTH DISTRIBUTION =====
    const { data: healthData } = await supabase
      .from('user_feature_engagement')
      .select('user_id, total_opens, total_completions, last_used_at');

    const healthByUser: Record<string, { opens: number; completions: number; lastActive: Date | null }> = {};
    (healthData || []).forEach(h => {
      if (!healthByUser[h.user_id]) {
        healthByUser[h.user_id] = { opens: 0, completions: 0, lastActive: null };
      }
      healthByUser[h.user_id].opens += h.total_opens || 0;
      healthByUser[h.user_id].completions += h.total_completions || 0;
      if (h.last_used_at) {
        const lastUsed = new Date(h.last_used_at);
        if (!healthByUser[h.user_id].lastActive || lastUsed > healthByUser[h.user_id].lastActive!) {
          healthByUser[h.user_id].lastActive = lastUsed;
        }
      }
    });

    // Segment users by health
    let powerUsers = 0;
    let activeUsers = 0;
    let atRiskUsers = 0;
    let dormantUsers = 0;

    Object.values(healthByUser).forEach(h => {
      const daysSinceActive = h.lastActive
        ? Math.floor((now.getTime() - h.lastActive.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (daysSinceActive <= 3 && h.opens >= 20) {
        powerUsers++;
      } else if (daysSinceActive <= 7) {
        activeUsers++;
      } else if (daysSinceActive <= 14) {
        atRiskUsers++;
      } else {
        dormantUsers++;
      }
    });

    const userHealth = {
      powerUsers,
      activeUsers,
      atRiskUsers,
      dormantUsers,
      total: powerUsers + activeUsers + atRiskUsers + dormantUsers,
    };

    // ===== CHURN RISK USERS =====
    const { data: proUsers } = await supabase
      .from('profiles')
      .select('id, name, email, tier, last_login_at, updated_at, created_at, promo_tier_expires_at')
      .eq('tier', 'pro');

    const churnRiskUsers = (proUsers || [])
      .map(u => {
        // Get best available activity date: feature engagement > last_login > updated_at > created_at
        const lastFeatureActivity = healthByUser[u.id]?.lastActive;
        const lastLoginAt = u.last_login_at ? new Date(u.last_login_at) : null;
        const updatedAt = u.updated_at ? new Date(u.updated_at) : null;
        const createdAt = u.created_at ? new Date(u.created_at) : null;

        // Pick the most recent activity date
        const activityDates = [lastFeatureActivity, lastLoginAt, updatedAt, createdAt].filter(Boolean) as Date[];
        const lastActive = activityDates.length > 0
          ? activityDates.reduce((latest, date) => date > latest ? date : latest)
          : null;

        // If we have no activity data at all, skip this user (don't show as 999 days)
        const hasActivityData = lastFeatureActivity || lastLoginAt;
        const daysSinceActive = lastActive
          ? Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        const trialExpires = u.promo_tier_expires_at ? new Date(u.promo_tier_expires_at) : null;
        const daysUntilExpiry = trialExpires
          ? Math.floor((trialExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        let riskLevel: 'high' | 'medium' | 'low' = 'low';
        let riskReason = '';

        // Only flag as inactive risk if we have actual activity tracking data
        if (hasActivityData && daysSinceActive !== null && daysSinceActive >= 14) {
          riskLevel = 'high';
          riskReason = `Inactive ${daysSinceActive} days`;
        } else if (daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry >= 0) {
          riskLevel = 'high';
          riskReason = `Trial expires in ${daysUntilExpiry} days`;
        } else if (hasActivityData && daysSinceActive !== null && daysSinceActive >= 7) {
          riskLevel = 'medium';
          riskReason = `Inactive ${daysSinceActive} days`;
        } else if (daysUntilExpiry !== null && daysUntilExpiry <= 7) {
          riskLevel = 'medium';
          riskReason = `Trial expires in ${daysUntilExpiry} days`;
        }

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          riskLevel,
          riskReason,
          daysSinceActive: daysSinceActive ?? 0,
          isTrial: !!u.promo_tier_expires_at,
        };
      })
      .filter(u => u.riskLevel !== 'low')
      .sort((a, b) => {
        if (a.riskLevel === 'high' && b.riskLevel !== 'high') return -1;
        if (a.riskLevel !== 'high' && b.riskLevel === 'high') return 1;
        return b.daysSinceActive - a.daysSinceActive;
      })
      .slice(0, 20);

    // ===== QUICK WINS (Conversion Opportunities) =====
    const { data: freeEngagedUsers } = await supabase
      .from('profiles')
      .select('id, name, email, tier, created_at')
      .or('tier.eq.core,tier.is.null');

    const quickWins = (freeEngagedUsers || [])
      .map(u => {
        const featureCount = featuresByUser[u.id]?.size || 0;
        const userHealth = healthByUser[u.id];
        const engagement = userHealth ? userHealth.opens + userHealth.completions : 0;

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          featureCount,
          engagement,
          score: featureCount * 10 + engagement,
        };
      })
      .filter(u => u.score >= 30) // High engagement free users
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // ===== DAILY ACTIVES =====
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    // Get all activity events for the last 30 days for trend
    const { data: recentActivity } = await supabase
      .from('user_feature_engagement')
      .select('user_id, feature_name, total_opens, last_used_at')
      .gte('last_used_at', monthStart.toISOString());

    // Calculate DAU/WAU/MAU
    const todayActiveIds = new Set<string>();
    const yesterdayActiveIds = new Set<string>();
    const weekActiveIds = new Set<string>();
    const monthActiveIds = new Set<string>();
    const dailyCounts: Record<string, Set<string>> = {};

    // Track what features each user used today
    const todayUserFeatures: Record<string, { features: Set<string>; actions: number; lastActive: Date }> = {};

    (recentActivity || []).forEach(a => {
      if (!a.last_used_at) return;
      const activityDate = new Date(a.last_used_at);
      const dateKey = activityDate.toISOString().split('T')[0];

      // Track daily counts for trend
      if (!dailyCounts[dateKey]) dailyCounts[dateKey] = new Set();
      dailyCounts[dateKey].add(a.user_id);

      // Classify by time period
      if (activityDate >= todayStart) {
        todayActiveIds.add(a.user_id);
        // Track features for today's users
        if (!todayUserFeatures[a.user_id]) {
          todayUserFeatures[a.user_id] = { features: new Set(), actions: 0, lastActive: activityDate };
        }
        todayUserFeatures[a.user_id].features.add(a.feature_name);
        todayUserFeatures[a.user_id].actions += a.total_opens || 1;
        if (activityDate > todayUserFeatures[a.user_id].lastActive) {
          todayUserFeatures[a.user_id].lastActive = activityDate;
        }
      }
      if (activityDate >= yesterdayStart && activityDate < todayStart) {
        yesterdayActiveIds.add(a.user_id);
      }
      if (activityDate >= weekStart) {
        weekActiveIds.add(a.user_id);
      }
      if (activityDate >= monthStart) {
        monthActiveIds.add(a.user_id);
      }
    });

    // Build 30-day trend data
    const trendData: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      trendData.push({
        date: dateKey,
        count: dailyCounts[dateKey]?.size || 0,
      });
    }

    // Get user details for today's active users
    const todayUserIds = Array.from(todayActiveIds);
    let todayUsers: { id: string; name: string; email: string; tier: string; lastActive: string; featuresUsed: string[]; totalActions: number }[] = [];

    if (todayUserIds.length > 0) {
      const { data: todayProfiles } = await supabase
        .from('profiles')
        .select('id, name, email, tier')
        .in('id', todayUserIds.slice(0, 100)); // Limit to 100 for performance

      todayUsers = (todayProfiles || []).map(p => ({
        id: p.id,
        name: p.name || 'Unknown',
        email: p.email,
        tier: p.tier || 'free',
        lastActive: todayUserFeatures[p.id]?.lastActive?.toISOString() || '',
        featuresUsed: Array.from(todayUserFeatures[p.id]?.features || []),
        totalActions: todayUserFeatures[p.id]?.actions || 0,
      })).sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
    }

    const dailyActives = {
      today: todayActiveIds.size,
      yesterday: yesterdayActiveIds.size,
      thisWeek: weekActiveIds.size,
      thisMonth: monthActiveIds.size,
      trend: trendData,
      todayUsers,
    };

    return NextResponse.json({
      success: true,
      cohorts: cohortData,
      funnel,
      ltv: {
        averageLTV: avgLTV,
        totalRevenue,
        paidUsers: paidUserCount,
        bySource: ltvBySource,
      },
      userHealth,
      churnRiskUsers,
      quickWins,
      dailyActives,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Growth metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch growth metrics' },
      { status: 500 }
    );
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
