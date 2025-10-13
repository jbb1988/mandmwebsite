'use client';

import React from 'react';
import { Shield, Lock, RefreshCw, CheckCircle2, Award, Star } from 'lucide-react';

interface Badge {
  icon: React.ElementType;
  label: string;
  description?: string;
}

interface TrustBadgesProps {
  variant?: 'default' | 'compact' | 'inline';
  showDescription?: boolean;
}

const badges: Badge[] = [
  {
    icon: Shield,
    label: 'Secure Payments',
    description: 'Powered by Stripe',
  },
  {
    icon: Lock,
    label: 'SSL Encrypted',
    description: '256-bit encryption',
  },
  {
    icon: CheckCircle2,
    label: 'COPPA Compliant',
    description: 'Privacy certified',
  },
];

export function TrustBadges({ variant = 'default', showDescription = true }: TrustBadgesProps) {
  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 text-text-secondary">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Icon className="w-4 h-4 text-neon-cortex-green" />
              <span>{badge.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:border-neon-cortex-green/30 transition-colors"
            >
              <div className="p-2 bg-neon-cortex-green/10 rounded-full mb-2">
                <Icon className="w-5 h-5 text-neon-cortex-green" />
              </div>
              <span className="text-xs font-semibold text-center">{badge.label}</span>
              {showDescription && badge.description && (
                <span className="text-xs text-text-secondary mt-1 text-center">
                  {badge.description}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Default variant - larger cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 rounded-xl hover:border-neon-cortex-green/40 transition-all hover:shadow-lg"
          >
            <div className="p-3 bg-neon-cortex-green/10 rounded-full mb-4">
              <Icon className="w-8 h-8 text-neon-cortex-green" />
            </div>
            <h3 className="text-base font-bold mb-2">{badge.label}</h3>
            {showDescription && badge.description && (
              <p className="text-sm text-text-secondary">{badge.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Separate component for guarantee badge that can be used standalone
export function MoneyBackGuarantee() {
  return (
    <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-neon-cortex-green/20 to-neon-cortex-green/10 border-2 border-neon-cortex-green/40 rounded-xl">
      <div className="p-2 bg-neon-cortex-green/20 rounded-full">
        <RefreshCw className="w-6 h-6 text-neon-cortex-green" />
      </div>
      <div className="text-left">
        <div className="text-lg font-black text-neon-cortex-green">30-Day Money-Back Guarantee</div>
        <div className="text-sm text-text-secondary">No questions asked. Full refund if not satisfied.</div>
      </div>
    </div>
  );
}
