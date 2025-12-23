'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Megaphone, Plus, Trash2, Power, PowerOff, Edit2, X,
  Loader2, Search, Info, AlertTriangle, CheckCircle, Sparkles,
  Users, Clock, Calendar, MessageCircle, ChevronDown, ChevronUp
} from 'lucide-react';

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

interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'update';
  priority: number;
  active: boolean;
  target_audience: 'all' | 'free' | 'premium' | 'coach';
  target_user_ids: string[] | null;
  created_at: string;
  expires_at: string | null;
  starts_at: string | null;
  created_by: string | null;
  reaction_type: 'none' | 'general' | 'usefulness' | 'bug_fix' | 'content';
}

interface ReactionStats {
  total: number;
  by_reaction: Record<string, number>;
}

interface ReactionResponse {
  id: string;
  reaction: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface UserSearchResult {
  id: string;
  email: string;
  name: string | null;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  byType: {
    info: number;
    warning: number;
    success: number;
    update: number;
  };
}

const typeConfig = {
  info: { icon: Info, color: 'blue', label: 'Info' },
  warning: { icon: AlertTriangle, color: 'orange', label: 'Warning' },
  success: { icon: CheckCircle, color: 'green', label: 'Success' },
  update: { icon: Sparkles, color: 'purple', label: 'Update' },
};

const audienceLabels = {
  all: 'Everyone',
  free: 'Free Users',
  premium: 'Premium Users',
  coach: 'Coaches',
};

const reactionTypeConfig = {
  none: { label: 'No Reactions', description: 'Info-only announcement' },
  general: { label: 'General Feedback', description: 'Yes / It\'s okay / Not really', options: [
    { emoji: '\u{1F44D}', label: 'Yes', value: 'yes' },
    { emoji: '\u{1F610}', label: "It's okay", value: 'okay' },
    { emoji: '\u{1F44E}', label: 'Not really', value: 'no' },
  ]},
  usefulness: { label: 'Was This Useful?', description: 'Yes / Not sure / Not useful', options: [
    { emoji: '\u{1F44D}', label: 'Yes', value: 'yes' },
    { emoji: '\u{1F937}', label: 'Not sure', value: 'not_sure' },
    { emoji: '\u{1F44E}', label: 'Not useful', value: 'not_useful' },
  ]},
  bug_fix: { label: 'Bug Fix Confirmation', description: 'Fixed / Still seeing it', options: [
    { emoji: '\u{2705}', label: 'Fixed', value: 'fixed' },
    { emoji: '\u{26A0}\u{FE0F}', label: 'Still seeing it', value: 'still_issue' },
  ]},
  content: { label: 'Content Interest', description: 'Yes please / Occasionally / Not my thing', options: [
    { emoji: '\u{1F525}', label: 'Yes please', value: 'yes' },
    { emoji: '\u{1F44C}', label: 'Occasionally', value: 'occasionally' },
    { emoji: '\u{274C}', label: 'Not my thing', value: 'no' },
  ]},
};

const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

export default function AnnouncementsPage() {
  const { getPassword } = useAdminAuth();
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<SystemAnnouncement | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formType, setFormType] = useState<SystemAnnouncement['type']>('info');
  const [formPriority, setFormPriority] = useState(0);
  const [formAudience, setFormAudience] = useState<SystemAnnouncement['target_audience']>('all');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formStartsAt, setFormStartsAt] = useState('');
  const [formTargetUsers, setFormTargetUsers] = useState<UserSearchResult[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [formReactionType, setFormReactionType] = useState<SystemAnnouncement['reaction_type']>('none');

  // Reaction viewing state
  const [expandedReactions, setExpandedReactions] = useState<string | null>(null);
  const [reactionStats, setReactionStats] = useState<Record<string, ReactionStats>>({});
  const [reactionResponses, setReactionResponses] = useState<Record<string, ReactionResponse[]>>({});
  const [loadingReactions, setLoadingReactions] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        headers: { 'X-Admin-Password': getPassword() || adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setAnnouncements(data.announcements);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormTitle('');
    setFormMessage('');
    setFormType('info');
    setFormPriority(0);
    setFormAudience('all');
    setFormExpiresAt('');
    setFormStartsAt('');
    setFormTargetUsers([]);
    setUserSearchQuery('');
    setUserSearchResults([]);
    setEditingAnnouncement(null);
    setFormReactionType('none');
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (announcement: SystemAnnouncement) => {
    setEditingAnnouncement(announcement);
    setFormTitle(announcement.title);
    setFormMessage(announcement.message);
    setFormType(announcement.type);
    setFormPriority(announcement.priority);
    setFormAudience(announcement.target_audience);
    setFormExpiresAt(announcement.expires_at ? announcement.expires_at.slice(0, 16) : '');
    setFormStartsAt(announcement.starts_at ? announcement.starts_at.slice(0, 16) : '');
    setFormReactionType(announcement.reaction_type || 'none');
    // For target users, we would need to fetch user details - simplified for now
    setFormTargetUsers([]);
    setShowModal(true);
  };

  const handleSearchUsers = async () => {
    if (userSearchQuery.length < 2) return;
    setSearchingUsers(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword,
        },
        body: JSON.stringify({ action: 'search-users', query: userSearchQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setUserSearchResults(data.users);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const addTargetUser = (user: UserSearchResult) => {
    if (!formTargetUsers.find(u => u.id === user.id)) {
      setFormTargetUsers([...formTargetUsers, user]);
    }
    setUserSearchResults([]);
    setUserSearchQuery('');
  };

  const removeTargetUser = (userId: string) => {
    setFormTargetUsers(formTargetUsers.filter(u => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const payload: Record<string, unknown> = {
        action: editingAnnouncement ? 'update' : 'create',
        title: formTitle,
        message: formMessage,
        type: formType,
        priority: formPriority,
        target_audience: formAudience,
        expires_at: formExpiresAt || null,
        starts_at: formStartsAt || null,
        created_by: 'Admin',
        reaction_type: formReactionType,
      };

      if (editingAnnouncement) {
        payload.id = editingAnnouncement.id;
      }

      // If targeting specific users, include their IDs
      if (formTargetUsers.length > 0) {
        payload.target_user_ids = formTargetUsers.map(u => u.id);
      } else {
        payload.target_user_ids = null;
      }

      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Failed to save announcement:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword,
        },
        body: JSON.stringify({ action: 'toggle', id }),
      });

      const data = await res.json();
      if (data.success) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Failed to toggle announcement:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword,
        },
        body: JSON.stringify({ action: 'delete', id }),
      });

      const data = await res.json();
      if (data.success) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const fetchReactions = async (announcementId: string) => {
    setLoadingReactions(announcementId);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword,
        },
        body: JSON.stringify({ action: 'get-reactions', announcement_id: announcementId }),
      });
      const data = await res.json();
      if (data.success) {
        setReactionStats(prev => ({ ...prev, [announcementId]: data.stats }));
        setReactionResponses(prev => ({ ...prev, [announcementId]: data.reactions }));
      }
    } catch (error) {
      console.error('Failed to fetch reactions:', error);
    } finally {
      setLoadingReactions(null);
    }
  };

  const toggleReactions = async (announcementId: string) => {
    if (expandedReactions === announcementId) {
      setExpandedReactions(null);
    } else {
      setExpandedReactions(announcementId);
      // Fetch reactions if not already loaded
      if (!reactionStats[announcementId]) {
        await fetchReactions(announcementId);
      }
    }
  };

  const getReactionLabel = (reactionType: string, value: string) => {
    const config = reactionTypeConfig[reactionType as keyof typeof reactionTypeConfig];
    if (!config || !('options' in config)) return value;
    const option = config.options?.find(o => o.value === value);
    return option ? `${option.emoji} ${option.label}` : value;
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0B14] via-[#0F1123] to-[#0A0B14] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/30 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">System Announcements</h1>
                <p className="text-white/50 text-sm">Send in-app messages to users</p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          </div>

          {/* Navigation */}
          <AdminNav />

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Card className="p-4">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-white/50 text-sm">Total</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                <div className="text-white/50 text-sm">Active</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-white/40">{stats.inactive}</div>
                <div className="text-white/50 text-sm">Inactive</div>
              </Card>
              <Card className="p-4">
                <div className="flex gap-2 text-sm">
                  <span className="text-blue-400">{stats.byType.info}</span>
                  <span className="text-orange-400">{stats.byType.warning}</span>
                  <span className="text-green-400">{stats.byType.success}</span>
                  <span className="text-purple-400">{stats.byType.update}</span>
                </div>
                <div className="text-white/50 text-sm">By Type</div>
              </Card>
            </div>
          )}

          {/* Announcements List */}
          <Card variant="elevated" className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-16">
                <Megaphone className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No announcements yet</p>
                <p className="text-white/30 text-sm">Create your first announcement to notify users</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {announcements.map((announcement) => {
                  const TypeIcon = typeConfig[announcement.type].icon;
                  const typeColor = typeConfig[announcement.type].color;

                  return (
                    <div
                      key={announcement.id}
                      className={`p-4 hover:bg-white/5 transition-colors ${!announcement.active ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Type Icon */}
                        <div className={`w-10 h-10 rounded-lg bg-${typeColor}-500/20 flex items-center justify-center flex-shrink-0`}
                             style={{ backgroundColor: `color-mix(in srgb, ${typeColor === 'blue' ? '#3b82f6' : typeColor === 'orange' ? '#fb923c' : typeColor === 'green' ? '#22c55e' : '#8b5cf6'} 20%, transparent)` }}>
                          <TypeIcon className={`w-5 h-5`} style={{ color: typeColor === 'blue' ? '#3b82f6' : typeColor === 'orange' ? '#fb923c' : typeColor === 'green' ? '#22c55e' : '#8b5cf6' }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{announcement.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium`}
                                  style={{
                                    backgroundColor: `color-mix(in srgb, ${typeColor === 'blue' ? '#3b82f6' : typeColor === 'orange' ? '#fb923c' : typeColor === 'green' ? '#22c55e' : '#8b5cf6'} 20%, transparent)`,
                                    color: typeColor === 'blue' ? '#3b82f6' : typeColor === 'orange' ? '#fb923c' : typeColor === 'green' ? '#22c55e' : '#8b5cf6'
                                  }}>
                              {typeConfig[announcement.type].label}
                            </span>
                            {announcement.priority > 0 && (
                              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                                Priority: {announcement.priority}
                              </span>
                            )}
                            {announcement.starts_at && new Date(announcement.starts_at) > new Date() && (
                              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                                Scheduled
                              </span>
                            )}
                            {announcement.reaction_type && announcement.reaction_type !== 'none' && (
                              <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 text-xs font-medium flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {reactionTypeConfig[announcement.reaction_type]?.label || announcement.reaction_type}
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm mb-2 line-clamp-2">{announcement.message}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {announcement.target_user_ids
                                ? `${announcement.target_user_ids.length} specific users`
                                : audienceLabels[announcement.target_audience]}
                            </span>
                            {announcement.starts_at && (
                              <span className="flex items-center gap-1 text-cyan-400/70">
                                <Clock className="w-3 h-3" />
                                Starts: {formatDate(announcement.starts_at)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Created: {formatDate(announcement.created_at)}
                            </span>
                            {announcement.expires_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires: {formatDate(announcement.expires_at)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {announcement.reaction_type && announcement.reaction_type !== 'none' && (
                            <button
                              onClick={() => toggleReactions(announcement.id)}
                              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                                expandedReactions === announcement.id
                                  ? 'bg-pink-500/20 text-pink-400'
                                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                              }`}
                              title="View Reactions"
                            >
                              {loadingReactions === announcement.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <MessageCircle className="w-4 h-4" />
                                  {expandedReactions === announcement.id ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleToggle(announcement.id)}
                            disabled={actionLoading}
                            className={`p-2 rounded-lg transition-colors ${
                              announcement.active
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                            title={announcement.active ? 'Deactivate' : 'Activate'}
                          >
                            {announcement.active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEditModal(announcement)}
                            className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            disabled={actionLoading}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Reactions Section */}
                      {expandedReactions === announcement.id && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          {loadingReactions === announcement.id ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-pink-400" />
                            </div>
                          ) : reactionStats[announcement.id] ? (
                            <div className="space-y-4">
                              {/* Stats Summary */}
                              <div className="flex flex-wrap gap-3">
                                <div className="px-3 py-2 bg-white/5 rounded-lg">
                                  <div className="text-lg font-bold text-pink-400">{reactionStats[announcement.id].total}</div>
                                  <div className="text-xs text-white/50">Total Responses</div>
                                </div>
                                {Object.entries(reactionStats[announcement.id].by_reaction).map(([reaction, count]) => (
                                  <div key={reaction} className="px-3 py-2 bg-white/5 rounded-lg">
                                    <div className="text-lg font-bold text-white">{count}</div>
                                    <div className="text-xs text-white/50">
                                      {getReactionLabel(announcement.reaction_type, reaction)}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Individual Responses */}
                              {reactionResponses[announcement.id]?.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium text-white/70 mb-2">Individual Responses</div>
                                  <div className="max-h-48 overflow-y-auto space-y-2">
                                    {reactionResponses[announcement.id].map((response) => (
                                      <div
                                        key={response.id}
                                        className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg text-sm"
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="text-white/90">{response.user.name || response.user.email}</span>
                                          {response.user.name && (
                                            <span className="text-white/40 text-xs">{response.user.email}</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs">
                                            {getReactionLabel(announcement.reaction_type, response.reaction)}
                                          </span>
                                          <span className="text-white/30 text-xs">
                                            {formatDate(response.created_at)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {reactionStats[announcement.id].total === 0 && (
                                <div className="text-center py-4 text-white/40 text-sm">
                                  No responses yet
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-white/40 text-sm">
                              Failed to load reactions
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <Card variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Title</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none"
                      placeholder="Announcement title..."
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Message</label>
                    <textarea
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none resize-none"
                      placeholder="Write your announcement message..."
                    />
                  </div>

                  {/* Type, Priority, and Reaction Type Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Type</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as SystemAnnouncement['type'])}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="info">Info (Blue)</option>
                        <option value="warning">Warning (Orange)</option>
                        <option value="success">Success (Green)</option>
                        <option value="update">Update (Purple)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Priority</label>
                      <input
                        type="number"
                        value={formPriority}
                        onChange={(e) => setFormPriority(parseInt(e.target.value) || 0)}
                        min={0}
                        max={100}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                      />
                      <p className="text-xs text-white/40 mt-1">Higher = first</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Reactions</label>
                      <select
                        value={formReactionType}
                        onChange={(e) => setFormReactionType(e.target.value as SystemAnnouncement['reaction_type'])}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="none">No Reactions</option>
                        <option value="general">General Feedback</option>
                        <option value="usefulness">Was This Useful?</option>
                        <option value="bug_fix">Bug Fix Confirm</option>
                        <option value="content">Content Interest</option>
                      </select>
                      <p className="text-xs text-white/40 mt-1">{reactionTypeConfig[formReactionType]?.description}</p>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Target Audience</label>
                    <select
                      value={formAudience}
                      onChange={(e) => setFormAudience(e.target.value as SystemAnnouncement['target_audience'])}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="all">Everyone</option>
                      <option value="free">Free Users Only</option>
                      <option value="premium">Premium Users Only</option>
                      <option value="coach">Coaches Only</option>
                    </select>
                  </div>

                  {/* Target Specific Users */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Target Specific Users (Optional)
                    </label>
                    <p className="text-xs text-white/40 mb-2">
                      If you add specific users, the announcement will only show to them (overrides audience setting)
                    </p>

                    {/* User Search */}
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Search by email or name..."
                        className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSearchUsers}
                        disabled={searchingUsers || userSearchQuery.length < 2}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {searchingUsers ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Search Results */}
                    {userSearchResults.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-2 mb-2 space-y-1">
                        {userSearchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => addTargetUser(user)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-white/10 transition-colors text-left"
                          >
                            <div>
                              <div className="text-sm">{user.name || 'No name'}</div>
                              <div className="text-xs text-white/50">{user.email}</div>
                            </div>
                            <Plus className="w-4 h-4 text-green-400" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected Users */}
                    {formTargetUsers.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formTargetUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm"
                          >
                            <span>{user.email}</span>
                            <button
                              type="button"
                              onClick={() => removeTargetUser(user.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scheduling */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Starts At (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formStartsAt}
                        onChange={(e) => setFormStartsAt(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                      />
                      <p className="text-xs text-white/40 mt-1">Schedule for future</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Expires At (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formExpiresAt}
                        onChange={(e) => setFormExpiresAt(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                      />
                      <p className="text-xs text-white/40 mt-1">Auto-hide after date</p>
                    </div>
                  </div>

                  {/* Formatting Help */}
                  <div className="bg-white/5 rounded-lg p-3 text-xs text-white/50">
                    <div className="font-medium text-white/70 mb-1">Rich Text Formatting:</div>
                    <div className="space-y-0.5">
                      <div><code className="bg-white/10 px-1 rounded">**bold**</code> → <strong>bold</strong></div>
                      <div><code className="bg-white/10 px-1 rounded">*italic*</code> → <em>italic</em></div>
                      <div><code className="bg-white/10 px-1 rounded">[link text](https://url)</code> → clickable link</div>
                    </div>
                  </div>

                  {/* Preview - Mobile App Banner */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">App Preview</label>
                    <div className="bg-[#0A0B14] p-4 rounded-xl">
                      {/* Phone mockup frame */}
                      <div className="max-w-[320px] mx-auto">
                        <div
                          className="p-4 rounded-[20px] backdrop-blur-xl relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, #1A1D2E 0%, #0D0F1A 50%, color-mix(in srgb, ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'} 15%, transparent) 100%)`,
                            border: `1.5px solid color-mix(in srgb, ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'} 50%, transparent)`,
                            boxShadow: `0 8px 20px color-mix(in srgb, ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'} 30%, transparent), 0 4px 20px rgba(0,0,0,0.5)`,
                          }}
                        >
                          {/* Glass overlay */}
                          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02] pointer-events-none rounded-[20px]" />

                          <div className="flex items-start gap-3.5 relative">
                            {/* Logo with glow */}
                            <div
                              className="w-[52px] h-[52px] rounded-[14px] flex-shrink-0 overflow-hidden"
                              style={{
                                boxShadow: `0 0 12px color-mix(in srgb, ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'} 40%, transparent)`,
                              }}
                            >
                              <img
                                src="/assets/images/mm-logo.png"
                                alt="Mind & Muscle"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to icon if image not found
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500/30 to-orange-500/30 flex items-center justify-center"><span class="text-2xl">💪</span></div>`;
                                }}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Badge */}
                              <div
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide w-fit mb-2.5"
                                style={{
                                  background: `linear-gradient(90deg, color-mix(in srgb, ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'} 30%, transparent), color-mix(in srgb, ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'} 15%, transparent))`,
                                  border: `1px solid color-mix(in srgb, ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'} 40%, transparent)`,
                                  color: formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6',
                                }}
                              >
                                {/* Glowing dot */}
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6',
                                    boxShadow: `0 0 4px ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'}`,
                                  }}
                                />
                                {formType === 'info' ? 'INFO' : formType === 'warning' ? 'NOTICE' : formType === 'success' ? 'GOOD NEWS' : 'NEW UPDATE'}
                              </div>

                              {/* Title */}
                              <div className="text-white font-bold text-[16px] leading-tight tracking-tight mb-1.5">
                                {formTitle || 'Announcement Title'}
                              </div>

                              {/* Message */}
                              <div className="text-white/80 text-[13px] leading-relaxed mb-2.5 line-clamp-3">
                                {formMessage || 'Your announcement message will appear here...'}
                              </div>

                              {/* Reaction buttons or swipe hint */}
                              {formReactionType !== 'none' && reactionTypeConfig[formReactionType] && 'options' in reactionTypeConfig[formReactionType] ? (
                                <div className="flex flex-wrap gap-2">
                                  {(reactionTypeConfig[formReactionType] as { options: { emoji: string; label: string }[] }).options.map((option, idx) => (
                                    <div
                                      key={idx}
                                      className="px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5"
                                      style={{
                                        background: `linear-gradient(90deg, color-mix(in srgb, ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'} 20%, transparent), color-mix(in srgb, ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'} 10%, transparent))`,
                                        border: `1px solid color-mix(in srgb, ${formType === 'info' ? '#3b82f6' : formType === 'warning' ? '#fb923c' : formType === 'success' ? '#22c55e' : '#8b5cf6'} 40%, transparent)`,
                                      }}
                                    >
                                      <span>{option.emoji}</span>
                                      <span className="text-white/90">{option.label}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-white/35 text-[11px]">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10.59 4.59A2 2 0 1 0 8.17 2.17 2 2 0 0 0 10.59 4.59zM8.5 8.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm8.5 2.5c.28 0 .5.22.5.5v4c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5zm-5-1c-.28 0-.5.22-.5.5v5c0 .28.22.5.5.5s.5-.22.5-.5v-5c0-.28-.22-.5-.5-.5zm-3 2c-.28 0-.5.22-.5.5v3c0 .28.22.5.5.5s.5-.22.5-.5v-3c0-.28-.22-.5-.5-.5z"/>
                                  </svg>
                                  Swipe to dismiss
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); resetForm(); }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || !formTitle || !formMessage}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {editingAnnouncement ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminGate>
  );
}
