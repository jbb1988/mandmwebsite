import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const adminPassword = request.headers.get('X-Admin-Password');
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

  if (adminPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || '30';

  // Calculate date filter
  const daysAgo = parseInt(timeRange);
  const startDate = daysAgo > 0
    ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    : null;

  try {
    let overview;

    // All-time totals
    const { data: allTime } = await supabase
      .from('ai_api_calls')
      .select('estimated_cost, input_tokens, output_tokens, user_id')
      .order('created_at', { ascending: false });

    // This month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: thisMonth } = await supabase
      .from('ai_api_calls')
      .select('estimated_cost')
      .gte('created_at', monthStart.toISOString());

    // Last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: last30Days } = await supabase
      .from('ai_api_calls')
      .select('estimated_cost')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Last month for comparison
    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(monthStart);

    const { data: lastMonth } = await supabase
      .from('ai_api_calls')
      .select('estimated_cost')
      .gte('created_at', lastMonthStart.toISOString())
      .lt('created_at', lastMonthEnd.toISOString());

    const totalCostAllTime = allTime?.reduce((sum, r) => sum + parseFloat(r.estimated_cost || 0), 0) || 0;
    const totalCostThisMonth = thisMonth?.reduce((sum, r) => sum + parseFloat(r.estimated_cost || 0), 0) || 0;
    const totalCostLast30Days = last30Days?.reduce((sum, r) => sum + parseFloat(r.estimated_cost || 0), 0) || 0;
    const lastMonthCost = lastMonth?.reduce((sum, r) => sum + parseFloat(r.estimated_cost || 0), 0) || 0;
    const uniqueUsers = new Set(allTime?.map(r => r.user_id)).size;

    overview = {
      totalCostAllTime,
      totalCostThisMonth,
      totalCostLast30Days,
      totalApiCalls: allTime?.length || 0,
      totalInputTokens: allTime?.reduce((sum, r) => sum + (r.input_tokens || 0), 0) || 0,
      totalOutputTokens: allTime?.reduce((sum, r) => sum + (r.output_tokens || 0), 0) || 0,
      uniqueUsers,
      costPerUser: uniqueUsers > 0 ? totalCostAllTime / uniqueUsers : 0,
      monthOverMonthChange: lastMonthCost > 0
        ? ((totalCostThisMonth - lastMonthCost) / lastMonthCost) * 100
        : null
    };

    // 2. Cost by Feature
    const { data: byFeatureRaw } = await supabase
      .from('ai_api_calls')
      .select('feature_name, estimated_cost, input_tokens, output_tokens')
      .order('created_at', { ascending: false });

    const featureMap = new Map<string, {
      callCount: number;
      totalCost: number;
      inputTokens: number;
      outputTokens: number;
    }>();

    byFeatureRaw?.forEach(row => {
      const existing = featureMap.get(row.feature_name) || {
        callCount: 0,
        totalCost: 0,
        inputTokens: 0,
        outputTokens: 0
      };
      existing.callCount++;
      existing.totalCost += parseFloat(row.estimated_cost || 0);
      existing.inputTokens += row.input_tokens || 0;
      existing.outputTokens += row.output_tokens || 0;
      featureMap.set(row.feature_name, existing);
    });

    const byFeature = Array.from(featureMap.entries()).map(([feature_name, data]) => ({
      feature_name,
      call_count: data.callCount,
      total_cost: data.totalCost,
      input_tokens: data.inputTokens,
      output_tokens: data.outputTokens,
      avg_cost_per_call: data.callCount > 0 ? data.totalCost / data.callCount : 0
    })).sort((a, b) => b.total_cost - a.total_cost);

    // 3. Cost by Model
    const { data: byModelRaw } = await supabase
      .from('ai_api_calls')
      .select('ai_service, model_name, estimated_cost, input_tokens, output_tokens');

    const modelMap = new Map<string, {
      aiService: string;
      callCount: number;
      totalCost: number;
      inputTokens: number;
      outputTokens: number;
    }>();

    byModelRaw?.forEach(row => {
      const key = `${row.ai_service}:${row.model_name}`;
      const existing = modelMap.get(key) || {
        aiService: row.ai_service,
        callCount: 0,
        totalCost: 0,
        inputTokens: 0,
        outputTokens: 0
      };
      existing.callCount++;
      existing.totalCost += parseFloat(row.estimated_cost || 0);
      existing.inputTokens += row.input_tokens || 0;
      existing.outputTokens += row.output_tokens || 0;
      modelMap.set(key, existing);
    });

    const byModel = Array.from(modelMap.entries()).map(([key, data]) => {
      const [ai_service, model_name] = key.split(':');
      return {
        ai_service,
        model_name,
        call_count: data.callCount,
        total_cost: data.totalCost,
        input_tokens: data.inputTokens,
        output_tokens: data.outputTokens,
        avg_cost_per_call: data.callCount > 0 ? data.totalCost / data.callCount : 0
      };
    }).sort((a, b) => b.total_cost - a.total_cost);

    // 4. Monthly Trend
    const { data: monthlyRaw } = await supabase
      .from('ai_api_calls')
      .select('created_at, estimated_cost, user_id')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    const monthlyMap = new Map<string, { cost: number; calls: number; users: Set<string> }>();
    monthlyRaw?.forEach(row => {
      const month = row.created_at.substring(0, 7); // YYYY-MM
      const existing = monthlyMap.get(month) || { cost: 0, calls: 0, users: new Set() };
      existing.cost += parseFloat(row.estimated_cost || 0);
      existing.calls++;
      existing.users.add(row.user_id);
      monthlyMap.set(month, existing);
    });

    const byMonth = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      total_cost: data.cost,
      call_count: data.calls,
      unique_users: data.users.size
    })).sort((a, b) => a.month.localeCompare(b.month));

    // 5. Top Users by Cost
    const { data: topUsersRaw } = await supabase
      .from('ai_api_calls')
      .select(`
        user_id,
        estimated_cost,
        input_tokens,
        output_tokens,
        feature_name
      `)
      .order('created_at', { ascending: false });

    const userMap = new Map<string, {
      totalCost: number;
      callCount: number;
      inputTokens: number;
      outputTokens: number;
      features: Set<string>;
    }>();

    topUsersRaw?.forEach(row => {
      const existing = userMap.get(row.user_id) || {
        totalCost: 0,
        callCount: 0,
        inputTokens: 0,
        outputTokens: 0,
        features: new Set()
      };
      existing.totalCost += parseFloat(row.estimated_cost || 0);
      existing.callCount++;
      existing.inputTokens += row.input_tokens || 0;
      existing.outputTokens += row.output_tokens || 0;
      existing.features.add(row.feature_name);
      userMap.set(row.user_id, existing);
    });

    // Get user profiles for the top users
    const userIds = Array.from(userMap.keys());
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, name, tier')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const topUsers = Array.from(userMap.entries())
      .map(([user_id, data]) => {
        const profile = profileMap.get(user_id);
        // Calculate subscription revenue (Pro = $79/6mo = ~$13.17/mo base rate)
        // Volume tiers: 1-11 seats ($79), 12-120 ($71.10), 121-199 ($67.15), 200+ ($63.20)
        const monthlyRevenue = profile?.tier === 'pro' ? 13.17 : 0;
        return {
          user_id,
          email: profile?.email || 'Unknown',
          name: profile?.name || null,
          tier: profile?.tier || 'unknown',
          call_count: data.callCount,
          total_cost: data.totalCost,
          input_tokens: data.inputTokens,
          output_tokens: data.outputTokens,
          features_used: Array.from(data.features),
          subscription_revenue: monthlyRevenue,
          margin: monthlyRevenue - data.totalCost
        };
      })
      .sort((a, b) => b.total_cost - a.total_cost)
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      overview,
      byFeature,
      byModel,
      byMonth,
      topUsers,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Costs API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch AI costs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
