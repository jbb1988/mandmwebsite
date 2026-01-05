'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LiquidGlass } from '@/components/LiquidGlass';
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
} from 'lucide-react';

export default function DBatVaultPage() {
  const guides = [
    {
      title: 'Instructor Guide',
      description: 'How coaches use The Vault to assign drills, track engagement, and extend their coaching impact between sessions.',
      href: '/dbat/instructor-guide',
      icon: Award,
      color: 'orange',
      audience: 'For coaches & instructors',
    },
    {
      title: 'Athlete Guide',
      description: 'Step-by-step workflow for athletes using The Vault, Swing Lab, and Pitch Lab to accelerate their development.',
      href: '/dbat/athlete-guide',
      icon: Users,
      color: 'blue',
      audience: 'For athletes',
    },
    {
      title: 'Parent Guide',
      description: 'What parents can see, understanding engagement metrics, and how to support without micromanaging.',
      href: '/dbat/parent-guide',
      icon: Heart,
      color: 'orange',
      audience: 'For parents',
    },
    {
      title: 'Pilot Playbook',
      description: 'Setup checklist, materials, talking points, metrics tracking, and success criteria for facility managers.',
      href: '/dbat/playbook',
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

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cortex-blue/10 via-transparent to-transparent" />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-solar-surge-orange/20 text-solar-surge-orange text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              THE COMPLETE TRAINING LOOP
            </div>
            <GradientTextReveal
              text="The Vault + Swing Lab + Pitch Lab"
              className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6"
              gradientFrom="#0EA5E9"
              gradientTo="#F97316"
              delay={0.1}
            />
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              How instructors extend their coaching impact between lessons — and how athletes, parents, and facility managers use the system.
            </p>
          </FadeInWhenVisible>

          {/* Video Section */}
          <FadeInWhenVisible delay={0.2} direction="up">
            <div className="relative rounded-2xl overflow-hidden mb-16 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange to-neon-cortex-blue rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-white/20">
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
              <p className="text-center text-white/50 text-sm mt-4">
                See how The Vault creates accountability between lessons
              </p>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* The Complete Loop */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              The Complete Feedback Loop
            </h2>
            <p className="text-lg text-white/60">
              From assignment to analysis — a closed loop that reinforces every lesson
            </p>
          </FadeInWhenVisible>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange to-neon-cortex-blue transform -translate-y-1/2 opacity-30" />

            <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {workflowSteps.map((item, index) => (
                <motion.div key={index} variants={staggerItemVariants} className="relative">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 border border-white/20 mb-4">
                      <item.icon className="w-7 h-7 text-white" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-neon-cortex-blue to-solar-surge-orange flex items-center justify-center text-xs font-black text-white">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-white/50">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* Three Tools Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Three Tools, One System
            </h2>
          </FadeInWhenVisible>

          <StaggerChildren staggerDelay={0.15} className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'The Vault',
                description: 'Instructor-assigned drill library. Athletes receive push notifications when drills are assigned. Track who watched, who practiced.',
                icon: '/assets/images/vault_icon.png',
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
              <motion.div key={index} variants={staggerItemVariants}>
                <div
                  className={`h-full rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                    tool.color === 'blue'
                      ? 'border-2 border-neon-cortex-blue/40 hover:border-neon-cortex-blue shadow-[0_0_30px_rgba(14,165,233,0.2)] hover:shadow-[0_0_40px_rgba(14,165,233,0.3)]'
                      : 'border-2 border-solar-surge-orange/40 hover:border-solar-surge-orange shadow-[0_0_30px_rgba(249,115,22,0.2)] hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 17, 35, 0.95) 0%, rgba(27, 31, 57, 0.95) 100%)',
                  }}
                >
                  {/* Video */}
                  <div className="aspect-video bg-black">
                    <video
                      src={tool.video}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        tool.color === 'blue' ? 'bg-neon-cortex-blue/20' : 'bg-solar-surge-orange/20'
                      }`}>
                        <Image
                          src={tool.icon}
                          alt={tool.title}
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      </div>
                      <h3 className={`text-xl font-black ${
                        tool.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
                      }`}>
                        {tool.title}
                      </h3>
                    </div>
                    <p className="text-white/60 text-sm">{tool.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Guides Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Guides & Resources
            </h2>
            <p className="text-lg text-white/60">
              Share the right guide with the right person
            </p>
          </FadeInWhenVisible>

          <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <motion.div key={index} variants={staggerItemVariants}>
                <Link href={guide.href} className="block group">
                  <div
                    className={`relative h-full rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] overflow-hidden ${
                      guide.color === 'blue'
                        ? 'border-2 border-neon-cortex-blue/40 hover:border-neon-cortex-blue'
                        : 'border-2 border-solar-surge-orange/40 hover:border-solar-surge-orange'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 17, 35, 0.95) 0%, rgba(27, 31, 57, 0.95) 100%)',
                    }}
                  >
                    {/* Glow effect */}
                    <div
                      className={`absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${
                        guide.color === 'blue' ? 'bg-neon-cortex-blue' : 'bg-solar-surge-orange'
                      }`}
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          guide.color === 'blue' ? 'bg-neon-cortex-blue/20' : 'bg-solar-surge-orange/20'
                        }`}>
                          <guide.icon className={`w-7 h-7 ${
                            guide.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
                          }`} />
                        </div>
                        {guide.protected && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-white/60 text-xs">
                            <Lock className="w-3 h-3" />
                            Protected
                          </div>
                        )}
                      </div>

                      <p className={`text-xs font-medium mb-1 ${
                        guide.color === 'blue' ? 'text-neon-cortex-blue/70' : 'text-solar-surge-orange/70'
                      }`}>
                        {guide.audience}
                      </p>
                      <h3 className="text-xl font-bold text-white mb-2">{guide.title}</h3>
                      <p className="text-white/60 text-sm mb-4">{guide.description}</p>

                      <div className={`inline-flex items-center gap-2 text-sm font-bold ${
                        guide.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
                      }`}>
                        View Guide
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dbat"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 text-white rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Partnership Info
            </Link>
            <Link
              href="/partner-program?source=dbat&type=facility"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange hover:from-neon-cortex-blue/90 hover:to-solar-surge-orange/90 text-white font-bold rounded-xl transition-all"
            >
              Get Your Partner Link
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:jeff@mindandmuscle.ai"
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              Questions? jeff@mindandmuscle.ai
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
