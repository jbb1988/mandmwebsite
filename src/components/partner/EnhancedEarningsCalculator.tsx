'use client';

import React, { useState } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { Calculator, Users, Building2, Info, TrendingUp, DollarSign } from 'lucide-react';

type CalculatorMode = 'individual' | 'team';

export function EnhancedEarningsCalculator() {
  const [mode, setMode] = useState<CalculatorMode>('team');
  const [individualCount, setIndividualCount] = useState(15);
  const [teamCount, setTeamCount] = useState(150);

  // Pricing tiers
  const RETAIL_PRICE = 119;
  const TIER_12_120 = 107.10; // 10% off
  const TIER_121_199 = 101.15; // 15% off
  const TIER_200_PLUS = 95.20; // 20% off

  // Calculate individual earnings with volume discounts
  const calculateIndividualEarnings = (count: number) => {
    let earnings = 0;

    // Users 1-11 at $119
    if (count <= 11) {
      earnings = count * RETAIL_PRICE * 0.10;
    }
    // Users 12-120 at $107.10 (10% off)
    else if (count <= 120) {
      const tier1 = Math.min(11, count);
      const tier2 = count - tier1;
      earnings = (tier1 * RETAIL_PRICE * 0.10) + (tier2 * TIER_12_120 * 0.10);
    }
    // Users 121-199 at $101.15 (15% off)
    else if (count <= 199) {
      const tier1 = 11 * RETAIL_PRICE * 0.10;
      const tier2 = 109 * TIER_12_120 * 0.10;
      const tier3 = (count - 120) * TIER_121_199 * 0.10;
      earnings = tier1 + tier2 + tier3;
    }
    // Users 200+ at $95.20 (20% off)
    else {
      const tier1 = 11 * RETAIL_PRICE * 0.10;
      const tier2 = 109 * TIER_12_120 * 0.10;
      const tier3 = 79 * TIER_121_199 * 0.10;
      const tier4 = (count - 199) * TIER_200_PLUS * 0.10;
      earnings = tier1 + tier2 + tier3 + tier4;
    }

    return earnings;
  };

  // Calculate team/organization earnings with volume discounts and tiered commission
  const calculateTeamEarnings = (userCount: number) => {
    let earnings = 0;

    // Users 1-11 at $119
    if (userCount <= 11) {
      earnings = userCount * RETAIL_PRICE * 0.10;
    }
    // Users 12-100 at $107.10 (10% off)
    else if (userCount <= 100) {
      const tier1 = Math.min(11, userCount);
      const tier2 = userCount - tier1;
      earnings = (tier1 * RETAIL_PRICE * 0.10) + (tier2 * TIER_12_120 * 0.10);
    }
    // Users 101-120 at $107.10 (but now 15% commission)
    else if (userCount <= 120) {
      const tier1 = 11 * RETAIL_PRICE * 0.10;
      const tier2 = 89 * TIER_12_120 * 0.10; // users 12-100 at 10%
      const tier3 = (userCount - 100) * TIER_12_120 * 0.15; // users 101+ at 15%
      earnings = tier1 + tier2 + tier3;
    }
    // Users 121-199 at $101.15 (15% off, 15% commission)
    else if (userCount <= 199) {
      const tier1 = 11 * RETAIL_PRICE * 0.10;
      const tier2 = 89 * TIER_12_120 * 0.10;
      const tier3 = 20 * TIER_12_120 * 0.15; // users 101-120
      const tier4 = (userCount - 120) * TIER_121_199 * 0.15; // users 121+
      earnings = tier1 + tier2 + tier3 + tier4;
    }
    // Users 200+ at $95.20 (20% off, 15% commission)
    else {
      const tier1 = 11 * RETAIL_PRICE * 0.10;
      const tier2 = 89 * TIER_12_120 * 0.10;
      const tier3 = 20 * TIER_12_120 * 0.15;
      const tier4 = 79 * TIER_121_199 * 0.15;
      const tier5 = (userCount - 199) * TIER_200_PLUS * 0.15;
      earnings = tier1 + tier2 + tier3 + tier4 + tier5;
    }

    return earnings;
  };

  // Calculate breakdown for team earnings
  const getTeamEarningsBreakdown = (userCount: number) => {
    if (userCount <= 100) {
      return {
        base: calculateTeamEarnings(userCount),
        bonus: 0,
        hasBonus: false
      };
    } else {
      // Calculate base (first 100 users at 10%)
      const base = (11 * RETAIL_PRICE * 0.10) + (89 * TIER_12_120 * 0.10);
      const total = calculateTeamEarnings(userCount);
      const bonus = total - base;
      return {
        base,
        bonus,
        hasBonus: true
      };
    }
  };

  // Get current pricing tier message
  const getPricingTierMessage = (userCount: number) => {
    if (userCount < 12) return 'Full price: $119/user';
    if (userCount <= 120) return '10% volume discount: $107.10/user';
    if (userCount <= 199) return '15% volume discount: $101.15/user';
    return '20% volume discount: $95.20/user';
  };

  const individualEarnings = calculateIndividualEarnings(individualCount);
  const teamEarnings = calculateTeamEarnings(teamCount);
  const teamBreakdown = getTeamEarningsBreakdown(teamCount);

  return (
    <div className="space-y-6">
      {/* Volume Pricing Info Card */}
      <LiquidGlass variant="orange" className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="inline-block p-2 rounded-lg bg-solar-surge-orange/20">
            <DollarSign className="w-5 h-5 text-solar-surge-orange" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Volume Discounts for Organizations</h3>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-solar-surge-orange font-bold mb-1">12-120 users</div>
                <div className="text-text-secondary">$107.10/seat (10% off)</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-solar-surge-orange font-bold mb-1">121-199 users</div>
                <div className="text-text-secondary">$101.15/seat (15% off)</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-solar-surge-orange font-bold mb-1">200+ users</div>
                <div className="text-text-secondary">$95.20/seat (20% off)</div>
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
            <p className="text-text-secondary text-sm">See your potential annual income</p>
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
            <div className="p-4 bg-neon-cortex-blue/10 border border-neon-cortex-blue/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  Earn 10% commission on every individual user. Volume discounts apply: $119 (1-11 users), $107.10 (12-120 users), $101.15 (121-199 users), $95.20 (200+ users).
                </p>
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold mb-3">
                How many individual users will you refer?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={individualCount}
                  onChange={(e) => setIndividualCount(parseInt(e.target.value))}
                  className="flex-1 h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
                <div className="text-3xl font-black text-neon-cortex-blue min-w-[80px] text-right">
                  {individualCount}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 rounded-xl border-2 border-neon-cortex-blue/40">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-2">Your Annual Earnings</p>
                <p className="text-5xl font-black text-neon-cortex-blue mb-3">
                  ${individualEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-text-secondary">
                  {individualCount} users × 10% commission
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {individualCount <= 11
                    ? `${individualCount} @ $119/user`
                    : individualCount <= 120
                      ? `11 @ $119 + ${individualCount - 11} @ $107.10`
                      : individualCount <= 199
                        ? `11 @ $119 + 109 @ $107.10 + ${individualCount - 120} @ $101.15`
                        : `11 @ $119 + 109 @ $107.10 + 79 @ $101.15 + ${individualCount - 199} @ $95.20`
                  }
                </p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-text-secondary">
                    💰 Per user average: ${(individualEarnings / individualCount).toFixed(2)}/year
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team/Organization Mode */}
        {mode === 'team' && (
          <div className="space-y-6">
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
                  {teamBreakdown.hasBonus ? (
                    <>
                      <strong className="text-solar-surge-orange">🔥 Bonus Unlocked!</strong> You earn 10% on the first 100 users + 15% on users 101+. Volume discounts increase as the team grows.
                    </>
                  ) : (
                    <>
                      You earn 10% commission on team/organization users. <strong className="text-neon-cortex-blue">Reach 101+ users to unlock 15% commission</strong> on users above 100.
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold mb-3">
                How many team/organization users?
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
                <span className={teamCount >= 100 ? 'text-solar-surge-orange font-bold' : ''}>
                  {teamCount >= 100 ? '🔥 ' : ''}100 users (bonus threshold)
                </span>
                <span>500 users</span>
              </div>
              <div className="mt-3 text-sm text-center">
                <span className="text-text-secondary">{getPricingTierMessage(teamCount)}</span>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-solar-surge-orange/20 to-neon-cortex-blue/20 rounded-xl border-2 border-solar-surge-orange/40">
              <div className="text-center mb-4">
                <p className="text-sm text-text-secondary mb-2">Your Annual Earnings</p>
                <p className="text-5xl font-black text-solar-surge-orange mb-3">
                  ${teamEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>

                {teamBreakdown.hasBonus && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-text-secondary">
                      <span>Base (first 100 users at 10%):</span>
                      <span className="font-bold text-neon-cortex-blue">
                        ${teamBreakdown.base.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-text-secondary">
                      <span>Bonus ({teamCount - 100} users at 15%):</span>
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
                  <span>Per user earnings:</span>
                  <span className="font-bold text-white">
                    ${(teamEarnings / teamCount).toFixed(2)}/year
                  </span>
                </div>
                {teamBreakdown.hasBonus && (
                  <div className="mt-3 p-2 bg-solar-surge-orange/20 rounded text-solar-surge-orange text-center">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    You're earning 15% on {teamCount - 100} bonus users!
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
