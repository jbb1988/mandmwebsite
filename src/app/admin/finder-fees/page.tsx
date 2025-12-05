'use client';

import { useState } from 'react';
import PasswordGate from '@/components/PasswordGate';

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
    >
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('enable')}
                  className={`px-8 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'enable'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Enable Partners
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-8 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'transactions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  View Transactions
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'enable' ? <EnablePartnerTab /> : <TransactionsTab />}
            </div>
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
        // Reset form
        setFormData({
          partnerCode: '',
          partnerEmail: '',
          partnerName: '',
          isRecurring: false,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to enable partner. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Enable New Finder Partner</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="partnerCode" className="block text-sm font-medium text-gray-700 mb-2">
            Partner Code
          </label>
          <input
            type="text"
            id="partnerCode"
            required
            value={formData.partnerCode}
            onChange={(e) => setFormData({ ...formData, partnerCode: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., SMITH2024"
          />
          <p className="mt-1 text-sm text-gray-500">Unique code for this partner (alphanumeric, no spaces)</p>
        </div>

        <div>
          <label htmlFor="partnerEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Partner Email
          </label>
          <input
            type="email"
            id="partnerEmail"
            required
            value={formData.partnerEmail}
            onChange={(e) => setFormData({ ...formData, partnerEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="partnerName" className="block text-sm font-medium text-gray-700 mb-2">
            Partner Name
          </label>
          <input
            type="text"
            id="partnerName"
            required
            value={formData.partnerName}
            onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Smith"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRecurring"
            checked={formData.isRecurring}
            onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
            VIP Recurring (10% first payment + 5% all renewals)
          </label>
        </div>
        <p className="text-sm text-gray-500 ml-6">
          {formData.isRecurring 
            ? '⭐ VIP: Partner earns 10% on first purchase + 5% on every renewal (rare, high-value partners only)'
            : '📋 Standard: Partner earns 10% one-time fee on first purchase only'}
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Enabling Partner...' : 'Enable Finder Partner'}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.message}
          </p>
          {result.finderLink && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-green-800 mb-1">Finder Link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={result.finderLink}
                  className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(result.finderLink!)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
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

  useState(() => {
    fetchTransactions();
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Finder Fee Transactions</h2>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No transactions found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{tx.finder_code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tx.partner_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tx.referred_org_email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">${tx.purchase_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tx.fee_percentage}%</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">${tx.fee_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      {tx.is_recurring ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          VIP {tx.is_first_purchase ? '(First)' : '(Renewal)'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'paid' ? 'bg-green-100 text-green-800' :
                        tx.status === 'approved' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                Showing page {filters.page} of {pagination.totalPages} ({pagination.totalCount} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
