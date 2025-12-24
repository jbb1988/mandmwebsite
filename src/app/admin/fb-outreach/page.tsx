'use client';

import { useState, useEffect } from 'react';
import AdminGate from '@/components/AdminGate';
import { Card, StatCard, TabButton } from '@/components/admin/shared';
import {
  Users, Plus, RefreshCw, Search, MapPin, ExternalLink, MessageCircle,
  CheckCircle, Clock, XCircle, Send, FileText, ChevronDown, ChevronUp,
  Copy, Filter, BarChart3, Calendar, Trash2, UserPlus, AlertCircle, Bell,
  Pencil, X, QrCode, Link2, DollarSign, TrendingUp, UserCheck, Image,
  CalendarClock, Handshake, Gift, Loader2, Mail
} from 'lucide-react';

type Tab = 'add' | 'pipeline' | 'follow-up' | 'partners' | 'templates';
type OutreachStatus = 'not_started' | 'dm_sent' | 'awaiting_response' | 'approved' | 'posted' | 'declined' | 'no_response';
type ResponseType = 'interested' | 'maybe_later' | 'not_interested' | 'posted' | 'no_response';
type GroupType = 'travel_ball' | 'rec_league' | 'showcase' | 'tournament' | 'coaching' | 'parents' | 'equipment' | 'other';

interface FinderFeePartner {
  id: string;
  partner_code: string;
  partner_email: string;
  partner_name: string;
  enabled: boolean;
  is_recurring: boolean;
}

interface FBPageAdmin {
  id: string;
  admin_name: string;
  admin_profile_url: string | null;
  admin_email: string | null;
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
  // Partner link
  finder_fee_partner_id: string | null;
  finder_fee_partner: FinderFeePartner | null;
  // Trial tracking
  trial_granted_at: string | null;
  trial_granted_to_email: string | null;
  trial_expires_at: string | null;
  // Template tracking
  template_used: string | null;
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
  is_member: boolean;
}

interface Template {
  id: string;
  template_name: string;
  template_type: string;
  target_category: string;
  body: string;
  context_note: string | null;
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
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                Facebook Outreach Pipeline
              </h1>
              <p className="text-white/50 text-sm sm:text-base">
                Track admin DMs and group posts — Starting with Florida
              </p>
            </div>

