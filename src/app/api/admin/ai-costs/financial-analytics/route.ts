import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Financial Analytics API for AI Cost Dashboard
 *
 * Provides comprehensive financial metrics including:
 * - Actual revenue from RevenueCat
 * - AI costs by acquisition type (gifted trials vs organic)
 * - OpenRouter model usage tracking
 * - Gross margin calculations with fee deductions
 * - Scenario-based projections for net profit
 *
 * CONTEXT: Early stage app - pre-revenue with gifted trials for user acquisition
 * All costs during this phase are investment in user growth
 */

// OpenRouter model pricing (per 1M tokens) - VERIFIED Dec 25, 2025
// Source: https://openrouter.ai/docs/models
const OPENROUTER_MODELS: Record<string, {
  inputCost: number;
  outputCost: number;
  provider: string;
  tier: 'budget' | 'standard' | 'premium';
  notes: string;
}> = {
  'openai/gpt-4o-mini': {
    inputCost: 0.15,
    outputCost: 0.60,
    provider: 'OpenAI',
    tier: 'budget',
    notes: 'Best value for general AI tasks. Primary model for coaching features.',
  },
  'openai/gpt-4-turbo': {
    inputCost: 10.00,
    outputCost: 30.00,
    provider: 'OpenAI',
    tier: 'premium',
    notes: 'High-quality but expensive. Consider migrating to gpt-4o-mini.',
  },
  'anthropic/claude-3-haiku': {
    inputCost: 0.25,
    outputCost: 1.25,
    provider: 'Anthropic',
    tier: 'budget',
    notes: 'Fast and affordable. Good for simple tasks.',
  },
  'anthropic/claude-3-sonnet': {
    inputCost: 3.00,
    outputCost: 15.00,
    provider: 'Anthropic',
    tier: 'standard',
    notes: 'Balanced quality/cost. Consider for complex tasks.',
  },
  'gemini-2.5-flash': {
    inputCost: 0.30,
    outputCost: 2.50,
    provider: 'Google',
    tier: 'budget',
    notes: 'Used for Swing Lab & Pitch Lab video analysis. Good multimodal performance.',
  },
};

// Alternative models to consider for cost optimization
const ALTERNATIVE_MODELS = [
  {
    current: 'openai/gpt-4-turbo',
    alternative: 'openai/gpt-4o-mini',
    savingsPercent: 98,
    tradeoff: 'Slightly less capable but 50x cheaper. Test quality first.',
  },
  {
    current: 'gemini-2.5-flash',
    alternative: 'gemini-2.5-flash-lite',
    savingsPercent: 67,
    tradeoff: 'Faster, cheaper ($0.10/$0.40), but may reduce video analysis quality.',
  },
  {
    current: 'anthropic/claude-3-haiku',
    alternative: 'openai/gpt-4o-mini',
    savingsPercent: 40,
    tradeoff: 'Similar tier, OpenAI may be slightly cheaper for your use case.',
  },
];

