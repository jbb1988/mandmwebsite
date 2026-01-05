'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminGate from '@/components/AdminGate';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Database, Zap, CheckCircle2, XCircle, Clock, RefreshCw,
  Users, Mail, Building2, AlertCircle, ChevronDown, ChevronUp,
  Search, Filter, Send, Calendar, MessageSquare, Trophy,
  ExternalLink, Copy, MoreHorizontal, Star, Phone, Linkedin,
  Download, Eye, X, FileText, Sparkles, AlertTriangle, ArrowRight,
  ChevronRight, TrendingUp
} from 'lucide-react';
import { EMAIL_ALIASES, type EmailAlias } from '@/config/emailAliases';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

interface SegmentStat {
  segment: string;
  total: number;
  pending: number;
  completed: number;
  failed: number;
  contacts: number;
  orgsWithContacts: number;
  coverage: number;
  stages?: {
    new: number;
    email_sent: number;
    responded: number;
    meeting: number;
    won: number;
    lost: number;
  };
  responseRate?: number;
  meetingRate?: number;
  winRate?: number;
}

interface Contact {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  title: string | null;
  phone: string | null;
  linkedin_url: string | null;
  source: string | null;
  confidence: 'high' | 'verified' | 'medium' | 'low' | null;
  quality_score: number;
  stage: 'new' | 'email_sent' | 'responded' | 'meeting' | 'won' | 'lost';
  notes: string | null;
  last_contacted_at: string | null;
  next_follow_up: string | null;
  created_at: string;
  organization_id: string;
  organization: {
    id: string;
    name: string;
    segment: string;
    website: string | null;
    address: string | null;
  };
}

interface StageCounts {
  all: number;
  new: number;
  email_sent: number;
  responded: number;
  meeting: number;
  won: number;
  lost: number;
}

const SEGMENT_NAMES: Record<string, string> = {
  dbat_facility: 'D-BAT Facilities',
  facility: 'Batting Cages',
  frozen_ropes_facility: 'Frozen Ropes',
  influencer: 'Influencers',
  little_league: 'Little Leagues',
  travel_org: 'Travel Orgs',
  national_org: 'National Orgs',
};

const SEGMENT_COLORS: Record<string, string> = {
  dbat_facility: 'from-orange-500 to-red-500',
  facility: 'from-emerald-500 to-teal-500',
  frozen_ropes_facility: 'from-blue-500 to-indigo-500',
  influencer: 'from-pink-500 to-rose-500',
  little_league: 'from-yellow-500 to-amber-500',
  travel_org: 'from-purple-500 to-violet-500',
  national_org: 'from-cyan-500 to-sky-500',
};

const STAGE_CONFIG = {
  new: { label: 'New', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: Users },
  email_sent: { label: 'Email Sent', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: Send },
  responded: { label: 'Responded', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: MessageSquare },
  meeting: { label: 'Meeting', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Calendar },
  won: { label: 'Won', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Trophy },
  lost: { label: 'Lost', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle },
};

const QUALITY_COLORS: Record<string, string> = {
  high: 'text-emerald-400',
  verified: 'text-blue-400',
  medium: 'text-yellow-400',
  low: 'text-red-400',
};

