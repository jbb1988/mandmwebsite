'use client';

import React from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { Mail, Shield, Video } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-5xl sm:text-7xl font-black mb-6">
          <span className="shimmer-text bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
            Support & Help
          </span>
        </h1>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          Get help with using the Mind and Muscle app
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Contact & Help Section */}
        <LiquidGlass variant="blue" rounded="2xl" className="p-8 md:p-12">
          <ContactContent />
        </LiquidGlass>

        {/* Onboarding Videos Section - Placeholder for future content */}
        <LiquidGlass variant="orange" rounded="2xl" className="p-8 md:p-12">
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
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">How do I set up my account?</h4>
            <p className="text-sm text-text-secondary">
              Download the app, create an account, and follow the onboarding prompts. If you have a team code, you can redeem it in Settings.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">How do I log my training sessions?</h4>
            <p className="text-sm text-text-secondary">
              Navigate to the Muscle tab and select your training type. Follow the guided prompts to log your workout details.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Where can I view my progress?</h4>
            <p className="text-sm text-text-secondary">
              Your progress is tracked in multiple places: Dashboard for daily summaries, Goals section for goal tracking, and Reports for weekly insights.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">How does AI coaching work?</h4>
            <p className="text-sm text-text-secondary">
              Our AI coach analyzes your training data and provides personalized feedback and recommendations to help you improve your performance.
            </p>
          </div>
        </div>
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
