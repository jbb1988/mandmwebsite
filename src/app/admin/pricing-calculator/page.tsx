'use client';

import React, { useState } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { Calculator, Download, TrendingUp, DollarSign, Users, Lock } from 'lucide-react';

export default function AdminPricingCalculator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Pricing parameters
  const [basePrice, setBasePrice] = useState(119);
  const [futurePrice, setFuturePrice] = useState(139);
  
  // Current discount structure
  const [currentTier1, setCurrentTier1] = useState(10); // 12-120 users
  const [currentTier2, setCurrentTier2] = useState(15); // 121-199 users
  const [currentTier3, setCurrentTier3] = useState(20); // 200+ users
  
  // Proposed discount structure
  const [proposedTier1, setProposedTier1] = useState(5);
  const [proposedTier2, setProposedTier2] = useState(10);
  const [proposedTier3, setProposedTier3] = useState(15);
  
  // Commission rates
  const [orgCommission, setOrgCommission] = useState(10);
  const [partnerBonus, setPartnerBonus] = useState(5);
  const [partnerBonusThreshold, setPartnerBonusThreshold] = useState(100);
  
  // Scenario modeling
  const [orgSize, setOrgSize] = useState(200);
  const [numberOfOrgs, setNumberOfOrgs] = useState(10);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper auth
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'mindmuscle2025') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  // Calculate pricing for different scenarios
  const calculateRevenue = (users: number, discountPercent: number, price: number) => {
    const pricePerSeat = price * (1 - discountPercent / 100);
    return users * pricePerSeat;
  };

  const calculateCommissions = (users: number, price: number) => {
    const orgCommissionAmount = users * price * (orgCommission / 100);
    
    let partnerBonusAmount = 0;
    if (users > partnerBonusThreshold) {
      const bonusUsers = users - partnerBonusThreshold;
      partnerBonusAmount = bonusUsers * price * (partnerBonus / 100);
    }
    
    return {
      orgCommission: orgCommissionAmount,
      partnerBonus: partnerBonusAmount,
      total: orgCommissionAmount + partnerBonusAmount
    };
  };

  // Calculate discount tier based on user count
  const getDiscountTier = (users: number, tier1: number, tier2: number, tier3: number) => {
    if (users >= 200) return tier3;
    if (users >= 121) return tier2;
    if (users >= 12) return tier1;
    return 0;
  };

  // Scenario calculations
  const currentDiscount = getDiscountTier(orgSize, currentTier1, currentTier2, currentTier3);
  const proposedDiscount = getDiscountTier(orgSize, proposedTier1, proposedTier2, proposedTier3);
  
  const currentRevenue = calculateRevenue(orgSize, currentDiscount, basePrice);
  const proposedRevenue = calculateRevenue(orgSize, proposedDiscount, basePrice);
  const futureRevenue = calculateRevenue(orgSize, proposedDiscount, futurePrice);
  
  const currentCommissions = calculateCommissions(orgSize, basePrice);
  const proposedCommissions = calculateCommissions(orgSize, basePrice);
  
  const currentNetRevenue = currentRevenue - currentCommissions.total;
  const proposedNetRevenue = proposedRevenue - proposedCommissions.total;
  const futureNetRevenue = futureRevenue - proposedCommissions.total;

  const revenueDifference = proposedRevenue - currentRevenue;
  const revenuePercentChange = ((revenueDifference / currentRevenue) * 100).toFixed(2);
  
  const futureRevenueDifference = futureRevenue - proposedRevenue;
  const futureRevenuePercentChange = ((futureRevenueDifference / proposedRevenue) * 100).toFixed(2);

  // Aggregate scenario
  const totalCurrentRevenue = currentRevenue * numberOfOrgs;
  const totalProposedRevenue = proposedRevenue * numberOfOrgs;
  const totalFutureRevenue = futureRevenue * numberOfOrgs;
  
  const totalCurrentCommissions = currentCommissions.total * numberOfOrgs;
  const totalProposedCommissions = proposedCommissions.total * numberOfOrgs;

  const exportData = () => {
    const data = {
      basePrice,
      futurePrice,
      currentDiscounts: { tier1: currentTier1, tier2: currentTier2, tier3: currentTier3 },
      proposedDiscounts: { tier1: proposedTier1, tier2: proposedTier2, tier3: proposedTier3 },
      commissions: { orgRate: orgCommission, partnerBonus, threshold: partnerBonusThreshold },
      scenario: { orgSize, numberOfOrgs },
      results: {
        currentRevenue: totalCurrentRevenue,
        proposedRevenue: totalProposedRevenue,
        futureRevenue: totalFutureRevenue,
        revenueDifference,
        revenuePercentChange,
        totalCommissions: totalProposedCommissions
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricing-analysis-${Date.now()}.json`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <LiquidGlass variant="blue" className="max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-cortex-blue/20 mb-4">
              <Lock className="w-8 h-8 text-neon-cortex-blue" />
            </div>
            <h1 className="text-3xl font-black mb-2">Admin Access Required</h1>
            <p className="text-text-secondary text-sm">Enter password to access pricing calculator</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            
            <LiquidButton type="submit" variant="blue" size="lg" fullWidth={true}>
              Access Calculator
            </LiquidButton>
          </form>
        </LiquidGlass>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <LiquidGlass variant="blue" className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-block p-3 rounded-xl bg-neon-cortex-blue/20">
                <Calculator className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Admin Pricing Calculator</h1>
                <p className="text-text-secondary text-sm">Model pricing scenarios and commission structures</p>
              </div>
            </div>
            <LiquidButton onClick={exportData} variant="orange" size="md">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </LiquidButton>
          </div>
        </LiquidGlass>

        {/* Input Parameters */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Base Pricing */}
          <LiquidGlass variant="blue" className="p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-neon-cortex-blue" />
              Base Pricing
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Current Base Price: ${basePrice}</label>
                <input
                  type="range"
                  min="99"
                  max="199"
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Future Base Price: ${futurePrice}</label>
                <input
                  type="range"
                  min="99"
                  max="199"
                  value={futurePrice}
                  onChange={(e) => setFuturePrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
              </div>
            </div>
          </LiquidGlass>

          {/* Commission Rates */}
          <LiquidGlass variant="orange" className="p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-solar-surge-orange" />
              Commission Rates
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Org Commission: {orgCommission}%</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={orgCommission}
                  onChange={(e) => setOrgCommission(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Partner Bonus (101+): {partnerBonus}%</label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={partnerBonus}
                  onChange={(e) => setPartnerBonus(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Bonus Threshold: {partnerBonusThreshold} users</label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={partnerBonusThreshold}
                  onChange={(e) => setPartnerBonusThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                />
              </div>
            </div>
          </LiquidGlass>
        </div>

        {/* Discount Structures */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Structure */}
          <LiquidGlass variant="blue" className="p-6">
            <h2 className="text-xl font-black mb-4">Current Discount Structure</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tier 1 (12-120 users): {currentTier1}%</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={currentTier1}
                  onChange={(e) => setCurrentTier1(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Tier 2 (121-199 users): {currentTier2}%</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={currentTier2}
                  onChange={(e) => setCurrentTier2(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Tier 3 (200+ users): {currentTier3}%</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={currentTier3}
                  onChange={(e) => setCurrentTier3(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
              </div>
            </div>
          </LiquidGlass>

          {/* Proposed Structure */}
          <LiquidGlass variant="orange" className="p-6">
            <h2 className="text-xl font-black mb-4">Proposed Discount Structure</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tier 1 (12-120 users): {proposedTier1}%</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={proposedTier1}
                  onChange={(e) => setProposedTier1(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Tier 2 (121-199 users): {proposedTier2}%</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={proposedTier2}
                  onChange={(e) => setProposedTier2(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Tier 3 (200+ users): {proposedTier3}%</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={proposedTier3}
                  onChange={(e) => setProposedTier3(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                />
              </div>
            </div>
          </LiquidGlass>
        </div>

        {/* Scenario Modeling */}
        <LiquidGlass variant="blue" className="p-6">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-cortex-blue" />
            Scenario Modeling
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Organization Size: {orgSize} users</label>
              <input
                type="range"
                min="12"
                max="500"
                step="10"
                value={orgSize}
                onChange={(e) => setOrgSize(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Number of Organizations: {numberOfOrgs}</label>
              <input
                type="range"
                min="1"
                max="100"
                value={numberOfOrgs}
                onChange={(e) => setNumberOfOrgs(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
              />
            </div>
          </div>
        </LiquidGlass>

        {/* Results */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Current Structure Results */}
          <LiquidGlass variant="blue" className="p-6">
            <h3 className="text-lg font-black mb-4">Current Structure</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Discount Applied:</span>
                <span className="font-bold">{currentDiscount}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Revenue per Org:</span>
                <span className="font-bold">${currentRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Commissions:</span>
                <span className="font-bold text-red-400">-${currentCommissions.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-text-secondary">Net Revenue:</span>
                <span className="font-bold text-neon-cortex-green">${currentNetRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 mt-3">
                <span className="text-text-secondary">Total ({numberOfOrgs} orgs):</span>
                <span className="font-bold text-xl">${(currentNetRevenue * numberOfOrgs).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </LiquidGlass>

          {/* Proposed Structure Results */}
          <LiquidGlass variant="orange" className="p-6">
            <h3 className="text-lg font-black mb-4">Proposed Structure (${basePrice})</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Discount Applied:</span>
                <span className="font-bold">{proposedDiscount}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Revenue per Org:</span>
                <span className="font-bold">${proposedRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Commissions:</span>
                <span className="font-bold text-red-400">-${proposedCommissions.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-text-secondary">Net Revenue:</span>
                <span className="font-bold text-neon-cortex-green">${proposedNetRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 mt-3">
                <span className="text-text-secondary">Change:</span>
                <span className={`font-bold ${Number(revenuePercentChange) > 0 ? 'text-neon-cortex-green' : 'text-red-400'}`}>
                  {Number(revenuePercentChange) > 0 ? '+' : ''}{revenuePercentChange}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total ({numberOfOrgs} orgs):</span>
                <span className="font-bold text-xl">${(proposedNetRevenue * numberOfOrgs).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </LiquidGlass>

          {/* Future Price Results */}
          <LiquidGlass variant="blue" className="p-6">
            <h3 className="text-lg font-black mb-4">Future Price (${futurePrice})</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Discount Applied:</span>
                <span className="font-bold">{proposedDiscount}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Revenue per Org:</span>
                <span className="font-bold">${futureRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Commissions:</span>
                <span className="font-bold text-red-400">-${proposedCommissions.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-text-secondary">Net Revenue:</span>
                <span className="font-bold text-neon-cortex-green">${futureNetRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 mt-3">
                <span className="text-text-secondary">vs Proposed:</span>
                <span className={`font-bold ${Number(futureRevenuePercentChange) > 0 ? 'text-neon-cortex-green' : 'text-red-400'}`}>
                  {Number(futureRevenuePercentChange) > 0 ? '+' : ''}{futureRevenuePercentChange}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total ({numberOfOrgs} orgs):</span>
                <span className="font-bold text-xl">${(futureNetRevenue * numberOfOrgs).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </LiquidGlass>
        </div>

        {/* Commission Breakdown */}
        <LiquidGlass variant="orange" className="p-6">
          <h3 className="text-lg font-black mb-4">Commission Breakdown ({orgSize} user organization)</h3>
          
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-text-secondary mb-2">Organization Commission ({orgCommission}%)</p>
              <p className="text-2xl font-black">${proposedCommissions.orgCommission.toFixed(2)}</p>
              <p className="text-xs text-text-secondary mt-1">{orgSize} users × ${basePrice} × {orgCommission}%</p>
            </div>
            
            <div>
              <p className="text-text-secondary mb-2">Partner Bonus ({partnerBonus}% on {orgSize - partnerBonusThreshold}+ users)</p>
              <p className="text-2xl font-black">${proposedCommissions.partnerBonus.toFixed(2)}</p>
              {orgSize > partnerBonusThreshold ? (
                <p className="text-xs text-text-secondary mt-1">{orgSize - partnerBonusThreshold} users × ${basePrice} × {partnerBonus}%</p>
              ) : (
                <p className="text-xs text-yellow-400 mt-1">No bonus (under {partnerBonusThreshold} users)</p>
              )}
            </div>
            
            <div>
              <p className="text-text-secondary mb-2">Total Commission Payout</p>
              <p className="text-2xl font-black text-red-400">${proposedCommissions.total.toFixed(2)}</p>
              <p className="text-xs text-text-secondary mt-1">
                {((proposedCommissions.total / proposedRevenue) * 100).toFixed(2)}% of revenue
              </p>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}
