'use client';

import React, { useState } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { Calculator, Users, Building2, Info, TrendingUp, DollarSign } from 'lucide-react';

type CalculatorMode = 'individual' | 'team';

export function EnhancedEarningsCalculator() {
  const [mode, setMode] = useState<CalculatorMode>('team');
  const [individualCount, setIndividualCount] = useState(15);
  const [teamCount, setTeamCount] = useState(150);
  const [individualInputMode, setIndividualInputMode] = useState<'teams' | 'users'>('teams');
  const [teamInputCount, setTeamInputCount] = useState(10); // Number of teams (default 10)
  const [orgInputMode, setOrgInputMode] = useState<'teams' | 'users'>('teams');
  const [orgTeamCount, setOrgTeamCount] = useState(15); // Number of teams (default 15) - starts above 8 team threshold
  const [isBulkPurchase, setIsBulkPurchase] = useState(true); // Toggle for volume discount

  // Pricing tiers (6-month pricing)
  const RETAIL_PRICE = 79;
  const TIER_12_120 = 71.10; // 10% off
  const TIER_121_199 = 67.15; // 15% off
  const TIER_200_PLUS = 63.20; // 20% off

  // Team composition
  const USERS_PER_TEAM = 14; // 12 athletes + 2 coaches

  // Calculate actual user count for individual mode
  const actualIndividualCount = individualInputMode === 'teams'
    ? teamInputCount * USERS_PER_TEAM
    : individualCount;

  // Calculate actual user count for org mode
  const actualOrgCount = orgInputMode === 'teams'
    ? orgTeamCount * USERS_PER_TEAM
    : teamCount;

  // Calculate individual earnings - NO volume discounts (individual signups at retail)
  const calculateIndividualEarnings = (count: number) => {
    // Individual users always pay retail price ($79) since they're separate purchases
    return count * RETAIL_PRICE * 0.10;
  };

  // Calculate team/organization earnings
  const calculateTeamEarnings = (userCount: number, useBulkPricing: boolean) => {
    let earnings = 0;

    if (!useBulkPricing) {
      // Incremental signups - retail price for all, but 15% commission on users 101+
      if (userCount <= 100) {
        earnings = userCount * RETAIL_PRICE * 0.10;
      } else {
        earnings = (100 * RETAIL_PRICE * 0.10) + ((userCount - 100) * RETAIL_PRICE * 0.15);
      }
    } else {
      // Bulk purchase - volume discount applies to ALL licenses
      let pricePerUser = RETAIL_PRICE;
      let commissionRate = 0.10;
      
      // Determine pricing tier based on total users
      if (userCount >= 200) {
        pricePerUser = TIER_200_PLUS;
      } else if (userCount >= 121) {
        pricePerUser = TIER_121_199;
      } else if (userCount >= 12) {
        pricePerUser = TIER_12_120;
      }
      
      // Apply commission: 10% for first 100, 15% for users 101+
      if (userCount <= 100) {
        earnings = userCount * pricePerUser * commissionRate;
      } else {
        earnings = (100 * pricePerUser * 0.10) + ((userCount - 100) * pricePerUser * 0.15);
      }
    }

    return earnings;
  };

  // Calculate breakdown for team earnings
  const getTeamEarningsBreakdown = (userCount: number, useBulkPricing: boolean) => {
    const total = calculateTeamEarnings(userCount, useBulkPricing);
    
    if (userCount <= 100) {
      return {
        base: total,
        bonus: 0,
        hasBonus: false
      };
    } else {
      // Calculate base (first 100 users at 10%)
      const base = calculateTeamEarnings(100, useBulkPricing);
      const bonus = total - base;
      return {
        base,
        bonus,
        hasBonus: true
      };
    }
  };

  // Get current pricing tier message (6-month pricing)
  const getPricingTierMessage = (userCount: number) => {
    if (userCount < 12) return 'Full price: $79/user (6 months)';
    if (userCount <= 120) return '10% volume discount: $71.10/user (6 months)';
    if (userCount <= 199) return '15% volume discount: $67.15/user (6 months)';
    return '20% volume discount: $63.20/user (6 months)';
  };

  const individualEarnings = calculateIndividualEarnings(actualIndividualCount);
  const teamEarnings = calculateTeamEarnings(actualOrgCount, isBulkPurchase);
  const teamBreakdown = getTeamEarningsBreakdown(actualOrgCount, isBulkPurchase);

  return (
    <div className="space-y-6">
      {/* Volume Pricing Info Card */}
      <LiquidGlass variant="orange" className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="inline-block p-2 rounded-lg bg-solar-surge-orange/20">
            <DollarSign className="w-5 h-5 text-solar-surge-orange" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Volume Discounts for Organizations (6-month pricing)</h3>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-solar-surge-orange font-bold mb-1">12-120 users</div>
                <div className="text-text-secondary">$71.10/seat (10% off)</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-solar-surge-orange font-bold mb-1">121-199 users</div>
                <div className="text-text-secondary">$67.15/seat (15% off)</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-solar-surge-orange font-bold mb-1">200+ users</div>
                <div className="text-text-secondary">$63.20/seat (20% off)</div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-text-secondary bg-neon-cortex-green/10 border border-neon-cortex-green/30 rounded-lg p-3">
          <Info className="w-4 h-4 text-neon-cortex-green inline mr-2" />
          Your commission is calculated on the discounted price shown above
        </div>
      </LiquidGlass>

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

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => setMode('individual')}
            className={`p-4 rounded-lg border-2 transition-all ${
              mode === 'individual'
                ? 'border-neon-cortex-blue bg-neon-cortex-blue/20 text-white'
                : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5" />
              <span className="font-bold">Individual Users</span>
            </div>
            <div className="text-xs opacity-70">Coaches, players, parents</div>
          </button>

          <button
            onClick={() => setMode('team')}
            className={`p-4 rounded-lg border-2 transition-all ${
              mode === 'team'
                ? 'border-solar-surge-orange bg-solar-surge-orange/20 text-white'
                : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 className="w-5 h-5" />
              <span className="font-bold">Teams & Organizations</span>
            </div>
            <div className="text-xs opacity-70">Facilities, leagues, clubs</div>
          </button>
        </div>

        {/* Individual Mode */}
        {mode === 'individual' && (
          <div className="space-y-6">
            {/* Input Mode Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIndividualInputMode('teams')}
                className={`p-3 rounded-lg border transition-all ${
                  individualInputMode === 'teams'
                    ? 'border-neon-cortex-blue bg-neon-cortex-blue/20 text-white'
                    : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
                }`}
              >
                <div className="font-bold text-sm">By Teams</div>
                <div className="text-xs opacity-70">Avg {USERS_PER_TEAM} users per team</div>
              </button>

              <button
                onClick={() => setIndividualInputMode('users')}
                className={`p-3 rounded-lg border transition-all ${
                  individualInputMode === 'users'
                    ? 'border-neon-cortex-blue bg-neon-cortex-blue/20 text-white'
                    : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
                }`}
              >
                <div className="font-bold text-sm">By Users</div>
                <div className="text-xs opacity-70">Individual signups</div>
              </button>
            </div>

              <div className="p-4 bg-neon-cortex-blue/10 border border-neon-cortex-blue/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  {individualInputMode === 'teams' ? (
                    <>
                      <strong>Individual signups = retail price!</strong> Average team: 12 athletes + 2 coaches = {USERS_PER_TEAM} users at $79/user (6mo).
                      Earn 10% commission ($7.90 per user per payment).
                    </>
                  ) : (
                    <>
                      <strong>Individual signups = retail price!</strong> Each user pays $79 for 6 months. You earn 10% commission ($7.90 per user per payment).
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Team Input Mode */}
            {individualInputMode === 'teams' && (
              <div>
                <label className="block text-lg font-bold mb-3">
                  How many teams can you reach?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={teamInputCount}
                    onChange={(e) => setTeamInputCount(parseInt(e.target.value))}
                    className="flex-1 h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                  />
                  <div className="text-3xl font-black text-neon-cortex-blue min-w-[80px] text-right">
                    {teamInputCount}
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-sm text-text-secondary">
                    {teamInputCount} {teamInputCount === 1 ? 'team' : 'teams'} × {USERS_PER_TEAM} users = <span className="text-neon-cortex-blue font-bold">{actualIndividualCount} total users</span>
                  </span>
                </div>
              </div>
            )}

            {/* User Input Mode */}
            {individualInputMode === 'users' && (
              <div>
                <label className="block text-lg font-bold mb-3">
                  How many individual users will you refer?
                </label>
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={individualCount}
                    onChange={(e) => setIndividualCount(parseInt(e.target.value))}
                    className="flex-1 h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                  />
                  <div className="text-3xl font-black text-neon-cortex-blue min-w-[80px] text-right">
                    {individualCount}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>1 user</span>
                  <span>200 users</span>
                </div>
              </div>
            )}

            <div className="p-6 bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 rounded-xl border-2 border-neon-cortex-blue/40">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-2">Your Annual Earnings Potential</p>
                <p className="text-5xl font-black text-neon-cortex-blue mb-3">
                  ${(individualEarnings * 2).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-text-secondary mb-3">
                  (2 payments per year if renewed)
                </p>
                <p className="text-sm text-text-secondary mb-1">
                  Per 6-month payment: ${individualEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {actualIndividualCount} users @ $79/user (retail) × 10% commission
                </p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-text-secondary">
                    💰 ${(individualEarnings * 2 / actualIndividualCount).toFixed(2)} per user/year (if renewed)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team/Organization Mode */}
        {mode === 'team' && (
          <div className="space-y-6">
            {/* Input Mode Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrgInputMode('teams')}
                className={`p-3 rounded-lg border transition-all ${
                  orgInputMode === 'teams'
                    ? 'border-solar-surge-orange bg-solar-surge-orange/20 text-white'
                    : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
                }`}
              >
                <div className="font-bold text-sm">By Teams</div>
                <div className="text-xs opacity-70">Avg {USERS_PER_TEAM} users per team</div>
              </button>

              <button
                onClick={() => setOrgInputMode('users')}
                className={`p-3 rounded-lg border transition-all ${
                  orgInputMode === 'users'
                    ? 'border-solar-surge-orange bg-solar-surge-orange/20 text-white'
                    : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
                }`}
              >
                <div className="font-bold text-sm">By Users</div>
                <div className="text-xs opacity-70">Total user count</div>
              </button>
            </div>

            {/* Bulk Purchase Toggle */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBulkPurchase}
                  onChange={(e) => setIsBulkPurchase(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 text-solar-surge-orange focus:ring-solar-surge-orange focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-bold text-sm">Organization buying all licenses at once</div>
                  <div className="text-xs text-text-secondary">
                    {isBulkPurchase 
                      ? 'Volume discount applies to ALL licenses' 
                      : 'Retail price for incremental team signups'}
                  </div>
                </div>
              </label>
            </div>

            <div className={`p-4 border rounded-lg ${
              teamBreakdown.hasBonus
                ? 'bg-solar-surge-orange/10 border-solar-surge-orange/30'
                : 'bg-neon-cortex-blue/10 border-neon-cortex-blue/30'
            }`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  teamBreakdown.hasBonus ? 'text-solar-surge-orange' : 'text-neon-cortex-blue'
                }`} />
                <div className="text-sm text-text-secondary">
                  {orgInputMode === 'teams' ? (
                    <>
                      {teamBreakdown.hasBonus ? (
                        <>
                          <strong className="text-solar-surge-orange">🔥 15% Commission Activated!</strong> First 100 users: 10% • Users 101+: 15% • {orgTeamCount} teams = {actualOrgCount} users total
                        </>
                      ) : (
                        <>
                          <strong>Think in teams!</strong> Each team: 12 athletes + 2 coaches = {USERS_PER_TEAM} users. <strong className="text-solar-surge-orange">Just 8 teams (112 users) unlocks 15% commission</strong> on users above 100.
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {teamBreakdown.hasBonus ? (
                        <>
                          <strong className="text-solar-surge-orange">🔥 15% Commission Activated!</strong> First 100 users: 10% commission • Users 101+: 15% commission
                        </>
                      ) : (
                        <>
                          First 100 users: 10% commission • <strong className="text-solar-surge-orange">Users 101+: 15% commission</strong> (just {101 - actualOrgCount} more users to unlock!)
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Team Input Mode */}
            {orgInputMode === 'teams' && (
              <div>
                <label className="block text-lg font-bold mb-3">
                  How many teams can you reach?
                </label>
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={orgTeamCount}
                    onChange={(e) => setOrgTeamCount(parseInt(e.target.value))}
                    className="flex-1 h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                  />
                  <div className="text-3xl font-black text-solar-surge-orange min-w-[100px] text-right">
                    {orgTeamCount}
                  </div>
                </div>
                <div className="mt-2 text-center mb-2">
                  <span className="text-sm text-text-secondary">
                    {orgTeamCount} {orgTeamCount === 1 ? 'team' : 'teams'} × {USERS_PER_TEAM} users = <span className="text-solar-surge-orange font-bold">{actualOrgCount} total users</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>1 team</span>
                  <span className={actualOrgCount >= 100 ? 'text-solar-surge-orange font-bold' : ''}>
                    {actualOrgCount >= 100 ? '🔥 ' : ''}8 teams (bonus threshold)
                  </span>
                  <span>100 teams</span>
                </div>
              </div>
            )}

            {/* User Input Mode */}
            {orgInputMode === 'users' && (
              <div>
                <label className="block text-lg font-bold mb-3">
                  How many total users in your teams?
                </label>
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="range"
                    min="12"
                    max="500"
                    step="5"
                    value={teamCount}
                    onChange={(e) => setTeamCount(parseInt(e.target.value))}
                    className="flex-1 h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                  />
                  <div className="text-3xl font-black text-solar-surge-orange min-w-[100px] text-right">
                    {teamCount}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>12 users</span>
                  <span className={actualOrgCount > 100 ? 'text-solar-surge-orange font-bold' : ''}>
                    {actualOrgCount > 100 ? '🔥 ' : ''}101 users (15% bonus starts)
                  </span>
                  <span>500 users</span>
                </div>
              </div>
            )}

            {isBulkPurchase && (
              <div className="mt-3 text-sm text-center">
                <span className="text-text-secondary">{getPricingTierMessage(actualOrgCount)}</span>
              </div>
            )}
            {!isBulkPurchase && (
              <div className="mt-3 text-sm text-center">
                <span className="text-text-secondary">Retail price: $79/user (6 months) - incremental team signups</span>
              </div>
            )}

            <div className="p-6 bg-gradient-to-br from-solar-surge-orange/20 to-neon-cortex-blue/20 rounded-xl border-2 border-solar-surge-orange/40">
              <div className="text-center mb-4">
                <p className="text-sm text-text-secondary mb-2">Your Annual Earnings Potential</p>
                <p className="text-5xl font-black text-solar-surge-orange mb-3">
                  ${(teamEarnings * 2).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-text-secondary mb-3">
                  (2 payments per year if renewed)
                </p>

                {orgInputMode === 'teams' && (
                  <p className="text-sm text-text-secondary mb-2">
                    {orgTeamCount} {orgTeamCount === 1 ? 'team' : 'teams'} ({actualOrgCount} users)
                  </p>
                )}

                <p className="text-sm text-text-secondary mb-3">
                  Per 6-month payment: ${teamEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>

                {teamBreakdown.hasBonus && (
                  <div className="space-y-2 text-sm border-t border-white/10 pt-3">
                    <p className="text-xs text-text-secondary mb-2">Per-payment breakdown:</p>
                    <div className="flex items-center justify-between text-text-secondary text-xs">
                      <span>First 100 users (10%):</span>
                      <span className="font-bold text-neon-cortex-blue">
                        ${teamBreakdown.base.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-text-secondary text-xs">
                      <span>{actualOrgCount - 100} users at 15%:</span>
                      <span className="font-bold text-solar-surge-orange">
                        +${teamBreakdown.bonus.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span>Commission rate:</span>
                  <span className="font-bold">
                    {teamBreakdown.hasBonus ? '10% + 15% bonus' : '10%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Per user (annual):</span>
                  <span className="font-bold text-white">
                    ${((teamEarnings * 2) / actualOrgCount).toFixed(2)}/year
                  </span>
                </div>
                {teamBreakdown.hasBonus && (
                  <div className="mt-3 p-2 bg-solar-surge-orange/20 rounded text-solar-surge-orange text-center">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    You're earning 15% on {actualOrgCount - 100} bonus users!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </LiquidGlass>
    </div>
  );
}
