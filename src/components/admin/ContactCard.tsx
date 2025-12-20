'use client';

import React from 'react';
import { Card } from './shared/Card';
import { QuickDatePicker } from './shared/QuickDatePicker';
import {
  Users,
  Twitter,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Copy,
  Send,
  Gift,
  Trophy,
  ExternalLink,
  Square,
  CheckSquare,
} from 'lucide-react';

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
  // Inline action callbacks
  onCopyTemplate?: (e: React.MouseEvent) => void;
  onMarkSent?: (e: React.MouseEvent) => void;
  onMarkResponded?: (e: React.MouseEvent) => void;
  onGrantTrial?: (e: React.MouseEvent) => void;
  onMarkWon?: (e: React.MouseEvent) => void;
  onSetFollowUp?: (date: string | null) => void;
  hasTemplate?: boolean;
  // Selection mode
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (e: React.MouseEvent) => void;
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
  profile_url,
  follower_count,
  member_count,
  stage,
  days_since_dm,
  next_follow_up,
  follow_up_overdue,
  template_used,
  priority_score,
  onClick,
  onCopyTemplate,
  onMarkSent,
  onMarkResponded,
  onGrantTrial,
  onMarkWon,
  onSetFollowUp,
  hasTemplate,
  selectionMode,
  isSelected,
  onToggleSelect,
}: ContactCardProps) {
  const badge = stageBadges[stage];

  // Inline action button component
  const ActionButton = ({
    icon: Icon,
    label,
    onClick: handleClick,
    color,
    disabled,
  }: {
    icon: React.ElementType;
    label: string;
    onClick?: (e: React.MouseEvent) => void;
    color: 'cyan' | 'emerald' | 'purple' | 'amber' | 'white';
    disabled?: boolean;
  }) => {
    const colorClasses = {
      cyan: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400',
      purple: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400',
      amber: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400',
      white: 'bg-white/10 hover:bg-white/20 text-white/60',
    };

    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorClasses[color]}`}
        title={label}
      >
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <Card
      variant="default"
      className={`p-3 hover:bg-white/5 transition-all border-l-2 ${stageColors[stage]} ${isSelected ? 'bg-cyan-500/10 border-l-cyan-500' : ''}`}
    >
      {/* Main content row - clickable to open modal */}
      <div
        className="flex items-start justify-between gap-2 cursor-pointer"
        onClick={onClick}
      >
        {/* Left side - Checkbox (if selection mode), Icon and info */}
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {/* Selection checkbox */}
          {selectionMode && (
            <button
              onClick={onToggleSelect}
              className="p-1 shrink-0 -ml-1"
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-cyan-400" />
              ) : (
                <Square className="w-5 h-5 text-white/30 hover:text-white/50" />
              )}
            </button>
          )}
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

      {/* Status info row */}
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

      {/* Inline Action Bar */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
        {/* Stage: not_contacted */}
        {stage === 'not_contacted' && (
          <>
            <ActionButton
              icon={Copy}
              label="Copy DM"
              onClick={onCopyTemplate}
              color="cyan"
              disabled={!hasTemplate}
            />
            <ActionButton
              icon={Send}
              label="Mark Sent"
              onClick={onMarkSent}
              color="cyan"
            />
          </>
        )}

        {/* Stage: dm_sent */}
        {stage === 'dm_sent' && (
          <>
            <ActionButton
              icon={MessageCircle}
              label="Responded"
              onClick={onMarkResponded}
              color="emerald"
            />
            <ActionButton
              icon={Gift}
              label="Grant Trial"
              onClick={onGrantTrial}
              color="purple"
            />
            {onSetFollowUp && (
              <QuickDatePicker
                value={next_follow_up}
                onChange={onSetFollowUp}
              />
            )}
          </>
        )}

        {/* Stage: responded */}
        {stage === 'responded' && (
          <>
            <ActionButton
              icon={Gift}
              label="Grant Trial"
              onClick={onGrantTrial}
              color="purple"
            />
            <ActionButton
              icon={Trophy}
              label="Mark Won"
              onClick={onMarkWon}
              color="amber"
            />
            {onSetFollowUp && (
              <QuickDatePicker
                value={next_follow_up}
                onChange={onSetFollowUp}
              />
            )}
          </>
        )}

        {/* Stage: won - just view profile */}
        {stage === 'won' && (
          <a
            href={profile_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white/60 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">View Profile</span>
          </a>
        )}

        {/* Open profile link for all stages */}
        {stage !== 'won' && (
          <a
            href={profile_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/40 transition-colors ml-auto"
            title="Open profile"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </Card>
  );
}

export default ContactCard;
