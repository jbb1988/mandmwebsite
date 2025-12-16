'use client';

import { useState, useEffect } from 'react';
import AdminGate from '@/components/AdminGate';
import {
  Users, Plus, RefreshCw, Search, MapPin, ExternalLink, MessageCircle,
  CheckCircle, Clock, XCircle, Send, FileText, ChevronDown, ChevronUp,
  Copy, Filter, BarChart3, Calendar, Trash2, UserPlus, AlertCircle, Bell,
  Pencil, X, QrCode, Link2, DollarSign, TrendingUp, UserCheck, Image,
  CalendarClock, Handshake
} from 'lucide-react';

type Tab = 'add' | 'pipeline' | 'follow-up' | 'partners' | 'templates';
type OutreachStatus = 'not_started' | 'dm_sent' | 'awaiting_response' | 'approved' | 'posted' | 'declined' | 'no_response';
type ResponseType = 'interested' | 'maybe_later' | 'not_interested' | 'posted' | 'no_response';
type GroupType = 'travel_ball' | 'rec_league' | 'showcase' | 'tournament' | 'coaching' | 'parents' | 'equipment' | 'other';

interface FBPageAdmin {
  id: string;
  admin_name: string;
  admin_profile_url: string | null;
  is_primary: boolean;
  dm_sent_at: string | null;
  response_status: string;
  response_type: ResponseType | null;
  response_notes: string | null;
  next_follow_up: string | null;
  follow_up_count: number;
  // Conversion tracking
  partner_signed_up: boolean;
  partner_signed_up_at: string | null;
  app_user_id: string | null;
  app_signed_up_at: string | null;
  referral_count: number;
  referral_revenue: number;
}

// Response type configuration
const RESPONSE_TYPES: Record<ResponseType, { label: string; color: string; icon: string; nextAction: string }> = {
  interested: { label: 'Interested!', color: 'green', icon: '🎯', nextAction: 'Send assets & post copy' },
  maybe_later: { label: 'Maybe Later', color: 'yellow', icon: '⏳', nextAction: 'Follow up in 1 week' },
  not_interested: { label: 'Not Interested', color: 'red', icon: '❌', nextAction: 'Move on' },
  posted: { label: 'Posted!', color: 'purple', icon: '🎉', nextAction: 'Track conversions' },
  no_response: { label: 'No Response', color: 'orange', icon: '😶', nextAction: 'Follow up in 3 days' },
};

interface FBPage {
  id: string;
  page_name: string;
  page_url: string;
  admin_name: string | null;
  admin_profile_url: string | null;
  fb_page_admins: FBPageAdmin[];
  state: string | null;
  member_count: number | null;
  group_type: GroupType | null;
  outreach_status: OutreachStatus;
  dm_sent_at: string | null;
  posted_at: string | null;
  post_template_used: string | null;
  notes: string | null;
  priority_score: number;
  created_at: string;
  partner_qr_code_url: string | null;
  partner_referral_link: string | null;
  partner_landing_page: string | null;
  first_contact_at: string | null;
  last_contact_at: string | null;
  follow_up_date: string | null;
  follow_up_count: number;
  response_received_at: string | null;
}

interface Template {
  id: string;
  template_name: string;
  template_type: string;
  target_category: string;
  body: string;
}

interface Stats {
  total: number;
  byStatus: Record<OutreachStatus, number>;
  byState: Record<string, number>;
  needsFollowUp?: number;
  readyToPost?: number;
  partnersSignedUp?: number;
  appUsersConverted?: number;
  totalReferrals?: number;
  totalRevenue?: number;
}

const STATUS_CONFIG: Record<OutreachStatus, { label: string; color: string; icon: typeof Clock }> = {
  not_started: { label: 'Not Started', color: 'gray', icon: Clock },
  dm_sent: { label: 'DM Sent', color: 'blue', icon: Send },
  awaiting_response: { label: 'Awaiting Response', color: 'yellow', icon: Clock },
  approved: { label: 'Approved', color: 'green', icon: CheckCircle },
  posted: { label: 'Posted', color: 'purple', icon: FileText },
  declined: { label: 'Declined', color: 'red', icon: XCircle },
  no_response: { label: 'No Response', color: 'orange', icon: Clock },
};

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

