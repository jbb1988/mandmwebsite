'use client';

import React, { useState } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { Calculator, TrendingUp } from 'lucide-react';

export function EarningsCalculator() {
  const [teamCount, setTeamCount] = useState(5);
  const [conversionRate, setConversionRate] = useState<'conservative' | 'realistic' | 'optimistic'>('realistic');

  // Commission = (Price per seat × 12 users) × 10% ANNUALLY
  const PRICE_PER_SEAT = 107.10; // 10% off base price of $119
  const USERS_PER_TEAM = 12;
  const ANNUAL_REVENUE_PER_TEAM = PRICE_PER_SEAT * USERS_PER_TEAM; // $1,285.20
  const COMMISSION_PER_TEAM_ANNUAL = ANNUAL_REVENUE_PER_TEAM * 0.10; // $128.52 per year

  const conversionDefaults = {
    conservative: 3,
    realistic: 5,
    optimistic: 10,
  };

  const conversionLabels = {
    conservative: 'Conservative (3 teams)',
    realistic: 'Realistic (5 teams)',
    optimistic: 'Optimistic (10 teams)',
  };

  const year1Earnings = teamCount * COMMISSION_PER_TEAM_ANNUAL;
  const year2Earnings = year1Earnings * 2; // Original teams renew + same number of new teams
  const year3Earnings = year1Earnings * 3; // Year 1 + Year 2 + new teams

  return (
    <LiquidGlass variant="blue" className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-block p-3 rounded-xl bg-neon-cortex-blue/20">
          <Calculator className="w-6 h-6 text-mind-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black">Calculate Your Potential</h2>
          <p className="text-text-secondary text-sm">See what you could earn as a partner</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Team Count Slider */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            How many coaches/teams are in your network?
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="50"
              value={teamCount}
              onChange={(e) => setTeamCount(parseInt(e.target.value))}
              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
            />
            <div className="text-2xl font-black text-neon-cortex-blue min-w-[60px] text-right">
              {teamCount}
            </div>
          </div>
        </div>

        {/* Conversion Rate Selector */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Your conversion scenario
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['conservative', 'realistic', 'optimistic'] as const).map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  setConversionRate(rate);
                  setTeamCount(conversionDefaults[rate]);
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  conversionRate === rate
                    ? 'border-neon-cortex-blue bg-neon-cortex-blue/20 text-white'
                    : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
                }`}
              >
                <div className="font-semibold text-sm capitalize">{rate}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-2">
            {conversionLabels[conversionRate]}
          </p>
        </div>

        {/* Results */}
        <div className="mt-8 p-6 bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 rounded-xl border-2 border-neon-cortex-blue/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-text-secondary mb-1">Expected Teams</p>
              <p className="text-3xl font-black text-neon-cortex-blue">{teamCount}</p>
              <p className="text-xs text-text-secondary mt-1">12 users minimum per team</p>
            </div>
            <TrendingUp className="w-8 h-8 text-neon-cortex-green" />
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-text-secondary text-sm">Year 1 ({teamCount} teams)</span>
              <span className="text-2xl font-black text-neon-cortex-blue">
                ${year1Earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-text-secondary text-sm">Year 2 ({teamCount * 2} teams total)</span>
              <span className="text-2xl font-black text-solar-surge-orange">
                ${year2Earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year
              </span>
            </div>
            <div className="flex justify-between items-baseline border-t border-white/10 pt-3">
              <span className="text-text-secondary text-sm">Year 3 ({teamCount * 3} teams total)</span>
              <span className="text-3xl font-black text-neon-cortex-green">
                ${year3Earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-neon-cortex-green/10 border border-neon-cortex-green/30 rounded-lg">
            <p className="text-xs text-text-secondary">
              <span className="font-semibold text-neon-cortex-green">Compounding Growth:</span> This assumes you sign up {teamCount} {teamCount === 1 ? 'team' : 'new teams'} each year while previous years' teams keep renewing. Year 3 = {teamCount} (Y1) + {teamCount} (Y2) + {teamCount} (Y3 new) = {teamCount * 3} teams paying you ${year3Earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} annually.
            </p>
          </div>
        </div>
      </div>
    </LiquidGlass>
  );
}
