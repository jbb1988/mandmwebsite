'use client';

import React, { useState } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { Calculator, Info, TrendingUp } from 'lucide-react';

type InputMode = 'teams' | 'users';

export function EnhancedEarningsCalculator() {
  const [inputMode, setInputMode] = useState<InputMode>('teams');
  const [teamCount, setTeamCount] = useState(10);
  const [userCount, setUserCount] = useState(140);

  // Constants
  const RETAIL_PRICE = 79; // 6-month pricing
  const USERS_PER_TEAM = 14; // 12 athletes + 2 coaches

  // Calculate actual user count based on input mode
  const actualUserCount = inputMode === 'teams' ? teamCount * USERS_PER_TEAM : userCount;

  // Calculate earnings with tiered commission
  const calculateEarnings = (count: number) => {
    if (count <= 100) {
      return count * RETAIL_PRICE * 0.10;
    } else {
      return (100 * RETAIL_PRICE * 0.10) + ((count - 100) * RETAIL_PRICE * 0.15);
    }
  };

  const earnings = calculateEarnings(actualUserCount);
  const hasBonus = actualUserCount > 100;

  // Calculate breakdown
  const baseEarnings = hasBonus ? 100 * RETAIL_PRICE * 0.10 : earnings;
  const bonusEarnings = hasBonus ? (actualUserCount - 100) * RETAIL_PRICE * 0.15 : 0;

  return (
    <div className="space-y-6">
      {/* Calculator */}
      <LiquidGlass variant="blue" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-block p-3 rounded-xl bg-neon-cortex-blue/20">
            <Calculator className="w-6 h-6 text-mind-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black">Calculate Your Earnings</h2>
            <p className="text-text-secondary text-sm">See your potential income</p>
          </div>
        </div>

        {/* Input Mode Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setInputMode('users')}
            className={`p-4 rounded-lg border-2 transition-all ${
              inputMode === 'users'
                ? 'border-neon-cortex-blue bg-neon-cortex-blue/20 text-white'
                : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
            }`}
          >
            <div className="font-bold">By Users</div>
            <div className="text-xs opacity-70">Individual signups</div>
          </button>

          <button
            onClick={() => setInputMode('teams')}
            className={`p-4 rounded-lg border-2 transition-all ${
              inputMode === 'teams'
                ? 'border-solar-surge-orange bg-solar-surge-orange/20 text-white'
                : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
            }`}
          >
            <div className="font-bold">By Teams</div>
            <div className="text-xs opacity-70">14 users per team</div>
          </button>
        </div>

        {/* Commission Info */}
        <div className={`p-4 border rounded-lg mb-6 ${
          hasBonus
            ? 'bg-solar-surge-orange/10 border-solar-surge-orange/30'
            : 'bg-neon-cortex-blue/10 border-neon-cortex-blue/30'
        }`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              hasBonus ? 'text-solar-surge-orange' : 'text-neon-cortex-blue'
            }`} />
            <p className="text-sm text-text-secondary">
              {hasBonus ? (
                <>
                  <strong className="text-solar-surge-orange">🔥 15% Commission Activated!</strong> First 100 users: 10% • Users 101+: 15%
                </>
              ) : (
                <>
                  Individual signups at retail $79/user (6 months). First 100 users: 10% • <strong className="text-solar-surge-orange">Users 101+: 15%</strong>
                </>
              )}
            </p>
          </div>
        </div>

        {/* User/Team Input */}
        {inputMode === 'users' && (
          <div className="mb-6">
            <label className="block text-lg font-bold mb-3">
              How many active athletes do you reach each year?
            </label>
            <div className="flex items-center gap-4 mb-2">
              <input
                type="range"
                min="1"
                max="500"
                value={userCount}
                onChange={(e) => setUserCount(parseInt(e.target.value))}
                className="flex-1 h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
              />
              <div className="text-3xl font-black text-neon-cortex-blue min-w-[100px] text-right">
                {userCount}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>1 user</span>
              <span className={userCount > 100 ? 'text-solar-surge-orange font-bold' : ''}>
                {userCount > 100 ? '🔥 ' : ''}101 users (15% bonus)
              </span>
              <span>500 users</span>
            </div>
          </div>
        )}

        {inputMode === 'teams' && (
          <div className="mb-6">
            <label className="block text-lg font-bold mb-3">
              How many teams can you reach?
            </label>
            <div className="flex items-center gap-4 mb-2">
              <input
                type="range"
                min="1"
                max="50"
                value={teamCount}
                onChange={(e) => setTeamCount(parseInt(e.target.value))}
                className="flex-1 h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
              />
              <div className="text-3xl font-black text-solar-surge-orange min-w-[100px] text-right">
                {teamCount}
              </div>
            </div>
            <div className="mt-2 text-center mb-2">
              <span className="text-sm text-text-secondary">
                {teamCount} {teamCount === 1 ? 'team' : 'teams'} × {USERS_PER_TEAM} users = <span className="text-solar-surge-orange font-bold">{actualUserCount} total users</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>1 team</span>
              <span className={actualUserCount > 100 ? 'text-solar-surge-orange font-bold' : ''}>
                {actualUserCount > 100 ? '🔥 ' : ''}8 teams (15% bonus)
              </span>
              <span>50 teams</span>
            </div>
          </div>
        )}

        {/* Earnings Display */}
        <div className="p-6 bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 rounded-xl border-2 border-neon-cortex-blue/40">
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-2">Your Annual Earnings Potential</p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange mb-3">
              ${(earnings * 2).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-text-secondary mb-3">
              (2 payments per year if renewed)
            </p>
            <p className="text-sm text-text-secondary mb-1">
              Per 6-month payment: ${earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>

            {hasBonus && (
              <div className="space-y-2 text-sm border-t border-white/10 pt-3 mt-3">
                <p className="text-xs text-text-secondary mb-2">Per-payment breakdown:</p>
                <div className="flex items-center justify-between text-text-secondary text-xs">
                  <span>First 100 users (10%):</span>
                  <span className="font-bold text-neon-cortex-blue">
                    ${baseEarnings.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-secondary text-xs">
                  <span>{actualUserCount - 100} users at 15%:</span>
                  <span className="font-bold text-solar-surge-orange">
                    +${bonusEarnings.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 p-2 bg-solar-surge-orange/20 rounded text-solar-surge-orange text-center text-xs">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  You're earning 15% on {actualUserCount - 100} bonus users!
                </div>
              </div>
            )}

            {!hasBonus && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-text-secondary">
                  {actualUserCount} users @ $79/user × 10% commission
                </p>
                <p className="text-xs text-text-secondary mt-2">
                  💰 ${(earnings * 2 / actualUserCount).toFixed(2)} per user/year
                </p>
              </div>
            )}
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
}
