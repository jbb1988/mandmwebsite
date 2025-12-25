import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const adminPassword = request.headers.get('X-Admin-Password');
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  if (adminPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get last 30 days of costs for projection baseline
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: recentCosts } = await supabase
      .from('ai_api_calls')
      .select('estimated_cost, user_id, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const totalLast30Days = recentCosts?.reduce((sum, r) => sum + parseFloat(r.estimated_cost || 0), 0) || 0;
    const uniqueUsersLast30Days = new Set(recentCosts?.map(r => r.user_id)).size;

    // Calculate daily average cost
    const dailyAvgCost = totalLast30Days / 30;
    const avgCostPerUser = uniqueUsersLast30Days > 0 ? totalLast30Days / uniqueUsersLast30Days : 0;
    const avgCostPerCall = recentCosts && recentCosts.length > 0 ? totalLast30Days / recentCosts.length : 0;

    // Get user growth (signups in last 3 months)
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const { data: signups } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', threeMonthsAgo.toISOString());

    // Calculate monthly signup rate
    const monthlySignups = new Map<string, number>();
    signups?.forEach(s => {
      const month = s.created_at.substring(0, 7);
      monthlySignups.set(month, (monthlySignups.get(month) || 0) + 1);
    });

    const signupCounts = Array.from(monthlySignups.values());
    const avgMonthlySignups = signupCounts.length > 0
      ? signupCounts.reduce((a, b) => a + b, 0) / signupCounts.length
      : 0;

    // Calculate growth rate (comparing last month to previous)
    const sortedMonths = Array.from(monthlySignups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    let userGrowthRate = 0;
    if (sortedMonths.length >= 2) {
      const lastMonth = sortedMonths[0][1];
      const prevMonth = sortedMonths[1][1];
      userGrowthRate = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
    }

    // Project costs
    const projectedNext30Days = dailyAvgCost * 30;
    const projectedNext60Days = dailyAvgCost * 60 * (1 + Math.max(0, userGrowthRate / 100));
    const projectedNext90Days = dailyAvgCost * 90 * Math.pow(1 + Math.max(0, userGrowthRate / 100), 1.5);

    // Margin analysis by tier
    const { data: allCosts } = await supabase
      .from('ai_api_calls')
      .select('user_id, estimated_cost')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const userCostMap = new Map<string, number>();
    allCosts?.forEach(r => {
      userCostMap.set(r.user_id, (userCostMap.get(r.user_id) || 0) + parseFloat(r.estimated_cost || 0));
    });

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, tier')
      .in('id', Array.from(userCostMap.keys()));

    const tierAnalysis = new Map<string, { users: number; totalCost: number; totalRevenue: number }>();

    profiles?.forEach(p => {
      const cost = userCostMap.get(p.id) || 0;
      const tier = p.tier || 'free';
      const existing = tierAnalysis.get(tier) || { users: 0, totalCost: 0, totalRevenue: 0 };
      existing.users++;
      existing.totalCost += cost;
      // Pro = $79/6mo = ~$13.17/mo base rate, others = $0
      // Volume tiers: 1-11 seats ($79), 12-120 ($71.10), 121-199 ($67.15), 200+ ($63.20)
      existing.totalRevenue += tier === 'pro' ? 13.17 : 0;
      tierAnalysis.set(tier, existing);
    });

    const marginAnalysis = Array.from(tierAnalysis.entries()).map(([tier, data]) => ({
      tier,
      userCount: data.users,
      avgRevenue: data.users > 0 ? data.totalRevenue / data.users : 0,
      avgCost: data.users > 0 ? data.totalCost / data.users : 0,
      avgMargin: data.users > 0 ? (data.totalRevenue - data.totalCost) / data.users : 0,
      marginPercent: data.totalRevenue > 0
        ? ((data.totalRevenue - data.totalCost) / data.totalRevenue) * 100
        : -100
    }));

    // Model efficiency analysis
    const { data: modelData } = await supabase
      .from('ai_api_calls')
      .select('feature_name, model_name, estimated_cost, input_tokens, output_tokens')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const modelEfficiency = new Map<string, Map<string, { calls: number; cost: number; tokens: number }>>();
    modelData?.forEach(r => {
      if (!modelEfficiency.has(r.feature_name)) {
        modelEfficiency.set(r.feature_name, new Map());
      }
      const featureMap = modelEfficiency.get(r.feature_name)!;
      const existing = featureMap.get(r.model_name) || { calls: 0, cost: 0, tokens: 0 };
      existing.calls++;
      existing.cost += parseFloat(r.estimated_cost || 0);
      existing.tokens += (r.input_tokens || 0) + (r.output_tokens || 0);
      featureMap.set(r.model_name, existing);
    });

    const efficiencyAnalysis = Array.from(modelEfficiency.entries()).map(([feature, models]) => ({
      feature,
      models: Array.from(models.entries()).map(([model, data]) => ({
        model,
        calls: data.calls,
        totalCost: data.cost,
        avgCostPerCall: data.calls > 0 ? data.cost / data.calls : 0,
        costPerThousandTokens: data.tokens > 0 ? (data.cost / data.tokens) * 1000 : 0
      }))
    }));

    return NextResponse.json({
      success: true,
      currentMonthlyRun: dailyAvgCost * 30,
      projectedNext30Days,
      projectedNext60Days,
      projectedNext90Days,
      userGrowthRate,
      avgCostPerUser,
      avgCostPerCall,
      avgMonthlySignups,
      marginAnalysis,
      efficiencyAnalysis,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Cost Projections API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch projections',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
