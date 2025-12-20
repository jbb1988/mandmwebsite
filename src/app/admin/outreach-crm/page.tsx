'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Card, StatCard, TabButton, SearchInput, Toast, ToastType } from '@/components/admin/shared';
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
  LayoutGrid,
  List,
  RefreshCw,
  ChevronDown,
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

type ViewMode = 'pipeline' | 'list';
type SourceFilter = 'all' | 'facebook' | 'twitter';

const stageConfig = {
  not_contacted: { label: 'Not Contacted', color: 'white', icon: Users },
  dm_sent: { label: 'DM Sent', color: 'cyan', icon: Send },
  responded: { label: 'Responded', color: 'emerald', icon: MessageCircle },
  won: { label: 'Won', color: 'amber', icon: Trophy },
} as const;

export default function OutreachCRMPage() {
  const { getPassword } = useAdminAuth();
  const password = getPassword();
  const [contacts, setContacts] = useState<UnifiedContact[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<UnifiedContact | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Group contacts by stage
  const contactsByStage = {
    not_contacted: contacts.filter(c => c.stage === 'not_contacted'),
    dm_sent: contacts.filter(c => c.stage === 'dm_sent'),
    responded: contacts.filter(c => c.stage === 'responded'),
    won: contacts.filter(c => c.stage === 'won'),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Outreach CRM</h1>
            <p className="text-white/50 text-sm mt-1">Unified view of all outreach contacts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPipeline()}
              disabled={loading}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-white/60 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <StatCard
              value={stats.total}
              label="Total"
              icon={Users}
              color="white"
              size="sm"
            />
            <StatCard
              value={stats.not_contacted}
              label="Not Contacted"
              icon={Users}
              color="gray"
              size="sm"
            />
            <StatCard
              value={stats.dm_sent}
              label="DM Sent"
              icon={Send}
              color="cyan"
              size="sm"
            />
            <StatCard
              value={stats.responded}
              label="Responded"
              icon={MessageCircle}
              color="emerald"
              size="sm"
            />
            <StatCard
              value={stats.won}
              label="Won"
              icon={Trophy}
              color="amber"
              size="sm"
            />
            <StatCard
              value={stats.facebook}
              label="Facebook"
              icon={Users}
              color="blue"
              size="sm"
            />
            <StatCard
              value={stats.twitter}
              label="X/Twitter"
              icon={Twitter}
              color="cyan"
              size="sm"
            />
            <StatCard
              value={stats.follow_ups_due}
              label="Follow-ups Due"
              icon={AlertCircle}
              color={stats.follow_ups_due > 0 ? 'orange' : 'gray'}
              size="sm"
            />
          </div>
        )}

        {/* Filters and Search */}
        <Card variant="default" className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* View mode toggle */}
            <div className="flex items-center gap-2">
              <TabButton
                active={viewMode === 'pipeline'}
                onClick={() => setViewMode('pipeline')}
                icon={LayoutGrid}
                label="Pipeline"
                color="cyan"
                size="sm"
              />
              <TabButton
                active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                icon={List}
                label="List"
                color="cyan"
                size="sm"
              />
            </div>

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

            {/* Search */}
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search contacts..."
              />
            </div>
          </div>
        </Card>

        {/* Pipeline View */}
        {viewMode === 'pipeline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(stageConfig) as Array<keyof typeof stageConfig>).map((stage) => {
              const config = stageConfig[stage];
              const stageContacts = contactsByStage[stage];
              const Icon = config.icon;

              return (
                <div key={stage} className="flex flex-col">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${config.color}-400`} />
                      <span className="text-sm font-medium text-white">{config.label}</span>
                    </div>
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                      {stageContacts.length}
                    </span>
                  </div>

                  {/* Column content */}
                  <div className="flex-1 space-y-2 min-h-[200px] bg-white/[0.02] rounded-xl p-2">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <RefreshCw className="w-5 h-5 text-white/30 animate-spin" />
                      </div>
                    ) : stageContacts.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-white/30 text-sm">
                        No contacts
                      </div>
                    ) : (
                      stageContacts.map((contact) => (
                        <ContactCard
                          key={contact.id}
                          {...contact}
                          onClick={() => setSelectedContact(contact)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card variant="default" className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-5 h-5 text-white/30 animate-spin" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-white/30 text-sm">
                No contacts found
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    {...contact}
                    onClick={() => setSelectedContact(contact)}
                  />
                ))}
              </div>
            )}
          </Card>
        )}

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
  );
}
