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
  Play,
  Bell,
  CheckCircle2,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Link2,
  HelpCircle,
  Smartphone,
  Eye,
  Video,
  Sparkles,
  Zap,
  MousePointer2,
  Camera,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
}

export default function AthleteGuidePage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const tabs = [
    { name: 'For You', description: 'Drills your coach assigned', priority: 'Do these first', icon: Bell },
    { name: 'Explore', description: 'Master Library (all drills)', priority: 'Browse & discover', icon: Eye },
    { name: 'Saved', description: 'Your bookmarked favorites', priority: 'Quick access', icon: Bookmark },
  ];

  const proTips = [
    { tip: 'Check "For You" first', why: 'Coach assigned these for YOU' },
    { tip: 'Watch the whole video', why: 'You\'re not "viewed" until 80%' },
    { tip: 'Use Practice This', why: 'Get real feedback on your form' },
    { tip: 'Complete assignments promptly', why: 'Coaches see everything' },
    { tip: 'Save drills you\'ll repeat', why: 'Build your routine' },
  ];

  const troubleshooting = [
    { issue: 'Team link not opening app?', solution: 'Tap "Open in App" button on the page' },
    { issue: 'Drill won\'t play?', solution: 'Check your internet connection' },
    { issue: 'Link doesn\'t work?', solution: 'May be expired - ask coach for new one' },
    { issue: 'Can\'t find assigned drill?', solution: 'Pull down to refresh For You tab' },
  ];

  const faqs: FAQ[] = [
    {
      question: 'How do I join my team?',
      answer: 'Your coach will send you a team invite link (looks like mindandmuscle.ai/t/TEAM-XXXX). Tap the link → tap "Open in App" (or "Join Team" if you\'re already in the app) → done! You\'re now connected to your team with Pro access. If you don\'t have the app yet, the page shows download buttons first.'
    },
    {
      question: 'What happens when my coach assigns a drill?',
      answer: 'You\'ll get a push notification instantly. The drill appears in your "For You" tab. Watch the full video (80%+), then tap "Mark Complete" when you\'ve practiced it.'
    },
    {
      question: 'What does "Practice This" do?',
      answer: 'After watching any drill, tap "Practice This" to open Swing Lab (for hitting drills) or Pitch Lab (for pitching drills). Record yourself doing the drill, and our AI analyzes your technique. Your coach can see that you actually practiced!'
    },
    {
      question: 'How do I claim a shared drill link?',
      answer: 'Tap the link your coach sent you (it opens in the app). Preview the drill info, then tap "Claim Drill." It will appear in your For You tab.'
    },
    {
      question: 'Can I watch the same drill multiple times?',
      answer: 'Yes! Once you\'ve watched or claimed a drill, you can rewatch it as many times as you want. Save your favorites to the Saved tab for quick access.'
    },
    {
      question: 'What if I don\'t understand a drill?',
      answer: 'Check the Coaching Points below each drill video for tips. You can also message your coach through Chatter if you have questions.'
    }
  ];

  const workflowSteps = [
    { step: 'Coach assigns', icon: Bell, color: 'blue', role: 'Coach', number: 1 },
    { step: 'You get notified', icon: Smartphone, color: 'blue', role: 'You', number: 2 },
    { step: 'Watch drill', icon: Play, color: 'orange', role: 'You', number: 3 },
    { step: 'Tap Practice This', icon: Zap, color: 'orange', role: 'You', number: 4 },
    { step: 'Record yourself', icon: Video, color: 'green', role: 'You', number: 5 },
    { step: 'AI analyzes', icon: Sparkles, color: 'purple', role: 'AI', number: 6 },
    { step: 'Mark complete', icon: CheckCircle2, color: 'green', role: 'You', number: 7 },
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.1)_0%,transparent_50%)]" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Back Link */}
          <FadeInWhenVisible delay={0} direction="down">
            <Link
              href="/dbat/vault"
              className="inline-flex items-center gap-2 text-neon-cortex-blue hover:text-neon-cortex-blue/80 transition-colors mb-12 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Resources
            </Link>
          </FadeInWhenVisible>

          {/* Header */}
          <FadeInWhenVisible delay={0.1} direction="up" className="text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cortex-blue/30 blur-2xl rounded-full" />
                <Image
                  src="/assets/images/the_vault_icon.png"
                  alt="The Vault"
                  width={80}
                  height={80}
                  className="relative object-contain"
                  style={{filter: 'drop-shadow(0 0 20px rgba(14,165,233,0.6))'}}
                />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-neon-cortex-blue/20 to-solar-surge-orange/20 border border-neon-cortex-blue/30 text-neon-cortex-blue text-sm font-bold mb-8 shadow-[0_0_30px_rgba(14,165,233,0.3)]">
              <Sparkles className="w-4 h-4" style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.8))'}} />
              FOR ATHLETES
            </div>
            <GradientTextReveal
              text="D-BAT Athlete Guide"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8"
              gradientFrom="#0EA5E9"
              gradientTo="#F97316"
              delay={0.2}
            />
            <p className="text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto font-medium leading-relaxed">
              How to use The Vault to watch drills, practice with AI analysis, and level up your game
            </p>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* How It Works - Premium Flow Visualization */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/50 to-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08)_0%,transparent_70%)]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-neon-cortex-blue/20 to-solar-surge-orange/20 border border-neon-cortex-blue/30 text-neon-cortex-blue text-sm font-bold mb-6 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
              <Zap className="w-4 h-4" style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.8))'}} />
              YOUR TRAINING WORKFLOW
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              From <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cortex-blue to-green-400">Assignment</span> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-solar-surge-orange to-yellow-400">Mastery</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              7 simple steps to level up your training
            </p>
          </FadeInWhenVisible>

          {/* Desktop Flow Visualization */}
          <div className="hidden lg:block">
            <FadeInWhenVisible delay={0.1} direction="up">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange via-50% to-green-500 transform -translate-y-1/2 opacity-30 rounded-full" />
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange via-50% to-green-500 transform -translate-y-1/2 blur-lg opacity-50" />

                <div className="grid grid-cols-7 gap-4">
                  {workflowSteps.map((item, index) => {
                    const isBlue = item.color === 'blue';
                    const isOrange = item.color === 'orange';
                    const isGreen = item.color === 'green';
                    const isPurple = item.color === 'purple';
                    const colorClasses = isBlue
                      ? 'from-neon-cortex-blue to-cyan-600 border-neon-cortex-blue/60 shadow-[0_0_40px_rgba(14,165,233,0.4)]'
                      : isOrange
                      ? 'from-solar-surge-orange to-orange-600 border-solar-surge-orange/60 shadow-[0_0_40px_rgba(249,115,22,0.4)]'
                      : isGreen
                      ? 'from-green-500 to-emerald-600 border-green-500/60 shadow-[0_0_40px_rgba(34,197,94,0.4)]'
                      : 'from-purple-500 to-purple-700 border-purple-500/60 shadow-[0_0_40px_rgba(168,85,247,0.4)]';
                    const glowColor = isBlue
                      ? 'rgba(14,165,233,0.6)'
                      : isOrange
                      ? 'rgba(249,115,22,0.6)'
                      : isGreen
                      ? 'rgba(34,197,94,0.6)'
                      : 'rgba(168,85,247,0.6)';

                    return (
                      <div key={index} className="flex flex-col items-center text-center group">
                        {/* Step Number */}
                        <div className="text-xs font-bold text-white/40 mb-3">STEP {item.number}</div>

                        {/* Icon Container */}
                        <div className="relative mb-4">
                          <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 rounded-full scale-150`} />
                          <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${colorClasses} border-2 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                            <item.icon
                              className="w-9 h-9 text-white"
                              style={{filter: `drop-shadow(0 0 12px ${glowColor})`}}
                            />
                          </div>
                        </div>

                        {/* Step Label */}
                        <span className="text-white font-bold text-sm leading-tight">{item.step}</span>

                        {/* Role Indicator */}
                        <span className={`text-xs mt-2 px-2 py-1 rounded-full ${
                          isBlue ? 'bg-neon-cortex-blue/20 text-neon-cortex-blue' :
                          isOrange ? 'bg-solar-surge-orange/20 text-solar-surge-orange' :
                          isGreen ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {item.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeInWhenVisible>
          </div>

          {/* Mobile Flow Visualization */}
          <div className="lg:hidden">
            <StaggerChildren staggerDelay={0.1} className="space-y-4">
              {workflowSteps.map((item, index) => {
                const isBlue = item.color === 'blue';
                const isOrange = item.color === 'orange';
                const isGreen = item.color === 'green';
                const isPurple = item.color === 'purple';
                const borderColor = isBlue
                  ? 'border-neon-cortex-blue/40 hover:border-neon-cortex-blue'
                  : isOrange
                  ? 'border-solar-surge-orange/40 hover:border-solar-surge-orange'
                  : isGreen
                  ? 'border-green-500/40 hover:border-green-500'
                  : 'border-purple-500/40 hover:border-purple-500';
                const bgGlow = isBlue
                  ? 'from-neon-cortex-blue/20'
                  : isOrange
                  ? 'from-solar-surge-orange/20'
                  : isGreen
                  ? 'from-green-500/20'
                  : 'from-purple-500/20';
                const iconBg = isBlue
                  ? 'bg-neon-cortex-blue/20 text-neon-cortex-blue'
                  : isOrange
                  ? 'bg-solar-surge-orange/20 text-solar-surge-orange'
                  : isGreen
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-purple-500/20 text-purple-400';

                return (
                  <motion.div
                    key={index}
                    variants={staggerItemVariants}
                    className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${bgGlow} to-transparent border-2 ${borderColor} transition-all duration-300`}
                  >
                    <div className="flex-shrink-0 text-2xl font-black text-white/20">{item.number}</div>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-white font-bold">{item.step}</span>
                      <span className={`block text-xs mt-1 ${
                        isBlue ? 'text-neon-cortex-blue' : isOrange ? 'text-solar-surge-orange' : isGreen ? 'text-green-400' : 'text-purple-400'
                      }`}>
                        {item.role}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </StaggerChildren>
          </div>

          {/* Legend */}
          <FadeInWhenVisible delay={0.3} direction="up">
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-neon-cortex-blue shadow-[0_0_10px_rgba(14,165,233,0.6)]" />
                <span className="text-white/60">Notification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-solar-surge-orange shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
                <span className="text-white/60">Watch & Practice</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                <span className="text-white/60">Record & Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
                <span className="text-white/60">AI-Powered</span>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Your Three Tabs */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-gradient-to-r from-solar-surge-orange/30 to-solar-surge-orange/10 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <h2 className="text-2xl font-black mb-8 text-solar-surge-orange">Your Three Tabs</h2>

                <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-3 gap-4">
                  {tabs.map((tab, index) => (
                    <motion.div
                      key={index}
                      variants={staggerItemVariants}
                      className="group/tab p-5 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/10 hover:border-solar-surge-orange/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <tab.icon
                          className="w-5 h-5 text-solar-surge-orange"
                          style={{filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.5))'}}
                        />
                        <h3 className="font-bold text-solar-surge-orange">{tab.name}</h3>
                      </div>
                      <p className="text-sm text-white/50 mb-2">{tab.description}</p>
                      <p className="text-sm text-white font-medium">{tab.priority}</p>
                    </motion.div>
                  ))}
                </StaggerChildren>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Practice This Feature */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                    <Video
                      className="w-6 h-6 text-neon-cortex-blue"
                      style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">The "Practice This" Button</h2>
                </div>

                <p className="text-white/50 mb-10">
                  This is where the magic happens. After watching any drill:
                </p>

                {/* Desktop: Horizontal Flow with Arrows */}
                <div className="hidden md:block mb-10">
                  <div className="flex items-center justify-between">
                    {[
                      { step: 'Tap "Practice This"', detail: 'Below the video', icon: MousePointer2, color: '#38BDF8' },
                      { step: 'Lab Opens', detail: 'Swing or Pitch', icon: Video, color: '#0EA5E9' },
                      { step: 'Record Yourself', detail: 'Camera guides you', icon: Camera, color: '#0284C7' },
                      { step: 'AI Analysis', detail: 'Instant feedback', icon: BarChart3, color: '#0369A1' },
                    ].map((item, i, arr) => (
                      <div key={i} className="flex items-center">
                        <div className="flex flex-col items-center text-center group">
                          {/* Icon Container with Glow */}
                          <div className="relative mb-4">
                            <div
                              className="absolute inset-0 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300 rounded-full scale-150"
                              style={{ backgroundColor: item.color }}
                            />
                            <div
                              className="relative w-16 h-16 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300"
                              style={{
                                background: `linear-gradient(135deg, ${item.color}40, ${item.color}20)`,
                                border: `2px solid ${item.color}60`,
                                boxShadow: `0 0 25px ${item.color}30`
                              }}
                            >
                              <item.icon
                                className="w-7 h-7"
                                style={{
                                  color: item.color,
                                  filter: `drop-shadow(0 0 8px ${item.color})`
                                }}
                              />
                              {/* Step Number Badge */}
                              <div
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{
                                  backgroundColor: item.color,
                                  boxShadow: `0 0 12px ${item.color}`
                                }}
                              >
                                {i + 1}
                              </div>
                            </div>
                          </div>
                          <span className="text-white font-bold text-sm">{item.step}</span>
                          <span className="text-white/50 text-xs mt-1">{item.detail}</span>
                        </div>
                        {/* Arrow Connector */}
                        {i < arr.length - 1 && (
                          <div className="mx-4 flex items-center">
                            <div className="w-12 h-0.5 bg-gradient-to-r from-neon-cortex-blue/60 to-neon-cortex-blue/30" />
                            <ChevronRight className="w-5 h-5 text-neon-cortex-blue/60 -ml-1" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile: Vertical Flow */}
                <StaggerChildren staggerDelay={0.1} className="md:hidden space-y-4 mb-8">
                  {[
                    { step: 'Tap "Practice This"', detail: 'Below the video player', icon: MousePointer2, color: '#38BDF8' },
                    { step: 'Lab Opens', detail: 'Swing Lab or Pitch Lab', icon: Video, color: '#0EA5E9' },
                    { step: 'Record Yourself', detail: 'Camera guides you', icon: Camera, color: '#0284C7' },
                    { step: 'AI Analysis', detail: 'See what to improve', icon: BarChart3, color: '#0369A1' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItemVariants}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border-2 transition-all duration-300 hover:scale-[1.02]"
                      style={{ borderColor: `${item.color}30` }}
                    >
                      {/* Icon with glow */}
                      <div className="relative flex-shrink-0">
                        <div
                          className="absolute inset-0 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"
                          style={{ backgroundColor: item.color }}
                        />
                        <div
                          className="relative w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)`,
                            border: `1px solid ${item.color}40`
                          }}
                        >
                          <item.icon
                            className="w-6 h-6"
                            style={{ color: item.color, filter: `drop-shadow(0 0 6px ${item.color})` }}
                          />
                        </div>
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
                        >
                          {i + 1}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-white">{item.step}</span>
                        <span className="block text-sm text-white/50">{item.detail}</span>
                      </div>
                    </motion.div>
                  ))}
                </StaggerChildren>

                <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                  <p className="text-green-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" style={{filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))'}} />
                    Coach can see you actually practiced - not just watched!
                  </p>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Pro Tips */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                    <Zap
                      className="w-6 h-6 text-neon-cortex-blue"
                      style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">Pro Tips</h2>
                </div>

                <StaggerChildren staggerDelay={0.08} className="space-y-3">
                  {proTips.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItemVariants}
                      className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:border-neon-cortex-blue/30 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5 text-neon-cortex-blue flex-shrink-0 mt-0.5" style={{filter: 'drop-shadow(0 0 6px rgba(14,165,233,0.5))'}} />
                      <div>
                        <span className="font-semibold text-white">{item.tip}</span>
                        <span className="text-white/50"> - {item.why}</span>
                      </div>
                    </motion.div>
                  ))}
                </StaggerChildren>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Claiming Shared Drills */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                    <Link2
                      className="w-6 h-6 text-solar-surge-orange"
                      style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">Claiming a Shared Drill Link</h2>
                </div>

                <p className="text-white/50 mb-8">Got a link from your coach?</p>

                <StaggerChildren staggerDelay={0.1} className="space-y-3">
                  {[
                    'Tap the link (opens in app)',
                    'Preview the drill info',
                    'Tap "Claim Drill"',
                    'Find it in your For You tab',
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItemVariants}
                      className="flex items-center gap-4 group/step"
                    >
                      <div className="w-10 h-10 rounded-full bg-solar-surge-orange/20 border-2 border-solar-surge-orange/40 flex items-center justify-center text-solar-surge-orange font-bold group-hover/step:scale-110 group-hover/step:bg-solar-surge-orange/30 transition-all">
                        {i + 1}
                      </div>
                      <span className="text-white/80">{step}</span>
                    </motion.div>
                  ))}
                </StaggerChildren>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                    <HelpCircle
                      className="w-6 h-6 text-neon-cortex-blue"
                      style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">Need Help?</h2>
                </div>

                <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-2 gap-4">
                  {troubleshooting.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItemVariants}
                      className="p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:border-neon-cortex-blue/30 transition-colors"
                    >
                      <p className="font-semibold text-white mb-1">{item.issue}</p>
                      <p className="text-sm text-neon-cortex-blue">{item.solution}</p>
                    </motion.div>
                  ))}
                </StaggerChildren>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.05)_0%,transparent_60%)]" />

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08)_0%,transparent_60%)]" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <FadeInWhenVisible delay={0} direction="up">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to Train?</h2>
            <p className="text-xl text-white/60 mb-10">
              The Vault. Professional drills. Your schedule. Let&apos;s go.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/download"
                className="group relative inline-flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange" />
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
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
