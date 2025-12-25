'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Cpu, DollarSign, TrendingUp, TrendingDown, Users, Zap,
  RefreshCw, ChevronDown, ChevronUp, X, BarChart3, PieChart,
  AlertTriangle, Target, Activity, Clock
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

interface Overview {
  totalCostAllTime: number;
  totalCostThisMonth: number;
  totalCostLast30Days: number;
  totalApiCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  uniqueUsers: number;
  costPerUser: number;
  monthOverMonthChange: number | null;
}

interface FeatureCost {
  feature_name: string;
  call_count: number;
  total_cost: number;
  input_tokens: number;
  output_tokens: number;
  avg_cost_per_call: number;
}

interface ModelCost {
  ai_service: string;
  model_name: string;
  call_count: number;
  total_cost: number;
  avg_cost_per_call: number;
}

interface MonthlyCost {
  month: string;
  total_cost: number;
  call_count: number;
  unique_users: number;
}

interface UserCost {
  user_id: string;
  email: string;
  name: string | null;
  tier: string;
  call_count: number;
  total_cost: number;
  features_used: string[];
  subscription_revenue: number;
  margin: number;
}

interface Projections {
  currentMonthlyRun: number;
  projectedNext30Days: number;
  projectedNext60Days: number;
  projectedNext90Days: number;
  userGrowthRate: number;
  avgCostPerUser: number;
  avgCostPerCall: number;
  marginAnalysis: {
    tier: string;
    userCount: number;
    avgRevenue: number;
    avgCost: number;
    avgMargin: number;
    marginPercent: number;
  }[];
  efficiencyAnalysis: {
    feature: string;
    models: {
      model: string;
      calls: number;
      totalCost: number;
      avgCostPerCall: number;
    }[];
  }[];
}

interface UserDetail {
  user: {
    id: string;
    email: string;
    name: string | null;
    tier: string;
    created_at: string;
  };
  totalCost: number;
  totalCalls: number;
  featureBreakdown: {
    feature_name: string;
    call_count: number;
    total_cost: number;
    last_call_at: string;
  }[];
  monthlyHistory: {
    month: string;
    cost: number;
    calls: number;
  }[];
  subscriptionValue: number;
  profitMargin: number;
}

type TabType = 'overview' | 'features' | 'users' | 'projections';

const FEATURE_COLORS: Record<string, string> = {
  muscle_coach: '#06b6d4',
  weekly_reports: '#a855f7',
  fuel_ai: '#f97316',
  swing_lab: '#10b981',
  pitch_lab: '#fbbf24',
  mind_coach: '#3b82f6',
  ai_assistant_coach: '#ec4899',
  mind_goals: '#8b5cf6',
  muscle_goals: '#14b8a6',
};

const CHART_COLORS = ['#06b6d4', '#a855f7', '#f97316', '#10b981', '#fbbf24', '#3b82f6', '#ec4899'];

