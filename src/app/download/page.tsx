'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal, FadeInWhenVisible } from '@/components/animations';
import { Check } from 'lucide-react';

const aiCoaches = [
  {
    name: 'Mind AI',
    description: 'Mental toughness & confidence',
    icon: '/assets/images/Mind AI Coach.png',
    gradient: 'from-neon-cortex-blue/30 to-mind-primary/30',
  },
  {
    name: 'Muscle AI',
    description: 'Position-specific strength',
    icon: '/assets/images/Muscle AI Coach Icon.png',
    gradient: 'from-solar-surge-orange/30 to-muscle-primary/30',
  },
  {
    name: 'Swing Lab',
    description: 'AI video analysis',
    icon: '/assets/images/Swing Lab.png',
    gradient: 'from-green-500/30 to-emerald-500/30',
  },
  {
    name: 'Game Lab',
    description: '186 real game scenarios',
    icon: '/assets/images/game-lab.png',
    gradient: 'from-purple-500/30 to-violet-500/30',
  },
  {
    name: 'Fuel AI',
    description: 'Personalized nutrition',
    icon: '/assets/images/fuel_ai.png',
    gradient: 'from-yellow-500/30 to-amber-500/30',
  },
  {
    name: 'Plate IQ',
    description: 'Pitch recognition training',
    icon: '/assets/images/plate_iq_icon.png',
    gradient: 'from-red-500/30 to-orange-500/30',
  },
  {
    name: 'Pitch Lab',
    description: 'Pitching mechanics analysis',
    icon: '/assets/images/pitch_lab_icon.png',
    gradient: 'from-cyan-500/30 to-sky-500/30',
  },
  {
    name: 'Speed Lab',
    description: 'Sprint & agility training',
    icon: '/assets/images/speed_lab_icon.png',
    gradient: 'from-pink-500/30 to-rose-500/30',
  },
];

