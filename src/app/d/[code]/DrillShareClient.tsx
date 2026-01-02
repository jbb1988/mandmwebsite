'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
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

export default function DrillShareClient({ code, drill, error }: DrillShareClientProps) {
  const appLink = `mindmuscle://d/${code}`;

  const handleOpenInApp = () => {
    window.location.href = appLink;
  };

  // Error state
  if (error || !drill) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="backdrop-blur-sm bg-white/[0.02] p-8 rounded-2xl border-2 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-2xl font-black text-white text-center mb-4">
                {error || 'Drill Not Found'}
              </h1>
              <p className="text-gray-400 text-center mb-8">
                This share link may have expired or been deactivated.
              </p>
              <Link
                href="/download"
                className="shimmer-button block w-full py-4 bg-solar-surge-orange/10 border-2 border-solar-surge-orange/40 rounded-xl font-bold text-solar-surge-orange text-center hover:bg-solar-surge-orange/20 hover:border-solar-surge-orange transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              >
                <span className="flex items-center justify-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Get the App
                </span>
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>
    );
  }

  const categoryStyle = categoryColors[drill.skill_category.toLowerCase()] || categoryColors.other;

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">

        {/* Main Card */}
        <FadeInWhenVisible delay={0} direction="up">
          <div className={`backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 ${categoryStyle.border} ${categoryStyle.shadow} overflow-hidden`}>

            {/* Thumbnail/Video */}
            <div className="relative aspect-video bg-black">
              {drill.thumbnail_url ? (
                <Image
                  src={drill.thumbnail_url}
                  alt={drill.title}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${categoryStyle.bg}`}>
                  <Play className={`w-16 h-16 ${categoryStyle.color} opacity-60`} />
                </div>
              )}

              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
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
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-4">
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
                    {drill.owner_avatar_url ? (
                      <Image
                        src={drill.owner_avatar_url}
                        alt={drill.owner_name}
                        width={48}
                        height={48}
                        className="object-cover"
                        unoptimized
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

              {/* CTA Button */}
              <button
                onClick={handleOpenInApp}
                className="shimmer-button w-full py-4 bg-solar-surge-orange rounded-xl font-black text-lg text-white hover:bg-solar-surge-orange/90 transition-all shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] flex items-center justify-center gap-3"
              >
                <Smartphone className="w-6 h-6" />
                Open in Mind & Muscle
              </button>

              {/* Pro note */}
              <p className="text-center text-sm text-gray-500 mt-4">
                Pro subscription required to access The Vault
              </p>
            </div>
          </div>
        </FadeInWhenVisible>

      </div>
    </div>
  );
}