export async function GET(request: NextRequest) {
  const adminPassword = request.headers.get('X-Admin-Password');
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  if (adminPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // ========================================
    // 1. ACTUAL REVENUE FROM REVENUECAT
    // ========================================
    const { data: subscriptionEvents } = await supabase
      .from('subscription_events')
      .select('*')
      .order('created_at', { ascending: false });

    // Calculate actual revenue (exclude sandbox and trials)
    const actualRevenue = {
      total: 0,
      byStore: { apple: 0, google: 0 },
      byProduct: {} as Record<string, number>,
      transactions: [] as any[],
      lastUpdated: null as string | null,
    };

    subscriptionEvents?.forEach(event => {
      if (!event.is_sandbox && event.event_type === 'INITIAL_PURCHASE' && !event.is_trial) {
        const price = parseFloat(event.price_usd || 0);
        actualRevenue.total += price;
        actualRevenue.byStore[event.store as 'apple' | 'google'] =
          (actualRevenue.byStore[event.store as 'apple' | 'google'] || 0) + price;
        actualRevenue.byProduct[event.product_id] =
          (actualRevenue.byProduct[event.product_id] || 0) + price;
        actualRevenue.transactions.push({
          date: event.purchased_at,
          product: event.product_id,
          price,
          store: event.store,
        });
      }
      if (!actualRevenue.lastUpdated || event.created_at > actualRevenue.lastUpdated) {
        actualRevenue.lastUpdated = event.created_at;
      }
    });

    // ========================================
    // 2. USER DISTRIBUTION & ACQUISITION
    // ========================================
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, tier, promo_tier_expires_at, created_at');

    const now = new Date();
    const userDistribution = {
      total: profiles?.length || 0,
      byTier: { core: 0, pro: 0 },
      byAcquisition: {
        giftedTrialActive: 0,
        giftedTrialExpired: 0,
        organic: 0,
        paid: 0, // Will be populated from subscription events
      },
    };

    profiles?.forEach(p => {
      userDistribution.byTier[p.tier as 'core' | 'pro'] =
        (userDistribution.byTier[p.tier as 'core' | 'pro'] || 0) + 1;

      if (p.promo_tier_expires_at) {
        if (new Date(p.promo_tier_expires_at) > now) {
          userDistribution.byAcquisition.giftedTrialActive++;
        } else {
          userDistribution.byAcquisition.giftedTrialExpired++;
        }
      } else {
        userDistribution.byAcquisition.organic++;
      }
    });

    // Count paid users from subscription events
    const paidUserIds = new Set(
      subscriptionEvents
        ?.filter(e => !e.is_sandbox && e.event_type === 'INITIAL_PURCHASE' && !e.is_trial)
        .map(e => e.user_id) || []
    );
    userDistribution.byAcquisition.paid = paidUserIds.size;

    // ========================================
    // 3. AI COSTS BY ACQUISITION TYPE
    // ========================================
    const { data: aiCosts } = await supabase
      .from('ai_api_calls')
      .select(`
        ai_service,
        model_name,
        feature_name,
        input_tokens,
        output_tokens,
        cached_tokens,
        estimated_cost,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false });

    // Get user promo status for cost attribution
    const userPromoMap = new Map<string, 'gifted' | 'organic'>();
    profiles?.forEach(p => {
      if (p.promo_tier_expires_at) {
        userPromoMap.set(p.id, 'gifted');
      } else {
        userPromoMap.set(p.id, 'organic');
      }
    });

    const costBreakdown = {
      total: 0,
      byAcquisition: {
        giftedTrial: 0,  // Investment in user acquisition
        organic: 0,       // Cost of serving organic users
        paid: 0,          // Cost of serving paying customers
      },
      byModel: {} as Record<string, {
        calls: number;
        inputTokens: number;
        outputTokens: number;
        cost: number;
        provider: string;
        tier: string;
      }>,
      byFeature: {} as Record<string, {
        calls: number;
        cost: number;
        avgCostPerCall: number;
      }>,
      last30Days: 0,
      last7Days: 0,
    };

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    aiCosts?.forEach(cost => {
      const costValue = parseFloat(cost.estimated_cost || 0);
      costBreakdown.total += costValue;

      // Attribution by acquisition type
      const isPaidUser = paidUserIds.has(cost.user_id);
      const acquisitionType = userPromoMap.get(cost.user_id) || 'organic';

      if (isPaidUser) {
        costBreakdown.byAcquisition.paid += costValue;
      } else if (acquisitionType === 'gifted') {
        costBreakdown.byAcquisition.giftedTrial += costValue;
      } else {
        costBreakdown.byAcquisition.organic += costValue;
      }

      // By model
      const modelKey = cost.model_name || 'unknown';
      if (!costBreakdown.byModel[modelKey]) {
        const modelInfo = OPENROUTER_MODELS[modelKey] || {
          provider: cost.ai_service,
          tier: 'unknown',
        };
        costBreakdown.byModel[modelKey] = {
          calls: 0,
          inputTokens: 0,
          outputTokens: 0,
          cost: 0,
          provider: modelInfo.provider,
          tier: modelInfo.tier,
        };
      }
      costBreakdown.byModel[modelKey].calls++;
      costBreakdown.byModel[modelKey].inputTokens += cost.input_tokens || 0;
      costBreakdown.byModel[modelKey].outputTokens += cost.output_tokens || 0;
      costBreakdown.byModel[modelKey].cost += costValue;

      // By feature
      if (!costBreakdown.byFeature[cost.feature_name]) {
        costBreakdown.byFeature[cost.feature_name] = {
          calls: 0,
          cost: 0,
          avgCostPerCall: 0,
        };
      }
      costBreakdown.byFeature[cost.feature_name].calls++;
      costBreakdown.byFeature[cost.feature_name].cost += costValue;

      // Time-based
      const costDate = new Date(cost.created_at);
      if (costDate >= thirtyDaysAgo) {
        costBreakdown.last30Days += costValue;
      }
      if (costDate >= sevenDaysAgo) {
        costBreakdown.last7Days += costValue;
      }
    });

    // Calculate avg cost per call for features
    Object.values(costBreakdown.byFeature).forEach(feature => {
      feature.avgCostPerCall = feature.calls > 0 ? feature.cost / feature.calls : 0;
    });

    // ========================================
    // 4. GROSS MARGIN ANALYSIS
    // ========================================
    // Fee structure
    const fees = {
      iap: 0.15,        // Apple/Google 15%
      partner: 0.10,    // Partner program 10%
      finderFee: 0.10,  // Finder fee 10%
    };

    const pricing = {
      pro6Months: 79.00,
      volumeTiers: [
        { seats: '1-11', price: 79.00, discount: 0 },
        { seats: '12-120', price: 71.10, discount: 0.10 },
        { seats: '121-199', price: 67.15, discount: 0.15 },
        { seats: '200+', price: 63.20, discount: 0.20 },
      ],
    };

    // Current margin (actual revenue - actual costs - actual fees)
    const currentMargin = {
      grossRevenue: actualRevenue.total,
      // Assume average fee scenario for actual revenue
      estimatedFees: actualRevenue.total * (fees.iap + fees.partner * 0.3), // Assume 30% have partner
      netRevenue: actualRevenue.total * (1 - fees.iap - fees.partner * 0.3),
      aiCosts: costBreakdown.byAcquisition.paid,
      grossProfit: 0,
      grossMarginPercent: 0,
      // Investment costs (gifted trials)
      userAcquisitionInvestment: costBreakdown.byAcquisition.giftedTrial,
    };
    currentMargin.grossProfit = currentMargin.netRevenue - currentMargin.aiCosts;
    currentMargin.grossMarginPercent = currentMargin.grossRevenue > 0
      ? (currentMargin.grossProfit / currentMargin.grossRevenue) * 100
      : 0;

    // ========================================
    // 5. SCENARIO-BASED PROJECTIONS
    // ========================================
    // Average cost per pro user per month (from actual data)
    const activeProUsers = userDistribution.byTier.pro || 1;
    const avgCostPerProUser = costBreakdown.total / activeProUsers /
      (aiCosts && aiCosts.length > 0
        ? Math.max(1, Math.ceil((now.getTime() - new Date(aiCosts[aiCosts.length - 1].created_at).getTime()) / (30 * 24 * 60 * 60 * 1000)))
        : 1);

    // Heavy user cost estimate (from projections API logic)
    const heavyUserMonthlyCost = avgCostPerProUser * 2; // Assume heavy users are 2x average

    const scenarios = [
      {
        name: 'Conservative',
        description: 'Slow growth, high churn',
        monthlyNewPaidUsers: 5,
        churnRate: 0.15,
        conversionFromTrial: 0.05,
        feeProfile: 'allFees', // IAP + Partner + Finder
      },
      {
        name: 'Moderate',
        description: 'Steady organic growth',
        monthlyNewPaidUsers: 15,
        churnRate: 0.08,
        conversionFromTrial: 0.10,
        feeProfile: 'iapPartner', // IAP + Partner
      },
      {
        name: 'Optimistic',
        description: 'Strong word-of-mouth, direct sales',
        monthlyNewPaidUsers: 30,
        churnRate: 0.05,
        conversionFromTrial: 0.15,
        feeProfile: 'iapOnly', // Just IAP
      },
      {
        name: 'Best Case',
        description: 'Viral growth, website purchases',
        monthlyNewPaidUsers: 50,
        churnRate: 0.03,
        conversionFromTrial: 0.20,
        feeProfile: 'noFees', // Direct website purchases
      },
    ];

    const feeMultipliers: Record<string, number> = {
      noFees: 1.00,
      iapOnly: 0.85,
      iapPartner: 0.75,
      allFees: 0.65,
    };

    const projections = scenarios.map(scenario => {
      const months = [1, 3, 6, 12];
      const monthlyRevenue = pricing.pro6Months / 6; // Monthly equivalent
      const feeMultiplier = feeMultipliers[scenario.feeProfile];

      return {
        scenario: scenario.name,
        description: scenario.description,
        assumptions: {
          monthlyNewPaidUsers: scenario.monthlyNewPaidUsers,
          churnRate: `${(scenario.churnRate * 100).toFixed(0)}%`,
          trialConversion: `${(scenario.conversionFromTrial * 100).toFixed(0)}%`,
          feeProfile: scenario.feeProfile,
          netRevenueRate: `${(feeMultiplier * 100).toFixed(0)}%`,
        },
        projections: months.map(month => {
          // Simple growth model with churn
          let paidUsers = 0;
          for (let m = 1; m <= month; m++) {
            // Add new users
            paidUsers += scenario.monthlyNewPaidUsers;
            // Add trial conversions from gifted trials
            if (m === 1) {
              paidUsers += Math.round(userDistribution.byAcquisition.giftedTrialActive * scenario.conversionFromTrial);
            }
            // Apply churn
            paidUsers = Math.round(paidUsers * (1 - scenario.churnRate));
          }

          const grossRevenue = paidUsers * monthlyRevenue * month;
          const netRevenue = grossRevenue * feeMultiplier;
          const aiCosts = paidUsers * avgCostPerProUser * month;
          const grossProfit = netRevenue - aiCosts;
          const grossMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

          return {
            month,
            paidUsers,
            grossRevenue: Math.round(grossRevenue * 100) / 100,
            netRevenue: Math.round(netRevenue * 100) / 100,
            aiCosts: Math.round(aiCosts * 100) / 100,
            grossProfit: Math.round(grossProfit * 100) / 100,
            grossMarginPercent: Math.round(grossMargin * 10) / 10,
          };
        }),
      };
    });

    // ========================================
    // 6. CURRENT PHASE CONTEXT
    // ========================================
    const currentPhase = {
      stage: 'Pre-Revenue / User Acquisition',
      description: 'Currently investing in user growth through gifted trials. No paid subscriptions yet.',
      metrics: {
        totalInvestment: costBreakdown.total,
        giftedTrialInvestment: costBreakdown.byAcquisition.giftedTrial,
        organicCosts: costBreakdown.byAcquisition.organic,
        costPerTrialUser: userDistribution.byAcquisition.giftedTrialActive > 0
          ? costBreakdown.byAcquisition.giftedTrial / userDistribution.byAcquisition.giftedTrialActive
          : 0,
        activeTrials: userDistribution.byAcquisition.giftedTrialActive,
        potentialConversions: Math.round(userDistribution.byAcquisition.giftedTrialActive * 0.10), // 10% assumed
      },
      recommendations: [
        actualRevenue.total === 0
          ? 'Focus on converting gifted trial users before scaling acquisition.'
          : 'First revenue received! Monitor early customer retention.',
        costBreakdown.byModel['openai/gpt-4-turbo']
          ? 'Consider migrating from gpt-4-turbo to gpt-4o-mini for 98% cost savings.'
          : null,
        avgCostPerProUser > 2
          ? 'Average AI cost per user is high. Review feature usage patterns.'
          : null,
      ].filter(Boolean),
    };

    // ========================================
    // 7. MODEL RECOMMENDATIONS
    // ========================================
    const modelRecommendations = {
      currentModels: Object.entries(costBreakdown.byModel).map(([name, data]) => ({
        model: name,
        ...data,
        pricing: OPENROUTER_MODELS[name] || null,
      })),
      alternativeModels: ALTERNATIVE_MODELS.filter(alt =>
        costBreakdown.byModel[alt.current]
      ),
      pricingReference: OPENROUTER_MODELS,
      lastVerified: 'December 25, 2025',
      pricingSource: 'https://openrouter.ai/docs/models',
    };

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),

      // Revenue
      revenue: {
        actual: actualRevenue,
        hasRevenue: actualRevenue.total > 0,
        status: actualRevenue.total > 0 ? 'Generating Revenue' : 'Pre-Revenue',
      },

      // Users
      users: userDistribution,

      // Costs
      costs: costBreakdown,

      // Margin
      margin: currentMargin,

      // Projections
      projections,

      // Context
      currentPhase,

      // Models
      models: modelRecommendations,

      // Pricing config
      pricingConfig: {
        subscription: pricing,
        fees,
      },
    });

  } catch (error) {
    console.error('Financial Analytics API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch financial analytics',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
