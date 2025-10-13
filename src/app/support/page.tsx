'use client';

import React from 'react';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import { Mail, Shield, Video } from 'lucide-react';

export default function SupportPage() {
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

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <GradientTextReveal
          text="Support & Help"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-tight"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed">
          Get help with using the Mind and Muscle app
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Contact & Help Section */}
        <LiquidGlass variant="blue" rounded="2xl" className="p-8 md:p-12 [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white/[0.02] [&>div:first-child]:via-transparent [&>div:first-child]:to-transparent">
          <ContactContent />
        </LiquidGlass>

        {/* Onboarding Videos Section - Placeholder for future content */}
        <LiquidGlass variant="orange" rounded="2xl" className="p-8 md:p-12 [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white/[0.02] [&>div:first-child]:via-transparent [&>div:first-child]:to-transparent">
          <OnboardingVideosContent />
        </LiquidGlass>
      </div>
    </div>
  );
}

function ContactContent() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black mb-4">Contact & Support</h2>
        <p className="text-text-secondary mb-6">
          Need help? Have questions? We're here for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
          <Mail className="w-8 h-8 text-neon-cortex-blue mb-3" />
          <h3 className="text-xl font-bold mb-2">Email Support</h3>
          <p className="text-text-secondary mb-3">Get help via email</p>
          <a
            href="mailto:support@mindandmuscle.ai"
            className="text-solar-surge-orange hover:underline font-semibold"
          >
            support@mindandmuscle.ai
          </a>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
          <Shield className="w-8 h-8 text-neon-cortex-green mb-3" />
          <h3 className="text-xl font-bold mb-2">Privacy Inquiries</h3>
          <p className="text-text-secondary mb-3">Questions about your data</p>
          <a
            href="mailto:privacy@mindandmuscle.ai"
            className="text-solar-surge-orange hover:underline font-semibold"
          >
            privacy@mindandmuscle.ai
          </a>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-solar-surge-orange/10 border border-solar-surge-orange/20">
        <h3 className="text-xl font-bold mb-3">Frequently Asked Questions</h3>
        <p className="text-text-secondary mb-4">
          Find answers to common questions about using Mind & Muscle features, team licensing, progress tracking, and more.
        </p>
        <a
          href="/faq"
          className="inline-block px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange hover:opacity-90 transition-all"
        >
          View Complete FAQ
        </a>
      </div>
    </div>
  );
}

function OnboardingVideosContent() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Video className="w-8 h-8 text-solar-surge-orange" />
          <h2 className="text-3xl font-black">Getting Started Videos</h2>
        </div>
        <p className="text-text-secondary mb-6">
          Watch these quick tutorials to get the most out of Mind and Muscle
        </p>
      </div>

      {/* Placeholder for future video content */}
      <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
        <Video className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
        <p className="text-text-secondary">
          Onboarding videos coming soon! In the meantime, explore the app and reach out to support if you need help.
        </p>
      </div>
    </div>
  );
}