function daysSince(date: string | null): number | null {
  if (!date) return null;
  const sent = new Date(date);
  const now = new Date();
  const diff = now.getTime() - sent.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getFollowUpUrgency(days: number | null): { label: string; color: string; urgent: boolean } | null {
  if (days === null) return null;
  if (days >= 7) return { label: `${days}d - Follow up!`, color: 'red', urgent: true };
  if (days >= 3) return { label: `${days}d - Consider follow-up`, color: 'yellow', urgent: false };
  if (days >= 1) return { label: `${days}d ago`, color: 'gray', urgent: false };
  return { label: 'Today', color: 'green', urgent: false };
}

const ADMIN_RESPONSE_STATUS = {
  not_contacted: { label: 'Not Contacted', color: 'gray' },
  dm_sent: { label: 'DM Sent', color: 'blue' },
  responded: { label: 'Responded', color: 'cyan' },
  approved: { label: 'Approved', color: 'green' },
  declined: { label: 'Declined', color: 'red' },
  no_response: { label: 'No Response', color: 'orange' },
};

// Sophisticated Card Component
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

// Stat Card Component
function StatCard({ value, label, icon: Icon, color = 'white', highlight = false }: {
  value: number | string;
  label: string;
  icon?: typeof Clock;
  color?: string;
  highlight?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    white: 'text-white',
    gray: 'text-gray-400',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
  };

  return (
    <Card variant={highlight ? 'elevated' : 'default'} className="p-4">
      <div className="text-center">
        {Icon && <Icon className={`w-5 h-5 ${colorClasses[color]} mx-auto mb-2 opacity-80`} />}
        <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
        <p className="text-xs text-white/50 mt-1">{label}</p>
      </div>
    </Card>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  color = 'blue',
  badge
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Clock;
  label: string;
  color?: string;
  badge?: number;
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/15', border: 'border-blue-500/40', text: 'text-blue-400' },
    red: { bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-400' },
    green: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400' },
    cyan: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/40', text: 'text-cyan-400' },
    orange: { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-400' },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all text-sm ${
        active
          ? `${colors.bg} border ${colors.border} ${colors.text}`
          : 'bg-white/[0.03] border border-white/[0.06] text-white/60 hover:bg-white/[0.06] hover:text-white/80'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
          {badge}
        </span>
      )}
    </button>
  );
}

// Input Component
function Input({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; required?: boolean }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-white/30
          focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all ${props.className || ''}`}
      />
    </div>
  );
}

// Select Component
function Select({ label, required, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; required?: boolean }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white
          focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all cursor-pointer ${props.className || ''}`}
      >
        {children}
      </select>
    </div>
  );
}

