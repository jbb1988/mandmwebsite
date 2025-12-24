'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CreditCard,
  AlertTriangle,
  Mail,
  Gift,
  ChevronRight,
  RefreshCw,
  XCircle,
  CheckCircle,
  Database,
  Cloud,
  AlertCircle,
} from 'lucide-react';

interface SubscriptionRevenue {
  total: number;
  last30Days: number;
  last7Days: number;
  newSubscribers: number;
  renewals: number;
  cancellations: number;
}

interface RevenueStats {
  totalUsers: number;
  paidSubscribers: number;
  activeTrials: number;
  expiringTrials: number;
  freeUsers: number;
  estimatedMRR: string;
  revenueLast28Days: string;
  subscriptionRevenue: SubscriptionRevenue;
  creditRevenue: {
    total: number;
    last30Days: number;
    last7Days: number;
    count: number;
  };
  conversionRate: string;
}

interface ExpiringTrial {
  id: string;
  name: string;
  email: string;
  expiresAt: string;
  daysRemaining: number;
}

interface ActivityItem {
  type: string;
  user: string;
  email: string;
  amount?: number;
  date: string;
  details?: string;
}

interface Props {
  onEmailUser?: (email: string) => void;
  onGrantTrial?: (userId: string) => void;
}

export default function RevenueDashboard({ onEmailUser, onGrantTrial }: Props) {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [expiringTrials, setExpiringTrials] = useState<ExpiringTrial[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'revenuecat' | 'database' | 'estimated'>('estimated');
  const [revenueCatConfigured, setRevenueCatConfigured] = useState(false);
  const { getPassword } = useAdminAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const password = getPassword();
      const response = await fetch('/api/admin/revenue-stats', {
        headers: { 'X-Admin-Password': password },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setExpiringTrials(data.expiringTrialsDetails || []);
        setRecentActivity(data.recentActivity || []);
        setDataSource(data.dataSource || 'estimated');
        setRevenueCatConfigured(data.revenueCatConfigured || false);
      }
    } catch (error) {
      console.error('Failed to fetch revenue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDataSourceIndicator = () => {
    switch (dataSource) {
      case 'revenuecat':
        return {
          icon: Cloud,
          label: 'RevenueCat API',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20',
        };
      case 'database':
        return {
          icon: Database,
          label: 'Subscription Events',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Estimated (Profile Data)',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
        };
    }
  };

  const sourceInfo = getDataSourceIndicator();
  const SourceIcon = sourceInfo.icon;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] rounded-2xl p-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 text-white/30 animate-spin" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'renewal':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      case 'cancellation':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'expiration':
        return <Clock className="w-4 h-4 text-orange-400" />;
      case 'credit_purchase':
        return <DollarSign className="w-4 h-4 text-purple-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-white/50" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'bg-emerald-500/20';
      case 'renewal':
        return 'bg-blue-500/20';
      case 'cancellation':
        return 'bg-red-500/20';
      case 'expiration':
        return 'bg-orange-500/20';
      case 'credit_purchase':
        return 'bg-purple-500/20';
      default:
        return 'bg-white/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Revenue Card */}
      <div className="bg-gradient-to-br from-emerald-900/20 to-[#1B1F39] border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Revenue Dashboard</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${sourceInfo.bgColor}`}>
                  <SourceIcon className={`w-3 h-3 ${sourceInfo.color}`} />
                  <span className={`text-xs ${sourceInfo.color}`}>{sourceInfo.label}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-white/50 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Data Source Warning */}
        {dataSource === 'estimated' && !revenueCatConfigured && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-orange-300">
                <p className="font-medium">Revenue data is estimated from profile data</p>
                <p className="text-orange-400/70 mt-0.5">
                  Add REVENUECAT_SECRET_API_KEY and REVENUECAT_PROJECT_ID to get accurate data.
                  Future subscription events will be logged automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-white/50">
                {dataSource === 'revenuecat' ? 'MRR' : 'Est. MRR'}
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">${stats.estimatedMRR}</p>
            {parseFloat(stats.revenueLast28Days) > 0 && (
              <p className="text-xs text-white/40 mt-1">
                ${stats.revenueLast28Days} last 28d
              </p>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-white/50">Paid Subscribers</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.paidSubscribers}</p>
            {stats.subscriptionRevenue?.newSubscribers > 0 && (
              <p className="text-xs text-emerald-400 mt-1">
                +{stats.subscriptionRevenue.newSubscribers} new (30d)
              </p>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-white/50">Active Trials</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{stats.activeTrials}</p>
            {stats.expiringTrials > 0 && (
              <p className="text-xs text-orange-400 mt-1">
                {stats.expiringTrials} expiring soon
              </p>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-white/60" />
              <span className="text-xs text-white/50">Conversion</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
            {stats.subscriptionRevenue?.cancellations > 0 && (
              <p className="text-xs text-red-400 mt-1">
                {stats.subscriptionRevenue.cancellations} churned (30d)
              </p>
            )}
          </div>
        </div>

        {/* Subscription Revenue Breakdown */}
        {stats.subscriptionRevenue && stats.subscriptionRevenue.total > 0 && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white">Subscription Revenue</p>
              <p className="text-xl font-bold text-emerald-400">
                ${stats.subscriptionRevenue.total.toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-white/40">Last 7 days</p>
                <p className="text-sm font-medium text-white">
                  ${stats.subscriptionRevenue.last7Days.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40">Last 30 days</p>
                <p className="text-sm font-medium text-white">
                  ${stats.subscriptionRevenue.last30Days.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40">Renewals (30d)</p>
                <p className="text-sm font-medium text-white">
                  {stats.subscriptionRevenue.renewals}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Credit Revenue */}
        {stats.creditRevenue.count > 0 && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50 mb-1">Swing Lab Credit Revenue</p>
                <p className="text-xl font-bold text-white">${stats.creditRevenue.total.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">Last 30 days</p>
                <p className="text-lg font-semibold text-emerald-400">
                  ${stats.creditRevenue.last30Days.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Breakdown */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-white/40">
              <span className="text-white font-medium">{stats.totalUsers}</span> total users
            </span>
            <span className="text-white/40">
              <span className="text-white font-medium">{stats.freeUsers}</span> free
            </span>
          </div>
        </div>
      </div>

      {/* Expiring Trials Alert */}
      {expiringTrials.length > 0 && (
        <div className="bg-gradient-to-br from-orange-900/20 to-[#1B1F39] border border-orange-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Trials Expiring Soon</h3>
              <p className="text-xs text-orange-400">{expiringTrials.length} trial(s) expiring in 7 days</p>
            </div>
          </div>

          <div className="space-y-2">
            {expiringTrials.map((trial) => (
              <div
                key={trial.id}
                className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{trial.name}</p>
                  <p className="text-xs text-white/50 truncate">{trial.email}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trial.daysRemaining <= 2
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {trial.daysRemaining}d left
                  </span>
                  {onEmailUser && (
                    <button
                      onClick={() => onEmailUser(trial.email)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                      title="Send email"
                    >
                      <Mail className="w-4 h-4 text-blue-400" />
                    </button>
                  )}
                  {onGrantTrial && (
                    <button
                      onClick={() => onGrantTrial(trial.id)}
                      className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
                      title="Extend trial"
                    >
                      <Gift className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-[#0F1123]/80 border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <a
              href="/admin/users"
              className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2">
            {recentActivity.slice(0, 5).map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${getActivityBgColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{activity.user}</p>
                    <p className="text-xs text-white/40">{activity.details}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  {activity.amount && (
                    <p className={`text-sm font-medium ${
                      activity.type === 'cancellation' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {activity.type === 'cancellation' ? '-' : '+'}${activity.amount.toFixed(2)}
                    </p>
                  )}
                  <p className="text-xs text-white/30">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
