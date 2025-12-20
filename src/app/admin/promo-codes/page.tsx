'use client';

import { useState, useEffect } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Tag, RefreshCw, Plus, Search, Copy, Check, X, Edit2, Trash2,
  Percent, Gift, Calendar, Users, ChevronDown, ChevronUp
} from 'lucide-react';

// Card component matching admin styling
function Card({ children, className = '', variant = 'default', glow = false }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  glow?: boolean;
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };
  const glowClass = glow ? 'shadow-lg shadow-blue-500/10' : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}>
      {children}
    </div>
  );
}

interface PromoCode {
  code: string;
  description: string;
  discount_percent: number | null;
  grants_tier: string | null;
  tier_duration_days: number | null;
  is_active: boolean;
  max_redemptions: number | null;
  expires_at: string | null;
  created_at: string;
  redemption_count: number;
  computed_status: string;
  is_trial: boolean;
}

interface Stats {
  total: number;
  active: number;
  expired: number;
  depleted: number;
  inactive: number;
  trialCodes: number;
  discountCodes: number;
}

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'trial' | 'discount'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'depleted' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const { getPassword } = useAdminAuth();
  const adminPassword = getPassword();

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/promo-codes', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setCodes(data.codes);
        setStats(data.stats);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch promo codes' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch promo codes' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleCodeStatus = async (code: PromoCode) => {
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          code: code.code,
          updates: { is_active: !code.is_active },
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Code ${code.code} ${code.is_active ? 'deactivated' : 'activated'}` });
        fetchCodes();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update code' });
    }
  };

  const deleteCode = async (code: string) => {
    if (!confirm(`Are you sure you want to delete ${code}?`)) return;

    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchCodes();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete code' });
    }
  };

  // Filter codes
  let filteredCodes = codes;

  if (searchTerm) {
    filteredCodes = filteredCodes.filter(
      (c) =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterType !== 'all') {
    filteredCodes = filteredCodes.filter((c) =>
      filterType === 'trial' ? c.is_trial : !c.is_trial
    );
  }

  if (filterStatus !== 'all') {
    filteredCodes = filteredCodes.filter((c) => c.computed_status === filterStatus);
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400',
      expired: 'bg-yellow-500/20 text-yellow-400',
      depleted: 'bg-orange-500/20 text-orange-400',
      inactive: 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Tag className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Promo Codes</h1>
              <p className="text-white/50 text-sm sm:text-base">Create and manage discount & trial promo codes</p>
            </div>

            {/* Admin Navigation */}
            <AdminNav />

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mb-8">
              <button
                onClick={fetchCodes}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Code
              </button>
            </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {message.text}
              <button
                onClick={() => setMessage(null)}
                className="float-right text-white/60 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <Card className="p-4">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-white/60">Total</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                <div className="text-sm text-white/60">Active</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-yellow-400">{stats.expired}</div>
                <div className="text-sm text-white/60">Expired</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-orange-400">{stats.depleted}</div>
                <div className="text-sm text-white/60">Depleted</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
                <div className="text-sm text-white/60">Inactive</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-purple-400">{stats.trialCodes}</div>
                <div className="text-sm text-white/60">Trial Codes</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-cyan-400">{stats.discountCodes}</div>
                <div className="text-sm text-white/60">Discounts</div>
              </Card>
            </div>
          )}

          {/* Search & Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by code or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="trial">Trial Codes</option>
                <option value="discount">Discount Codes</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="depleted">Depleted</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </Card>

          {/* Codes List */}
          <Card variant="elevated" className="overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">
                Promo Codes ({filteredCodes.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-white/60">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading promo codes...
              </div>
            ) : filteredCodes.length === 0 ? (
              <div className="p-8 text-center text-white/60">
                No promo codes found
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredCodes.map((code) => (
                  <div key={code.code} className="hover:bg-white/5 transition-colors">
                    {/* Main row */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          code.is_trial
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {code.is_trial ? (
                            <Gift className="w-5 h-5" />
                          ) : (
                            <Percent className="w-5 h-5" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">
                              {code.code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(code.code)}
                              className="p-1 text-white/40 hover:text-white transition-colors"
                              title="Copy code"
                            >
                              {copiedCode === code.code ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            {getStatusBadge(code.computed_status)}
                          </div>
                          <div className="text-sm text-white/60 truncate">
                            {code.description || (code.is_trial
                              ? `${code.tier_duration_days}-Day Pro Trial`
                              : `${code.discount_percent}% Discount`)}
                          </div>
                        </div>

                        {/* Redemptions */}
                        <div className="hidden sm:block text-center px-4">
                          <div className="text-lg font-semibold text-white">
                            {code.redemption_count}
                            {code.max_redemptions && (
                              <span className="text-white/40">/{code.max_redemptions}</span>
                            )}
                          </div>
                          <div className="text-xs text-white/40">Uses</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedCode(expandedCode === code.code ? null : code.code)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {expandedCode === code.code ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleCodeStatus(code)}
                          className={`p-2 rounded-lg transition-colors ${
                            code.is_active
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                              : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                          }`}
                          title={code.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {code.is_active ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => deleteCode(code.code)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete code"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedCode === code.code && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-white/5 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-white/40 mb-1">Type</div>
                            <div className="text-white flex items-center gap-1">
                              {code.is_trial ? (
                                <>
                                  <Gift className="w-3 h-3" />
                                  {code.tier_duration_days}-Day Trial
                                </>
                              ) : (
                                <>
                                  <Percent className="w-3 h-3" />
                                  {code.discount_percent}% Off
                                </>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/40 mb-1">Max Uses</div>
                            <div className="text-white flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {code.max_redemptions || 'Unlimited'}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/40 mb-1">Expires</div>
                            <div className="text-white flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {code.expires_at
                                ? new Date(code.expires_at).toLocaleDateString()
                                : 'Never'}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/40 mb-1">Created</div>
                            <div className="text-white">
                              {new Date(code.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateCodeModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchCodes();
              setMessage({ type: 'success', text: 'Promo code created successfully!' });
            }}
            adminPassword={adminPassword}
          />
        )}
          </div>
        </div>
      </div>
    </AdminGate>
  );
}

// Create Code Modal Component
function CreateCodeModal({
  onClose,
  onSuccess,
  adminPassword,
}: {
  onClose: () => void;
  onSuccess: () => void;
  adminPassword: string;
}) {
  const [type, setType] = useState<'trial' | 'discount'>('trial');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState(25);
  const [trialDays, setTrialDays] = useState(30);
  const [maxRedemptions, setMaxRedemptions] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          code: code || undefined,
          description: description || undefined,
          type,
          discount_percent: type === 'discount' ? discountPercent : undefined,
          tier_duration_days: type === 'trial' ? trialDays : undefined,
          max_redemptions: maxRedemptions || undefined,
          expires_at: expiresAt || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to create code');
      }
    } catch (err) {
      setError('Failed to create code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F1123] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            Create Promo Code
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Type Selection */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Code Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('trial')}
                className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                  type === 'trial'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Gift className="w-4 h-4" />
                Trial
              </button>
              <button
                type="button"
                onClick={() => setType('discount')}
                className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                  type === 'discount'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Percent className="w-4 h-4" />
                Discount
              </button>
            </div>
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Code (leave blank to auto-generate)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., TRIAL30 or SUMMER25"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Coach Partner Trial"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type-specific fields */}
          {type === 'trial' ? (
            <div>
              <label className="block text-sm text-white/60 mb-2">Trial Duration (Days)</label>
              <input
                type="number"
                value={trialDays}
                onChange={(e) => setTrialDays(parseInt(e.target.value) || 30)}
                min="1"
                max="365"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-white/60 mb-2">Discount Percentage</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-white/60">%</span>
              </div>
            </div>
          )}

          {/* Max Redemptions */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Max Redemptions (leave blank for unlimited)
            </label>
            <input
              type="number"
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value ? parseInt(e.target.value) : '')}
              min="1"
              placeholder="Unlimited"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Expiration Date (optional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
