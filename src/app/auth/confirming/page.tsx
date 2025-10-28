'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';

/**
 * Confirming page - Shows loading state during email confirmation
 * This prevents users from seeing a blank white screen during the redirect
 */
export default function ConfirmingPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = React.useState(false);

  useEffect(() => {
    // Show loading animation for at least 1 second for better UX
    const timer = setTimeout(() => {
      setShowSuccess(true);

      // Then redirect to welcome page after another second
      const redirectTimer = setTimeout(() => {
        router.push('/welcome');
      }, 1000);

      return () => clearTimeout(redirectTimer);
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
              <p className="text-lg text-text-secondary">
                {showSuccess
                  ? 'Redirecting you to your welcome page'
                  : 'Please wait a moment while we verify your account'}
              </p>
            </div>

            {/* Loading Progress Bar */}
            {!showSuccess && (
              <div className="mt-8 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-cortex-blue to-mind-primary animate-pulse rounded-full w-2/3" />
              </div>
            )}
          </div>
        </LiquidGlass>

        {/* Subtle hint */}
        <p className="text-center text-sm text-text-secondary mt-6 opacity-60">
          This should only take a few seconds
        </p>
      </div>
    </div>
  );
}
