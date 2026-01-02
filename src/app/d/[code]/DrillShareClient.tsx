'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Smartphone, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { FadeInWhenVisible } from '@/components/animations';

interface DrillData {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  skill_category: string;
  age_range: string;
  owner_name: string | null;
  owner_avatar_url: string | null;
}

interface DrillShareClientProps {
  code: string;
  drill: DrillData | null;
  error: string | null;
}

// Category colors matching the app
const categoryColors: Record<string, { color: string; bg: string; border: string; shadow: string }> = {
  hitting: { color: 'text-solar-surge-orange', bg: 'bg-solar-surge-orange/10', border: 'border-solar-surge-orange/40', shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' },
  pitching: { color: 'text-neon-cortex-blue', bg: 'bg-neon-cortex-blue/10', border: 'border-neon-cortex-blue/40', shadow: 'shadow-[0_0_20px_rgba(14,165,233,0.3)]' },
  fielding: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/40', shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]' },
  catching: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/40', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' },
  speed: { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/40', shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]' },
  strength: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]' },
  mental: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]' },
  warmup: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.3)]' },
  cooldown: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/40', shadow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]' },
  other: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/40', shadow: 'shadow-[0_0_20px_rgba(107,114,128,0.3)]' },
};

// Download buttons component (reusable)
function DownloadButtons({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex gap-3 justify-center ${compact ? '' : 'flex-col sm:flex-row'}`}>
      <Link
        href="https://apps.apple.com/app/mind-muscle-baseball/id6737125498"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden"
      >
        <div className={`relative ${compact ? 'px-4 py-2' : 'px-5 py-3'} bg-white/10 hover:bg-white/15 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-2 justify-center hover:scale-105 backdrop-blur-sm`}>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <svg className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-white relative z-10`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <span className={`${compact ? 'text-sm' : 'text-base'} font-bold text-white relative z-10`}>App Store</span>
        </div>
      </Link>

      <Link
        href="https://play.google.com/store/apps/details?id=ai.mindandmuscle.app"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden"
      >
        <div className={`relative ${compact ? 'px-4 py-2' : 'px-5 py-3'} bg-white/10 hover:bg-white/15 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-2 justify-center hover:scale-105 backdrop-blur-sm`}>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <svg className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-white relative z-10`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
          </svg>
          <span className={`${compact ? 'text-sm' : 'text-base'} font-bold text-white relative z-10`}>Google Play</span>
        </div>
      </Link>
    </div>
  );
}

// Star rating component
function StarRating() {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <span className="text-white font-bold">5.0</span>
      <span className="text-gray-400 text-sm">on App Store</span>
    </div>
  );
}

export default function DrillShareClient({ code, drill, error }: DrillShareClientProps) {
  const appLink = `mindmuscle://d/${code}`;
  const [thumbnailError, setThumbnailError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleOpenInApp = () => {
    window.location.href = appLink;
  };

  // Background component (shared between states)
  const Background = () => (
    <div className="fixed inset-0 z-0">
      <picture>
        <source srcSet="/assets/images/baseball_field_dusk.webp" type="image/webp" />
        <Image
          src="/assets/images/baseball_field_dusk.png"
          alt="Baseball Field"
          fill
          className="object-cover"
          priority
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-[#0a0a12]" />
    </div>
  );

  // Error state
  if (error || !drill) {
    return (
      <div className="min-h-screen relative">
        <Background />
        <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <FadeInWhenVisible delay={0} direction="up">
              <div className="backdrop-blur-sm bg-white/[0.02] p-8 rounded-2xl border-2 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <h1
                  className="text-2xl font-black text-white text-center mb-4"
                  style={{ textShadow: '0 0 20px rgba(239,68,68,0.4)' }}
                >
                  {error || 'Drill Not Found'}
                </h1>
                <p className="text-gray-400 text-center mb-8">
                  This share link may have expired or been deactivated.
                </p>

                {/* Download the app instead */}
                <div className="mb-6">
                  <p className="text-center text-gray-400 text-sm mb-4">Get the app to explore The Vault</p>
                  <DownloadButtons />
                </div>

                <StarRating />
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </div>
    );
  }

  const categoryStyle = categoryColors[drill.skill_category.toLowerCase()] || categoryColors.other;

  return (
    <div className="min-h-screen relative">
      <Background />

      <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">

          {/* Main Card */}
          <FadeInWhenVisible delay={0} direction="up">
            <div className={`backdrop-blur-sm bg-white/[0.03] rounded-2xl border-2 ${categoryStyle.border} ${categoryStyle.shadow} overflow-hidden`}>

              {/* Thumbnail/Video */}
              <div className="relative aspect-video bg-black overflow-hidden">
                {drill.thumbnail_url && !thumbnailError ? (
                  <Image
                    src={drill.thumbnail_url}
                    alt={drill.title}
                    fill
                    unoptimized
                    priority
                    onError={() => setThumbnailError(true)}
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 576px"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${categoryStyle.bg}`}>
                    <Play className={`w-16 h-16 ${categoryStyle.color} opacity-60`} />
                  </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>

                {/* Category badge - top right */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${categoryStyle.bg} ${categoryStyle.color} border ${categoryStyle.border} backdrop-blur-sm`}>
                    {drill.skill_category.charAt(0).toUpperCase() + drill.skill_category.slice(1)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Shared from badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-solar-surge-orange/10 text-solar-surge-orange border border-solar-surge-orange/30">
                    Shared from The Vault
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
                    {drill.age_range === 'all' ? 'All Ages' : drill.age_range}
                  </span>
                </div>

                {/* Title */}
                <h1
                  className="text-2xl sm:text-3xl font-black text-white mb-4"
                  style={{ textShadow: '0 0 30px rgba(255,255,255,0.15)' }}
                >
                  {drill.title}
                </h1>

                {/* Description */}
                {drill.description && (
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {drill.description}
                  </p>
                )}

                {/* Instructor */}
                {drill.owner_name && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 mb-6">
                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${categoryStyle.border} flex items-center justify-center ${categoryStyle.bg}`}>
                      {drill.owner_avatar_url && !avatarError ? (
                        <Image
                          src={drill.owner_avatar_url}
                          alt={drill.owner_name}
                          width={48}
                          height={48}
                          unoptimized
                          onError={() => setAvatarError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className={`text-lg font-bold ${categoryStyle.color}`}>
                          {drill.owner_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Instructor</p>
                      <p className="font-bold text-white">{drill.owner_name}</p>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-neon-cortex-blue/10 border border-neon-cortex-blue/30">
                      <span className="text-xs font-bold text-neon-cortex-blue flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Pro
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA Button with Shimmer */}
                <button
                  onClick={handleOpenInApp}
                  className="group relative overflow-hidden shimmer-button w-full py-4 bg-solar-surge-orange rounded-xl font-black text-lg text-white hover:bg-solar-surge-orange/90 transition-all shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] flex items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <Smartphone className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Open in Mind & Muscle</span>
                </button>

                {/* Enhanced Value Proposition */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-solar-surge-orange/10 to-amber-500/5 border border-solar-surge-orange/30 mt-4">
                  <p className="text-center">
                    <span className="text-solar-surge-orange font-bold">The Vault</span>
                    <span className="text-white"> — Professional drills from verified instructors</span>
                  </p>
                  <p className="text-center text-gray-400 text-sm mt-1">Pro subscription unlocks the full library</p>
                </div>

                {/* Download Section */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-center text-gray-400 text-sm mb-4">Don&apos;t have the app?</p>
                  <DownloadButtons compact />
                  <StarRating />
                </div>
              </div>
            </div>
          </FadeInWhenVisible>

        </div>
      </div>
    </div>
  );
}
