'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle, Apple, Smartphone } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';

export default function WelcomePage() {
  useEffect(() => {
    // Try to deep link to the app if installed
    const tryDeepLink = () => {
      // iOS deep link
      window.location.href = 'mindmuscle://welcome';

      // Android deep link fallback
      setTimeout(() => {
        window.location.href = 'intent://welcome#Intent;scheme=mindmuscle;package=com.mindmuscle;end';
      }, 100);
    };

    // Give the page a moment to render before trying deep link
    const timer = setTimeout(tryDeepLink, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-8 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-neon-cortex-green drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                <span className="text-xl md:text-2xl font-bold">EMAIL CONFIRMED!</span>
              </div>
            </LiquidGlass>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
              Welcome to Mind & Muscle!
            </span>
          </h1>

          <p className="text-lg text-text-secondary mb-2">
            Your account is ready. Let's get started.
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

        {/* Download App Card */}
        <LiquidGlass variant="blue" className="mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Download the App</h2>
            <p className="text-text-secondary text-center mb-6">
              Get started with elite baseball training on your mobile device
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* App Store */}
              <a
                href="https://apps.apple.com/app/mind-muscle"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="px-6 py-3 bg-black rounded-lg border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-3">
                  <Apple className="w-7 h-7" />
                  <div className="text-left">
                    <div className="text-xs text-text-secondary">Download on the</div>
                    <div className="text-base font-semibold">App Store</div>
                  </div>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="https://play.google.com/store/apps/details?id=com.mindmuscle"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="px-6 py-3 bg-black rounded-lg border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-3">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-text-secondary">GET IT ON</div>
                    <div className="text-base font-semibold">Google Play</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </LiquidGlass>

        {/* What's Next Card */}
        <LiquidGlass variant="neutral" className="mb-8">
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">What's Next?</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold mb-1">Download the App</h4>
                  <p className="text-text-secondary text-sm">
                    Available on iOS and Android - your elite training awaits
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold mb-1">Log In</h4>
                  <p className="text-text-secondary text-sm">
                    Use the email you just confirmed to sign in
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
                    Access AI coaching, mental training, and elite performance tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </LiquidGlass>

        {/* Taglines Footer */}
        <div className="text-center space-y-3">
          <p className="text-lg font-bold">
            <span className="text-neon-cortex-blue">Discipline the Mind.</span>{' '}
            <span className="text-solar-surge-orange">Dominate the Game.</span>
          </p>
          <p className="text-text-secondary">
            100% Baseball. Zero Generic Content.
          </p>
        </div>
      </div>
    </div>
  );
}