export default function EnrichmentPage() {
  const { getPassword } = useAdminAuth();
  const [stats, setStats] = useState<SegmentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<string | null>(null);

  // CRM State
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [stageCounts, setStageCounts] = useState<StageCounts | null>(null);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [totalContacts, setTotalContacts] = useState(0);
  const [contactsOffset, setContactsOffset] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Email Modal State
  const [emailModalContact, setEmailModalContact] = useState<Contact | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedAlias, setSelectedAlias] = useState<EmailAlias>(EMAIL_ALIASES.find(a => a.id === 'partnerships') || EMAIL_ALIASES[0]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  // Notes & Follow-up State
  const [editingNotes, setEditingNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [overdueFollowUps, setOverdueFollowUps] = useState<Contact[]>([]);

  // Organization Modal State
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; name: string } | null>(null);
  const [orgContacts, setOrgContacts] = useState<Contact[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);

  // Add Organization Modal State
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgWebsite, setNewOrgWebsite] = useState('');
  const [newOrgSegment, setNewOrgSegment] = useState('facility');
  const [newOrgAddress, setNewOrgAddress] = useState('');
  const [savingOrg, setSavingOrg] = useState(false);

  // Add Contact Modal State
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactFirstName, setNewContactFirstName] = useState('');
  const [newContactLastName, setNewContactLastName] = useState('');
  const [newContactTitle, setNewContactTitle] = useState('');
  const [newContactOrgId, setNewContactOrgId] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [orgOptions, setOrgOptions] = useState<{ id: string; name: string }[]>([]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/enrichment', {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = useCallback(async (segment: string, stage?: string, search?: string, offset = 0) => {
    setContactsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('segment', segment);
      if (stage && stage !== 'all') params.set('stage', stage);
      if (search) params.set('search', search);
      params.set('limit', '50');
      params.set('offset', offset.toString());

      const response = await fetch(`/api/admin/enrichment/contacts?${params}`, {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        if (offset === 0) {
          setContacts(data.contacts);
        } else {
          setContacts(prev => [...prev, ...data.contacts]);
        }
        setStageCounts(data.stageCounts);
        setTotalContacts(data.total);
        setContactsOffset(offset);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  }, [getPassword]);

  useEffect(() => {
    fetchStats();
    fetchOverdueFollowUps();
  }, []);

  // Initialize notes when contact is selected
  useEffect(() => {
    if (selectedContact) {
      setEditingNotes(selectedContact.notes || '');
    }
  }, [selectedContact]);

  useEffect(() => {
    if (expandedSegment) {
      fetchContacts(expandedSegment, stageFilter, searchQuery, 0);
    }
  }, [expandedSegment, stageFilter, searchQuery, fetchContacts]);

  const scrapeSegment = async (segment: string, count: number = 25) => {
    setScraping(segment);
    try {
      const response = await fetch('/api/admin/enrichment/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({ segment, limit: count, create_contacts: true }),
      });
      const data = await response.json();
      if (data.success) {
        setToast({ message: `Found ${data.summary?.emails_found || 0} emails, created ${data.summary?.contacts_created || 0} contacts`, type: 'success' });
        await fetchStats();
        if (expandedSegment === segment) {
          fetchContacts(segment, stageFilter, searchQuery, 0);
        }
      }
    } catch (error) {
      setToast({ message: 'Scraping failed', type: 'error' });
    } finally {
      setScraping(null);
    }
  };

  const updateContactStage = async (contactId: string, newStage: string) => {
    try {
      const response = await fetch('/api/admin/enrichment/contacts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({ id: contactId, stage: newStage }),
      });
      const data = await response.json();
      if (data.success) {
        setContacts(prev => prev.map(c => c.id === contactId ? { ...c, stage: newStage as Contact['stage'] } : c));
        setToast({ message: `Moved to ${STAGE_CONFIG[newStage as keyof typeof STAGE_CONFIG]?.label}`, type: 'success' });
        // Refresh counts
        if (expandedSegment) {
          fetchContacts(expandedSegment, stageFilter, searchQuery, 0);
        }
      }
    } catch (error) {
      setToast({ message: 'Failed to update', type: 'error' });
    }
  };

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setToast({ message: 'Email copied!', type: 'success' });
  };

  // Update contact notes
  const updateContactNotes = async (contactId: string, notes: string) => {
    setSavingNotes(true);
    try {
      const response = await fetch('/api/admin/enrichment/contacts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({ id: contactId, notes }),
      });
      const data = await response.json();
      if (data.success) {
        setContacts(prev => prev.map(c => c.id === contactId ? { ...c, notes } : c));
        if (selectedContact?.id === contactId) {
          setSelectedContact({ ...selectedContact, notes });
        }
        setToast({ message: 'Notes saved', type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Failed to save notes', type: 'error' });
    } finally {
      setSavingNotes(false);
    }
  };

  // Update contact follow-up date
  const updateContactFollowUp = async (contactId: string, next_follow_up: string | null) => {
    try {
      const response = await fetch('/api/admin/enrichment/contacts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({ id: contactId, next_follow_up }),
      });
      const data = await response.json();
      if (data.success) {
        setContacts(prev => prev.map(c => c.id === contactId ? { ...c, next_follow_up } : c));
        if (selectedContact?.id === contactId) {
          setSelectedContact({ ...selectedContact, next_follow_up });
        }
        // Refresh overdue list
        fetchOverdueFollowUps();
        setToast({ message: next_follow_up ? 'Follow-up scheduled' : 'Follow-up cleared', type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Failed to update follow-up', type: 'error' });
    }
  };

  // Fetch overdue follow-ups
  const fetchOverdueFollowUps = async () => {
    try {
      const response = await fetch('/api/admin/enrichment/contacts?follow_up_overdue=true&limit=10', {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setOverdueFollowUps(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching overdue follow-ups:', error);
    }
  };

  // Fetch org contacts
  const fetchOrgContacts = async (orgId: string) => {
    setOrgLoading(true);
    try {
      const response = await fetch(`/api/admin/enrichment/contacts?org_id=${orgId}&limit=50`, {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setOrgContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching org contacts:', error);
    } finally {
      setOrgLoading(false);
    }
  };

  // Create new organization
  const createOrganization = async () => {
    if (!newOrgName || !newOrgSegment) {
      setToast({ message: 'Name and segment are required', type: 'error' });
      return;
    }
    setSavingOrg(true);
    try {
      const response = await fetch('/api/admin/enrichment/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({
          name: newOrgName,
          website: newOrgWebsite || null,
          segment: newOrgSegment,
          address: newOrgAddress || null,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setToast({ message: data.message || 'Organization created', type: 'success' });
        setShowAddOrgModal(false);
        setNewOrgName('');
        setNewOrgWebsite('');
        setNewOrgSegment('facility');
        setNewOrgAddress('');
        // Refresh stats to show new pending org
        await fetchStats();
      } else {
        setToast({ message: data.message || 'Failed to create organization', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to create organization', type: 'error' });
    } finally {
      setSavingOrg(false);
    }
  };

  // Fetch organizations for dropdown
  const fetchOrgOptions = async (segment?: string) => {
    try {
      const params = new URLSearchParams();
      if (segment && segment !== 'all') params.set('segment', segment);
      params.set('limit', '100');
      const response = await fetch(`/api/admin/enrichment/organizations?${params}`, {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setOrgOptions(data.organizations || []);
      }
    } catch (error) {
      console.error('Error fetching org options:', error);
    }
  };

  // Create new contact
  const createContact = async () => {
    if (!newContactEmail || !newContactOrgId) {
      setToast({ message: 'Email and organization are required', type: 'error' });
      return;
    }
    setSavingContact(true);
    try {
      // Generate source tag: manual_{segment}_{month}{year}
      const now = new Date();
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const sourceTag = `manual_${expandedSegment || 'unknown'}_${monthNames[now.getMonth()]}${now.getFullYear()}`;

      const response = await fetch('/api/admin/enrichment/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({
          organization_id: newContactOrgId,
          email: newContactEmail,
          first_name: newContactFirstName || null,
          last_name: newContactLastName || null,
          role: newContactTitle || 'Contact',
          source: sourceTag,
          create_contact: true,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setToast({ message: data.message || 'Contact created', type: 'success' });
        setShowAddContactModal(false);
        setNewContactEmail('');
        setNewContactFirstName('');
        setNewContactLastName('');
        setNewContactTitle('');
        setNewContactOrgId('');
        // Refresh contacts if segment is expanded
        if (expandedSegment) {
          fetchContacts(expandedSegment, stageFilter, searchQuery, 0);
        }
        await fetchStats();
      } else {
        setToast({ message: data.message || 'Failed to create contact', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to create contact', type: 'error' });
    } finally {
      setSavingContact(false);
    }
  };

  // Open add contact modal
  const openAddContactModal = () => {
    if (expandedSegment) {
      fetchOrgOptions(expandedSegment);
    }
    setShowAddContactModal(true);
  };

  // Calculate days difference for follow-up
  const getFollowUpStatus = (followUpDate: string | null) => {
    if (!followUpDate) return null;
    const now = new Date();
    const followUp = new Date(followUpDate);
    const diffMs = followUp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true, daysUntil: diffDays };
    } else if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false, daysUntil: 0 };
    } else {
      return { text: `Due in ${diffDays} days`, isOverdue: false, daysUntil: diffDays };
    }
  };

  // Get quick date options
  const getQuickDateOption = (option: 'tomorrow' | 'next_week' | 'next_month'): string => {
    const date = new Date();
    if (option === 'tomorrow') {
      date.setDate(date.getDate() + 1);
    } else if (option === 'next_week') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString();
  };

  // Fetch email templates
  const fetchEmailTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-sender/templates', {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setEmailTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  // Open email modal for a contact
  const openEmailModal = (contact: Contact) => {
    setEmailModalContact(contact);
    // Set default subject and body with variables
    setEmailSubject(`Partnership Opportunity - ${contact.organization?.name || 'Your Organization'}`);
    setEmailBody(`<p>Hi {{first_name}},</p>

<p>I'm reaching out from Mind & Muscle, a baseball and softball training platform used by athletes across the country.</p>

<p>I noticed {{org_name}} and wanted to explore a potential partnership. We help facilities like yours provide cutting-edge mental and physical training tools to their athletes.</p>

<p>Would you be open to a quick 15-minute call this week to learn more?</p>

<p>Best,<br/>
Jeff<br/>
Mind & Muscle</p>`);
    fetchEmailTemplates();
  };

  // Select a template
  const selectTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailBody(template.body);
    setShowTemplateDropdown(false);
  };

  // Preview email with variables replaced
  const previewEmail = (text: string) => {
    if (!emailModalContact) return text;
    return text
      .replace(/\{\{first_name\}\}/gi, emailModalContact.first_name || 'there')
      .replace(/\{\{last_name\}\}/gi, emailModalContact.last_name || '')
      .replace(/\{\{name\}\}/gi, emailModalContact.first_name || 'there')
      .replace(/\{\{org_name\}\}/gi, emailModalContact.organization?.name || 'your organization')
      .replace(/\{\{organization\}\}/gi, emailModalContact.organization?.name || 'your organization')
      .replace(/\{\{email\}\}/gi, emailModalContact.email || '')
      .replace(/\{\{title\}\}/gi, emailModalContact.title || '');
  };

  // Send email
  const sendEmail = async () => {
    if (!emailModalContact || !emailSubject || !emailBody) return;

    setSendingEmail(true);
    try {
      const response = await fetch('/api/admin/enrichment/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({
          contactId: emailModalContact.id,
          from: selectedAlias.email,
          fromName: selectedAlias.name,
          subject: emailSubject,
          body: emailBody,
          updateStage: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Email sent successfully!', type: 'success' });
        // Update contact in local state
        setContacts(prev => prev.map(c =>
          c.id === emailModalContact.id
            ? { ...c, stage: 'email_sent' as const, last_contacted_at: new Date().toISOString() }
            : c
        ));
        setEmailModalContact(null);
        setEmailSubject('');
        setEmailBody('');
        // Refresh stage counts
        if (expandedSegment) {
          fetchContacts(expandedSegment, stageFilter, searchQuery, 0);
        }
      } else {
        setToast({ message: data.message || 'Failed to send email', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to send email', type: 'error' });
    } finally {
      setSendingEmail(false);
    }
  };

  const exportContacts = () => {
    if (!contacts.length) return;

    const csv = [
      ['Name', 'Email', 'Organization', 'Title', 'Phone', 'Stage', 'Quality', 'Created'].join(','),
      ...contacts.map(c => [
        `"${c.first_name} ${c.last_name}"`,
        c.email,
        `"${c.organization?.name || ''}"`,
        `"${c.title || ''}"`,
        c.phone || '',
        c.stage,
        c.quality_score,
        new Date(c.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${expandedSegment}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: `Exported ${contacts.length} contacts`, type: 'success' });
  };

  const totalOrgs = stats.reduce((sum, s) => sum + s.total, 0);
  const totalContactsAll = stats.reduce((sum, s) => sum + s.contacts, 0);
  const totalPending = stats.reduce((sum, s) => sum + s.pending, 0);
  const overallCoverage = totalOrgs > 0 ? Math.round((stats.reduce((sum, s) => sum + s.orgsWithContacts, 0) / totalOrgs) * 100) : 0;

  if (loading) {
    return (
      <AdminGate>
        <div className="min-h-screen bg-[#0A0B14] text-white flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </AdminGate>
    );
  }

  return (
    <AdminGate>
      <div className="min-h-screen bg-[#0A0B14] text-white p-6">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Lead Enrichment</h1>
              <p className="text-white/50">Find and manage B2B contacts for sales outreach</p>
            </div>
            <button
              onClick={() => setShowAddOrgModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl font-medium transition-all shadow-lg"
            >
              <Building2 className="w-5 h-5" />
              Add Organization
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-white/50" />
              <p className="text-3xl font-bold">{totalOrgs.toLocaleString()}</p>
              <p className="text-sm text-white/50">Organizations</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
              <Users className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-3xl font-bold text-emerald-400">{totalContactsAll.toLocaleString()}</p>
              <p className="text-sm text-white/50">Contacts</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-3xl font-bold text-orange-400">{totalPending.toLocaleString()}</p>
              <p className="text-sm text-white/50">Need Enrichment</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
              <Mail className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-3xl font-bold text-blue-400">{overallCoverage}%</p>
              <p className="text-sm text-white/50">Coverage</p>
            </div>
          </div>

          {/* Follow-up Queue Alert */}
          {overdueFollowUps.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-400">Follow-ups Overdue</h3>
                    <p className="text-sm text-white/50">{overdueFollowUps.length} contacts need attention</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {overdueFollowUps.slice(0, 5).map((contact) => {
                  const status = getFollowUpStatus(contact.next_follow_up);
                  return (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-400">{contact.first_name?.[0] || '?'}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {contact.first_name} {contact.last_name}
                          </p>
                          <p className="text-xs text-white/40 truncate">{contact.organization?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400 font-medium px-2 py-1 bg-red-500/20 rounded-lg">
                          {status?.text}
                        </span>
                        <button
                          onClick={() => openEmailModal(contact)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                          title="Send email"
                        >
                          <Send className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-white/50" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {overdueFollowUps.length > 5 && (
                  <p className="text-center text-sm text-white/40 py-2">
                    +{overdueFollowUps.length - 5} more overdue
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pipeline Funnel Visualization */}
          {stageCounts && (stageCounts.all > 0 || expandedSegment) && (
            <div className="bg-[#0F1123] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold">Sales Pipeline</h3>
                {expandedSegment && (
                  <span className="text-sm text-white/40">
                    ({SEGMENT_NAMES[expandedSegment] || expandedSegment})
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                {/* New */}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-gray-500/20 flex items-center justify-center border border-gray-500/30">
                    <Users className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-2xl font-bold">{stageCounts?.new || 0}</p>
                  <p className="text-xs text-white/50">New</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 flex-shrink-0" />
                {/* Email Sent */}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <Send className="w-6 h-6 text-cyan-300" />
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">{stageCounts?.email_sent || 0}</p>
                  <p className="text-xs text-white/50">Email Sent</p>
                  {stageCounts && stageCounts.new > 0 && (
                    <p className="text-xs text-cyan-400/70 mt-1">
                      {Math.round((stageCounts.email_sent / (stageCounts.new + stageCounts.email_sent)) * 100)}% sent
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 flex-shrink-0" />
                {/* Responded */}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <MessageSquare className="w-6 h-6 text-emerald-300" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{stageCounts?.responded || 0}</p>
                  <p className="text-xs text-white/50">Responded</p>
                  {stageCounts && stageCounts.email_sent > 0 && (
                    <p className="text-xs text-emerald-400/70 mt-1">
                      {Math.round((stageCounts.responded / stageCounts.email_sent) * 100)}% response
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 flex-shrink-0" />
                {/* Meeting */}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                    <Calendar className="w-6 h-6 text-purple-300" />
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{stageCounts?.meeting || 0}</p>
                  <p className="text-xs text-white/50">Meeting</p>
                  {stageCounts && stageCounts.responded > 0 && (
                    <p className="text-xs text-purple-400/70 mt-1">
                      {Math.round((stageCounts.meeting / stageCounts.responded) * 100)}% booked
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 flex-shrink-0" />
                {/* Won */}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <Trophy className="w-6 h-6 text-amber-300" />
                  </div>
                  <p className="text-2xl font-bold text-amber-400">{stageCounts?.won || 0}</p>
                  <p className="text-xs text-white/50">Won</p>
                  {stageCounts && stageCounts.meeting > 0 && (
                    <p className="text-xs text-amber-400/70 mt-1">
                      {Math.round((stageCounts.won / stageCounts.meeting) * 100)}% close
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 flex-shrink-0" />
                {/* Lost */}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <XCircle className="w-6 h-6 text-red-300" />
                  </div>
                  <p className="text-2xl font-bold text-red-400">{stageCounts?.lost || 0}</p>
                  <p className="text-xs text-white/50">Lost</p>
                </div>
              </div>
            </div>
          )}

          {/* Segment Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Segments</h2>
              <p className="text-sm text-white/40">Click to view contacts</p>
            </div>

            {stats.map((stat) => {
              const isExpanded = expandedSegment === stat.segment;
              const isScraping = scraping === stat.segment;
              const gradient = SEGMENT_COLORS[stat.segment] || 'from-gray-500 to-gray-600';

              return (
                <div
                  key={stat.segment}
                  className={`bg-[#0F1123] border rounded-2xl overflow-hidden transition-all ${
                    isExpanded ? 'border-white/30' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Segment Header - Clickable */}
                  <div
                    onClick={() => setExpandedSegment(isExpanded ? null : stat.segment)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{SEGMENT_NAMES[stat.segment] || stat.segment}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                          <span>{stat.total} orgs</span>
                          <span className="text-emerald-400">{stat.contacts} contacts</span>
                          <span className="text-orange-400">{stat.pending} pending</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Performance Metrics */}
                      {stat.contacts > 0 && (
                        <div className="hidden sm:flex items-center gap-3 text-xs">
                          {(stat.stages?.email_sent || 0) > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 rounded-lg">
                              <Send className="w-3 h-3 text-cyan-400" />
                              <span className="text-cyan-400 font-medium">{stat.stages?.email_sent}</span>
                              <span className="text-white/40">sent</span>
                            </div>
                          )}
                          {(stat.responseRate || 0) > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg">
                              <MessageSquare className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">{stat.responseRate}%</span>
                              <span className="text-white/40">response</span>
                            </div>
                          )}
                          {(stat.stages?.won || 0) > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-lg">
                              <Trophy className="w-3 h-3 text-amber-400" />
                              <span className="text-amber-400 font-medium">{stat.stages?.won}</span>
                              <span className="text-white/40">won</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Coverage */}
                      <div className="w-32 text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className={`text-sm font-bold ${stat.coverage === 100 ? 'text-emerald-400' : ''}`}>
                            {stat.coverage}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${gradient}`}
                            style={{ width: `${stat.coverage}%` }}
                          />
                        </div>
                      </div>

                      {/* Scrape Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); scrapeSegment(stat.segment); }}
                        disabled={isScraping || stat.pending === 0}
                        className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                          stat.pending === 0
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : isScraping
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {isScraping ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : stat.pending === 0 ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        {isScraping ? 'Scraping...' : stat.pending === 0 ? 'Done' : 'Scrape'}
                      </button>

                      {/* Expand Icon */}
                      <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-white/10' : ''}`}>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/50" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/50" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Contact List */}
                  {isExpanded && (
                    <div className="border-t border-white/10 bg-black/20">
                      {/* Pipeline Stage Tabs */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-2 flex-wrap">
                          {Object.entries(STAGE_CONFIG).map(([key, config]) => {
                            const count = stageCounts?.[key as keyof StageCounts] || 0;
                            const isActive = stageFilter === key;
                            const Icon = config.icon;

                            return (
                              <button
                                key={key}
                                onClick={() => setStageFilter(key)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                  isActive ? config.color : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                {config.label}
                                <span className={`px-1.5 py-0.5 rounded text-xs ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                                  {count}
                                </span>
                              </button>
                            );
                          })}

                          {/* All filter */}
                          <button
                            onClick={() => setStageFilter('all')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                              stageFilter === 'all'
                                ? 'bg-white/20 text-white border-white/30'
                                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            All
                            <span className={`px-1.5 py-0.5 rounded text-xs ${stageFilter === 'all' ? 'bg-white/20' : 'bg-white/10'}`}>
                              {stageCounts?.all || 0}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Search & Actions */}
                      <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-white/30"
                          />
                        </div>
                        <button
                          onClick={exportContacts}
                          disabled={contacts.length === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          Export CSV
                        </button>
                        <button
                          onClick={openAddContactModal}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-sm font-medium transition-all"
                        >
                          <Users className="w-4 h-4" />
                          Add Contact
                        </button>
                      </div>

                      {/* Contact List */}
                      <div className="max-h-[500px] overflow-y-auto">
                        {contactsLoading && contacts.length === 0 ? (
                          <div className="flex items-center justify-center p-8">
                            <RefreshCw className="w-6 h-6 animate-spin text-white/30" />
                          </div>
                        ) : contacts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-8 text-white/40">
                            <Users className="w-8 h-8 mb-2" />
                            <p>No contacts found</p>
                            <p className="text-sm">Try scraping to discover emails</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-white/5">
                            {contacts.map((contact) => (
                              <div
                                key={contact.id}
                                className="p-4 hover:bg-white/[0.02] transition-colors group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 min-w-0 flex-1">
                                    {/* Quality indicator */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      contact.quality_score >= 70 ? 'bg-emerald-500/20' :
                                      contact.quality_score >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                                    }`}>
                                      <span className={`text-sm font-bold ${
                                        contact.quality_score >= 70 ? 'text-emerald-400' :
                                        contact.quality_score >= 50 ? 'text-yellow-400' : 'text-red-400'
                                      }`}>
                                        {contact.quality_score}
                                      </span>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-medium truncate">
                                          {contact.first_name} {contact.last_name}
                                        </p>
                                        {contact.title && (
                                          <span className="text-xs text-white/40 truncate">
                                            {contact.title}
                                          </span>
                                        )}
                                        {contact.source && (
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            contact.source.startsWith('manual')
                                              ? 'bg-blue-500/20 text-blue-400'
                                              : contact.source.startsWith('auto_')
                                              ? 'bg-emerald-500/20 text-emerald-400'
                                              : 'bg-white/10 text-white/50'
                                          }`}>
                                            {contact.source.replace(/_/g, ' ')}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 text-sm">
                                        <button
                                          onClick={() => copyEmail(contact.email)}
                                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                          <Mail className="w-3.5 h-3.5" />
                                          {contact.email}
                                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                        <span className="text-white/30">|</span>
                                        <button
                                          onClick={() => {
                                            if (contact.organization) {
                                              setSelectedOrg({ id: contact.organization.id, name: contact.organization.name });
                                              fetchOrgContacts(contact.organization.id);
                                            }
                                          }}
                                          className="text-white/50 hover:text-purple-400 truncate transition-colors"
                                        >
                                          {contact.organization?.name}
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">
                                    {/* Stage selector */}
                                    <select
                                      value={contact.stage}
                                      onChange={(e) => updateContactStage(contact.id, e.target.value)}
                                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer ${
                                        STAGE_CONFIG[contact.stage]?.color || 'bg-white/10'
                                      }`}
                                    >
                                      {Object.entries(STAGE_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key} className="bg-[#0F1123] text-white">
                                          {config.label}
                                        </option>
                                      ))}
                                    </select>

                                    {/* Quick Actions */}
                                    {contact.phone && (
                                      <a
                                        href={`tel:${contact.phone}`}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                        title={contact.phone}
                                      >
                                        <Phone className="w-4 h-4 text-white/50" />
                                      </a>
                                    )}
                                    {contact.linkedin_url && (
                                      <a
                                        href={contact.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                      >
                                        <Linkedin className="w-4 h-4 text-white/50" />
                                      </a>
                                    )}
                                    {contact.organization?.website && (
                                      <a
                                        href={contact.organization.website.startsWith('http') ? contact.organization.website : `https://${contact.organization.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                        title="Visit website"
                                      >
                                        <ExternalLink className="w-4 h-4 text-white/50" />
                                      </a>
                                    )}
                                    {/* Send Email Button */}
                                    <button
                                      onClick={() => openEmailModal(contact)}
                                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                                      title="Send email"
                                    >
                                      <Send className="w-4 h-4 text-blue-400" />
                                    </button>
                                    <button
                                      onClick={() => setSelectedContact(contact)}
                                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                      title="View details"
                                    >
                                      <Eye className="w-4 h-4 text-white/50" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Load More */}
                        {contacts.length < totalContacts && (
                          <div className="p-4 flex justify-center">
                            <button
                              onClick={() => fetchContacts(expandedSegment!, stageFilter, searchQuery, contactsOffset + 50)}
                              disabled={contactsLoading}
                              className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {contactsLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                `Load More (${contacts.length}/${totalContacts})`
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-400 mb-2">Quality-First Discovery</p>
                <p className="text-sm text-white/70 mb-3">
                  Only creates contacts for <span className="text-emerald-400">high-quality leads</span>.
                  Generic emails (info@, contact@) have ~5% response rates - we skip those.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/70">Personal emails (john@, jsmith@) = <span className="text-emerald-400">HIGH quality</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/70">Role emails (owner@, coach@) = <span className="text-emerald-400">HIGH quality</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-white/70">Generic (info@, contact@) = <span className="text-red-400">LOW quality - skipped</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedContact(null)}>
          <div className="bg-[#0F1123] border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">{selectedContact.first_name} {selectedContact.last_name}</h3>
                {selectedContact.title && <p className="text-white/50">{selectedContact.title}</p>}
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${STAGE_CONFIG[selectedContact.stage]?.color}`}>
                {STAGE_CONFIG[selectedContact.stage]?.label}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div className="flex-1">
                  <p className="text-sm text-white/50">Email</p>
                  <p className="font-medium">{selectedContact.email}</p>
                </div>
                <button
                  onClick={() => copyEmail(selectedContact.email)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Building2 className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm text-white/50">Organization</p>
                  <button
                    onClick={() => {
                      if (selectedContact.organization) {
                        setSelectedOrg({ id: selectedContact.organization.id, name: selectedContact.organization.name });
                        fetchOrgContacts(selectedContact.organization.id);
                      }
                    }}
                    className="font-medium text-left hover:text-purple-400 transition-colors flex items-center gap-1"
                  >
                    {selectedContact.organization?.name}
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                  {selectedContact.organization?.address && (
                    <p className="text-sm text-white/40">
                      {selectedContact.organization.address}
                    </p>
                  )}
                </div>
                {selectedContact.organization?.website && (
                  <a
                    href={selectedContact.organization.website.startsWith('http') ? selectedContact.organization.website : `https://${selectedContact.organization.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-sm text-white/50 mb-1">Quality Score</p>
                  <p className={`text-2xl font-bold ${
                    selectedContact.quality_score >= 70 ? 'text-emerald-400' :
                    selectedContact.quality_score >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {selectedContact.quality_score}
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-sm text-white/50 mb-1">Confidence</p>
                  <p className={`text-lg font-medium capitalize ${QUALITY_COLORS[selectedContact.confidence || 'medium']}`}>
                    {selectedContact.confidence || 'Unknown'}
                  </p>
                </div>
              </div>

              {selectedContact.phone && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-sm text-white/50">Phone</p>
                    <p className="font-medium">{selectedContact.phone}</p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-sm text-white/50 mb-1">Added</p>
                <p className="font-medium">{new Date(selectedContact.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}</p>
              </div>

              {/* Notes */}
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/50">Notes</p>
                  {savingNotes && (
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
                    </span>
                  )}
                </div>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  onBlur={() => {
                    if (editingNotes !== (selectedContact.notes || '')) {
                      updateContactNotes(selectedContact.id, editingNotes);
                    }
                  }}
                  placeholder="Add internal notes about this contact..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none"
                />
                <p className="text-xs text-white/30 mt-1 text-right">{editingNotes.length}/500</p>
              </div>

              {/* Follow-up Date */}
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-sm text-white/50 mb-2">Follow-up Date</p>
                {selectedContact.next_follow_up && (
                  <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    getFollowUpStatus(selectedContact.next_follow_up)?.isOverdue
                      ? 'bg-red-500/20 text-red-400'
                      : getFollowUpStatus(selectedContact.next_follow_up)?.daysUntil === 0
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(selectedContact.next_follow_up).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </span>
                    <span className="mx-1">-</span>
                    <span className="font-normal">{getFollowUpStatus(selectedContact.next_follow_up)?.text}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateContactFollowUp(selectedContact.id, getQuickDateOption('tomorrow'))}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => updateContactFollowUp(selectedContact.id, getQuickDateOption('next_week'))}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
                  >
                    Next Week
                  </button>
                  <button
                    onClick={() => updateContactFollowUp(selectedContact.id, getQuickDateOption('next_month'))}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
                  >
                    In 1 Month
                  </button>
                  {selectedContact.next_follow_up && (
                    <button
                      onClick={() => updateContactFollowUp(selectedContact.id, null)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Stage Actions */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-white/50 mb-3">Move to stage:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STAGE_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = selectedContact.stage === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          updateContactStage(selectedContact.id, key);
                          setSelectedContact({ ...selectedContact, stage: key as Contact['stage'] });
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          isActive ? config.color : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedContact(null)}
              className="w-full mt-6 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      {emailModalContact && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEmailModalContact(null)}>
          <div className="bg-[#0F1123] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-400" />
                  Send Email
                </h3>
                <p className="text-sm text-white/50">
                  To: {emailModalContact.first_name} {emailModalContact.last_name} ({emailModalContact.email})
                </p>
              </div>
              <button
                onClick={() => setEmailModalContact(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* From Alias */}
              <div>
                <label className="text-sm text-white/50 mb-2 block">From</label>
                <select
                  value={selectedAlias.id}
                  onChange={(e) => setSelectedAlias(EMAIL_ALIASES.find(a => a.id === e.target.value) || EMAIL_ALIASES[0])}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                >
                  {EMAIL_ALIASES.filter(a => a.category === 'partnerships' || a.category === 'marketing').map(alias => (
                    <option key={alias.id} value={alias.id} className="bg-[#0F1123]">
                      {alias.name} ({alias.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Selector */}
              <div className="relative">
                <label className="text-sm text-white/50 mb-2 block">Template (Optional)</label>
                <button
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/70 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Select a template...
                  </span>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showTemplateDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showTemplateDropdown && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-[#1B1F39] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                    <button
                      onClick={() => setShowTemplateDropdown(false)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-b border-white/5"
                    >
                      <Sparkles className="w-4 h-4 text-white/40" />
                      <span className="text-white/70">Use current content</span>
                    </button>
                    {emailTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => selectTemplate(template)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
                      >
                        <FileText className="w-4 h-4 text-white/40" />
                        <div>
                          <p className="text-white text-sm">{template.name}</p>
                          <p className="text-white/40 text-xs">{template.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm text-white/50 mb-2 block">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-white/50">Body</label>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>Variables:</span>
                    <code className="px-1.5 py-0.5 bg-white/10 rounded">{'{{first_name}}'}</code>
                    <code className="px-1.5 py-0.5 bg-white/10 rounded">{'{{org_name}}'}</code>
                  </div>
                </div>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email body (HTML supported)..."
                  rows={10}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 font-mono text-sm resize-none"
                />
              </div>

              {/* Preview */}
              <div>
                <label className="text-sm text-white/50 mb-2 block">Preview</label>
                <div className="p-4 bg-white rounded-xl text-gray-800 text-sm max-h-40 overflow-y-auto">
                  <p className="font-semibold text-gray-600 mb-2">{previewEmail(emailSubject)}</p>
                  <div dangerouslySetInnerHTML={{ __html: previewEmail(emailBody) }} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Building2 className="w-4 h-4" />
                {emailModalContact.organization?.name}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEmailModalContact(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  disabled={sendingEmail || !emailSubject || !emailBody}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Detail Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrg(null)}>
          <div className="bg-[#0F1123] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">{selectedOrg.name}</h3>
                <p className="text-white/50 text-sm mt-1">Organization Details</p>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {orgLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-white/30" />
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                {/* Contacts at this org */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-white/50">Contacts ({orgContacts.length})</p>
                  </div>
                  {orgContacts.length === 0 ? (
                    <p className="text-center text-white/30 py-4">No contacts found</p>
                  ) : (
                    <div className="space-y-2">
                      {orgContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {contact.first_name} {contact.last_name}
                              </p>
                              <div className={`px-2 py-0.5 rounded text-xs font-medium ${STAGE_CONFIG[contact.stage]?.color}`}>
                                {STAGE_CONFIG[contact.stage]?.label}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                              <span>{contact.email}</span>
                              {contact.title && (
                                <>
                                  <span>|</span>
                                  <span>{contact.title}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedOrg(null);
                                openEmailModal(contact);
                              }}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                              title="Send email"
                            >
                              <Send className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrg(null);
                                setSelectedContact(contact);
                              }}
                              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4 text-white/50" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stage breakdown */}
                {orgContacts.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/50 mb-3">Pipeline Breakdown</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STAGE_CONFIG).map(([key, config]) => {
                        const count = orgContacts.filter(c => c.stage === key).length;
                        if (count === 0) return null;
                        const Icon = config.icon;
                        return (
                          <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.color}`}>
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setSelectedOrg(null)}
              className="w-full mt-6 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Organization Modal */}
      {showAddOrgModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddOrgModal(false)}>
          <div className="bg-[#0F1123] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Add Organization</h3>
                <p className="text-white/50 text-sm mt-1">Add a new organization to enrich</p>
              </div>
              <button
                onClick={() => setShowAddOrgModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/50 mb-2 block">Name *</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Organization name..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-sm text-white/50 mb-2 block">Website</label>
                <input
                  type="text"
                  value={newOrgWebsite}
                  onChange={(e) => setNewOrgWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-xs text-white/40 mt-1">Required for email enrichment</p>
              </div>

              <div>
                <label className="text-sm text-white/50 mb-2 block">Segment *</label>
                <select
                  value={newOrgSegment}
                  onChange={(e) => setNewOrgSegment(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                >
                  {Object.entries(SEGMENT_NAMES).map(([key, name]) => (
                    <option key={key} value={key} className="bg-[#0F1123]">{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/50 mb-2 block">Address</label>
                <input
                  type="text"
                  value={newOrgAddress}
                  onChange={(e) => setNewOrgAddress(e.target.value)}
                  placeholder="City, State"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddOrgModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createOrganization}
                disabled={savingOrg || !newOrgName}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingOrg ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    Create Organization
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddContactModal(false)}>
          <div className="bg-[#0F1123] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Add Contact</h3>
                <p className="text-white/50 text-sm mt-1">Add a contact to an organization</p>
              </div>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/50 mb-2 block">Organization *</label>
                <select
                  value={newContactOrgId}
                  onChange={(e) => setNewContactOrgId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="" className="bg-[#0F1123]">Select organization...</option>
                  {orgOptions.map((org) => (
                    <option key={org.id} value={org.id} className="bg-[#0F1123]">{org.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/50 mb-2 block">Email *</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/50 mb-2 block">First Name</label>
                  <input
                    type="text"
                    value={newContactFirstName}
                    onChange={(e) => setNewContactFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-2 block">Last Name</label>
                  <input
                    type="text"
                    value={newContactLastName}
                    onChange={(e) => setNewContactLastName(e.target.value)}
                    placeholder="Smith"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/50 mb-2 block">Title / Role</label>
                <input
                  type="text"
                  value={newContactTitle}
                  onChange={(e) => setNewContactTitle(e.target.value)}
                  placeholder="Owner, Manager, Coach..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* Source Tag Preview */}
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-white/40 mb-1">Source Tag (for campaign tracking)</p>
                <code className="text-sm text-blue-400">
                  manual_{expandedSegment || 'unknown'}_{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toLowerCase().replace(' ', '')}
                </code>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddContactModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createContact}
                disabled={savingContact || !newContactEmail || !newContactOrgId}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingContact ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Create Contact
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
          onClick={() => setToast(null)}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </AdminGate>
  );
}
