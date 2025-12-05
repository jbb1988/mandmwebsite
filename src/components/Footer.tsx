'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto text-center">
        {/* Taglines */}
        <div className="mb-8 space-y-3">
          <p className="text-2xl sm:text-3xl font-bold">
            <span className="text-neon-cortex-blue">Discipline the Mind.</span>{' '}
            <span className="text-solar-surge-orange">Dominate the Game.</span>
          </p>
          <p className="text-lg sm:text-xl text-text-secondary">
            Built for the Diamond. Zero Generic Content.
          </p>
        </div>

        {/* App Store Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
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

        {/* Support Links */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/support"
              className="text-text-secondary hover:text-starlight-white transition-colors"
            >
              Support
            </Link>
            <span className="text-text-secondary/30">•</span>
            <Link
              href="/faq"
              className="text-text-secondary hover:text-starlight-white transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/legal#terms"
              className="text-text-secondary hover:text-starlight-white transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-text-secondary/30">•</span>
            <Link
              href="/legal#privacy"
              className="text-text-secondary hover:text-starlight-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-text-secondary/30">•</span>
            <Link
              href="/legal#coppa"
              className="text-text-secondary hover:text-starlight-white transition-colors"
            >
              Parental Consent
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-text-secondary">&copy; 2025 Mind and Muscle Performance. All Rights reserved.</p>
      </div>
    </footer>
  );
}
