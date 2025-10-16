'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import Image from 'next/image';
import Link from 'next/link';

function EmailConfirmContent() {
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');

  useEffect(() => {
    const confirmEmail = async () => {
      // Check if this is a valid email confirmation link
      if (type !== 'signup' || !accessToken || !refreshToken) {
        setError('Invalid or expired confirmation link.');
        setConfirming(false);
        return;
      }

      try {
        // Confirm the email via API
        const response = await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken,
            refreshToken,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to confirm email');
        }

        setConfirming(false);

        // Redirect to app after 2 seconds
        setTimeout(() => {
          window.location.href = 'mindandmuscle://welcome';
        }, 2000);
      } catch (err: any) {
        setError(err.message || 'Failed to confirm email');
        setConfirming(false);
      }
    };

    confirmEmail();
  }, [accessToken, refreshToken, type]);

  if (confirming) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background-primary via-background-secondary to-space-black">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-6">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-8 py-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cortex-blue"></div>
                <span className="text-xl md:text-2xl font-bold">CONFIRMING EMAIL</span>
              </div>
            </LiquidGlass>
          </div>

          <p className="text-xl text-gray-300">Please wait while we confirm your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background-primary via-background-secondary to-space-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-8 py-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.8)]" />
                  <span className="text-xl md:text-2xl font-bold">CONFIRMATION FAILED</span>
                </div>
              </LiquidGlass>
            </div>

            <GradientTextReveal
              text="Something Went Wrong"
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 leading-relaxed"
              gradientFrom="#EF4444"
              gradientTo="#F97316"
              delay={0.2}
            />

            <p className="text-xl sm:text-2xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12">
              {error}
            </p>

            <LiquidGlass variant="neutral" className="mb-8">
              <div className="p-8 text-left">
                <h3 className="text-xl font-bold mb-6">What You Can Do:</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Try Again</h4>
                      <p className="text-text-secondary text-sm">
                        Request a new confirmation email from the app
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Contact Support</h4>
                      <p className="text-text-secondary text-sm">
                        If the problem persists, email{' '}
                        <a href="mailto:support@mindandmuscle.ai" className="text-neon-cortex-blue hover:underline">
                          support@mindandmuscle.ai
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <a
                    href="mindandmuscle://login"
                    className="text-sm text-neon-cortex-blue hover:text-neon-cortex-blue/80 transition-colors font-semibold"
                  >
                    Back to App →
                  </a>
                </div>
              </div>
            </LiquidGlass>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background-primary via-background-secondary to-space-black">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-8 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-neon-cortex-green drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                <span className="text-xl md:text-2xl font-bold">EMAIL CONFIRMED!</span>
              </div>
            </LiquidGlass>
          </div>

          <GradientTextReveal
            text="Welcome to Mind & Muscle!"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-relaxed"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />

          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-2">
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
              <Link
                href="https://apps.apple.com/app/mind-muscle"
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
                href="https://play.google.com/store/apps/details?id=com.mindandmuscle.app"
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

            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary mb-3">Opening the app automatically...</p>
              <a
                href="mindandmuscle://welcome"
                className="inline-block px-8 py-3 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-xl border border-neon-cortex-blue/30 hover:border-neon-cortex-blue/50 transition-all hover:scale-105 font-semibold"
              >
                Open Mind & Muscle App
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
      </div>
    </div>
  );
}

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background-primary via-background-secondary to-space-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cortex-blue"></div>
      </div>
    }>
      <EmailConfirmContent />
    </Suspense>
  );
}
