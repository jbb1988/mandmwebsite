'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export type TabColor = 'cyan' | 'green' | 'orange' | 'purple' | 'blue' | 'emerald' | 'amber' | 'red';

export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  color?: TabColor;
  badge?: number;
  size?: 'sm' | 'md';
}

const colorMap: Record<TabColor, string> = {
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
  green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  red: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  color = 'cyan',
  badge,
  size = 'md',
}: TabButtonProps) {
  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-xs gap-1.5'
    : 'px-4 py-2 text-sm gap-2';

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <button
      onClick={onClick}
      className={`flex items-center ${sizeClasses} rounded-xl border transition-all font-medium ${
        active
          ? colorMap[color]
          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
      }`}
    >
      <Icon className={iconSize} />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-white/20' : 'bg-white/10'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

export default TabButton;
