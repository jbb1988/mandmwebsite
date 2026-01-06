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
  ArrowLeft,
  ArrowRight,
  Bell,
  Eye,
  Clock,
  MessageSquare,
  Lightbulb,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
}

export default function InstructorGuidePage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const tabs = [
    { name: 'For You', description: 'Drills assigned to you', use: 'Your own training' },
    { name: 'Explore', description: 'Master Library', use: 'Find drills to assign' },
    { name: 'Saved', description: 'Your bookmarks', use: 'Quick access to favorites' },
    { name: 'My Drills', description: 'Drills you uploaded', use: 'Manage your content' },
  ];

  const engagementColors = [
    { color: 'Green', hex: '#22C55E', status: 'Active', meaning: 'High completion, recent activity' },
    { color: 'Yellow', hex: '#EAB308', status: 'Moderate', meaning: 'Some engagement - encourage more' },
    { color: 'Red', hex: '#EF4444', status: 'Inactive', meaning: 'Low/no engagement - follow up!' },
    { color: 'Gray', hex: '#6B7280', status: 'No Assignments', meaning: 'No drills assigned yet' },
  ];

  const quickActions = [
    { action: 'Invite athletes to team', how: 'Team Settings -> Members -> Share link' },
    { action: 'Assign a drill', how: 'Open drill -> Assign -> Select athletes' },
    { action: 'Create drill share link', how: 'Open drill -> Share -> Generate' },
    { action: 'Check who\'s training', how: 'Dashboard -> Training Engagement' },
    { action: 'Message an athlete', how: 'Tap athlete card -> DM' },
    { action: 'Upload new drill', how: 'My Drills -> + button' },
  ];

  const faqs: FAQ[] = [
    {
      question: 'How do I invite athletes to join my team?',
      answer: 'The easiest way is to share your team invite link. Go to Team Settings → Members tab → tap Share. Send the link (mindandmuscle.ai/t/YOUR-CODE) via text, email, or group chat. Athletes tap the link, tap "Join Team", and they\'re in! No code entry needed. You can also share the code directly as a backup method.'
    },
    {
      question: 'How do I know when an athlete practices?',
      answer: 'You\'ll receive a push notification when athletes submit practice videos. You can also check the Submissions tab on any drill to see who has practiced and who hasn\'t.'
    },
    {
      question: 'Can I assign the same drill to multiple athletes?',
      answer: 'Absolutely! When assigning a drill, you can select as many athletes as you want. Each athlete receives their own assignment and can submit their own practice video.'
    },
    {
      question: 'What if an athlete doesn\'t have the app?',
      answer: 'Share your team invite link with them! They\'ll see a preview page with download buttons. After downloading and creating an account, they tap the link again (or tap "Open in App") and join your team instantly. Way easier than telling them a code to remember.'
    },
    {
      question: 'How do share links work?',
      answer: 'Share links let you distribute drills to athletes who aren\'t on your team roster yet. Generate a unique link from any drill and send it via text, email, or messaging apps. When athletes open the link, they\'ll be prompted to download the app (if needed) and claim the drill.'
    },
    {
      question: 'What\'s the difference between The Vault and Swing Lab?',
      answer: 'The Vault is your drill library - where you create, store, and assign instructional drills. Swing Lab is where athletes record and analyze their own swings. When an athlete taps "Practice This" on a drill, it opens Swing Lab with context about which drill they\'re practicing.'
    },
    {
      question: 'Can I upload my own drills?',
      answer: 'Yes! Go to My Drills -> tap the + button. Upload a video (max 5 minutes, 1-3 min ideal), add title, description, category, and age range. Your drill is ready to assign to athletes.'
    },
    {
      question: 'Do athletes get notified when I give feedback?',
      answer: 'Yes! When you add feedback to an athlete\'s practice analysis, they receive a push notification. They can open the notification to see your coaching notes directly on their analysis.'
    },
    {
      question: 'Can parents see assigned drills?',
      answer: 'Parents with linked athlete accounts can see their child\'s progress and completed training. They can view that a drill was assigned and whether it was completed, but detailed coaching feedback is primarily for the athlete.'
    }
  ];

  const loopSteps = [
    { step: 'You assign drill', icon: UserPlus, color: 'orange', number: 1 },
    { step: 'Athlete gets notified', icon: Bell, color: 'blue', number: 2 },
    { step: 'Watches your drill', icon: Eye, color: 'blue', number: 3 },
    { step: 'Taps "Practice This"', icon: Zap, color: 'blue', number: 4 },
    { step: 'Records in Lab', icon: Upload, color: 'blue', number: 5 },
    { step: 'AI analyzes', icon: Sparkles, color: 'purple', number: 6 },
    { step: 'You see results', icon: CheckCircle2, color: 'orange', number: 7 },
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.1)_0%,transparent_50%)]" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Back Link */}
          <FadeInWhenVisible delay={0} direction="down">
            <Link
              href="/dbat/vault"
              className="inline-flex items-center gap-2 text-solar-surge-orange hover:text-solar-surge-orange/80 transition-colors mb-12 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Resources
            </Link>
          </FadeInWhenVisible>

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
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-solar-surge-orange/20 to-neon-cortex-blue/20 border border-solar-surge-orange/30 text-solar-surge-orange text-sm font-bold mb-8 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <Sparkles className="w-4 h-4" style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.8))'}} />
              FOR COACHES & INSTRUCTORS
            </div>
            <GradientTextReveal
              text="D-BAT Instructor Guide"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8"
              gradientFrom="#F97316"
              gradientTo="#0EA5E9"
              delay={0.2}
            />
            <p className="text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto font-medium leading-relaxed">
              How to use The Vault to assign drills, track athlete progress, and extend your coaching between lessons
            </p>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* The Complete Loop - Premium Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/50 to-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08)_0%,transparent_70%)]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-solar-surge-orange/20 to-neon-cortex-blue/20 border border-solar-surge-orange/30 text-solar-surge-orange text-sm font-bold mb-6 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
              <Zap className="w-4 h-4" style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.8))'}} />
              THE COMPLETE TRAINING LOOP
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              From Assignment to <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange">Accountability</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              No more &quot;did you practice?&quot; — you&apos;ll <span className="text-neon-cortex-blue font-bold">SEE</span> who did.
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
                          isOrange ? 'bg-solar-surge-orange/20 text-solar-surge-orange' :
                          isPurple ? 'bg-purple-500/20 text-purple-400' :
                          'bg-neon-cortex-blue/20 text-neon-cortex-blue'
                        }`}>
                          {isOrange ? 'You' : isPurple ? 'AI' : 'Athlete'}
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
                        {isOrange ? 'Your action' : isPurple ? 'AI-powered' : 'Athlete action'}
                      </span>
                    </div>
                    {index < loopSteps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-white/30 rotate-90 lg:rotate-0" />
                    )}
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
                <span className="text-white/60">Your Actions</span>
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

      {/* Your Four Tabs */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-gradient-to-r from-solar-surge-orange/30 to-solar-surge-orange/10 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <h2 className="text-2xl font-black mb-8 text-solar-surge-orange">Your Four Tabs in The Vault</h2>

                <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-2 gap-4">
                  {tabs.map((tab, index) => (
                    <motion.div
                      key={index}
                      variants={staggerItemVariants}
                      className="group/tab p-5 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/10 hover:border-solar-surge-orange/40 transition-all duration-300"
                    >
                      <h3 className="font-bold text-solar-surge-orange mb-2">{tab.name}</h3>
                      <p className="text-sm text-white/50 mb-2">{tab.description}</p>
                      <p className="text-sm text-white/70">Use for: {tab.use}</p>
                    </motion.div>
                  ))}
                </StaggerChildren>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* How to Assign Drills - Two Methods */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white">How to Assign Drills</h2>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Method 1: Direct Assignment */}
            <FadeInWhenVisible delay={0.1} direction="left">
              <div className="group relative h-full">
                <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

                <div className="relative h-full backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 hover:border-neon-cortex-blue p-6 shadow-[0_0_30px_rgba(14,165,233,0.15)] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                      <Users
                        className="w-6 h-6 text-neon-cortex-blue"
                        style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-neon-cortex-blue">Method 1: Direct Assignment</h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      'Open any drill (yours or from Master Library)',
                      'Tap "Assign" button',
                      'Select team(s)',
                      'Check athletes (or "Select All")',
                      'Add optional note - PRO TIP: Personalize it!',
                      'Tap "Assign Drill"',
                      'Athletes get push notification instantly'
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3 group/step">
                        <div className="w-7 h-7 rounded-full bg-neon-cortex-blue/20 border border-neon-cortex-blue/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-neon-cortex-blue group-hover/step:bg-neon-cortex-blue/30 transition-colors">
                          {i + 1}
                        </div>
                        <span className="text-white/70 text-sm leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Method 2: Share Link */}
            <FadeInWhenVisible delay={0.2} direction="right">
              <div className="group relative h-full">
                <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

                <div className="relative h-full backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 hover:border-solar-surge-orange p-6 shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                      <Link2
                        className="w-6 h-6 text-solar-surge-orange"
                        style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))'}}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-solar-surge-orange">Method 2: Share Link</h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      'Open your drill -> Tap "Share"',
                      'Configure options:',
                      '  Multi-use or Single-use',
                      '  Max uses (optional)',
                      '  Expiration (optional)',
                      'Tap "Generate Link"',
                      'Copy or Share via text/email/WhatsApp'
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {!step.startsWith('  ') ? (
                          <div className="w-7 h-7 rounded-full bg-solar-surge-orange/20 border border-solar-surge-orange/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-solar-surge-orange">
                            {i < 2 ? i + 1 : i - 2}
                          </div>
                        ) : (
                          <div className="w-7 flex items-center justify-center text-solar-surge-orange/60">-</div>
                        )}
                        <span className={`text-sm leading-relaxed ${step.startsWith('  ') ? 'text-white/50' : 'text-white/70'}`}>
                          {step.trim()}
                        </span>
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.05)_0%,transparent_60%)]" />

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
                  <h2 className="text-2xl font-black text-white">Tracking Athlete Engagement</h2>
                </div>

                <p className="text-white/50 mb-8">
                  Find this in: <span className="text-neon-cortex-blue font-semibold">Coach Dashboard → Training Engagement</span>
                </p>

                <h3 className="font-bold text-lg mb-4 text-white">Color Codes</h3>
                <StaggerChildren staggerDelay={0.08} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
                  {engagementColors.map((item, i) => (
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
                      <p className="text-xs text-white/50">{item.meaning}</p>
                    </motion.div>
                  ))}
                </StaggerChildren>

                <h3 className="font-bold text-lg mb-4 text-white">Per-Athlete Metrics</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { metric: 'Total Assigned', meaning: 'Drills you\'ve given them' },
                    { metric: 'Viewed', meaning: 'Watched 80%+ of video' },
                    { metric: 'Completed', meaning: 'Marked as done' },
                    { metric: 'Last Activity', meaning: 'When they last engaged' },
                    { metric: 'Completion Rate', meaning: 'Completions / Assignments' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:border-neon-cortex-blue/30 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-neon-cortex-blue flex-shrink-0" style={{filter: 'drop-shadow(0 0 6px rgba(14,165,233,0.5))'}} />
                      <div>
                        <span className="font-semibold text-white">{item.metric}</span>
                        <span className="text-white/50"> - {item.meaning}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Best Practices */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                    <Lightbulb
                      className="w-6 h-6 text-solar-surge-orange"
                      style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">Best Practices</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-solar-surge-orange">Assignment Strategy</h3>
                    <ul className="space-y-3">
                      {[
                        '2-3 drills per week - Don\'t overwhelm',
                        'Add personal notes - "Focus on hip rotation" beats generic',
                        'Check engagement weekly - Follow up with inactive athletes',
                        'Use share links for groups - Faster than individual assignments',
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 group/tip">
                          <CheckCircle2 className="w-5 h-5 text-solar-surge-orange flex-shrink-0 mt-0.5 group-hover/tip:scale-110 transition-transform" style={{filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.5))'}} />
                          <span className="text-white/70 text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-4 text-solar-surge-orange">Upload Tips</h3>
                    <ul className="space-y-3">
                      {[
                        'Under 3 minutes - Attention spans are short',
                        'One concept per drill - Don\'t overload',
                        'Clear titles - "Power Hip Rotation" > "Drill 47"',
                        'Show common mistakes - What NOT to do',
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 group/tip">
                          <CheckCircle2 className="w-5 h-5 text-solar-surge-orange flex-shrink-0 mt-0.5 group-hover/tip:scale-110 transition-transform" style={{filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.5))'}} />
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

      {/* Quick Actions */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />

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
                  <h2 className="text-2xl font-black text-white">Quick Actions</h2>
                </div>

                <StaggerChildren staggerDelay={0.08} className="grid sm:grid-cols-2 gap-3">
                  {quickActions.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItemVariants}
                      className="p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:border-neon-cortex-blue/40 hover:bg-white/[0.05] transition-all duration-300"
                    >
                      <p className="font-semibold text-white mb-1">{item.action}</p>
                      <p className="text-sm text-neon-cortex-blue">{item.how}</p>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/30 to-[#0F1123]" />

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.08)_0%,transparent_60%)]" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <FadeInWhenVisible delay={0} direction="up">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to Start Assigning Drills?</h2>
            <p className="text-xl text-white/60 mb-10">
              The Vault makes you a better coach. Assign. Track. Improve.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/download"
                className="group relative inline-flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-solar-surge-orange to-amber-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-solar-surge-orange to-amber-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
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
