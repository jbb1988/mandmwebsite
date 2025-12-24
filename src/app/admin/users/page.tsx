'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ExternalLink } from 'lucide-react';
import {
  Users, Search, Filter, ChevronLeft, ChevronRight,
  Loader2, Mail, Calendar, Clock, Crown, User, X,
  FileDown, Smartphone, Gift, Plus, RefreshCw, Ban
} from 'lucide-react';

// Card component
function Card({ children, className = '', variant = 'default' }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}) {
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };

  return (
    <div className={`rounded-xl ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  status: string | null;
  created_at: string;
  last_login_at: string | null;
  promo_tier_expires_at: string | null;
  organization_id: string | null;
  position: string | null;
  sport: string | null;
  app_version: string | null;
  computedStatus: string;
}

interface DetailedUser extends UserProfile {
  app_metadata: Record<string, unknown> | null;
  affiliate_code: string | null;
  referred_at: string | null;
  last_sign_in_at: string | null;
}

interface TrialGrant {
  id: string;
  user_email: string;
  granted_by_admin: string;
  granted_at: string;
  expires_at: string;
  reminder_7_day_sent: boolean;
  reminder_3_day_sent: boolean;
  reminder_1_day_sent: boolean;
}

interface PromoRedemption {
  id: string;
  user_email: string;
  promo_code_id: string;
  redeemed_at: string;
  promo_codes?: {
    code: string;
    discount_percent: number | null;
    tier_duration_days: number | null;
  };
}

interface Stats {
  total: number;
  byTier: {
    core: number;
    pro: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type ModalTab = 'profile' | 'trial' | 'app' | 'activity';

const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

export default function UsersPage() {
  const { getPassword } = useAdminAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [detailedUser, setDetailedUser] = useState<DetailedUser | null>(null);
  const [trialGrants, setTrialGrants] = useState<TrialGrant[]>([]);
  const [promoRedemptions, setPromoRedemptions] = useState<PromoRedemption[]>([]);
  const [modalTab, setModalTab] = useState<ModalTab>('profile');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        search,
        tier: tierFilter,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { 'X-Admin-Password': getPassword() || adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword,
        },
        body: JSON.stringify({ action: 'get-details', userId }),
      });
      const data = await res.json();

      if (data.success) {
        setDetailedUser(data.user);
        setTrialGrants(data.trialGrants || []);
        setPromoRedemptions(data.promoRedemptions || []);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tierFilter, statusFilter]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserDetails(selectedUser.id);
      setModalTab('profile');
    } else {
      setDetailedUser(null);
      setTrialGrants([]);
      setPromoRedemptions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleTrialAction = async (action: string, days?: number) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword,
        },
        body: JSON.stringify({
          action,
          userId: selectedUser.id,
          userEmail: selectedUser.email,
          days,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Refresh user details and list
        await fetchUserDetails(selectedUser.id);
        await fetchUsers(pagination.page);
        // Update selectedUser with new expiration
        if (data.newExpiration || data.expiresAt) {
          setSelectedUser(prev => prev ? {
            ...prev,
            promo_tier_expires_at: data.newExpiration || data.expiresAt,
            tier: action === 'revoke-trial' ? 'core' : 'pro',
            computedStatus: action === 'revoke-trial' ? 'free' : prev.computedStatus,
          } : null);
        } else if (action === 'revoke-trial') {
          setSelectedUser(prev => prev ? {
            ...prev,
            promo_tier_expires_at: null,
            tier: 'core',
            computedStatus: 'free',
          } : null);
        }
      }
    } catch (error) {
      console.error('Trial action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ['Email', 'Name', 'Tier', 'Status', 'App Version', 'Joined', 'Last Login'].join(','),
      ...users.map(u => [
        u.email,
        u.name || '',
        u.tier,
        u.computedStatus,
        u.app_version || '',
        new Date(u.created_at).toLocaleDateString(),
        u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    if (status.startsWith('trial')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3 h-3" />
          {status}
        </span>
      );
    }
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Crown className="w-3 h-3" />
          Paid Pro
        </span>
      );
    }
    if (status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <X className="w-3 h-3" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
        <User className="w-3 h-3" />
        Free
      </span>
    );
  };

  const renderProfileTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/40 mb-1">Name</p>
          <p className="text-white">{detailedUser?.name || selectedUser?.name || 'Not set'}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/40 mb-1">Tier</p>
          <p className="text-white capitalize">{detailedUser?.tier || selectedUser?.tier}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/40 mb-1">Status</p>
          {getStatusBadge(selectedUser?.computedStatus || 'free')}
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/40 mb-1">Sport</p>
          <p className="text-white capitalize">{detailedUser?.sport || selectedUser?.sport || 'Not set'}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/40 mb-1">Position</p>
          <p className="text-white">{detailedUser?.position || selectedUser?.position || 'Not set'}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/40 mb-1">Joined</p>
          <p className="text-white">
            {new Date(selectedUser?.created_at || '').toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-3">
        <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
          <Mail className="w-3 h-3" />
          Email
        </div>
        <p className="text-white break-all">{selectedUser?.email}</p>
      </div>

      <div className="bg-white/5 rounded-lg p-3">
        <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
          <Calendar className="w-3 h-3" />
          Last Login
        </div>
        <p className="text-white">
          {detailedUser?.last_sign_in_at || selectedUser?.last_login_at
            ? new Date(detailedUser?.last_sign_in_at || selectedUser?.last_login_at || '').toLocaleString()
            : 'Never logged in'}
        </p>
      </div>

      {detailedUser?.affiliate_code && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-blue-400 mb-1">
            <Gift className="w-3 h-3" />
            Referred By
          </div>
          <p className="text-blue-400">
            {detailedUser.affiliate_code}
            {detailedUser.referred_at && (
              <span className="text-blue-400/60 text-xs ml-2">
                on {new Date(detailedUser.referred_at).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
      )}

      <div className="text-xs text-white/30 bg-white/[0.02] rounded-lg p-3">
        User ID: {selectedUser?.id}
      </div>
    </div>
  );

  const renderTrialTab = () => {
    const user = detailedUser || selectedUser;
    const isOnTrial = user?.tier === 'pro' && user?.promo_tier_expires_at;
    const isPaidPro = user?.tier === 'pro' && !user?.promo_tier_expires_at;
    const expiresAt = user?.promo_tier_expires_at ? new Date(user.promo_tier_expires_at) : null;
    const isExpired = expiresAt && expiresAt < new Date();
    const daysLeft = expiresAt && !isExpired
      ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <div className="space-y-4">
        {/* Current Status */}
        <div className={`rounded-lg p-4 ${
          isPaidPro ? 'bg-emerald-500/10 border border-emerald-500/20' :
          isOnTrial && !isExpired ? 'bg-amber-500/10 border border-amber-500/20' :
          isExpired ? 'bg-red-500/10 border border-red-500/20' :
          'bg-white/5 border border-white/10'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Current Status</span>
            {getStatusBadge(selectedUser?.computedStatus || 'free')}
          </div>
          {expiresAt && (
            <div className="text-sm mt-2">
              <span className={isExpired ? 'text-red-400' : 'text-amber-400'}>
                {isExpired ? 'Expired' : 'Expires'}: {expiresAt.toLocaleDateString()} ({isExpired ? 'Expired' : `${daysLeft} days left`})
              </span>
            </div>
          )}
          {isPaidPro && (
            <div className="text-sm text-emerald-400 mt-2">
              Paid Pro subscription (no expiration)
            </div>
          )}
        </div>

        {/* Trial Actions */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Trial Actions</h4>
          <div className="flex flex-wrap gap-2">
            {(isOnTrial && !isExpired) ? (
              <>
                <button
                  onClick={() => handleTrialAction('extend-trial', 7)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  +7 Days
                </button>
                <button
                  onClick={() => handleTrialAction('extend-trial', 14)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  +14 Days
                </button>
                <button
                  onClick={() => handleTrialAction('extend-trial', 30)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  +30 Days
                </button>
                <button
                  onClick={() => handleTrialAction('revoke-trial')}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Revoke Trial
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleTrialAction('grant-trial', 7)}
                  disabled={actionLoading || isPaidPro}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Grant 7-Day Trial
                </button>
                <button
                  onClick={() => handleTrialAction('grant-trial', 14)}
                  disabled={actionLoading || isPaidPro}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Grant 14-Day Trial
                </button>
                <button
                  onClick={() => handleTrialAction('grant-trial', 30)}
                  disabled={actionLoading || isPaidPro}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Grant 30-Day Trial
                </button>
              </>
            )}
            {actionLoading && <Loader2 className="w-4 h-4 text-white/50 animate-spin ml-2" />}
          </div>
          {isPaidPro && (
            <p className="text-xs text-white/40 mt-2">User is on paid Pro plan. Cannot modify trial.</p>
          )}
        </div>

        {/* Trial History */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Trial History</h4>
          {trialGrants.length > 0 ? (
            <div className="space-y-2">
              {trialGrants.map((grant) => (
                <div key={grant.id} className="text-sm p-2 bg-white/5 rounded">
                  <div className="flex justify-between">
                    <span className="text-white/70">Granted by: {grant.granted_by_admin}</span>
                    <span className="text-white/50">{new Date(grant.granted_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-white/40 text-xs mt-1">
                    Expired: {new Date(grant.expires_at).toLocaleDateString()}
                    {grant.reminder_7_day_sent && ' • 7d reminder sent'}
                    {grant.reminder_3_day_sent && ' • 3d reminder sent'}
                    {grant.reminder_1_day_sent && ' • 1d reminder sent'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">No trial history recorded</p>
          )}
        </div>

        {/* Promo Code Redemptions */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Promo Code Redemptions</h4>
          {promoRedemptions.length > 0 ? (
            <div className="space-y-2">
              {promoRedemptions.map((redemption) => (
                <div key={redemption.id} className="text-sm p-2 bg-white/5 rounded">
                  <div className="flex justify-between">
                    <span className="text-white font-mono">{redemption.promo_codes?.code || 'Unknown code'}</span>
                    <span className="text-white/50">{new Date(redemption.redeemed_at).toLocaleDateString()}</span>
                  </div>
                  {redemption.promo_codes && (
                    <div className="text-white/40 text-xs mt-1">
                      {redemption.promo_codes.tier_duration_days && `${redemption.promo_codes.tier_duration_days} day trial`}
                      {redemption.promo_codes.discount_percent && `${redemption.promo_codes.discount_percent}% discount`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">No promo codes redeemed</p>
          )}
        </div>
      </div>
    );
  };

  const renderAppInfoTab = () => {
    const appMetadata = detailedUser?.app_metadata || {};

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
              <Smartphone className="w-3 h-3" />
              App Version
            </div>
            <p className="text-white">{detailedUser?.app_version || 'Not available'}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
              <RefreshCw className="w-3 h-3" />
              Last Sign In
            </div>
            <p className="text-white">
              {detailedUser?.last_sign_in_at
                ? new Date(detailedUser.last_sign_in_at).toLocaleString()
                : 'Never'}
            </p>
          </div>
        </div>

        {/* Platform Info from app_metadata */}
        {Object.keys(appMetadata).length > 0 ? (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">App Metadata</h4>
            <div className="space-y-2">
              {Object.entries(appMetadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-white/50">{key}</span>
                  <span className="text-white font-mono text-xs">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">App Metadata</h4>
            <p className="text-sm text-white/40">No app metadata available</p>
            <p className="text-xs text-white/30 mt-2">
              App metadata will be populated when the user logs in from the mobile app.
            </p>
          </div>
        )}

        <div className="bg-white/[0.02] rounded-lg p-3 text-xs text-white/30">
          Note: App version and platform info is populated by the mobile app when users log in.
          Users who haven&apos;t updated to the latest app version may not have this data.
        </div>
      </div>
    );
  };

  return (
    <AdminGate title="User Management" description="View and manage all users">
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">User Management</h1>
                  <p className="text-white/50 text-sm">View and manage all registered users</p>
                </div>
              </div>
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Stats Row */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card variant="elevated" className="p-4 text-center">
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-white/50">Total Users</p>
                </Card>
                <Card variant="elevated" className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{stats.byTier.pro}</p>
                  <p className="text-xs text-white/50">Pro Users</p>
                </Card>
                <Card variant="elevated" className="p-4 text-center">
                  <p className="text-2xl font-bold text-white/60">{stats.byTier.core}</p>
                  <p className="text-xs text-white/50">Free Users</p>
                </Card>
              </div>
            )}

            {/* Search and Filters */}
            <Card variant="default" className="p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by email or name..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    Search
                  </button>
                </form>

                <div className="flex gap-2">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <select
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value)}
                      className="pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="all">All Tiers</option>
                      <option value="pro">Pro</option>
                      <option value="core">Free</option>
                    </select>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Status</option>
                    <option value="trial">Trial</option>
                    <option value="paid">Paid</option>
                    <option value="free">Free</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Users Table */}
            <Card variant="bordered" className="overflow-hidden mb-6">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-white/40 animate-spin mx-auto" />
                  <p className="text-white/50 mt-3">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5">
                      <tr className="text-left text-white/50">
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Tier</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">App Version</th>
                        <th className="px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                        <th className="px-4 py-3 font-medium hidden xl:table-cell">Last Login</th>
                        <th className="px-4 py-3 font-medium w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-white font-medium">{user.email}</p>
                              {user.name && (
                                <p className="text-white/40 text-xs">{user.name}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                              user.tier === 'pro'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-white/5 text-white/50 border border-white/10'
                            }`}>
                              {user.tier === 'pro' ? 'Pro' : 'Free'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(user.computedStatus)}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {user.app_version ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <Smartphone className="w-3 h-3" />
                                {user.app_version}
                              </span>
                            ) : (
                              <span className="text-white/30 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white/50 hidden lg:table-cell">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-white/50 hidden xl:table-cell">
                            {user.last_login_at
                              ? new Date(user.last_login_at).toLocaleDateString()
                              : 'Never'}
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={`mailto:${user.email}?subject=Your Mind %26 Muscle Account`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg inline-flex transition-colors"
                              title="Email user"
                            >
                              <Mail className="w-4 h-4 text-blue-400" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/50">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchUsers(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm text-white/60">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchUsers(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced User Detail Modal */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Modal Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">User Details</h3>
                        <p className="text-sm text-white/50">{selectedUser.email}</p>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-white/50" />
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setModalTab('profile')}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          modalTab === 'profile'
                            ? 'bg-blue-500 text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => setModalTab('trial')}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          modalTab === 'trial'
                            ? 'bg-blue-500 text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        Trial & Subscription
                      </button>
                      <button
                        onClick={() => setModalTab('app')}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          modalTab === 'app'
                            ? 'bg-blue-500 text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        App Info
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto flex-1">
                    {loadingDetails ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {modalTab === 'profile' && renderProfileTab()}
                        {modalTab === 'trial' && renderTrialTab()}
                        {modalTab === 'app' && renderAppInfoTab()}
                      </>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-white/10">
                    <div className="flex justify-between">
                      <a
                        href={`mailto:${selectedUser.email}?subject=Your Mind %26 Muscle Account`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Email User
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
