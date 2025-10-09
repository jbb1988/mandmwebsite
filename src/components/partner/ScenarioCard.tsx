'use client';

import React from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LucideIcon } from 'lucide-react';

interface ScenarioCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  stats: {
    label: string;
    value: string;
  }[];
  earnings: string;
  variant: 'blue' | 'orange';
}

export function ScenarioCard({ title, subtitle, icon: Icon, stats, earnings, variant }: ScenarioCardProps) {
  return (
    <LiquidGlass variant={variant} className="p-6">
      <div className={`inline-block p-3 rounded-xl mb-4 ${
        variant === 'blue' ? 'bg-neon-cortex-blue/20' : 'bg-solar-surge-orange/20'
      }`}>
        <Icon className={`w-6 h-6 ${
          variant === 'blue' ? 'text-mind-primary' : 'text-muscle-primary'
        }`} />
      </div>

      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-4">{subtitle}</p>

      <div className="space-y-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{stat.label}</span>
            <span className="font-semibold">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-lg border-2 ${
        variant === 'blue'
          ? 'bg-neon-cortex-blue/10 border-neon-cortex-blue/30'
          : 'bg-solar-surge-orange/10 border-solar-surge-orange/30'
      }`}>
        <div className="text-xs text-text-secondary mb-1">Potential Annual Income</div>
        <div className={`text-3xl font-black ${
          variant === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
        }`}>
          {earnings}
        </div>
        <div className="text-xs text-text-secondary mt-1">Recurring yearly</div>
      </div>
    </LiquidGlass>
  );
}
