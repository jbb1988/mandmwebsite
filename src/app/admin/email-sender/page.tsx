'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminGate from '@/components/AdminGate';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Mail, Send, Users, User, Search, ChevronDown, Check,
  AlertCircle, RefreshCw, X, Eye, FileText, Sparkles,
  Clock, CheckCircle2, Building2, Filter
} from 'lucide-react';
import { EMAIL_ALIASES, type EmailAlias } from '@/config/emailAliases';

// Card component
function Card({ children, className = '', variant = 'default' }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

interface UserResult {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  subscription_status: string | null;
  created_at: string;
}

interface SendResult {
  success: boolean;
  sent: number;
  failed: number;
  errors?: string[];
}

type SendMode = 'individual' | 'bulk';
type UserSegment = 'all' | 'trial' | 'pro' | 'free' | 'inactive' | 'new';

const USER_SEGMENTS: { id: UserSegment; label: string; description: string }[] = [
  { id: 'all', label: 'All Users', description: 'Every registered user' },
  { id: 'trial', label: 'Trial Users', description: 'Users currently in trial period' },
  { id: 'pro', label: 'Pro Subscribers', description: 'Active paying subscribers' },
  { id: 'free', label: 'Free Users', description: 'Users without active subscription' },
  { id: 'inactive', label: 'Inactive (30d)', description: 'No activity in last 30 days' },
  { id: 'new', label: 'New Users (7d)', description: 'Signed up in last 7 days' },
];

export default function EmailSenderPage() {
  const { getPassword } = useAdminAuth();
  // Form state
  const [mode, setMode] = useState<SendMode>('individual');
  const [selectedAlias, setSelectedAlias] = useState<EmailAlias>(EMAIL_ALIASES[0]);
  const [aliasDropdownOpen, setAliasDropdownOpen] = useState(false);

  // Recipients
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<UserSegment>('all');
  const [segmentCount, setSegmentCount] = useState<number | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Email content
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Debounced user search
  useEffect(() => {
    if (mode !== 'individual') return;
    if (userSearch.length < 2) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(userSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch, mode]);

  // Fetch segment count when segment changes
  useEffect(() => {
    if (mode !== 'bulk') return;
    fetchSegmentCount(selectedSegment);
  }, [selectedSegment, mode]);

  async function fetchTemplates() {
    setTemplatesLoading(true);
    try {
      const response = await fetch('/api/admin/email-sender/templates', {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setTemplatesLoading(false);
    }
  }

  async function searchUsers(query: string) {
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/admin/email-sender/search-users?q=${encodeURIComponent(query)}`, {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setUserResults(data.users);
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setSearchLoading(false);
    }
  }

  async function fetchSegmentCount(segment: UserSegment) {
    try {
      const response = await fetch(`/api/admin/email-sender/segment-count?segment=${segment}`, {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setSegmentCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch segment count:', err);
    }
  }

  function selectTemplate(template: EmailTemplate) {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setBody(template.body);
    setTemplateDropdownOpen(false);
  }

  function addUser(user: UserResult) {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserSearch('');
    setUserResults([]);
  }

  function removeUser(userId: string) {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  }

  function clearForm() {
    setSubject('');
    setBody('');
    setSelectedTemplate(null);
    setSelectedUsers([]);
    setUserSearch('');
    setSendResult(null);
    setError(null);
  }

  const canSend = useCallback(() => {
    if (!subject.trim() || !body.trim()) return false;
    if (mode === 'individual' && selectedUsers.length === 0) return false;
    if (mode === 'bulk' && !segmentCount) return false;
    return true;
  }, [subject, body, mode, selectedUsers, segmentCount]);

  async function handleSend() {
    if (!canSend()) return;

    setSending(true);
    setError(null);
    setSendResult(null);

    try {
      const response = await fetch('/api/admin/email-sender/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({
          from: selectedAlias.email,
          fromName: selectedAlias.name,
          mode,
          recipients: mode === 'individual' ? selectedUsers.map(u => u.email) : undefined,
          segment: mode === 'bulk' ? selectedSegment : undefined,
          subject,
          body,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSendResult({
          success: true,
          sent: data.sent,
          failed: data.failed || 0,
          errors: data.errors,
        });
      } else {
        setError(data.error || 'Failed to send emails');
      }
    } catch (err) {
      setError('Network error - please try again');
    } finally {
      setSending(false);
    }
  }

  // Preview HTML with variables replaced
  function getPreviewHtml() {
    let previewBody = body;
    // Replace common variables with sample data
    previewBody = previewBody.replace(/\{\{first_name\}\}/gi, 'John');
    previewBody = previewBody.replace(/\{\{name\}\}/gi, 'John');
    previewBody = previewBody.replace(/\{\{email\}\}/gi, 'john@example.com');
    return previewBody;
  }

  return (
    <AdminGate
      title="Email Sender"
      description="Send emails to users from any alias"
    >
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Email Sender</h1>
              <p className="text-white/50">Send emails to users from any alias</p>
            </div>

            {/* Success Result */}
            {sendResult?.success && (
              <Card variant="bordered" className="p-4 mb-6 border-emerald-500/30 bg-emerald-500/10">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-emerald-400 font-medium">
                      Successfully sent {sendResult.sent} email{sendResult.sent !== 1 ? 's' : ''}
                    </p>
                    {sendResult.failed > 0 && (
                      <p className="text-orange-400 text-sm">
                        {sendResult.failed} failed to send
                      </p>
                    )}
                  </div>
                  <button
                    onClick={clearForm}
                    className="px-3 py-1 text-sm bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400"
                  >
                    Send Another
                  </button>
                </div>
              </Card>
            )}

            {/* Error */}
            {error && (
              <Card variant="bordered" className="p-4 mb-6 border-red-500/30 bg-red-500/10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto p-1 hover:bg-red-500/20 rounded"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </Card>
            )}

            <div className="space-y-6">
              {/* Mode Toggle */}
              <Card variant="elevated" className="p-4">
                <label className="text-sm font-medium text-white/60 mb-3 block">Send Mode</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMode('individual')}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                      mode === 'individual'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Individual</p>
                      <p className="text-xs opacity-70">Search & select users</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setMode('bulk')}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                      mode === 'bulk'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Bulk</p>
                      <p className="text-xs opacity-70">Send to user segments</p>
                    </div>
                  </button>
                </div>
              </Card>

              {/* From Alias Selection */}
              <Card variant="elevated" className="p-4">
                <label className="text-sm font-medium text-white/60 mb-3 block">From Address</label>
                <div className="relative">
                  <button
                    onClick={() => setAliasDropdownOpen(!aliasDropdownOpen)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium">{selectedAlias.name}</p>
                        <p className="text-white/50 text-sm">{selectedAlias.email}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${aliasDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {aliasDropdownOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1B1F39] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                      {EMAIL_ALIASES.map((alias) => (
                        <button
                          key={alias.id}
                          onClick={() => {
                            setSelectedAlias(alias);
                            setAliasDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-4 hover:bg-white/10 transition-colors ${
                            selectedAlias.id === alias.id ? 'bg-blue-500/10' : ''
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white/40" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-white font-medium">{alias.name}</p>
                            <p className="text-white/50 text-sm">{alias.email}</p>
                            <p className="text-white/30 text-xs mt-0.5">{alias.description}</p>
                          </div>
                          {selectedAlias.id === alias.id && (
                            <Check className="w-5 h-5 text-blue-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Recipients - Individual Mode */}
              {mode === 'individual' && (
                <Card variant="elevated" className="p-4">
                  <label className="text-sm font-medium text-white/60 mb-3 block">Recipients</label>

                  {/* Selected Users */}
                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg"
                        >
                          <span className="text-blue-300 text-sm">{user.email}</span>
                          <button
                            onClick={() => removeUser(user.id)}
                            className="p-0.5 hover:bg-blue-500/30 rounded"
                          >
                            <X className="w-3 h-3 text-blue-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by email or name..."
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    />
                    {searchLoading && (
                      <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 animate-spin" />
                    )}
                  </div>

                  {/* Search Results */}
                  {userResults.length > 0 && (
                    <div className="mt-2 bg-[#1B1F39] border border-white/10 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                      {userResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => addUser(user)}
                          disabled={selectedUsers.some(u => u.id === user.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-white/40" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{user.email}</p>
                            {(user.full_name || user.display_name) && (
                              <p className="text-white/40 text-xs truncate">
                                {user.full_name || user.display_name}
                              </p>
                            )}
                          </div>
                          {user.subscription_status && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              user.subscription_status === 'pro' ? 'bg-emerald-500/20 text-emerald-400' :
                              user.subscription_status === 'trial' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-white/10 text-white/50'
                            }`}>
                              {user.subscription_status}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Recipients - Bulk Mode */}
              {mode === 'bulk' && (
                <Card variant="elevated" className="p-4">
                  <label className="text-sm font-medium text-white/60 mb-3 block">User Segment</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {USER_SEGMENTS.map((segment) => (
                      <button
                        key={segment.id}
                        onClick={() => setSelectedSegment(segment.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedSegment === segment.id
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <p className={`font-medium ${selectedSegment === segment.id ? 'text-purple-400' : 'text-white'}`}>
                          {segment.label}
                        </p>
                        <p className="text-white/40 text-xs mt-1">{segment.description}</p>
                      </button>
                    ))}
                  </div>

                  {segmentCount !== null && (
                    <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300">
                        <strong>{segmentCount.toLocaleString()}</strong> users will receive this email
                      </span>
                    </div>
                  )}
                </Card>
              )}

              {/* Template Selection */}
              <Card variant="elevated" className="p-4">
                <label className="text-sm font-medium text-white/60 mb-3 block">
                  Template (Optional)
                </label>
                <div className="relative">
                  <button
                    onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-white/40" />
                      <span className="text-white/70">
                        {selectedTemplate ? selectedTemplate.name : 'Start from scratch or select a template...'}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${templateDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {templateDropdownOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1B1F39] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedTemplate(null);
                          setTemplateDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-4 hover:bg-white/10 transition-colors border-b border-white/5"
                      >
                        <Sparkles className="w-5 h-5 text-white/40" />
                        <span className="text-white/70">Start from scratch</span>
                      </button>
                      {templatesLoading ? (
                        <div className="p-4 text-center">
                          <RefreshCw className="w-5 h-5 text-white/30 animate-spin mx-auto" />
                        </div>
                      ) : templates.length === 0 ? (
                        <div className="p-4 text-center text-white/40 text-sm">
                          No templates available
                        </div>
                      ) : (
                        templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => selectTemplate(template)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-white/10 transition-colors"
                          >
                            <FileText className="w-5 h-5 text-white/40" />
                            <div className="text-left">
                              <p className="text-white">{template.name}</p>
                              <p className="text-white/40 text-xs">{template.category}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Email Content */}
              <Card variant="elevated" className="p-4">
                <div className="space-y-4">
                  {/* Subject */}
                  <div>
                    <label className="text-sm font-medium text-white/60 mb-2 block">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white/60">Body</label>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <span>Variables:</span>
                        <code className="px-1.5 py-0.5 bg-white/10 rounded">{'{{first_name}}'}</code>
                        <code className="px-1.5 py-0.5 bg-white/10 rounded">{'{{email}}'}</code>
                      </div>
                    </div>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Enter email body (supports HTML)..."
                      rows={12}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 font-mono text-sm resize-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!subject || !body}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </button>

                <button
                  onClick={handleSend}
                  disabled={!canSend() || sending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Email{mode === 'individual' && selectedUsers.length > 1 ? 's' : ''}
                      {mode === 'individual' && selectedUsers.length > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                          {selectedUsers.length}
                        </span>
                      )}
                      {mode === 'bulk' && segmentCount !== null && (
                        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                          {segmentCount.toLocaleString()}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F1123] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Email Preview
                </h2>
                <p className="text-white/50 text-sm mt-1">From: {selectedAlias.email}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Subject */}
              <div className="mb-4">
                <label className="text-xs text-white/40 uppercase tracking-wide">Subject</label>
                <p className="text-white text-lg mt-1">{subject || '(No subject)'}</p>
              </div>

              {/* Body Preview */}
              <div className="bg-white rounded-xl p-6 text-gray-800">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              </div>

              {/* Sample Variables */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-400 text-sm">
                  <strong>Note:</strong> Variables like {'{{first_name}}'} will be replaced with actual user data when sent.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminGate>
  );
}
