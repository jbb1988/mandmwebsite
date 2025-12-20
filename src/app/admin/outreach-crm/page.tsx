'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import { Card, StatCard, SearchInput, Toast, ToastType } from '@/components/admin/shared';
import ContactCard from '@/components/admin/ContactCard';
import ContactDetailModal from '@/components/admin/ContactDetailModal';
import BulkActionBar from '@/components/admin/BulkActionBar';
import {
  Users,
  Twitter,
  Send,
  MessageCircle,
  Trophy,
  AlertCircle,
  Filter,
  RefreshCw,
  ChevronDown,
  Target,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  TrendingUp,
  BarChart3,
  ChevronUp,
  CheckSquare,
} from 'lucide-react';

// Types
interface UnifiedContact {
  id: string;
  source: 'facebook' | 'twitter';
  source_id: string;
  name: string;
  handle?: string;
  group_name?: string;
  profile_url: string;
  follower_count?: number;
  member_count?: number;
  stage: 'not_contacted' | 'dm_sent' | 'responded' | 'won';
  dm_sent_at: string | null;
  days_since_dm: number | null;
  response_status: string;
  next_follow_up: string | null;
  follow_up_overdue: boolean;
  partner_signed_up: boolean;
  trial_granted_at: string | null;
  template_used: string | null;
  notes: string | null;
  priority_score: number;
  created_at: string;
  category?: string;
  state?: string;
  is_member?: boolean;
  bio?: string;
  contact_email?: string;
}

interface PipelineStats {
  total: number;
  not_contacted: number;
  dm_sent: number;
  responded: number;
  won: number;
  facebook: number;
  twitter: number;
  follow_ups_due: number;
}

interface Template {
  id: string;
  name: string;
  content: string;
}

interface TemplateStats {
  name: string;
  used: number;
  responses: number;
  conversions: number;
  responseRate: number;
  conversionRate: number;
}

type StageFilter = 'all' | 'not_contacted' | 'dm_sent' | 'responded' | 'won';
type SourceFilter = 'all' | 'facebook' | 'twitter';
type SortField = 'priority' | 'name' | 'dm_sent_at' | 'group_name';

const ITEMS_PER_PAGE = 50;

const stageConfig = {
  all: { label: 'All', color: 'white', icon: Users },
  not_contacted: { label: 'Not Contacted', color: 'gray', icon: Users },
  dm_sent: { label: 'DM Sent', color: 'cyan', icon: Send },
  responded: { label: 'Responded', color: 'emerald', icon: MessageCircle },
  won: { label: 'Won', color: 'amber', icon: Trophy },
} as const;

