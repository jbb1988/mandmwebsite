'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Smartphone, Monitor } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';

/**
 * Confirming page - Shows success state after email confirmation
 * Attempts to open the app on mobile, or shows web welcome page on desktop
 */
export default function ConfirmingPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [appOpened, setAppOpened] = React.useState(false);

  useEffect(() => {
    // Detect if on mobile device
    const userAgent = navigator.userAgent || navigator.vendor;
    const mobile = /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
    setIsMobile(mobile);

    // Show success immediately since email is already confirmed at this point
    const timer = setTimeout(() => {
      setShowSuccess(true);

      if (mobile) {
        // Try to open the app with a deep link
        // Use mindmuscle://login to signal the app that email is confirmed
        const appUrl = 'mindmuscle://email-confirmed';

        // Try to open the app
        window.location.href = appUrl;

        // Set a fallback timeout - if app doesn't open, show instructions
        setTimeout(() => {
          // If we're still here after 2 seconds, app probably didn't open
          setAppOpened(false);
        }, 2000);
      } else {
        // Desktop - redirect to welcome page after delay
        const redirectTimer = setTimeout(() => {
          router.push('/welcome');
        }, 2000);

        return () => clearTimeout(redirectTimer);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background-primary via-background-secondary to-background-primary">
      <div className="max-w-md w-full">
        <LiquidGlass variant="blue" glow={true}>
          <div className="p-12 text-center">
            {/* Animated Icon */}
            <div className="mb-8 flex justify-center">
              {showSuccess ? (
                <div className="animate-bounce">
                  <CheckCircle className="w-20 h-20 text-neon-cortex-green drop-shadow-[0_0_24px_rgba(34,197,94,0.8)]" />
                </div>
              ) : (
                <Loader2 className="w-20 h-20 text-neon-cortex-blue animate-spin drop-shadow-[0_0_24px_rgba(14,165,233,0.8)]" />
              )}
            </div>

            {/* Status Text */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">
                {showSuccess ? 'Email Confirmed!' : 'Confirming Your Email...'}
              </h1>

              {showSuccess ? (
                isMobile ? (
                  <div className="space-y-4">
                    <p className="text-lg text-text-secondary">
                      Your account is ready!
                    </p>
                    <div className="flex items-center justify-center gap-2 text-neon-cortex-blue">
                      <Smartphone className="w-5 h-5" />
                      <span>Opening Mind & Muscle app...</span>
                    </div>
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm text-text-secondary mb-3">
                        App didn&apos;t open? Open the app manually and log in with your email and password.
                      </p>
                      <a
                        href="mindmuscle://login"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-neon-cortex-blue to-mind-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Open App
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg text-text-secondary">
                      Redirecting you to your welcome page...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-text-secondary">
                      <Monitor className="w-5 h-5" />
                      <span>Continue on the web or open the app on your phone</span>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-lg text-text-secondary">
                  Please wait a moment while we verify your account
                </p>
              )}
            </div>

            {/* Loading Progress Bar */}
            {!showSuccess && (
              <div className="mt-8 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-cortex-blue to-mind-primary animate-pulse rounded-full w-2/3" />
              </div>
            )}
          </div>
        </LiquidGlass>

        {/* Download links for mobile users who don't have the app */}
        {showSuccess && isMobile && (
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary mb-3">
              Don&apos;t have the app yet?
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://apps.apple.com/us/app/mind-muscle/id6740032386"
                className="text-neon-cortex-blue hover:underline text-sm"
              >
                App Store
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.exceptionalhabit.mind_and_muscle"
                className="text-neon-cortex-blue hover:underline text-sm"
              >
                Google Play
              </a>
            </div>
          </div>
        )}

        {/* Subtle hint */}
        {!showSuccess && (
          <p className="text-center text-sm text-text-secondary mt-6 opacity-60">
            This should only take a few seconds
          </p>
        )}
      </div>
    </div>
  );
}
