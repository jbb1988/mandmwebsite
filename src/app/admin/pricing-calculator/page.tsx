'use client';

import React, { useState } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { Calculator, Download, DollarSign, Users, Lock, TrendingUp } from 'lucide-react';

export default function AdminPricingCalculator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Simple profitability inputs
  const [pricePerSeat, setPricePerSeat] = useState(119);
  const [costPerSeat, setCostPerSeat] = useState(15);
  const [numUsers, setNumUsers] = useState(200);
  const [volumeDiscount, setVolumeDiscount] = useState(10); // %
  const [partnerCommission, setPartnerCommission] = useState(10); // %

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'mindmuscle2025') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  // Simple profitability calculations
  const discountedPrice = pricePerSeat * (1 - volumeDiscount / 100);
  const grossRevenue = discountedPrice * numUsers;
  const partnerPayout = grossRevenue * (partnerCommission / 100);
  const totalCosts = costPerSeat * numUsers;
  const netProfit = grossRevenue - partnerPayout - totalCosts;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const profitPerUser = numUsers > 0 ? netProfit / numUsers : 0;

  const exportData = () => {
    const data = {
      inputs: {
        pricePerSeat,
        costPerSeat,
        numUsers,
        volumeDiscount,
        partnerCommission
      },
      calculated: {
        discountedPrice: discountedPrice.toFixed(2),
        grossRevenue: grossRevenue.toFixed(2),
        partnerPayout: partnerPayout.toFixed(2),
        totalCosts: totalCosts.toFixed(2),
        netProfit: netProfit.toFixed(2),
        profitMargin: profitMargin.toFixed(2) + '%',
        profitPerUser: profitPerUser.toFixed(2)
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profitability-${Date.now()}.json`;
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
            <p className="text-text-secondary text-sm">Enter password to access profitability calculator</p>
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <LiquidGlass variant="blue" className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-block p-3 rounded-xl bg-neon-cortex-blue/20">
                <Calculator className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Profitability Calculator</h1>
                <p className="text-text-secondary text-sm">Model scenarios - Revenue minus commissions minus costs = profit</p>
              </div>
            </div>
            <LiquidButton onClick={exportData} variant="orange" size="md">
              <Download className="w-4 h-4 mr-2" />
              Export
            </LiquidButton>
          </div>
        </LiquidGlass>

        {/* Input Parameters */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pricing Inputs */}
          <LiquidGlass variant="blue" className="p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-neon-cortex-blue" />
              Pricing
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Price per Seat: ${pricePerSeat}</label>
                <input
                  type="range"
                  min="79"
                  max="199"
                  value={pricePerSeat}
                  onChange={(e) => setPricePerSeat(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Cost per Seat: ${costPerSeat}</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={costPerSeat}
                  onChange={(e) => setCostPerSeat(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Number of Users: {numUsers}</label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={numUsers}
                  onChange={(e) => setNumUsers(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
              </div>
            </div>
          </LiquidGlass>

          {/* Discount Inputs */}
          <LiquidGlass variant="orange" className="p-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-solar-surge-orange" />
              Discounts & Commissions
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Volume Discount: {volumeDiscount}%</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={volumeDiscount}
                  onChange={(e) => setVolumeDiscount(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Discounted price: ${discountedPrice.toFixed(2)}/seat
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Partner Commission: {partnerCommission}%</label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={partnerCommission}
                  onChange={(e) => setPartnerCommission(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Partner payout: ${partnerPayout.toFixed(2)}
                </p>
              </div>
            </div>
          </LiquidGlass>
        </div>

        {/* Results */}
        <LiquidGlass variant="blue" className="p-8">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-neon-cortex-blue" />
            Profitability Analysis
          </h2>

          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-text-secondary mb-1">Gross Revenue</p>
              <p className="text-2xl font-black text-neon-cortex-blue">${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-text-secondary mt-1">{numUsers} × ${discountedPrice.toFixed(2)}</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-text-secondary mb-1">Partner Payout</p>
              <p className="text-2xl font-black text-red-400">-${partnerPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-text-secondary mt-1">{partnerCommission}% of revenue</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-text-secondary mb-1">Total Costs</p>
              <p className="text-2xl font-black text-red-400">-${totalCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-text-secondary mt-1">{numUsers} × ${costPerSeat}</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-neon-cortex-green/20 to-solar-surge-orange/20 rounded-lg border border-neon-cortex-green/30">
              <p className="text-xs text-text-secondary mb-1">Net Profit</p>
              <p className={`text-3xl font-black ${netProfit >= 0 ? 'text-neon-cortex-green' : 'text-red-400'}`}>
                ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-text-secondary mt-1">{profitMargin.toFixed(1)}% margin</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Profit per User</p>
              <p className={`text-xl font-black ${profitPerUser >= 0 ? 'text-neon-cortex-green' : 'text-red-400'}`}>
                ${profitPerUser.toFixed(2)}/user
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Break-Even Analysis</p>
              <p className="text-sm">
                {netProfit >= 0 ? (
                  <span className="text-neon-cortex-green">✓ Profitable at current settings</span>
                ) : (
                  <span className="text-red-400">⚠ Not profitable - adjust pricing</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-300">
              <strong>Formula:</strong> Revenue ({numUsers} users × ${discountedPrice.toFixed(2)}) - Partner Commission ({partnerCommission}%) - Costs ({numUsers} × ${costPerSeat}) = Net Profit
            </p>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}
