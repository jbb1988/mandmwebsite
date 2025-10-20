'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { Calculator, Download, DollarSign, Users, TrendingUp, Settings } from 'lucide-react';
import jsPDF from 'jspdf';

export default function AdminPricingCalculator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  // Simple profitability inputs
  const [pricePerSeat, setPricePerSeat] = useState(119);
  const [costPerSeat, setCostPerSeat] = useState(15);
  const [numTeams, setNumTeams] = useState(15);
  const [usersPerTeam, setUsersPerTeam] = useState(14);
  const [volumeDiscount, setVolumeDiscount] = useState(10); // %
  const [partnerCommission, setPartnerCommission] = useState(10); // %

  // Hard Costs (Annual basis for calculation)
  const [oneSignalMonthly, setOneSignalMonthly] = useState(0);
  const [stripePerTransaction, setStripePerTransaction] = useState(0.30);
  const [revenueCatMonthly, setRevenueCatMonthly] = useState(20);
  const [resendMonthly, setResendMonthly] = useState(0);
  const [toltMonthly, setToltMonthly] = useState(49);
  const [googleWorkspaceMonthly, setGoogleWorkspaceMonthly] = useState(20);
  const [openRouterPerUserYearly, setOpenRouterPerUserYearly] = useState(2);
  const [geminiFlashPerUserYearly, setGeminiFlashPerUserYearly] = useState(12);
  const [vercelMonthly, setVercelMonthly] = useState(0);
  const [supabaseYearly, setSupabaseYearly] = useState(30);
  const [claudeCodeMonthly, setClaudeCodeMonthly] = useState(200);

  // Calculate total users from teams
  const numUsers = numTeams * usersPerTeam;

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if admin authenticated
        const response = await fetch('/api/admin/check-auth');

        if (response.status === 401) {
          // Not authenticated - redirect to login
          router.push('/admin/login?returnUrl=/admin/pricing-calculator');
          return;
        }

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Any other error - redirect to login
          router.push('/admin/login?returnUrl=/admin/pricing-calculator');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login?returnUrl=/admin/pricing-calculator');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Hard costs calculations (convert to annual)
  const monthlyFixedCosts = oneSignalMonthly + revenueCatMonthly + resendMonthly + toltMonthly + googleWorkspaceMonthly + vercelMonthly + claudeCodeMonthly;
  const annualFixedCosts = (monthlyFixedCosts * 12) + supabaseYearly;
  const annualPerUserCosts = (openRouterPerUserYearly + geminiFlashPerUserYearly) * numUsers;
  const annualTransactionCosts = stripePerTransaction * numUsers * 12; // Assume 12 transactions per user per year
  const totalHardCosts = annualFixedCosts + annualPerUserCosts + annualTransactionCosts;

  // Simple profitability calculations
  const discountedPrice = pricePerSeat * (1 - volumeDiscount / 100);
  const grossRevenue = (discountedPrice * numUsers) * 12; // Annual revenue
  const partnerPayout = grossRevenue * (partnerCommission / 100);
  const totalCosts = (costPerSeat * numUsers * 12) + totalHardCosts; // Annual costs
  const netProfit = grossRevenue - partnerPayout - totalCosts;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const profitPerUser = numUsers > 0 ? netProfit / numUsers : 0;

  const exportData = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Mind & Muscle', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(18);
    doc.text('Profitability Calculator Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // Input Parameters Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Input Parameters', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Price per Seat: $${pricePerSeat}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Cost per Seat: $${costPerSeat}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Number of Teams: ${numTeams}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Users per Team: ${usersPerTeam}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Total Users: ${numUsers.toLocaleString()}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Volume Discount: ${volumeDiscount}%`, 25, yPosition);
    yPosition += 7;
    doc.text(`Partner Commission: ${partnerCommission}%`, 25, yPosition);
    yPosition += 7;
    doc.text(`Discounted Price: $${discountedPrice.toFixed(2)}/seat`, 25, yPosition);

    yPosition += 15;

    // Hard Costs Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Operational Hard Costs', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`OneSignal: $${oneSignalMonthly.toFixed(2)}/mo ($${Math.round(oneSignalMonthly * 12)}/yr)`, 25, yPosition);
    yPosition += 5;
    doc.text(`RevenueCat: $${revenueCatMonthly.toFixed(2)}/mo ($${Math.round(revenueCatMonthly * 12)}/yr)`, 25, yPosition);
    yPosition += 5;
    doc.text(`Resend: $${resendMonthly.toFixed(2)}/mo ($${Math.round(resendMonthly * 12)}/yr)`, 25, yPosition);
    yPosition += 5;
    doc.text(`Tolt: $${toltMonthly.toFixed(2)}/mo ($${Math.round(toltMonthly * 12)}/yr)`, 25, yPosition);
    yPosition += 5;
    doc.text(`Google Workspace: $${googleWorkspaceMonthly.toFixed(2)}/mo ($${Math.round(googleWorkspaceMonthly * 12)}/yr)`, 25, yPosition);
    yPosition += 5;
    doc.text(`Vercel: $${vercelMonthly.toFixed(2)}/mo ($${Math.round(vercelMonthly * 12)}/yr)`, 25, yPosition);
    yPosition += 5;
    doc.text(`Claude Code: $${claudeCodeMonthly.toFixed(2)}/mo ($${Math.round(claudeCodeMonthly * 12)}/yr)`, 25, yPosition);
    yPosition += 5;
    doc.text(`Supabase: $${supabaseYearly.toFixed(2)}/yr`, 25, yPosition);
    yPosition += 5;
    doc.text(`Stripe: $${stripePerTransaction.toFixed(2)}/txn × ${numUsers} users × 12 = $${Math.round(annualTransactionCosts)}`, 25, yPosition);
    yPosition += 5;
    doc.text(`OpenRouter AI: $${openRouterPerUserYearly.toFixed(2)}/user/yr × ${numUsers} = $${Math.round((openRouterPerUserYearly * numUsers))}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Gemini Flash AI: $${geminiFlashPerUserYearly.toFixed(2)}/user/yr × ${numUsers} = $${Math.round((geminiFlashPerUserYearly * numUsers))}`, 25, yPosition);
    yPosition += 7;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Hard Costs: $${Math.round(totalHardCosts).toLocaleString()}/yr`, 25, yPosition);
    yPosition += 15;

    // Profitability Analysis Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Profitability Analysis (Annual)', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Annual Revenue: $${Math.round(grossRevenue).toLocaleString()}`, 25, yPosition);
    yPosition += 5;
    doc.setFontSize(9);
    doc.text(`(${numUsers} users × $${discountedPrice.toFixed(2)}/mo × 12 months)`, 30, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.text(`Partner Payout: -$${Math.round(partnerPayout).toLocaleString()}`, 25, yPosition);
    yPosition += 5;
    doc.setFontSize(9);
    doc.text(`(${partnerCommission}% of revenue)`, 30, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.text(`Variable Costs: -$${Math.round(costPerSeat * numUsers * 12).toLocaleString()}`, 25, yPosition);
    yPosition += 5;
    doc.setFontSize(9);
    doc.text(`(${numUsers} users × $${costPerSeat}/mo × 12)`, 30, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.text(`Hard Costs: -$${Math.round(totalHardCosts).toLocaleString()}`, 25, yPosition);
    yPosition += 5;
    doc.setFontSize(9);
    doc.text(`(Fixed + Per User + Transactions)`, 30, yPosition);
    yPosition += 10;

    // Net Profit (highlighted)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const profitColor = netProfit >= 0 ? [34, 197, 94] : [239, 68, 68]; // Green or Red
    doc.setTextColor(profitColor[0], profitColor[1], profitColor[2]);
    doc.text(`Net Profit: $${Math.round(netProfit).toLocaleString()}`, 25, yPosition);
    yPosition += 5;
    doc.setFontSize(10);
    doc.text(`(${profitMargin.toFixed(1)}% margin)`, 30, yPosition);
    yPosition += 10;

    // Reset color
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Profit per User: $${Math.round(profitPerUser)}/user`, 25, yPosition);
    yPosition += 10;

    // Break-even status
    const breakEvenText = netProfit >= 0 ? '✓ Profitable at current settings' : '⚠ Not profitable - adjust pricing';
    doc.text(breakEvenText, 25, yPosition);

    yPosition += 15;

    // Formula
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Formula:', 20, yPosition);
    yPosition += 5;
    const formula = `Annual Revenue (${numUsers} users × $${discountedPrice.toFixed(2)}/mo × 12) - Partner Commission (${partnerCommission}%) - Variable Costs (${numUsers} users × $${costPerSeat}/mo × 12) - Hard Costs ($${Math.round(totalHardCosts)}) = Net Profit`;
    const splitFormula = doc.splitTextToSize(formula, pageWidth - 40);
    doc.text(splitFormula, 20, yPosition);

    // Save PDF
    doc.save(`profitability-report-${Date.now()}.pdf`);
  };

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <LiquidGlass variant="blue" className="max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cortex-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Verifying access...</p>
        </LiquidGlass>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
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
                <label className="block text-sm font-semibold mb-2">Number of Teams: {numTeams}</label>
                <input
                  type="range"
                  min="1"
                  max="500"
                  step="1"
                  value={numTeams}
                  onChange={(e) => setNumTeams(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Users per Team: {usersPerTeam}</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={usersPerTeam}
                  onChange={(e) => setUsersPerTeam(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Total Users: {numUsers.toLocaleString()}
                </p>
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

        {/* Hard Costs */}
        <LiquidGlass variant="neutral" className="p-6">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-text-primary" />
            Operational Hard Costs
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Column 1: Fixed Monthly */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text-secondary mb-3">Fixed Monthly Costs</h3>

              <div>
                <label className="block text-xs font-semibold mb-1">OneSignal: ${oneSignalMonthly.toFixed(2)}/mo</label>
                <input
                  type="number"
                  step="0.01"
                  value={oneSignalMonthly}
                  onChange={(e) => setOneSignalMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">RevenueCat: ${revenueCatMonthly.toFixed(2)}/mo</label>
                <input
                  type="number"
                  step="0.01"
                  value={revenueCatMonthly}
                  onChange={(e) => setRevenueCatMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Resend: ${resendMonthly.toFixed(2)}/mo</label>
                <input
                  type="number"
                  step="0.01"
                  value={resendMonthly}
                  onChange={(e) => setResendMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tolt: ${toltMonthly.toFixed(2)}/mo</label>
                <input
                  type="number"
                  step="0.01"
                  value={toltMonthly}
                  onChange={(e) => setToltMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Column 2: More Fixed Monthly */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text-secondary mb-3">&nbsp;</h3>

              <div>
                <label className="block text-xs font-semibold mb-1">Google Workspace: ${googleWorkspaceMonthly.toFixed(2)}/mo</label>
                <input
                  type="number"
                  step="0.01"
                  value={googleWorkspaceMonthly}
                  onChange={(e) => setGoogleWorkspaceMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Vercel: ${vercelMonthly.toFixed(2)}/mo</label>
                <input
                  type="number"
                  step="0.01"
                  value={vercelMonthly}
                  onChange={(e) => setVercelMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Claude Code: ${claudeCodeMonthly.toFixed(2)}/mo</label>
                <input
                  type="number"
                  step="0.01"
                  value={claudeCodeMonthly}
                  onChange={(e) => setClaudeCodeMonthly(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Supabase: ${supabaseYearly.toFixed(2)}/yr</label>
                <input
                  type="number"
                  step="0.01"
                  value={supabaseYearly}
                  onChange={(e) => setSupabaseYearly(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Column 3: Per User/Transaction */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text-secondary mb-3">Variable Costs</h3>

              <div>
                <label className="block text-xs font-semibold mb-1">Stripe: ${stripePerTransaction.toFixed(2)}/txn</label>
                <input
                  type="number"
                  step="0.01"
                  value={stripePerTransaction}
                  onChange={(e) => setStripePerTransaction(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
                <p className="text-xs text-text-secondary mt-1">12 txn/user/yr</p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">OpenRouter AI: ${openRouterPerUserYearly.toFixed(2)}/user/yr</label>
                <input
                  type="number"
                  step="0.01"
                  value={openRouterPerUserYearly}
                  onChange={(e) => setOpenRouterPerUserYearly(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Gemini Flash AI: ${geminiFlashPerUserYearly.toFixed(2)}/user/yr</label>
                <input
                  type="number"
                  step="0.01"
                  value={geminiFlashPerUserYearly}
                  onChange={(e) => setGeminiFlashPerUserYearly(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-xs font-bold text-text-secondary">Total Hard Costs</p>
                <p className="text-lg font-black text-solar-surge-orange">${Math.round(totalHardCosts).toLocaleString()}/yr</p>
              </div>
            </div>
          </div>
        </LiquidGlass>

        {/* Results */}
        <LiquidGlass variant="blue" className="p-8">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-neon-cortex-blue" />
            Profitability Analysis
          </h2>

          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-text-secondary mb-1">Annual Revenue</p>
              <p className="text-2xl font-black text-neon-cortex-blue">${Math.round(grossRevenue).toLocaleString()}</p>
              <p className="text-xs text-text-secondary mt-1">{numUsers} users × ${discountedPrice.toFixed(2)}/mo × 12</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-text-secondary mb-1">Partner Payout</p>
              <p className="text-2xl font-black text-red-400">-${Math.round(partnerPayout).toLocaleString()}</p>
              <p className="text-xs text-text-secondary mt-1">{partnerCommission}% of revenue</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-text-secondary mb-1">Variable Costs</p>
              <p className="text-2xl font-black text-red-400">-${Math.round(costPerSeat * numUsers * 12).toLocaleString()}</p>
              <p className="text-xs text-text-secondary mt-1">{numUsers} users × ${costPerSeat}/mo × 12</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-text-secondary mb-1">Hard Costs</p>
              <p className="text-2xl font-black text-red-400">-${Math.round(totalHardCosts).toLocaleString()}</p>
              <p className="text-xs text-text-secondary mt-1">Fixed + Per User + Txns</p>
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-neon-cortex-green/20 to-solar-surge-orange/20 rounded-lg border border-neon-cortex-green/30 mb-6">
            <p className="text-xs text-text-secondary mb-1">Net Profit (Annual)</p>
            <p className={`text-4xl font-black ${netProfit >= 0 ? 'text-neon-cortex-green' : 'text-red-400'}`}>
              ${Math.round(netProfit).toLocaleString()}
            </p>
            <p className="text-xs text-text-secondary mt-1">{profitMargin.toFixed(1)}% margin</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Profit per User</p>
              <p className={`text-xl font-black ${profitPerUser >= 0 ? 'text-neon-cortex-green' : 'text-red-400'}`}>
                ${Math.round(profitPerUser)}/user
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
              <strong>Formula:</strong> Annual Revenue ({numUsers} users × ${discountedPrice.toFixed(2)}/mo × 12) - Partner Commission ({partnerCommission}%) - Variable Costs ({numUsers} users × ${costPerSeat}/mo × 12) - Hard Costs (${Math.round(totalHardCosts).toLocaleString()}) = Net Profit
            </p>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}
