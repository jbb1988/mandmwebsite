'use client';

import React, { useState } from 'react';
import { Card } from './shared/Card';
import { ActivityTimeline, buildTimelineEvents } from './ActivityTimeline';
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
  Calendar,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';
import { UnifiedContact } from '@/app/api/admin/outreach/pipeline/route';

interface ContactDetailModalProps {
  contact: UnifiedContact;
  onClose: () => void;
  onUpdate: (id: string, updates: Record<string, unknown>) => Promise<void>;
  templates?: Array<{ id: string; name: string; content: string }>;
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
}: ContactDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const badge = stageBadges[contact.stage];

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
    let text = template.content;
    text = text.replace(/{name}/g, contact.name.split(' ')[0]);
    text = text.replace(/{group_name}/g, contact.group_name || '');

    navigator.clipboard.writeText(text);

    // Mark DM as sent with template
    handleAction('mark_dm_sent', { template_used: template.name });
    setShowTemplates(false);
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
            {contact.priority_score >= 4 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(contact.priority_score, 5) }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
            )}
            {contact.member_count && (
              <span className="text-sm text-white/40">{contact.member_count.toLocaleString()} members</span>
            )}
            {contact.follower_count && (
              <span className="text-sm text-white/40">{contact.follower_count.toLocaleString()} followers</span>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {contact.state && (
              <div className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4" />
                <span>{contact.state}</span>
              </div>
            )}
            {contact.contact_email && (
              <div className="flex items-center gap-2 text-white/60">
                <Mail className="w-4 h-4" />
                <span className="truncate">{contact.contact_email}</span>
              </div>
            )}
            {contact.next_follow_up && (
              <div className={`flex items-center gap-2 ${contact.follow_up_overdue ? 'text-orange-400' : 'text-white/60'}`}>
                <Calendar className="w-4 h-4" />
                <span>Follow-up: {new Date(contact.next_follow_up).toLocaleDateString()}</span>
              </div>
            )}
            {contact.days_since_dm !== null && (
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4" />
                <span>DM&apos;d {contact.days_since_dm}d ago</span>
              </div>
            )}
          </div>

          {/* Bio if available */}
          {contact.bio && (
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-sm text-white/60">{contact.bio}</p>
            </div>
          )}

          {/* Notes if available */}
          {contact.notes && (
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-white/40 mb-1">Notes</p>
              <p className="text-sm text-white/70">{contact.notes}</p>
            </div>
          )}

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

          {/* Template selection */}
          {showTemplates && templates.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wider">Select Template</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleCopyTemplate(template)}
                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <p className="text-sm font-medium text-white">{template.name}</p>
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{template.content}</p>
                  </button>
                ))}
              </div>
            </div>
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
