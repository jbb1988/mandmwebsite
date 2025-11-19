'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { SocialProofBar } from '@/components/SocialProofBar';
import { GradientTextReveal } from '@/components/animations';
import Link from 'next/link';
import { Check, X, Users, TrendingUp, Award, Sparkles, Calculator, AlertCircle, ChevronDown, Heart, CreditCard, HelpCircle, ArrowRight, Shield } from 'lucide-react';

function TeamLicensingContent() {
  const searchParams = useSearchParams();
  const [seatCount, setSeatCount] = useState(1);
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

    // Production mode: 6-month pricing
    const basePrice = 79; // 6-month price
    const originalPrice = 79; // No "original" price for 6-month
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
    // 1-11 users: no discount (stays at $79)

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
      // Get Tolt referral code from URL parameter OR sessionStorage
      // This allows referrals to work even if user lands on home page first
      let toltReferral = searchParams.get('ref');
      if (!toltReferral && typeof window !== 'undefined') {
        toltReferral = sessionStorage.getItem('tolt_referral_code');
      }

      console.log('Tolt referral code for checkout:', toltReferral);

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
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo Watermark */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
        <Image
          src="/assets/images/logo.png"
          alt=""
          width={1200}
          height={1200}
          className="object-contain"
        />
      </div>

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

        <GradientTextReveal
          text="Unlock Premium for Your Entire Team"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-relaxed"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />

        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed">
          One Premium team license unlocks all 7 AI-powered apps, personalized training, and advanced analytics for your entire team.
        </p>
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
                      onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                      className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={seatCount}
                      onChange={(e) => setSeatCount(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
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
                  min="1"
                  max="200"
                  value={seatCount}
                  onChange={(e) => setSeatCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #F97316 0%, #F97316 ${((seatCount - 1) / (200 - 1)) * 100}%, rgba(255,255,255,0.2) ${((seatCount - 1) / (200 - 1)) * 100}%, rgba(255,255,255,0.2) 100%)`
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
                      <span className="text-xl text-text-secondary">/6 months</span>
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
                      <p className="text-sm text-text-secondary">for {seatCount} users for 6 months</p>
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
                  `Purchase Team License - $${pricing.totalPrice}/6 months`
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
                    Share one code with {seatCount} user{seatCount !== 1 ? 's' : ''}. Athletes and coaches get full Premium access when they join.
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

      {/* Complete Development System - Value Story */}
      <div className="max-w-7xl mx-auto mb-32">
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-6 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-neon-cortex-blue drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
                <span className="text-base md:text-lg font-bold">COMPLETE DEVELOPMENT SYSTEM</span>
              </div>
            </LiquidGlass>
          </div>
          <GradientTextReveal
            text="One Platform. Infinite Possibilities."
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />
          <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
            Stop paying for fragmented solutions. Get everything your athletes need in one intelligent system.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* The Traditional Approach */}
          <LiquidGlass variant="neutral" className="p-8 border-2 border-red-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full" style={{boxShadow: '0 0 12px rgba(239,68,68,0.8)'}} />
              <h3 className="text-2xl md:text-3xl font-black text-red-400">The Traditional Approach</h3>
            </div>

            <p className="text-gray-400 mb-6 text-lg">Piecing together multiple apps creates complexity, not champions:</p>

            <div className="space-y-3 mb-8">
              {[
                { app: 'Team communication platform', cost: '$0-50/mo' },
                { app: 'Mental performance training', cost: '$15-30/mo' },
                { app: 'Video swing analysis', cost: '$20-50/mo' },
                { app: 'Strength & conditioning', cost: '$10-20/mo' },
                { app: 'Nutrition planning', cost: '$15-30/mo' },
                { app: 'Baseball IQ development', cost: '$10-25/mo' },
                { app: 'Goal tracking system', cost: '$5-15/mo' },
              ].map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-400 text-sm">{item.app}</span>
                  </div>
                  <span className="text-red-400 font-semibold text-sm whitespace-nowrap">{item.cost}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-red-500/30 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-semibold text-gray-300">Monthly per athlete:</span>
                <span className="text-3xl font-black text-red-400">$75-220</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-gray-200">Annual per athlete:</span>
                <span className="text-4xl font-black text-red-400">$900-2,640</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-red-400 text-sm">The Hidden Costs:</strong> 7 different logins, 7 learning curves, 7 monthly bills, data that never connects, and athletes who give up because it's too complicated.
              </p>
            </div>
          </LiquidGlass>

          {/* The Mind & Muscle Way */}
          <LiquidGlass variant="blue" glow={true} className="p-8 border-2 border-neon-cortex-blue/50 relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange to-neon-cortex-blue opacity-20 blur-2xl rounded-3xl animate-pulse" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-neon-cortex-blue rounded-full animate-pulse" style={{boxShadow: '0 0 12px rgba(14,165,233,0.8)'}} />
                <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">The Mind & Muscle Way</h3>
              </div>

              <p className="text-gray-200 mb-6 text-lg">One intelligent platform. All development tools. Actually learns.</p>

              <div className="space-y-3 mb-8">
                {[
                  { feature: 'Team communication & events', tag: 'Built-in' },
                  { feature: 'AI mental training coach', tag: 'Adaptive' },
                  { feature: 'Swing Lab video analysis', tag: 'Instant' },
                  { feature: 'Position-specific strength', tag: 'AI-powered' },
                  { feature: 'Performance nutrition', tag: 'Personalized' },
                  { feature: '186 game IQ scenarios', tag: 'Game-ready' },
                  { feature: 'AI goal engineering', tag: 'Coach feedback' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-neon-cortex-blue/10 border border-neon-cortex-blue/30">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-1" style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.8))'}} />
                      <span className="text-white text-sm font-semibold">{item.feature}</span>
                    </div>
                    <span className="text-neon-cortex-blue font-bold text-xs whitespace-nowrap">{item.tag}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-neon-cortex-blue/30 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold text-gray-200">Monthly per athlete:</span>
                  <span className="text-3xl font-black text-solar-surge-orange drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]">$9.92</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-gray-100">Annual per athlete:</span>
                  <span className="text-4xl font-black text-solar-surge-orange drop-shadow-[0_0_24px_rgba(249,115,22,0.6)]">$79</span>
                </div>
                <div className="pt-4 border-t border-neon-cortex-blue/20">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-neon-cortex-green">You Save:</span>
                    <span className="text-3xl font-black text-neon-cortex-green">$780-2,520</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Per athlete, per 6 months</p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-neon-cortex-blue/20 via-solar-surge-orange/10 to-transparent border-2 border-neon-cortex-blue/40">
                <p className="text-xs text-gray-200 leading-relaxed mb-2">
                  <strong className="text-neon-cortex-blue text-sm">The Difference:</strong> One login. One learning AI that connects swing videos, workouts, mental training, and goals. One system that improves with every session.
                </p>
                <p className="text-white font-bold text-sm">
                  This is development. Fully integrated. Baseball-specific.
                </p>
              </div>
            </div>
          </LiquidGlass>
        </div>

        {/* Bottom Value Statement */}
        <div className="mt-12 text-center">
          <LiquidGlass variant="neutral" rounded="2xl" className="p-8 max-w-4xl mx-auto [&>div:first-child]:bg-gradient-to-r [&>div:first-child]:from-neon-cortex-blue/5 [&>div:first-child]:via-solar-surge-orange/5 [&>div:first-child]:to-neon-cortex-blue/5">
            <p className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-300 mb-4 leading-tight">
              Stop paying more for less.
            </p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black">
              <span className="text-white">Get the </span>
              <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">complete development system</span>
              <span className="text-white"> your athletes deserve.</span>
            </p>
          </LiquidGlass>
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
          <GradientTextReveal
            text="Team Up. Level Up. Save Up."
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed">
            Get up to 20% off Premium when your team joins together.
          </p>
          <p className="text-sm text-text-secondary/70 max-w-3xl mx-auto mt-4">
            1-11 users: $79/seat • 12-119 users: 10% off • 120-199 users: 15% off • 200+ users: 20% off
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
                  <div className="text-5xl md:text-6xl font-black text-solar-surge-orange drop-shadow-[0_0_24px_rgba(249,115,22,0.6)]">$79</div>
                  <div className="text-xl md:text-2xl text-text-secondary font-semibold">/6 months</div>
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
                  <span className="text-text-secondary">1-11 seats:</span>
                  <span className="font-bold text-white">$79/seat</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">12-119 seats:</span>
                  <span className="font-bold text-neon-cortex-green">$71.10/seat (10% off)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">120-199 seats:</span>
                  <span className="font-bold text-neon-cortex-green">$67.15/seat (15% off)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">200+ seats:</span>
                  <span className="font-bold text-neon-cortex-green">$63.20/seat (20% off)</span>
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
          <GradientTextReveal
            text="Everything You Need to Know"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed">
            Click any question to expand
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {[
            {
              category: 'Setup',
              icon: Users,
              color: 'blue',
              question: 'Why do I receive two codes?',
              answer: (
                <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
                  <p>
                    You receive <span className="font-semibold text-neon-cortex-green">two separate codes</span> for important security and functionality reasons:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-green-50/5 rounded-lg p-4 border border-neon-cortex-green/20">
                      <p className="mb-2"><span className="font-bold text-neon-cortex-green">🟢 COACH Code (COACH-XXXX-YYYY-ZZZZ)</span></p>
                      <ul className="space-y-1 ml-4 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-neon-cortex-green flex-shrink-0 mt-1" />
                          <span>Single-use, just for you</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-neon-cortex-green flex-shrink-0 mt-1" />
                          <span>Makes you the team owner</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-neon-cortex-green flex-shrink-0 mt-1" />
                          <span>Creates a NEW Premium team automatically</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-neon-cortex-green flex-shrink-0 mt-1" />
                          <span><span className="font-semibold">Use this code FIRST</span> before sharing the TEAM code</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-50/5 rounded-lg p-4 border border-neon-cortex-blue/20">
                      <p className="mb-2"><span className="font-bold text-neon-cortex-blue">🔵 TEAM Code (TEAM-AAAA-BBBB-CCCC)</span></p>
                      <ul className="space-y-1 ml-4 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-neon-cortex-blue flex-shrink-0 mt-1" />
                          <span>Multi-use, for your entire team</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-neon-cortex-blue flex-shrink-0 mt-1" />
                          <span>Athletes and other coaches use this to join</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-neon-cortex-blue flex-shrink-0 mt-1" />
                          <span>Parents use this for free read-only access</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-neon-cortex-blue flex-shrink-0 mt-1" />
                          <span><span className="font-semibold">Share AFTER</span> you've redeemed your COACH code</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              category: 'Setup',
              icon: Shield,
              color: 'green',
              question: 'What if I already created a free team in the app?',
              answer: (
                <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
                  <p className="text-neon-cortex-green font-bold text-base">
                    ✅ No problem! You can own multiple teams.
                  </p>
                  <p>
                    When you redeem your COACH code, it creates a NEW Premium team for the purchased license. Your existing free team stays exactly as it is:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span><span className="font-semibold text-white">Free team remains</span> - Keep coaching your existing team</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span><span className="font-semibold text-white">New Premium team</span> - Created from your purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span><span className="font-semibold text-white">Switch between teams</span> - Easy team selector in the app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span><span className="font-semibold text-white">Separate rosters & chats</span> - Each team is independent</span>
                    </li>
                  </ul>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs">
                      💡 <span className="font-semibold text-white">Perfect for Travel Baseball:</span> Many coaches work with multiple teams (12U, 14U, different organizations). Each COACH code creates a separate team with its own Premium license.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              category: 'Setup',
              icon: Users,
              color: 'orange',
              question: 'Do I need to create a new team after purchasing?',
              answer: (
                <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
                  <p className="text-neon-cortex-green font-bold text-base">
                    ✅ No! The COACH code creates your team automatically.
                  </p>
                  <p>
                    When you redeem your COACH code, the system automatically:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span>Creates a NEW Premium team from your purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span>Makes you the team owner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span>Sets up team chat room</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span>Activates Premium features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                      <span>Allocates your license seats</span>
                    </li>
                  </ul>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 mt-3">
                    <p className="mb-2"><span className="font-semibold text-neon-cortex-blue">What if I already have a free team?</span></p>
                    <p className="text-xs">
                      No problem! Your free team stays as-is, and your COACH code creates a NEW Premium team. You'll own both teams and can easily switch between them in the app. Perfect for coaches managing multiple age groups!
                    </p>
                  </div>
                </div>
              ),
            },
            {
              category: 'Setup',
              icon: HelpCircle,
              color: 'blue',
              question: "What's the difference between COACH and TEAM codes?",
              answer: (
                <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
                  <p>Understanding the difference is important for smooth team setup:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-3 font-bold text-white">Feature</th>
                          <th className="text-left p-3 font-bold text-neon-cortex-green">COACH Code</th>
                          <th className="text-left p-3 font-bold text-neon-cortex-blue">TEAM Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        <tr>
                          <td className="p-3 font-semibold">Who uses it?</td>
                          <td className="p-3">Just you (the coach/purchaser)</td>
                          <td className="p-3">Athletes, other coaches, parents</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">How many times?</td>
                          <td className="p-3 text-solar-surge-orange">Single-use only</td>
                          <td className="p-3 text-neon-cortex-green">Multi-use (up to seat limit)</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">What it does</td>
                          <td className="p-3">Creates NEW Premium team, makes you owner</td>
                          <td className="p-3">Joins members to your team</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">When to use</td>
                          <td className="p-3 text-neon-cortex-green font-bold">FIRST (immediately after purchase)</td>
                          <td className="p-3">AFTER coach has redeemed their code</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Format</td>
                          <td className="p-3"><code className="bg-white/10 px-2 py-1 rounded">COACH-XXXX-YYYY-ZZZZ</code></td>
                          <td className="p-3"><code className="bg-white/10 px-2 py-1 rounded">TEAM-AAAA-BBBB-CCCC</code></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-solar-surge-orange/10 rounded-lg p-3 border border-solar-surge-orange/30">
                    <p className="text-xs">
                      ⚠️ <span className="font-semibold text-solar-surge-orange">Important:</span> You MUST redeem your COACH code before sharing the TEAM code with your team members.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              category: 'Parents',
              icon: Heart,
              color: 'green',
              question: 'Can parents join without using a license seat?',
              answer: (
                <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
                  <p className="text-neon-cortex-green font-bold text-base">
                    ✅ Yes! Parents get FREE access and don't consume any license seats.
                  </p>
                  <p>
                    When a parent uses your TEAM code, they automatically receive:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0 mt-0.5" />
                      <span><span className="font-semibold text-white">Free read-only access</span> to their linked athlete's Goals and Reports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0 mt-0.5" />
                      <span><span className="font-semibold text-white">Full access</span> to all free features (Chatter, Events, Daily Hit)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0 mt-0.5" />
                      <span><span className="font-semibold text-white">Parent Dashboard</span> to monitor their athlete's progress</span>
                    </li>
                  </ul>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs">
                      💡 <span className="font-semibold text-white">Seat Management:</span> Only athletes and coaches with the TEAM code consume Premium license seats. Parents are always free!
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary/70">
                    Example: If you purchase 12 seats, you can have 12 athletes/coaches with full Premium access AND unlimited parents with free read-only access.
                  </p>
                </div>
              ),
            },
            {
              category: 'Troubleshooting',
              icon: AlertCircle,
              color: 'orange',
              question: 'What if I lose my COACH code?',
              answer: (
                <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
                  <p>
                    <span className="font-semibold text-white">First, check your purchase confirmation email</span> - both codes are included there.
                  </p>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="mb-2 font-semibold text-white">If you can't find the email:</p>
                    <ol className="space-y-2 ml-4 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-neon-cortex-blue font-bold">1.</span>
                        <span>Check your spam/junk folder</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-neon-cortex-blue font-bold">2.</span>
                        <span>Search your email for "Mind & Muscle" or "Team License"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-neon-cortex-blue font-bold">3.</span>
                        <span>Contact support at <a href="mailto:support@mindandmuscle.ai" className="text-neon-cortex-blue hover:underline">support@mindandmuscle.ai</a></span>
                      </li>
                    </ol>
                  </div>
                  <div className="bg-neon-cortex-blue/10 rounded-lg p-3 border border-neon-cortex-blue/30">
                    <p className="text-xs">
                      📧 <span className="font-semibold text-neon-cortex-blue">Quick Support:</span> Email us with your purchase email address and we'll send you a new COACH code within 24 hours.
                    </p>
                  </div>
                </div>
              ),
            },
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
                    <span className="font-semibold text-white">Important:</span> The team code only works for the number of seats you purchased. For example, if you have 12 athletes and 2 coaches, you need to purchase 14 seats.
                  </p>
                  <p>
                    <span className="font-semibold text-white">Automatic seat management:</span> During registration, users select their role (Athlete/Coach/Parent). When they enter the team code, the system automatically handles license seats: Athletes and coaches get Premium and consume a seat. Parents get free read-only access and don't consume any seats.
                  </p>
                </div>
              ),
            },
            {
              category: 'Users & Seats',
              icon: Users,
              color: 'blue',
              question: 'What happens when we reach the user limit? Can I add more seats?',
              answer: (
                <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
                  <p>
                    When your team reaches the license limit, new athletes and coaches will be unable to join with Premium access until you purchase additional seats. <span className="text-neon-cortex-green font-semibold">Parents can always join</span> regardless of seat availability—they don't consume license seats (see parent FAQ below for details on parent access). Existing Premium users retain their access.
                  </p>
                  <p>
                    <span className="text-neon-cortex-green font-semibold">Yes, you can add more seats!</span> You can add more seats to your team license at any time through our automated system.
                  </p>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="mb-2"><span className="font-semibold text-neon-cortex-blue">Your rate is locked in:</span> Additional seats are charged at your original discounted rate (10%, 15%, or 20% off), even if regular pricing changes.</p>
                    <p className="mb-2"><span className="font-semibold text-solar-surge-orange">Simple 6-month billing:</span> New seats start their own 6-month subscription from the date you add them.</p>
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
        <div className="max-w-4xl mx-auto mt-12">
          <LiquidGlass variant="neutral" rounded="2xl" className="p-8 text-center [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white/[0.02] [&>div:first-child]:via-transparent [&>div:first-child]:to-transparent">
            <h3 className="text-2xl font-black mb-4">Still have questions?</h3>
            <p className="text-text-secondary mb-6">
              Need help deciding on the right team size or have billing questions? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@mindandmuscle.ai"
                className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange hover:opacity-90 transition-all"
              >
                Email Support
              </a>
              <a
                href="/support"
                className="px-6 py-3 rounded-lg font-semibold border border-white/20 hover:bg-white/5 transition-all"
              >
                View Support Page
              </a>
            </div>
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
