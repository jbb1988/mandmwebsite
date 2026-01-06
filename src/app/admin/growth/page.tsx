'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  AlertTriangle,
  Zap,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  Mail,
  Gift,
  ChevronDown,
  ChevronUp,
  Flame,
  UserCheck,
  UserMinus,
  Clock,
  BarChart3,
  X,
  ExternalLink,
  Info,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface CohortData {
  week: string;
  signups: number;
  d1: number;
  d7: number;
  d14: number;
  d30: number;
  converted: number;
  d1Rate: number;
  d7Rate: number;
  d14Rate: number;
  d30Rate: number;
  conversionRate: number;
}

interface FunnelData {
  signups: number;
  onboarded: number;
  trialStarted: number;
  engaged: number;
  converted: number;
  onboardingRate: number;
  trialRate: number;
  engagementRate: number;
  conversionRate: number;
}

interface LTVData {
  averageLTV: number;
  totalRevenue: number;
  paidUsers: number;
  bySource: Record<string, { users: number; revenue: number; avgLtv: number }>;
}

interface UserHealthData {
  powerUsers: number;
  activeUsers: number;
  atRiskUsers: number;
  dormantUsers: number;
  total: number;
}

interface ChurnRiskUser {
  id: string;
  name: string;
  email: string;
  riskLevel: 'high' | 'medium' | 'low';
  riskReason: string;
  daysSinceActive: number;
  isTrial: boolean;
}

interface QuickWin {
  id: string;
  name: string;
  email: string;
  featureCount: number;
  engagement: number;
  score: number;
}

interface DailyActiveUser {
  id: string;
  name: string;
  email: string;
  tier: string;
  lastActive: string;
  featuresUsed: string[];
  totalActions: number;
}

interface DailyActivesData {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  trend: { date: string; count: number }[];
  todayUsers: DailyActiveUser[];
  yesterdayUsers: DailyActiveUser[];
  weekUsers: DailyActiveUser[];
  monthUsers: DailyActiveUser[];
}

type ActivePeriod = 'today' | 'yesterday' | 'week' | 'month';

interface GrowthMetrics {
  cohorts: CohortData[];
  funnel: FunnelData;
  ltv: LTVData;
  userHealth: UserHealthData;
  churnRiskUsers: ChurnRiskUser[];
  quickWins: QuickWin[];
  dailyActives: DailyActivesData;
  generatedAt: string;
  // Drill-down data
  userLists?: {
    powerUsers?: DrillDownUser[];
    activeUsers?: DrillDownUser[];
    atRiskUsers?: DrillDownUser[];
    dormantUsers?: DrillDownUser[];
    trialUsers?: DrillDownUser[];
    paidUsers?: DrillDownUser[];
    recentSignups?: DrillDownUser[];
  };
}

interface DrillDownUser {
  id: string;
  name: string;
  email: string;
  tier: string;
  createdAt: string;
  lastActive?: string;
  engagement?: number;
  features?: number;
}

type DrillDownType =
  | 'powerUsers' | 'activeUsers' | 'atRiskUsers' | 'dormantUsers'
  | 'trialUsers' | 'paidUsers' | 'recentSignups' | 'funnelSignups'
  | 'funnelOnboarded' | 'funnelTrial' | 'funnelEngaged' | 'funnelConverted'
  | null;

