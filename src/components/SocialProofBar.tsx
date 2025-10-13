'use client';

import React from 'react';
import { Users, Star, TrendingUp, Trophy } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';

interface SocialProofStat {
  icon: React.ElementType;
  value: string;
  label: string;
  variant: 'orange' | 'blue';
}

interface SocialProofBarProps {
  variant?: 'default' | 'compact';
  stats?: SocialProofStat[];
}

const defaultStats: SocialProofStat[] = [
  {
    icon: Users,
    value: '500+',
    label: 'Teams',
    variant: 'blue',
  },
  {
    icon: Trophy,
    value: '10,000+',
    label: 'Athletes',
    variant: 'orange',
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'Rating',
    variant: 'blue',
  },
  {
    icon: TrendingUp,
    value: '92%',
    label: 'Retention',
    variant: 'orange',
  },
];

export function SocialProofBar({ variant = 'default', stats = defaultStats }: SocialProofBarProps) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2 text-text-secondary"
            >
              <Icon className={`w-5 h-5 ${
                stat.variant === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
              }`} />
              <span className="font-bold text-white">{stat.value}</span>
              <span className="text-sm">{stat.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <LiquidGlass
            key={index}
            variant={stat.variant}
            className="p-6 text-center"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
              stat.variant === 'blue'
                ? 'bg-neon-cortex-blue/20'
                : 'bg-solar-surge-orange/20'
            }`}>
              <Icon className={`w-6 h-6 ${
                stat.variant === 'blue'
                  ? 'text-neon-cortex-blue'
                  : 'text-solar-surge-orange'
              }`} />
            </div>
            <div className={`text-3xl font-black mb-1 ${
              stat.variant === 'blue'
                ? 'text-neon-cortex-blue'
                : 'text-solar-surge-orange'
            }`}>
              {stat.value}
            </div>
            <div className="text-sm text-text-secondary">{stat.label}</div>
          </LiquidGlass>
        );
      })}
    </div>
  );
}
