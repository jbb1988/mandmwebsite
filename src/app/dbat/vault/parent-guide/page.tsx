'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FadeInWhenVisible,
  StaggerChildren,
  GradientTextReveal,
  staggerItemVariants,
} from '@/components/animations';
import {
  Eye,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Heart,
  MessageSquare,
  DollarSign,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ClipboardList,
  Clock,
  Activity,
  Target,
  Percent,
  ListChecks,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
}

export default function ParentGuidePage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const whatYouCanSee = [
    { info: 'Assigned drills', where: 'Athlete\'s training tab', icon: ClipboardList, color: '#F97316', badge: 'Live' },
    { info: 'Completion status', where: 'Each drill shows Pending/Complete', icon: CheckCircle2, color: '#22C55E', badge: 'Real-time' },
    { info: 'Progress metrics', where: 'Summary at top of screen', icon: TrendingUp, color: '#3B82F6', badge: 'Historical' },
    { info: 'Last activity', where: 'When they last trained', icon: Clock, color: '#A855F7', badge: 'Timestamp' },
  ];

  const keyMetrics = [
    { metric: 'Total Assigned', meaning: 'Drills coach has given them', icon: ListChecks, color: '#F97316', number: 1 },
    { metric: 'Completed', meaning: 'Drills they\'ve finished', icon: CheckCircle2, color: '#22C55E', number: 2 },
    { metric: 'Pending', meaning: 'Drills still to do', icon: Activity, color: '#EAB308', number: 3 },
    { metric: 'Completion %', meaning: 'Completed / Assigned', icon: Target, color: '#3B82F6', number: 4 },
  ];

  const statusColors = [
    { color: 'Green', hex: '#22C55E', status: 'Actively training', action: 'Celebrate!' },
    { color: 'Yellow', hex: '#EAB308', status: 'Some engagement', action: 'Encourage more' },
    { color: 'Red', hex: '#EF4444', status: 'Not completing', action: 'Have a conversation' },
  ];

  const doList = [
    'Check progress weekly (not daily)',
    'Celebrate completions',
    'Ask "What did you learn?" not "Did you do it?"',
    'Watch drills together to understand training',
    'Communicate with coach if concerns',
  ];

  const dontList = [
    'Micromanaging every drill',
    'Comparing to other athletes',
    'Pressuring about completion speed',
    'Doing the drills for them',
    'Nagging about pending drills',
  ];

  const betterQuestions = [
    { instead: '"Did you do your drills?"', try: '"What\'s your favorite drill this week?"' },
    { instead: '"How many did you finish?"', try: '"Show me something you learned"' },
    { instead: '"Why aren\'t you done?"', try: '"Which drill was hardest?"' },
    { instead: '"You need to practice more"', try: '"What do you want to work on?"' },
  ];

  const redFlags = [
    { see: '0 completions', issue: 'Not engaging', action: 'Talk to athlete' },
    { see: 'Viewed but not complete', issue: 'Watching, not practicing', action: 'Encourage follow-through' },
    { see: 'Last activity 7+ days', issue: 'Dropped off', action: 'Check in gently' },
    { see: 'Coach assigns, athlete ignores', issue: 'Disconnect', action: 'Talk to coach' },
  ];

  const costComparison = [
    { option: 'Private Lesson', cost: '$50-100/hour', access: '1 hour' },
    { option: 'Weekly Lessons (4x)', cost: '$200-400/month', access: '4 hours' },
    { option: 'Mind & Muscle Pro', cost: '~$10/month', access: '24/7 unlimited', highlight: true },
  ];

  const faqs: FAQ[] = [
    {
      question: 'Why can\'t I see drill videos?',
      answer: 'Drill content is in your athlete\'s app. You see progress metrics - how many drills assigned, completed, and their engagement level. This helps you support without micromanaging.'
    },
    {
      question: 'My athlete says they did it but it shows pending?',
      answer: 'They need to tap "Mark Complete" after practicing. Just watching doesn\'t count - they need to actually do the drill and then mark it done.'
    },
    {
      question: 'How often should they do drills?',
      answer: 'Ask their coach. Usually 2-3 drills per week between lessons is the sweet spot - enough to build habits without overwhelming.'
    },
    {
      question: 'What if they\'re struggling with a drill?',
      answer: 'They can DM their coach through Chatter for help. Each drill also has Coaching Points below the video with tips.'
    },
    {
      question: 'Is this replacing practice?',
      answer: 'No - it\'s structured homework that makes practice more effective. Athletes know exactly what to work on, and coaches see who\'s putting in the work.'
    },
    {
      question: 'What\'s the difference between "Viewed" and "Completed"?',
      answer: '"Viewed" means they watched 80%+ of the video. "Completed" means they clicked done after actually practicing. Viewing without practicing doesn\'t build skills.'
    }
  ];

  const bigPictureSteps = [
    { text: 'Coach assigns drills based on athlete\'s needs', color: '#3B82F6' },
    { text: 'Athlete practices between lessons', color: '#F97316' },
    { text: 'Coach sees engagement data', color: '#3B82F6' },
    { text: 'Lessons focus on progression, not repetition', color: '#F97316' },
    { text: 'Faster improvement', color: '#22C55E' },
    { text: 'Better value from lessons', color: '#22C55E' },
  ];

  return (
    <div className="min-h-screen bg-[#0F1123]">
      {/* Logo Watermark */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none z-0">
        <Image
          src="/assets/images/logo.png"
          alt=""
          width={1200}
          height={1200}
          className="object-contain"
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Premium Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F3A] via-[#0F1123] to-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.1)_0%,transparent_50%)]" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Back Link */}
          <FadeInWhenVisible delay={0} direction="down">
            <Link
              href="/dbat/vault"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-400/80 transition-colors mb-12 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Resources
            </Link>
          </FadeInWhenVisible>

          {/* Header */}
          <FadeInWhenVisible delay={0.1} direction="up" className="text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full" />
                <Image
                  src="/assets/images/the_vault_icon.png"
                  alt="The Vault"
                  width={80}
                  height={80}
                  className="relative object-contain"
                  style={{filter: 'drop-shadow(0 0 20px rgba(34,197,94,0.6))'}}
                />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500/20 to-neon-cortex-blue/20 border border-green-500/30 text-green-400 text-sm font-bold mb-8 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <Heart className="w-4 h-4" style={{filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.8))'}} />
              FOR PARENTS
            </div>
            <GradientTextReveal
              text="D-BAT Parent Guide"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8"
              gradientFrom="#22C55E"
              gradientTo="#0EA5E9"
              delay={0.2}
            />
            <p className="text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto font-medium leading-relaxed">
              What you can see, how to support your athlete, and what the metrics mean
            </p>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* The Big Picture */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/50 to-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              {/* Outer Glow */}
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-60 bg-gradient-to-r from-neon-cortex-blue/30 to-green-500/30 group-hover:opacity-80 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 md:p-12 shadow-[0_0_40px_rgba(14,165,233,0.2)]">
                <h2 className="text-2xl sm:text-3xl font-black text-center mb-10 text-white">The Bigger Picture</h2>

                <div className="space-y-4">
                  {bigPictureSteps.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 group/step">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 transition-all duration-300 group-hover/step:scale-125"
                        style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}` }}
                      />
                      <span className="text-white/80">{item.text}</span>
                      {index < bigPictureSteps.length - 1 && <span className="text-white/30 ml-auto">|</span>}
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-5 bg-green-500/10 border-2 border-green-500/30 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                  <p className="text-green-400 font-medium text-center flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" style={{filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))'}} />
                    Your role: Encourage the process, celebrate the effort, trust the coach.
                  </p>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* What You Can See */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-gradient-to-r from-solar-surge-orange/30 to-solar-surge-orange/10 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                    <Eye
                      className="w-6 h-6 text-solar-surge-orange"
                      style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">What You Can See</h2>
                </div>

                <p className="text-white/50 mb-8">When linked to your athlete&apos;s account:</p>

                <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-2 gap-5">
                  {whatYouCanSee.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        variants={staggerItemVariants}
                        className="group relative p-5 bg-white/[0.03] rounded-xl border-2 border-white/10 hover:border-opacity-60 transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          borderColor: `${item.color}30`,
                        }}
                      >
                        {/* Hover glow */}
                        <div
                          className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                          style={{ backgroundColor: item.color }}
                        />

                        <div className="relative flex items-start gap-4">
                          {/* Icon container with glow */}
                          <div className="relative flex-shrink-0">
                            <div
                              className="absolute inset-0 blur-xl opacity-40 group-hover:opacity-60 transition-opacity"
                              style={{ backgroundColor: item.color }}
                            />
                            <div
                              className="relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                              style={{
                                background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)`,
                                border: `1px solid ${item.color}40`,
                                boxShadow: `0 0 20px ${item.color}20`
                              }}
                            >
                              <Icon
                                className="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
                                style={{
                                  color: item.color,
                                  filter: `drop-shadow(0 0 8px ${item.color})`
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-white">{item.info}</p>
                              <span
                                className="px-2 py-0.5 text-xs font-semibold rounded-full"
                                style={{
                                  backgroundColor: `${item.color}20`,
                                  color: item.color,
                                  border: `1px solid ${item.color}30`
                                }}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-sm text-white/60">{item.where}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </StaggerChildren>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Understanding Metrics */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                    <BarChart3
                      className="w-6 h-6 text-neon-cortex-blue"
                      style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">Understanding the Metrics</h2>
                </div>

                <h3 className="font-bold text-lg mb-6 text-white">Key Numbers</h3>
                <StaggerChildren staggerDelay={0.08} className="grid sm:grid-cols-2 gap-4 mb-10">
                  {keyMetrics.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        variants={staggerItemVariants}
                        className="group relative flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          borderColor: `${item.color}30`,
                        }}
                      >
                        {/* Hover glow */}
                        <div
                          className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                          style={{ backgroundColor: item.color }}
                        />

                        {/* Icon with number badge */}
                        <div className="relative flex-shrink-0">
                          <div
                            className="absolute inset-0 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"
                            style={{ backgroundColor: item.color }}
                          />
                          <div
                            className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            style={{
                              background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)`,
                              border: `1px solid ${item.color}40`,
                              boxShadow: `0 0 15px ${item.color}20`
                            }}
                          >
                            <Icon
                              className="w-6 h-6"
                              style={{
                                color: item.color,
                                filter: `drop-shadow(0 0 6px ${item.color})`
                              }}
                            />
                          </div>
                          {/* Number badge */}
                          <div
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{
                              backgroundColor: item.color,
                              boxShadow: `0 0 10px ${item.color}`
                            }}
                          >
                            {item.number}
                          </div>
                        </div>

                        <div className="relative flex-1">
                          <span className="font-bold text-white block">{item.metric}</span>
                          <span className="text-sm text-white/50">{item.meaning}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </StaggerChildren>

                <h3 className="font-bold text-lg mb-4 text-white">Status Colors</h3>
                <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-3 gap-3">
                  {statusColors.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItemVariants}
                      className="p-4 bg-white/[0.03] rounded-xl border-l-4 hover:bg-white/[0.05] transition-colors"
                      style={{ borderColor: item.hex }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: item.hex, boxShadow: `0 0 10px ${item.hex}` }} />
                        <span className="font-bold text-sm" style={{ color: item.hex }}>{item.status}</span>
                      </div>
                      <p className="text-sm text-white/50">{item.action}</p>
                    </motion.div>
                  ))}
                </StaggerChildren>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* How to Support */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <h2 className="text-2xl font-black mb-8 text-white">How to Support Your Athlete</h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ThumbsUp className="w-5 h-5 text-green-400" style={{filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))'}} />
                      <h3 className="font-bold text-lg text-green-400">Do This</h3>
                    </div>
                    <ul className="space-y-3">
                      {doList.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 group/tip">
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5 group-hover/tip:scale-110 transition-transform" style={{filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))'}} />
                          <span className="text-white/70 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ThumbsDown className="w-5 h-5 text-red-400" style={{filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.5))'}} />
                      <h3 className="font-bold text-lg text-red-400">Avoid This</h3>
                    </div>
                    <ul className="space-y-3">
                      {dontList.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 group/tip">
                          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 group-hover/tip:scale-110 transition-transform" style={{filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.5))'}} />
                          <span className="text-white/70 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Better Questions */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                    <MessageSquare
                      className="w-6 h-6 text-neon-cortex-blue"
                      style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">Weekly Check-In Questions</h2>
                </div>

                <StaggerChildren staggerDelay={0.1} className="space-y-4">
                  {betterQuestions.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItemVariants}
                      className="grid sm:grid-cols-2 gap-4"
                    >
                      <div className="p-4 bg-red-500/10 border-2 border-red-500/20 rounded-xl">
                        <p className="text-sm text-red-400 mb-1 font-medium">Instead of:</p>
                        <p className="text-white/50 line-through">{item.instead}</p>
                      </div>
                      <div className="p-4 bg-green-500/10 border-2 border-green-500/20 rounded-xl">
                        <p className="text-sm text-green-400 mb-1 font-medium">Try:</p>
                        <p className="text-white font-medium">{item.try}</p>
                      </div>
                    </motion.div>
                  ))}
                </StaggerChildren>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Red Flags */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                    <AlertTriangle
                      className="w-6 h-6 text-red-400"
                      style={{filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">Red Flags to Watch</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 font-semibold text-white">You See</th>
                        <th className="text-left py-4 px-4 font-semibold text-white">Possible Issue</th>
                        <th className="text-left py-4 px-4 font-semibold text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redFlags.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-4 text-white/80">{row.see}</td>
                          <td className="py-4 px-4 text-yellow-400">{row.issue}</td>
                          <td className="py-4 px-4 text-neon-cortex-blue">{row.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Value Comparison */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                    <DollarSign
                      className="w-6 h-6 text-neon-cortex-blue"
                      style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">Understanding the Value</h2>
                </div>

                <div className="overflow-x-auto mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 font-semibold text-white">Option</th>
                        <th className="text-left py-4 px-4 font-semibold text-white">Cost</th>
                        <th className="text-left py-4 px-4 font-semibold text-white">Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costComparison.map((row, i) => (
                        <tr
                          key={i}
                          className={`border-b border-white/5 transition-colors ${row.highlight ? 'bg-neon-cortex-blue/10' : 'hover:bg-white/[0.02]'}`}
                        >
                          <td className={`py-4 px-4 ${row.highlight ? 'font-bold text-neon-cortex-blue' : 'text-white/80'}`}>
                            {row.option}
                          </td>
                          <td className={`py-4 px-4 ${row.highlight ? 'font-bold text-neon-cortex-blue' : 'text-white/60'}`}>
                            {row.cost}
                          </td>
                          <td className={`py-4 px-4 ${row.highlight ? 'font-bold text-neon-cortex-blue' : 'text-white/60'}`}>
                            {row.access}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-5 bg-white/[0.03] rounded-xl border border-white/10">
                  <h3 className="font-bold mb-4 text-white">What Pro Includes:</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      'Unlimited drill access',
                      'AI-powered swing/pitch analysis',
                      'Coach assignments (full access)',
                      'Progress tracking',
                      'The Zone mental training',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-neon-cortex-blue flex-shrink-0" style={{filter: 'drop-shadow(0 0 6px rgba(14,165,233,0.5))'}} />
                        <span className="text-sm text-white/70">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.05)_0%,transparent_60%)]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 md:p-12 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <h2 className="text-3xl font-black mb-10 text-white">Frequently Asked Questions</h2>

                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden hover:border-solar-surge-orange/30 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="font-semibold text-white pr-4">{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-solar-surge-orange flex-shrink-0 transition-transform duration-300 ${expandedFAQ === index ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedFAQ === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-6 pb-4 text-white/60 leading-relaxed">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08)_0%,transparent_60%)]" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <FadeInWhenVisible delay={0} direction="up">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Questions?</h2>
            <p className="text-xl text-white/60 mb-10">
              Support the process. Celebrate the effort. Watch them grow.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/download"
                className="group relative inline-flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-neon-cortex-blue" />
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-neon-cortex-blue opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                <span className="relative text-white">Download the App</span>
                <ArrowRight className="relative w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/dbat/vault"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-white/[0.05] border-2 border-white/20 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300 text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Resources
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  );
}
