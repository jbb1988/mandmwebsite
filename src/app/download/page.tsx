'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal, FadeInWhenVisible, StaggerChildren, staggerItemVariants } from '@/components/animations';
import { motion } from 'framer-motion';
import { Check, Zap, MessageCircle, Calendar, Flame, BookOpen, Target, Dumbbell, Wind } from 'lucide-react';

// Pro features - matches the app exactly
const proFeatures = [
  { name: 'The Zone', description: 'Audio mental training', icon: '🧠' },
  { name: 'The Vault', description: 'Pro drill library', icon: '🎯' },
  { name: 'Swing Lab', description: 'AI video analysis', icon: '⚾' },
  { name: 'Game Lab', description: '186 scenarios', icon: '🎮' },
  { name: 'Fuel AI', description: 'Nutrition plans', icon: '🍎' },
  { name: 'Sound Lab', description: 'Mental state', icon: '🎵' },
  { name: 'Pitch Lab', description: 'Pitching analysis', icon: '🥎' },
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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Hero Section */}
        <FadeInWhenVisible delay={0} direction="up" className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full mb-6">
            <span className="text-green-400 font-bold text-sm">FREE DOWNLOAD</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300 text-sm">No credit card required</span>
          </div>

          <GradientTextReveal
            text="Mind & Muscle"
            className="text-5xl sm:text-6xl md:text-7xl font-black mb-4 leading-tight"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.1}
          />

          <p className="text-xl sm:text-2xl text-solar-surge-orange font-bold max-w-2xl mx-auto mb-3">
            Not adapted. Purpose-built for baseball and softball.
          </p>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Every feature, every lesson, every AI insight — made specifically for the diamond.
          </p>
        </FadeInWhenVisible>

        {/* App Logo with Premium Glow */}
        <FadeInWhenVisible delay={0.1} direction="up" className="flex justify-center mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cortex-blue to-solar-surge-orange opacity-30 blur-3xl rounded-full scale-150" />
            <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 p-[2px] shadow-[0_0_60px_rgba(14,165,233,0.3),0_0_60px_rgba(249,115,22,0.2)]">
              <div className="w-full h-full rounded-3xl bg-[#0a0a12] flex items-center justify-center overflow-hidden backdrop-blur-xl">
                <Image
                  src="/assets/images/logo.png"
                  alt="Mind & Muscle Logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </FadeInWhenVisible>

        {/* Download Buttons - Premium Glass */}
        <FadeInWhenVisible delay={0.15} direction="up" className="mb-16">
          <LiquidGlass variant="blue" glow={true} className="p-8 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-2">Download Now</h2>
              <p className="text-gray-400">Join thousands training smarter between practices</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://apps.apple.com/app/mind-muscle-baseball/id6737125498"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 flex items-center gap-3 justify-center hover:scale-105">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Download on the</div>
                    <div className="text-lg font-bold -mt-1">App Store</div>
                  </div>
                </div>
              </Link>

              <Link
                href="https://play.google.com/store/apps/details?id=ai.mindandmuscle.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 flex items-center gap-3 justify-center hover:scale-105">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-gray-400">GET IT ON</div>
                    <div className="text-lg font-bold -mt-1">Google Play</div>
                  </div>
                </div>
              </Link>
            </div>
          </LiquidGlass>
        </FadeInWhenVisible>

        {/* Pro Features - Premium Card */}
        <FadeInWhenVisible delay={0.2} direction="up" className="mb-16">
          <LiquidGlass variant="orange" glow={true} className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-gradient-to-r from-solar-surge-orange to-amber-500 rounded-lg text-sm font-black text-white shadow-lg shadow-orange-500/30">
                PRO
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-white border border-white/20">
                BEST VALUE
              </span>
            </div>

            <h3 className="text-3xl font-black text-white mb-2">All Pro Features</h3>
            <p className="text-solar-surge-orange font-bold text-lg mb-8">
              Not adapted. Purpose-built for baseball and softball.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {proFeatures.map((feature) => (
                <div key={feature.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{feature.name}</div>
                    <div className="text-xs text-gray-400">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-solar-surge-orange/20 to-amber-500/10 border border-solar-surge-orange/30">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-solar-surge-orange" />
                <p className="text-white font-medium">
                  Gets smarter with every session. <span className="text-solar-surge-orange">Your AI learns YOU.</span>
                </p>
              </div>
            </div>
          </LiquidGlass>
        </FadeInWhenVisible>

        {/* Free Features */}
        <FadeInWhenVisible delay={0.25} direction="up" className="mb-16">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 font-bold text-sm mb-4">
              FREE FOREVER
            </span>
            <h3 className="text-2xl font-black text-white">8 Features at $0</h3>
            <p className="text-gray-400 mt-2">Start training today — no subscription required</p>
          </div>

          <StaggerChildren staggerDelay={0.05} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {freeFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <motion.div key={feature.name} variants={staggerItemVariants}>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-green-400" />
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
        <FadeInWhenVisible delay={0.3} direction="up" className="mb-16">
          <LiquidGlass variant="blue" glow={true} className="p-8">
            <h3 className="text-2xl font-black text-white text-center mb-8">
              This Wasn&apos;t Adapted. It Was Purpose-Built.
            </h3>

            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                { text: 'Every drill designed for baseball and softball movements', sub: 'Not adapted from generic fitness — built from zero' },
                { text: '186 real game scenarios in Game Lab', sub: 'Your baseball IQ gets measured and tracked' },
                { text: 'AI learns from every swing, journal entry, and workout', sub: 'Continuously improving with baseball-specific data' },
                { text: 'Mental scenarios pulled from real game situations', sub: 'Not generic "focus and confidence" — real baseball pressure' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center">
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
        <FadeInWhenVisible delay={0.35} direction="up">
          <div className="text-center py-8">
            <p className="text-xl sm:text-2xl text-gray-400 mb-2">
              Every other app tried to be everything to everyone.
            </p>
            <p className="text-2xl sm:text-3xl font-black mb-4">
              <span className="text-white">We became obsessed with </span>
              <span className="text-solar-surge-orange" style={{textShadow: '0 0 20px rgba(249,115,22,0.6)'}}>one thing.</span>
            </p>
            <p className="text-3xl sm:text-4xl font-black text-neon-cortex-blue" style={{textShadow: '0 0 30px rgba(14,165,233,0.8)'}}>
              Baseball & Softball.
            </p>
          </div>
        </FadeInWhenVisible>

      </div>
    </div>
  );
}
