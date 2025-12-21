'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './shared/Card';
import { ActivityTimeline, buildTimelineEvents } from './ActivityTimeline';
import { QuickDatePicker } from './shared/QuickDatePicker';
import { TemplatePickerModal } from './TemplatePickerModal';
import {
  X,
  Users,
  Twitter,
  ExternalLink,
  Send,
  MessageCircle,
  Gift,
  CheckCircle,
  Star,
  Mail,
  MapPin,
  Clock,
  Save,
  Edit2,
  ChevronDown,
} from 'lucide-react';
import { UnifiedContact } from '@/app/api/admin/outreach/pipeline/route';

// Response type options for tracking lead interest level
const responseTypes = [
  { value: 'not_contacted', label: 'Not Contacted', color: 'text-white/60' },
  { value: 'dm_sent', label: 'DM Sent', color: 'text-cyan-400' },
  { value: 'interested', label: 'Interested', color: 'text-emerald-400' },
  { value: 'maybe_later', label: 'Maybe Later', color: 'text-yellow-400' },
  { value: 'not_interested', label: 'Not Interested', color: 'text-red-400' },
  { value: 'responded', label: 'Responded', color: 'text-emerald-400' },
  { value: 'trial_requested', label: 'Trial Requested', color: 'text-purple-400' },
];

interface TemplateStats {
  name: string;
  used: number;
  responses: number;
  conversions: number;
  responseRate: number;
  conversionRate: number;
}

interface ContactDetailModalProps {
  contact: UnifiedContact;
  onClose: () => void;
  onUpdate: (id: string, updates: Record<string, unknown>) => Promise<void>;
  templates?: Array<{ id: string; name: string; content: string }>;
  templateStats?: TemplateStats[];
}

const stageBadges = {
  not_contacted: { bg: 'bg-white/10', text: 'text-white/60', label: 'Not Contacted' },
  dm_sent: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'DM Sent' },
  responded: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Responded' },
  won: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Partner' },
};

