'use client';

import { useState, useEffect } from 'react';
import AdminGate from '@/components/AdminGate';
import {
  Users, DollarSign, CheckCircle, Clock, Crown, RefreshCw, Copy, UserPlus, List,
  Mail, Info, ExternalLink, Search, ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  TrendingUp, Wallet, Calendar
} from 'lucide-react';

// Card component matching FB/X Outreach styling
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

type Tab = 'enable' | 'partners' | 'transactions';

interface Partner {
  id: string;
  partner_code: string;
  partner_email: string;
  partner_name: string;
  enabled: boolean;
  is_recurring: boolean;
  finder_link: string;
  total_earnings: number;
  created_at: string;
}

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

interface Stats {
  totalPartners: number;
  pendingPayments: number;
  totalPaidOut: number;
  thisMonthFees: number;
}

export default function AdminFinderFeesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('enable');
  const [showCheatSheet, setShowCheatSheet] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalPartners: 0, pendingPayments: 0, totalPaidOut: 0, thisMonthFees: 0 });
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';
  // Note: adminPassword is still used for API calls

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch partners count
      const partnersRes = await fetch('/api/admin/finder-fees/partners', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const partnersData = await partnersRes.json();

      // Fetch transactions for payment stats
      const txRes = await fetch('/api/admin/finder-fees/transactions?status=all', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const txData = await txRes.json();

      let pendingPayments = 0;
      let totalPaidOut = 0;
      let thisMonthFees = 0;
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      if (txData.transactions) {
        txData.transactions.forEach((tx: Transaction) => {
          if (tx.status === 'pending' || tx.status === 'approved') {
            pendingPayments += tx.fee_amount;
          }
          if (tx.status === 'paid') {
            totalPaidOut += tx.fee_amount;
          }
          const txDate = new Date(tx.created_at);
          if (txDate.getMonth() === thisMonth && txDate.getFullYear() === thisYear) {
            thisMonthFees += tx.fee_amount;
          }
        });
      }

      setStats({
        totalPartners: partnersData.pagination?.totalCount || 0,
        pendingPayments,
        totalPaidOut,
        thisMonthFees,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <AdminGate
      title="Admin: Finder Fee Management"
      description="Enter admin password to access dashboard"
    >
      <div className="min-h-screen bg-[#0A0B14] text-white">
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-orange-900/5 via-transparent to-blue-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <DollarSign className="w-8 h-8 text-orange-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Finder Fee Admin</h1>
              <p className="text-white/50 text-sm sm:text-base">Manage partners and view transactions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              <Card variant="elevated" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalPartners}</p>
                    <p className="text-xs text-white/50">Total Partners</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">${stats.pendingPayments.toFixed(0)}</p>
                    <p className="text-xs text-white/50">Pending</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                    <Wallet className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">${stats.totalPaidOut.toFixed(0)}</p>
                    <p className="text-xs text-white/50">Total Paid</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">${stats.thisMonthFees.toFixed(0)}</p>
                    <p className="text-xs text-white/50">This Month</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Comprehensive Cheat Sheet */}
            <Card variant="default" className="p-5 mb-8">
              <button
                onClick={() => setShowCheatSheet(!showCheatSheet)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-orange-400" />
                  <span className="font-semibold text-white">Referral Programs Cheat Sheet</span>
                  <span className="text-xs text-white/30">(Partner Program + Finder Fee)</span>
                </div>
                {showCheatSheet ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
              </button>

              {showCheatSheet && (
                <div className="mt-4 space-y-6">
                  {/* Two Programs Comparison */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Partner Program (Tolt) */}
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-green-400">Partner Program (Tolt)</h3>
                          <p className="text-xs text-gray-500">Automated via Tolt</p>
                        </div>
                      </div>
                      <ul className="text-xs text-gray-300 space-y-1.5">
                        <li className="flex gap-2"><span className="text-green-400">•</span> For individuals (coaches, parents, influencers)</li>
                        <li className="flex gap-2"><span className="text-green-400">•</span> <strong className="text-white">10%</strong> recurring (1-99 users)</li>
                        <li className="flex gap-2"><span className="text-green-400">•</span> <strong className="text-white">15%</strong> recurring (100+ users)</li>
                        <li className="flex gap-2"><span className="text-green-400">•</span> Affiliate for life (renewals tracked automatically)</li>
                        <li className="flex gap-2"><span className="text-green-400">•</span> Self-service signup at /partner-program</li>
                        <li className="flex gap-2"><span className="text-green-400">•</span> Partners manage via app.tolt.io</li>
                      </ul>
                      <div className="mt-3 pt-3 border-t border-green-500/20">
                        <p className="text-xs text-gray-400 mb-1">Link format:</p>
                        <code className="text-xs text-cyan-400 bg-gray-800 px-2 py-1 rounded block break-all">
                          mindandmuscle.ai/team-licensing?ref=CODE
                        </code>
                      </div>
                    </div>

                    {/* Finder Fee (Manual) */}
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-orange-400">Finder Fee (This Page)</h3>
                          <p className="text-xs text-gray-500">Manual / Invite-only</p>
                        </div>
                      </div>
                      <ul className="text-xs text-gray-300 space-y-1.5">
                        <li className="flex gap-2"><span className="text-orange-400">•</span> For introducing organizations (not individuals)</li>
                        <li className="flex gap-2"><span className="text-orange-400">•</span> <strong className="text-white">Standard: 10%</strong> one-time only</li>
                        <li className="flex gap-2"><span className="text-orange-400">•</span> <strong className="text-purple-400">VIP: 10%</strong> first + <strong className="text-purple-400">5%</strong> every renewal</li>
                        <li className="flex gap-2"><span className="text-orange-400">•</span> You create partners manually here</li>
                        <li className="flex gap-2"><span className="text-orange-400">•</span> You pay out manually (Venmo/Zelle/Check)</li>
                        <li className="flex gap-2"><span className="text-orange-400">•</span> Private program - not advertised</li>
                      </ul>
                      <div className="mt-3 pt-3 border-t border-orange-500/20">
                        <p className="text-xs text-gray-400 mb-1">Link format:</p>
                        <code className="text-xs text-cyan-400 bg-gray-800 px-2 py-1 rounded block break-all">
                          mindandmuscle.ai/team-licensing?finder=CODE
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* When to Use Each */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-blue-400 mb-3">When to Use Each Program</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-green-400 font-semibold mb-1">Use Partner Program when:</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>• Person wants to refer multiple people over time</li>
                          <li>• They want their own dashboard to track earnings</li>
                          <li>• Automated payouts are preferred</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-orange-400 font-semibold mb-1">Use Finder Fee when:</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>• One-time introduction to an organization</li>
                          <li>• VIP relationship deserving recurring cut</li>
                          <li>• Org wants to become partner themselves (finder still gets credit)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links & Verified Info */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Partner Program Links */}
                    <div>
                      <h3 className="text-xs font-semibold text-green-400 mb-2">Partner Program Pages</h3>
                      <div className="space-y-1.5 text-xs">
                        <a href="/partner-program" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-white">
                          <ExternalLink className="w-3 h-3" /> /partner-program <span className="text-gray-500">(public)</span>
                        </a>
                        <a href="https://app.tolt.io" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-white">
                          <ExternalLink className="w-3 h-3" /> app.tolt.io <span className="text-gray-500">(admin)</span>
                        </a>
                        <a href="https://mind-and-muscle.tolt.io" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-white">
                          <ExternalLink className="w-3 h-3" /> Partner portal <span className="text-gray-500">(partners login)</span>
                        </a>
                      </div>
                    </div>

                    {/* Finder Fee Links */}
                    <div>
                      <h3 className="text-xs font-semibold text-orange-400 mb-2">Finder Fee Pages</h3>
                      <div className="space-y-1.5 text-xs">
                        <a href="/finder-fee" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-white">
                          <ExternalLink className="w-3 h-3" /> /finder-fee <span className="text-gray-500">(pw: fastball)</span>
                        </a>
                        <a href="/finder-fee-vip" target="_blank" className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
                          <Crown className="w-3 h-3" /> /finder-fee-vip <span className="text-gray-500">(pw: dominate)</span>
                        </a>
                      </div>
                    </div>

                    {/* Verified Facts */}
                    <div>
                      <h3 className="text-xs font-semibold text-cyan-400 mb-2">Verified Facts</h3>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> Tolt tracks renewals automatically</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> Partners get credit for life</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> 90-day cookie window</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> Stripe integration active</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Tab Navigation */}
            <div className="flex justify-center gap-2 md:gap-4 mb-8 flex-wrap">
              <button
                onClick={() => setActiveTab('enable')}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-medium transition-all text-sm md:text-base ${
                  activeTab === 'enable'
                    ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400'
                    : 'bg-white/[0.03] border border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Partner</span>
              </button>
              <button
                onClick={() => setActiveTab('partners')}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-medium transition-all text-sm md:text-base ${
                  activeTab === 'partners'
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-white/[0.03] border border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="hidden sm:inline">Partners</span>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-medium transition-all text-sm md:text-base ${
                  activeTab === 'transactions'
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                    : 'bg-white/[0.03] border border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
                }`}
              >
                <List className="w-5 h-5" />
                <span className="hidden sm:inline">Transactions</span>
              </button>
            </div>

            {/* Tab Content */}
            <Card variant="elevated" className="p-6 md:p-8">
              {activeTab === 'enable' && <EnablePartnerTab onSuccess={fetchStats} />}
              {activeTab === 'partners' && <PartnersTab />}
              {activeTab === 'transactions' && <TransactionsTab onStatusChange={fetchStats} />}
            </Card>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}

function EnablePartnerTab({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    partnerCode: '',
    partnerEmail: '',
    partnerName: '',
    isRecurring: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; finderLink?: string; emailSent?: boolean } | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/finder-fees/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
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
        onSuccess();
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
          <h2 className="text-2xl font-bold text-white">Add New Finder Partner</h2>
          <p className="text-white/50">Create a partner - welcome email sends automatically</p>
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
            onChange={(e) => setFormData({ ...formData, partnerCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
            placeholder="e.g., SMITH2024"
          />
          <p className="mt-1 text-sm text-gray-500">Unique code (letters & numbers only, auto-uppercase)</p>
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
              VIP Recurring (10% first + 5% all renewals)
            </label>
          </div>
          <p className="text-sm text-gray-400 mt-2 ml-8">
            {formData.isRecurring
              ? '⭐ VIP: Partner earns ongoing - rare, high-value partners only'
              : '📋 Standard: Partner earns 10% one-time on first purchase'}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Partner...' : 'Create Partner & Send Email'}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-xl ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : null}
            <div className="flex-1">
              <p className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.message}
              </p>
              {result.emailSent && (
                <p className="text-sm text-green-300 mt-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Welcome email sent!
                </p>
              )}
            </div>
          </div>
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

function PartnersTab() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [togglingPartner, setTogglingPartner] = useState<string | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search });
      const response = await fetch(`/api/admin/finder-fees/partners?${params}`, {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json();
      if (data.partners) {
        setPartners(data.partners);
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [search]);

  const handleResendEmail = async (partner: Partner) => {
    setSendingEmail(partner.id);
    try {
      const response = await fetch('/api/admin/finder-fees/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          partnerCode: partner.partner_code,
          partnerEmail: partner.partner_email,
          partnerName: partner.partner_name,
          isRecurring: partner.is_recurring,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Email sent successfully!');
      } else {
        alert(`Failed to send email: ${data.message}`);
      }
    } catch {
      alert('Failed to send email');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleTogglePartner = async (partner: Partner) => {
    setTogglingPartner(partner.id);
    try {
      const response = await fetch('/api/admin/finder-fees/partners', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          partnerId: partner.id,
          enabled: !partner.enabled,
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchPartners();
      } else {
        alert(`Failed to update partner: ${data.message}`);
      }
    } catch {
      alert('Failed to update partner');
    } finally {
      setTogglingPartner(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
            <Users className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Finder Partners</h2>
            <p className="text-white/50">View and manage all partners</p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search partners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50"
            />
          </div>
          <button
            onClick={fetchPartners}
            className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 hover:bg-green-500/30"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <p className="mt-2 text-gray-400">Loading partners...</p>
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No partners found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className={`p-4 rounded-xl border ${partner.enabled ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/20'}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{partner.partner_name}</span>
                    {partner.is_recurring ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Crown className="w-3 h-3" /> VIP
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Standard
                      </span>
                    )}
                    {!partner.enabled && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{partner.partner_email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-500">Code: <span className="text-cyan-400 font-mono">{partner.partner_code}</span></span>
                    <span className="text-gray-500">Earned: <span className="text-green-400 font-semibold">${partner.total_earnings.toFixed(2)}</span></span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(partner.finder_link)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm"
                  >
                    <Copy className="w-3 h-3" /> Link
                  </button>
                  <button
                    onClick={() => handleResendEmail(partner)}
                    disabled={sendingEmail === partner.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 text-sm disabled:opacity-50"
                  >
                    <Mail className={`w-3 h-3 ${sendingEmail === partner.id ? 'animate-pulse' : ''}`} />
                    {sendingEmail === partner.id ? 'Sending...' : 'Resend'}
                  </button>
                  <button
                    onClick={() => handleTogglePartner(partner)}
                    disabled={togglingPartner === partner.id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 ${
                      partner.enabled
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {partner.enabled ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                    {partner.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TransactionsTab({ onStatusChange }: { onStatusChange: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    page: 1,
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalCount: 0,
  });
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        status: filters.status,
        type: filters.type,
      });

      const response = await fetch(`/api/admin/finder-fees/transactions?${params}`, {
        headers: { 'X-Admin-Password': adminPassword },
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

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    setUpdatingStatus(transactionId);
    try {
      const response = await fetch('/api/admin/finder-fees/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          transactionId,
          status: newStatus,
          paymentNotes: paymentNotes[transactionId] || '',
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTransactions();
        onStatusChange();
      } else {
        alert(`Failed to update status: ${data.message}`);
      }
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Finder Fee Transactions</h2>
            <p className="text-white/50">View and manage all finder fee payments</p>
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
            <option value="standard">Standard</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      {/* Transactions */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-2 text-gray-400">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className={`p-4 rounded-xl border ${
                tx.status === 'paid' ? 'bg-green-500/5 border-green-500/20' :
                tx.status === 'approved' ? 'bg-yellow-500/5 border-yellow-500/20' :
                'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">{tx.partner_name}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-cyan-400 font-mono text-sm">{tx.finder_code}</span>
                    {tx.is_recurring ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Crown className="w-3 h-3" />
                        VIP {tx.is_first_purchase ? '(First)' : '(Renewal)'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Standard
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Org: {tx.referred_org_email}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">Purchase: <span className="text-white font-semibold">${tx.purchase_amount.toFixed(2)}</span></span>
                    <span className="text-gray-400">Fee ({tx.fee_percentage}%): <span className="text-green-400 font-bold">${tx.fee_amount.toFixed(2)}</span></span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    tx.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    tx.status === 'approved' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {tx.status === 'paid' && <CheckCircle className="w-4 h-4" />}
                    {tx.status === 'approved' && <Clock className="w-4 h-4" />}
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>

                  {/* Action Buttons */}
                  {tx.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(tx.id, 'approved')}
                      disabled={updatingStatus === tx.id}
                      className="px-4 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 text-sm font-medium disabled:opacity-50"
                    >
                      {updatingStatus === tx.id ? 'Updating...' : 'Approve'}
                    </button>
                  )}

                  {tx.status === 'approved' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Payment note (Venmo #)"
                        value={paymentNotes[tx.id] || ''}
                        onChange={(e) => setPaymentNotes({ ...paymentNotes, [tx.id]: e.target.value })}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 w-40"
                      />
                      <button
                        onClick={() => handleStatusUpdate(tx.id, 'paid')}
                        disabled={updatingStatus === tx.id}
                        className="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm font-medium disabled:opacity-50"
                      >
                        {updatingStatus === tx.id ? 'Updating...' : 'Mark Paid'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Page {filters.page} of {pagination.totalPages} ({pagination.totalCount} total)
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
        </div>
      )}
    </div>
  );
}
