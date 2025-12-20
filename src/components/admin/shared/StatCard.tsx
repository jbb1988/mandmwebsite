'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

export type StatColor = 'white' | 'cyan' | 'green' | 'emerald' | 'orange' | 'purple' | 'blue' | 'red' | 'amber' | 'gray';

export interface StatCardProps {
  value: number | string;
  label: string;
  icon?: LucideIcon;
  color?: StatColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  highlight?: boolean; // Uses elevated variant when true
}

const colorClasses: Record<StatColor, string> = {
  white: 'text-white',
  cyan: 'text-cyan-400',
  green: 'text-emerald-400',
  emerald: 'text-emerald-400',
  orange: 'text-orange-400',
  purple: 'text-purple-400',
  blue: 'text-blue-400',
  red: 'text-red-400',
  amber: 'text-amber-400',
  gray: 'text-gray-400',
};

const sizeClasses = {
  sm: {
    icon: 'w-4 h-4',
    value: 'text-xl',
    label: 'text-xs',
    padding: 'p-3',
  },
  md: {
    icon: 'w-5 h-5',
    value: 'text-2xl',
    label: 'text-xs',
    padding: 'p-4',
  },
  lg: {
    icon: 'w-6 h-6',
    value: 'text-3xl',
    label: 'text-sm',
    padding: 'p-5',
  },
};

export function StatCard({
  value,
  label,
  icon: Icon,
  color = 'white',
  size = 'md',
  className = '',
  highlight = true, // Default to elevated for backwards compatibility
}: StatCardProps) {
  const sizes = sizeClasses[size];
  const variant = highlight ? 'elevated' : 'default';

  return (
    <Card variant={variant} className={`${sizes.padding} ${className}`}>
      <div className="text-center">
        {Icon && <Icon className={`${sizes.icon} ${colorClasses[color]} mx-auto mb-2`} />}
        <p className={`${sizes.value} font-bold ${colorClasses[color]}`}>{value}</p>
        <p className={`${sizes.label} text-white/50 mt-1`}>{label}</p>
      </div>
    </Card>
  );
}

export default StatCard;
