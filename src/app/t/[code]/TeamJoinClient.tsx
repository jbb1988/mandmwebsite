'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, AlertCircle, Star } from 'lucide-react';
import { FadeInWhenVisible } from '@/components/animations';

interface TeamData {
  id: string;
  name: string;
  logo_url: string | null;
  type: string;
  member_count: number;
}

interface TeamJoinClientProps {
  code: string;
  team: TeamData | null;
  error: string | null;
}

// Download buttons component
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

export default function TeamJoinClient({ code, team, error }: TeamJoinClientProps) {
  const appLink = `mindmuscle://t/${code}`;
  const [logoError, setLogoError] = useState(false);

  const handleJoinTeam = () => {
    window.location.href = appLink;
  };

  // Background component
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
  if (error || !team) {
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
                  {error || 'Team Not Found'}
                </h1>
                <p className="text-gray-400 text-center mb-8">
                  This invite link may have expired or been deactivated.
                </p>

                <div className="mb-6">
                  <p className="text-center text-gray-400 text-sm mb-4">Get the app to join a team</p>
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

  const sportType = team.type === 'softball' ? 'Softball' : 'Baseball';
  const memberText = team.member_count === 1 ? '1 member' : `${team.member_count} members`;

  return (
    <div className="min-h-screen relative">
      <Background />

      <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">

          {/* Main Card */}
          <FadeInWhenVisible delay={0} direction="up">
            <div className="backdrop-blur-sm bg-white/[0.03] rounded-2xl border-2 border-neon-cortex-blue/40 shadow-[0_0_30px_rgba(14,165,233,0.3)] overflow-hidden">

              {/* Team Logo Section */}
              <div className="pt-10 pb-6 px-6 flex flex-col items-center">
                {/* Logo */}
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-neon-cortex-blue/50 shadow-[0_0_40px_rgba(14,165,233,0.4)] bg-white/5 flex items-center justify-center mb-6">
                  {team.logo_url && !logoError ? (
                    <Image
                      src={team.logo_url}
                      alt={team.name}
                      width={112}
                      height={112}
                      unoptimized
                      onError={() => setLogoError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black text-neon-cortex-blue">
                      {team.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Team Name */}
                <h1
                  className="text-3xl sm:text-4xl font-black text-white text-center mb-4"
                  style={{ textShadow: '0 0 30px rgba(255,255,255,0.15)' }}
                >
                  {team.name}
                </h1>

                {/* Stats Row */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Users className="w-4 h-4 text-neon-cortex-blue" />
                    <span className="text-white font-medium">{memberText}</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-neon-cortex-blue/10 border border-neon-cortex-blue/30">
                    <span className="text-neon-cortex-blue font-bold text-sm">{sportType}</span>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="p-6 border-t border-white/10">
                {/* Join Button */}
                <button
                  onClick={handleJoinTeam}
                  className="group relative overflow-hidden shimmer-button w-full py-4 bg-neon-cortex-blue rounded-xl font-black text-lg text-white hover:bg-neon-cortex-blue/90 transition-all shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_40px_rgba(14,165,233,0.6)] flex items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <span className="relative z-10">Join Team</span>
                </button>

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
