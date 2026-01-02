'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';

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

// Skill category colors with gradient variants
const categoryColors: Record<string, { gradient: string; glow: string }> = {
  hitting: { gradient: 'from-orange-500 to-amber-400', glow: 'shadow-orange-500/30' },
  pitching: { gradient: 'from-blue-500 to-cyan-400', glow: 'shadow-blue-500/30' },
  fielding: { gradient: 'from-green-500 to-emerald-400', glow: 'shadow-green-500/30' },
  catching: { gradient: 'from-purple-500 to-violet-400', glow: 'shadow-purple-500/30' },
  speed: { gradient: 'from-pink-500 to-rose-400', glow: 'shadow-pink-500/30' },
  strength: { gradient: 'from-red-500 to-orange-400', glow: 'shadow-red-500/30' },
  mental: { gradient: 'from-cyan-500 to-teal-400', glow: 'shadow-cyan-500/30' },
  warmup: { gradient: 'from-yellow-500 to-amber-400', glow: 'shadow-yellow-500/30' },
  cooldown: { gradient: 'from-indigo-500 to-blue-400', glow: 'shadow-indigo-500/30' },
  other: { gradient: 'from-gray-500 to-slate-400', glow: 'shadow-gray-500/30' },
};

// Floating particles component
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3,
      size: 2 + Math.random() * 3,
    })), []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-solar-surge-orange/40"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -window?.innerHeight || -800],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export default function DrillShareClient({ code, drill, error }: DrillShareClientProps) {
  const appLink = `mindmuscle://d/${code}`;

  const handleOpenInApp = () => {
    window.location.href = appLink;
  };

  // Error state with premium styling
  if (error || !drill) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed top-1/3 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <div className="relative p-8 rounded-3xl overflow-hidden">
              {/* Glass background */}
              <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl" />

              <div className="relative text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center"
                >
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </motion.div>

                <h1 className="text-2xl font-black text-white mb-4">
                  {error || 'Drill Not Found'}
                </h1>
                <p className="text-gray-400 mb-8">
                  This share link may have expired or been deactivated.
                </p>

                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-solar-surge-orange to-orange-500 rounded-xl font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-solar-surge-orange/30"
                >
                  <Smartphone className="w-5 h-5" />
                  Get the App
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const categoryStyle = categoryColors[drill.skill_category.toLowerCase()] || categoryColors.other;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* === BACKGROUND LAYER === */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* Glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-solar-surge-orange/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-cortex-blue/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-1/2 right-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* === CONTENT === */}
      <div className="relative z-10 min-h-screen pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">

          {/* Shared badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="relative px-5 py-2 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-solar-surge-orange/20 to-orange-500/20 backdrop-blur-sm border border-solar-surge-orange/40" />
              <span className="relative text-sm font-bold bg-gradient-to-r from-solar-surge-orange to-orange-400 bg-clip-text text-transparent">
                Shared from The Vault
              </span>
            </div>
          </motion.div>

          {/* === HERO THUMBNAIL === */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative mb-6"
          >
            {/* Animated glow border */}
            <motion.div
              className="absolute -inset-[3px] rounded-3xl bg-gradient-to-r from-solar-surge-orange via-neon-cortex-blue to-solar-surge-orange opacity-70 blur-sm"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ backgroundSize: '200% 200%' }}
            />

            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black">
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
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-solar-surge-orange/20 to-solar-surge-orange/5">
                  <Play className="w-20 h-20 text-solar-surge-orange/60" />
                </div>
              )}

              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Play button overlay */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center cursor-pointer"
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-10 h-10 text-white ml-1" fill="white" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* === TITLE === */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-4"
          >
            <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
              {drill.title}
            </span>
          </motion.h1>

          {/* === CATEGORY & AGE BADGES === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap justify-center gap-3 mb-6"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-5 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-sm font-bold shadow-lg ${categoryStyle.glow}`}
            >
              <span className={`bg-gradient-to-r ${categoryStyle.gradient} bg-clip-text text-transparent`}>
                {drill.skill_category.charAt(0).toUpperCase() + drill.skill_category.slice(1)}
              </span>
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-5 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-sm font-medium text-gray-300"
            >
              {drill.age_range === 'all' ? 'All Ages' : drill.age_range}
            </motion.span>
          </motion.div>

          {/* === DESCRIPTION === */}
          {drill.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-300 text-center mb-6 leading-relaxed max-w-md mx-auto"
            >
              {drill.description}
            </motion.p>
          )}

          {/* === SHIMMER CTA BUTTON === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-6"
          >
            <motion.button
              onClick={handleOpenInApp}
              className="relative w-full py-5 rounded-2xl font-black text-lg text-white overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-solar-surge-orange via-orange-500 to-solar-surge-orange" />

              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-solar-surge-orange/50 blur-xl -z-10" />

              <span className="relative flex items-center justify-center gap-3">
                <Smartphone className="w-6 h-6" />
                Open in Mind & Muscle
              </span>
            </motion.button>
          </motion.div>

          {/* === INSTRUCTOR CARD (LiquidGlass) === */}
          {drill.owner_name && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="relative p-5 rounded-2xl overflow-hidden mb-8"
            >
              {/* Glass background */}
              <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl" />

              {/* Subtle glow */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-solar-surge-orange/20 rounded-full blur-3xl" />

              <div className="relative flex items-center gap-4">
                {/* Avatar with glow ring */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue rounded-full opacity-70 blur-[4px]" />
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 bg-gradient-to-br from-solar-surge-orange/30 to-solar-surge-orange/10">
                    {drill.owner_avatar_url ? (
                      <Image
                        src={drill.owner_avatar_url}
                        alt={drill.owner_name}
                        width={64}
                        height={64}
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-solar-surge-orange">
                          {drill.owner_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Pro Instructor</p>
                  <p className="text-lg font-bold text-white truncate">{drill.owner_name}</p>
                </div>

                {/* Verified badge */}
                <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-neon-cortex-blue/20 border border-neon-cortex-blue/40">
                  <span className="text-xs font-bold text-neon-cortex-blue flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* === SOCIAL PROOF STRIP === */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="flex justify-center gap-8 sm:gap-12 mb-8"
          >
            {[
              { value: '50K+', label: 'Athletes' },
              { value: '10K+', label: 'Drills' },
              { value: '4.9', label: 'App Rating' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* === PRO SUBSCRIPTION NOTE === */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="relative p-4 rounded-xl overflow-hidden mb-8"
          >
            <div className="absolute inset-0 bg-neon-cortex-blue/10 border border-neon-cortex-blue/30 rounded-xl" />
            <p className="relative text-sm text-center text-neon-cortex-blue">
              <span className="font-bold">Pro subscription required</span> to access The Vault and premium drills.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