const freeFeatures = [
  { name: 'Daily Hit', icon: '/assets/images/dailyhit.png', description: 'Mental reps every morning' },
  { name: 'Game Lab Level 1', icon: '/assets/images/game-lab.png', description: 'Test your baseball IQ' },
  { name: 'Arm Builder', icon: '/assets/images/arm_builder_icon.png', description: 'Arm health & velocity' },
  { name: 'Speed Lab', icon: '/assets/images/speed_lab_icon.png', description: 'Sprint & agility drills' },
  { name: 'Breathwork', icon: '/assets/images/breathwork.png', description: 'Pre-game focus routines' },
  { name: "Coach's Corner", icon: '/assets/images/coachs_corner_icon.png', description: 'Expert coaching tips' },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <FadeInWhenVisible delay={0} direction="up" className="text-center mb-8">
          <GradientTextReveal
            text="Get Mind & Muscle"
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-relaxed"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />

          <p className="text-xl sm:text-2xl text-white font-black max-w-2xl mx-auto leading-relaxed mb-4">
            Every feature, every lesson, every AI insight — made specifically for baseball and softball.
          </p>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            No generic content. No borrowed frameworks. Just pure diamond sport training.
          </p>
        </FadeInWhenVisible>

        {/* App Logo with Glow */}
        <FadeInWhenVisible delay={0.1} direction="up" className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-neon-cortex-blue/30 to-solar-surge-orange/30 p-1 shadow-[0_0_80px_rgba(14,165,233,0.4)]">
              <div className="w-full h-full rounded-3xl bg-[#0F1123] flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/images/logo.png"
                  alt="Mind & Muscle Logo"
                  width={110}
                  height={110}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-sm font-black text-white shadow-lg shadow-green-500/30">
              FREE
            </div>
          </div>
        </FadeInWhenVisible>

        {/* Download CTA */}
        <FadeInWhenVisible delay={0.2} direction="up" className="mb-12">
          <LiquidGlass variant="blue" glow={true} className="p-8">
            <h2 className="text-2xl font-black mb-2 text-center">Download Now — It&apos;s Free</h2>
            <p className="text-gray-400 text-center mb-6">
              Join thousands of athletes who train smarter between practices and games.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="https://apps.apple.com/app/mind-muscle-baseball/id6737125498"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <Image
                  src="/assets/images/app-store-badge.svg"
                  alt="Download on the App Store"
                  width={180}
                  height={60}
                  className="h-14 w-auto"
                />
              </Link>

              <Link
                href="https://play.google.com/store/apps/details?id=ai.mindandmuscle.app"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <Image
                  src="/assets/images/google-play-badge.png"
                  alt="Get it on Google Play"
                  width={180}
                  height={60}
                  className="h-14 w-auto"
                />
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500">
              Available on iOS and Android. No credit card required.
            </p>
          </LiquidGlass>
        </FadeInWhenVisible>

        {/* 8 AI Coaches */}
        <FadeInWhenVisible delay={0.3} direction="up" className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black mb-3">
              <span className="text-neon-cortex-blue">8 AI Coaches.</span>{' '}
              <span className="text-solar-surge-orange">One App.</span>
            </h3>
            <p className="text-gray-300 text-lg">
              Every AI model trained exclusively on baseball and softball content.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {aiCoaches.map((coach, index) => (
              <FadeInWhenVisible key={coach.name} delay={0.05 * index} direction="up">
                <div className="group relative">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${coach.gradient} border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-3 relative">
                        <Image
                          src={coach.icon}
                          alt={coach.name}
                          width={64}
                          height={64}
                          className="object-contain drop-shadow-lg"
                        />
                      </div>
                      <h4 className="font-bold text-sm text-white mb-1">{coach.name}</h4>
                      <p className="text-xs text-gray-400 leading-tight">{coach.description}</p>
                    </div>
                  </div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </FadeInWhenVisible>

        {/* Free Features */}
        <FadeInWhenVisible delay={0.4} direction="up" className="mb-12">
          <LiquidGlass variant="neutral" className="p-8">
            <h3 className="text-2xl font-black text-center mb-2">
              <span className="text-green-400">FREE</span> Features Included
            </h3>
            <p className="text-gray-400 text-center mb-8">
              Start training today — no subscription required
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {freeFeatures.map((feature) => (
                <div key={feature.name} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 mb-3 relative">
                    <Image
                      src={feature.icon}
                      alt={feature.name}
                      width={56}
                      height={56}
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                  <span className="text-sm font-bold text-white mb-1">{feature.name}</span>
                  <span className="text-xs text-gray-400">{feature.description}</span>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </FadeInWhenVisible>

        {/* Why Mind & Muscle */}
        <FadeInWhenVisible delay={0.5} direction="up" className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-white mb-4">
              This Wasn&apos;t Adapted. It Was Purpose-Built.
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-neon-cortex-blue" />
              </div>
              <div>
                <p className="font-bold text-white">Every drill designed for baseball and softball movements</p>
                <p className="text-sm text-gray-400">Not adapted from generic fitness — built from zero</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-solar-surge-orange/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-solar-surge-orange" />
              </div>
              <div>
                <p className="font-bold text-white">186 real game scenarios in Game Lab</p>
                <p className="text-sm text-gray-400">Your baseball IQ gets measured and tracked</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-bold text-white">AI learns from every swing, journal entry, and workout</p>
                <p className="text-sm text-gray-400">Continuously improving with baseball-specific data</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-bold text-white">Mental scenarios pulled from real game situations</p>
                <p className="text-sm text-gray-400">Not generic &quot;focus and confidence&quot; — real baseball pressure</p>
              </div>
            </div>
          </div>
        </FadeInWhenVisible>

        {/* Final CTA */}
        <FadeInWhenVisible delay={0.6} direction="up">
          <div className="text-center py-8 border-t border-white/10">
            <p className="text-2xl sm:text-3xl font-medium text-gray-300 mb-2">
              Every other app tried to be everything to everyone.
            </p>
            <p className="text-3xl sm:text-4xl font-black mb-6">
              <span className="text-white">We became obsessed with </span>
              <span className="text-solar-surge-orange" style={{textShadow: '0 0 20px rgba(249,115,22,0.6)'}}>one thing.</span>
            </p>
            <p className="text-4xl sm:text-5xl font-black text-neon-cortex-blue mb-8" style={{textShadow: '0 0 30px rgba(14,165,233,0.8)'}}>
              Baseball & Softball.
            </p>

            <Link
              href="https://apps.apple.com/app/mind-muscle-baseball/id6737125498"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange rounded-xl font-black text-lg text-white shadow-[0_0_40px_rgba(14,165,233,0.5)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)] transition-all hover:scale-105"
            >
              Download Free Now
            </Link>

            <p className="mt-8 text-lg font-bold">
              <span className="text-neon-cortex-blue">Discipline the Mind.</span>{' '}
              <span className="text-solar-surge-orange">Dominate the Game.</span>
            </p>
          </div>
        </FadeInWhenVisible>
      </div>
    </div>
  );
}