function OutreachCRMContent() {
  const { getPassword } = useAdminAuth();
  const password = getPassword();
  const [contacts, setContacts] = useState<UnifiedContact[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateStats, setTemplateStats] = useState<TemplateStats[]>([]);
  const [showTemplateStats, setShowTemplateStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<UnifiedContact | null>(null);
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: ToastType; action?: { label: string; onClick: () => void } } | null>(null);

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchPipeline = useCallback(async () => {
    if (!password) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/outreach/pipeline?${params}`, {
        headers: { 'X-Admin-Password': password },
      });

      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
        setStats(data.stats);
      } else {
        setToast({ message: data.message || 'Failed to load pipeline', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      setToast({ message: 'Failed to load pipeline', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [password, sourceFilter, searchQuery]);

  const fetchTemplates = useCallback(async () => {
    if (!password) return;

    try {
      const response = await fetch('/api/admin/fb-outreach/templates', {
        headers: { 'X-Admin-Password': password },
      });

      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates.map((t: { id: string; name: string; template_text: string }) => ({
          id: t.id,
          name: t.name,
          content: t.template_text,
        })));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, [password]);

  const fetchTemplateStats = useCallback(async () => {
    if (!password) return;

    try {
      const response = await fetch('/api/admin/fb-outreach/template-stats', {
        headers: { 'X-Admin-Password': password },
      });

      const data = await response.json();
      if (data.success) {
        setTemplateStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching template stats:', error);
    }
  }, [password]);

  useEffect(() => {
    fetchPipeline();
    fetchTemplates();
    fetchTemplateStats();
  }, [fetchPipeline, fetchTemplates, fetchTemplateStats]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [stageFilter, sourceFilter, searchQuery]);

  const handleUpdateContact = async (id: string, updates: Record<string, unknown>) => {
    if (!password) return;

    try {
      const response = await fetch('/api/admin/outreach/pipeline', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();
      if (data.success) {
        setToast({ message: 'Contact updated!', type: 'success' });
        fetchPipeline();
        setSelectedContact(null);
      } else {
        setToast({ message: data.message || 'Failed to update', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      setToast({ message: 'Failed to update contact', type: 'error' });
    }
  };

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter(c => stageFilter === 'all' || c.stage === stageFilter)
    .sort((a, b) => {
      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dm_sent_at':
          if (!a.dm_sent_at && !b.dm_sent_at) return 0;
          if (!a.dm_sent_at) return 1;
          if (!b.dm_sent_at) return -1;
          return new Date(b.dm_sent_at).getTime() - new Date(a.dm_sent_at).getTime();
        case 'group_name':
          // Sort by group name, then by name within group
          const groupA = a.group_name || 'zzz_no_group';
          const groupB = b.group_name || 'zzz_no_group';
          if (groupA !== groupB) return groupA.localeCompare(groupB);
          return a.name.localeCompare(b.name);
        case 'priority':
        default:
          return (b.priority_score || 0) - (a.priority_score || 0);
      }
    });

  // Group contacts by group_name when that sort is selected
  interface GroupedContacts {
    groupName: string;
    contacts: UnifiedContact[];
    stats: {
      total: number;
      not_contacted: number;
      dm_sent: number;
      responded: number;
      won: number;
    };
  }

  const groupedByGroup: GroupedContacts[] = React.useMemo(() => {
    if (sortField !== 'group_name') return [];

    // Only group Facebook contacts that have a group_name
    const facebookWithGroup = filteredContacts.filter(c => c.source === 'facebook' && c.group_name);
    const grouped = new Map<string, UnifiedContact[]>();

    facebookWithGroup.forEach(contact => {
      const key = contact.group_name!;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(contact);
    });

    // Convert to array and calculate stats for each group
    return Array.from(grouped.entries())
      .map(([groupName, groupContacts]) => ({
        groupName,
        contacts: groupContacts,
        stats: {
          total: groupContacts.length,
          not_contacted: groupContacts.filter(c => c.stage === 'not_contacted').length,
          dm_sent: groupContacts.filter(c => c.stage === 'dm_sent').length,
          responded: groupContacts.filter(c => c.stage === 'responded').length,
          won: groupContacts.filter(c => c.stage === 'won').length,
        }
      }))
      .sort((a, b) => a.groupName.localeCompare(b.groupName));
  }, [filteredContacts, sortField]);

  // Contacts without groups (Twitter or FB without group)
  const ungroupedContacts = React.useMemo(() => {
    if (sortField !== 'group_name') return filteredContacts;
    return filteredContacts.filter(c => c.source === 'twitter' || !c.group_name);
  }, [filteredContacts, sortField]);

  // Track expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Stage counts for tabs
  const stageCounts = {
    all: contacts.length,
    not_contacted: contacts.filter(c => c.stage === 'not_contacted').length,
    dm_sent: contacts.filter(c => c.stage === 'dm_sent').length,
    responded: contacts.filter(c => c.stage === 'responded').length,
    won: contacts.filter(c => c.stage === 'won').length,
  };

  // Follow-up queue - contacts with overdue follow-ups
  const followUpQueue = contacts
    .filter(c => c.follow_up_overdue)
    .sort((a, b) => {
      // Sort by follow-up date (oldest first)
      if (!a.next_follow_up && !b.next_follow_up) return 0;
      if (!a.next_follow_up) return 1;
      if (!b.next_follow_up) return -1;
      return new Date(a.next_follow_up).getTime() - new Date(b.next_follow_up).getTime();
    });

  // Get best performing template for quick copy
  const bestTemplate = templates.length > 0 ? templates[0] : null;

  // Handle quick copy of template for a contact (with Open Profile action)
  const handleCopyTemplate = async (contact: UnifiedContact, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bestTemplate || !password) return;

    // Replace placeholders
    let text = bestTemplate.content;
    text = text.replace(/{name}/g, contact.name.split(' ')[0]);
    text = text.replace(/{group_name}/g, contact.group_name || '');

    // Copy to clipboard
    await navigator.clipboard.writeText(text);

    // Update contact as DM sent with template
    try {
      await handleUpdateContact(contact.id, {
        dm_sent_at: new Date().toISOString(),
        response_status: 'dm_sent',
        template_used: bestTemplate.name,
      });
      // Show toast with Open Profile action button
      setToast({
        message: `Template copied! Marked as sent.`,
        type: 'success',
        action: {
          label: 'Open Profile',
          onClick: () => window.open(contact.profile_url, '_blank'),
        },
      });
    } catch {
      setToast({ message: 'Copied but failed to update status', type: 'error' });
    }
  };

  // Inline action: Mark as DM Sent (without copying template)
  const handleMarkSent = async (contact: UnifiedContact, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!password) return;

    try {
      await handleUpdateContact(contact.id, {
        dm_sent_at: new Date().toISOString(),
        response_status: 'dm_sent',
      });
      setToast({ message: `${contact.name} marked as DM sent`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  // Inline action: Mark as Responded
  const handleMarkResponded = async (contact: UnifiedContact, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!password) return;

    try {
      await handleUpdateContact(contact.id, {
        response_status: 'responded',
      });
      setToast({ message: `${contact.name} marked as responded`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  // Inline action: Grant Trial
  const handleGrantTrial = async (contact: UnifiedContact, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!password) return;

    try {
      await handleUpdateContact(contact.id, {
        trial_granted_at: new Date().toISOString(),
        response_status: 'trial_requested',
      });
      setToast({ message: `Trial granted to ${contact.name}`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to grant trial', type: 'error' });
    }
  };

  // Inline action: Mark as Won (Partner)
  const handleMarkWon = async (contact: UnifiedContact, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!password) return;

    try {
      await handleUpdateContact(contact.id, {
        partner_signed_up: true,
        partner_signed_up_at: new Date().toISOString(),
      });
      setToast({ message: `${contact.name} is now a partner!`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to update partner status', type: 'error' });
    }
  };

  // Inline action: Set Follow-up Date
  const handleSetFollowUp = async (contact: UnifiedContact, date: string | null) => {
    if (!password) return;

    try {
      await handleUpdateContact(contact.id, {
        next_follow_up: date,
      });
      if (date) {
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        setToast({ message: `Follow-up set for ${formattedDate}`, type: 'success' });
      } else {
        setToast({ message: 'Follow-up cleared', type: 'info' });
      }
    } catch {
      setToast({ message: 'Failed to set follow-up', type: 'error' });
    }
  };

  // Selection handlers
  const toggleSelectContact = (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const selectAllVisible = () => {
    const visibleIds = paginatedContacts.map(c => c.id);
    setSelectedIds(new Set(visibleIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  // Bulk action handlers
  const handleBulkMarkSent = async (templateName?: string) => {
    if (!password || selectedIds.size === 0) return;

    try {
      const response = await fetch('/api/admin/outreach/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          updates: {
            dm_sent_at: new Date().toISOString(),
            response_status: 'dm_sent',
            template_used: templateName || null,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setToast({ message: data.message, type: 'success' });
        fetchPipeline();
        clearSelection();
      } else {
        setToast({ message: data.message || 'Bulk update failed', type: 'error' });
      }
    } catch (error) {
      console.error('Bulk mark sent error:', error);
      setToast({ message: 'Failed to update contacts', type: 'error' });
    }
  };

  const handleBulkSetFollowUp = async (date: string) => {
    if (!password || selectedIds.size === 0) return;

    try {
      const response = await fetch('/api/admin/outreach/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          updates: {
            next_follow_up: date,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setToast({ message: `Follow-up set for ${selectedIds.size} contact${selectedIds.size !== 1 ? 's' : ''}`, type: 'success' });
        fetchPipeline();
        clearSelection();
      } else {
        setToast({ message: data.message || 'Bulk update failed', type: 'error' });
      }
    } catch (error) {
      console.error('Bulk follow-up error:', error);
      setToast({ message: 'Failed to set follow-up dates', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-blue-900/5 pointer-events-none" />

      <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Target className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Outreach CRM</h1>
            <p className="text-white/50 text-sm sm:text-base">Unified pipeline for all contacts</p>
          </div>

          {/* Admin Navigation */}
          <AdminNav />

          {/* Follow-up Queue Alert */}
          {followUpQueue.length > 0 && (
            <Card variant="bordered" glow glowColor="orange" className="p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Follow-up Queue</h3>
                    <p className="text-xs text-orange-400">{followUpQueue.length} overdue follow-up{followUpQueue.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {followUpQueue.slice(0, 5).map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-2 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-1 rounded ${contact.source === 'facebook' ? 'bg-blue-500/20' : 'bg-sky-500/20'}`}>
                        {contact.source === 'facebook' ? (
                          <Users className="w-3 h-3 text-blue-400" />
                        ) : (
                          <Twitter className="w-3 h-3 text-sky-400" />
                        )}
                      </div>
                      <span className="text-sm text-white truncate">{contact.name}</span>
                      {contact.group_name && (
                        <span className="text-xs text-white/40 truncate hidden sm:inline">({contact.group_name})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-orange-400">
                        {contact.next_follow_up
                          ? new Date(contact.next_follow_up).toLocaleDateString()
                          : 'Overdue'}
                      </span>
                      {contact.stage === 'not_contacted' && bestTemplate && (
                        <button
                          onClick={(e) => handleCopyTemplate(contact, e)}
                          className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors"
                          title={`Copy "${bestTemplate.name}" template`}
                        >
                          <Copy className="w-3 h-3 text-cyan-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {followUpQueue.length > 5 && (
                  <p className="text-xs text-white/40 text-center py-1">
                    +{followUpQueue.length - 5} more overdue
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Template Performance Stats */}
          {templateStats.length > 0 && (
            <Card variant="default" className="mb-6 overflow-hidden">
              <button
                onClick={() => setShowTemplateStats(!showTemplateStats)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/20 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">Template Performance</h3>
                    <p className="text-xs text-white/40">
                      {templateStats.reduce((sum, t) => sum + t.used, 0)} total uses across {templateStats.length} templates
                    </p>
                  </div>
                </div>
                {showTemplateStats ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>
              {showTemplateStats && (
                <div className="p-4 pt-0 space-y-3">
                  {templateStats.map((template) => (
                    <div key={template.name} className="p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{template.name}</span>
                        <span className="text-xs text-white/40">{template.used} uses</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-white/50">Response Rate</span>
                            <span className={template.responseRate >= 20 ? 'text-emerald-400' : 'text-white/60'}>
                              {template.responseRate}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${template.responseRate >= 20 ? 'bg-emerald-500' : 'bg-white/30'}`}
                              style={{ width: `${Math.min(template.responseRate, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-white/50">Conversion</span>
                            <span className={template.conversionRate >= 5 ? 'text-amber-400' : 'text-white/60'}>
                              {template.conversionRate}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${template.conversionRate >= 5 ? 'bg-amber-500' : 'bg-white/30'}`}
                              style={{ width: `${Math.min(template.conversionRate * 2, 100)}%` }}
                            />
                          </div>
                        </div>
                        {template.responseRate > 0 && (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Stats Row */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <StatCard value={stats.total} label="Total" icon={Users} color="white" size="sm" />
              <StatCard value={stats.not_contacted} label="Not Contacted" icon={Users} color="gray" size="sm" />
              <StatCard value={stats.dm_sent} label="DM Sent" icon={Send} color="cyan" size="sm" />
              <StatCard value={stats.responded} label="Responded" icon={MessageCircle} color="emerald" size="sm" />
              <StatCard value={stats.won} label="Won" icon={Trophy} color="amber" size="sm" />
              <StatCard value={stats.facebook} label="Facebook" icon={Users} color="blue" size="sm" />
              <StatCard value={stats.twitter} label="X/Twitter" icon={Twitter} color="cyan" size="sm" />
              <StatCard value={stats.follow_ups_due} label="Follow-ups" icon={AlertCircle} color={stats.follow_ups_due > 0 ? 'orange' : 'gray'} size="sm" />
            </div>
          )}

          {/* Stage Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(Object.keys(stageConfig) as StageFilter[]).map((stage) => {
              const config = stageConfig[stage];
              const count = stageCounts[stage];
              const isActive = stageFilter === stage;

              return (
                <button
                  key={stage}
                  onClick={() => setStageFilter(stage)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? `bg-${config.color === 'white' ? 'white' : config.color + '-500'}/20 text-${config.color === 'white' ? 'white' : config.color + '-400'} border border-${config.color === 'white' ? 'white' : config.color + '-500'}/30`
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <config.icon className="w-4 h-4" />
                  <span>{config.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filters Row */}
          <Card variant="default" className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Source filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white/40" />
                <div className="relative">
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                    className="appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 pr-8 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="all">All Platforms</option>
                    <option value="facebook">Facebook Only</option>
                    <option value="twitter">X/Twitter Only</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Sort:</span>
                <div className="relative">
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 pr-8 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="priority">Priority</option>
                    <option value="name">Name</option>
                    <option value="dm_sent_at">Recent DM</option>
                    <option value="group_name">By Group (FB)</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Search */}
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search contacts..."
                />
              </div>

              {/* Selection Mode Toggle */}
              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  if (selectionMode) clearSelection();
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                  selectionMode
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-white/60'
                }`}
                title={selectionMode ? 'Exit selection mode' : 'Enter selection mode'}
              >
                <CheckSquare className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">
                  {selectionMode ? 'Cancel' : 'Select'}
                </span>
              </button>

              {/* Refresh */}
              <button
                onClick={() => fetchPipeline()}
                disabled={loading}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-white/60 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </Card>

          {/* Contact List */}
          <Card variant="default" className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-5 h-5 text-white/30 animate-spin" />
              </div>
            ) : sortField === 'group_name' ? (
              /* Grouped by Facebook Group View */
              <div className="space-y-4">
                {groupedByGroup.length === 0 && ungroupedContacts.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-white/30 text-sm">
                    No contacts found
                  </div>
                ) : (
                  <>
                    {/* Facebook Groups */}
                    {groupedByGroup.map((group) => {
                      const isExpanded = expandedGroups.has(group.groupName);
                      // Determine group status based on most advanced stage
                      const groupStatus = group.stats.won > 0 ? 'won'
                        : group.stats.responded > 0 ? 'responded'
                        : group.stats.dm_sent > 0 ? 'dm_sent'
                        : 'not_contacted';
                      const statusColors = {
                        not_contacted: 'bg-gray-500/20 border-gray-500/30',
                        dm_sent: 'bg-cyan-500/20 border-cyan-500/30',
                        responded: 'bg-emerald-500/20 border-emerald-500/30',
                        won: 'bg-amber-500/20 border-amber-500/30',
                      };
                      const statusTextColors = {
                        not_contacted: 'text-gray-400',
                        dm_sent: 'text-cyan-400',
                        responded: 'text-emerald-400',
                        won: 'text-amber-400',
                      };

                      return (
                        <div key={group.groupName} className={`rounded-xl border ${statusColors[groupStatus]} overflow-hidden`}>
                          {/* Group Header */}
                          <button
                            onClick={() => toggleGroup(group.groupName)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-blue-500/20 rounded-xl shrink-0">
                                <Users className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="text-left min-w-0">
                                <h3 className="font-semibold text-white truncate">{group.groupName}</h3>
                                <p className="text-xs text-white/40">
                                  {group.stats.total} admin{group.stats.total !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {/* Status badges */}
                              <div className="flex items-center gap-1">
                                {group.stats.won > 0 && (
                                  <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">{group.stats.won} won</span>
                                )}
                                {group.stats.responded > 0 && (
                                  <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">{group.stats.responded} responded</span>
                                )}
                                {group.stats.dm_sent > 0 && (
                                  <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">{group.stats.dm_sent} DM sent</span>
                                )}
                                {group.stats.not_contacted > 0 && (
                                  <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded-full">{group.stats.not_contacted} pending</span>
                                )}
                              </div>
                              {/* Status indicator */}
                              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[groupStatus]} ${statusTextColors[groupStatus]}`}>
                                {groupStatus === 'won' ? 'Converted' : groupStatus === 'responded' ? 'Active' : groupStatus === 'dm_sent' ? 'Contacted' : 'New'}
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-white/40" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-white/40" />
                              )}
                            </div>
                          </button>

                          {/* Expanded Admin List */}
                          {isExpanded && (
                            <div className="border-t border-white/10 p-3 space-y-2 bg-black/20">
                              {group.contacts.map((contact) => (
                                <ContactCard
                                  key={contact.id}
                                  {...contact}
                                  onClick={() => setSelectedContact(contact)}
                                  onCopyTemplate={(e) => handleCopyTemplate(contact, e)}
                                  onMarkSent={(e) => handleMarkSent(contact, e)}
                                  onMarkResponded={(e) => handleMarkResponded(contact, e)}
                                  onGrantTrial={(e) => handleGrantTrial(contact, e)}
                                  onMarkWon={(e) => handleMarkWon(contact, e)}
                                  onSetFollowUp={(date) => handleSetFollowUp(contact, date)}
                                  hasTemplate={!!bestTemplate}
                                  selectionMode={selectionMode}
                                  isSelected={selectedIds.has(contact.id)}
                                  onToggleSelect={(e) => toggleSelectContact(contact.id, e)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Ungrouped Contacts (Twitter or FB without group) */}
                    {ungroupedContacts.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                          <Twitter className="w-4 h-4" />
                          Other Contacts ({ungroupedContacts.length})
                        </h3>
                        <div className="space-y-2">
                          {ungroupedContacts.map((contact) => (
                            <ContactCard
                              key={contact.id}
                              {...contact}
                              onClick={() => setSelectedContact(contact)}
                              onCopyTemplate={(e) => handleCopyTemplate(contact, e)}
                              onMarkSent={(e) => handleMarkSent(contact, e)}
                              onMarkResponded={(e) => handleMarkResponded(contact, e)}
                              onGrantTrial={(e) => handleGrantTrial(contact, e)}
                              onMarkWon={(e) => handleMarkWon(contact, e)}
                              onSetFollowUp={(date) => handleSetFollowUp(contact, date)}
                              hasTemplate={!!bestTemplate}
                              selectionMode={selectionMode}
                              isSelected={selectedIds.has(contact.id)}
                              onToggleSelect={(e) => toggleSelectContact(contact.id, e)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : paginatedContacts.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-white/30 text-sm">
                No contacts found
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    {...contact}
                    onClick={() => setSelectedContact(contact)}
                    onCopyTemplate={(e) => handleCopyTemplate(contact, e)}
                    onMarkSent={(e) => handleMarkSent(contact, e)}
                    onMarkResponded={(e) => handleMarkResponded(contact, e)}
                    onGrantTrial={(e) => handleGrantTrial(contact, e)}
                    onMarkWon={(e) => handleMarkWon(contact, e)}
                    onSetFollowUp={(date) => handleSetFollowUp(contact, date)}
                    hasTemplate={!!bestTemplate}
                    selectionMode={selectionMode}
                    isSelected={selectedIds.has(contact.id)}
                    onToggleSelect={(e) => toggleSelectContact(contact.id, e)}
                  />
                ))}
              </div>
            )}

            {/* Pagination - only show for non-grouped view */}
            {sortField !== 'group_name' && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <p className="text-sm text-white/40">
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredContacts.length)} of {filteredContacts.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Contact Detail Modal */}
          {selectedContact && (
            <ContactDetailModal
              contact={selectedContact}
              onClose={() => setSelectedContact(null)}
              onUpdate={handleUpdateContact}
              templates={templates}
            />
          )}

          {/* Bulk Action Bar */}
          {selectionMode && (
            <BulkActionBar
              selectedCount={selectedIds.size}
              totalCount={paginatedContacts.length}
              onSelectAll={selectAllVisible}
              onClearSelection={clearSelection}
              onBulkMarkSent={handleBulkMarkSent}
              onBulkSetFollowUp={handleBulkSetFollowUp}
              isAllSelected={selectedIds.size === paginatedContacts.length && paginatedContacts.length > 0}
              templates={templates}
            />
          )}

          {/* Toast */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
              action={toast.action}
              duration={toast.action ? 5000 : 3000}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function OutreachCRMPage() {
  return (
    <AdminGate
      title="Outreach CRM"
      description="Enter admin password to access the outreach pipeline"
    >
      <OutreachCRMContent />
    </AdminGate>
  );
}
