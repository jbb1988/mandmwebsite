import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Model Analysis API for AI Cost Dashboard
 *
 * Provides data for model upgrade decision-making:
 * - Current usage by model and feature
 * - Model catalog with pricing and capabilities
 * - Upgrade projections and ROI calculations
 */

// Complete model catalog with pricing and capabilities
// Prices verified Dec 2025 from OpenRouter & official docs
const MODEL_CATALOG: Record<string, {
  provider: string;
  displayName: string;
  inputCost: number;  // per 1M tokens
  outputCost: number; // per 1M tokens
  contextWindow: string;
  capabilities: string[];
  bestFor: string[];
  tier: 'budget' | 'standard' | 'premium';
  role: 'current' | 'upgrade' | 'downgrade';
  notes: string;
}> = {
  // Current Models
  'openai/gpt-4o-mini': {
    provider: 'OpenAI',
    displayName: 'GPT-4o Mini',
    inputCost: 0.15,
    outputCost: 0.60,
    contextWindow: '128K',
    capabilities: ['Text generation', 'Structured output', 'Function calling'],
    bestFor: ['High-volume tasks', 'Cost-sensitive features', 'Coaching responses'],
    tier: 'budget',
    role: 'current',
    notes: 'Current primary model for all coaching features',
  },
  'gpt-4o-mini': {
    provider: 'OpenAI',
    displayName: 'GPT-4o Mini',
    inputCost: 0.15,
    outputCost: 0.60,
    contextWindow: '128K',
    capabilities: ['Text generation', 'Structured output', 'Function calling'],
    bestFor: ['High-volume tasks', 'Cost-sensitive features', 'Coaching responses'],
    tier: 'budget',
    role: 'current',
    notes: 'Alias for openai/gpt-4o-mini',
  },
  'gemini-2.5-flash': {
    provider: 'Google',
    displayName: 'Gemini 2.5 Flash',
    inputCost: 0.30,
    outputCost: 2.50,
    contextWindow: '1M',
    capabilities: ['Multi-modal', 'Video analysis', 'Long context'],
    bestFor: ['Video analysis', 'Swing Lab', 'Pitch Lab'],
    tier: 'budget',
    role: 'current',
    notes: 'Current model for video analysis features',
  },

  // Upgrade Options
  'openai/gpt-4o': {
    provider: 'OpenAI',
    displayName: 'GPT-4o',
    inputCost: 2.50,
    outputCost: 10.00,
    contextWindow: '128K',
    capabilities: ['Advanced reasoning', 'Complex analysis', 'Nuanced responses'],
    bestFor: ['Complex coaching', 'Detailed analysis', 'Premium features'],
    tier: 'standard',
    role: 'upgrade',
    notes: '17x more expensive than mini, significantly better reasoning',
  },
  'anthropic/claude-3.5-sonnet': {
    provider: 'Anthropic',
    displayName: 'Claude 3.5 Sonnet',
    inputCost: 3.00,
    outputCost: 15.00,
    contextWindow: '200K',
    capabilities: ['Excellent writing', 'Detailed analysis', 'Creative content'],
    bestFor: ['Weekly reports', 'Detailed coaching', 'Long-form content'],
    tier: 'standard',
    role: 'upgrade',
    notes: '20x more expensive than mini, best writing quality',
  },
  'google/gemini-2.5-pro': {
    provider: 'Google',
    displayName: 'Gemini 2.5 Pro',
    inputCost: 1.25,
    outputCost: 5.00,
    contextWindow: '1M',
    capabilities: ['Advanced video', 'Deep analysis', 'Multi-modal pro'],
    bestFor: ['Complex video analysis', 'Detailed swing breakdowns'],
    tier: 'standard',
    role: 'upgrade',
    notes: '4x more expensive than flash, better video analysis',
  },

  // Budget Options
  'google/gemini-2.0-flash': {
    provider: 'Google',
    displayName: 'Gemini 2.0 Flash',
    inputCost: 0.10,
    outputCost: 0.40,
    contextWindow: '1M',
    capabilities: ['Fast inference', 'Basic multi-modal', 'Long context'],
    bestFor: ['Simple tasks', 'Cost reduction', 'High volume'],
    tier: 'budget',
    role: 'downgrade',
    notes: 'Newer, cheaper option - 30% cheaper than gpt-4o-mini',
  },
  'anthropic/claude-3-haiku': {
    provider: 'Anthropic',
    displayName: 'Claude 3 Haiku',
    inputCost: 0.25,
    outputCost: 1.25,
    contextWindow: '200K',
    capabilities: ['Fast responses', 'Good writing', 'Efficient'],
    bestFor: ['Quick responses', 'Budget Anthropic option'],
    tier: 'budget',
    role: 'current',
    notes: 'Current tertiary fallback model',
  },

  // Legacy (expensive fallback)
  'openai/gpt-4-turbo': {
    provider: 'OpenAI',
    displayName: 'GPT-4 Turbo',
    inputCost: 10.00,
    outputCost: 30.00,
    contextWindow: '128K',
    capabilities: ['Strong reasoning', 'Reliable output'],
    bestFor: ['Fallback only', 'Legacy compatibility'],
    tier: 'premium',
    role: 'current',
    notes: 'Current fallback - 67x more expensive than mini, should minimize usage',
  },
};

