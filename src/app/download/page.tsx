'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal, FadeInWhenVisible, StaggerChildren, staggerItemVariants } from '@/components/animations';
import { AppScreenshotCarousel } from '@/components/AppScreenshotCarousel';
import { motion } from 'framer-motion';
import { Check, Zap, MessageCircle, Calendar, Flame, BookOpen, Target, Dumbbell, Wind, Star } from 'lucide-react';

// Pro features - matches the app exactly
const proFeatures = [
  { name: 'The Zone', description: 'Audio mental training', icon: '🧠' },
  { name: 'The Vault', description: 'Pro drill library', icon: '🎯' },
  { name: 'Swing Lab', description: 'AI video analysis', icon: '⚾' },
  { name: 'Game Lab', description: '186 scenarios', icon: '🎮' },
  { name: 'Fuel AI', description: 'Nutrition plans', icon: '🍎' },
  { name: 'Sound Lab', description: 'Mental state', icon: '🎵' },
  { name: 'Pitch Lab', description: 'AI + Arm Health', icon: '🥎' },
  { name: 'Goals AI', description: 'Personalized', icon: '📈' },
  { name: 'AI Assistant', description: 'Custom drills', icon: '🤖' },
];

// Free features
const freeFeatures = [
  { name: 'Chatter', icon: MessageCircle, description: 'Team communication' },
  { name: 'Events', icon: Calendar, description: 'Team scheduling' },
  { name: 'Daily Hit', icon: Flame, description: 'Daily mental reps' },
  { name: 'Dugout Talk', icon: BookOpen, description: 'Performance log' },
  { name: 'Game Lab L1', icon: Target, description: 'Baseball IQ basics' },
  { name: 'Arm Builder', icon: Dumbbell, description: 'Arm care routines' },
  { name: 'Speed Lab', icon: Zap, description: 'Baserunning' },
  { name: 'Breathwork', icon: Wind, description: 'Focus routines' },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen">

      {/* ========== HERO SECTION WITH BACKGROUND IMAGE ========== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image - Same as Homepage */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet="/assets/images/baseball_field_dusk.webp" type="image/webp" />
            <Image
              src="/assets/images/baseball_field_dusk.png"
              alt="Baseball Field at Dusk"
              fill
              className="object-cover object-center"
              priority
              quality={90}
            />
          </picture>
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a12]" />
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue/10 via-transparent to-solar-surge-orange/10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <FadeInWhenVisible delay={0} direction="up">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full mb-6 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-green-400 font-bold text-sm">FREE DOWNLOAD</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300 text-sm">No credit card</span>
                </div>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.1} direction="up">
                <h1
                  className="text-5xl sm:text-6xl lg:text-7xl font-black mb-4 leading-[0.9] tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #fff 50%, #F97316 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 80px rgba(14,165,233,0.5), 0 0 120px rgba(249,115,22,0.3)',
                  }}
                >
                  Mind & Muscle
                </h1>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.15} direction="up">
                <p
                  className="text-xl sm:text-2xl font-bold text-white mb-3"
                  style={{ textShadow: '0 0 40px rgba(249,115,22,0.4)' }}
                >
                  <span className="text-solar-surge-orange">Purpose-built</span> for baseball & softball.
                </p>
                <p className="text-lg text-gray-400 max-w-md mx-auto lg:mx-0 mb-8">
                  The complete training system — mental, physical, video analysis, and team communication.
                </p>
              </FadeInWhenVisible>

              {/* Download Buttons with Shimmer */}
              <FadeInWhenVisible delay={0.2} direction="up">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                  <Link
                    href="https://apps.apple.com/us/app/mind-muscle/id6754098729"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden"
                  >
                    <div className="relative px-6 py-4 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-3 justify-center hover:scale-105 backdrop-blur-sm">
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <svg className="w-8 h-8 text-white relative z-10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <div className="text-left relative z-10">
                        <div className="text-xs text-gray-300">Download on the</div>
                        <div className="text-lg font-bold text-white -mt-1">App Store</div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="https://play.google.com/store/apps/details?id=com.exceptionalhabit.mind_and_muscle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden"
                  >
                    <div className="relative px-6 py-4 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-3 justify-center hover:scale-105 backdrop-blur-sm">
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <svg className="w-8 h-8 text-white relative z-10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                      <div className="text-left relative z-10">
                        <div className="text-xs text-gray-300">GET IT ON</div>
                        <div className="text-lg font-bold text-white -mt-1">Google Play</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </FadeInWhenVisible>

              {/* 5.0 Star Rating Badge */}
              <FadeInWhenVisible delay={0.25} direction="up">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-white font-bold text-lg">5.0</span>
                  <span className="text-gray-400 text-sm">on App Store</span>
                </div>
              </FadeInWhenVisible>
            </div>

            {/* Right: Phone Mockup (screenshot already has phone shell) */}
            <FadeInWhenVisible delay={0.3} direction="left" className="hidden lg:block">
              <div className="relative mx-auto max-w-[320px]">
                {/* Glow Background */}
                <div className="absolute -inset-8 bg-gradient-to-br from-neon-cortex-blue via-purple-500/30 to-solar-surge-orange opacity-40 blur-[80px] rounded-full" />

                {/* Screenshot (already mocked up with phone) */}
                <div className="relative">
                  <Image
                    src="/assets/screenshots/2-portraitAPPLE.png"
                    alt="Mind & Muscle App"
                    width={300}
                    height={650}
                    className="w-full h-auto drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>

      </section>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Value Comparison - "10 Apps or Just One" */}
        <FadeInWhenVisible delay={0} direction="up" className="mb-16 pt-8">
          <div className="p-8 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 backdrop-blur-sm">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 text-center" style={{ textShadow: '0 0 30px rgba(16,185,129,0.4)' }}>
              10 Apps. Or Just One.
            </h2>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-300 mb-6">
              {['Team Chat', 'Video Analysis', 'Drills', 'Mental Training', 'Nutrition', 'Goals', 'Game IQ', 'Arm Care', 'Sound', 'AI Coach'].map((item) => (
                <span key={item} className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                  {item}
                </span>
              ))}
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Buying separately? <span className="line-through text-gray-600">$300+</span> for 6 months</p>
              <p className="text-green-400 font-black text-2xl">
                Mind & Muscle: <span className="text-white">$79</span> — everything integrated
              </p>
              <p className="text-gray-400 text-sm mt-1">That&apos;s $13.17/month — less than ONE hitting lesson</p>
            </div>
          </div>
        </FadeInWhenVisible>

        {/* Pro Features - Premium Card */}
        <FadeInWhenVisible delay={0.1} direction="up" className="mb-16">
          <LiquidGlass variant="orange" glow={true} className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-gradient-to-r from-solar-surge-orange to-amber-500 rounded-lg text-sm font-black text-white shadow-lg shadow-orange-500/30">
                PRO
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-white border border-white/20">
                BEST VALUE
              </span>
            </div>

            <h3
              className="text-3xl sm:text-4xl font-black text-white mb-2"
              style={{ textShadow: '0 0 40px rgba(249,115,22,0.4)' }}
            >
              All Pro Features
            </h3>
            <p className="text-solar-surge-orange font-bold text-lg mb-8">
              Not adapted. Purpose-built for baseball and softball.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {proFeatures.map((feature) => (
                <div
                  key={feature.name}
                  className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-solar-surge-orange/40 hover:bg-white/10 transition-all duration-300"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{feature.icon}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{feature.name}</div>
                    <div className="text-xs text-gray-400">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-solar-surge-orange/20 to-amber-500/10 border border-solar-surge-orange/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-solar-surge-orange/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-solar-surge-orange" />
                </div>
                <p className="text-white font-medium">
                  Gets smarter with every session. <span className="text-solar-surge-orange font-bold">Your AI learns YOU.</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/5 border border-red-500/20 mt-4">
              <p className="text-white font-medium">
                <span className="text-red-400 font-bold">⚠️ 35% of MLB pitchers</span> have had Tommy John surgery.
                Pitch Lab monitors arm health — analysis that costs $200/session at biomechanics labs.
              </p>
            </div>
          </LiquidGlass>
        </FadeInWhenVisible>

        {/* App Screenshot Carousel */}
        <FadeInWhenVisible delay={0.15} direction="up" className="mb-16">
          <div className="text-center mb-8">
            <h3
              className="text-2xl sm:text-3xl font-black text-white mb-2"
              style={{ textShadow: '0 0 30px rgba(14,165,233,0.4)' }}
            >
              See It In Action
            </h3>
            <p className="text-gray-400">Tap any screenshot to view full size</p>
          </div>
          <AppScreenshotCarousel />
        </FadeInWhenVisible>

        {/* Free Features */}
        <FadeInWhenVisible delay={0.2} direction="up" className="mb-16">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 font-bold text-sm mb-4">
              FREE FOREVER
            </span>
            <h3
              className="text-2xl sm:text-3xl font-black text-white"
              style={{ textShadow: '0 0 30px rgba(16,185,129,0.4)' }}
            >
              8 Features at $0
            </h3>
            <p className="text-gray-400 mt-2">Start training today — no subscription required</p>
          </div>

          <StaggerChildren staggerDelay={0.05} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {freeFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <motion.div key={feature.name} variants={staggerItemVariants}>
                  <div className="group p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-green-500/30 hover:bg-white/[0.06] transition-all text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-7 h-7 text-green-400" />
                    </div>
                    <div className="font-bold text-white text-sm mb-1">{feature.name}</div>
                    <div className="text-xs text-gray-500">{feature.description}</div>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>
        </FadeInWhenVisible>

        {/* Why Mind & Muscle - Clean List */}
        <FadeInWhenVisible delay={0.25} direction="up" className="mb-16">
          <LiquidGlass variant="blue" glow={true} className="p-8">
            <h3
              className="text-2xl sm:text-3xl font-black text-white text-center mb-8"
              style={{ textShadow: '0 0 30px rgba(14,165,233,0.4)' }}
            >
              This Wasn&apos;t Adapted. It Was Purpose-Built.
            </h3>

            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                { text: 'Every drill designed for baseball and softball movements', sub: 'Not adapted from generic fitness — built from zero' },
                { text: '186 real game scenarios in Game Lab', sub: 'Your baseball IQ gets measured and tracked' },
                { text: 'AI learns from every swing, journal entry, and workout', sub: 'Continuously improving with baseball-specific data' },
                { text: 'Mental scenarios pulled from real game situations', sub: 'Not generic "focus and confidence" — real baseball pressure' },
              ].map((item, i) => (
                <div key={i} className="group flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Check className="w-5 h-5 text-neon-cortex-blue" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.text}</p>
                    <p className="text-sm text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </FadeInWhenVisible>

        {/* Final Statement */}
        <FadeInWhenVisible delay={0.3} direction="up">
          <div className="text-center py-12">
            <p className="text-xl sm:text-2xl text-gray-400 mb-3">
              Every other app tried to be everything to everyone.
            </p>
            <p className="text-2xl sm:text-3xl font-black mb-4">
              <span className="text-white">We became obsessed with </span>
              <span
                className="text-solar-surge-orange"
                style={{ textShadow: '0 0 30px rgba(249,115,22,0.6)' }}
              >
                one thing.
              </span>
            </p>
            <p
              className="text-4xl sm:text-5xl font-black text-neon-cortex-blue mb-10"
              style={{ textShadow: '0 0 40px rgba(14,165,233,0.8)' }}
            >
              Baseball & Softball.
            </p>

            {/* Final CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://apps.apple.com/us/app/mind-muscle/id6754098729"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden"
              >
                <div className="relative px-8 py-4 bg-gradient-to-r from-neon-cortex-blue to-blue-600 rounded-2xl border border-neon-cortex-blue/50 transition-all duration-300 flex items-center gap-3 justify-center hover:scale-105 shadow-lg shadow-neon-cortex-blue/20">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <svg className="w-7 h-7 text-white relative z-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="text-lg font-bold text-white relative z-10">Download for iOS</span>
                </div>
              </Link>

              <Link
                href="https://play.google.com/store/apps/details?id=com.exceptionalhabit.mind_and_muscle"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden"
              >
                <div className="relative px-8 py-4 bg-gradient-to-r from-solar-surge-orange to-amber-500 rounded-2xl border border-solar-surge-orange/50 transition-all duration-300 flex items-center gap-3 justify-center hover:scale-105 shadow-lg shadow-solar-surge-orange/20">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <svg className="w-7 h-7 text-white relative z-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <span className="text-lg font-bold text-white relative z-10">Download for Android</span>
                </div>
              </Link>
            </div>
          </div>
        </FadeInWhenVisible>

      </div>
    </div>
  );
}
