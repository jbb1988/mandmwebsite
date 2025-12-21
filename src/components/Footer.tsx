'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Routes that have their own footer
const ROUTES_WITH_CUSTOM_FOOTER = ['/partner/dashboard', '/partner/login', '/partner/email-templates', '/admin'];

export function Footer() {
  const pathname = usePathname();

  // Hide footer on routes that have custom footers
  if (ROUTES_WITH_CUSTOM_FOOTER.some(route => pathname?.startsWith(route))) {
    return null;
  }

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
            href="https://play.google.com/store/apps/details?id=com.exceptionalhabit.mind_and_muscle"
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

        {/* Social Links */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <Link
            href="https://x.com/MindMuscleAI"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on X"
            className="p-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </Link>
          <Link
            href="https://www.facebook.com/profile.php?id=61584791173654"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Facebook"
            className="p-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </Link>
          <Link
            href="https://www.instagram.com/mindandmuscleai/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
            className="p-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </Link>
          {/* Add more social icons here: TikTok, etc. */}
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