// Feature to current model mapping
const FEATURE_CURRENT_MODELS: Record<string, string> = {
  muscle_coach: 'openai/gpt-4o-mini',
  mind_coach: 'openai/gpt-4o-mini',
  fuel_ai: 'openai/gpt-4o-mini',
  ai_assistant_coach: 'openai/gpt-4o-mini',
  weekly_reports: 'openai/gpt-4o-mini',
  swing_lab: 'gemini-2.5-flash',
  pitch_lab: 'gemini-2.5-flash',
  mind_goals: 'openai/gpt-4o-mini',
  muscle_goals: 'openai/gpt-4o-mini',
};

// Feature display names
const FEATURE_NAMES: Record<string, string> = {
  muscle_coach: 'Muscle Coach',
  mind_coach: 'Mind Coach',
  fuel_ai: 'Fuel AI',
  ai_assistant_coach: 'AI Assistant',
  weekly_reports: 'Weekly Reports',
  swing_lab: 'Swing Lab',
  pitch_lab: 'Pitch Lab',
  mind_goals: 'Mind Goals',
  muscle_goals: 'Muscle Goals',
};

export async function GET(request: NextRequest) {
  const adminPassword = request.headers.get('X-Admin-Password');
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  if (adminPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get last 30 days of AI usage
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { data: aiCalls } = await supabase
      .from('ai_api_calls')
      .select('feature_name, model_name, input_tokens, output_tokens, estimated_cost, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // ========================================
    // 1. CURRENT USAGE BY MODEL
    // ========================================
    const usageByModel = new Map<string, {
      calls: number;
      cost: number;
      inputTokens: number;
      outputTokens: number;
    }>();

    aiCalls?.forEach(call => {
      const model = call.model_name || 'unknown';
      const existing = usageByModel.get(model) || { calls: 0, cost: 0, inputTokens: 0, outputTokens: 0 };
      existing.calls++;
      existing.cost += parseFloat(call.estimated_cost || 0);
      existing.inputTokens += call.input_tokens || 0;
      existing.outputTokens += call.output_tokens || 0;
      usageByModel.set(model, existing);
    });

    const totalCost = Array.from(usageByModel.values()).reduce((sum, m) => sum + m.cost, 0);

    const currentUsageByModel = Array.from(usageByModel.entries())
      .map(([model, data]) => ({
        model,
        displayName: MODEL_CATALOG[model]?.displayName || model,
        provider: MODEL_CATALOG[model]?.provider || 'Unknown',
        calls: data.calls,
        cost: data.cost,
        avgCostPerCall: data.calls > 0 ? data.cost / data.calls : 0,
        avgInputTokens: data.calls > 0 ? Math.round(data.inputTokens / data.calls) : 0,
        avgOutputTokens: data.calls > 0 ? Math.round(data.outputTokens / data.calls) : 0,
        percentOfTotal: totalCost > 0 ? (data.cost / totalCost) * 100 : 0,
        tier: MODEL_CATALOG[model]?.tier || 'unknown',
      }))
      .sort((a, b) => b.cost - a.cost);

    // ========================================
    // 2. USAGE BY FEATURE
    // ========================================
    const usageByFeature = new Map<string, {
      model: string;
      calls: number;
      cost: number;
      inputTokens: number;
      outputTokens: number;
    }>();

    aiCalls?.forEach(call => {
      const feature = call.feature_name || 'unknown';
      const existing = usageByFeature.get(feature) || {
        model: call.model_name || 'unknown',
        calls: 0,
        cost: 0,
        inputTokens: 0,
        outputTokens: 0,
      };
      existing.calls++;
      existing.cost += parseFloat(call.estimated_cost || 0);
      existing.inputTokens += call.input_tokens || 0;
      existing.outputTokens += call.output_tokens || 0;
      // Use most recent model
      existing.model = call.model_name || existing.model;
      usageByFeature.set(feature, existing);
    });

    const currentUsageByFeature = Array.from(usageByFeature.entries())
      .map(([feature, data]) => ({
        feature,
        displayName: FEATURE_NAMES[feature] || feature,
        currentModel: data.model,
        currentModelDisplay: MODEL_CATALOG[data.model]?.displayName || data.model,
        monthlyCalls: data.calls,
        monthlyCost: data.cost,
        avgInputTokens: data.calls > 0 ? Math.round(data.inputTokens / data.calls) : 0,
        avgOutputTokens: data.calls > 0 ? Math.round(data.outputTokens / data.calls) : 0,
      }))
      .sort((a, b) => b.monthlyCost - a.monthlyCost);

    // ========================================
    // 3. UPGRADE PROJECTIONS
    // ========================================
    const upgradeOptions = Object.entries(MODEL_CATALOG)
      .filter(([_, m]) => m.role === 'upgrade' || m.role === 'downgrade')
      .map(([id, m]) => ({
        modelId: id,
        displayName: m.displayName,
        provider: m.provider,
        inputCost: m.inputCost,
        outputCost: m.outputCost,
        tier: m.tier,
        role: m.role,
      }));

    // Calculate projections for each feature with each upgrade option
    const upgradeProjections = currentUsageByFeature.map(feature => {
      const currentModelInfo = MODEL_CATALOG[feature.currentModel];
      const currentInputCost = currentModelInfo?.inputCost || 0.15;
      const currentOutputCost = currentModelInfo?.outputCost || 0.60;

      const projections = upgradeOptions.map(upgrade => {
        const projectedCostPerCall =
          (feature.avgInputTokens / 1_000_000) * upgrade.inputCost +
          (feature.avgOutputTokens / 1_000_000) * upgrade.outputCost;
        const projectedMonthlyCost = projectedCostPerCall * feature.monthlyCalls;
        const delta = projectedMonthlyCost - feature.monthlyCost;
        const multiplier = feature.monthlyCost > 0 ? projectedMonthlyCost / feature.monthlyCost : 0;

        return {
          modelId: upgrade.modelId,
          modelName: upgrade.displayName,
          provider: upgrade.provider,
          projectedMonthlyCost,
          delta,
          multiplier,
          isUpgrade: upgrade.role === 'upgrade',
          isCostSaving: delta < 0,
        };
      });

      return {
        feature: feature.feature,
        displayName: feature.displayName,
        currentModel: feature.currentModel,
        currentModelDisplay: feature.currentModelDisplay,
        monthlyCalls: feature.monthlyCalls,
        currentMonthlyCost: feature.monthlyCost,
        avgInputTokens: feature.avgInputTokens,
        avgOutputTokens: feature.avgOutputTokens,
        projections,
      };
    });

    // ========================================
    // 4. ROI CALCULATION HELPERS
    // ========================================
    // Get user/revenue metrics for ROI calculations
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('tier', 'pro');

    const proUserCount = profiles?.length || 1;
    const monthlyRevenuePerUser = 79 / 6; // $13.17
    const ltv = 79; // 6-month subscription

    // Current conversion rate (from lifecycle data)
    const { data: trialUsers } = await supabase
      .from('profiles')
      .select('id, tier, promo_tier_expires_at')
      .not('promo_tier_expires_at', 'is', null);

    const trialCount = trialUsers?.length || 0;
    const convertedCount = trialUsers?.filter(u => u.tier === 'pro').length || 0;
    const currentConversionRate = trialCount > 0 ? (convertedCount / trialCount) * 100 : 0;

    const roiContext = {
      proUserCount,
      monthlyRevenuePerUser,
      ltv,
      currentConversionRate,
      totalMonthlyRevenue: proUserCount * monthlyRevenuePerUser,
    };

    // ========================================
    // 5. MONTHLY TREND
    // ========================================
    const monthlyTrend = new Map<string, number>();
    aiCalls?.forEach(call => {
      const month = call.created_at.substring(0, 7);
      monthlyTrend.set(month, (monthlyTrend.get(month) || 0) + parseFloat(call.estimated_cost || 0));
    });

    const monthlyTrendData = Array.from(monthlyTrend.entries())
      .map(([month, cost]) => ({ month, cost }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      periodDays: 30,

      // Current state
      summary: {
        totalCalls: aiCalls?.length || 0,
        totalCost,
        avgCostPerCall: aiCalls && aiCalls.length > 0 ? totalCost / aiCalls.length : 0,
        uniqueModels: usageByModel.size,
        uniqueFeatures: usageByFeature.size,
      },

      // Usage breakdowns
      currentUsageByModel,
      currentUsageByFeature,

      // Upgrade analysis
      modelCatalog: MODEL_CATALOG,
      upgradeOptions,
      upgradeProjections,

      // ROI context
      roiContext,

      // Trends
      monthlyTrend: monthlyTrendData,
    });

  } catch (error) {
    console.error('Model Analysis API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch model analysis',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
