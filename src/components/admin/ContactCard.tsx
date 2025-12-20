'use client';

import React from 'react';
import { Card } from './shared/Card';
import { Users, Twitter, Calendar, MessageCircle, CheckCircle, AlertCircle, Clock, Star } from 'lucide-react';

export interface ContactCardProps {
  id: string;
  source: 'facebook' | 'twitter';
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
  template_used: string | null;
  priority_score: number;
  onClick?: () => void;
}

const stageColors = {
  not_contacted: 'border-white/10',
  dm_sent: 'border-cyan-500/30',
  responded: 'border-emerald-500/30',
  won: 'border-amber-500/30',
};

const stageBadges = {
  not_contacted: { bg: 'bg-white/10', text: 'text-white/60', label: 'Not Contacted' },
  dm_sent: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'DM Sent' },
  responded: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Responded' },
  won: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Partner' },
};

export function ContactCard({
  source,
  name,
  handle,
  group_name,
  follower_count,
  member_count,
  stage,
  days_since_dm,
  follow_up_overdue,
  template_used,
  priority_score,
  onClick,
}: ContactCardProps) {
  const badge = stageBadges[stage];

  return (
    <Card
      variant="default"
      className={`p-3 cursor-pointer hover:bg-white/5 transition-all border-l-2 ${stageColors[stage]}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left side - Icon and info */}
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div className={`p-1.5 rounded-lg shrink-0 ${source === 'facebook' ? 'bg-blue-500/20' : 'bg-sky-500/20'}`}>
            {source === 'facebook' ? (
              <Users className="w-4 h-4 text-blue-400" />
            ) : (
              <Twitter className="w-4 h-4 text-sky-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            {handle && (
              <p className="text-xs text-white/40 truncate">@{handle}</p>
            )}
            {group_name && (
              <p className="text-xs text-white/40 truncate">{group_name}</p>
            )}
            {/* Stats row */}
            <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
              {member_count && (
                <span>{member_count.toLocaleString()} members</span>
              )}
              {follower_count && (
                <span>{follower_count.toLocaleString()} followers</span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Stage badge */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
          {/* Priority stars */}
          {priority_score >= 4 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(priority_score, 5) }).map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom info row */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5">
        {days_since_dm !== null && (
          <div className="flex items-center gap-1 text-xs text-white/40">
            <MessageCircle className="w-3 h-3" />
            <span>{days_since_dm}d ago</span>
          </div>
        )}
        {template_used && (
          <div className="flex items-center gap-1 text-xs text-white/40 truncate max-w-[100px]">
            <CheckCircle className="w-3 h-3 text-cyan-400" />
            <span className="truncate">{template_used}</span>
          </div>
        )}
        {follow_up_overdue && (
          <div className="flex items-center gap-1 text-xs text-orange-400">
            <AlertCircle className="w-3 h-3" />
            <span>Follow-up due!</span>
          </div>
        )}
        {!days_since_dm && !follow_up_overdue && stage === 'not_contacted' && (
          <div className="flex items-center gap-1 text-xs text-white/30">
            <Clock className="w-3 h-3" />
            <span>Waiting to contact</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ContactCard;
