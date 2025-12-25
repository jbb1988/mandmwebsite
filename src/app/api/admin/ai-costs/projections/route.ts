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

    // Get model/feature data for cost analysis
    const { data: featureData } = await supabase
      .from('ai_api_calls')
      .select('feature_name, model_name, estimated_cost, input_tokens, output_tokens')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Calculate actual average cost per call for each feature from real data
    const featureCostMap = new Map<string, { totalCost: number; callCount: number }>();
    featureData?.forEach(r => {
      const existing = featureCostMap.get(r.feature_name) || { totalCost: 0, callCount: 0 };
      existing.totalCost += parseFloat(r.estimated_cost || 0);
      existing.callCount++;
      featureCostMap.set(r.feature_name, existing);
    });

    // Heavy user monthly call estimates (these are the max credits/expected heavy usage)
    const heavyUserCallsPerMonth: Record<string, number> = {
      muscle_coach: 30,     // Daily AI coaching interactions
      weekly_reports: 4,    // Weekly reports
      fuel_ai: 10,          // Meal planning interactions
      swing_lab: 10,        // Max 10 credits/month
      pitch_lab: 10,        // Max 10 credits/month
      mind_coach: 10,       // Mental training sessions
      ai_assistant_coach: 10, // General AI assistant
    };

    // Build heavy user costs from actual data
    const heavyUserCosts: Record<string, { calls: number; costPerCall: number; monthly: number }> = {};
    let heavyUserMonthly = 0;

    for (const [feature, callsPerMonth] of Object.entries(heavyUserCallsPerMonth)) {
      const featureData = featureCostMap.get(feature);
      const costPerCall = featureData && featureData.callCount > 0
        ? featureData.totalCost / featureData.callCount
        : 0;
      const monthlyCost = costPerCall * callsPerMonth;

      heavyUserCosts[feature] = {
        calls: callsPerMonth,
        costPerCall,
        monthly: monthlyCost,
      };
      heavyUserMonthly += monthlyCost;
    }

    const heavyUser6Mo = heavyUserMonthly * 6;
    const heavyUserAnnual = heavyUserMonthly * 12;

    // Pricing tiers (per 6 months)
    const pricingTiers = {
      base: { label: '1-11 seats', price: 79.00, monthly: 13.17 },
      tier2: { label: '12-120 seats (10% off)', price: 71.10, monthly: 11.85 },
      tier3: { label: '121-199 seats (15% off)', price: 67.15, monthly: 11.19 },
      tier4: { label: '200+ seats (20% off)', price: 63.20, monthly: 10.53 },
    };

    // Margin scenarios for each pricing tier with different fee combinations
    const marginScenarios = Object.entries(pricingTiers).map(([tierKey, tier]) => {
      const grossRevenue = tier.price; // 6-month revenue
      const scenarios = {
        // No fees (website direct purchase)
        noFees: {
          netRevenue: grossRevenue,
          margin: grossRevenue - heavyUser6Mo,
          marginPercent: ((grossRevenue - heavyUser6Mo) / grossRevenue) * 100,
        },
        // IAP only (15% Apple/Google)
        iapOnly: {
          netRevenue: grossRevenue * 0.85,
          margin: (grossRevenue * 0.85) - heavyUser6Mo,
          marginPercent: (((grossRevenue * 0.85) - heavyUser6Mo) / grossRevenue) * 100,
        },
        // IAP + Partner (15% + 10%)
        iapPartner: {
          netRevenue: grossRevenue * 0.75,
          margin: (grossRevenue * 0.75) - heavyUser6Mo,
          marginPercent: (((grossRevenue * 0.75) - heavyUser6Mo) / grossRevenue) * 100,
        },
        // IAP + Partner + Finder (15% + 10% + 10%)
        allFees: {
          netRevenue: grossRevenue * 0.65,
          margin: (grossRevenue * 0.65) - heavyUser6Mo,
          marginPercent: (((grossRevenue * 0.65) - heavyUser6Mo) / grossRevenue) * 100,
        },
      };
      return {
        tier: tierKey,
        label: tier.label,
        grossRevenue,
        monthlyRevenue: tier.monthly,
        scenarios,
      };
    });

    // Model efficiency analysis (using featureData already fetched above)
    const modelEfficiency = new Map<string, Map<string, { calls: number; cost: number; tokens: number }>>();
    featureData?.forEach(r => {
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
      // Heavy user cost projections
      heavyUserCosts: {
        breakdown: heavyUserCosts,
        monthly: heavyUserMonthly,
        sixMonth: heavyUser6Mo,
        annual: heavyUserAnnual,
      },
      // Pricing tiers
      pricingTiers,
      // Margin scenarios by tier with all fee combinations
      marginScenarios,
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
