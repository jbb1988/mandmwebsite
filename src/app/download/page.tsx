'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GradientTextReveal, FadeInWhenVisible } from '@/components/animations';
import { Check, Dumbbell, Target, Gauge, Flame, Wind, Mic, MessageCircle, Calendar, BookOpen } from 'lucide-react';

const aiCoaches = [
  {
    name: 'The Zone',
    description: 'Master the moment',
    icon: '/assets/images/the_zone_icon.png',
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
    icon: '/assets/images/Swing Lab1.png',
    gradient: 'from-green-500/30 to-emerald-500/30',
  },
  {
    name: 'Game Lab',
    description: '186 real game scenarios',
    icon: '/assets/images/game_lab_icon copy.png',
    gradient: 'from-purple-500/30 to-violet-500/30',
  },
  {
    name: 'Fuel AI',
    description: 'Personalized nutrition',
    icon: '/assets/images/Fuel.png',
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
  { name: 'Chatter', icon: MessageCircle, color: 'text-blue-500', description: 'Full team communication' },
  { name: 'Events', icon: Calendar, color: 'text-purple-500', description: 'Team scheduling & calendar' },
  { name: 'Daily Hit', icon: Flame, color: 'text-orange-500', description: 'Mental reps every morning' },
  { name: 'Dugout Talk', icon: BookOpen, color: 'text-indigo-500', description: 'Field notes & performance log' },
  { name: 'Game Lab Level 1', icon: Target, color: 'text-violet-500', description: 'Baseball IQ basics' },
  { name: 'Arm Builder', icon: Dumbbell, color: 'text-red-500', description: 'Arm care & throwing routines' },
  { name: 'Speed Lab', icon: Gauge, color: 'text-pink-500', description: 'Baserunning intelligence' },
  { name: 'Breathwork', icon: Wind, color: 'text-cyan-500', description: 'Pre-game focus routines' },
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
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <h2 className="text-2xl font-black mb-2 text-center">Download Now — It&apos;s Free</h2>
            <p className="text-gray-400 text-center mb-6">
              Join thousands of athletes who train smarter between practices and games.
            </p>

            {/* App Store Buttons - Same as Footer */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="https://apps.apple.com/app/mind-muscle-baseball/id6737125498"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="shimmer-button px-8 py-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-text-secondary">Download on the</div>
                    <div className="text-lg font-semibold -mt-1">App Store</div>
                  </div>
                </div>
              </Link>
              <Link
                href="https://play.google.com/store/apps/details?id=ai.mindandmuscle.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="shimmer-button shimmer-button-delayed px-8 py-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-text-secondary">GET IT ON</div>
                    <div className="text-lg font-semibold -mt-1">Google Play</div>
                  </div>
                </div>
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500">
              Available on iOS and Android. No credit card required.
            </p>
          </div>
        </FadeInWhenVisible>

        {/* 7 AI Coaches + The Zone */}
        <FadeInWhenVisible delay={0.3} direction="up" className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black mb-3">
              <span className="text-neon-cortex-blue">7 AI Coaches + The Zone.</span>{' '}
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
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="text-2xl font-black text-center mb-2">
              <span className="text-green-400">Free Forever</span> — 8 Features at $0
            </h3>
            <p className="text-gray-400 text-center mb-8">
              Start training today — no subscription required
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {freeFeatures.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div key={feature.name} className="flex flex-col items-center text-center">
                    <div className={`w-14 h-14 mb-3 rounded-xl bg-white/5 flex items-center justify-center`}>
                      <IconComponent className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <span className="text-sm font-bold text-white mb-1">{feature.name}</span>
                    <span className="text-xs text-gray-400">{feature.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
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

        {/* Final Statement */}
        <FadeInWhenVisible delay={0.6} direction="up">
          <div className="text-center py-8">
            <p className="text-2xl sm:text-3xl font-medium text-gray-300 mb-2">
              Every other app tried to be everything to everyone.
            </p>
            <p className="text-3xl sm:text-4xl font-black mb-6">
              <span className="text-white">We became obsessed with </span>
              <span className="text-solar-surge-orange" style={{textShadow: '0 0 20px rgba(249,115,22,0.6)'}}>one thing.</span>
            </p>
            <p className="text-4xl sm:text-5xl font-black text-neon-cortex-blue" style={{textShadow: '0 0 30px rgba(14,165,233,0.8)'}}>
              Baseball & Softball.
            </p>
          </div>
        </FadeInWhenVisible>
      </div>
    </div>
  );
}
