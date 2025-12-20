'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import { Card, StatCard, SearchInput, Toast, ToastType } from '@/components/admin/shared';
import ContactCard from '@/components/admin/ContactCard';
import ContactDetailModal from '@/components/admin/ContactDetailModal';
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

type StageFilter = 'all' | 'not_contacted' | 'dm_sent' | 'responded' | 'won';
type SourceFilter = 'all' | 'facebook' | 'twitter';
type SortField = 'priority' | 'name' | 'dm_sent_at';

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
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<UnifiedContact | null>(null);
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

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

  useEffect(() => {
    fetchPipeline();
    fetchTemplates();
  }, [fetchPipeline, fetchTemplates]);

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
        case 'priority':
        default:
          return (b.priority_score || 0) - (a.priority_score || 0);
      }
    });

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
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
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

          {/* Toast */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
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
