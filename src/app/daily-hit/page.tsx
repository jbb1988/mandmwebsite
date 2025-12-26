'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { Play, Pause, ArrowLeft } from 'lucide-react';
import { FadeInWhenVisible, GradientTextReveal } from '@/components/animations';
import { motion } from 'framer-motion';

interface DailyHit {
  id: string;
  title: string;
  headline: string;
  body: string;
  challenge: string;
  videoUrl: string;
  thumbnailUrl: string;
  tags: string[];
  dayOfYear: number;
}

export default function DailyHitPage() {
  const [dailyHit, setDailyHit] = useState<DailyHit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  useEffect(() => {
    async function fetchDailyHit() {
      try {
        const response = await fetch('/api/daily-hit');
        const data = await response.json();
        if (data.dailyHit) {
          setDailyHit(data.dailyHit);
        }
      } catch (error) {
        console.error('Error fetching daily hit:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDailyHit();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubscribeStatus('loading');
    try {
      const response = await fetch('/api/daily-hit/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.success) {
        setSubscribeStatus('success');
        setSubscribeMessage(data.message);
        setEmail('');
      } else {
        setSubscribeStatus('error');
        setSubscribeMessage(data.error || 'Something went wrong');
      }
    } catch {
      setSubscribeStatus('error');
      setSubscribeMessage('Failed to subscribe. Please try again.');
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F1123]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F1123]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <Link href="/">
              <Image
                src="/assets/images/logo.png"
                alt="Mind & Muscle"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="px-6 py-2 backdrop-blur-sm bg-solar-surge-orange/15 border-2 border-solar-surge-orange/50 rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <span className="text-solar-surge-orange font-black text-sm tracking-widest">
                  🔥 TODAY&apos;S DAILY HIT
                </span>
              </div>
            </div>
            <GradientTextReveal
              text={dailyHit?.title || 'Daily Mental Reps'}
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-relaxed"
              gradientFrom="#F97316"
              gradientTo="#0EA5E9"
              delay={0.2}
            />
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
              2 minutes of mental training to sharpen your focus and build confidence.
            </p>
          </FadeInWhenVisible>

          {/* Video Player */}
          <FadeInWhenVisible delay={0.3} direction="up" className="mb-12">
            <div className="max-w-md mx-auto">
              {isLoading ? (
                <div className="aspect-[9/16] rounded-3xl bg-white/5 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400">Loading...</div>
                </div>
              ) : (
                <div
                  className="relative aspect-[9/16] rounded-3xl overflow-hidden cursor-pointer group
                    border-2 border-solar-surge-orange/40
                    shadow-[0_0_60px_rgba(249,115,22,0.25)]
                    hover:shadow-[0_0_80px_rgba(249,115,22,0.4)]
                    transition-shadow duration-500"
                  onClick={handlePlayPause}
                >
                  <video
                    ref={videoRef}
                    src={dailyHit?.videoUrl || '/assets/videos/daily_hit_example.mp4'}
                    poster={dailyHit?.thumbnailUrl}
                    className="w-full h-full object-cover"
                    playsInline
                    onEnded={() => {
                      setIsPlaying(false);
                      setProgress(0);
                    }}
                    onTimeUpdate={(e) => {
                      const video = e.currentTarget;
                      if (video.duration) {
                        setProgress((video.currentTime / video.duration) * 100);
                      }
                    }}
                  />

                  {/* Play/Pause Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-solar-surge-orange to-solar-surge-orange/80
                      flex items-center justify-center
                      hover:scale-110 transition-all duration-300
                      shadow-[0_0_40px_rgba(249,115,22,0.6)]
                      ${!isPlaying ? 'animate-pulse' : ''}`}>
                      {isPlaying ? (
                        <Pause className="w-12 h-12 text-white" />
                      ) : (
                        <Play className="w-12 h-12 text-white ml-1" />
                      )}
                    </div>
                  </div>

                  {/* Title Badge */}
                  <div className="absolute top-4 left-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg border border-solar-surge-orange/40">
                    <div className="text-xs text-gray-400 mb-1">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <span className="text-sm font-bold text-solar-surge-orange">
                      🔥 {dailyHit?.title || 'Daily Mental Reps'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (videoRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const percentage = clickX / rect.width;
                        videoRef.current.currentTime = percentage * videoRef.current.duration;
                      }
                    }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-solar-surge-orange to-solar-surge-orange/80 transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </FadeInWhenVisible>

          {/* Challenge Section */}
          {dailyHit?.challenge && (
            <FadeInWhenVisible delay={0.4} direction="up" className="mb-12">
              <LiquidGlass variant="orange" glow={true} className="p-6 max-w-lg mx-auto">
                <h3 className="text-lg font-bold text-solar-surge-orange mb-2">🔥 Today&apos;s Challenge</h3>
                <p className="text-gray-300 leading-relaxed">{dailyHit.challenge}</p>
              </LiquidGlass>
            </FadeInWhenVisible>
          )}

          {/* Email Signup */}
          <FadeInWhenVisible delay={0.5} direction="up" className="mb-12">
            <LiquidGlass variant="blue" glow={true} className="p-8 max-w-lg mx-auto text-center">
              <h3 className="text-2xl font-black text-white mb-2">Get the Daily Hit in Your Inbox</h3>
              <p className="text-gray-300 mb-6">
                Start each day with 2 minutes of mental training. Delivered to your inbox every morning.
              </p>

              {subscribeStatus === 'success' ? (
                <div className="p-4 bg-green-500/20 border border-green-500/40 rounded-xl">
                  <p className="text-green-400 font-medium">{subscribeMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-solar-surge-orange/50 transition-colors"
                    required
                  />
                  <LiquidButton
                    type="submit"
                    variant="orange"
                    className="px-6 py-3 font-bold whitespace-nowrap"
                    disabled={subscribeStatus === 'loading'}
                  >
                    {subscribeStatus === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
                  </LiquidButton>
                </form>
              )}

              {subscribeStatus === 'error' && (
                <p className="mt-3 text-red-400 text-sm">{subscribeMessage}</p>
              )}
            </LiquidGlass>
          </FadeInWhenVisible>

          {/* App Download CTA */}
          <FadeInWhenVisible delay={0.6} direction="up">
            <div className="text-center">
              <h3 className="text-2xl font-black text-white mb-4">Want the Full Experience?</h3>
              <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                Track your streaks, get push notifications at 8 AM, and access the full library of mental training content.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://apps.apple.com/app/mind-muscle-baseball/id6737125498"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <Image
                    src="/assets/images/app-store-badge.svg"
                    alt="Download on the App Store"
                    width={140}
                    height={47}
                    className="h-12 w-auto"
                  />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=ai.mindandmuscle.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <Image
                    src="/assets/images/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={140}
                    height={47}
                    className="h-12 w-auto"
                  />
                </a>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-neon-cortex-blue font-bold">Discipline the Mind.</span>{' '}
            <span className="text-solar-surge-orange font-bold">Dominate the Game.</span>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © 2025 Mind & Muscle Performance. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