            {/* Admin Navigation */}

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
    is_member: false,
  });
  const [admins, setAdmins] = useState([{ name: '', profile_url: '', email: '' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const addAdmin = () => setAdmins([...admins, { name: '', profile_url: '', email: '' }]);
  const removeAdmin = (index: number) => {
    if (admins.length > 1) setAdmins(admins.filter((_, i) => i !== index));
  };
  const updateAdmin = (index: number, field: 'name' | 'profile_url' | 'email', value: string) => {
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
          is_member: false,
        });
        setAdmins([{ name: '', profile_url: '', email: '' }]);
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
                  <div className="flex-1">
                    <input
                      type="email"
                      value={admin.email}
                      onChange={(e) => updateAdmin(index, 'email', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500/50"
                      placeholder="Email (for partner sync)"
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

          {/* Member Status */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_member}
                onChange={(e) => setFormData({ ...formData, is_member: e.target.checked })}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-sm font-medium text-white/70">
                I am a member of this group
              </span>
              <span className="text-xs text-white/40">
                (You can only DM admins if you&apos;re a member)
              </span>
            </label>
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
  const [editingAdmin, setEditingAdmin] = useState<{ admin: FBPageAdmin; pageId: string } | null>(null);
  const [adminForm, setAdminForm] = useState({ name: '', profile_url: '', email: '' });
  const [addingAdminToPage, setAddingAdminToPage] = useState<string | null>(null);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', profile_url: '', email: '' });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editingPageNotes, setEditingPageNotes] = useState<string | null>(null);
  const [pageNotesValue, setPageNotesValue] = useState('');
  const [savingPageNotes, setSavingPageNotes] = useState(false);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  // Fetch DM templates for quick access in Pipeline view
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/fb-outreach/templates', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json();
      if (data.templates) {
        // Only keep DM (initial) templates
        setTemplates(data.templates.filter((t: Template) => t.template_type === 'initial'));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

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
  useEffect(() => { fetchTemplates(); }, []);

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

  const updatePageStatus = async (id: string, updates: Record<string, unknown>) => {
    try {
      await fetch('/api/admin/fb-outreach/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
        body: JSON.stringify({ id, ...updates }),
      });
      fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Error updating page:', error);
    }
  };

  const savePageNotes = async (pageId: string) => {
    setSavingPageNotes(true);
    try {
      await fetch('/api/admin/fb-outreach/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
        body: JSON.stringify({ id: pageId, notes: pageNotesValue }),
      });
      setEditingPageNotes(null);
      fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Error saving page notes:', error);
    } finally {
      setSavingPageNotes(false);
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

  const bulkDeletePages = async () => {
    if (selectedPages.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedPages.size} selected page${selectedPages.size > 1 ? 's' : ''}?`)) return;

    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedPages);
      await fetch(`/api/admin/fb-outreach/pages?ids=${ids.join(',')}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': adminPassword },
      });
      setSelectedPages(new Set());
      fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Error bulk deleting pages:', error);
    } finally {
      setBulkDeleting(false);
    }
  };

  const togglePageSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages.map(p => p.id)));
    }
  };

  const updateAdmin = async () => {
    if (!editingAdmin) return;
    try {
      await fetch('/api/admin/fb-outreach/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
        body: JSON.stringify({
          admin_id: editingAdmin.admin.id,
          admin_email: adminForm.email || null,
        }),
      });
      setEditingAdmin(null);
      fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Error updating admin:', error);
    }
  };

  const addNewAdmin = async (pageId: string) => {
    if (!newAdminForm.name.trim()) return;
    try {
      await fetch('/api/admin/fb-outreach/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': adminPassword },
        body: JSON.stringify({
          page_id: pageId,
          admin_name: newAdminForm.name.trim(),
          admin_profile_url: newAdminForm.profile_url.trim() || null,
          admin_email: newAdminForm.email.trim() || null,
        }),
      });
      setAddingAdminToPage(null);
      setNewAdminForm({ name: '', profile_url: '', email: '' });
      fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  const deleteAdmin = async (adminId: string) => {
    if (!confirm('Delete this admin?')) return;
    try {
      await fetch(`/api/admin/fb-outreach/admins?admin_id=${adminId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': adminPassword },
      });
      fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Error deleting admin:', error);
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

      {/* Results count & Bulk Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-white/40">{pages.length} groups found</p>
          {pages.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPages.size === pages.length && pages.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50"
              />
              <span className="text-xs text-white/50">Select All</span>
            </label>
          )}
        </div>
        {selectedPages.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60">{selectedPages.size} selected</span>
            <Button
              variant="danger"
              size="sm"
              icon={bulkDeleting ? Loader2 : Trash2}
              onClick={bulkDeletePages}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : `Delete ${selectedPages.size}`}
            </Button>
            <button
              onClick={() => setSelectedPages(new Set())}
              className="text-xs text-white/40 hover:text-white/60"
            >
              Clear
            </button>
          </div>
        )}
      </div>

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
              <Card key={page.id} variant="default" className={`${selectedPages.has(page.id) ? 'ring-1 ring-orange-500/50' : ''}`}>
                {/* Header Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedPage(isExpanded ? null : page.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox for selection */}
                    <div
                      onClick={(e) => togglePageSelection(page.id, e)}
                      className="flex items-center justify-center"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPages.has(page.id)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50 cursor-pointer"
                      />
                    </div>

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
                        {admins.length > 0 ? (
                          <span className="text-emerald-400/70">{admins.length} admin{admins.length > 1 ? 's' : ''}</span>
                        ) : (
                          <span className="text-yellow-400/70">No admins</span>
                        )}
                        {urgency && (
                          <span className={`text-${urgency.color}-400`}>{urgency.label}</span>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="hidden sm:flex items-center gap-2">
                      {/* Member Status Badge - Clickable to toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePageStatus(page.id, { is_member: !page.is_member });
                        }}
                        className={`p-1.5 rounded-lg border transition-all hover:scale-105 ${
                          page.is_member
                            ? 'bg-emerald-500/20 border-emerald-500/30'
                            : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20'
                        }`}
                        title={page.is_member ? 'Member - Click to mark as not member' : 'Not a member - Click to mark as member'}
                      >
                        <Users className={`w-4 h-4 ${page.is_member ? 'text-emerald-400' : 'text-red-400/60'}`} />
                      </button>

                      {/* Trial Status Badge */}
                      {(() => {
                        const hasActiveTrial = admins.some(a =>
                          a.trial_granted_at && a.trial_expires_at && new Date(a.trial_expires_at) > new Date()
                        );
                        const hasAnyTrial = admins.some(a => a.trial_granted_at);

                        if (hasActiveTrial) {
                          return (
                            <span className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30" title="Active Trial">
                              <Gift className="w-4 h-4 text-emerald-400 animate-pulse" />
                            </span>
                          );
                        } else if (hasAnyTrial) {
                          return (
                            <span className="p-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30" title="Trial Expired">
                              <Gift className="w-4 h-4 text-orange-400" />
                            </span>
                          );
                        } else {
                          return (
                            <span className="p-1.5 rounded-lg bg-white/5 border border-white/10" title="No Trial">
                              <Gift className="w-4 h-4 text-white/20" />
                            </span>
                          );
                        }
                      })()}

                      {/* Admin Status Badge */}
                      {admins.length > 0 ? (
                        <span className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30" title={`${admins.length} Admin${admins.length > 1 ? 's' : ''}`}>
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30" title="No Admins">
                          <Users className="w-4 h-4 text-yellow-400/50" />
                        </span>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      {/* Follow-up Date Indicator */}
                      {(() => {
                        const followUpDates = admins
                          .map(a => a.next_follow_up)
                          .filter(Boolean)
                          .sort();
                        const nextFollowUp = followUpDates[0];
                        if (!nextFollowUp) return null;

                        const followUpDate = new Date(nextFollowUp);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const diffDays = Math.ceil((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                        let colorClass = 'bg-white/10 text-white/50 border-white/20'; // Future
                        if (diffDays < 0) {
                          colorClass = 'bg-red-500/20 text-red-400 border-red-500/30'; // Overdue
                        } else if (diffDays === 0) {
                          colorClass = 'bg-orange-500/20 text-orange-400 border-orange-500/30'; // Today
                        } else if (diffDays <= 2) {
                          colorClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; // Soon
                        }

                        const displayDate = followUpDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                        return (
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium border ${colorClass}`}
                            title={`Follow-up: ${followUpDate.toLocaleDateString()}`}
                          >
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {diffDays < 0 ? `${Math.abs(diffDays)}d ago` : diffDays === 0 ? 'Today' : displayDate}
                          </span>
                        );
                      })()}
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

                        {/* Group Notes */}
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-wide">Group Notes</label>
                          {editingPageNotes === page.id ? (
                            <div className="mt-1 space-y-2">
                              <textarea
                                value={pageNotesValue}
                                onChange={(e) => setPageNotesValue(e.target.value)}
                                placeholder="Add notes about this group..."
                                rows={3}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => savePageNotes(page.id)}
                                  disabled={savingPageNotes}
                                  className="px-3 py-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                                >
                                  {savingPageNotes ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditingPageNotes(null)}
                                  className="px-3 py-1.5 bg-white/5 text-white/50 border border-white/10 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingPageNotes(page.id);
                                setPageNotesValue(page.notes || '');
                              }}
                              className="mt-1 p-2 bg-white/[0.02] border border-white/[0.06] rounded-lg cursor-pointer hover:bg-white/[0.04] transition-colors min-h-[60px]"
                            >
                              {page.notes ? (
                                <p className="text-sm text-white/70">{page.notes}</p>
                              ) : (
                                <p className="text-sm text-white/30 italic">Click to add notes...</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Admins */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs text-white/40 uppercase tracking-wide">
                            Admins ({admins.length})
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={UserPlus}
                            onClick={() => setAddingAdminToPage(page.id)}
                          >
                            Add
                          </Button>
                        </div>

                        {/* Add Admin Form */}
                        {addingAdminToPage === page.id && (
                          <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                            <input
                              type="text"
                              placeholder="Admin name *"
                              value={newAdminForm.name}
                              onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                            />
                            <input
                              type="url"
                              placeholder="Profile URL (optional)"
                              value={newAdminForm.profile_url}
                              onChange={(e) => setNewAdminForm({ ...newAdminForm, profile_url: e.target.value })}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                            />
                            <input
                              type="email"
                              placeholder="Email (for partner sync)"
                              value={newAdminForm.email}
                              onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                            />
                            <div className="flex gap-2">
                              <Button variant="primary" size="sm" onClick={() => addNewAdmin(page.id)}>Save</Button>
                              <Button variant="ghost" size="sm" onClick={() => { setAddingAdminToPage(null); setNewAdminForm({ name: '', profile_url: '', email: '' }); }}>Cancel</Button>
                            </div>
                          </div>
                        )}

                        {admins.length > 0 ? (
                          <div className="space-y-2">
                            {admins.map((admin) => (
                              <AdminCard
                                key={admin.id}
                                admin={admin}
                                pageId={page.id}
                                templates={templates}
                                isMember={page.is_member}
                                pageName={page.page_name}
                                onEdit={() => {
                                  setEditingAdmin({ admin, pageId: page.id });
                                  setAdminForm({ name: admin.admin_name, profile_url: admin.admin_profile_url || '', email: admin.admin_email || '' });
                                }}
                                onDelete={() => deleteAdmin(admin.id)}
                                onTrialGranted={() => {
                                  fetchPages();
                                  onUpdate();
                                }}
                                onAdminUpdated={() => {
                                  fetchPages();
                                  onUpdate();
                                }}
                              />
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

      {/* Admin Edit Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <Card variant="elevated" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Edit Admin</h3>
              <button
                onClick={() => setEditingAdmin(null)}
                className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
                <p className="text-white">{editingAdmin.admin.admin_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Profile URL</label>
                {editingAdmin.admin.admin_profile_url ? (
                  <a
                    href={editingAdmin.admin.admin_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Profile
                  </a>
                ) : (
                  <p className="text-white/40 text-sm">No profile URL</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Email <span className="text-emerald-400/70">(for partner sync)</span>
                </label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="Enter email for partner auto-link"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
                <p className="text-xs text-white/40 mt-2">
                  When this email matches a Partner Program signup, they'll be automatically linked.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Status</label>
                <p className="text-sm">
                  <span className={`px-2 py-1 rounded-lg text-xs ${
                    ADMIN_RESPONSE_STATUS[editingAdmin.admin.response_status as keyof typeof ADMIN_RESPONSE_STATUS]?.color === 'green'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : ADMIN_RESPONSE_STATUS[editingAdmin.admin.response_status as keyof typeof ADMIN_RESPONSE_STATUS]?.color === 'blue'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ADMIN_RESPONSE_STATUS[editingAdmin.admin.response_status as keyof typeof ADMIN_RESPONSE_STATUS]?.label || 'Not Contacted'}
                  </span>
                </p>
              </div>

              {/* Trial Grant Section */}
              <TrialGrantSection
                admin={editingAdmin.admin}
                email={adminForm.email || editingAdmin.admin.admin_email || ''}
                onTrialGranted={() => {
                  fetchPages();
                  setEditingAdmin(null);
                }}
              />
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-white/[0.06]">
              <Button variant="primary" className="flex-1" onClick={updateAdmin}>
                Save Changes
              </Button>
              <Button variant="ghost" onClick={() => setEditingAdmin(null)}>
                Cancel
              </Button>
            </div>
          </Card>
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

// Template Selector Modal - Full-screen modal for better template selection
function TemplateModal({
  isOpen,
  onClose,
  templates,
  adminName,
  pageName,
  isMember,
  onSelectTemplate,
}: {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  adminName: string;
  pageName: string;
  isMember: boolean;
  onSelectTemplate: (template: Template) => void;
}) {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [filter, setFilter] = useState<'recommended' | 'all' | 'follow_up'>('recommended');

  if (!isOpen) return null;

  const firstName = adminName.split(' ')[0];

  // Sort templates: show non-member templates first if not a member, member templates first if member
  const sortedTemplates = [...templates].sort((a, b) => {
    const aIsNonMember = a.template_name.includes('non_member');
    const bIsNonMember = b.template_name.includes('non_member');
    const aIsFollowUp = a.template_type === 'follow_up';
    const bIsFollowUp = b.template_type === 'follow_up';

    // Follow-ups always at bottom unless filtering for them
    if (filter !== 'follow_up') {
      if (aIsFollowUp && !bIsFollowUp) return 1;
      if (!aIsFollowUp && bIsFollowUp) return -1;
    }

    // Smart sorting based on membership
    if (!isMember) {
      // Not a member: non-member templates first
      if (aIsNonMember && !bIsNonMember) return -1;
      if (!aIsNonMember && bIsNonMember) return 1;
    } else {
      // Is a member: member templates first (non-member at bottom)
      if (aIsNonMember && !bIsNonMember) return 1;
      if (!aIsNonMember && bIsNonMember) return -1;
    }

    return a.template_name.localeCompare(b.template_name);
  });

  // Filter templates
  const filteredTemplates = sortedTemplates.filter(t => {
    if (filter === 'follow_up') return t.template_type === 'follow_up';
    if (filter === 'recommended') {
      // Show recommended based on membership status
      if (!isMember) {
        return t.template_name.includes('non_member') || t.template_type === 'initial';
      }
      return !t.template_name.includes('non_member') && t.template_type === 'initial';
    }
    return t.template_type !== 'follow_up'; // 'all' shows initial templates
  });

  const isRecommended = (template: Template) => {
    if (!isMember) return template.template_name.includes('non_member');
    return !template.template_name.includes('non_member') && template.template_type === 'initial';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0F1123] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Select DM Template</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          <p className="text-sm text-white/50">
            Sending to <span className="text-white font-medium">{firstName}</span> from <span className="text-white/70">{pageName}</span>
          </p>

          {/* Membership Status Alert */}
          <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 ${isMember ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
            <Users className={`w-4 h-4 ${isMember ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className={`text-sm ${isMember ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isMember ? 'You are a member of this group' : 'You are NOT a member - use non-member templates'}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="p-3 border-b border-white/10 flex gap-2 flex-shrink-0">
          <button
            onClick={() => setFilter('recommended')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'recommended' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/50 hover:bg-white/5'}`}
          >
            Recommended
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/50 hover:bg-white/5'}`}
          >
            All Initial
          </button>
          <button
            onClick={() => setFilter('follow_up')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'follow_up' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/50 hover:bg-white/5'}`}
          >
            Follow-up
          </button>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              No templates found for this filter
            </div>
          ) : (
            filteredTemplates.map(template => {
              const isExpanded = expandedTemplate === template.id;
              const recommended = isRecommended(template);
              const filledBody = template.body
                .replace(/\{name\}/gi, firstName)
                .replace(/\{\{name\}\}/gi, firstName)
                .replace(/\{\{admin_name\}\}/gi, firstName);

              return (
                <div
                  key={template.id}
                  className={`rounded-xl border transition-all ${recommended ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'}`}
                >
                  {/* Template Header */}
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-t-xl"
                    onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {recommended && (
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                          Recommended
                        </span>
                      )}
                      <span className="font-medium text-white truncate capitalize">
                        {template.template_name.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${template.template_type === 'follow_up' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {template.template_type === 'follow_up' ? 'Follow-up' : 'Initial'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemplate(template);
                        }}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy & Send
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                    </div>
                  </div>

                  {/* Collapsed Preview */}
                  {!isExpanded && (
                    <div className="px-3 pb-3">
                      <p className="text-sm text-white/40 line-clamp-2">{filledBody.slice(0, 150)}...</p>
                    </div>
                  )}

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3">
                      {/* Context Note */}
                      {template.context_note && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <p className="text-xs text-amber-400/90 font-medium mb-1">When to use:</p>
                          <p className="text-xs text-amber-400/70">{template.context_note}</p>
                        </div>
                      )}

                      {/* Full Template Text */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-sm text-white/80 whitespace-pre-wrap">{filledBody}</p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => onSelectTemplate(template)}
                        className="w-full px-4 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Template & Mark DM Sent
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <p className="text-xs text-white/40 text-center">
            Template will be copied to clipboard and DM will be marked as sent with follow-up in 5 days
          </p>
        </div>
      </div>
    </div>
  );
}

// Admin Card Component with Gift Button and DM Template Selector
function AdminCard({
  admin,
  pageId,
  templates,
  isMember,
  pageName,
  onEdit,
  onDelete,
  onTrialGranted,
  onAdminUpdated,
}: {
  admin: FBPageAdmin;
  pageId: string;
  templates: Template[];
  isMember: boolean;
  pageName: string;
  onEdit: () => void;
  onDelete: () => void;
  onTrialGranted: () => void;
  onAdminUpdated?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDateEditor, setShowDateEditor] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [trialEmail, setTrialEmail] = useState(admin.admin_email || '');
  const [grantingTrial, setGrantingTrial] = useState(false);
  const [trialMessage, setTrialMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dmSentDate, setDmSentDate] = useState(admin.dm_sent_at ? admin.dm_sent_at.split('T')[0] : '');
  const [followUpDate, setFollowUpDate] = useState(admin.next_follow_up || '');
  const [notes, setNotes] = useState(admin.response_notes || '');
  const [selectedTemplateForDate, setSelectedTemplateForDate] = useState(admin.template_used || '');
  const [savingDates, setSavingDates] = useState(false);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  // Calculate follow-up date and urgency
  const dmSentDaysAgo = admin.dm_sent_at ? daysSince(admin.dm_sent_at) : null;
  const shouldFollowUp = dmSentDaysAgo !== null && dmSentDaysAgo >= 5 && admin.response_status !== 'responded' && admin.response_status !== 'approved';
  const followUpUrgent = dmSentDaysAgo !== null && dmSentDaysAgo >= 7;

  // Copy template with admin name filled in AND mark DM as sent
  const handleTemplateSelect = async (template: Template) => {
    const firstName = admin.admin_name.split(' ')[0];
    const filledBody = template.body
      .replace(/\{name\}/gi, firstName)
      .replace(/\{\{name\}\}/gi, firstName)
      .replace(/\{\{admin_name\}\}/gi, firstName);
    navigator.clipboard.writeText(filledBody);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
    setShowTemplateModal(false);

    // Mark DM as sent with template tracking
    try {
      await fetch('/api/admin/fb-outreach/admins', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          admin_id: admin.id,
          dm_sent_at: new Date().toISOString(),
          response_status: 'dm_sent',
          template_used: template.template_name,
          next_follow_up: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
        }),
      });
      onAdminUpdated?.();
    } catch (error) {
      console.error('Error marking DM as sent:', error);
    }
  };

  // Save dates manually
  const saveDates = async () => {
    setSavingDates(true);
    try {
      const updates: Record<string, unknown> = { admin_id: admin.id };
      let shouldUpdatePageStatus = false;

      // Handle DM sent date - set or clear
      if (dmSentDate) {
        updates.dm_sent_at = new Date(dmSentDate).toISOString();
        if (admin.response_status === 'not_contacted') {
          updates.response_status = 'dm_sent';
        }
        shouldUpdatePageStatus = true;
      } else if (admin.dm_sent_at && !dmSentDate) {
        // Clear the date if it was set but now empty
        updates.dm_sent_at = null;
      }

      // Handle follow-up date - set or clear
      if (followUpDate) {
        updates.next_follow_up = followUpDate;
      } else if (admin.next_follow_up && !followUpDate) {
        // Clear the date if it was set but now empty
        updates.next_follow_up = null;
      }

      // Handle notes
      if (notes !== admin.response_notes) {
        updates.response_notes = notes || null;
      }

      // Handle template used - track which template was used
      if (selectedTemplateForDate && dmSentDate) {
        updates.template_used = selectedTemplateForDate;
      }

      await fetch('/api/admin/fb-outreach/admins', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify(updates),
      });
      // Also update the page's outreach_status to dm_sent if DM date was set
      if (shouldUpdatePageStatus) {
        await fetch('/api/admin/fb-outreach/pages', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Password': adminPassword,
          },
          body: JSON.stringify({
            id: pageId,
            outreach_status: 'dm_sent',
          }),
        });
      }
      onAdminUpdated?.();
      setShowDateEditor(false);
    } catch (error) {
      console.error('Error saving dates:', error);
    } finally {
      setSavingDates(false);
    }
  };

  // Mark DM sent today
  const markDmSentToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    const followUp = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDmSentDate(today);
    setFollowUpDate(followUp);
    setSavingDates(true);
    try {
      // Update admin with DM sent date
      await fetch('/api/admin/fb-outreach/admins', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          admin_id: admin.id,
          dm_sent_at: new Date().toISOString(),
          response_status: admin.response_status === 'not_contacted' ? 'dm_sent' : admin.response_status,
          next_follow_up: followUp,
          response_notes: notes || admin.response_notes,
        }),
      });
      // Also update the page's outreach_status to dm_sent
      await fetch('/api/admin/fb-outreach/pages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          id: pageId,
          outreach_status: 'dm_sent',
        }),
      });
      onAdminUpdated?.();
      setShowDateEditor(false);
    } catch (error) {
      console.error('Error marking DM as sent:', error);
    } finally {
      setSavingDates(false);
    }
  };

  const handleGrantTrial = async () => {
    if (!trialEmail.trim()) {
      setTrialMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setGrantingTrial(true);
    setTrialMessage(null);

    try {
      // First save the email if changed
      if (trialEmail !== admin.admin_email) {
        await fetch('/api/admin/fb-outreach/admins', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Password': adminPassword,
          },
          body: JSON.stringify({ admin_id: admin.id, admin_email: trialEmail }),
        });
      }

      // Grant trial
      const response = await fetch('/api/admin/grant-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          email: trialEmail,
          source: 'fb_outreach',
          source_record_id: admin.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTrialMessage({ type: 'success', text: data.message });
        onTrialGranted();
      } else {
        setTrialMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setTrialMessage({ type: 'error', text: 'Failed to grant trial' });
    } finally {
      setGrantingTrial(false);
    }
  };

  const getTrialStatusBadge = () => {
    if (admin.trial_granted_at && admin.trial_expires_at) {
      const expiresAt = new Date(admin.trial_expires_at);
      const now = new Date();
      if (expiresAt > now) {
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return (
          <span className="px-2 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Gift className="w-3 h-3" />
            Trial ({daysLeft}d)
          </span>
        );
      } else {
        return (
          <span className="px-2 py-1 rounded-lg text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
            <Gift className="w-3 h-3" />
            Expired
          </span>
        );
      }
    }
    return null;
  };

  const trialBadge = getTrialStatusBadge();

  return (
    <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${admin.admin_email ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-blue-500/20 border-blue-500/30'} rounded-full flex items-center justify-center border`}>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-white">{admin.admin_name}</p>
              {trialBadge}
              {shouldFollowUp && (
                <span className={`px-2 py-0.5 rounded text-xs ${followUpUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  {followUpUrgent ? 'Follow up now!' : 'Follow up soon'}
                </span>
              )}
            </div>
            <p className="text-xs text-white/40">
              {admin.admin_email ? (
                <span className="text-emerald-400/70">{admin.admin_email}</span>
              ) : (
                <span className="text-yellow-400/70">No email</span>
              )}
              {' • '}
              {ADMIN_RESPONSE_STATUS[admin.response_status as keyof typeof ADMIN_RESPONSE_STATUS]?.label || 'Not Contacted'}
            </p>
            {/* DM Tracking Info */}
            {admin.dm_sent_at && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-blue-400/70">
                  DM sent {dmSentDaysAgo === 0 ? 'today' : `${dmSentDaysAgo}d ago`}
                </span>
                {admin.template_used && (
                  <span className="text-blue-400/70 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    {admin.template_used.replace(/_/g, ' ')}
                  </span>
                )}
                {admin.next_follow_up && (
                  <span className={`${new Date(admin.next_follow_up) <= new Date() ? 'text-amber-400' : 'text-white/30'}`}>
                    • Follow-up: {new Date(admin.next_follow_up).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 relative">
          {/* Send DM Button - Opens Template Modal */}
          <button
            onClick={() => setShowTemplateModal(true)}
            className={`p-2 rounded-lg transition-colors ${
              copiedTemplate
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'hover:bg-blue-500/10 text-white/50 hover:text-blue-400'
            }`}
            title="Send DM - Select Template"
          >
            {copiedTemplate ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
          </button>

          {/* Template Modal */}
          <TemplateModal
            isOpen={showTemplateModal}
            onClose={() => setShowTemplateModal(false)}
            templates={templates}
            adminName={admin.admin_name}
            pageName={pageName}
            isMember={isMember}
            onSelectTemplate={handleTemplateSelect}
          />

          {/* Date Tracking Button */}
          <div className="relative">
            <button
              onClick={() => setShowDateEditor(!showDateEditor)}
              className={`p-2 rounded-lg transition-colors ${
                showDateEditor || admin.dm_sent_at
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'hover:bg-purple-500/10 text-white/50 hover:text-purple-400'
              }`}
              title="Track DM Dates"
            >
              <CalendarClock className="w-4 h-4" />
            </button>

            {/* Date Editor Dropdown - positioned above to avoid cutoff */}
            {showDateEditor && (
              <div className="absolute right-0 bottom-full mb-1 w-72 bg-[#1B1F39] border border-white/10 rounded-xl shadow-xl z-[100] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">Track DM Dates</h4>
                  <button onClick={() => setShowDateEditor(false)} className="text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Action */}
                <button
                  onClick={markDmSentToday}
                  disabled={savingDates}
                  className="w-full mb-3 px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                >
                  {savingDates ? 'Saving...' : '📤 Mark DM Sent Today'}
                </button>

                <div className="text-xs text-white/40 text-center mb-3">— or set custom dates —</div>

                {/* DM Sent Date */}
                <div className="mb-3">
                  <label className="block text-xs text-white/50 mb-1">DM Sent Date</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dmSentDate}
                      onChange={(e) => setDmSentDate(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                    {dmSentDate && (
                      <button
                        onClick={() => setDmSentDate('')}
                        className="px-2 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Clear date"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Template Used - Required when setting DM date */}
                {dmSentDate && (
                  <div className="mb-3">
                    <label className="block text-xs text-white/50 mb-1">
                      Template Used <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={selectedTemplateForDate}
                      onChange={(e) => setSelectedTemplateForDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="">Select template...</option>
                      {templates.filter(t => t.template_type !== 'post').map(template => (
                        <option key={template.id} value={template.template_name}>
                          {template.template_name.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                    {!selectedTemplateForDate && (
                      <p className="text-xs text-amber-400/70 mt-1">Please select which template you used</p>
                    )}
                  </div>
                )}

                {/* Follow-up Date */}
                <div className="mb-3">
                  <label className="block text-xs text-white/50 mb-1">Follow-up Date</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
                    />
                    {followUpDate && (
                      <button
                        onClick={() => setFollowUpDate('')}
                        className="px-2 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Clear date"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-3">
                  <label className="block text-xs text-white/50 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this contact..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={saveDates}
                  disabled={Boolean(savingDates || (
                    !dmSentDate && !followUpDate && !notes &&
                    !admin.dm_sent_at && !admin.next_follow_up
                  ) || (dmSentDate && !selectedTemplateForDate))}
                  className="w-full px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                >
                  {savingDates ? 'Saving...' : (dmSentDate && !selectedTemplateForDate ? 'Select Template First' : 'Save')}
                </button>

                {/* Current Status */}
                {admin.dm_sent_at && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/50 space-y-1">
                    <p>Sent: {new Date(admin.dm_sent_at).toLocaleDateString()}</p>
                    {admin.template_used && (
                      <p className="text-blue-400/70">Template: {admin.template_used.replace(/_/g, ' ')}</p>
                    )}
                    {admin.next_follow_up && (
                      <p>Follow-up: {new Date(admin.next_follow_up).toLocaleDateString()}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-2 rounded-lg transition-colors ${expanded ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/10 text-white/50'}`}
            title="Trial & Email"
          >
            <Gift className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Edit Admin"
          >
            <Pencil className="w-4 h-4" />
          </button>
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
          <button
            onClick={onDelete}
            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete Admin"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Trial Section */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/60">Contact Email & Trial</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="user@example.com"
              value={trialEmail}
              onChange={(e) => setTrialEmail(e.target.value)}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={handleGrantTrial}
              disabled={grantingTrial || !trialEmail.trim() || !!admin.trial_granted_at}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                admin.trial_granted_at
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : grantingTrial
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90'
              }`}
            >
              {grantingTrial ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Granting...
                </>
              ) : admin.trial_granted_at ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Granted
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  Grant Trial
                </>
              )}
            </button>
          </div>
          {trialMessage && (
            <div className={`mt-2 text-sm ${trialMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {trialMessage.text}
            </div>
          )}
          {admin.trial_granted_at && admin.trial_granted_to_email && (
            <div className="mt-2 text-xs text-white/40">
              Granted to {admin.trial_granted_to_email} on {new Date(admin.trial_granted_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Trial Grant Section Component for FB Admins
function TrialGrantSection({
  admin,
  email,
  onTrialGranted,
}: {
  admin: FBPageAdmin;
  email: string;
  onTrialGranted: () => void;
}) {
  const [grantingTrial, setGrantingTrial] = useState(false);
  const [trialMessage, setTrialMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const handleGrantTrial = async () => {
    if (!email.trim()) {
      setTrialMessage({ type: 'error', text: 'Please enter an email address first' });
      return;
    }

    setGrantingTrial(true);
    setTrialMessage(null);

    try {
      const response = await fetch('/api/admin/grant-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          email: email,
          source: 'fb_outreach',
          source_record_id: admin.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTrialMessage({ type: 'success', text: data.message });
        setTimeout(() => onTrialGranted(), 1500);
      } else {
        setTrialMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setTrialMessage({ type: 'error', text: 'Failed to grant trial' });
    } finally {
      setGrantingTrial(false);
    }
  };

  const getTrialStatusBadge = () => {
    if (admin.trial_granted_at && admin.trial_expires_at) {
      const expiresAt = new Date(admin.trial_expires_at);
      const now = new Date();
      if (expiresAt > now) {
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return (
          <span className="px-2 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Gift className="w-3 h-3" />
            Trial Active ({daysLeft}d left)
          </span>
        );
      } else {
        return (
          <span className="px-2 py-1 rounded-lg text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
            <Gift className="w-3 h-3" />
            Trial Expired
          </span>
        );
      }
    }
    return null;
  };

  const trialBadge = getTrialStatusBadge();

  return (
    <div className="pt-4 border-t border-white/[0.06]">
      <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
        <Gift className="w-4 h-4 text-emerald-400" />
        30-Day Pro Trial
      </label>

      {trialBadge && (
        <div className="mb-3">
          {trialBadge}
          {admin.trial_granted_to_email && (
            <p className="text-xs text-white/40 mt-1">
              Granted to {admin.trial_granted_to_email} on {new Date(admin.trial_granted_at!).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {!admin.trial_granted_at && (
        <>
          <button
            onClick={handleGrantTrial}
            disabled={grantingTrial || !email.trim()}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              !email.trim()
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : grantingTrial
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90'
            }`}
          >
            {grantingTrial ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Granting...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                Grant 30-Day Pro Trial
              </>
            )}
          </button>
          {!email.trim() && (
            <p className="text-xs text-yellow-400/70 mt-2">
              Add email above to enable trial grant
            </p>
          )}
        </>
      )}

      {trialMessage && (
        <div className={`mt-2 text-sm ${trialMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {trialMessage.text}
        </div>
      )}
    </div>
  );
}

interface TemplateStats {
  name: string;
  used: number;
  responses: number;
  conversions: number;
  responseRate: number;
  conversionRate: number;
}

interface TemplateStatsData {
  stats: TemplateStats[];
  totals: {
    totalUsed: number;
    totalResponses: number;
    totalConversions: number;
    overallResponseRate: number;
    overallConversionRate: number;
  };
}

function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'fb_group' | 'x_influencer'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'initial' | 'post' | 'follow_up'>('all');
  const [showTips, setShowTips] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [templateStats, setTemplateStats] = useState<TemplateStatsData | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const [templatesRes, statsRes] = await Promise.all([
          fetch('/api/admin/fb-outreach/templates', {
            headers: { 'X-Admin-Password': adminPassword },
          }),
          fetch('/api/admin/fb-outreach/template-stats', {
            headers: { 'X-Admin-Password': adminPassword },
          }),
        ]);
        const templatesData = await templatesRes.json();
        const statsData = await statsRes.json();
        if (templatesData.templates) setTemplates(templatesData.templates);
        if (statsData.success) setTemplateStats(statsData);
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
    // Category filter
    if (categoryFilter !== 'all' && t.target_category !== categoryFilter) return false;
    // Type filter
    if (typeFilter === 'initial') return t.template_type === 'initial';
    if (typeFilter === 'post') return t.template_type === 'post';
    if (typeFilter === 'follow_up') return t.template_type === 'follow_up';
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

        <div className="flex flex-col gap-2">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'fb_group', 'x_influencer'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setCategoryFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  categoryFilter === f
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/[0.03] text-white/50 border border-white/[0.08] hover:bg-white/[0.06]'
                }`}
              >
                {f === 'all' ? '📋 All' : f === 'fb_group' ? '👥 FB Groups' : '🐦 X/Twitter'}
              </button>
            ))}
          </div>
          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'initial', 'post', 'follow_up'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === f
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-white/[0.03] text-white/50 border border-white/[0.08] hover:bg-white/[0.06]'
                }`}
              >
                {f === 'all' ? 'All Types' : f === 'initial' ? 'DM' : f === 'post' ? 'Post' : 'Follow-up'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template Performance Analytics - Collapsible */}
      <div className="mb-6">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📊</span>
            <span className="font-medium text-purple-400">Template Performance</span>
            {templateStats && (
              <span className="text-xs text-white/40 hidden sm:inline">
                {templateStats.totals.totalUsed} sent • {templateStats.totals.overallResponseRate}% response rate
              </span>
            )}
          </div>
          {showStats ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
        </button>

        {showStats && templateStats && (
          <div className="mt-3 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                <p className="text-2xl font-bold text-blue-400">{templateStats.totals.totalUsed}</p>
                <p className="text-xs text-white/50">Total DMs Sent</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-2xl font-bold text-emerald-400">{templateStats.totals.totalResponses}</p>
                <p className="text-xs text-white/50">Responses</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-2xl font-bold text-purple-400">{templateStats.totals.overallResponseRate}%</p>
                <p className="text-xs text-white/50">Response Rate</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-2xl font-bold text-amber-400">{templateStats.totals.totalConversions}</p>
                <p className="text-xs text-white/50">Conversions</p>
              </div>
            </div>

            {/* Per-Template Stats */}
            {templateStats.stats.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white/70 mb-3">Performance by Template</h4>
                {templateStats.stats.map((stat) => (
                  <div
                    key={stat.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {stat.name.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <p className="font-bold text-blue-400">{stat.used}</p>
                        <p className="text-white/40">sent</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-emerald-400">{stat.responses}</p>
                        <p className="text-white/40">replies</p>
                      </div>
                      <div className="text-center min-w-[50px]">
                        <p className={`font-bold ${stat.responseRate >= 30 ? 'text-emerald-400' : stat.responseRate >= 15 ? 'text-amber-400' : 'text-white/60'}`}>
                          {stat.responseRate}%
                        </p>
                        <p className="text-white/40">rate</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-white/40 text-sm py-4">
                No template usage data yet. Templates will appear here once DMs are tracked.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Strategy Tips - Collapsible */}
      <div className="mb-6">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <span className="font-medium text-emerald-400">Outreach Strategy Tips</span>
            <span className="text-xs text-white/40 hidden sm:inline">Copy/paste ready • Execution checklist</span>
          </div>
          {showTips ? <ChevronUp className="w-5 h-5 text-emerald-400" /> : <ChevronDown className="w-5 h-5 text-emerald-400" />}
        </button>

        {showTips && (
          <div className="mt-3 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-6">
            {/* Send Times */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">1️⃣ Send Times (Matters More Than You Think)</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-green-400 font-medium mb-1">✅ Best</p>
                  <p className="text-white/70">Tue–Thu</p>
                  <p className="text-white/70">8:30–10:30am or 7:30–9:00pm</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 font-medium mb-1">❌ Avoid</p>
                  <p className="text-white/70">Midday, Late night</p>
                  <p className="text-white/70">Weekends (admins are buried)</p>
                </div>
              </div>
            </div>

            {/* One Message Rule */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">2️⃣ One Message. One Follow-Up. Stop.</h4>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white/70">
                <p>• DM once</p>
                <p>• Follow up once after 5–7 days</p>
                <p>• If no response → <span className="text-amber-400">do not chase</span></p>
                <p className="mt-2 text-white/50 italic">Admins remember restraint.</p>
              </div>
            </div>

            {/* No Links Rule */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">3️⃣ Do NOT Paste Links in First DM</h4>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                <p className="text-amber-400 mb-2">Wait until they say:</p>
                <p className="text-white/70">• &quot;sure&quot; • &quot;what is it?&quot; • &quot;send info&quot;</p>
                <p className="mt-2 text-white/50 italic">This alone increases reply rate.</p>
              </div>
            </div>

            {/* Don&apos;t Over-Customize */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">4️⃣ Do NOT Customize Too Much</h4>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-white/70">
                <p className="text-red-400 mb-1">❌ No:</p>
                <p>• Over-personalization</p>
                <p>• Name-dropping kids/teams</p>
                <p>• Long Florida backstory</p>
                <p className="mt-2 text-green-400">✅ One optional line max:</p>
                <p className="text-white/50 italic">&quot;Especially with how competitive Florida travel ball is…&quot;</p>
              </div>
            </div>

            {/* If They Say Sure */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">5️⃣ If They Say &quot;Sure&quot; — Reply Like This</h4>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                <p className="text-white/80 whitespace-pre-line">{`Appreciate it — thank you.

Here's a short post you can drop into the group as-is.
If you want anything tweaked for your audience, happy to adjust.

[PASTE POST]`}</p>
                <p className="mt-2 text-white/50 italic">No selling. No extra explanation.</p>
              </div>
            </div>

            {/* Follow-Up Template */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">6️⃣ If No Reply — Your Follow-Up (ONLY ONE)</h4>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm">
                <p className="text-white/80 whitespace-pre-line">{`Hey {name} — just bubbling this once in case it got buried.

If you've ever seen a talented kid tighten up or spiral during tryouts,
that's the exact gap we built this for.

Either way, appreciate you taking a look.
— Jeff`}</p>
                <p className="mt-2 text-amber-400 font-medium">Then stop.</p>
              </div>
            </div>

            {/* Pushback Response */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">7️⃣ If They Push Back</h4>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm">
                <p className="text-white/50 mb-2">If they say: &quot;We don&apos;t allow promotion&quot; / &quot;No apps&quot; / &quot;Not interested&quot;</p>
                <p className="text-white/80 whitespace-pre-line">{`Totally understand — appreciate you letting me know.
Thanks for running the group.
— Jeff`}</p>
                <p className="mt-2 text-green-400 italic">That response gets remembered.</p>
              </div>
            </div>

            {/* Mindset */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <h4 className="text-sm font-semibold text-indigo-400 mb-2">🧠 MINDSET</h4>
              <p className="text-sm text-white/70 mb-2">This is not marketing. This is founder outreach offering a resource during a real pain point.</p>
              <p className="text-sm text-white/70">You&apos;re not asking for money, endorsement, or time. <span className="text-indigo-400 font-medium">You&apos;re asking for permission.</span></p>
            </div>

            {/* Daily Targets */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/[0.06]">
              <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-400 font-medium">Daily Target</p>
                <p className="text-lg text-white font-bold">10–15 DMs</p>
              </div>
              <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-400 font-medium">Before Refining</p>
                <p className="text-lg text-white font-bold">30+ sent</p>
              </div>
              <div className="flex-1 flex items-center justify-end">
                <p className="text-sm text-white/40 italic">Track who replies. Refine nothing until you&apos;ve sent 30+ messages.</p>
              </div>
            </div>
          </div>
        )}
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
            <div
              key={template.id}
              onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
              className={`cursor-pointer transition-all rounded-2xl ${expandedId === template.id ? 'ring-1 ring-orange-500/30' : ''}`}
            >
              <Card variant="default" className="p-5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-medium text-white capitalize">
                      {template.template_name.replace(/_/g, ' ')}
                    </h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        template.target_category === 'x_influencer'
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {template.target_category === 'x_influencer' ? '🐦 X/Twitter' : '👥 FB Group'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        template.template_type === 'initial'
                          ? 'bg-blue-500/20 text-blue-400'
                          : template.template_type === 'post'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {template.template_type === 'initial' ? 'DM' : template.template_type === 'post' ? 'Post' : 'Follow-up'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={copiedId === template.id ? 'primary' : 'secondary'}
                    size="sm"
                    icon={copiedId === template.id ? CheckCircle : Copy}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyTemplate(template);
                    }}
                  >
                    {copiedId === template.id ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                {/* Context Note - When to use this template */}
                {template.context_note && (
                  <div className="mb-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400 leading-relaxed">
                      <span className="font-semibold">When to use:</span> {template.context_note}
                    </p>
                  </div>
                )}
                <p className={`text-sm text-white/60 whitespace-pre-wrap ${expandedId === template.id ? '' : 'line-clamp-4'}`}>{template.body}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-orange-400">
                    {expandedId === template.id ? '▲ Tap to collapse' : '▼ Tap to expand'}
                  </span>
                  {expandedId !== template.id && (
                    <span className="text-xs text-white/30">Preview</span>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
