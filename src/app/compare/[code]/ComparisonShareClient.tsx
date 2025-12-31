'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FadeInWhenVisible } from '@/components/animations';
import {
  Play,
  AlertCircle,
  Smartphone,
  ArrowRight,
  TrendingUp,
  Star,
  Calendar,
  Eye
} from 'lucide-react';

interface AnalysisData {
  id: string;
  video_url: string;
  thumbnail_urls: string[] | null;
  overall_rating: string;
  summary: string;
  created_at: string;
  title: string | null;
  drill_title: string | null;
}

interface ShareData {
  share_code: string;
  feature_label: string;
  view_count: number;
  expires_at: string;
}

interface ComparisonShareClientProps {
  code: string;
  shareData: ShareData | null;
  analysis1: AnalysisData | null;
  analysis2: AnalysisData | null;
  error: string | null;
}

function parseRating(ratingStr: string): number {
  const match = /(\d+(?:\.\d+)?)\/?/.exec(ratingStr);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ComparisonShareClient({
  code,
  shareData,
  analysis1,
  analysis2,
  error,
}: ComparisonShareClientProps) {
  const [attemptedOpen, setAttemptedOpen] = useState(false);

  const handleOpenInApp = () => {
    setAttemptedOpen(true);
    // Universal link for the comparison
    window.location.href = `https://mindandmuscle.ai/compare/${code}`;

    // Scroll to download after delay
    setTimeout(() => {
      const downloadSection = document.getElementById('download-section');
      if (downloadSection) {
        downloadSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 2000);
  };

  // Error state
  if (error || !shareData || !analysis1 || !analysis2) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-2xl font-black text-white mb-4">
                {error || 'Comparison Not Found'}
              </h1>
              <p className="text-gray-400 mb-8">
                This share link may have expired or been removed.
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

  const rating1 = parseRating(analysis1.overall_rating);
  const rating2 = parseRating(analysis2.overall_rating);
  const ratingDiff = rating2 - rating1;
  const featureLabel = shareData.feature_label || 'Swing';

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeInWhenVisible delay={0} direction="up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 mb-4">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-400">
                {featureLabel} Progress Comparison
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Side-by-Side Analysis
            </h1>
            <p className="text-gray-400">
              Shared from Mind & Muscle {featureLabel} Lab
            </p>
          </div>
        </FadeInWhenVisible>

        {/* Rating Comparison Banner */}
        <FadeInWhenVisible delay={0.05} direction="up">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 mb-8">
            <div className="flex items-center justify-between">
              {/* Rating 1 */}
              <div className="text-center flex-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 border-2 border-cyan-500/50 flex items-center justify-center mb-2">
                  <span className="text-2xl sm:text-3xl font-black text-white">{rating1 || 'N/A'}</span>
                </div>
                <span className="text-sm text-gray-400">{featureLabel} 1</span>
              </div>

              {/* Arrow and diff */}
              <div className="flex flex-col items-center px-4">
                <ArrowRight className="w-8 h-8 text-gray-500 mb-1" />
                {ratingDiff !== 0 && (
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    ratingDiff > 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {ratingDiff > 0 ? '+' : ''}{ratingDiff.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Rating 2 */}
              <div className="text-center flex-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/30 to-purple-500/10 border-2 border-purple-500/50 flex items-center justify-center mb-2">
                  <span className="text-2xl sm:text-3xl font-black text-white">{rating2 || 'N/A'}</span>
                </div>
                <span className="text-sm text-gray-400">{featureLabel} 2</span>
              </div>
            </div>
          </div>
        </FadeInWhenVisible>

        {/* Side-by-Side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Analysis 1 */}
          <FadeInWhenVisible delay={0.1} direction="up">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-cyan-500/30 backdrop-blur-sm">
              {/* Label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold">
                  {featureLabel} 1
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  {formatDate(analysis1.created_at)}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-black/40">
                {analysis1.thumbnail_urls?.[0] ? (
                  <Image
                    src={analysis1.thumbnail_urls[0]}
                    alt={`${featureLabel} 1`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-cyan-500/50" />
                  </div>
                )}
              </div>

              {/* Title/Drill */}
              {(analysis1.title || analysis1.drill_title) && (
                <h3 className="font-bold text-white mb-2">
                  {analysis1.title || analysis1.drill_title}
                </h3>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">{analysis1.overall_rating}</span>
              </div>

              {/* Summary (truncated) */}
              <p className="text-gray-300 text-sm line-clamp-4">
                {analysis1.summary}
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Analysis 2 */}
          <FadeInWhenVisible delay={0.15} direction="up">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-purple-500/30 backdrop-blur-sm">
              {/* Label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold">
                  {featureLabel} 2
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  {formatDate(analysis2.created_at)}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-black/40">
                {analysis2.thumbnail_urls?.[0] ? (
                  <Image
                    src={analysis2.thumbnail_urls[0]}
                    alt={`${featureLabel} 2`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-purple-500/50" />
                  </div>
                )}
              </div>

              {/* Title/Drill */}
              {(analysis2.title || analysis2.drill_title) && (
                <h3 className="font-bold text-white mb-2">
                  {analysis2.title || analysis2.drill_title}
                </h3>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">{analysis2.overall_rating}</span>
              </div>

              {/* Summary (truncated) */}
              <p className="text-gray-300 text-sm line-clamp-4">
                {analysis2.summary}
              </p>
            </div>
          </FadeInWhenVisible>
        </div>

        {/* View count */}
        <FadeInWhenVisible delay={0.2} direction="up">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-6">
            <Eye className="w-4 h-4" />
            <span>Viewed {shareData.view_count} {shareData.view_count === 1 ? 'time' : 'times'}</span>
          </div>
        </FadeInWhenVisible>

        {/* CTA Button */}
        <FadeInWhenVisible delay={0.25} direction="up">
          <button
            onClick={handleOpenInApp}
            className="w-full py-4 mb-4 bg-gradient-to-r from-solar-surge-orange to-solar-surge-orange/80 rounded-2xl font-black text-lg text-white hover:scale-[1.02] transition-transform shadow-lg shadow-solar-surge-orange/30 flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5" />
            Watch Full Videos in App
          </button>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.3} direction="up">
          <p className="text-center text-gray-400 text-sm mb-8">
            {attemptedOpen
              ? "Don't have the app? Download below for full video playback."
              : 'Open in Mind & Muscle to watch the full comparison videos.'}
          </p>
        </FadeInWhenVisible>

        {/* Download Section */}
        <FadeInWhenVisible delay={0.35} direction="up">
          <div id="download-section" className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
            <h2 className="text-xl font-black text-center mb-2">Get Mind & Muscle</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              AI-powered {featureLabel.toLowerCase()} analysis & progress tracking
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
