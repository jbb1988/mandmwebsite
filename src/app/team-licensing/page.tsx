'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LiquidGlass } from '@/components/LiquidGlass';
import { SocialProofBar } from '@/components/SocialProofBar';
import Link from 'next/link';
import { Check, X, Users, TrendingUp, Award, Sparkles, Calculator, AlertCircle, ChevronDown, Heart, CreditCard, HelpCircle, ArrowRight, Shield } from 'lucide-react';

function TeamLicensingContent() {
  const searchParams = useSearchParams();
  const [seatCount, setSeatCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showCanceledMessage, setShowCanceledMessage] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      setShowCanceledMessage(true);
      // Auto-hide after 10 seconds
      setTimeout(() => setShowCanceledMessage(false), 10000);
    }
  }, [searchParams]);

  // Calculate pricing based on seat count
  const calculatePricing = (seats: number, isTestMode: boolean) => {
    if (isTestMode) {
      // Test mode: $1.00 total (not per seat)
      const pricePerSeat = 1.00 / seats;
      return {
        pricePerSeat: pricePerSeat.toFixed(4),
        originalPricePerSeat: pricePerSeat.toFixed(4),
        totalPrice: '1.00',
        originalTotalPrice: '1.00',
        individualTotal: '1.00',
        savings: '0.00',
        discountLabel: 'TEST MODE',
        discountPercent: 0,
      };
    }

    // Production mode
    const basePrice = 119; // Special offer price
    const originalPrice = 149;
    let discount = 0;
    let discountLabel = '';

    if (seats >= 200) {
      discount = 0.20;
      discountLabel = '20% League Discount';
    } else if (seats >= 120) {
      discount = 0.15;
      discountLabel = '15% Organization Discount';
    } else if (seats >= 12) {
      discount = 0.10;
      discountLabel = '10% Team Discount';
    }

    const pricePerSeat = basePrice * (1 - discount);
    const originalPricePerSeat = originalPrice * (1 - discount);
    const totalPrice = pricePerSeat * seats;
    const originalTotalPrice = originalPricePerSeat * seats;
    const individualTotal = basePrice * seats;
    const savings = individualTotal - totalPrice;

    return {
      pricePerSeat: pricePerSeat.toFixed(2),
      originalPricePerSeat: originalPricePerSeat.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      originalTotalPrice: originalTotalPrice.toFixed(2),
      individualTotal: individualTotal.toFixed(2),
      savings: savings.toFixed(2),
      discountLabel,
      discountPercent: Math.round(discount * 100),
    };
  };

  const pricing = calculatePricing(seatCount, testMode);

  const handlePurchase = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Get Tolt referral if exists
      const toltReferral = typeof window !== 'undefined' && (window as any).tolt_referral;

      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seatCount,
          email,
          testMode,
          ...(toltReferral && { toltReferral }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(`Purchase failed: ${error.message || 'Unknown error'}. Please try again or contact support.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Canceled Message */}
      {showCanceledMessage && (
        <div className="max-w-5xl mx-auto mb-8">
          <LiquidGlass variant="orange" rounded="2xl" className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-solar-surge-orange flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold mb-2">Purchase Canceled</h3>
                <p className="text-text-secondary">
                  Your purchase was canceled. No charges were made. When you're ready, you can try again below.
                </p>
              </div>
              <button
                onClick={() => setShowCanceledMessage(false)}
                className="ml-auto flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </LiquidGlass>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <div className="inline-block mb-8">
          <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-6 py-3">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-neon-cortex-blue drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
              <span className="text-base md:text-lg font-bold">TEAM LICENSING</span>
            </div>
          </LiquidGlass>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black mb-6">
          <span className="shimmer-text bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
            Unlock Premium for
            <br />
            Your Entire Team
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
          One Premium team license unlocks all 7 AI-powered apps, personalized training, and advanced analytics for your entire team.
        </p>
      </div>

      {/* Social Proof Section */}
      <div className="max-w-7xl mx-auto mb-16 px-4">
        <div className="text-center mb-8">
          <p className="text-text-secondary text-lg">
            Join Teams Nationwide
          </p>
        </div>
        <SocialProofBar variant="compact" />
      </div>

      {/* Already Have a License? */}
      <div className="max-w-5xl mx-auto mb-12">
        <LiquidGlass variant="blue" className="border-2 border-neon-cortex-blue/40">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-neon-cortex-blue flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Already Have a Team License?</h3>
                  <p className="text-sm text-text-secondary">
                    Add seats, view your team code, or manage your subscription
                  </p>
                </div>
              </div>
              <Link
                href="/team-licensing/manage"
                className="px-6 py-3 bg-gradient-to-r from-neon-cortex-blue to-mind-primary rounded-lg font-semibold hover:shadow-liquid-glow-blue transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
              >
                Manage License
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </LiquidGlass>
      </div>

      {/* Seat Calculator Section */}
      <div className="max-w-5xl mx-auto mb-32">
        {/* Best Value Badge - Above Card */}
        <div className="flex justify-center mb-6">
          <div className="px-6 py-2 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange rounded-full text-sm font-bold shadow-lg">
            🏆 BEST VALUE FOR TEAMS
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-solar-surge-orange/20 bg-gradient-to-br from-solar-surge-orange/10 via-transparent to-transparent p-8 md:p-12 shadow-liquid-glow-orange">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Calculator */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-8 h-8 text-solar-surge-orange" />
                <h2 className="text-3xl font-black">Team Size</h2>
              </div>

              {/* User Count Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold">Number of Users</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSeatCount(Math.max(12, seatCount - 1))}
                      className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="12"
                      max="200"
                      value={seatCount}
                      onChange={(e) => setSeatCount(Math.max(12, Math.min(200, parseInt(e.target.value) || 12)))}
                      className="w-20 h-10 text-center text-2xl font-black bg-white/10 border border-white/20 rounded-lg focus:border-solar-surge-orange focus:outline-none"
                    />
                    <button
                      onClick={() => setSeatCount(Math.min(200, seatCount + 1))}
                      className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="12"
                  max="200"
                  value={seatCount}
                  onChange={(e) => setSeatCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #F97316 0%, #F97316 ${((seatCount - 12) / (200 - 12)) * 100}%, rgba(255,255,255,0.2) ${((seatCount - 12) / (200 - 12)) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />

                <p className="text-xs text-text-secondary mt-2">
                  Athletes and coaches who need Premium access
                  <br />
                  <span className="text-neon-cortex-blue font-semibold">Parents get free read-only access to their athlete's Goals & Reports</span>
                </p>

                {pricing.discountLabel && (
                  <div
                    className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${
                      pricing.discountPercent === 20
                        ? 'bg-gradient-to-r from-solar-surge-orange/30 to-solar-surge-orange/20 border-2 border-solar-surge-orange shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                        : pricing.discountPercent === 15
                        ? 'bg-gradient-to-r from-purple-500/30 to-neon-cortex-blue/30 border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        : 'bg-neon-cortex-blue/30 border-2 border-neon-cortex-blue shadow-[0_0_20px_rgba(14,165,233,0.4)]'
                    }`}
                  >
                    <TrendingUp
                      className={`w-5 h-5 ${
                        pricing.discountPercent === 20
                          ? 'text-solar-surge-orange drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                          : pricing.discountPercent === 15
                          ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                          : 'text-neon-cortex-blue drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]'
                      }`}
                    />
                    <span
                      className={`text-sm font-black ${
                        pricing.discountPercent === 20
                          ? 'text-solar-surge-orange drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                          : pricing.discountPercent === 15
                          ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                          : 'text-neon-cortex-blue drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]'
                      }`}
                    >
                      {pricing.discountLabel} Applied!
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing Breakdown - Cleaner Design */}
              <div className="space-y-6 mb-8">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-semibold">Per User:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-solar-surge-orange drop-shadow-[0_0_24px_rgba(249,115,22,0.6)]">${pricing.pricePerSeat}</span>
                    <span className="text-xl text-text-secondary">/year</span>
                  </div>
                </div>

                {pricing.discountPercent > 0 && (
                  <div className="text-sm text-neon-cortex-green font-semibold">
                    Save {pricing.discountPercent}% with team pricing
                  </div>
                )}

                <div className="h-px bg-white/20"></div>

                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-2xl font-bold">Total:</span>
                    <span className="text-6xl font-black text-solar-surge-orange drop-shadow-[0_0_32px_rgba(249,115,22,0.6)]">${pricing.totalPrice}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">for {seatCount} users/year</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <p className="text-sm text-text-secondary mb-1">
                    vs ${pricing.individualTotal} if each user bought separately
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-neon-cortex-green font-bold">You Save:</span>
                    <span className="text-2xl font-black text-neon-cortex-green">${pricing.savings}</span>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-semibold text-starlight-white mb-2">
                  Email to Receive Your Team Code
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourteam.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-white placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-solar-surge-orange/50 focus:border-solar-surge-orange/50 transition-all"
                />
                <p className="text-sm text-neon-cortex-blue mt-2 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  We'll send your team access code to this email address
                </p>
              </div>

              {/* Test Mode Toggle */}
              <div className="mb-6 p-4 rounded-xl border border-white/10 bg-background-secondary/30">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testMode}
                    onChange={(e) => setTestMode(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-solar-surge-orange focus:ring-2 focus:ring-solar-surge-orange/50"
                  />
                  <div>
                    <span className="text-sm font-medium text-text-primary">Test Mode ($1 total)</span>
                    <p className="text-xs text-text-secondary/70">For testing the checkout flow - only $1.00 total charge</p>
                  </div>
                </label>
                {testMode && (
                  <div className="mt-3 p-3 rounded-lg bg-solar-surge-orange/10 border border-solar-surge-orange/20">
                    <p className="text-xs text-solar-surge-orange font-medium">
                      ⚠️ Test Mode Active: You'll be charged only $1.00 total instead of the full price
                    </p>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={handlePurchase}
                disabled={isLoading || !email}
                className="w-full px-8 py-6 text-2xl font-black text-white bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange rounded-2xl transition-all duration-300 hover:shadow-liquid-glow-orange hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Purchase Team License - $${pricing.totalPrice}/year`
                )}
              </button>
            </div>

            {/* Right: What You Get */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8 text-solar-surge-orange" />
                <h3 className="text-2xl font-black">What's Included</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-neon-cortex-green" />
                    <span className="font-bold text-neon-cortex-green">Reusable Premium Code</span>
                  </div>
                  <p className="text-sm text-text-secondary pl-7 mb-2">
                    Share one code with {seatCount} users (at minimum 12 users). Athletes and coaches get full Premium access when they join.
                  </p>
                  <p className="text-xs text-neon-cortex-blue pl-7 font-semibold">
                    Bonus: Parents get free read-only access to their athlete's Goals & Reports—they don't count toward your user limit!
                  </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-neon-cortex-green" />
                    <span className="font-bold text-neon-cortex-green">All Premium Features Unlocked</span>
                  </div>
                  <p className="text-sm text-text-secondary pl-7">
                    Goals AI coaching, coach feedback, all 7 Premium apps, advanced analytics, and weekly AI reports.
                  </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-neon-cortex-green" />
                    <span className="font-bold text-neon-cortex-green">Coach Dashboard Access</span>
                  </div>
                  <p className="text-sm text-text-secondary pl-7">
                    Track team progress, provide feedback on athlete goals, and access team analytics.
                  </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-neon-cortex-green" />
                    <span className="font-bold text-neon-cortex-green">Priority Support</span>
                  </div>
                  <p className="text-sm text-text-secondary pl-7">
                    Dedicated support team for coaches and team administrators.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-br from-neon-cortex-blue/20 via-neon-cortex-blue/10 to-transparent border-2 border-neon-cortex-blue/50 rounded-2xl shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neon-cortex-blue/20 rounded-xl">
                    <Users className="w-8 h-8 text-neon-cortex-blue" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black text-neon-cortex-blue mb-2">Organizations & Leagues</h4>
                    <p className="text-sm text-text-secondary mb-3">
                      Perfect for baseball leagues, multi-team organizations, school districts, and large clubs with 200+ users
                    </p>
                    <ul className="text-xs text-text-secondary space-y-1 mb-4">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-neon-cortex-blue" />
                        Custom pricing and volume discounts
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-neon-cortex-blue" />
                        Dedicated account manager
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-neon-cortex-blue" />
                        Custom onboarding & training
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-neon-cortex-blue" />
                        Multi-organization management tools
                      </li>
                    </ul>
                    <a
                      href="mailto:leagues@mindandmuscle.ai"
                      className="inline-block px-6 py-2 bg-neon-cortex-blue/20 hover:bg-neon-cortex-blue/30 border border-neon-cortex-blue/40 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105"
                    >
                      Contact League Sales
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Section - Team Licensing Focus */}
      <div className="max-w-7xl mx-auto mb-32">
        <div className="text-center mb-20">
          <div className="inline-block mb-8">
            <LiquidGlass variant="orange" rounded="full" padding="none" glow={true} className="px-6 py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-solar-surge-orange drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
                <span className="text-base md:text-lg font-bold">TEAM SAVINGS</span>
              </div>
            </LiquidGlass>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight">
            Team Up. Level Up.
            <br />
            <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent drop-shadow-[0_0_32px_rgba(14,165,233,0.4)]">
              Save Up.
            </span>
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-text-secondary max-w-4xl mx-auto leading-relaxed font-medium">
            Get up to 20% off Premium when your team joins together.
          </p>
          <p className="text-sm text-text-secondary/70 max-w-3xl mx-auto mt-4">
            12-119 users: 10% off • 120-199 users: 15% off • 200+ users: 20% off
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <LiquidGlass variant="blue" glow={true} className="p-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-4xl md:text-5xl font-black">Free Forever</h3>
              <div className="text-5xl md:text-6xl font-black text-neon-cortex-blue drop-shadow-[0_0_24px_rgba(14,165,233,0.6)]">$0</div>
            </div>
            <p className="text-text-secondary mb-8 text-lg md:text-xl">Perfect for trying the app and staying connected with your team</p>
            <ul className="space-y-4 mb-10">
              {[
                'Chatter: Full team communication',
                'Events: Team scheduling & calendar',
                'Daily Hit: Motivational content',
                'Dugout Talk: Personal journal tracker',
                'Game Lab Level 1: Baseball IQ basics',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-base md:text-lg text-gray-300">
                  <div className="w-2 h-2 bg-neon-cortex-blue rounded-full flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="block w-full px-12 py-5 text-lg font-semibold font-poppins text-center rounded-2xl border border-neon-cortex-blue/30 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10 hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50"
            >
              Download Free
            </a>
          </LiquidGlass>

          {/* Premium */}
          <div className="relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
              <LiquidGlass variant="orange" rounded="full" padding="none" glow={true} className="px-6 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm md:text-base font-bold bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
                    🔥 TEAM DISCOUNTS AVAILABLE
                  </span>
                </div>
              </LiquidGlass>
            </div>
            <LiquidGlass variant="orange" glow={true} className="p-10">
              <div className="flex items-center justify-between mb-6">
              <h3 className="text-4xl md:text-5xl font-black">Premium</h3>
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-2">
                  <div className="text-5xl md:text-6xl font-black text-solar-surge-orange drop-shadow-[0_0_24px_rgba(249,115,22,0.6)]">$119</div>
                  <div className="text-xl md:text-2xl text-text-secondary font-semibold">/year</div>
                </div>
                <div className="text-sm text-text-secondary mt-1">Individual License</div>
              </div>
            </div>

            {/* Team Pricing Callout */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-neon-cortex-blue/20 via-solar-surge-orange/10 to-transparent border-2 border-neon-cortex-blue/40">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-neon-cortex-blue" />
                <span className="font-bold text-neon-cortex-blue">Team Discount Pricing:</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">12-119 seats:</span>
                  <span className="font-bold text-neon-cortex-green">$107.10/seat (10% off)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">120-199 seats:</span>
                  <span className="font-bold text-neon-cortex-green">$101.15/seat (15% off)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">200+ seats:</span>
                  <span className="font-bold text-neon-cortex-green">$95.20/seat (20% off)</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-text-secondary">
                  💡 Use the calculator above to see your team's exact pricing
                </p>
              </div>
            </div>
            <p className="text-text-secondary mb-8 text-lg md:text-xl">Everything free has, plus 10+ AI coaches and unlimited access</p>
            <ul className="space-y-4 mb-10">
              {[
                'Everything in Free',
                'Mind AI Coach: Mental toughness training',
                'Muscle AI Coach: All workouts',
                'Fuel AI: Position-specific nutrition',
                'Goals AI: Personalized roadmaps',
                'Swing Lab: AI video analysis',
                'Game Lab: All levels unlocked',
                'Sound Lab: Customize frequencies for peak mental state',
                'Weekly AI Reports',
                'AI Assistant Coach: Custom drill builder for coaches, parents & athletes',
                'Parent Dashboard (for parents)',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-base md:text-lg text-gray-300">
                  <Check className="w-5 h-5 text-solar-surge-orange flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="/team-licensing"
              className="block w-full px-12 py-5 text-lg font-semibold font-poppins text-center rounded-xl bg-gradient-to-br from-solar-surge-orange/20 to-solar-surge-orange/10 border border-solar-surge-orange/30 backdrop-blur-liquid transition-all duration-300 hover:from-solar-surge-orange/30 hover:to-solar-surge-orange/15 hover:shadow-liquid-glow-orange hover:border-solar-surge-orange/50 hover:scale-105 active:scale-95"
            >
              Upgrade to Premium
            </a>
            <p className="text-sm text-center text-text-secondary mt-4">
              Cancel anytime. 30-day money-back guarantee.
            </p>
            </LiquidGlass>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mb-20">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-6 py-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-neon-cortex-blue drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
                <span className="text-base md:text-lg font-bold">GOT QUESTIONS?</span>
              </div>
            </LiquidGlass>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
              Everything You Need to Know
            </span>
          </h2>
          <p className="text-lg text-text-secondary">Click any question to expand</p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {[
            {
              category: 'Features',
              icon: Sparkles,
              color: 'blue',
              question: 'What features do Premium codes unlock?',
              answer: (
                <p className="text-text-secondary text-sm leading-relaxed">
                  Premium team codes unlock <span className="text-neon-cortex-blue font-semibold">ALL Premium features</span> for your athletes: Goals AI coaching, coach feedback, Mind & Muscle AI coaches, Fuel AI nutrition, Swing Lab video analysis, Sound Lab music library, Game Lab (all levels), weekly AI reports, and advanced analytics.
                </p>
              ),
            },
            {
              category: 'Getting Started',
              icon: Users,
              color: 'orange',
              question: 'How does the team code work?',
              answer: (
                <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
                  <p>
                    After purchase, you'll receive <span className="font-semibold text-white">one team code</span> via email. Share this same code with everyone—athletes, coaches, and parents.
                  </p>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="mb-2"><span className="font-semibold text-neon-cortex-blue">New users:</span> Enter the team code during sign-up to join your team.</p>
                    <p><span className="font-semibold text-solar-surge-orange">Existing users:</span> Go to More → Settings → Teams in the app to enter your code.</p>
                  </div>
                  <p>
                    <span className="font-semibold text-white">Automatic seat management:</span> During registration, users select their role (Athlete/Coach/Parent/Trainer). When they enter the team code, the system automatically handles license seats: Athletes and coaches get Premium and consume a seat. Parents get free read-only access and don't consume any seats.
                  </p>
                </div>
              ),
            },
            {
              category: 'Users & Seats',
              icon: Users,
              color: 'blue',
              question: 'What happens when we reach the user limit?',
              answer: (
                <p className="text-text-secondary text-sm leading-relaxed">
                  When your team reaches the license limit, new athletes and coaches will be unable to join with Premium access until you purchase additional seats. <span className="text-neon-cortex-green font-semibold">Parents can always join</span> regardless of seat availability—they don't consume license seats. You can purchase additional licenses at any time to accommodate your growing team. Existing Premium users retain their access.
                </p>
              ),
            },
            {
              category: 'Billing',
              icon: CreditCard,
              color: 'orange',
              question: 'Do users need individual subscriptions?',
              answer: (
                <p className="text-text-secondary text-sm leading-relaxed">
                  <span className="text-neon-cortex-green font-bold text-base">No!</span> When users join using your Premium team code, they get full Premium access without needing to purchase an individual subscription. The team license covers all Premium features for all your users.
                </p>
              ),
            },
            {
              category: 'Parents',
              icon: Heart,
              color: 'blue',
              question: 'What about parents? Do they need a paid license?',
              answer: (
                <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
                  <p>
                    <span className="font-bold text-neon-cortex-green text-base">No, parents do NOT need a paid license!</span> Parents automatically get:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span>All free features (Chatter, Events, Daily Hit, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span><span className="font-semibold text-white">Read-only access</span> to their athlete's Goals and Weekly Reports (when linked)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span>Access to Parent Dashboard for monitoring athlete progress</span>
                    </li>
                  </ul>
                  <p className="bg-white/5 rounded-lg p-3 border border-white/10">
                    💡 Parents link to their athlete using the team code, but they don't count toward your paid user limit and don't get full Premium features—just visibility into their athlete's progress.
                  </p>
                </div>
              ),
            },
            {
              category: 'Management',
              icon: Users,
              color: 'orange',
              question: 'Can I manage my team from the website or app?',
              answer: (
                <p className="text-text-secondary text-sm leading-relaxed">
                  <span className="text-solar-surge-orange font-semibold">Both!</span> Purchase and manage billing through the website. Day-to-day team management (viewing roster, providing feedback, tracking progress) happens in the mobile app where your users are active.
                </p>
              ),
            },
            {
              category: 'Billing',
              icon: CreditCard,
              color: 'blue',
              question: 'Can I add more seats later?',
              answer: (
                <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
                  <p>
                    <span className="text-neon-cortex-green font-semibold">Yes!</span> You can add more seats to your team license at any time through our automated system.
                  </p>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="mb-2"><span className="font-semibold text-neon-cortex-blue">Your rate is locked in:</span> Additional seats are charged at your original discounted rate (10%, 15%, or 20% off), even if regular pricing changes.</p>
                    <p className="mb-2"><span className="font-semibold text-solar-surge-orange">Simple annual billing:</span> New seats start their own 12-month subscription from the date you add them.</p>
                    <p><span className="font-semibold text-neon-cortex-green">Maximum seats:</span> You can add up to 2x your original purchase (to prevent code sharing). For larger teams, contact support.</p>
                  </div>
                  <Link href="/team-licensing/manage" className="inline-flex items-center gap-2 text-neon-cortex-blue hover:text-neon-cortex-blue/80 transition-colors font-semibold">
                    Manage Your License <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ),
            },
            {
              category: 'Billing',
              icon: CreditCard,
              color: 'orange',
              question: 'What payment methods do you accept?',
              answer: (
                <p className="text-text-secondary text-sm leading-relaxed">
                  We accept all major credit cards and debit cards through our secure payment system powered by Stripe.
                </p>
              ),
            },
            {
              category: 'Billing',
              icon: CreditCard,
              color: 'blue',
              question: 'Can I cancel anytime?',
              answer: (
                <p className="text-text-secondary text-sm leading-relaxed">
                  <span className="text-neon-cortex-green font-semibold">Absolutely.</span> There are no long-term contracts. You can cancel your subscription at any time. All users will retain Premium access until the end of your billing period, then revert to free tier features.
                </p>
              ),
            },
          ].map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openFaqIndex === index;
            const borderColor = faq.color === 'blue' ? 'border-neon-cortex-blue/30' : 'border-solar-surge-orange/30';
            const hoverBorderColor = faq.color === 'blue' ? 'hover:border-neon-cortex-blue/60' : 'hover:border-solar-surge-orange/60';
            const iconColor = faq.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange';
            const badgeBg = faq.color === 'blue' ? 'bg-neon-cortex-blue/10' : 'bg-solar-surge-orange/10';
            const badgeText = faq.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange';

            return (
              <LiquidGlass
                key={index}
                variant="neutral"
                className={`transition-all duration-300 ${borderColor} ${hoverBorderColor} ${isOpen ? 'shadow-lg' : ''}`}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full text-left p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Category Badge */}
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badgeBg} mb-3`}>
                        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                        <span className={`text-xs font-bold ${badgeText}`}>{faq.category}</span>
                      </div>

                      {/* Question */}
                      <h4 className="text-lg font-bold text-white mb-1 pr-8">{faq.question}</h4>
                    </div>

                    {/* Chevron Icon */}
                    <ChevronDown
                      className={`w-6 h-6 ${iconColor} flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {/* Answer - Expandable */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="pt-4 border-t border-white/10">
                      {faq.answer}
                    </div>
                  </div>
                </button>
              </LiquidGlass>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-12 text-center">
          <LiquidGlass variant="blue" glow={true} className="inline-block px-8 py-6">
            <p className="text-lg mb-4">
              <span className="font-bold text-white">Still have questions?</span>
              <br />
              <span className="text-text-secondary">We're here to help!</span>
            </p>
            <a
              href="/support"
              className="inline-block px-8 py-3 rounded-xl font-bold backdrop-blur-md transition-all duration-300 hover:scale-105 border border-neon-cortex-blue/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10 hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50"
            >
              Contact Support
            </a>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
}

export default function TeamLicensingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-text-secondary">Loading...</div></div>}>
      <TeamLicensingContent />
    </Suspense>
  );
}