export default function GrowthCommandCenter() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dailyActives: true,
    cohorts: true,
    funnel: true,
    ltv: true,
    health: true,
    churn: true,
    quickWins: true,
  });
  const [activePeriod, setActivePeriod] = useState<ActivePeriod>('today');
  const [drillDown, setDrillDown] = useState<{
    type: DrillDownType;
    title: string;
    users: DrillDownUser[];
    loading: boolean;
  }>({ type: null, title: '', users: [], loading: false });
  const { getPassword } = useAdminAuth();

  const fetchDrillDown = async (type: DrillDownType, title: string) => {
    if (!type) return;
    setDrillDown({ type, title, users: [], loading: true });
    try {
      const password = getPassword();
      const response = await fetch(`/api/admin/growth-metrics/drilldown?type=${type}`, {
        headers: { 'X-Admin-Password': password },
      });
      const data = await response.json();
      if (data.success) {
        setDrillDown({ type, title, users: data.users || [], loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch drill-down:', error);
      setDrillDown(prev => ({ ...prev, loading: false }));
    }
  };

  const closeDrillDown = () => {
    setDrillDown({ type: null, title: '', users: [], loading: false });
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const password = getPassword();
      const response = await fetch('/api/admin/growth-metrics', {
        headers: { 'X-Admin-Password': password },
      });
      const data = await response.json();
      if (data.success) {
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch growth metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getRetentionColor = (rate: number) => {
    if (rate >= 40) return 'bg-emerald-500/30 text-emerald-400';
    if (rate >= 25) return 'bg-yellow-500/30 text-yellow-400';
    if (rate >= 10) return 'bg-orange-500/30 text-orange-400';
    return 'bg-red-500/30 text-red-400';
  };

  const formatWeek = (weekStr: string) => {
    const date = new Date(weekStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <AdminSidebar>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              Growth Command Center
            </h1>
            <p className="text-white/50 mt-1">
              Unified view of retention, conversion, and revenue metrics
            </p>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white/70 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && !metrics ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-white/30 animate-spin" />
          </div>
        ) : metrics ? (
          <div className="space-y-6">
            {/* Top KPIs Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => fetchDrillDown('paidUsers', 'Paid Subscribers')}
                className="bg-gradient-to-br from-emerald-900/30 to-[#1B1F39] border border-emerald-500/20 hover:border-emerald-400/40 rounded-2xl p-5 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-white/50">Avg LTV</span>
                </div>
                <p className="text-3xl font-bold text-emerald-400">
                  ${metrics.ltv.averageLTV.toFixed(2)}
                </p>
                <p className="text-xs text-white/40 mt-1">per paying customer</p>
              </button>

              <button
                onClick={() => fetchDrillDown('funnelConverted', 'Converted to Paid (30d)')}
                className="bg-gradient-to-br from-blue-900/30 to-[#1B1F39] border border-blue-500/20 hover:border-blue-400/40 rounded-2xl p-5 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-white/50">Conversion Rate</span>
                </div>
                <p className="text-3xl font-bold text-blue-400">
                  {metrics.funnel.conversionRate}%
                </p>
                <p className="text-xs text-white/40 mt-1">signup to paid (30d)</p>
              </button>

              <button
                onClick={() => fetchDrillDown('activeUsers', 'Active Users')}
                className="bg-gradient-to-br from-purple-900/30 to-[#1B1F39] border border-purple-500/20 hover:border-purple-400/40 rounded-2xl p-5 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-white/50">Active Users</span>
                </div>
                <p className="text-3xl font-bold text-purple-400">
                  {metrics.userHealth.powerUsers + metrics.userHealth.activeUsers}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {metrics.userHealth.powerUsers} power users
                </p>
              </button>

              <button
                onClick={() => fetchDrillDown('atRiskUsers', 'At Risk Users')}
                className="bg-gradient-to-br from-orange-900/30 to-[#1B1F39] border border-orange-500/20 hover:border-orange-400/40 rounded-2xl p-5 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-white/50">At Risk</span>
                </div>
                <p className="text-3xl font-bold text-orange-400">
                  {metrics.userHealth.atRiskUsers}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {metrics.churnRiskUsers.filter(u => u.riskLevel === 'high').length} high priority
                </p>
              </button>
            </div>

            {/* Daily Actives Section */}
            {metrics.dailyActives && (
              <div className="bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('dailyActives')}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-xl">
                      <Activity className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-white">Daily Actives</h2>
                      <p className="text-xs text-white/40">Users active today and recent trends</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-400">{metrics.dailyActives.today}</span>
                      <span className="text-sm text-white/50 ml-2">today</span>
                    </div>
                    {expandedSections.dailyActives ? (
                      <ChevronUp className="w-5 h-5 text-white/40" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                </button>

                {expandedSections.dailyActives && (
                  <div className="p-5 pt-0">
                    {/* DAU/WAU/MAU Stats - Clickable Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-5">
                      <button
                        onClick={() => setActivePeriod('today')}
                        className={`text-left rounded-xl p-4 border transition-all ${
                          activePeriod === 'today'
                            ? 'bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/50 ring-2 ring-green-500/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-white/50">Today</span>
                          {metrics.dailyActives.yesterday > 0 && (
                            <span className={`text-xs flex items-center gap-0.5 ${
                              metrics.dailyActives.today >= metrics.dailyActives.yesterday
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {metrics.dailyActives.today >= metrics.dailyActives.yesterday ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                              {Math.abs(Math.round(((metrics.dailyActives.today - metrics.dailyActives.yesterday) / metrics.dailyActives.yesterday) * 100))}%
                            </span>
                          )}
                        </div>
                        <p className={`text-3xl font-bold ${activePeriod === 'today' ? 'text-green-400' : 'text-white'}`}>
                          {metrics.dailyActives.today}
                        </p>
                        <p className="text-xs text-white/30 mt-1">DAU</p>
                      </button>

                      <button
                        onClick={() => setActivePeriod('yesterday')}
                        className={`text-left rounded-xl p-4 border transition-all ${
                          activePeriod === 'yesterday'
                            ? 'bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/50 ring-2 ring-blue-500/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs text-white/50">Yesterday</span>
                        <p className={`text-3xl font-bold mt-1 ${activePeriod === 'yesterday' ? 'text-blue-400' : 'text-white'}`}>
                          {metrics.dailyActives.yesterday}
                        </p>
                        <p className="text-xs text-white/30 mt-1">DAU</p>
                      </button>

                      <button
                        onClick={() => setActivePeriod('week')}
                        className={`text-left rounded-xl p-4 border transition-all ${
                          activePeriod === 'week'
                            ? 'bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/50 ring-2 ring-purple-500/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs text-white/50">This Week</span>
                        <p className={`text-3xl font-bold mt-1 ${activePeriod === 'week' ? 'text-purple-400' : 'text-white'}`}>
                          {metrics.dailyActives.thisWeek}
                        </p>
                        <p className="text-xs text-white/30 mt-1">WAU (7d)</p>
                      </button>

                      <button
                        onClick={() => setActivePeriod('month')}
                        className={`text-left rounded-xl p-4 border transition-all ${
                          activePeriod === 'month'
                            ? 'bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/50 ring-2 ring-orange-500/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs text-white/50">This Month</span>
                        <p className={`text-3xl font-bold mt-1 ${activePeriod === 'month' ? 'text-orange-400' : 'text-white'}`}>
                          {metrics.dailyActives.thisMonth}
                        </p>
                        <p className="text-xs text-white/30 mt-1">MAU (30d)</p>
                      </button>
                    </div>

                    {/* 30-Day DAU Trend Chart */}
                    <div className="mb-5">
                      <h3 className="text-sm font-medium text-white/70 mb-3">30-Day DAU Trend</h3>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-end justify-between h-24 gap-1">
                          {metrics.dailyActives.trend.map((day, i) => {
                            const maxCount = Math.max(...metrics.dailyActives.trend.map(d => d.count), 1);
                            const height = (day.count / maxCount) * 100;
                            const isToday = i === metrics.dailyActives.trend.length - 1;
                            return (
                              <div
                                key={day.date}
                                className="flex-1 group relative"
                              >
                                <div
                                  className={`rounded-t transition-all ${
                                    isToday ? 'bg-green-500' : 'bg-white/20 hover:bg-white/30'
                                  }`}
                                  style={{ height: `${Math.max(height, 4)}%` }}
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                  <div className="bg-[#1B1F39] border border-white/20 rounded-lg px-2 py-1 text-xs whitespace-nowrap">
                                    <p className="text-white font-medium">{day.count} users</p>
                                    <p className="text-white/50">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-white/30">
                          <span>{new Date(metrics.dailyActives.trend[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span>Today</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Users List - Dynamic based on selected period */}
                    <div>
                      {(() => {
                        const periodConfig = {
                          today: {
                            label: 'Active Today',
                            users: metrics.dailyActives.todayUsers,
                            emptyMessage: 'No active users yet today',
                            color: 'green',
                          },
                          yesterday: {
                            label: 'Active Yesterday',
                            users: metrics.dailyActives.yesterdayUsers,
                            emptyMessage: 'No users were active yesterday',
                            color: 'blue',
                          },
                          week: {
                            label: 'Active This Week',
                            users: metrics.dailyActives.weekUsers,
                            emptyMessage: 'No users active this week',
                            color: 'purple',
                          },
                          month: {
                            label: 'Active This Month',
                            users: metrics.dailyActives.monthUsers,
                            emptyMessage: 'No users active this month',
                            color: 'orange',
                          },
                        };
                        const config = periodConfig[activePeriod];
                        const colorClasses = {
                          green: 'text-green-400 bg-green-500/10',
                          blue: 'text-blue-400 bg-blue-500/10',
                          purple: 'text-purple-400 bg-purple-500/10',
                          orange: 'text-orange-400 bg-orange-500/10',
                        };

                        return (
                          <>
                            <h3 className="text-sm font-medium text-white/70 mb-3">
                              {config.label} ({config.users?.length || 0} users)
                            </h3>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                              {!config.users || config.users.length === 0 ? (
                                <p className="text-center text-white/40 py-6">{config.emptyMessage}</p>
                              ) : (
                                config.users.map((user) => (
                                  <div
                                    key={user.id}
                                    className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          user.tier === 'pro'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : user.tier === 'trial'
                                            ? 'bg-cyan-500/20 text-cyan-400'
                                            : 'bg-white/10 text-white/50'
                                        }`}>
                                          {user.tier}
                                        </span>
                                      </div>
                                      <p className="text-xs text-white/50 truncate">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-3">
                                      <div className="text-right hidden sm:block">
                                        <p className="text-xs text-white/60">
                                          {user.featuresUsed.slice(0, 2).join(', ')}
                                          {user.featuresUsed.length > 2 && ` +${user.featuresUsed.length - 2}`}
                                        </p>
                                        <p className="text-xs text-white/30">
                                          {user.totalActions} actions
                                        </p>
                                      </div>
                                      <span className={`text-xs px-2 py-1 rounded ${colorClasses[config.color as keyof typeof colorClasses]}`}>
                                        {activePeriod === 'today' || activePeriod === 'yesterday'
                                          ? new Date(user.lastActive).toLocaleTimeString('en-US', {
                                              hour: 'numeric',
                                              minute: '2-digit',
                                              hour12: true
                                            })
                                          : new Date(user.lastActive).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric'
                                            })
                                        }
                                      </span>
                                      <a
                                        href={`/admin/users?search=${encodeURIComponent(user.email)}`}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                        title="View user"
                                      >
                                        <ExternalLink className="w-4 h-4 text-white/50" />
                                      </a>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Conversion Funnel */}
            <div className="bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('funnel')}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-white">Conversion Funnel</h2>
                    <p className="text-xs text-white/40">Last 30 days signup journey</p>
                  </div>
                </div>
                {expandedSections.funnel ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>

              {expandedSections.funnel && (
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between gap-2">
                    {/* Signup */}
                    <button
                      onClick={() => fetchDrillDown('funnelSignups', 'Recent Signups (30d)')}
                      className="flex-1 text-center cursor-pointer group"
                    >
                      <div className="bg-white/10 rounded-xl p-4 mb-2 group-hover:bg-white/15 transition-colors">
                        <p className="text-2xl font-bold text-white">{metrics.funnel.signups}</p>
                        <p className="text-xs text-white/50">Signups</p>
                      </div>
                      <p className="text-xs text-white/30">100%</p>
                    </button>

                    <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />

                    {/* Onboarded */}
                    <div className="flex-1 text-center relative">
                      <button
                        onClick={() => fetchDrillDown('funnelOnboarded', 'Onboarded Users (30d)')}
                        className="w-full cursor-pointer group"
                      >
                        <div className="bg-cyan-500/20 rounded-xl p-4 mb-2 border border-cyan-500/30 group-hover:border-cyan-400/50 transition-colors relative">
                          <p className="text-2xl font-bold text-cyan-400">{metrics.funnel.onboarded}</p>
                          <p className="text-xs text-white/50">Onboarded</p>
                          {/* Info tooltip */}
                          <div className="absolute top-1 right-1 group/info">
                            <Info className="w-3.5 h-3.5 text-white/30 hover:text-cyan-400 transition-colors" />
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-[#1B1F39] border border-white/20 rounded-lg text-left opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 shadow-xl">
                              <p className="text-xs text-white/70">Users who engaged with at least one feature within 24 hours of signing up.</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-cyan-400">{metrics.funnel.onboardingRate}%</p>
                      </button>
                    </div>

                    <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />

                    {/* Trial Started */}
                    <button
                      onClick={() => fetchDrillDown('funnelTrial', 'Trial Users (30d)')}
                      className="flex-1 text-center cursor-pointer group"
                    >
                      <div className="bg-purple-500/20 rounded-xl p-4 mb-2 border border-purple-500/30 group-hover:border-purple-400/50 transition-colors">
                        <p className="text-2xl font-bold text-purple-400">{metrics.funnel.trialStarted}</p>
                        <p className="text-xs text-white/50">Trial</p>
                      </div>
                      <p className="text-xs text-purple-400">{metrics.funnel.trialRate}%</p>
                    </button>

                    <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />

                    {/* Engaged */}
                    <button
                      onClick={() => fetchDrillDown('funnelEngaged', 'Engaged Users (3+ features)')}
                      className="flex-1 text-center cursor-pointer group"
                    >
                      <div className="bg-orange-500/20 rounded-xl p-4 mb-2 border border-orange-500/30 group-hover:border-orange-400/50 transition-colors">
                        <p className="text-2xl font-bold text-orange-400">{metrics.funnel.engaged}</p>
                        <p className="text-xs text-white/50">Engaged (3+ features)</p>
                      </div>
                      <p className="text-xs text-orange-400">{metrics.funnel.engagementRate}%</p>
                    </button>

                    <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />

                    {/* Converted */}
                    <button
                      onClick={() => fetchDrillDown('funnelConverted', 'Converted to Paid (30d)')}
                      className="flex-1 text-center cursor-pointer group"
                    >
                      <div className="bg-emerald-500/20 rounded-xl p-4 mb-2 border border-emerald-500/30 group-hover:border-emerald-400/50 transition-colors">
                        <p className="text-2xl font-bold text-emerald-400">{metrics.funnel.converted}</p>
                        <p className="text-xs text-white/50">Paid</p>
                      </div>
                      <p className="text-xs text-emerald-400">{metrics.funnel.conversionRate}%</p>
                    </button>
                  </div>

                  {/* Funnel Drop-off Analysis */}
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-xs text-white/40">Signup → Onboard</p>
                      <p className="text-sm font-medium text-white">
                        -{100 - metrics.funnel.onboardingRate}% drop
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-xs text-white/40">Onboard → Trial</p>
                      <p className="text-sm font-medium text-white">
                        -{metrics.funnel.onboardingRate > 0
                          ? Math.round(((metrics.funnel.onboarded - metrics.funnel.trialStarted) / metrics.funnel.onboarded) * 100)
                          : 0}% drop
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-xs text-white/40">Trial → Engaged</p>
                      <p className="text-sm font-medium text-white">
                        -{metrics.funnel.trialStarted > 0
                          ? Math.round(((metrics.funnel.trialStarted - metrics.funnel.engaged) / metrics.funnel.trialStarted) * 100)
                          : 0}% drop
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-xs text-white/40">Engaged → Paid</p>
                      <p className="text-sm font-medium text-white">
                        -{metrics.funnel.engaged > 0
                          ? Math.round(((metrics.funnel.engaged - metrics.funnel.converted) / metrics.funnel.engaged) * 100)
                          : 0}% drop
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Retention Cohorts */}
            <div className="bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('cohorts')}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-white">Retention Cohorts</h2>
                    <p className="text-xs text-white/40">Weekly signup cohorts & retention rates</p>
                  </div>
                </div>
                {expandedSections.cohorts ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>

              {expandedSections.cohorts && (
                <div className="p-5 pt-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-white/40 text-xs">
                        <th className="text-left py-2 px-3">Week</th>
                        <th className="text-center py-2 px-3">Signups</th>
                        <th className="text-center py-2 px-3">D1</th>
                        <th className="text-center py-2 px-3">D7</th>
                        <th className="text-center py-2 px-3">D14</th>
                        <th className="text-center py-2 px-3">D30</th>
                        <th className="text-center py-2 px-3">Converted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.cohorts.slice(-8).map((cohort) => (
                        <tr key={cohort.week} className="border-t border-white/5">
                          <td className="py-3 px-3 text-white font-medium">
                            {formatWeek(cohort.week)}
                          </td>
                          <td className="py-3 px-3 text-center text-white/70">
                            {cohort.signups}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRetentionColor(cohort.d1Rate)}`}>
                              {cohort.d1Rate}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRetentionColor(cohort.d7Rate)}`}>
                              {cohort.d7Rate}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRetentionColor(cohort.d14Rate)}`}>
                              {cohort.d14Rate}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRetentionColor(cohort.d30Rate)}`}>
                              {cohort.d30Rate}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400">
                              {cohort.conversionRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Retention Legend */}
                  <div className="flex items-center gap-4 mt-4 text-xs text-white/40">
                    <span>Retention Quality:</span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-emerald-500/30" /> 40%+ Great
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-yellow-500/30" /> 25-40% Good
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-orange-500/30" /> 10-25% Needs Work
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-red-500/30" /> &lt;10% Critical
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* LTV by Source */}
            <div className="bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('ltv')}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-white">LTV by Acquisition Source</h2>
                    <p className="text-xs text-white/40">Lifetime value breakdown</p>
                  </div>
                </div>
                {expandedSections.ltv ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>

              {expandedSections.ltv && (
                <div className="p-5 pt-0">
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(metrics.ltv.bySource).map(([source, data]) => (
                      <div
                        key={source}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-white/50 capitalize">{source}</span>
                          <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/40">
                            {data.users} users
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          ${data.avgLtv.toFixed(2)}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          ${data.revenue.toFixed(2)} total revenue
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/50">Total Revenue (All Time)</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          ${metrics.ltv.totalRevenue.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/50">Paying Customers</p>
                        <p className="text-2xl font-bold text-white">{metrics.ltv.paidUsers}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Health Distribution */}
            <div className="bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('health')}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-xl">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-white">User Health Distribution</h2>
                    <p className="text-xs text-white/40">Engagement segments</p>
                  </div>
                </div>
                {expandedSections.health ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>

              {expandedSections.health && (
                <div className="p-5 pt-0">
                  <div className="grid grid-cols-4 gap-4">
                    <button
                      onClick={() => fetchDrillDown('powerUsers', 'Power Users')}
                      className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl p-4 border border-purple-500/30 hover:border-purple-400/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-white/50">Power Users</span>
                      </div>
                      <p className="text-3xl font-bold text-purple-400">{metrics.userHealth.powerUsers}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {metrics.userHealth.total > 0
                          ? Math.round((metrics.userHealth.powerUsers / metrics.userHealth.total) * 100)
                          : 0}% of base
                      </p>
                    </button>

                    <button
                      onClick={() => fetchDrillDown('activeUsers', 'Active Users')}
                      className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl p-4 border border-emerald-500/30 hover:border-emerald-400/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-white/50">Active</span>
                      </div>
                      <p className="text-3xl font-bold text-emerald-400">{metrics.userHealth.activeUsers}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {metrics.userHealth.total > 0
                          ? Math.round((metrics.userHealth.activeUsers / metrics.userHealth.total) * 100)
                          : 0}% of base
                      </p>
                    </button>

                    <button
                      onClick={() => fetchDrillDown('atRiskUsers', 'At Risk Users')}
                      className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl p-4 border border-orange-500/30 hover:border-orange-400/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-white/50">At Risk</span>
                      </div>
                      <p className="text-3xl font-bold text-orange-400">{metrics.userHealth.atRiskUsers}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {metrics.userHealth.total > 0
                          ? Math.round((metrics.userHealth.atRiskUsers / metrics.userHealth.total) * 100)
                          : 0}% of base
                      </p>
                    </button>

                    <button
                      onClick={() => fetchDrillDown('dormantUsers', 'Dormant Users')}
                      className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-xl p-4 border border-red-500/30 hover:border-red-400/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <UserMinus className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-white/50">Dormant</span>
                      </div>
                      <p className="text-3xl font-bold text-red-400">{metrics.userHealth.dormantUsers}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {metrics.userHealth.total > 0
                          ? Math.round((metrics.userHealth.dormantUsers / metrics.userHealth.total) * 100)
                          : 0}% of base
                      </p>
                    </button>
                  </div>

                  {/* Health Bar */}
                  <div className="mt-4 h-4 rounded-full overflow-hidden flex bg-white/5">
                    <div
                      className="bg-purple-500 transition-all"
                      style={{
                        width: `${metrics.userHealth.total > 0
                          ? (metrics.userHealth.powerUsers / metrics.userHealth.total) * 100
                          : 0}%`,
                      }}
                    />
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{
                        width: `${metrics.userHealth.total > 0
                          ? (metrics.userHealth.activeUsers / metrics.userHealth.total) * 100
                          : 0}%`,
                      }}
                    />
                    <div
                      className="bg-orange-500 transition-all"
                      style={{
                        width: `${metrics.userHealth.total > 0
                          ? (metrics.userHealth.atRiskUsers / metrics.userHealth.total) * 100
                          : 0}%`,
                      }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{
                        width: `${metrics.userHealth.total > 0
                          ? (metrics.userHealth.dormantUsers / metrics.userHealth.total) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Two Column Layout: Churn Risk + Quick Wins */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Churn Risk Users */}
              <div className="bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('churn')}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-white">Churn Risk</h2>
                      <p className="text-xs text-white/40">Pro users at risk of churning</p>
                    </div>
                  </div>
                  {expandedSections.churn ? (
                    <ChevronUp className="w-5 h-5 text-white/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40" />
                  )}
                </button>

                {expandedSections.churn && (
                  <div className="p-5 pt-0 space-y-2 max-h-80 overflow-y-auto">
                    {metrics.churnRiskUsers.length === 0 ? (
                      <p className="text-center text-white/40 py-4">No at-risk users found</p>
                    ) : (
                      metrics.churnRiskUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate">{user.name || 'Unknown'}</p>
                              {user.isTrial && (
                                <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                                  Trial
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/50 truncate">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.riskLevel === 'high'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-orange-500/20 text-orange-400'
                              }`}
                            >
                              {user.riskReason}
                            </span>
                            <a
                              href={`mailto:${user.email}`}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                              title="Send email"
                            >
                              <Mail className="w-4 h-4 text-blue-400" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Quick Wins (High-Engagement Free Users) */}
              <div className="bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('quickWins')}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-white">Quick Wins</h2>
                      <p className="text-xs text-white/40">High-engagement free users ready to convert</p>
                    </div>
                  </div>
                  {expandedSections.quickWins ? (
                    <ChevronUp className="w-5 h-5 text-white/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40" />
                  )}
                </button>

                {expandedSections.quickWins && (
                  <div className="p-5 pt-0 space-y-2 max-h-80 overflow-y-auto">
                    {metrics.quickWins.length === 0 ? (
                      <p className="text-center text-white/40 py-4">No quick wins identified</p>
                    ) : (
                      metrics.quickWins.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{user.name || 'Unknown'}</p>
                            <p className="text-xs text-white/50 truncate">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <div className="text-right">
                              <p className="text-xs text-white/40">{user.featureCount} features</p>
                              <p className="text-xs text-emerald-400">{user.engagement} actions</p>
                            </div>
                            <a
                              href={`mailto:${user.email}?subject=Special%20Offer%20for%20Mind%20%26%20Muscle%20Pro`}
                              className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
                              title="Send offer"
                            >
                              <Gift className="w-4 h-4 text-emerald-400" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-white/30 pt-4">
              Data generated at {metrics.generatedAt ? new Date(metrics.generatedAt).toLocaleString() : 'N/A'}
            </div>
          </div>
        ) : (
          <div className="text-center text-white/40 py-12">
            Failed to load growth metrics
          </div>
        )}

        {/* Drill-Down Modal */}
        {drillDown.type && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0F1123] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-semibold text-white">{drillDown.title}</h3>
                  <p className="text-sm text-white/50">{drillDown.users.length} users</p>
                </div>
                <button
                  onClick={closeDrillDown}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5">
                {drillDown.loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 text-white/30 animate-spin" />
                  </div>
                ) : drillDown.users.length === 0 ? (
                  <div className="text-center text-white/40 py-12">
                    No users found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {drillDown.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">
                              {user.name}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              user.tier === 'pro'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : user.tier === 'trial'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-white/10 text-white/50'
                            }`}>
                              {user.tier}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 truncate">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <div className="text-right hidden sm:block">
                            {user.features !== undefined && (
                              <p className="text-xs text-white/40">
                                {user.features} features
                              </p>
                            )}
                            {user.lastActive && (
                              <p className="text-xs text-white/30">
                                Last active: {new Date(user.lastActive).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${user.email}`}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                              title="Send email"
                            >
                              <Mail className="w-4 h-4 text-blue-400" />
                            </a>
                            <a
                              href={`/admin/users?search=${encodeURIComponent(user.email)}`}
                              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                              title="View user"
                            >
                              <ExternalLink className="w-4 h-4 text-white/50" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-xs text-white/30">
                  Click on a user to view their full profile
                </p>
                <button
                  onClick={closeDrillDown}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
