'use client';

import React from 'react';
import { MessageCircle, UserPlus, Calendar, Gift, CheckCircle, Clock, Send } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'added' | 'dm_sent' | 'responded' | 'follow_up_scheduled' | 'trial_granted' | 'became_partner';
  date: string;
  description: string;
  details?: string;
  isFuture?: boolean;
}

export interface ActivityTimelineProps {
  events: TimelineEvent[];
}

const eventConfig = {
  added: {
    icon: UserPlus,
    color: 'bg-white/10 text-white/60',
    lineColor: 'bg-white/20',
  },
  dm_sent: {
    icon: Send,
    color: 'bg-cyan-500/20 text-cyan-400',
    lineColor: 'bg-cyan-500/30',
  },
  responded: {
    icon: MessageCircle,
    color: 'bg-emerald-500/20 text-emerald-400',
    lineColor: 'bg-emerald-500/30',
  },
  follow_up_scheduled: {
    icon: Calendar,
    color: 'bg-orange-500/20 text-orange-400',
    lineColor: 'bg-orange-500/30',
  },
  trial_granted: {
    icon: Gift,
    color: 'bg-purple-500/20 text-purple-400',
    lineColor: 'bg-purple-500/30',
  },
  became_partner: {
    icon: CheckCircle,
    color: 'bg-amber-500/20 text-amber-400',
    lineColor: 'bg-amber-500/30',
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Future date
    const futureDays = Math.abs(diffDays);
    if (futureDays === 0) return 'Today';
    if (futureDays === 1) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-white/40 text-sm">
        <Clock className="w-5 h-5 mx-auto mb-2 opacity-50" />
        No activity yet
      </div>
    );
  }

  return (
    <div className="relative">
      {events.map((event, index) => {
        const config = eventConfig[event.type];
        const Icon = config.icon;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="flex gap-3 pb-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className={`p-1.5 rounded-full ${config.color} ${event.isFuture ? 'opacity-50 border border-dashed border-white/20' : ''}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 mt-1 ${config.lineColor} ${event.isFuture ? 'opacity-30' : ''}`} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-1 ${event.isFuture ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white font-medium">{event.description}</p>
                <span className="text-xs text-white/40">{formatDate(event.date)}</span>
              </div>
              {event.details && (
                <p className="text-xs text-white/50 mt-0.5">{event.details}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to build timeline events from contact data
export function buildTimelineEvents(contact: {
  created_at?: string;
  dm_sent_at?: string | null;
  template_used?: string | null;
  response_status?: string;
  trial_granted_at?: string | null;
  partner_signed_up?: boolean;
  partner_signed_up_at?: string | null;
  next_follow_up?: string | null;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Added to pipeline
  if (contact.created_at) {
    events.push({
      id: 'added',
      type: 'added',
      date: contact.created_at,
      description: 'Added to pipeline',
    });
  }

  // DM sent
  if (contact.dm_sent_at) {
    events.push({
      id: 'dm_sent',
      type: 'dm_sent',
      date: contact.dm_sent_at,
      description: 'DM Sent',
      details: contact.template_used ? `via "${contact.template_used}" template` : undefined,
    });
  }

  // Response received
  const respondedStatuses = ['interested', 'responded', 'negotiating', 'trial_requested', 'positive', 'maybe'];
  if (contact.response_status && respondedStatuses.includes(contact.response_status.toLowerCase())) {
    events.push({
      id: 'responded',
      type: 'responded',
      date: contact.dm_sent_at || new Date().toISOString(), // Approximate
      description: 'Responded',
      details: contact.response_status,
    });
  }

  // Trial granted
  if (contact.trial_granted_at) {
    events.push({
      id: 'trial_granted',
      type: 'trial_granted',
      date: contact.trial_granted_at,
      description: 'Trial Granted',
    });
  }

  // Became partner
  if (contact.partner_signed_up) {
    events.push({
      id: 'became_partner',
      type: 'became_partner',
      date: contact.partner_signed_up_at || new Date().toISOString(),
      description: 'Became Partner',
    });
  }

  // Scheduled follow-up (future event)
  if (contact.next_follow_up) {
    const followUpDate = new Date(contact.next_follow_up);
    const now = new Date();
    events.push({
      id: 'follow_up',
      type: 'follow_up_scheduled',
      date: contact.next_follow_up,
      description: 'Follow-up scheduled',
      isFuture: followUpDate > now,
    });
  }

  // Sort by date (oldest first)
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return events;
}

export default ActivityTimeline;