export function ContactDetailModal({
  contact,
  onClose,
  onUpdate,
  templates = [],
  templateStats = [],
}: ContactDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const badge = stageBadges[contact.stage];

  // Editable fields state
  const [notes, setNotes] = useState(contact.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [email, setEmail] = useState(contact.contact_email || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [responseStatus, setResponseStatus] = useState(contact.response_status || 'not_contacted');
  const [showResponseDropdown, setShowResponseDropdown] = useState(false);
  const [priority, setPriority] = useState(contact.priority_score || 3);
  const [nextFollowUp, setNextFollowUp] = useState(contact.next_follow_up);

  // Sync state when contact changes
  useEffect(() => {
    setNotes(contact.notes || '');
    setEmail(contact.contact_email || '');
    setResponseStatus(contact.response_status || 'not_contacted');
    setPriority(contact.priority_score || 3);
    setNextFollowUp(contact.next_follow_up);
    setIsEditingNotes(false);
    setIsEditingEmail(false);
  }, [contact]);

  const timelineEvents = buildTimelineEvents({
    created_at: contact.created_at,
    dm_sent_at: contact.dm_sent_at,
    template_used: contact.template_used,
    response_status: contact.response_status,
    trial_granted_at: contact.trial_granted_at,
    partner_signed_up: contact.partner_signed_up,
    next_follow_up: contact.next_follow_up,
  });

  const handleAction = async (action: string, data?: Record<string, unknown>) => {
    setIsUpdating(true);
    try {
      switch (action) {
        case 'mark_dm_sent':
          await onUpdate(contact.id, {
            dm_sent_at: new Date().toISOString(),
            response_status: 'dm_sent',
            ...data,
          });
          break;
        case 'mark_responded':
          await onUpdate(contact.id, {
            response_status: 'responded',
          });
          break;
        case 'grant_trial':
          await onUpdate(contact.id, {
            trial_granted_at: new Date().toISOString(),
            response_status: 'trial_requested',
          });
          break;
        case 'mark_partner':
          await onUpdate(contact.id, {
            partner_signed_up: true,
            partner_signed_up_at: new Date().toISOString(),
          });
          break;
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyTemplate = (template: { name: string; content: string }) => {
    // Replace placeholders
    let text = template.content || '';
    const firstName = contact.name ? contact.name.split(' ')[0] : '';
    text = text.replace(/{name}/g, firstName);
    text = text.replace(/{group_name}/g, contact.group_name || '');

    navigator.clipboard.writeText(text);

    // Mark DM as sent with template
    handleAction('mark_dm_sent', { template_used: template.name });
    setShowTemplates(false);
  };

  // Save notes
  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(contact.id, { notes });
      setIsEditingNotes(false);
    } finally {
      setIsUpdating(false);
    }
  };

  // Save email
  const handleSaveEmail = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(contact.id, { contact_email: email });
      setIsEditingEmail(false);
    } finally {
      setIsUpdating(false);
    }
  };

  // Update response status
  const handleResponseStatusChange = async (newStatus: string) => {
    setResponseStatus(newStatus);
    setShowResponseDropdown(false);
    setIsUpdating(true);
    try {
      await onUpdate(contact.id, { response_status: newStatus });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update priority
  const handlePriorityChange = async (newPriority: number) => {
    setPriority(newPriority);
    setIsUpdating(true);
    try {
      await onUpdate(contact.id, { priority_score: newPriority });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update follow-up date
  const handleFollowUpChange = async (date: string | null) => {
    setNextFollowUp(date);
    setIsUpdating(true);
    try {
      await onUpdate(contact.id, { next_follow_up: date });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${contact.source === 'facebook' ? 'bg-blue-500/20' : 'bg-sky-500/20'}`}>
              {contact.source === 'facebook' ? (
                <Users className="w-5 h-5 text-blue-400" />
              ) : (
                <Twitter className="w-5 h-5 text-sky-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
              {contact.handle && (
                <p className="text-sm text-white/40">@{contact.handle}</p>
              )}
              {contact.group_name && (
                <p className="text-sm text-white/40">{contact.group_name}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status and stats row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>

            {/* Clickable Priority Stars */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePriorityChange(i + 1)}
                  disabled={isUpdating}
                  className="p-0.5 hover:scale-110 transition-transform disabled:opacity-50"
                  title={`Set priority to ${i + 1}`}
                >
                  <Star
                    className={`w-4 h-4 ${i < priority ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                  />
                </button>
              ))}
            </div>

            {contact.member_count && (
              <span className="text-sm text-white/40">{contact.member_count.toLocaleString()} members</span>
            )}
            {contact.follower_count && (
              <span className="text-sm text-white/40">{contact.follower_count.toLocaleString()} followers</span>
            )}
          </div>

          {/* Response Status & Follow-up Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Response Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowResponseDropdown(!showResponseDropdown)}
                disabled={isUpdating}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                <span className={responseTypes.find(r => r.value === responseStatus)?.color || 'text-white/60'}>
                  {responseTypes.find(r => r.value === responseStatus)?.label || 'Set Status'}
                </span>
                <ChevronDown className="w-3 h-3 text-white/40" />
              </button>
              {showResponseDropdown && (
                <div className="absolute top-full mt-1 left-0 z-10 bg-[#1B1F39] border border-white/20 rounded-xl shadow-xl p-1 min-w-[160px]">
                  {responseTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleResponseStatusChange(type.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors ${type.color} ${
                        responseStatus === type.value ? 'bg-white/10' : ''
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Follow-up Date Picker */}
            <QuickDatePicker
              value={nextFollowUp}
              onChange={handleFollowUpChange}
              disabled={isUpdating}
            />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {contact.state && (
              <div className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4" />
                <span>{contact.state}</span>
              </div>
            )}
            {contact.days_since_dm !== null && (
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4" />
                <span>DM&apos;d {contact.days_since_dm}d ago</span>
              </div>
            )}
          </div>

          {/* Editable Email */}
          <div className="p-3 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40 uppercase tracking-wider">Contact Email</p>
              {!isEditingEmail ? (
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit email"
                >
                  <Edit2 className="w-3 h-3 text-white/40" />
                </button>
              ) : (
                <button
                  onClick={handleSaveEmail}
                  disabled={isUpdating}
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-xs text-emerald-400 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              )}
            </div>
            {isEditingEmail ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter contact email..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2 text-white/70 min-h-[24px]">
                <Mail className="w-4 h-4 text-white/40" />
                {email ? (
                  <span>{email}</span>
                ) : (
                  <span className="text-white/30 italic">No email. Click edit to add.</span>
                )}
              </div>
            )}
          </div>

          {/* Bio if available */}
          {contact.bio && (
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-sm text-white/60">{contact.bio}</p>
            </div>
          )}

          {/* Editable Notes */}
          <div className="p-3 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40 uppercase tracking-wider">Notes</p>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit notes"
                >
                  <Edit2 className="w-3 h-3 text-white/40" />
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-xs text-emerald-400 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              )}
            </div>
            {isEditingNotes ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this contact..."
                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white/70 placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 resize-none"
                rows={3}
                autoFocus
              />
            ) : (
              <p className="text-sm text-white/70 min-h-[24px]">
                {notes || <span className="text-white/30 italic">No notes yet. Click edit to add.</span>}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={contact.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white/70 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Profile
              </a>

              {contact.stage === 'not_contacted' && (
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl text-sm text-cyan-400 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Send DM
                </button>
              )}

              {contact.stage === 'dm_sent' && (
                <button
                  onClick={() => handleAction('mark_responded')}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl text-sm text-emerald-400 transition-colors disabled:opacity-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  Mark Responded
                </button>
              )}

              {(contact.stage === 'dm_sent' || contact.stage === 'responded') && !contact.trial_granted_at && (
                <button
                  onClick={() => handleAction('grant_trial')}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-sm text-purple-400 transition-colors disabled:opacity-50"
                >
                  <Gift className="w-4 h-4" />
                  Grant Trial
                </button>
              )}

              {contact.stage !== 'won' && (
                <button
                  onClick={() => handleAction('mark_partner')}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-xl text-sm text-amber-400 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Partner
                </button>
              )}
            </div>
          </div>

          {/* Template Picker Modal */}
          {showTemplates && templates.length > 0 && (
            <TemplatePickerModal
              templates={templates}
              templateStats={templateStats}
              contactName={contact.name}
              groupName={contact.group_name}
              onSelect={handleCopyTemplate}
              onClose={() => setShowTemplates(false)}
            />
          )}

          {/* Activity Timeline */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Activity Timeline</p>
            <ActivityTimeline events={timelineEvents} />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ContactDetailModal;
