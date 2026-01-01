'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FadeInWhenVisible } from '@/components/animations';
import { Play, User, AlertCircle, Smartphone, ExternalLink, Star, MessageSquare, Calendar, Activity } from 'lucide-react';

interface AnalysisData {
  id: string;
  summary: string | null;
  overall_rating: string | null;
  thumbnail_urls: string[] | null;
  video_url: string | null;
  coach_note: string | null;
  drill_title: string | null;
  pitch_type: string | null;
  pitch_thrown: string | null;
  arm_health_score: number | null;
  arm_health_zone: string | null;
  created_at: string;
  owner_name: string | null;
  owner_avatar_url: string | null;
}

interface PitchAnalysisClientProps {
  id: string;
  analysis: AnalysisData | null;
  error: string | null;
}

// Arm health zone colors
const armHealthColors: Record<string, { bg: string; text: string; border: string }> = {
  green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

export default function PitchAnalysisClient({ id, analysis, error }: PitchAnalysisClientProps) {
  const [attemptedOpen, setAttemptedOpen] = useState(false);

  const universalLink = `https://mindandmuscle.ai/pitch-lab/analysis/${id}`;

  const handleOpenInApp = () => {
    setAttemptedOpen(true);

    // Try Universal Link first
    window.location.href = universalLink;

    // If app doesn't open after 2s, scroll to download section
    setTimeout(() => {
      const downloadSection = document.getElementById('download-section');
      if (downloadSection) {
        downloadSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 2000);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Error state
  if (error || !analysis) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-2xl font-black text-white mb-4">
                {error || 'Analysis Not Found'}
              </h1>
              <p className="text-gray-400 mb-8">
                This analysis may not be shared or the link is invalid.
              </p>
              <Link
                href="/download"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange rounded-xl font-bold text-white hover:scale-105 transition-transform"
              >
                <Smartphone className="w-5 h-5" />
                Get the App
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>
    );
  }

  const thumbnail = analysis.thumbnail_urls?.[0] || null;
  const armHealthStyle = analysis.arm_health_zone
    ? armHealthColors[analysis.arm_health_zone.toLowerCase()] || armHealthColors.green
    : null;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Analysis Preview Card */}
        <FadeInWhenVisible delay={0} direction="up">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm mb-8">
            {/* Shared badge */}
            <div className="flex justify-center mb-6">
              <div className="px-4 py-1.5 rounded-full bg-neon-cortex-blue/20 border border-neon-cortex-blue/40">
                <span className="text-sm font-bold text-neon-cortex-blue">
                  Shared Pitch Analysis
                </span>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-black/40">
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt="Pitch Analysis"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-cortex-blue/20 to-neon-cortex-blue/5">
                  <Play className="w-16 h-16 text-neon-cortex-blue/60" />
                </div>
              )}
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-4 text-center">
              {analysis.drill_title || (analysis.pitch_thrown
                ? `${analysis.pitch_thrown.charAt(0).toUpperCase() + analysis.pitch_thrown.slice(1)} Analysis`
                : 'Pitch Analysis')}
            </h1>

            {/* Badges Row */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {/* Pitch Type */}
              {analysis.pitch_type && (
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-gray-300 border border-white/20">
                  {analysis.pitch_type.charAt(0).toUpperCase() + analysis.pitch_type.slice(1)}
                </span>
              )}

              {/* Pitch Thrown */}
              {analysis.pitch_thrown && (
                <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-neon-cortex-blue/20 text-neon-cortex-blue border border-neon-cortex-blue/30">
                  {analysis.pitch_thrown.charAt(0).toUpperCase() + analysis.pitch_thrown.slice(1)}
                </span>
              )}

              {/* Rating */}
              {analysis.overall_rating && (
                <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-solar-surge-orange/20 text-solar-surge-orange border border-solar-surge-orange/30 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {analysis.overall_rating}
                </span>
              )}

              {/* Date */}
              <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-gray-300 border border-white/20 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(analysis.created_at)}
              </span>
            </div>

            {/* Arm Health Indicator */}
            {analysis.arm_health_zone && armHealthStyle && (
              <div className={`p-4 rounded-xl ${armHealthStyle.bg} border ${armHealthStyle.border} mb-6`}>
                <div className="flex items-center justify-center gap-3">
                  <Activity className={`w-5 h-5 ${armHealthStyle.text}`} />
                  <div className="text-center">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Arm Health</span>
                    <div className={`font-black text-lg ${armHealthStyle.text}`}>
                      {analysis.arm_health_score !== null ? `${analysis.arm_health_score}/10` : analysis.arm_health_zone.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {analysis.summary && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                  {analysis.summary}
                </p>
              </div>
            )}

            {/* Coach Note */}
            {analysis.coach_note && (
              <div className="p-4 rounded-xl bg-neon-cortex-blue/10 border border-neon-cortex-blue/30 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-neon-cortex-blue" />
                  <span className="text-xs font-bold text-neon-cortex-blue uppercase tracking-wide">Coach Note</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {analysis.coach_note}
                </p>
              </div>
            )}

            {/* Athlete Info */}
            {analysis.owner_name && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cortex-blue/30 to-neon-cortex-blue/10 flex items-center justify-center overflow-hidden">
                  {analysis.owner_avatar_url ? (
                    <Image
                      src={analysis.owner_avatar_url}
                      alt={analysis.owner_name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-neon-cortex-blue" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Athlete</p>
                  <p className="font-bold text-white">{analysis.owner_name}</p>
                </div>
              </div>
            )}
          </div>
        </FadeInWhenVisible>

        {/* Open in App CTA */}
        <FadeInWhenVisible delay={0.1} direction="up">
          <button
            onClick={handleOpenInApp}
            className="w-full py-4 mb-4 bg-gradient-to-r from-neon-cortex-blue to-neon-cortex-blue/80 rounded-2xl font-black text-lg text-white hover:scale-[1.02] transition-transform shadow-lg shadow-neon-cortex-blue/30 flex items-center justify-center gap-3"
          >
            <ExternalLink className="w-5 h-5" />
            View Full Analysis in App
          </button>
        </FadeInWhenVisible>

        {/* Info text */}
        <FadeInWhenVisible delay={0.15} direction="up">
          <p className="text-center text-gray-400 text-sm mb-8">
            {attemptedOpen
              ? "Don't have the app? Download it below to view the full analysis."
              : 'Tap to open the full analysis with video playback in the app.'}
          </p>
        </FadeInWhenVisible>

        {/* Download Section */}
        <FadeInWhenVisible delay={0.2} direction="up">
          <div id="download-section" className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-xl font-black text-center mb-2">Get Mind & Muscle</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              AI-powered pitch analysis and arm care
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="https://apps.apple.com/app/mind-muscle-baseball/id6737125498"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="px-6 py-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-3">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Download on the</div>
                    <div className="text-base font-semibold -mt-0.5">App Store</div>
                  </div>
                </div>
              </Link>
              <Link
                href="https://play.google.com/store/apps/details?id=ai.mindandmuscle.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="px-6 py-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-3">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-gray-400">GET IT ON</div>
                    <div className="text-base font-semibold -mt-0.5">Google Play</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </FadeInWhenVisible>
      </div>
    </div>
  );
}
