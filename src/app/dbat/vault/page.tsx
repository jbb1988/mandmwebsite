'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FadeInWhenVisible,
  StaggerChildren,
  GradientTextReveal,
  staggerItemVariants,
} from '@/components/animations';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Award,
  Users,
  Heart,
  Building2,
  Lock,
  Bell,
  CheckCircle,
  Video,
  Brain,
  Target,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function DBatVaultPage() {
  const guides = [
    {
      title: 'Instructor Guide',
      description: 'How coaches use The Vault to assign drills, track engagement, and extend their coaching impact between sessions.',
      href: '/dbat/vault/instructor-guide',
      icon: Award,
      color: 'orange',
      audience: 'For coaches & instructors',
    },
    {
      title: 'Athlete Guide',
      description: 'Step-by-step workflow for athletes using The Vault, Swing Lab, and Pitch Lab to accelerate their development.',
      href: '/dbat/vault/athlete-guide',
      icon: Users,
      color: 'blue',
      audience: 'For athletes',
    },
    {
      title: 'Parent Guide',
      description: 'What parents can see, understanding engagement metrics, and how to support without micromanaging.',
      href: '/dbat/vault/parent-guide',
      icon: Heart,
      color: 'orange',
      audience: 'For parents',
    },
    {
      title: 'Pilot Playbook',
      description: 'Setup checklist, materials, talking points, metrics tracking, and success criteria for facility managers.',
      href: '/dbat/vault/playbook',
      icon: Building2,
      color: 'blue',
      audience: 'For facility managers',
      protected: true,
    },
  ];

  const workflowSteps = [
    {
      step: '1',
      title: 'Instructor Assigns Drill',
      description: 'From The Vault, instructors assign specific drills to athletes with personalized notes.',
      icon: Video,
    },
    {
      step: '2',
      title: 'Athlete Gets Notified',
      description: 'Push notification alerts the athlete immediately. Drill appears in their "For You" tab.',
      icon: Bell,
    },
    {
      step: '3',
      title: 'Athlete Watches & Practices',
      description: 'They watch the drill, then tap "Practice This" to record themselves in Swing Lab or Pitch Lab.',
      icon: Play,
    },
    {
      step: '4',
      title: 'AI Analyzes',
      description: 'AI provides instant feedback on their mechanics, reinforcing what the instructor taught.',
      icon: Brain,
    },
    {
      step: '5',
      title: 'Instructor Sees Results',
      description: 'Engagement tracking shows who watched, who practiced, and progress over time.',
      icon: Target,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F1123]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0F1123]/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dbat"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to D-BAT Partnership
            </Link>
            <div className="flex items-center gap-2">
              <Image
                src="/assets/images/logo.png"
                alt="Mind & Muscle"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-white font-bold text-sm">D-BAT Partner Resources</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Premium with dramatic gradients */}
      <section className="relative pt-40 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Premium Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F3A] via-[#0F1123] to-[#1A1F3A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue/10 via-transparent to-solar-surge-orange/10" />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-solar-surge-orange/20 to-neon-cortex-blue/20 border border-solar-surge-orange/30 text-solar-surge-orange text-sm font-bold mb-8 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <Sparkles className="w-4 h-4" style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.8))'}} />
              THE COMPLETE TRAINING LOOP
            </div>
            <GradientTextReveal
              text="The Vault + Swing Lab + Pitch Lab"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-8"
              gradientFrom="#0EA5E9"
              gradientTo="#F97316"
              delay={0.1}
            />
            <p className="text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              How instructors extend their coaching impact between lessons - and how athletes, parents, and facility managers use the system.
            </p>
          </FadeInWhenVisible>

          {/* Video Section with Premium Glow */}
          <FadeInWhenVisible delay={0.2} direction="up">
            <div className="group relative">
              {/* Outer Glow */}
              <div className="absolute -inset-4 rounded-3xl blur-3xl opacity-60 bg-gradient-to-r from-neon-cortex-blue/40 via-solar-surge-orange/30 to-neon-cortex-blue/40 group-hover:opacity-80 transition-opacity duration-700" />

              <div className="relative rounded-2xl overflow-hidden mb-16">
                <div className="absolute -inset-1 bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange to-neon-cortex-blue rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_0_60px_rgba(14,165,233,0.3)]">
                  <video
                    src="/assets/videos/the_vault.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                  />
                </div>
                <p className="text-center text-white/50 text-sm mt-6">
                  See how The Vault creates accountability between lessons
                </p>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* The Complete Loop - Premium Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/50 to-[#0F1123]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
              The Complete Feedback Loop
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              From assignment to analysis - a closed loop that reinforces every lesson
            </p>
          </FadeInWhenVisible>

          <div className="relative">
            {/* Connection line with glow */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange to-neon-cortex-blue transform -translate-y-1/2 opacity-40 blur-sm" />
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange to-neon-cortex-blue transform -translate-y-1/2 opacity-60" />

            <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {workflowSteps.map((item, index) => (
                <motion.div key={index} variants={staggerItemVariants} className="relative group">
                  <div className="text-center">
                    {/* Icon Container with Glow */}
                    <div className="relative inline-flex items-center justify-center mb-6">
                      {/* Glow Effect */}
                      <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cortex-blue/40 to-solar-surge-orange/40 blur-xl opacity-0 group-hover:opacity-80 transition-opacity duration-500" />

                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 border-2 border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:border-white/40 group-hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                        <item.icon
                          className="w-8 h-8 text-white"
                          style={{filter: 'drop-shadow(0 0 10px rgba(14,165,233,0.6))'}}
                        />
                        <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gradient-to-br from-neon-cortex-blue to-solar-surge-orange flex items-center justify-center text-xs font-black text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                          {item.step}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-white/50">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* Three Tools Section - Premium Cards */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A] to-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Three Tools, One System
            </h2>
          </FadeInWhenVisible>

          <StaggerChildren staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'The Vault',
                description: 'Instructor-assigned drill library. Athletes receive push notifications when drills are assigned. Track who watched, who practiced.',
                icon: '/assets/images/the_vault_icon.png',
                color: 'blue',
                video: '/assets/videos/the_vault.mp4',
              },
              {
                title: 'Swing Lab',
                description: 'AI-powered swing analysis. Athletes record their swing, get instant feedback on mechanics, see side-by-side comparisons.',
                icon: '/assets/images/Swing Lab1.png',
                color: 'orange',
                video: '/assets/videos/swing_lab.mp4',
              },
              {
                title: 'Pitch Lab',
                description: 'AI-powered pitching analysis. Break down mechanics, track consistency, identify areas for improvement.',
                icon: '/assets/images/pitch_lab_icon.png',
                color: 'blue',
                video: '/assets/videos/pitch_lab.mp4',
              },
            ].map((tool, index) => (
              <motion.div key={index} variants={staggerItemVariants} className="group relative">
                {/* Outer Glow */}
                <div className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${
                  tool.color === 'blue'
                    ? 'bg-gradient-to-b from-neon-cortex-blue/30 to-transparent'
                    : 'bg-gradient-to-b from-solar-surge-orange/30 to-transparent'
                }`} />

                <div
                  className={`relative h-full rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm bg-white/[0.02] ${
                    tool.color === 'blue'
                      ? 'border-2 border-neon-cortex-blue/40 hover:border-neon-cortex-blue shadow-[0_0_30px_rgba(14,165,233,0.2)] hover:shadow-[0_0_50px_rgba(14,165,233,0.4)]'
                      : 'border-2 border-solar-surge-orange/40 hover:border-solar-surge-orange shadow-[0_0_30px_rgba(249,115,22,0.2)] hover:shadow-[0_0_50px_rgba(249,115,22,0.4)]'
                  }`}
                >
                  {/* Video */}
                  <div className="aspect-video bg-black relative overflow-hidden">
                    <video
                      src={tool.video}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1123] via-transparent to-transparent" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        tool.color === 'blue'
                          ? 'bg-neon-cortex-blue/20 border border-neon-cortex-blue/30'
                          : 'bg-solar-surge-orange/20 border border-solar-surge-orange/30'
                      }`}>
                        <Image
                          src={tool.icon}
                          alt={tool.title}
                          width={32}
                          height={32}
                          className="object-contain"
                          style={{filter: `drop-shadow(0 0 10px ${tool.color === 'blue' ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}}
                        />
                      </div>
                      <h3 className={`text-xl font-black ${
                        tool.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
                      }`}>
                        {tool.title}
                      </h3>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{tool.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Guides Section - Premium Cards with Glow */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F3A] via-[#0F1123] to-[#1A1F3A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.1)_0%,transparent_50%)]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
              Guides & Resources
            </h2>
            <p className="text-lg sm:text-xl text-white/60">
              Share the right guide with the right person
            </p>
          </FadeInWhenVisible>

          <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-2 gap-8">
            {guides.map((guide, index) => (
              <motion.div key={index} variants={staggerItemVariants}>
                <Link href={guide.href} className="block group">
                  <div className="relative">
                    {/* Outer Glow Effect */}
                    <div
                      className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${
                        guide.color === 'blue' ? 'bg-neon-cortex-blue/30' : 'bg-solar-surge-orange/30'
                      }`}
                    />

                    <div
                      className={`relative h-full rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm bg-white/[0.02] ${
                        guide.color === 'blue'
                          ? 'border-2 border-neon-cortex-blue/40 hover:border-neon-cortex-blue shadow-[0_0_30px_rgba(14,165,233,0.2)] hover:shadow-[0_0_50px_rgba(14,165,233,0.4)]'
                          : 'border-2 border-solar-surge-orange/40 hover:border-solar-surge-orange shadow-[0_0_30px_rgba(249,115,22,0.2)] hover:shadow-[0_0_50px_rgba(249,115,22,0.4)]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          guide.color === 'blue'
                            ? 'bg-neon-cortex-blue/20 border border-neon-cortex-blue/30'
                            : 'bg-solar-surge-orange/20 border border-solar-surge-orange/30'
                        }`}>
                          <guide.icon
                            className={`w-8 h-8 ${
                              guide.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
                            }`}
                            style={{filter: `drop-shadow(0 0 10px ${guide.color === 'blue' ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}}
                          />
                        </div>
                        {guide.protected && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/60 text-xs font-medium">
                            <Lock className="w-3 h-3" />
                            Protected
                          </div>
                        )}
                      </div>

                      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                        guide.color === 'blue' ? 'text-neon-cortex-blue/70' : 'text-solar-surge-orange/70'
                      }`}>
                        {guide.audience}
                      </p>
                      <h3 className="text-2xl font-black text-white mb-3">{guide.title}</h3>
                      <p className="text-white/60 text-sm mb-6 leading-relaxed">{guide.description}</p>

                      <div className={`inline-flex items-center gap-2 text-sm font-bold ${
                        guide.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
                      }`}>
                        View Guide
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue/5 via-transparent to-solar-surge-orange/5" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dbat"
                className="group inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 hover:border-white/40 text-white rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/[0.02]"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Partnership Info
              </Link>
              <Link
                href="/partner-program?source=dbat&type=facility"
                className="group relative inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                {/* Button Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange" />
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                <span className="relative text-white">Get Your Partner Link</span>
                <ArrowRight className="relative w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="mailto:partnerships@mindandmuscle.ai"
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                Questions? partnerships@mindandmuscle.ai
              </a>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  );
}
