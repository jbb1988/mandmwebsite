'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Users, Search, Filter, ChevronLeft, ChevronRight,
  Loader2, Mail, Calendar, Clock, Crown, User, X,
  FileDown
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
  computedStatus: string;
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

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tierFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const exportCSV = () => {
    const csvContent = [
      ['Email', 'Name', 'Tier', 'Status', 'Joined', 'Last Login'].join(','),
      ...users.map(u => [
        u.email,
        u.name || '',
        u.tier,
        u.computedStatus,
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

  return (
    <AdminGate title="User Management" description="View and manage all users">
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  User Management
                </h1>
                <p className="text-white/50 mt-1">View and manage all registered users</p>
              </div>
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Admin Navigation */}
            <AdminNav />

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
                        <th className="px-4 py-3 font-medium hidden md:table-cell">Joined</th>
                        <th className="px-4 py-3 font-medium hidden lg:table-cell">Last Login</th>
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
                          <td className="px-4 py-3 text-white/50 hidden md:table-cell">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-white/50 hidden lg:table-cell">
                            {user.last_login_at
                              ? new Date(user.last_login_at).toLocaleDateString()
                              : 'Never'}
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

            {/* User Detail Modal */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card variant="elevated" className="w-full max-w-lg p-6">
                  <div className="flex items-start justify-between mb-6">
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

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/40 mb-1">Name</p>
                        <p className="text-white">{selectedUser.name || 'Not set'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/40 mb-1">Tier</p>
                        <p className="text-white capitalize">{selectedUser.tier}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/40 mb-1">Status</p>
                        {getStatusBadge(selectedUser.computedStatus)}
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/40 mb-1">Sport</p>
                        <p className="text-white capitalize">{selectedUser.sport || 'Not set'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/40 mb-1">Position</p>
                        <p className="text-white">{selectedUser.position || 'Not set'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/40 mb-1">Joined</p>
                        <p className="text-white">
                          {new Date(selectedUser.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </div>
                      <p className="text-white break-all">{selectedUser.email}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                        <Calendar className="w-3 h-3" />
                        Last Login
                      </div>
                      <p className="text-white">
                        {selectedUser.last_login_at
                          ? new Date(selectedUser.last_login_at).toLocaleString()
                          : 'Never logged in'}
                      </p>
                    </div>

                    {selectedUser.promo_tier_expires_at && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-amber-400 mb-1">
                          <Clock className="w-3 h-3" />
                          Trial Expires
                        </div>
                        <p className="text-amber-400">
                          {new Date(selectedUser.promo_tier_expires_at).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-white/30 bg-white/[0.02] rounded-lg p-3">
                      User ID: {selectedUser.id}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                    >
                      Close
                    </button>
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
