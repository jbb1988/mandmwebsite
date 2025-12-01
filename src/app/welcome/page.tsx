'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, SkipForward, AlertCircle } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import { createClient } from '@supabase/supabase-js';

export default function WelcomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Extract deep link logic to reusable function
  const openInApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      // iOS deep link
      window.location.href = 'mindmuscle://welcome';
    } else if (isAndroid) {
      // Android intent URL with fallback to stay on welcome page
      window.location.href = 'intent://welcome#Intent;scheme=mindmuscle;package=com.exceptionalhabit.mind_and_muscle;S.browser_fallback_url=https://www.mindandmuscle.ai/welcome;end';
    }
  };

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Skip video for users who prefer reduced motion
      setShowSplash(false);
      setVideoEnded(true);
    }
  }, []);

  // Verify user session
  useEffect(() => {
    async function verifySession() {
      try {
        // Create Supabase client
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error verifying session:', error);
          setSessionError(true);
        } else if (session?.user) {
          // Session verified successfully
          setUserEmail(session.user.email || null);
          console.log('Email confirmation verified for user:', session.user.email);
        } else {
          // No session found - user may have clicked an old link
          console.warn('No session found after email confirmation');
        }
      } catch (error) {
        console.error('Failed to verify session:', error);
        setSessionError(true);
      } finally {
        setSessionLoading(false);
      }
    }

    verifySession();
  }, []);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    // Fade out splash screen
    setTimeout(() => {
      setShowSplash(false);
    }, 300);
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setVideoEnded(true);
    setShowSplash(false);
  };

  return (
    <>
      {/* Video Splash Screen */}
      {showSplash && !videoEnded && (
        <div
          className={`fixed inset-0 z-50 bg-background-primary flex items-center justify-center transition-opacity duration-300 ${
            videoEnded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
          >
            <source src="/assets/videos/splash.mp4" type="video/mp4" />
          </video>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute bottom-8 right-8 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
            aria-label="Skip splash screen"
          >
            <SkipForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-semibold">Skip</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-opacity duration-500 ${videoEnded ? 'opacity-100' : 'opacity-0'}`}>
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-8 py-4">
              <div className="flex items-center gap-3">
                {sessionError ? (
                  <>
                    <AlertCircle className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]" />
                    <span className="text-xl md:text-2xl font-bold">VERIFICATION PENDING</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-8 h-8 text-neon-cortex-green drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                    <span className="text-xl md:text-2xl font-bold">EMAIL CONFIRMED!</span>
                  </>
                )}
              </div>
            </LiquidGlass>
          </div>

          <GradientTextReveal
            text="Welcome to Mind & Muscle!"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-relaxed"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />

          {userEmail ? (
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-2">
              Welcome, <span className="text-neon-cortex-blue font-bold">{userEmail}</span>!<br />
              Your account is ready. Let's get started.
            </p>
          ) : sessionLoading ? (
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-2">
              Verifying your account...
            </p>
          ) : sessionError ? (
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-2">
              Welcome! Download the app to continue.
            </p>
          ) : (
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-2">
              Your account is ready. Let's get started.
            </p>
          )}
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

        {/* Open in App Button (for mobile and tablet) */}
        <div className="lg:hidden mb-8">
          <LiquidGlass variant="blue" glow={true}>
            <div className="p-6">
              <button
                onClick={openInApp}
                className="w-full px-8 py-4 bg-gradient-to-r from-neon-cortex-blue to-mind-primary rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
              >
                Open in Mind & Muscle App
              </button>
              <p className="text-center text-sm text-text-secondary mt-3">
                Already have the app? Tap to open it now
              </p>
            </div>
          </LiquidGlass>
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
      </div>
    </>
  );
}
