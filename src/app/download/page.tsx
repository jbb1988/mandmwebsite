'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import { Brain, Dumbbell, Target, Zap, Video, Music, Award } from 'lucide-react';

export default function DownloadPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <GradientTextReveal
            text="Get Mind & Muscle"
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-relaxed"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />

          <p className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
            The complete training platform for baseball and softball athletes. AI coaches for mind, muscle, and game IQ.
          </p>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-12">
          <div className="relative w-32 h-32">
            <Image
              src="/assets/images/logo.png"
              alt="Mind & Muscle Logo"
              width={128}
              height={128}
              className="object-contain"
            />
          </div>
        </div>

        {/* Download Card */}
        <LiquidGlass variant="blue" glow={true} className="mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Download the App</h2>
            <p className="text-text-secondary text-center mb-6">
              Train smarter, recover faster, outthink every play.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* App Store */}
              <Link
                href="https://apps.apple.com/us/app/mind-muscle/id6754098729"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="px-8 py-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-text-secondary">Download on the</div>
                    <div className="text-lg font-semibold -mt-1">App Store</div>
                  </div>
                </div>
              </Link>

              {/* Google Play */}
              <Link
                href="https://play.google.com/store/apps/details?id=com.exceptionalhabit.mind_and_muscle"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="px-8 py-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-3">
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
          </div>
        </LiquidGlass>

        {/* Pro Features Card */}
        <LiquidGlass variant="neutral" className="mb-8">
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6 text-center">
              <span className="text-neon-cortex-blue">7 AI Coaches.</span>{' '}
              <span className="text-solar-surge-orange">Zero Generic Content.</span>
            </h3>
            <p className="text-text-secondary text-center mb-6">
              Built from zero for baseball and softball. Every drill, every lesson, every AI insight.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-neon-cortex-blue/20 to-mind-primary/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-neon-cortex-blue" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Mind AI</h4>
                  <p className="text-text-secondary text-xs">Mental toughness training</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-solar-surge-orange/20 to-muscle-primary/20 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-solar-surge-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Muscle AI</h4>
                  <p className="text-text-secondary text-xs">Position-specific training</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Swing Lab</h4>
                  <p className="text-text-secondary text-xs">AI video analysis</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Game Lab</h4>
                  <p className="text-text-secondary text-xs">186 real game scenarios</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Fuel AI</h4>
                  <p className="text-text-secondary text-xs">Personalized nutrition</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Sound Lab</h4>
                  <p className="text-text-secondary text-xs">Mental state optimization</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-sky-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Goals AI</h4>
                  <p className="text-text-secondary text-xs">Personalized goal tracking</p>
                </div>
              </div>
            </div>
          </div>
        </LiquidGlass>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-lg font-bold">
            <span className="text-neon-cortex-blue">Discipline the Mind.</span>{' '}
            <span className="text-solar-surge-orange">Dominate the Game.</span>
          </p>
          <p className="text-sm text-text-secondary mt-2">
            Built for the Mental and Physical Demands of Baseball and Softball.
          </p>
        </div>
      </div>
    </div>
  );
}
