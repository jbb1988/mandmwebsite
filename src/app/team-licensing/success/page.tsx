'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Copy, Mail, ArrowRight, Shield, Users } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [copiedCoach, setCopiedCoach] = useState(false);
  const [copiedTeam, setCopiedTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coachCode, setCoachCode] = useState<string>('');
  const [teamCode, setTeamCode] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [seatCount, setSeatCount] = useState<number>(0);
  const [lockedInRate, setLockedInRate] = useState<number>(0);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    // Fetch session details from Stripe
    fetch(`/api/checkout-success?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setCoachCode(data.coachCode || '');
        setTeamCode(data.teamCode || '');
        setEmail(data.email || '');
        setSeatCount(data.seatCount || 0);
        setLockedInRate(data.lockedInRate || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching session:', err);
        setLoading(false);
      });
  }, [sessionId]);

  const copyCoachCode = () => {
    navigator.clipboard.writeText(coachCode);
    setCopiedCoach(true);
    setTimeout(() => setCopiedCoach(false), 2000);
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(teamCode);
    setCopiedTeam(true);
    setTimeout(() => setCopiedTeam(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solar-surge-orange mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your team details...</p>
        </div>
      </div>
    );
  }

  if (!sessionId || !teamCode) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black mb-4">Session Not Found</h1>
          <p className="text-text-secondary mb-8">
            We couldn't find your purchase details. Please check your email for your team code.
          </p>
          <Link
            href="/team-licensing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 border border-neon-cortex-blue/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10 hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50"
          >
            Back to Team Licensing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-8 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-neon-cortex-green drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                <span className="text-xl md:text-2xl font-bold">PURCHASE COMPLETE</span>
              </div>
            </LiquidGlass>
          </div>
          <GradientTextReveal
            text="Welcome to Mind & Muscle Premium!"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-relaxed"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed">
            Your team license is now active
          </p>
        </div>

        {/* Two-Code System - COACH and TEAM Codes */}
        <div className="space-y-6 mb-6">
          {/* COACH CODE - Use First */}
          <div className="bg-green-50/5 border-2 border-neon-cortex-green/40 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-neon-cortex-green/20 rounded-full flex items-center justify-center text-neon-cortex-green font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-neon-cortex-green mb-2">
                  ① YOUR COACH CODE (Use First!)
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Redeem this code in the app to claim your team and activate Premium features. This is <span className="font-semibold text-white">single-use</span> and just for you.
                </p>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 p-4 bg-space-black/50 border-2 border-dashed border-neon-cortex-green/50 rounded-lg">
                    <div className="text-xl md:text-2xl font-black text-neon-cortex-green text-center tracking-wider font-mono">
                      {coachCode}
                    </div>
                  </div>
                  <button
                    onClick={copyCoachCode}
                    className="px-6 py-3 rounded-lg font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 border border-neon-cortex-green/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-green/10 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:border-neon-cortex-green/50 flex items-center justify-center gap-2"
                  >
                    {copiedCoach ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 p-3 bg-neon-cortex-green/10 border border-neon-cortex-green/30 rounded-lg">
                  <p className="text-xs text-neon-cortex-green font-semibold">
                    ✓ Creates your team (or upgrades existing team to Premium)
                  </p>
                  <p className="text-xs text-neon-cortex-green font-semibold">
                    ✓ Makes you the team owner with full management access
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TEAM CODE - Share with Team */}
          <div className="bg-blue-50/5 border-2 border-neon-cortex-blue/40 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-neon-cortex-blue/20 rounded-full flex items-center justify-center text-neon-cortex-blue font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-neon-cortex-blue mb-2">
                  ② TEAM MEMBER CODE (Share with Team)
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Share this code with your {seatCount} athlete{seatCount === 1 ? '' : 's'} and coaches. Parents can also use this code to join for FREE monitoring access!
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
                  <div className="flex-1 p-4 bg-space-black/50 border-2 border-dashed border-neon-cortex-blue/50 rounded-lg">
                    <div className="text-xl md:text-2xl font-black text-neon-cortex-blue text-center tracking-wider font-mono">
                      {teamCode}
                    </div>
                  </div>
                  <button
                    onClick={copyTeamCode}
                    className="px-6 py-3 rounded-lg font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 border border-neon-cortex-blue/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10 hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50 flex items-center justify-center gap-2"
                  >
                    {copiedTeam ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Parent Info Highlight */}
                <div className="mb-3 p-3 bg-neon-cortex-green/15 border-2 border-neon-cortex-green/40 rounded-lg">
                  <p className="text-sm text-neon-cortex-green font-bold text-center mb-1">
                    💚 Parents Join FREE - No License Seat Required!
                  </p>
                  <p className="text-xs text-gray-300 text-center">
                    When parents register using this code, they get read-only monitoring access without consuming any of your {seatCount} paid seat{seatCount === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="p-3 bg-neon-cortex-blue/10 border border-neon-cortex-blue/30 rounded-lg space-y-1">
                  <p className="text-xs text-neon-cortex-blue font-semibold">
                    ✓ Athletes/Coaches: Premium access (uses 1 seat each)
                  </p>
                  <p className="text-xs text-neon-cortex-green font-semibold">
                    ✓ Parents: Unlimited FREE read-only access (no seat used!)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="p-4 bg-neon-cortex-green/10 border border-neon-cortex-green/30 rounded-lg flex items-start gap-3">
            <Mail className="w-5 h-5 text-neon-cortex-green flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-neon-cortex-green font-semibold mb-1">Email Confirmation Sent</p>
              <p className="text-text-secondary">
                We've sent both codes and complete instructions to <span className="font-semibold">{email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <LiquidGlass variant="neutral" className="mb-6">
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-6">Next Steps</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold mb-1">Download the App</h4>
                  <p className="text-text-secondary text-sm mb-3">
                    Have your team members download Mind & Muscle from the App Store or Google Play
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href="https://apps.apple.com/app/mind-muscle" target="_blank" rel="noopener noreferrer" className="inline-block">
                      <div className="px-6 py-2 bg-black rounded-lg border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        <span className="font-semibold">App Store</span>
                      </div>
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=com.mindmuscle" target="_blank" rel="noopener noreferrer" className="inline-block">
                      <div className="px-6 py-2 bg-black rounded-lg border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                        </svg>
                        <span className="font-semibold">Google Play</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold mb-1">Enter Team Code</h4>
                  <p className="text-text-secondary text-sm">
                    Team members should go to Settings → Enter Team Code and input: <span className="font-mono font-bold text-neon-cortex-blue">{teamCode}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold mb-1">Start Training</h4>
                  <p className="text-text-secondary text-sm">
                    Premium features are now unlocked! Your team can access AI coaching, advanced analytics, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </LiquidGlass>

        {/* Manage License */}
        <LiquidGlass variant="orange" className="mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-solar-surge-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold">Need More Seats?</h4>
                  <p className="text-sm text-text-secondary">
                    Add seats to your license at your locked-in rate of ${lockedInRate.toFixed(2)}/seat
                  </p>
                </div>
              </div>
              <Link
                href="/team-licensing/manage"
                className="px-6 py-3 rounded-lg font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 border border-solar-surge-orange/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-solar-surge-orange/10 hover:shadow-liquid-glow-orange hover:border-solar-surge-orange/50 flex items-center gap-2 whitespace-nowrap"
              >
                Manage License
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </LiquidGlass>

        {/* Support */}
        <div className="text-center">
          <p className="text-text-secondary mb-4">
            Questions about your team license?
          </p>
          <Link
            href="/support"
            className="text-neon-cortex-blue hover:underline font-semibold"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solar-surge-orange"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
