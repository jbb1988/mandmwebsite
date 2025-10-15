'use client';

import React, { useState } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { Calculator, TrendingUp, Users, Briefcase, Zap, Info } from 'lucide-react';

type StrategyTab = 'individuals' | 'org-referral' | 'org-partnership' | 'combined';

export function EnhancedEarningsCalculator() {
  const [activeTab, setActiveTab] = useState<StrategyTab>('individuals');
  
  // Individual referrals
  const [individualCount, setIndividualCount] = useState(15);
  
  // Organization via referral link
  const [orgReferralCount, setOrgReferralCount] = useState(2);
  const [orgReferralSize, setOrgReferralSize] = useState(150);
  
  // Organization partnerships
  const [orgPartnershipCount, setOrgPartnershipCount] = useState(1);
  const [orgPartnershipSize, setOrgPartnershipSize] = useState(200);
  
  // Combined
  const [combinedIndividuals, setCombinedIndividuals] = useState(10);
  const [combinedOrgReferrals, setCombinedOrgReferrals] = useState(1);
  const [combinedOrgReferralSize, setCombinedOrgReferralSize] = useState(150);
  const [combinedPartnerships, setCombinedPartnerships] = useState(1);
  const [combinedPartnershipSize, setCombinedPartnershipSize] = useState(200);

  const PRICE_PER_SEAT = 119; // Base price

  // Calculate earnings
  const calculateIndividualEarnings = (count: number) => {
    return count * PRICE_PER_SEAT * 0.10;
  };

  const calculateOrgReferralEarnings = (orgCount: number, avgSize: number) => {
    return orgCount * avgSize * PRICE_PER_SEAT * 0.10;
  };

  const calculateOrgPartnershipEarnings = (orgCount: number, avgSize: number) => {
    if (avgSize <= 100) return 0;
    const bonusUsers = avgSize - 100;
    return orgCount * bonusUsers * PRICE_PER_SEAT * 0.05;
  };

  const calculateOrgRevenue = (avgSize: number) => {
    return avgSize * PRICE_PER_SEAT * 0.10;
  };

  // Tab content
  const individualEarnings = calculateIndividualEarnings(individualCount);
  const orgReferralEarnings = calculateOrgReferralEarnings(orgReferralCount, orgReferralSize);
  const orgPartnershipEarnings = calculateOrgPartnershipEarnings(orgPartnershipCount, orgPartnershipSize);
  const orgPartnershipRevenue = calculateOrgRevenue(orgPartnershipSize);

  const combinedTotal = 
    calculateIndividualEarnings(combinedIndividuals) +
    calculateOrgReferralEarnings(combinedOrgReferrals, combinedOrgReferralSize) +
    calculateOrgPartnershipEarnings(combinedPartnerships, combinedPartnershipSize);

  return (
    <div className="space-y-6">
      {/* Strategy Selection */}
      <LiquidGlass variant="blue" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-block p-3 rounded-xl bg-neon-cortex-blue/20">
            <Calculator className="w-6 h-6 text-mind-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black">Calculate Your Potential</h2>
            <p className="text-text-secondary text-sm">Choose your earning strategy</p>
          </div>
        </div>

        {/* Strategy Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setActiveTab('individuals')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              activeTab === 'individuals'
                ? 'border-neon-cortex-blue bg-neon-cortex-blue/20 text-white'
                : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
            }`}
          >
            <Users className="w-5 h-5 mb-2" />
            <div className="font-bold text-sm">The Connector</div>
            <div className="text-xs opacity-70">Individual referrals</div>
          </button>

          <button
            onClick={() => setActiveTab('org-referral')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              activeTab === 'org-referral'
                ? 'border-solar-surge-orange bg-solar-surge-orange/20 text-white'
                : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
            }`}
          >
            <Briefcase className="w-5 h-5 mb-2" />
            <div className="font-bold text-sm">The Dealmaker</div>
            <div className="text-xs opacity-70">Org via your link</div>
          </button>

          <button
            onClick={() => setActiveTab('org-partnership')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              activeTab === 'org-partnership'
                ? 'border-neon-cortex-green bg-neon-cortex-green/20 text-white'
                : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
            }`}
          >
            <TrendingUp className="w-5 h-5 mb-2" />
            <div className="font-bold text-sm">The Growth Partner</div>
            <div className="text-xs opacity-70">Org partnership</div>
          </button>

          <button
            onClick={() => setActiveTab('combined')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              activeTab === 'combined'
                ? 'border-purple-500 bg-purple-500/20 text-white'
                : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'
            }`}
          >
            <Zap className="w-5 h-5 mb-2" />
            <div className="font-bold text-sm">The Strategist</div>
            <div className="text-xs opacity-70">Mix all three</div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'individuals' && (
          <div className="space-y-6">
            <div className="p-4 bg-neon-cortex-blue/10 border border-neon-cortex-blue/30 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  Share your referral link with individual coaches. Earn 10% commission on every payment they make, forever.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
                How many individual coaches will you refer?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={individualCount}
                  onChange={(e) => setIndividualCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
                <div className="text-2xl font-black text-neon-cortex-blue min-w-[60px] text-right">
                  {individualCount}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 rounded-xl border-2 border-neon-cortex-blue/40">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-2">Your Annual Earnings</p>
                <p className="text-4xl font-black text-neon-cortex-blue">
                  ${individualEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year
                </p>
                <p className="text-xs text-text-secondary mt-2">
                  {individualCount} coaches × $119 × 10% commission
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'org-referral' && (
          <div className="space-y-6">
            <div className="p-4 bg-solar-surge-orange/10 border border-solar-surge-orange/30 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-solar-surge-orange flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  Organization purchases team license through your referral link. You earn 10% on all users. Simplest approach.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
                How many organizations will purchase via your link?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={orgReferralCount}
                  onChange={(e) => setOrgReferralCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                />
                <div className="text-2xl font-black text-solar-surge-orange min-w-[60px] text-right">
                  {orgReferralCount}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
                Average organization size (users)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="12"
                  max="500"
                  step="10"
                  value={orgReferralSize}
                  onChange={(e) => setOrgReferralSize(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                />
                <div className="text-2xl font-black text-solar-surge-orange min-w-[80px] text-right">
                  {orgReferralSize}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-solar-surge-orange/20 to-neon-cortex-blue/20 rounded-xl border-2 border-solar-surge-orange/40">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-2">Your Annual Earnings</p>
                <p className="text-4xl font-black text-solar-surge-orange">
                  ${orgReferralEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year
                </p>
                <p className="text-xs text-text-secondary mt-2">
                  {orgReferralCount} orgs × {orgReferralSize} users × $119 × 10%
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'org-partnership' && (
          <div className="space-y-6">
            <div className="p-4 bg-neon-cortex-green/10 border border-neon-cortex-green/30 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-neon-cortex-green flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  Create formal partnership. Org signs up users independently and earns 10%. You earn 5% bonus on users 101+.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
                How many organization partnerships?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={orgPartnershipCount}
                  onChange={(e) => setOrgPartnershipCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-green"
                />
                <div className="text-2xl font-black text-neon-cortex-green min-w-[60px] text-right">
                  {orgPartnershipCount}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
                Average organization size (users)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="12"
                  max="500"
                  step="10"
                  value={orgPartnershipSize}
                  onChange={(e) => setOrgPartnershipSize(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-green"
                />
                <div className="text-2xl font-black text-neon-cortex-green min-w-[80px] text-right">
                  {orgPartnershipSize}
                </div>
              </div>
            </div>

            {orgPartnershipSize <= 100 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-200">
                  ⚠️ Organizations under 100 users don't trigger your bonus. You earn $0, but the org earns 10% (${calculateOrgRevenue(orgPartnershipSize).toFixed(2)}/year).
                </p>
              </div>
            )}

            <div className="p-6 bg-gradient-to-br from-neon-cortex-green/20 to-solar-surge-orange/20 rounded-xl border-2 border-neon-cortex-green/40">
              <div className="text-center mb-4">
                <p className="text-sm text-text-secondary mb-2">Your Annual Earnings (Bonus)</p>
                <p className="text-4xl font-black text-neon-cortex-green">
                  ${orgPartnershipEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year
                </p>
                {orgPartnershipSize > 100 && (
                  <p className="text-xs text-text-secondary mt-2">
                    {orgPartnershipCount} orgs × {orgPartnershipSize - 100} bonus users × $119 × 5%
                  </p>
                )}
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-text-secondary text-center mb-2">Organization's Earnings</p>
                <p className="text-2xl font-bold text-center text-white">
                  ${(orgPartnershipRevenue * orgPartnershipCount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year
                </p>
                <p className="text-xs text-text-secondary text-center mt-1">
                  Org earns 10% on all {orgPartnershipSize} users
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'combined' && (
          <div className="space-y-6">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  Maximize earnings by combining all three strategies: individual referrals + org referrals + org partnerships.
                </p>
              </div>
            </div>

            {/* Individual Referrals */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-neon-cortex-blue">Individual Referrals</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={combinedIndividuals}
                  onChange={(e) => setCombinedIndividuals(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
                <div className="text-xl font-black text-neon-cortex-blue min-w-[50px] text-right">
                  {combinedIndividuals}
                </div>
              </div>
            </div>

            {/* Org Referrals */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-solar-surge-orange">Org Referrals (Via Your Link)</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-text-secondary block mb-1">Organizations</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={combinedOrgReferrals}
                    onChange={(e) => setCombinedOrgReferrals(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                  />
                </div>
                <div className="text-xl font-black text-solar-surge-orange min-w-[50px] text-right">
                  {combinedOrgReferrals}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-text-secondary block mb-1">Avg Size</label>
                  <input
                    type="range"
                    min="12"
                    max="300"
                    step="10"
                    value={combinedOrgReferralSize}
                    onChange={(e) => setCombinedOrgReferralSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                  />
                </div>
                <div className="text-xl font-black text-solar-surge-orange min-w-[50px] text-right">
                  {combinedOrgReferralSize}
                </div>
              </div>
            </div>

            {/* Org Partnerships */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-neon-cortex-green">Org Partnerships (Growth Bonus)</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-text-secondary block mb-1">Partnerships</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={combinedPartnerships}
                    onChange={(e) => setCombinedPartnerships(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-green"
                  />
                </div>
                <div className="text-xl font-black text-neon-cortex-green min-w-[50px] text-right">
                  {combinedPartnerships}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-text-secondary block mb-1">Avg Size</label>
                  <input
                    type="range"
                    min="12"
                    max="300"
                    step="10"
                    value={combinedPartnershipSize}
                    onChange={(e) => setCombinedPartnershipSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-green"
                  />
                </div>
                <div className="text-xl font-black text-neon-cortex-green min-w-[50px] text-right">
                  {combinedPartnershipSize}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-500/20 to-solar-surge-orange/20 rounded-xl border-2 border-purple-500/40">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-2">Total Annual Earnings</p>
                <p className="text-5xl font-black text-transparent bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange to-neon-cortex-green bg-clip-text">
                  ${combinedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm text-text-secondary">
                  <div className="flex justify-between">
                    <span>Individuals:</span>
                    <span className="font-bold text-neon-cortex-blue">
                      ${calculateIndividualEarnings(combinedIndividuals).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Org Referrals:</span>
                    <span className="font-bold text-solar-surge-orange">
                      ${calculateOrgReferralEarnings(combinedOrgReferrals, combinedOrgReferralSize).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partnership Bonus:</span>
                    <span className="font-bold text-neon-cortex-green">
                      ${calculateOrgPartnershipEarnings(combinedPartnerships, combinedPartnershipSize).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </LiquidGlass>

      {/* Comparison Chart */}
      <LiquidGlass variant="orange" className="p-6">
        <h3 className="text-2xl font-black mb-4">Organization Strategy Comparison</h3>
        <p className="text-sm text-text-secondary mb-6">
          Two ways to work with organizations - choose based on your relationship and goals
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4"></th>
                <th className="text-center py-3 px-4 text-solar-surge-orange font-bold">Via Your Link</th>
                <th className="text-center py-3 px-4 text-neon-cortex-green font-bold">Partnership Program</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-text-secondary">Partner Commission (200 users)</td>
                <td className="text-center py-3 px-4 font-bold">$2,380/year</td>
                <td className="text-center py-3 px-4 font-bold">$595/year</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-text-secondary">Organization Commission</td>
                <td className="text-center py-3 px-4">$0</td>
                <td className="text-center py-3 px-4 font-bold">$2,380/year</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4 text-text-secondary">Setup Complexity</td>
                <td className="text-center py-3 px-4">Simple</td>
                <td className="text-center py-3 px-4">Requires linking</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-text-secondary">Best For</td>
                <td className="text-center py-3 px-4">Quick wins</td>
                <td className="text-center py-3 px-4">Long-term partners</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LiquidGlass>
    </div>
  );
}
