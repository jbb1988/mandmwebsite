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
  Upload,
  UserPlus,
  Users,
  Link2,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Bell,
  Eye,
  Clock,
  Lightbulb,
  Sparkles,
  Zap,
  Bookmark,
  Play,
  ClipboardList,
  Heart,
  XCircle,
  HelpCircle,
  Target,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'athletes' | 'coaches' | 'parents';

interface FAQ {
  question: string;
  answer: string;
}

export default function VaultGuidePage() {
  const [activeTab, setActiveTab] = useState<TabType>('athletes');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const tabs = [
    { id: 'athletes' as TabType, label: 'Athletes', icon: Play, color: '#3B82F6' },
    { id: 'coaches' as TabType, label: 'Coaches', icon: ClipboardList, color: '#F97316' },
    { id: 'parents' as TabType, label: 'Parents', icon: Users, color: '#22C55E' },
  ];

  // Athlete content
  const athleteTabs = [
    { name: 'For You', description: 'Drills assigned by your coach', icon: Bell, color: '#3B82F6' },
    { name: 'Explore', description: 'Browse the Master Library', icon: Eye, color: '#F97316' },
    { name: 'Saved', description: 'Your bookmarked drills', icon: Bookmark, color: '#22C55E' },
  ];

  const athleteFaqs: FAQ[] = [
    {
      question: 'Where do I find drills my coach assigned?',
      answer: 'Go to The Vault and tap the "For You" tab. All drills your coach has assigned will appear here with any notes they added.'
    },
    {
      question: 'What does "Practice This" do?',
      answer: 'When you tap "Practice This" on a drill, it opens Swing Lab (or Pitch Lab) in practice mode. You can record yourself doing the drill, and your coach can see your submission and add feedback.'
    },
    {
      question: 'How do I claim a drill from a shared link?',
      answer: 'When your coach sends you a drill link (mindandmuscle.ai/d/...), just tap it! If you have the app, it opens directly to that drill. If not, you\'ll see download buttons first, then can claim it after signing in.'
    },
    {
      question: 'Can I save drills for later?',
      answer: 'Yes! Tap the bookmark icon on any drill to save it. Find all your saved drills in the "Saved" tab.'
    },
    {
      question: 'What\'s the difference between "Viewed" and "Completed"?',
      answer: 'Viewed means you watched 80%+ of the video. Completed means you marked the drill as done (usually after practicing). Completion shows your coach you\'ve actually worked on it.'
    },
    {
      question: 'Can my parents see my progress?',
      answer: 'If your parent has a linked account, they can see which drills were assigned and whether you\'ve completed them. They want to support you!'
    },
  ];

  // Coach content
  const coachTabs = [
    { name: 'For You', description: 'Drills assigned to you', icon: Bell, color: '#3B82F6' },
    { name: 'Explore', description: 'Master Library', icon: Eye, color: '#F97316' },
    { name: 'Saved', description: 'Your bookmarks', icon: Bookmark, color: '#22C55E' },
    { name: 'My Drills', description: 'Drills you uploaded', icon: Upload, color: '#A855F7' },
  ];

  const engagementColors = [
    { color: 'Green', hex: '#22C55E', status: 'Active', meaning: 'High completion, recent activity' },
    { color: 'Yellow', hex: '#EAB308', status: 'Moderate', meaning: 'Some engagement - encourage more' },
    { color: 'Red', hex: '#EF4444', status: 'Inactive', meaning: 'Low/no engagement - follow up!' },
    { color: 'Gray', hex: '#6B7280', status: 'No Assignments', meaning: 'No drills assigned yet' },
  ];

  const coachFaqs: FAQ[] = [
    {
      question: 'How do I invite athletes to join my team?',
      answer: 'Go to Team Settings → Members → tap Share. Send the link (mindandmuscle.ai/t/YOUR-CODE) via text, email, or group chat. Athletes tap the link, tap "Join Team", and they\'re in!'
    },
    {
      question: 'How do I assign a drill to athletes?',
      answer: 'Open any drill → tap "Assign" → select team(s) → check athletes → add an optional note → tap "Assign Drill". Athletes get a push notification instantly.'
    },
    {
      question: 'What\'s the difference between assigning and sharing?',
      answer: 'Assigning sends directly to athletes on your roster with a notification. Share links let you distribute drills via text/email to athletes who may not be on your team yet.'
    },
    {
      question: 'How do I know when athletes practice?',
      answer: 'You\'ll get a push notification when they submit a practice video. You can also check the Submissions tab on any drill to see who has practiced.'
    },
    {
      question: 'Can I upload my own drills?',
      answer: 'Yes! Go to My Drills → tap the + button. Upload a video (max 5 minutes, 1-3 min ideal), add title, description, category, and age range.'
    },
    {
      question: 'What\'s the difference between The Vault and Swing Lab?',
      answer: 'The Vault is your drill library - where you create, store, and assign instructional drills. Swing Lab is where athletes record and analyze their swings. When an athlete taps "Practice This", it opens Swing Lab with context.'
    },
  ];

  // Parent content
  const parentMetrics = [
    { icon: CheckCircle2, label: 'Drills Assigned', description: 'How many drills coach has given' },
    { icon: Eye, label: 'Drills Viewed', description: 'Videos watched 80%+' },
    { icon: Target, label: 'Drills Completed', description: 'Marked as done after practice' },
    { icon: Clock, label: 'Last Activity', description: 'When they last trained' },
  ];

  const supportDos = [
    'Ask "What drill are you working on this week?"',
    'Celebrate completion, not just results',
    'Let the coach handle technique feedback',
    'Check in weekly, not daily',
  ];

  const supportDonts = [
    'Don\'t hover over every session',
    'Don\'t compare to other athletes',
    'Don\'t criticize technique yourself',
    'Don\'t nag about incomplete drills',
  ];

  const parentFaqs: FAQ[] = [
    {
      question: 'What can I see about my child\'s training?',
      answer: 'You can see which drills were assigned, whether they\'ve been viewed and completed, and their overall engagement level. The goal is visibility without micromanaging.'
    },
    {
      question: 'How do I link to my child\'s account?',
      answer: 'Go to Settings → Family → Add Child. Your child can approve the link from their app. Once linked, you\'ll see their progress in your dashboard.'
    },
    {
      question: 'What do the completion colors mean?',
      answer: 'Green = actively training and completing drills. Yellow = some engagement but room for improvement. Red = little/no recent activity. Gray = no drills assigned yet.'
    },
    {
      question: 'Should I watch the drills too?',
      answer: 'That\'s up to you! Watching can help you understand what your child is learning. But remember - the coach is the expert. Your role is support, not instruction.'
    },
    {
      question: 'How do I encourage without nagging?',
      answer: 'Ask open-ended questions: "What did you work on today?" vs "Did you do your drills?" Celebrate effort and consistency, not just performance.'
    },
    {
      question: 'Is this worth the Pro subscription?',
      answer: 'With Pro, athletes get unlimited access to the drill library, AI analysis, and your family gets visibility into their training. Consider what private lessons cost - this extends that coaching between sessions.'
    },
  ];

  const loopSteps = [
    { step: 'Coach assigns drill', icon: UserPlus, color: 'orange', number: 1 },
    { step: 'Athlete gets notified', icon: Bell, color: 'blue', number: 2 },
    { step: 'Watches the drill', icon: Eye, color: 'blue', number: 3 },
    { step: 'Taps "Practice This"', icon: Zap, color: 'blue', number: 4 },
    { step: 'Records in Lab', icon: Upload, color: 'blue', number: 5 },
    { step: 'AI analyzes', icon: Sparkles, color: 'purple', number: 6 },
    { step: 'Coach sees results', icon: CheckCircle2, color: 'orange', number: 7 },
  ];

  const currentFaqs = activeTab === 'athletes' ? athleteFaqs : activeTab === 'coaches' ? coachFaqs : parentFaqs;

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
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Premium Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F3A] via-[#0F1123] to-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.1)_0%,transparent_50%)]" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <FadeInWhenVisible delay={0.1} direction="up" className="text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-solar-surge-orange/30 blur-2xl rounded-full" />
                <Image
                  src="/assets/images/the_vault_icon.png"
                  alt="The Vault"
                  width={80}
                  height={80}
                  className="relative object-contain"
                  style={{filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.6))'}}
                />
              </div>
            </div>
            <GradientTextReveal
              text="The Vault Guide"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6"
              gradientFrom="#F97316"
              gradientTo="#0EA5E9"
              delay={0.2}
            />
            <p className="text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto font-medium leading-relaxed mb-8">
              Your complete guide to the drill library
            </p>

            {/* What is The Vault */}
            <div className="max-w-2xl mx-auto text-left bg-white/[0.03] rounded-2xl border border-white/10 p-6">
              <h3 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-solar-surge-orange" />
                What is The Vault?
              </h3>
              <p className="text-white/60 leading-relaxed">
                The Vault is a curated library of training drills created by expert coaches.
                Coaches can assign drills to athletes, athletes practice and record themselves,
                and AI tracks engagement - creating accountability between lessons.
              </p>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Role Tabs - Sticky */}
      <section className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 bg-[#0F1123]/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setExpandedFAQ(null);
                  }}
                  className={`group relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    isActive
                      ? 'text-white scale-105'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${tab.color}30, ${tab.color}10)`,
                    border: `2px solid ${tab.color}60`,
                    boxShadow: `0 0 30px ${tab.color}30`
                  } : {
                    border: '2px solid transparent'
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={isActive ? {
                      color: tab.color,
                      filter: `drop-shadow(0 0 8px ${tab.color})`
                    } : {}}
                  />
                  <span style={isActive ? { color: tab.color } : {}}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Training Loop */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/50 to-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08)_0%,transparent_70%)]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-solar-surge-orange/20 to-neon-cortex-blue/20 border border-solar-surge-orange/30 text-solar-surge-orange text-sm font-bold mb-6 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
              <Zap className="w-4 h-4" style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.8))'}} />
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              The Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange">Training Loop</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              From assignment to accountability in 7 steps
            </p>
          </FadeInWhenVisible>

          {/* Desktop Loop Visualization */}
          <div className="hidden lg:block">
            <FadeInWhenVisible delay={0.1} direction="up">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-solar-surge-orange via-neon-cortex-blue via-60% to-solar-surge-orange transform -translate-y-1/2 opacity-30 rounded-full" />
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-solar-surge-orange via-neon-cortex-blue via-60% to-solar-surge-orange transform -translate-y-1/2 blur-lg opacity-50" />

                <div className="grid grid-cols-7 gap-4">
                  {loopSteps.map((item, index) => {
                    const isOrange = item.color === 'orange';
                    const isPurple = item.color === 'purple';
                    const colorClasses = isOrange
                      ? 'from-solar-surge-orange to-orange-600 border-solar-surge-orange/60 shadow-[0_0_40px_rgba(249,115,22,0.4)]'
                      : isPurple
                      ? 'from-purple-500 to-purple-700 border-purple-500/60 shadow-[0_0_40px_rgba(168,85,247,0.4)]'
                      : 'from-neon-cortex-blue to-cyan-600 border-neon-cortex-blue/60 shadow-[0_0_40px_rgba(14,165,233,0.4)]';
                    const glowColor = isOrange
                      ? 'rgba(249,115,22,0.6)'
                      : isPurple
                      ? 'rgba(168,85,247,0.6)'
                      : 'rgba(14,165,233,0.6)';

                    return (
                      <div key={index} className="flex flex-col items-center text-center group">
                        <div className="text-xs font-bold text-white/40 mb-3">STEP {item.number}</div>
                        <div className="relative mb-4">
                          <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 rounded-full scale-150`} />
                          <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${colorClasses} border-2 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                            <item.icon
                              className="w-9 h-9 text-white"
                              style={{filter: `drop-shadow(0 0 12px ${glowColor})`}}
                            />
                          </div>
                        </div>
                        <span className="text-white font-bold text-sm leading-tight">{item.step}</span>
                        <span className={`text-xs mt-2 px-2 py-1 rounded-full ${
                          isOrange ? 'bg-solar-surge-orange/20 text-solar-surge-orange' :
                          isPurple ? 'bg-purple-500/20 text-purple-400' :
                          'bg-neon-cortex-blue/20 text-neon-cortex-blue'
                        }`}>
                          {isOrange ? 'Coach' : isPurple ? 'AI' : 'Athlete'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeInWhenVisible>
          </div>

          {/* Mobile Loop Visualization */}
          <div className="lg:hidden">
            <StaggerChildren staggerDelay={0.1} className="space-y-4">
              {loopSteps.map((item, index) => {
                const isOrange = item.color === 'orange';
                const isPurple = item.color === 'purple';
                const borderColor = isOrange
                  ? 'border-solar-surge-orange/40 hover:border-solar-surge-orange'
                  : isPurple
                  ? 'border-purple-500/40 hover:border-purple-500'
                  : 'border-neon-cortex-blue/40 hover:border-neon-cortex-blue';
                const bgGlow = isOrange
                  ? 'from-solar-surge-orange/20'
                  : isPurple
                  ? 'from-purple-500/20'
                  : 'from-neon-cortex-blue/20';
                const iconBg = isOrange
                  ? 'bg-solar-surge-orange/20 text-solar-surge-orange'
                  : isPurple
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-neon-cortex-blue/20 text-neon-cortex-blue';

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
                        isOrange ? 'text-solar-surge-orange' : isPurple ? 'text-purple-400' : 'text-neon-cortex-blue'
                      }`}>
                        {isOrange ? 'Coach action' : isPurple ? 'AI-powered' : 'Athlete action'}
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
                <div className="w-3 h-3 rounded-full bg-solar-surge-orange shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
                <span className="text-white/60">Coach Actions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-neon-cortex-blue shadow-[0_0_10px_rgba(14,165,233,0.6)]" />
                <span className="text-white/60">Athlete Actions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
                <span className="text-white/60">AI-Powered</span>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Athletes Tab Content */}
          {activeTab === 'athletes' && (
            <>
              {/* Your Three Tabs */}
              <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-[#0F1123]" />
                <div className="max-w-4xl mx-auto relative z-10">
                  <FadeInWhenVisible delay={0} direction="up">
                    <div className="group relative">
                      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                        <h2 className="text-2xl font-black mb-8 text-neon-cortex-blue">Your Tabs in The Vault</h2>
                        <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-3 gap-5">
                          {athleteTabs.map((tab, index) => {
                            const Icon = tab.icon;
                            return (
                              <motion.div
                                key={index}
                                variants={staggerItemVariants}
                                className="group/tab relative p-5 bg-white/[0.03] rounded-2xl border-2 transition-all duration-300 hover:scale-[1.03]"
                                style={{ borderColor: `${tab.color}30` }}
                              >
                                <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover/tab:opacity-30 transition-opacity duration-300" style={{ backgroundColor: tab.color }} />
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b-full" style={{ backgroundColor: tab.color, boxShadow: `0 0 15px ${tab.color}` }} />
                                <div className="relative flex flex-col items-center text-center pt-2">
                                  <div className="relative mb-4">
                                    <div className="absolute inset-0 blur-xl opacity-50 group-hover/tab:opacity-80 transition-opacity duration-300 rounded-full scale-150" style={{ backgroundColor: tab.color }} />
                                    <div className="relative w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tab.color}40, ${tab.color}15)`, border: `2px solid ${tab.color}50` }}>
                                      <Icon className="w-7 h-7" style={{ color: tab.color, filter: `drop-shadow(0 0 8px ${tab.color})` }} />
                                    </div>
                                  </div>
                                  <h3 className="font-bold text-lg mb-1" style={{ color: tab.color }}>{tab.name}</h3>
                                  <p className="text-sm text-white/50">{tab.description}</p>
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

              {/* Practice This Feature */}
              <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />
                <div className="max-w-4xl mx-auto relative z-10">
                  <FadeInWhenVisible delay={0} direction="up">
                    <div className="group relative">
                      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                            <Zap className="w-6 h-6 text-solar-surge-orange" style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))'}} />
                          </div>
                          <h2 className="text-2xl font-black text-white">The &quot;Practice This&quot; Button</h2>
                        </div>
                        <p className="text-white/60 mb-6">This is where the magic happens. Here&apos;s how to use it:</p>
                        <div className="space-y-4">
                          {[
                            { step: 'Open a drill from For You or Explore', icon: Eye },
                            { step: 'Watch the video to learn the technique', icon: Play },
                            { step: 'Tap "Practice This" button', icon: Zap },
                            { step: 'Record yourself doing the drill', icon: Upload },
                            { step: 'Submit - AI analyzes, coach gets notified', icon: Sparkles },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                              <div className="w-10 h-10 rounded-xl bg-solar-surge-orange/20 flex items-center justify-center flex-shrink-0">
                                <item.icon className="w-5 h-5 text-solar-surge-orange" />
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-solar-surge-orange font-bold">{i + 1}.</span>
                                <span className="text-white/80">{item.step}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </FadeInWhenVisible>
                </div>
              </section>

              {/* Pro Tips */}
              <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-[#0F1123]" />
                <div className="max-w-4xl mx-auto relative z-10">
                  <FadeInWhenVisible delay={0} direction="up">
                    <div className="group relative">
                      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                            <Lightbulb className="w-6 h-6 text-neon-cortex-blue" style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}} />
                          </div>
                          <h2 className="text-2xl font-black text-white">Pro Tips</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {[
                            { tip: 'Save drills you want to revisit', why: 'Build your personal library' },
                            { tip: 'Mark drills complete after practicing', why: 'Shows coach you\'re working' },
                            { tip: 'Check For You tab regularly', why: 'New assignments appear here' },
                            { tip: 'Use Practice This for accountability', why: 'Coach sees your submissions' },
                          ].map((item, i) => (
                            <div key={i} className="p-4 bg-white/[0.03] rounded-xl border border-white/10">
                              <p className="font-semibold text-white mb-1">{item.tip}</p>
                              <p className="text-sm text-neon-cortex-blue">{item.why}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </FadeInWhenVisible>
                </div>
              </section>
            </>
          )}

          {/* Coaches Tab Content */}
          {activeTab === 'coaches' && (
            <>
              {/* Your Four Tabs */}
              <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-[#0F1123]" />
                <div className="max-w-4xl mx-auto relative z-10">
                  <FadeInWhenVisible delay={0} direction="up">
                    <div className="group relative">
                      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                        <h2 className="text-2xl font-black mb-8 text-solar-surge-orange">Your Tabs in The Vault</h2>
                        <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                          {coachTabs.map((tab, index) => {
                            const Icon = tab.icon;
                            return (
                              <motion.div
                                key={index}
                                variants={staggerItemVariants}
                                className="group/tab relative p-5 bg-white/[0.03] rounded-2xl border-2 transition-all duration-300 hover:scale-[1.03]"
                                style={{ borderColor: `${tab.color}30` }}
                              >
                                <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover/tab:opacity-30 transition-opacity duration-300" style={{ backgroundColor: tab.color }} />
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b-full" style={{ backgroundColor: tab.color, boxShadow: `0 0 15px ${tab.color}` }} />
                                <div className="relative flex flex-col items-center text-center pt-2">
                                  <div className="relative mb-4">
                                    <div className="absolute inset-0 blur-xl opacity-50 group-hover/tab:opacity-80 transition-opacity duration-300 rounded-full scale-150" style={{ backgroundColor: tab.color }} />
                                    <div className="relative w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tab.color}40, ${tab.color}15)`, border: `2px solid ${tab.color}50` }}>
                                      <Icon className="w-7 h-7" style={{ color: tab.color, filter: `drop-shadow(0 0 8px ${tab.color})` }} />
                                    </div>
                                  </div>
                                  <h3 className="font-bold text-lg mb-1" style={{ color: tab.color }}>{tab.name}</h3>
                                  <p className="text-sm text-white/50">{tab.description}</p>
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

              {/* How to Assign */}
              <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />
                <div className="max-w-5xl mx-auto relative z-10">
                  <FadeInWhenVisible delay={0} direction="up" className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-black text-white">How to Assign Drills</h2>
                  </FadeInWhenVisible>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Method 1 */}
                    <FadeInWhenVisible delay={0.1} direction="left">
                      <div className="group relative h-full">
                        <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />
                        <div className="relative h-full backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 hover:border-neon-cortex-blue p-6 shadow-[0_0_30px_rgba(14,165,233,0.15)] transition-all duration-300">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                              <Users className="w-6 h-6 text-neon-cortex-blue" />
                            </div>
                            <h3 className="text-xl font-bold text-neon-cortex-blue">Direct Assignment</h3>
                          </div>
                          <div className="space-y-3">
                            {[
                              'Open any drill',
                              'Tap "Assign" button',
                              'Select team(s)',
                              'Check athletes',
                              'Add optional note',
                              'Tap "Assign Drill"',
                            ].map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-neon-cortex-blue">{i + 1}</div>
                                <span className="text-white/70 text-sm">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </FadeInWhenVisible>

                    {/* Method 2 */}
                    <FadeInWhenVisible delay={0.2} direction="right">
                      <div className="group relative h-full">
                        <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />
                        <div className="relative h-full backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 hover:border-solar-surge-orange p-6 shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all duration-300">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                              <Link2 className="w-6 h-6 text-solar-surge-orange" />
                            </div>
                            <h3 className="text-xl font-bold text-solar-surge-orange">Share Link</h3>
                          </div>
                          <div className="space-y-3">
                            {[
                              'Open drill -> Tap "Share"',
                              'Configure options',
                              'Generate link',
                              'Send via text/email',
                            ].map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-solar-surge-orange/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-solar-surge-orange">{i + 1}</div>
                                <span className="text-white/70 text-sm">{step}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                            <p className="text-sm text-white/50">
                              Link format: <code className="text-solar-surge-orange font-mono">mindandmuscle.ai/d/AbC12345</code>
                            </p>
                          </div>
                        </div>
                      </div>
                    </FadeInWhenVisible>
                  </div>
                </div>
              </section>

              {/* Tracking Engagement */}
              <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-[#0F1123]" />
                <div className="max-w-4xl mx-auto relative z-10">
                  <FadeInWhenVisible delay={0} direction="up">
                    <div className="group relative">
                      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                            <BarChart3 className="w-6 h-6 text-neon-cortex-blue" />
                          </div>
                          <h2 className="text-2xl font-black text-white">Tracking Engagement</h2>
                        </div>
                        <p className="text-white/50 mb-6">Find this in: <span className="text-neon-cortex-blue font-semibold">Coach Dashboard → Training Engagement</span></p>
                        <h3 className="font-bold text-lg mb-4 text-white">Color Codes</h3>
                        <StaggerChildren staggerDelay={0.08} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {engagementColors.map((item, i) => (
                            <motion.div key={i} variants={staggerItemVariants} className="p-4 bg-white/[0.03] rounded-xl border-l-4" style={{ borderColor: item.hex }}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.hex, boxShadow: `0 0 10px ${item.hex}` }} />
                                <span className="font-bold text-sm" style={{ color: item.hex }}>{item.status}</span>
                              </div>
                              <p className="text-xs text-white/50">{item.meaning}</p>
                            </motion.div>
                          ))}
                        </StaggerChildren>
                      </div>
                    </div>
                  </FadeInWhenVisible>
                </div>
              </section>

              {/* Best Practices */}
              <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />
                <div className="max-w-4xl mx-auto relative z-10">
                  <FadeInWhenVisible delay={0} direction="up">
                    <div className="group relative">
                      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                            <Lightbulb className="w-6 h-6 text-solar-surge-orange" />
                          </div>
                          <h2 className="text-2xl font-black text-white">Best Practices</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h3 className="font-bold text-lg mb-4 text-solar-surge-orange">Assignment Strategy</h3>
                            <ul className="space-y-3">
                              {['2-3 drills per week max', 'Add personal notes', 'Check engagement weekly', 'Follow up with inactive athletes'].map((tip, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-solar-surge-orange flex-shrink-0 mt-0.5" />
                                  <span className="text-white/70 text-sm">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-4 text-solar-surge-orange">Upload Tips</h3>
                            <ul className="space-y-3">
                              {['Under 3 minutes', 'One concept per drill', 'Clear titles', 'Show common mistakes'].map((tip, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-solar-surge-orange flex-shrink-0 mt-0.5" />
                                  <span className="text-white/70 text-sm">{tip}</span>
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
            </>
          )}

          {/* Parents Tab Content */}
          {activeTab === 'parents' && (
            <>
              {/* The Big Picture */}
              <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-[#0F1123]" />
                <div className="max-w-4xl mx-auto relative z-10">
                  <FadeInWhenVisible delay={0} direction="up">
                    <div className="group relative">
                      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-emerald-500/30 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-emerald-500/40 p-8 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                          </div>
                          <h2 className="text-2xl font-black text-white">The Big Picture</h2>
                        </div>
                        <p className="text-white/70 mb-6 leading-relaxed">
                          The Vault extends coaching between lessons. Your child&apos;s coach assigns drill videos,
                          your child practices and records themselves, AI tracks engagement, and you can see progress -
                          without being overbearing.
                        </p>
                        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <p className="text-emerald-400 font-semibold">Your role: Support, don&apos;t instruct.</p>
                          <p className="text-white/50 text-sm mt-1">The coach handles technique. You handle encouragement.</p>
                        </div>
                      </div>
                    </div>
                  </FadeInWhenVisible>
                </div>
              </section>

              {/* What You Can See */}
              <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />
                <div className="max-w-4xl mx-auto relative z-10">
                  <FadeInWhenVisible delay={0} direction="up">
                    <div className="group relative">
                      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                            <Eye className="w-6 h-6 text-neon-cortex-blue" />
                          </div>
                          <h2 className="text-2xl font-black text-white">What You Can See</h2>
                        </div>
                        <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-2 gap-4">
                          {parentMetrics.map((item, i) => (
                            <motion.div key={i} variants={staggerItemVariants} className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                              <div className="p-2 rounded-lg bg-neon-cortex-blue/20">
                                <item.icon className="w-5 h-5 text-neon-cortex-blue" />
                              </div>
                              <div>
                                <p className="font-semibold text-white">{item.label}</p>
                                <p className="text-sm text-white/50">{item.description}</p>
                              </div>
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
                      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-emerald-500/30 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-emerald-500/40 p-8 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                            <Heart className="w-6 h-6 text-emerald-400" />
                          </div>
                          <h2 className="text-2xl font-black text-white">How to Support</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h3 className="font-bold text-lg mb-4 text-emerald-400 flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5" /> Do This
                            </h3>
                            <ul className="space-y-3">
                              {supportDos.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-white/70 text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-4 text-red-400 flex items-center gap-2">
                              <XCircle className="w-5 h-5" /> Avoid This
                            </h3>
                            <ul className="space-y-3">
                              {supportDonts.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
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

              {/* Weekly Check-In Questions */}
              <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />
                <div className="max-w-4xl mx-auto relative z-10">
                  <FadeInWhenVisible delay={0} direction="up">
                    <div className="group relative">
                      <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                            <MessageCircle className="w-6 h-6 text-neon-cortex-blue" />
                          </div>
                          <h2 className="text-2xl font-black text-white">Better Check-In Questions</h2>
                        </div>
                        <div className="space-y-4">
                          {[
                            { bad: 'Did you do your drills?', good: 'What drill are you working on this week?' },
                            { bad: 'Why haven\'t you practiced?', good: 'Is there anything making training hard right now?' },
                            { bad: 'Your coach said you\'re behind.', good: 'How are you feeling about your progress?' },
                          ].map((item, i) => (
                            <div key={i} className="grid sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                <p className="text-red-400 text-xs font-bold mb-1">INSTEAD OF:</p>
                                <p className="text-white/70 text-sm">&quot;{item.bad}&quot;</p>
                              </div>
                              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <p className="text-emerald-400 text-xs font-bold mb-1">TRY:</p>
                                <p className="text-white/70 text-sm">&quot;{item.good}&quot;</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </FadeInWhenVisible>
                </div>
              </section>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* FAQ Section - Role Specific */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div
                className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                style={{
                  backgroundColor: activeTab === 'athletes' ? '#3B82F6' : activeTab === 'coaches' ? '#F97316' : '#22C55E',
                  opacity: 0.3
                }}
              />
              <div
                className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 p-8 md:p-12 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                style={{
                  borderColor: activeTab === 'athletes' ? 'rgba(59,130,246,0.4)' : activeTab === 'coaches' ? 'rgba(249,115,22,0.4)' : 'rgba(34,197,94,0.4)'
                }}
              >
                <h2 className="text-3xl font-black mb-10 text-white">
                  {activeTab === 'athletes' ? 'Athlete' : activeTab === 'coaches' ? 'Coach' : 'Parent'} FAQ
                </h2>

                <div className="space-y-4">
                  {currentFaqs.map((faq, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden hover:border-white/20 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="font-semibold text-white pr-4">{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${expandedFAQ === index ? 'rotate-180' : ''}`}
                          style={{
                            color: activeTab === 'athletes' ? '#3B82F6' : activeTab === 'coaches' ? '#F97316' : '#22C55E'
                          }}
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.08)_0%,transparent_60%)]" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <FadeInWhenVisible delay={0} direction="up">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-white/60 mb-10">
              Download the app and explore The Vault
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/download"
                className="group relative inline-flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-solar-surge-orange to-amber-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-solar-surge-orange to-amber-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                <span className="relative text-white">Download the App</span>
                <ArrowRight className="relative w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="mailto:support@mindandmuscle.ai"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-white/[0.05] border-2 border-white/20 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300 text-white"
              >
                Questions? Email Support
              </a>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  );
}
