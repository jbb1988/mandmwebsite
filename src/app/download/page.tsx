'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal, FadeInWhenVisible } from '@/components/animations';

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

export default function DownloadPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeInWhenVisible delay={0} direction="up" className="text-center mb-8">
          <GradientTextReveal
            text="Get Mind & Muscle"
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-relaxed"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />

          <p className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
            The complete AI training platform for baseball and softball athletes.
          </p>
        </FadeInWhenVisible>

        {/* App Preview with Logo */}
        <FadeInWhenVisible delay={0.1} direction="up" className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 p-1 shadow-[0_0_60px_rgba(14,165,233,0.3)]">
              <div className="w-full h-full rounded-3xl bg-[#0F1123] flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/images/logo.png"
                  alt="Mind & Muscle Logo"
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-2 -right-2 px-3 py-1 bg-solar-surge-orange rounded-full text-xs font-bold text-white shadow-lg">
              FREE
            </div>
          </div>
        </FadeInWhenVisible>

        {/* Download Buttons */}
        <FadeInWhenVisible delay={0.2} direction="up" className="mb-12">
          <LiquidGlass variant="blue" glow={true} className="p-8">
            <h2 className="text-2xl font-bold mb-2 text-center">Download Now</h2>
            <p className="text-gray-400 text-center mb-6">
              Join thousands of athletes training smarter
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* App Store */}
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

              {/* Google Play */}
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
          </LiquidGlass>
        </FadeInWhenVisible>

        {/* 8 AI Coaches */}
        <FadeInWhenVisible delay={0.3} direction="up" className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black mb-2">
              <span className="text-neon-cortex-blue">8 AI Coaches.</span>{' '}
              <span className="text-solar-surge-orange">One App.</span>
            </h3>
            <p className="text-gray-400">
              Built from zero for baseball and softball. Zero generic content.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {aiCoaches.map((coach, index) => (
              <FadeInWhenVisible key={coach.name} delay={0.1 * index} direction="up">
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

        {/* More Features */}
        <FadeInWhenVisible delay={0.4} direction="up" className="mb-12">
          <LiquidGlass variant="neutral" className="p-6">
            <h3 className="text-xl font-bold text-center mb-6">Plus Everything You Need</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center text-center">
                <Image
                  src="/assets/images/dailyhit.png"
                  alt="Daily Hit"
                  width={48}
                  height={48}
                  className="mb-2 drop-shadow-lg"
                />
                <span className="text-xs font-medium text-gray-300">Daily Hit</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Image
                  src="/assets/images/breathwork.png"
                  alt="Breathwork"
                  width={48}
                  height={48}
                  className="mb-2 drop-shadow-lg"
                />
                <span className="text-xs font-medium text-gray-300">Breathwork</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Image
                  src="/assets/images/arm_builder_icon.png"
                  alt="Arm Builder"
                  width={48}
                  height={48}
                  className="mb-2 drop-shadow-lg"
                />
                <span className="text-xs font-medium text-gray-300">Arm Builder</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Image
                  src="/assets/images/coachs_corner_icon.png"
                  alt="Coach's Corner"
                  width={48}
                  height={48}
                  className="mb-2 drop-shadow-lg"
                />
                <span className="text-xs font-medium text-gray-300">Coach&apos;s Corner</span>
              </div>
            </div>
          </LiquidGlass>
        </FadeInWhenVisible>

        {/* Final CTA */}
        <FadeInWhenVisible delay={0.5} direction="up">
          <div className="text-center">
            <p className="text-xl font-black mb-2">
              <span className="text-neon-cortex-blue">Discipline the Mind.</span>{' '}
              <span className="text-solar-surge-orange">Dominate the Game.</span>
            </p>
            <p className="text-gray-400 mb-6">
              100% Baseball. 100% Softball. Zero Generic Content.
            </p>

            {/* Second download prompt */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="https://apps.apple.com/app/mind-muscle-baseball/id6737125498"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange rounded-xl font-bold text-white shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all hover:scale-105"
              >
                Download Free Now
              </Link>
            </div>
          </div>
        </FadeInWhenVisible>
      </div>
    </div>
  );
}