export default function AICostsPage() {
  const { getPassword } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [byFeature, setByFeature] = useState<FeatureCost[]>([]);
  const [byModel, setByModel] = useState<ModelCost[]>([]);
  const [byMonth, setByMonth] = useState<MonthlyCost[]>([]);
  const [topUsers, setTopUsers] = useState<UserCost[]>([]);
  const [projections, setProjections] = useState<Projections | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mainRes, projRes] = await Promise.all([
        fetch(`/api/admin/ai-costs?timeRange=${timeRange}`, {
          headers: { 'X-Admin-Password': getPassword() }
        }),
        fetch('/api/admin/ai-costs/projections', {
          headers: { 'X-Admin-Password': getPassword() }
        })
      ]);

      if (!mainRes.ok) throw new Error('Failed to fetch AI costs');
      if (!projRes.ok) throw new Error('Failed to fetch projections');

      const mainData = await mainRes.json();
      const projData = await projRes.json();

      setOverview(mainData.overview);
      setByFeature(mainData.byFeature);
      setByModel(mainData.byModel);
      setByMonth(mainData.byMonth);
      setTopUsers(mainData.topUsers);
      setProjections(projData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    setUserLoading(true);
    try {
      const res = await fetch(`/api/admin/ai-costs/users?userId=${userId}`, {
        headers: { 'X-Admin-Password': getPassword() }
      });
      if (!res.ok) throw new Error('Failed to fetch user details');
      const data = await res.json();
      setSelectedUser(data);
      setUserModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    if (cost < 1) return `$${cost.toFixed(3)}`;
    return `$${cost.toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatFeatureName = (name: string) => {
    return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
        <div className="text-white/50">Loading AI costs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B14] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Cost Dashboard</h1>
            <p className="text-white/50 text-sm">Track and optimize AI API spending</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#1B1F39] text-white/80 rounded-lg px-3 py-2 text-sm border border-white/10"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="0">All time</option>
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B1F39] text-white/80 rounded-lg hover:bg-[#252A4A] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'overview', label: 'Overview', color: 'cyan' },
          { id: 'features', label: 'By Feature', color: 'purple' },
          { id: 'users', label: 'By User', color: 'orange' },
          { id: 'projections', label: 'Projections', color: 'emerald' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                : 'bg-[#1B1F39] text-white/60 hover:text-white/80'
            }`}
            style={activeTab === tab.id ? {
              backgroundColor: tab.color === 'cyan' ? 'rgba(6, 182, 212, 0.2)' :
                              tab.color === 'purple' ? 'rgba(168, 85, 247, 0.2)' :
                              tab.color === 'orange' ? 'rgba(249, 115, 22, 0.2)' :
                              'rgba(16, 185, 129, 0.2)',
              color: tab.color === 'cyan' ? '#22d3ee' :
                     tab.color === 'purple' ? '#c084fc' :
                     tab.color === 'orange' ? '#fb923c' :
                     '#34d399',
              borderColor: tab.color === 'cyan' ? 'rgba(6, 182, 212, 0.3)' :
                           tab.color === 'purple' ? 'rgba(168, 85, 247, 0.3)' :
                           tab.color === 'orange' ? 'rgba(249, 115, 22, 0.3)' :
                           'rgba(16, 185, 129, 0.3)',
            } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label="Total Cost (All Time)"
              value={formatCost(overview.totalCostAllTime)}
              color="cyan"
            />
            <StatCard
              icon={Activity}
              label="This Month"
              value={formatCost(overview.totalCostThisMonth)}
              trend={overview.monthOverMonthChange}
              color="purple"
            />
            <StatCard
              icon={Zap}
              label="API Calls"
              value={overview.totalApiCalls.toLocaleString()}
              subtitle={`${overview.uniqueUsers} users`}
              color="orange"
            />
            <StatCard
              icon={Users}
              label="Cost Per User"
              value={formatCost(overview.costPerUser)}
              color="emerald"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
              <h3 className="text-white font-semibold mb-4">Monthly Cost Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B1F39" />
                  <XAxis dataKey="month" stroke="#ffffff50" fontSize={12} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1B1F39', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => [`$${(value as number)?.toFixed(4) ?? '0'}`, 'Cost']}
                  />
                  <Line type="monotone" dataKey="total_cost" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cost by Feature */}
            <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
              <h3 className="text-white font-semibold mb-4">Cost by Feature</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={byFeature} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B1F39" />
                  <XAxis type="number" stroke="#ffffff50" fontSize={12} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <YAxis type="category" dataKey="feature_name" stroke="#ffffff50" fontSize={11} width={100}
                    tickFormatter={(v) => formatFeatureName(v)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1B1F39', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => [`$${(value as number)?.toFixed(4) ?? '0'}`, 'Cost']}
                  />
                  <Bar dataKey="total_cost" radius={[0, 4, 4, 0]}>
                    {byFeature.map((entry, index) => (
                      <Cell key={entry.feature_name} fill={FEATURE_COLORS[entry.feature_name] || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Token Usage */}
          <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
            <h3 className="text-white font-semibold mb-4">Token Usage Summary</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{formatTokens(overview.totalInputTokens)}</div>
                <div className="text-white/50 text-sm mt-1">Input Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{formatTokens(overview.totalOutputTokens)}</div>
                <div className="text-white/50 text-sm mt-1">Output Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">
                  {formatTokens(overview.totalInputTokens + overview.totalOutputTokens)}
                </div>
                <div className="text-white/50 text-sm mt-1">Total Tokens</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          {/* Feature Breakdown Table */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold">Feature Cost Breakdown</h3>
            </div>
            <table className="w-full">
              <thead className="bg-[#1B1F39]">
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Feature</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Calls</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Input Tokens</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Output Tokens</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Total Cost</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg/Call</th>
                </tr>
              </thead>
              <tbody>
                {byFeature.map((f, i) => (
                  <tr key={f.feature_name} className={i % 2 === 0 ? 'bg-[#0A0B14]' : 'bg-[#0F1123]'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: FEATURE_COLORS[f.feature_name] || '#888' }}
                        />
                        <span className="text-white">{formatFeatureName(f.feature_name)}</span>
                      </div>
                    </td>
                    <td className="text-right text-white/80 px-4 py-3">{f.call_count.toLocaleString()}</td>
                    <td className="text-right text-white/80 px-4 py-3">{formatTokens(f.input_tokens)}</td>
                    <td className="text-right text-white/80 px-4 py-3">{formatTokens(f.output_tokens)}</td>
                    <td className="text-right text-cyan-400 font-medium px-4 py-3">{formatCost(f.total_cost)}</td>
                    <td className="text-right text-white/60 px-4 py-3">{formatCost(f.avg_cost_per_call)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Model Breakdown */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold">Model Usage</h3>
            </div>
            <table className="w-full">
              <thead className="bg-[#1B1F39]">
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Provider</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Model</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Calls</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Total Cost</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg/Call</th>
                </tr>
              </thead>
              <tbody>
                {byModel.map((m, i) => (
                  <tr key={`${m.ai_service}-${m.model_name}`} className={i % 2 === 0 ? 'bg-[#0A0B14]' : 'bg-[#0F1123]'}>
                    <td className="px-4 py-3 text-white capitalize">{m.ai_service}</td>
                    <td className="px-4 py-3 text-white/80 font-mono text-sm">{m.model_name}</td>
                    <td className="text-right text-white/80 px-4 py-3">{m.call_count.toLocaleString()}</td>
                    <td className="text-right text-cyan-400 font-medium px-4 py-3">{formatCost(m.total_cost)}</td>
                    <td className="text-right text-white/60 px-4 py-3">{formatCost(m.avg_cost_per_call)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold">Top 20 Users by AI Cost</h3>
            </div>
            <table className="w-full">
              <thead className="bg-[#1B1F39]">
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">User</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Tier</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Calls</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">AI Cost</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Revenue</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Margin</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Features</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u, i) => (
                  <tr
                    key={u.user_id}
                    className={`${i % 2 === 0 ? 'bg-[#0A0B14]' : 'bg-[#0F1123]'} hover:bg-[#1B1F39] cursor-pointer transition-colors`}
                    onClick={() => fetchUserDetail(u.user_id)}
                  >
                    <td className="px-4 py-3">
                      <div className="text-white">{u.email}</div>
                      {u.name && <div className="text-white/50 text-xs">{u.name}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.tier === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                        u.tier === 'core' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-white/10 text-white/50'
                      }`}>
                        {u.tier}
                      </span>
                    </td>
                    <td className="text-right text-white/80 px-4 py-3">{u.call_count}</td>
                    <td className="text-right text-orange-400 font-medium px-4 py-3">{formatCost(u.total_cost)}</td>
                    <td className="text-right text-emerald-400 px-4 py-3">{formatCost(u.subscription_revenue)}</td>
                    <td className={`text-right font-medium px-4 py-3 ${u.margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {u.margin >= 0 ? '+' : ''}{formatCost(u.margin)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.features_used.slice(0, 3).map(f => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: `${FEATURE_COLORS[f] || '#888'}20`,
                              color: FEATURE_COLORS[f] || '#888'
                            }}
                          >
                            {formatFeatureName(f)}
                          </span>
                        ))}
                        {u.features_used.length > 3 && (
                          <span className="text-white/40 text-xs">+{u.features_used.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projections Tab */}
      {activeTab === 'projections' && projections && (
        <div className="space-y-6">
          {/* Forecast Cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={Clock}
              label="Current Monthly Run"
              value={formatCost(projections.currentMonthlyRun)}
              color="cyan"
            />
            <StatCard
              icon={TrendingUp}
              label="Next 30 Days"
              value={formatCost(projections.projectedNext30Days)}
              color="purple"
            />
            <StatCard
              icon={TrendingUp}
              label="Next 60 Days"
              value={formatCost(projections.projectedNext60Days)}
              color="orange"
            />
            <StatCard
              icon={TrendingUp}
              label="Next 90 Days"
              value={formatCost(projections.projectedNext90Days)}
              color="emerald"
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
              <div className="text-white/50 text-sm mb-2">User Growth Rate</div>
              <div className={`text-3xl font-bold ${projections.userGrowthRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {projections.userGrowthRate >= 0 ? '+' : ''}{projections.userGrowthRate.toFixed(1)}%
              </div>
              <div className="text-white/30 text-xs mt-1">Month over month</div>
            </div>
            <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
              <div className="text-white/50 text-sm mb-2">Avg Cost Per User</div>
              <div className="text-3xl font-bold text-cyan-400">{formatCost(projections.avgCostPerUser)}</div>
              <div className="text-white/30 text-xs mt-1">Last 30 days</div>
            </div>
            <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
              <div className="text-white/50 text-sm mb-2">Avg Cost Per Call</div>
              <div className="text-3xl font-bold text-purple-400">{formatCost(projections.avgCostPerCall)}</div>
              <div className="text-white/30 text-xs mt-1">All features</div>
            </div>
          </div>

          {/* Margin Analysis by Tier */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold">Profit Margin by Tier</h3>
              <p className="text-white/50 text-sm">AI cost vs subscription revenue</p>
            </div>
            <table className="w-full">
              <thead className="bg-[#1B1F39]">
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Tier</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Users</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg Revenue</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg AI Cost</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg Margin</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {projections.marginAnalysis.map((m, i) => (
                  <tr key={m.tier} className={i % 2 === 0 ? 'bg-[#0A0B14]' : 'bg-[#0F1123]'}>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        m.tier === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                        m.tier === 'core' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-white/10 text-white/50'
                      }`}>
                        {m.tier}
                      </span>
                    </td>
                    <td className="text-right text-white/80 px-4 py-3">{m.userCount}</td>
                    <td className="text-right text-emerald-400 px-4 py-3">{formatCost(m.avgRevenue)}</td>
                    <td className="text-right text-orange-400 px-4 py-3">{formatCost(m.avgCost)}</td>
                    <td className={`text-right font-medium px-4 py-3 ${m.avgMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.avgMargin >= 0 ? '+' : ''}{formatCost(m.avgMargin)}
                    </td>
                    <td className={`text-right font-medium px-4 py-3 ${m.marginPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.marginPercent >= 0 ? '+' : ''}{m.marginPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Model Efficiency */}
          {projections.efficiencyAnalysis.length > 0 && (
            <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
              <h3 className="text-white font-semibold mb-4">Model Efficiency by Feature</h3>
              <div className="grid grid-cols-2 gap-4">
                {projections.efficiencyAnalysis.map(f => (
                  <div key={f.feature} className="bg-[#1B1F39] rounded-xl p-4">
                    <div className="text-white font-medium mb-3">{formatFeatureName(f.feature)}</div>
                    <div className="space-y-2">
                      {f.models.map(m => (
                        <div key={m.model} className="flex items-center justify-between text-sm">
                          <span className="text-white/60 font-mono">{m.model}</span>
                          <div className="text-right">
                            <span className="text-cyan-400">{formatCost(m.avgCostPerCall)}</span>
                            <span className="text-white/30 ml-1">/ call</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Detail Modal */}
      {userModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1123] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{selectedUser.user.email}</h3>
                <p className="text-white/50 text-sm">{selectedUser.user.name || 'No name'}</p>
              </div>
              <button
                onClick={() => setUserModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {/* User Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#1B1F39] rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{formatCost(selectedUser.totalCost)}</div>
                  <div className="text-white/50 text-xs">Total Cost</div>
                </div>
                <div className="bg-[#1B1F39] rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">{selectedUser.totalCalls}</div>
                  <div className="text-white/50 text-xs">API Calls</div>
                </div>
                <div className="bg-[#1B1F39] rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{formatCost(selectedUser.subscriptionValue)}</div>
                  <div className="text-white/50 text-xs">Revenue/mo</div>
                </div>
                <div className="bg-[#1B1F39] rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${selectedUser.profitMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedUser.profitMargin >= 0 ? '+' : ''}{formatCost(selectedUser.profitMargin)}
                  </div>
                  <div className="text-white/50 text-xs">Margin</div>
                </div>
              </div>

              {/* Feature Breakdown */}
              <div>
                <h4 className="text-white font-medium mb-2">Feature Usage</h4>
                <div className="space-y-2">
                  {selectedUser.featureBreakdown.map(f => (
                    <div key={f.feature_name} className="flex items-center justify-between bg-[#1B1F39] rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: FEATURE_COLORS[f.feature_name] || '#888' }}
                        />
                        <span className="text-white">{formatFeatureName(f.feature_name)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-cyan-400">{formatCost(f.total_cost)}</span>
                        <span className="text-white/30 ml-2">({f.call_count} calls)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly History */}
              {selectedUser.monthlyHistory.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Monthly History</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={selectedUser.monthlyHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1B1F39" />
                      <XAxis dataKey="month" stroke="#ffffff50" fontSize={10} />
                      <YAxis stroke="#ffffff50" fontSize={10} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1B1F39', border: 'none', borderRadius: '8px' }}
                        formatter={(value) => [`$${(value as number)?.toFixed(4) ?? '0'}`, 'Cost']}
                      />
                      <Bar dataKey="cost" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  color
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  trend?: number | null;
  color: 'cyan' | 'purple' | 'orange' | 'emerald';
}) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} rounded-2xl p-5 border border-white/5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[2]}`} />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/50 text-sm mt-1">{label}</div>
      {subtitle && <div className="text-white/30 text-xs mt-0.5">{subtitle}</div>}
    </div>
  );
}