// Button Component
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: typeof Clock;
  loading?: boolean;
}) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
    secondary: 'bg-white/[0.05] border border-white/[0.1] text-white/90 hover:bg-white/[0.1]',
    ghost: 'bg-transparent border-0 text-white/70 hover:text-white hover:bg-white/[0.05]',
    danger: 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${props.className || ''}`}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}

export default function AdminFBOutreachPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pipeline');
  const [stats, setStats] = useState<Stats>({ total: 0, byStatus: {} as Record<OutreachStatus, number>, byState: {} });
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/fb-outreach/stats', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AdminGate
      title="Admin: FB Outreach"
      description="Enter admin password to access dashboard"
    >
      <div className="min-h-screen bg-[#0A0B14] text-white">
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                Facebook Outreach Pipeline
              </h1>
              <p className="text-white/50 text-sm sm:text-base">
                Track admin DMs and group posts — Starting with Florida
              </p>
            </div>

            {/* Stats Grid - Row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-3">
              <StatCard value={stats.total} label="Total Pages" color="white" />
              <StatCard value={stats.byStatus?.not_started || 0} label="Not Started" color="gray" />
              <StatCard value={stats.byStatus?.dm_sent || 0} label="DMs Sent" color="blue" />
              <Card variant="elevated" className="p-4 border-red-500/30">
                <div className="text-center">
                  <Bell className="w-5 h-5 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-400">{stats.needsFollowUp || 0}</p>
                  <p className="text-xs text-red-400/70 mt-1">Follow Up!</p>
                </div>
              </Card>
              <StatCard value={stats.byStatus?.approved || 0} label="Approved" color="green" />
              <Card variant="elevated" className="p-4 border-emerald-500/30">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{stats.readyToPost || 0}</p>
                  <p className="text-xs text-emerald-400/70 mt-1">Ready to Post</p>
                </div>
              </Card>
              <StatCard value={stats.byStatus?.posted || 0} label="Posted" color="purple" />
            </div>

            {/* Stats Grid - Row 2: Conversion Funnel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              <StatCard
                value={stats.partnersSignedUp || 0}
                label="Partner Signups"
                icon={Handshake}
                color="cyan"
              />
              <StatCard
                value={stats.appUsersConverted || 0}
                label="App Users"
                icon={UserCheck}
                color="green"
              />
              <StatCard
                value={stats.totalReferrals || 0}
                label="Total Referrals"
                icon={TrendingUp}
                color="amber"
              />
              <StatCard
                value={`$${(stats.totalRevenue || 0).toLocaleString()}`}
                label="Revenue Generated"
                icon={DollarSign}
                color="green"
                highlight
              />
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-8 flex-wrap">
              <TabButton
                active={activeTab === 'pipeline'}
                onClick={() => setActiveTab('pipeline')}
                icon={BarChart3}
                label="Pipeline"
                color="blue"
              />
              <TabButton
                active={activeTab === 'follow-up'}
                onClick={() => setActiveTab('follow-up')}
                icon={Bell}
                label="Follow-Up"
                color="red"
                badge={stats.needsFollowUp}
              />
              <TabButton
                active={activeTab === 'partners'}
                onClick={() => setActiveTab('partners')}
                icon={Handshake}
                label="Partners"
                color="cyan"
              />
              <TabButton
                active={activeTab === 'add'}
                onClick={() => setActiveTab('add')}
                icon={Plus}
                label="Add Page"
                color="green"
              />
              <TabButton
                active={activeTab === 'templates'}
                onClick={() => setActiveTab('templates')}
                icon={FileText}
                label="Templates"
                color="orange"
              />
            </div>

            {/* Tab Content */}
            <Card variant="elevated" className="p-6 sm:p-8">
              {activeTab === 'pipeline' && <PipelineTab onUpdate={fetchStats} />}
              {activeTab === 'follow-up' && <FollowUpTab onUpdate={fetchStats} />}
              {activeTab === 'partners' && <PartnersTab onUpdate={fetchStats} />}
              {activeTab === 'add' && <AddPageTab onSuccess={fetchStats} />}
              {activeTab === 'templates' && <TemplatesTab />}
            </Card>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}

function AddPageTab({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    page_name: '',
    page_url: '',
    state: 'FL',
    member_count: '',
    group_type: 'travel_ball' as GroupType,
    sport: 'baseball' as 'baseball' | 'softball' | 'both',
    priority_score: '3',
    notes: '',
  });
  const [admins, setAdmins] = useState([{ name: '', profile_url: '' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const addAdmin = () => setAdmins([...admins, { name: '', profile_url: '' }]);
  const removeAdmin = (index: number) => {
    if (admins.length > 1) setAdmins(admins.filter((_, i) => i !== index));
  };
  const updateAdmin = (index: number, field: 'name' | 'profile_url', value: string) => {
    const updated = [...admins];
    updated[index][field] = value;
    setAdmins(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/fb-outreach/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          ...formData,
          admins: admins.filter(a => a.name.trim()),
          member_count: formData.member_count ? parseInt(formData.member_count) : null,
          priority_score: parseInt(formData.priority_score),
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setFormData({
          page_name: '', page_url: '', state: 'FL', member_count: '',
          group_type: 'travel_ball', sport: 'baseball', priority_score: '3', notes: '',
        });
        setAdmins([{ name: '', profile_url: '' }]);
        onSuccess();
      }
    } catch {
      setResult({ success: false, message: 'Failed to add page' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
          <Plus className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Add Facebook Page/Group</h2>
          <p className="text-white/50 text-sm">Track a new travel ball group for outreach</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Group Name"
              required
              value={formData.page_name}
              onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
              placeholder="e.g., Florida Travel Ball Connect"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Group URL"
              required
              type="url"
              value={formData.page_url}
              onChange={(e) => setFormData({ ...formData, page_url: e.target.value })}
              placeholder="https://facebook.com/groups/..."
            />
          </div>

          {/* Admins Section */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white/70">Group Admins</label>
              <Button type="button" variant="ghost" size="sm" icon={UserPlus} onClick={addAdmin}>
                Add Admin
              </Button>
            </div>
            <div className="space-y-3">
              {admins.map((admin, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={admin.name}
                      onChange={(e) => updateAdmin(index, 'name', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder={`Admin ${index + 1} name`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={admin.profile_url}
                      onChange={(e) => updateAdmin(index, 'profile_url', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50"
                      placeholder="Profile URL (optional)"
                    />
                  </div>
                  {admins.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAdmin(index)}
                      className="p-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Select
            label="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          >
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>

          <Input
            label="Member Count"
            type="number"
            value={formData.member_count}
            onChange={(e) => setFormData({ ...formData, member_count: e.target.value })}
            placeholder="e.g., 5000"
          />

          <Select
            label="Group Type"
            value={formData.group_type}
            onChange={(e) => setFormData({ ...formData, group_type: e.target.value as GroupType })}
          >
            <option value="travel_ball">Travel Ball</option>
            <option value="rec_league">Rec League</option>
            <option value="showcase">Showcase</option>
            <option value="tournament">Tournament</option>
            <option value="coaching">Coaching</option>
            <option value="parents">Parents</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </Select>

          <Select
            label="Sport"
            value={formData.sport}
            onChange={(e) => setFormData({ ...formData, sport: e.target.value as 'baseball' | 'softball' | 'both' })}
          >
            <option value="baseball">Baseball</option>
            <option value="softball">Softball</option>
            <option value="both">Both</option>
          </Select>

          <Select
            label="Priority Score"
            value={formData.priority_score}
            onChange={(e) => setFormData({ ...formData, priority_score: e.target.value })}
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n} - {'★'.repeat(n)}{'☆'.repeat(5-n)}</option>
            ))}
          </Select>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white/70 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
              rows={3}
              placeholder="Any notes about this group..."
            />
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} icon={Plus}>
          Add to Pipeline
        </Button>

        {result && (
          <Card variant={result.success ? 'default' : 'bordered'} className={`p-4 ${result.success ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
            <p className={`text-sm ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.message}
            </p>
          </Card>
        )}
      </form>
    </div>
  );
}

function PipelineTab({ onUpdate }: { onUpdate: () => void }) {
  const [pages, setPages] = useState<FBPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: 'all', status: 'all', search: '' });
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const fetchPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.state !== 'all') params.set('state', filters.state);
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const response = await fetch(`/api/admin/fb-outreach/pages?${params}`, {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json();
      if (data.pages) setPages(data.pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, [filters]);

  const updateStatus = async (id: string, status: OutreachStatus) => {
    try {
      const updates: Record<string, unknown> = { id, outreach_status: status };
      if (status === 'dm_sent') updates.dm_sent_at = new Date().toISOString();
      if (status === 'posted') updates.posted_at = new Date().toISOString();

      await fetch('/api/admin/fb-outreach/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
        body: JSON.stringify(updates),
      });
      fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      await fetch(`/api/admin/fb-outreach/pages?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': adminPassword },
      });
      fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const StatusBadge = ({ status }: { status: OutreachStatus }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    const colorClasses: Record<string, string> = {
      gray: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
      blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      red: 'bg-red-500/15 text-red-400 border-red-500/30',
      orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${colorClasses[config.color]}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search groups..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <select
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">All States</option>
          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <Button variant="secondary" size="md" icon={RefreshCw} onClick={fetchPages}>
          Refresh
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-white/40 mb-4">{pages.length} groups found</p>

      {/* Pages List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-white/30 animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 text-white/40">No pages found</div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => {
            const isExpanded = expandedPage === page.id;
            const daysSinceDM = daysSince(page.dm_sent_at);
            const urgency = getFollowUpUrgency(daysSinceDM);
            const admins = page.fb_page_admins || [];

            return (
              <Card key={page.id} variant="default" className="overflow-hidden">
                {/* Header Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedPage(isExpanded ? null : page.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Priority Stars */}
                    <div className="hidden sm:flex flex-col items-center w-10">
                      <span className="text-orange-400 text-xs tracking-tight">
                        {'★'.repeat(page.priority_score)}{'☆'.repeat(5 - page.priority_score)}
                      </span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{page.page_name}</h3>
                        {page.state && (
                          <span className="text-xs text-white/40 bg-white/[0.05] px-2 py-0.5 rounded">
                            {page.state}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        {page.member_count && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {page.member_count.toLocaleString()}
                          </span>
                        )}
                        {admins.length > 0 && (
                          <span>{admins.length} admin{admins.length > 1 ? 's' : ''}</span>
                        )}
                        {urgency && (
                          <span className={`text-${urgency.color}-400`}>{urgency.label}</span>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <StatusBadge status={page.outreach_status} />
                      <ChevronDown className={`w-5 h-5 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] p-4 bg-white/[0.01]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Info & Status */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-wide">Group URL</label>
                          <a
                            href={page.page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {page.page_url.replace('https://', '').slice(0, 40)}...
                          </a>
                        </div>

                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-wide mb-2 block">Update Status</label>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                              <button
                                key={status}
                                onClick={() => updateStatus(page.id, status as OutreachStatus)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                  page.outreach_status === status
                                    ? `bg-${config.color}-500/20 border-${config.color}-500/40 text-${config.color}-400`
                                    : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06]'
                                }`}
                              >
                                {config.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {page.notes && (
                          <div>
                            <label className="text-xs text-white/40 uppercase tracking-wide">Notes</label>
                            <p className="text-sm text-white/70 mt-1">{page.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Admins */}
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-wide mb-3 block">
                          Admins ({admins.length})
                        </label>
                        {admins.length > 0 ? (
                          <div className="space-y-2">
                            {admins.map((admin) => (
                              <div key={admin.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                                    <Users className="w-4 h-4 text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{admin.admin_name}</p>
                                    <p className="text-xs text-white/40">
                                      {ADMIN_RESPONSE_STATUS[admin.response_status as keyof typeof ADMIN_RESPONSE_STATUS]?.label || 'Not Contacted'}
                                    </p>
                                  </div>
                                </div>
                                {admin.admin_profile_url && (
                                  <a
                                    href={admin.admin_profile_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-white/40 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-white/30">No admins added</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/[0.06]">
                      <Button variant="danger" size="sm" icon={Trash2} onClick={() => deletePage(page.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FollowUpTab({ onUpdate }: { onUpdate: () => void }) {
  const [pages, setPages] = useState<FBPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'due'>('all');
  const [responseModal, setResponseModal] = useState<{ admin: FBPageAdmin; page: FBPage } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const FOLLOW_UP_TEMPLATES = {
    first_follow_up: `Hey {name}! Just following up on my message from a few days ago. Would love to share Mind & Muscle with your group - it's been helping teams simplify their communication (replaces GroupMe + scheduling apps). Let me know if you'd be open to a quick post!`,
    second_follow_up: `Hey {name}, hope you're having a great week! Wanted to circle back one more time about Mind & Muscle. Happy to answer any questions or create a custom QR code for {group_name}. No pressure either way!`,
    post_approved: `Awesome, thank you so much! Here's the post copy and QR code you can share:\n\n[PASTE POST COPY HERE]\n\nLet me know if you'd like any changes!`,
  };

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/fb-outreach/pages?status=dm_sent', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json();
      if (data.pages) {
        const filtered = data.pages.filter((p: FBPage) => {
          const days = daysSince(p.dm_sent_at);
          return days !== null && days >= 1;
        });
        setPages(filtered);
      }
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFollowUps(); }, []);

  const copyTemplate = (template: string, adminName: string, groupName: string) => {
    const filled = template
      .replace(/{name}/g, adminName.split(' ')[0])
      .replace(/{group_name}/g, groupName);
    navigator.clipboard.writeText(filled);
    setCopiedId(template);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const logResponse = async (admin: FBPageAdmin, responseType: ResponseType, notes: string) => {
    try {
      let nextFollowUp: string | null = null;
      const today = new Date();

      if (responseType === 'maybe_later') {
        today.setDate(today.getDate() + 7);
        nextFollowUp = today.toISOString().split('T')[0];
      } else if (responseType === 'no_response') {
        today.setDate(today.getDate() + 3);
        nextFollowUp = today.toISOString().split('T')[0];
      }

      await fetch('/api/admin/fb-outreach/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
        body: JSON.stringify({
          admin_id: admin.id,
          response_type: responseType,
          response_notes: notes,
          next_follow_up: nextFollowUp,
          follow_up_count: (admin.follow_up_count || 0) + 1,
          response_status: responseType === 'interested' || responseType === 'posted' ? 'approved' :
                          responseType === 'not_interested' ? 'declined' : 'dm_sent',
        }),
      });

      setResponseModal(null);
      fetchFollowUps();
      onUpdate();
    } catch (error) {
      console.error('Error logging response:', error);
    }
  };

  const filteredPages = pages.filter((page) => {
    const days = daysSince(page.dm_sent_at);
    if (filter === 'urgent') return days !== null && days >= 7;
    if (filter === 'due') return days !== null && days >= 3;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
            <Bell className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Follow-Up Queue</h2>
            <p className="text-sm text-white/40">{filteredPages.length} groups need attention</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(['all', 'due', 'urgent'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? f === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : f === 'due' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/[0.03] text-white/50 border border-white/[0.08] hover:bg-white/[0.06]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'due' ? '3+ Days' : '7+ Days'}
            </button>
          ))}
        </div>
      </div>

      {/* DM Templates */}
      <Card variant="default" className="p-4 mb-6">
        <h3 className="text-sm font-medium text-white/70 mb-3">Quick Follow-Up Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(FOLLOW_UP_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => copyTemplate(template, '[Admin Name]', '[Group Name]')}
              className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-left hover:bg-white/[0.06] transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/60 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <Copy className={`w-4 h-4 ${copiedId === template ? 'text-emerald-400' : 'text-white/30 group-hover:text-white/60'}`} />
              </div>
              <p className="text-xs text-white/40 line-clamp-2">{template.slice(0, 80)}...</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Follow-up List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-white/30 animate-spin" />
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="text-center py-12 text-white/40">No follow-ups needed</div>
      ) : (
        <div className="space-y-3">
          {filteredPages.map((page) => {
            const days = daysSince(page.dm_sent_at);
            const urgency = getFollowUpUrgency(days);
            const admins = page.fb_page_admins || [];

            return (
              <Card key={page.id} variant="default" className={`p-4 ${urgency?.urgent ? 'border-red-500/30' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{page.page_name}</h3>
                      {urgency && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          urgency.urgent ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {urgency.label}
                        </span>
                      )}
                    </div>

                    {admins.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {admins.map((admin) => (
                          <div key={admin.id} className="flex items-center gap-2">
                            <span className="text-sm text-white/70">{admin.admin_name}</span>
                            <button
                              onClick={() => setResponseModal({ admin, page })}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30"
                            >
                              Log Response
                            </button>
                            <button
                              onClick={() => copyTemplate(FOLLOW_UP_TEMPLATES.first_follow_up, admin.admin_name, page.page_name)}
                              className="p-1 text-white/40 hover:text-white/70"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <a
                    href={page.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-white/40 hover:text-white hover:bg-white/[0.05] rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Response Modal */}
      {responseModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <Card variant="elevated" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Log Response</h3>
              <button onClick={() => setResponseModal(null)} className="p-2 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-white/60 mb-4">
              Response from <span className="text-white">{responseModal.admin.admin_name}</span> at{' '}
              <span className="text-white">{responseModal.page.page_name}</span>
            </p>

            <div className="space-y-3">
              {(Object.entries(RESPONSE_TYPES) as [ResponseType, typeof RESPONSE_TYPES[ResponseType]][]).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => logResponse(responseModal.admin, type, '')}
                  className={`w-full p-4 rounded-xl border text-left transition-all hover:bg-white/[0.03] ${
                    config.color === 'green' ? 'border-emerald-500/30 hover:border-emerald-500/50' :
                    config.color === 'yellow' ? 'border-yellow-500/30 hover:border-yellow-500/50' :
                    config.color === 'red' ? 'border-red-500/30 hover:border-red-500/50' :
                    config.color === 'purple' ? 'border-purple-500/30 hover:border-purple-500/50' :
                    'border-orange-500/30 hover:border-orange-500/50'
                  } bg-white/[0.02]`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{config.icon}</span>
                    <div>
                      <p className="font-medium text-white">{config.label}</p>
                      <p className="text-xs text-white/40">{config.nextAction}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function PartnersTab({ onUpdate }: { onUpdate: () => void }) {
  const [pages, setPages] = useState<FBPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<string | null>(null);
  const [partnerForm, setPartnerForm] = useState({ qr_url: '', referral_link: '', landing_page: '' });
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/fb-outreach/pages?status=approved', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json();
      if (data.pages) setPages(data.pages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  const savePartnerAssets = async (pageId: string) => {
    try {
      await fetch('/api/admin/fb-outreach/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
        body: JSON.stringify({
          id: pageId,
          partner_qr_code_url: partnerForm.qr_url || null,
          partner_referral_link: partnerForm.referral_link || null,
          partner_landing_page: partnerForm.landing_page || null,
        }),
      });
      setEditingPartner(null);
      fetchPartners();
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
          <Handshake className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Partner Management</h2>
          <p className="text-sm text-white/40">{pages.length} approved partners</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-white/30 animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 text-white/40">No approved partners yet</div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => {
            const isEditing = editingPartner === page.id;
            const hasAssets = page.partner_qr_code_url || page.partner_referral_link;

            return (
              <Card key={page.id} variant="default" className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{page.page_name}</h3>
                      {hasAssets ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Assets Ready</span>
                      ) : (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Needs Assets</span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 mt-4">
                        <Input
                          placeholder="QR Code URL"
                          value={partnerForm.qr_url}
                          onChange={(e) => setPartnerForm({ ...partnerForm, qr_url: e.target.value })}
                        />
                        <Input
                          placeholder="Referral Link"
                          value={partnerForm.referral_link}
                          onChange={(e) => setPartnerForm({ ...partnerForm, referral_link: e.target.value })}
                        />
                        <Input
                          placeholder="Landing Page URL"
                          value={partnerForm.landing_page}
                          onChange={(e) => setPartnerForm({ ...partnerForm, landing_page: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button variant="primary" size="sm" onClick={() => savePartnerAssets(page.id)}>
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingPartner(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : hasAssets && (
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/50">
                        {page.partner_qr_code_url && (
                          <span className="flex items-center gap-1"><QrCode className="w-3 h-3" /> QR Code</span>
                        )}
                        {page.partner_referral_link && (
                          <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> Referral Link</span>
                        )}
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Pencil}
                      onClick={() => {
                        setEditingPartner(page.id);
                        setPartnerForm({
                          qr_url: page.partner_qr_code_url || '',
                          referral_link: page.partner_referral_link || '',
                          landing_page: page.partner_landing_page || '',
                        });
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'initial' | 'post'>('all');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/fb-outreach/templates', {
          headers: { 'X-Admin-Password': adminPassword },
        });
        const data = await response.json();
        if (data.templates) setTemplates(data.templates);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const copyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.body);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTemplates = templates.filter((t) => {
    if (filter === 'initial') return t.template_type === 'initial';
    if (filter === 'post') return t.template_type === 'post';
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
            <FileText className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">DM & Post Templates</h2>
            <p className="text-sm text-white/40">{templates.length} templates available</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(['all', 'initial', 'post'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-white/[0.03] text-white/50 border border-white/[0.08] hover:bg-white/[0.06]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'initial' ? 'DM Templates' : 'Post Templates'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-white/30 animate-spin" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 text-white/40">No templates found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} variant="default" className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-medium text-white capitalize">
                    {template.template_name.replace(/_/g, ' ')}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                    template.template_type === 'initial'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {template.template_type === 'initial' ? 'DM Template' : 'Post Template'}
                  </span>
                </div>
                <Button
                  variant={copiedId === template.id ? 'primary' : 'secondary'}
                  size="sm"
                  icon={copiedId === template.id ? CheckCircle : Copy}
                  onClick={() => copyTemplate(template)}
                >
                  {copiedId === template.id ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-sm text-white/60 whitespace-pre-wrap line-clamp-6">{template.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
