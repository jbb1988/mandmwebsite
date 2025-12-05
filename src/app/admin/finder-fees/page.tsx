'use client';

import { useState, useEffect } from 'react';
import PasswordGate from '@/components/PasswordGate';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { Users, DollarSign, CheckCircle, Clock, Crown, RefreshCw, Copy, UserPlus, List } from 'lucide-react';

type Tab = 'enable' | 'transactions';

interface Transaction {
  id: string;
  finder_code: string;
  partner_name: string;
  referred_org_email: string;
  purchase_amount: number;
  fee_percentage: number;
  fee_amount: number;
  is_recurring: boolean;
  is_first_purchase: boolean;
  status: string;
  created_at: string;
}

export default function AdminFinderFeesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('enable');

  return (
    <PasswordGate
      password={process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!'}
      title="Admin: Finder Fee Management"
      description="Enter admin password to access dashboard"
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Finder Fee Admin</h1>
              <p className="text-gray-400">Manage partners and view transactions</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setActiveTab('enable')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'enable'
                    ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                Enable Partners
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <List className="w-5 h-5" />
                View Transactions
              </button>
            </div>

            {/* Tab Content */}
            <LiquidGlass className="p-8">
              {activeTab === 'enable' ? <EnablePartnerTab /> : <TransactionsTab />}
            </LiquidGlass>
          </div>
        </div>
      </div>
    </PasswordGate>
  );
}

function EnablePartnerTab() {
  const [formData, setFormData] = useState({
    partnerCode: '',
    partnerEmail: '',
    partnerName: '',
    isRecurring: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; finderLink?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/finder-fees/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setFormData({
          partnerCode: '',
          partnerEmail: '',
          partnerName: '',
          isRecurring: false,
        });
      }
    } catch {
      setResult({
        success: false,
        message: 'Failed to enable partner. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
          <UserPlus className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Enable New Finder Partner</h2>
          <p className="text-gray-400">Create a new partner with their unique finder code</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="partnerCode" className="block text-sm font-medium text-gray-300 mb-2">
            Partner Code
          </label>
          <input
            type="text"
            id="partnerCode"
            required
            value={formData.partnerCode}
            onChange={(e) => setFormData({ ...formData, partnerCode: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
            placeholder="e.g., SMITH2024"
          />
          <p className="mt-1 text-sm text-gray-500">Unique code for this partner (alphanumeric, no spaces)</p>
        </div>

        <div>
          <label htmlFor="partnerEmail" className="block text-sm font-medium text-gray-300 mb-2">
            Partner Email
          </label>
          <input
            type="email"
            id="partnerEmail"
            required
            value={formData.partnerEmail}
            onChange={(e) => setFormData({ ...formData, partnerEmail: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="partnerName" className="block text-sm font-medium text-gray-300 mb-2">
            Partner Name
          </label>
          <input
            type="text"
            id="partnerName"
            required
            value={formData.partnerName}
            onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
            placeholder="John Smith"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-gray-600 rounded bg-gray-700"
            />
            <label htmlFor="isRecurring" className="ml-3 block text-white font-medium">
              VIP Recurring (10% first payment + 5% all renewals)
            </label>
          </div>
          <p className="text-sm text-gray-400 mt-2 ml-8">
            {formData.isRecurring
              ? '⭐ VIP: Partner earns 10% on first purchase + 5% on every renewal (rare, high-value partners only)'
              : '📋 Standard: Partner earns 10% one-time fee on first purchase only'}
          </p>
        </div>

        <LiquidButton
          type="submit"
          disabled={loading}
          variant="orange"
          fullWidth
        >
          {loading ? 'Enabling Partner...' : 'Enable Finder Partner'}
        </LiquidButton>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-xl ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          <p className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
            {result.message}
          </p>
          {result.finderLink && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-green-400 mb-1">Finder Link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={result.finderLink}
                  className="flex-1 px-3 py-2 bg-white/5 border border-green-500/30 rounded-lg text-sm text-white"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(result.finderLink!)}
                  className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalCount: 0,
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        status: filters.status,
        type: filters.type,
      });

      const response = await fetch(`/api/admin/finder-fees/transactions?${params}`, {
        headers: {
          'X-Admin-Password': process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!',
        },
      });

      const data = await response.json();
      if (data.transactions) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Finder Fee Transactions</h2>
            <p className="text-gray-400">View and manage all finder fee payments</p>
          </div>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/30 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Types</option>
            <option value="standard">Standard (One-time)</option>
            <option value="vip">VIP (Recurring)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-2 text-gray-400">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No transactions found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Partner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Organization</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fee %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fee Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-sm font-medium text-white">{tx.finder_code}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{tx.partner_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{tx.referred_org_email}</td>
                    <td className="px-4 py-3 text-sm text-white">${tx.purchase_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{tx.fee_percentage}%</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-400">${tx.fee_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      {tx.is_recurring ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          <Crown className="w-3 h-3" />
                          VIP {tx.is_first_purchase ? '(First)' : '(Renewal)'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        tx.status === 'approved' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {tx.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                        {tx.status === 'approved' && <Clock className="w-3 h-3" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Showing page {filters.page} of {pagination.totalPages} ({pagination.totalCount} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.totalPages}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
