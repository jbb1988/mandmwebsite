'use client';

import { useState, useEffect } from 'react';
import AdminGate from '@/components/AdminGate';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import {
  Users, Plus, RefreshCw, Search, MapPin, ExternalLink, MessageCircle,
  CheckCircle, Clock, XCircle, Send, FileText, ChevronDown, ChevronUp,
  Copy, Filter, BarChart3, Calendar, Trash2, UserPlus, AlertCircle, Bell
} from 'lucide-react';

type Tab = 'add' | 'pipeline' | 'templates';
type OutreachStatus = 'not_started' | 'dm_sent' | 'awaiting_response' | 'approved' | 'posted' | 'declined' | 'no_response';
type GroupType = 'travel_ball' | 'rec_league' | 'showcase' | 'tournament' | 'coaching' | 'parents' | 'equipment' | 'other';

interface FBPageAdmin {
  id: string;
  admin_name: string;
  admin_profile_url: string | null;
  is_primary: boolean;
  dm_sent_at: string | null;
  response_status: string;
}

interface FBPage {
  id: string;
  page_name: string;
  page_url: string;
  admin_name: string | null; // Legacy field
  admin_profile_url: string | null; // Legacy field
  fb_page_admins: FBPageAdmin[]; // New admins array
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

// Helper function to calculate days since a date
function daysSince(date: string | null): number | null {
  if (!date) return null;
  const sent = new Date(date);
  const now = new Date();
  const diff = now.getTime() - sent.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Get follow-up urgency based on days since DM
function getFollowUpUrgency(days: number | null): { label: string; color: string; urgent: boolean } | null {
  if (days === null) return null;
  if (days >= 7) return { label: `${days}d - Follow up!`, color: 'red', urgent: true };
  if (days >= 3) return { label: `${days}d - Consider follow-up`, color: 'yellow', urgent: false };
  if (days >= 1) return { label: `${days}d ago`, color: 'gray', urgent: false };
  return { label: 'Today', color: 'green', urgent: false };
}

// Admin response status options
const ADMIN_RESPONSE_STATUS = {
  not_contacted: { label: 'Not Contacted', color: 'gray' },
  dm_sent: { label: 'DM Sent', color: 'blue' },
  responded: { label: 'Responded', color: 'cyan' },
  approved: { label: 'Approved', color: 'green' },
  declined: { label: 'Declined', color: 'red' },
  no_response: { label: 'No Response', color: 'orange' },
};

export default function AdminFBOutreachPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pipeline');
  const [stats, setStats] = useState<Stats>({ total: 0, byStatus: {} as Record<OutreachStatus, number>, byState: {} });
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';
  // Note: adminPassword is still used for API calls

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
              <h1 className="text-3xl font-bold mb-2">Facebook Outreach Pipeline</h1>
              <p className="text-gray-400">Track admin DMs and group posts - Starting with Florida</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <LiquidGlass className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-gray-400">Total Pages</p>
                </div>
              </LiquidGlass>
              <LiquidGlass className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-400">{stats.byStatus?.not_started || 0}</p>
                  <p className="text-xs text-gray-400">Not Started</p>
                </div>
              </LiquidGlass>
              <LiquidGlass className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats.byStatus?.dm_sent || 0}</p>
                  <p className="text-xs text-gray-400">DMs Sent</p>
                </div>
              </LiquidGlass>
              <LiquidGlass className="p-4 border-2 border-red-500/30">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{stats.needsFollowUp || 0}</p>
                  <p className="text-xs text-red-400 flex items-center justify-center gap-1">
                    <Bell className="w-3 h-3" /> Follow Up!
                  </p>
                </div>
              </LiquidGlass>
              <LiquidGlass className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{stats.byStatus?.approved || 0}</p>
                  <p className="text-xs text-gray-400">Approved</p>
                </div>
              </LiquidGlass>
              <LiquidGlass className="p-4 border-2 border-green-500/30">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{stats.readyToPost || 0}</p>
                  <p className="text-xs text-green-400">Ready to Post</p>
                </div>
              </LiquidGlass>
              <LiquidGlass className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{stats.byStatus?.posted || 0}</p>
                  <p className="text-xs text-gray-400">Posted</p>
                </div>
              </LiquidGlass>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center gap-2 md:gap-4 mb-8 flex-wrap">
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-medium transition-all text-sm md:text-base ${
                  activeTab === 'pipeline'
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">Pipeline</span>
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-medium transition-all text-sm md:text-base ${
                  activeTab === 'add'
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Page</span>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-medium transition-all text-sm md:text-base ${
                  activeTab === 'templates'
                    ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Templates</span>
              </button>
            </div>

            {/* Tab Content */}
            <LiquidGlass className="p-6 md:p-8">
              {activeTab === 'pipeline' && <PipelineTab onUpdate={fetchStats} />}
              {activeTab === 'add' && <AddPageTab onSuccess={fetchStats} />}
              {activeTab === 'templates' && <TemplatesTab />}
            </LiquidGlass>
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

  const addAdmin = () => {
    setAdmins([...admins, { name: '', profile_url: '' }]);
  };

  const removeAdmin = (index: number) => {
    if (admins.length > 1) {
      setAdmins(admins.filter((_, i) => i !== index));
    }
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
          admins: admins.filter(a => a.name.trim()), // Only send admins with names
          member_count: formData.member_count ? parseInt(formData.member_count) : null,
          priority_score: parseInt(formData.priority_score),
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setFormData({
          page_name: '',
          page_url: '',
          state: 'FL',
          member_count: '',
          group_type: 'travel_ball',
          sport: 'baseball',
          priority_score: '3',
          notes: '',
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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
          <Plus className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Add Facebook Page/Group</h2>
          <p className="text-gray-400">Track a new travel ball group for outreach</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Group Name *</label>
            <input
              type="text"
              required
              value={formData.page_name}
              onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50"
              placeholder="e.g., Florida Travel Ball Connect"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Group URL *</label>
            <input
              type="url"
              required
              value={formData.page_url}
              onChange={(e) => setFormData({ ...formData, page_url: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50"
              placeholder="https://facebook.com/groups/..."
            />
          </div>

          {/* Admins Section */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Group Admins</label>
              <button
                type="button"
                onClick={addAdmin}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
              >
                <UserPlus className="w-3 h-3" /> Add Admin
              </button>
            </div>
            <div className="space-y-3">
              {admins.map((admin, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={admin.name}
                      onChange={(e) => updateAdmin(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 text-sm"
                      placeholder={`Admin ${index + 1} name`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={admin.profile_url}
                      onChange={(e) => updateAdmin(index, 'profile_url', e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 text-sm"
                      placeholder="Profile URL (optional)"
                    />
                  </div>
                  {admins.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAdmin(index)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">First admin is marked as primary contact</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
            <select
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500/50"
            >
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Member Count</label>
            <input
              type="number"
              value={formData.member_count}
              onChange={(e) => {
                const members = parseInt(e.target.value) || 0;
                // Auto-calculate priority based on member count
                let priority = '1';
                if (members >= 10000) priority = '5';
                else if (members >= 5000) priority = '4';
                else if (members >= 1000) priority = '3';
                else if (members >= 500) priority = '2';
                setFormData({ ...formData, member_count: e.target.value, priority_score: priority });
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50"
              placeholder="e.g., 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Group Type</label>
            <select
              value={formData.group_type}
              onChange={(e) => setFormData({ ...formData, group_type: e.target.value as GroupType })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500/50"
            >
              <option value="travel_ball">Travel Ball</option>
              <option value="rec_league">Rec League</option>
              <option value="showcase">Showcase</option>
              <option value="tournament">Tournament</option>
              <option value="coaching">Coaching</option>
              <option value="parents">Parents</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sport</label>
            <select
              value={formData.sport}
              onChange={(e) => setFormData({ ...formData, sport: e.target.value as 'baseball' | 'softball' | 'both' })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-green-500/50"
            >
              <option value="baseball">Baseball</option>
              <option value="softball">Softball</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority (1-5)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority_score: String(star) })}
                  className={`text-2xl transition-colors ${
                    parseInt(formData.priority_score) >= star ? 'text-orange-400' : 'text-gray-600'
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-400">
                {formData.priority_score}/5
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Auto-set by members: &lt;500=1, &lt;1K=2, &lt;5K=3, &lt;10K=4, 10K+=5
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50"
              placeholder="Any notes about this group..."
              rows={3}
            />
          </div>
        </div>

        <LiquidButton type="submit" disabled={loading} variant="orange" fullWidth>
          {loading ? 'Adding...' : 'Add to Pipeline'}
        </LiquidButton>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-xl ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          <p className={result.success ? 'text-green-400' : 'text-red-400'}>{result.message}</p>
        </div>
      )}
    </div>
  );
}

function PipelineTab({ onUpdate }: { onUpdate: () => void }) {
  const [pages, setPages] = useState<FBPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    state: 'FL',
    status: 'all',
    search: '',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const fetchPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        state: filters.state,
        status: filters.status,
        search: filters.search,
      });
      const response = await fetch(`/api/admin/fb-outreach/pages?${params}`, {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json();
      if (data.pages) {
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [filters]);

  // DM Template - personalized for each group
  const getDMTemplate = (page: FBPage, adminName?: string) => {
    const name = adminName || page.fb_page_admins?.[0]?.admin_name || 'there';
    const firstName = name.split(' ')[0];
    return `Hey ${firstName} - love what you're doing with ${page.page_name}.

Quick question: Are most teams in your group juggling GroupMe + GameChanger + random text threads for schedules?

We built Mind & Muscle specifically for travel ball - FREE team chat, scheduling, and uniform coordination in one app. Parents get access without paying.

Would you be open to me sharing a post with your group? Happy to create a custom QR code for ${page.page_name} so you can see if anyone signs up through you.

No pressure either way - just thought it might help some teams simplify.`;
  };

  const [copiedDmId, setCopiedDmId] = useState<string | null>(null);
  const [updatingAdminId, setUpdatingAdminId] = useState<string | null>(null);

  const updateAdminStatus = async (adminId: string, status: string) => {
    setUpdatingAdminId(adminId);
    try {
      const response = await fetch('/api/admin/fb-outreach/admins', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          admin_id: adminId,
          response_status: status,
          ...(status === 'dm_sent' && { dm_sent_at: new Date().toISOString() }),
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchPages();
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update admin status:', error);
    } finally {
      setUpdatingAdminId(null);
    }
  };

  const copyDMTemplate = (page: FBPage, adminName?: string) => {
    const template = getDMTemplate(page, adminName);
    navigator.clipboard.writeText(template);
    setCopiedDmId(adminName ? `${page.id}-${adminName}` : page.id);
    setTimeout(() => setCopiedDmId(null), 2000);
  };

  const handleStatusUpdate = async (pageId: string, newStatus: OutreachStatus, postTemplate?: string) => {
    setUpdatingId(pageId);
    try {
      const response = await fetch('/api/admin/fb-outreach/pages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          id: pageId,
          outreach_status: newStatus,
          ...(newStatus === 'dm_sent' && { dm_sent_at: new Date().toISOString() }),
          ...(newStatus === 'posted' && { posted_at: new Date().toISOString(), post_template_used: postTemplate }),
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchPages();
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const StatusBadge = ({ status }: { status: OutreachStatus }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/30`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Outreach Pipeline</h2>
            <p className="text-gray-400">Track and manage your FB group outreach</p>
          </div>
        </div>

        <button
          onClick={fetchPages}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/30"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
          <select
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All States</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search groups..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-2 text-gray-400">Loading pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No pages found. Add some groups to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => {
            const dmDays = daysSince(page.dm_sent_at);
            const followUp = getFollowUpUrgency(dmDays);
            const showFollowUp = followUp && ['dm_sent', 'awaiting_response'].includes(page.outreach_status);

            return (
            <div
              key={page.id}
              className={`p-4 rounded-xl border transition-colors ${
                showFollowUp && followUp.urgent
                  ? 'bg-red-500/5 border-red-500/30 hover:bg-red-500/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-white">{page.page_name}</span>
                    <StatusBadge status={page.outreach_status} />
                    {/* Follow-up badge */}
                    {showFollowUp && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        followUp.urgent
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                          : followUp.color === 'yellow'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        <Bell className="w-3 h-3" />
                        {followUp.label}
                      </span>
                    )}
                    {page.member_count && (
                      <span className="text-xs text-gray-500">
                        <Users className="w-3 h-3 inline mr-1" />
                        {page.member_count.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {page.state || 'N/A'}
                    </span>
                    {/* Show admins count or legacy admin */}
                    {page.fb_page_admins?.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {page.fb_page_admins.length} admin{page.fb_page_admins.length > 1 ? 's' : ''}
                      </span>
                    ) : page.admin_name && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {page.admin_name}
                      </span>
                    )}
                    <span className="text-orange-400">
                      {'★'.repeat(page.priority_score || 0)}{'☆'.repeat(5 - (page.priority_score || 0))}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={page.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm"
                  >
                    <ExternalLink className="w-3 h-3" /> Group
                  </a>
                  {/* Show DM buttons for all admins */}
                  {page.fb_page_admins?.filter(a => a.admin_profile_url).slice(0, 2).map((admin, idx) => (
                    <a
                      key={admin.id}
                      href={admin.admin_profile_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm"
                      title={admin.admin_name}
                    >
                      <MessageCircle className="w-3 h-3" /> {admin.admin_name.split(' ')[0]}
                    </a>
                  ))}
                  {/* Fallback to legacy admin_profile_url */}
                  {(!page.fb_page_admins?.length && page.admin_profile_url) && (
                    <a
                      href={page.admin_profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm"
                    >
                      <MessageCircle className="w-3 h-3" /> DM Admin
                    </a>
                  )}
                  <button
                    onClick={() => setExpandedId(expandedId === page.id ? null : page.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 text-sm"
                  >
                    {expandedId === page.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    Actions
                  </button>
                </div>
              </div>

              {/* Expanded Actions */}
              {expandedId === page.id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-3">Update Status:</p>
                  <div className="flex flex-wrap gap-2">
                    {page.outreach_status === 'not_started' && (
                      <button
                        onClick={() => handleStatusUpdate(page.id, 'dm_sent')}
                        disabled={updatingId === page.id}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm disabled:opacity-50"
                      >
                        {updatingId === page.id ? 'Updating...' : 'Mark DM Sent'}
                      </button>
                    )}
                    {page.outreach_status === 'dm_sent' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(page.id, 'awaiting_response')}
                          disabled={updatingId === page.id}
                          className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 text-sm disabled:opacity-50"
                        >
                          Awaiting Response
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(page.id, 'approved')}
                          disabled={updatingId === page.id}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm disabled:opacity-50"
                        >
                          Approved!
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(page.id, 'declined')}
                          disabled={updatingId === page.id}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm disabled:opacity-50"
                        >
                          Declined
                        </button>
                      </>
                    )}
                    {page.outreach_status === 'awaiting_response' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(page.id, 'approved')}
                          disabled={updatingId === page.id}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm disabled:opacity-50"
                        >
                          Approved!
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(page.id, 'declined')}
                          disabled={updatingId === page.id}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm disabled:opacity-50"
                        >
                          Declined
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(page.id, 'no_response')}
                          disabled={updatingId === page.id}
                          className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 text-sm disabled:opacity-50"
                        >
                          No Response
                        </button>
                      </>
                    )}
                    {page.outreach_status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(page.id, 'posted', 'fb_post_primary')}
                        disabled={updatingId === page.id}
                        className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm disabled:opacity-50"
                      >
                        {updatingId === page.id ? 'Updating...' : 'Mark as Posted'}
                      </button>
                    )}
                  </div>
                  {/* Show all admins in expanded view with status tracking */}
                  {page.fb_page_admins?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <p className="text-xs text-gray-500 mb-3">Admin Outreach Status:</p>
                      <div className="space-y-2">
                        {page.fb_page_admins.map((admin) => {
                          const adminDays = daysSince(admin.dm_sent_at);
                          const adminFollowUp = getFollowUpUrgency(adminDays);
                          const statusConfig = ADMIN_RESPONSE_STATUS[admin.response_status as keyof typeof ADMIN_RESPONSE_STATUS] || ADMIN_RESPONSE_STATUS.not_contacted;

                          return (
                          <div key={admin.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="font-medium text-white truncate">{admin.admin_name}</span>
                              {admin.is_primary && (
                                <span className="text-xs text-yellow-500 shrink-0">(Primary)</span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400 shrink-0`}>
                                {statusConfig.label}
                              </span>
                              {adminFollowUp && admin.response_status === 'dm_sent' && (
                                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                                  adminFollowUp.urgent ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {adminFollowUp.label}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {/* Copy DM */}
                              <button
                                onClick={() => copyDMTemplate(page, admin.admin_name)}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                  copiedDmId === `${page.id}-${admin.admin_name}`
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                                }`}
                                title="Copy personalized DM"
                              >
                                {copiedDmId === `${page.id}-${admin.admin_name}` ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy DM
                              </button>
                              {/* Open Profile */}
                              {admin.admin_profile_url && (
                                <a
                                  href={admin.admin_profile_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                >
                                  <ExternalLink className="w-3 h-3" /> Profile
                                </a>
                              )}
                              {/* Status buttons based on current status */}
                              {admin.response_status === 'not_contacted' && (
                                <button
                                  onClick={() => updateAdminStatus(admin.id, 'dm_sent')}
                                  disabled={updatingAdminId === admin.id}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50"
                                >
                                  <Send className="w-3 h-3" /> Mark DM Sent
                                </button>
                              )}
                              {admin.response_status === 'dm_sent' && (
                                <>
                                  <button
                                    onClick={() => updateAdminStatus(admin.id, 'responded')}
                                    disabled={updatingAdminId === admin.id}
                                    className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
                                  >
                                    Responded
                                  </button>
                                  <button
                                    onClick={() => updateAdminStatus(admin.id, 'no_response')}
                                    disabled={updatingAdminId === admin.id}
                                    className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 disabled:opacity-50"
                                  >
                                    No Response
                                  </button>
                                </>
                              )}
                              {(admin.response_status === 'responded' || admin.response_status === 'dm_sent') && (
                                <>
                                  <button
                                    onClick={() => updateAdminStatus(admin.id, 'approved')}
                                    disabled={updatingAdminId === admin.id}
                                    className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                                  >
                                    Approved
                                  </button>
                                  <button
                                    onClick={() => updateAdminStatus(admin.id, 'declined')}
                                    disabled={updatingAdminId === admin.id}
                                    className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                                  >
                                    Declined
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Quick copy DM if no admins listed */}
                  {(!page.fb_page_admins || page.fb_page_admins.length === 0) && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <button
                        onClick={() => copyDMTemplate(page)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          copiedDmId === page.id
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                        }`}
                      >
                        {copiedDmId === page.id ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy DM Template
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {page.notes && (
                    <p className="mt-3 text-sm text-gray-500">Notes: {page.notes}</p>
                  )}
                  {page.dm_sent_at && (
                    <p className="mt-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      DM sent: {new Date(page.dm_sent_at).toLocaleDateString()}
                    </p>
                  )}
                  {page.posted_at && (
                    <p className="mt-1 text-xs text-gray-600">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Posted: {new Date(page.posted_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}

function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/fb-outreach/templates', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCopy = (template: Template) => {
    navigator.clipboard.writeText(template.body);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const dmTemplates = templates.filter(t => t.template_type === 'initial');
  const postTemplates = templates.filter(t => t.template_type === 'post');

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
          <FileText className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Outreach Templates</h2>
          <p className="text-gray-400">Copy templates for admin DMs and group posts</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* DM Templates */}
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Step 1: Admin DM Templates
            </h3>
            <div className="space-y-4">
              {dmTemplates.map((template) => (
                <div key={template.id} className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium text-blue-400">{template.template_name.replace('fb_admin_', '').replace(/_/g, ' ')}</span>
                    <button
                      onClick={() => handleCopy(template)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        copiedId === template.id
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      }`}
                    >
                      {copiedId === template.id ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans bg-black/20 p-3 rounded-lg max-h-48 overflow-y-auto">
                    {template.body}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Post Templates */}
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Step 2: Group Post Templates
            </h3>
            <div className="space-y-4">
              {postTemplates.map((template) => (
                <div key={template.id} className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium text-purple-400">{template.template_name.replace('fb_post_', '').replace(/_/g, ' ')}</span>
                    <button
                      onClick={() => handleCopy(template)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        copiedId === template.id
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                      }`}
                    >
                      {copiedId === template.id ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans bg-black/20 p-3 rounded-lg max-h-48 overflow-y-auto">
                    {template.body}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
