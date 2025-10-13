'use client';

import React from 'react';
import { Zap, TrendingUp, Target, Award } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';

interface SocialProofBarProps {
  variant?: 'hero' | 'compact' | 'callout';
}

export function SocialProofBar({ variant = 'hero' }: SocialProofBarProps) {
  // Hero variant - Bold FOMO messaging for homepage
  if (variant === 'hero') {
    return (
      <div className="relative">
        <LiquidGlass variant="orange" className="p-8 md:p-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-solar-surge-orange animate-pulse" />
            <h3 className="text-2xl md:text-3xl font-black text-white">
              Don't Get Left Behind
            </h3>
            <Zap className="w-8 h-8 text-solar-surge-orange animate-pulse" />
          </div>
          <p className="text-lg md:text-xl text-text-secondary mb-2">
            Join the Teams Powering Up with Mind & Muscle
          </p>
          <p className="text-base md:text-lg text-solar-surge-orange font-bold">
            Your Competition's Already Using Mind & Muscle. Are You?
          </p>
        </LiquidGlass>
      </div>
    );
  }

  // Compact variant - Subtle competitive edge messaging
  if (variant === 'compact') {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-6 px-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-neon-cortex-blue" />
          <span className="text-sm md:text-base font-semibold text-white">
            Every Edge Counts
          </span>
        </div>
        <span className="hidden md:block text-text-secondary/30">•</span>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-solar-surge-orange" />
          <span className="text-sm md:text-base text-text-secondary">
            Join Teams Using Mind & Muscle
          </span>
        </div>
      </div>
    );
  }

  // Callout variant - Strong competitive messaging
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <LiquidGlass variant="blue" className="p-6 text-center">
        <Award className="w-8 h-8 text-neon-cortex-blue mx-auto mb-3" />
        <p className="text-lg font-black text-white mb-2">
          Winning Teams Don't Wing It
        </p>
        <p className="text-sm text-text-secondary">
          They Use Mind & Muscle
        </p>
      </LiquidGlass>
      <LiquidGlass variant="orange" className="p-6 text-center">
        <Zap className="w-8 h-8 text-solar-surge-orange mx-auto mb-3" />
        <p className="text-lg font-black text-white mb-2">
          Every Edge Counts
        </p>
        <p className="text-sm text-text-secondary">
          Don't Let Your Competition Get Ahead
        </p>
      </LiquidGlass>
    </div>
  );
}
