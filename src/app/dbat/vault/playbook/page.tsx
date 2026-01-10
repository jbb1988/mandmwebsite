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
  Lock,
  Unlock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Users,
  QrCode,
  Mail,
  MessageSquare,
  BarChart3,
  Calendar,
  Target,
  AlertCircle,
  Phone,
  ChevronDown,
  Printer,
  Building2,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLAYBOOK_PASSWORD = 'dbat2026';

export default function PlaybookPage() {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('setup');

  const handleUnlock = () => {
    if (password.toLowerCase() === PLAYBOOK_PASSWORD) {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const setupChecklist = [
    { task: 'Receive your facility\'s team join link from Mind & Muscle (mindandmuscle.ai/t/YOUR-CODE)', done: false },
    { task: 'Post QR code poster at front desk - athletes scan, tap "Join Team", done!', done: false },
    { task: 'Send welcome email with join link (one tap to join - no code entry needed)', done: false },
    { task: 'Brief your instructors on The Vault workflow (15 min)', done: false },
    { task: 'Identify 2-3 instructors to be early adopters', done: false },
    { task: 'Complete kickoff call with Mind & Muscle rep', done: false },
    { task: 'Confirm weekly check-in time (Fridays, 10 min)', done: false },
  ];

  const materials = [
    { item: 'QR Code Poster', description: 'We\'ll customize with your facility branding - just print and post' },
    { item: 'Athlete Welcome Email', description: 'Ready-to-send email template - just paste and send to your list' },
    { item: 'Parent FAQ One-Pager', description: 'Print copies for front desk when parents ask questions' },
    { item: 'Instructor Quick Guide', description: 'One-page summary for your instructors' },
    { item: 'Table Tent Cards', description: 'For front desk and lesson stations' },
  ];

  const talkingPoints = [
    {
      question: 'When athletes ask: "What is this?"',
      answer: 'It\'s a training app where we can assign you drills between lessons. You get a notification, watch the drill, then record yourself practicing it - the AI analyzes your swing or pitch. We can see who\'s putting in work. Just tap the link I send you, download the app if needed, and tap "Join Team". Takes 30 seconds.'
    },
    {
      question: 'When parents ask: "Do we have to pay for this?"',
      answer: 'The Vault and AI analysis tools require a Pro subscription—$15.99/month or $79.99/6 months (save 17%). Athletes get full access to assigned drills, AI swing analysis, and all training features. It\'s a fraction of one lesson cost and covers half the season.'
    },
    {
      question: 'When parents ask: "Does this replace lessons?"',
      answer: 'Not at all. It extends lessons. We assign specific drills your kid should practice. They get a notification, watch the drill video, then record themselves doing it - the AI analyzes their technique. We see who\'s putting in work before they show up. Kids arrive more prepared.'
    },
    {
      question: 'When instructors ask: "What do I need to do?"',
      answer: 'This is actually FOR you. You can upload your own drills or assign from the library. Athletes get a notification, watch your drill, then record themselves practicing in Swing Lab or Pitch Lab. You see who watched, who practiced, who\'s actually doing the work. It\'s accountability between lessons.'
    },
    {
      question: 'When asked: "Why are you doing this?"',
      answer: 'We want to see if it helps our athletes improve faster between sessions. If it works, we\'ll keep using it. We\'re one of the first D-BATs to try it - gives our athletes an edge.'
    },
  ];

  const metrics = [
    { metric: 'Athletes Onboarded', target: '50+', measure: 'We\'ll share in weekly check-in' },
    { metric: 'Weekly Active Users', target: '35+ (70%)', measure: 'Athletes using the app weekly' },
    { metric: 'Drills Assigned', target: '100+', measure: 'Total drills your instructors assign' },
    { metric: 'Drill Completion Rate', target: '60%+', measure: 'Athletes completing assignments' },
    { metric: 'Practice Recordings', target: '50+', measure: 'Athletes recording their swings/pitches' },
    { metric: 'Parent Accounts', target: '20+', measure: 'Parents tracking their kid\'s progress' },
    { metric: 'Satisfaction', target: '4.5/5', measure: 'End-of-pilot survey' },
  ];

  const weeklyAgenda = [
    { week: 'Week 1', focus: 'How many athletes signed up, early reactions, any tech issues, what\'s working' },
    { week: 'Week 2-3', focus: 'Engagement numbers, what feedback you\'re hearing, which instructors are most active' },
    { week: 'Week 4', focus: 'Results review, deciding whether to continue, success stories worth sharing' },
  ];

  const successCriteria = {
    minimum: [
      '30+ athletes using the app',
      'Most athletes engaging weekly',
      'No major tech issues unresolved',
      'You\'d recommend it to another GM',
    ],
    target: [
      '50+ athletes using the app',
      '70% engaging weekly',
      '15+ parents tracking progress',
      'At least 1 instructor actively assigning drills',
      'You want to continue after pilot',
    ],
    exceptional: [
      '70+ athletes using the app',
      'Parents praising it unprompted',
      'Athletes asking "what happens after the pilot?"',
      'You\'d refer other D-BAT locations',
    ],
  };

  const navItems = [
    { id: 'setup', label: 'Setup Checklist', icon: CheckCircle2 },
    { id: 'materials', label: 'Materials', icon: Printer },
    { id: 'talking', label: 'Talking Points', icon: MessageSquare },
    { id: 'metrics', label: 'Tracking & Metrics', icon: BarChart3 },
    { id: 'checkins', label: 'Weekly Check-ins', icon: Calendar },
    { id: 'success', label: 'Success Criteria', icon: Target },
  ];

  // Password Gate - Premium Design
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0F1123] flex items-center justify-center px-4">
        {/* Premium Background */}
        <div className="fixed inset-0 bg-gradient-to-b from-[#1A1F3A] via-[#0F1123] to-[#1A1F3A]" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.1)_0%,transparent_60%)]" />

        {/* Logo Watermark */}
        <div className="fixed inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
          <Image
            src="/assets/images/logo.png"
            alt=""
            width={1200}
            height={1200}
            className="object-contain"
          />
        </div>

        <div className="relative z-10 max-w-md w-full">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              {/* Outer Glow */}
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-60 bg-gradient-to-r from-neon-cortex-blue/30 to-solar-surge-orange/30 group-hover:opacity-80 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_40px_rgba(14,165,233,0.2)]">
                <div className="text-center mb-8">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-neon-cortex-blue/30 blur-xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-2xl bg-neon-cortex-blue/20 border-2 border-neon-cortex-blue/40 flex items-center justify-center">
                      <Lock
                        className="w-10 h-10 text-neon-cortex-blue"
                        style={{filter: 'drop-shadow(0 0 10px rgba(14,165,233,0.6))'}}
                      />
                    </div>
                  </div>
                  <h1 className="text-3xl font-black text-white mb-3">D-BAT Partner Playbook</h1>
                  <p className="text-white/60">
                    This content is for D-BAT facility partners only.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Enter password:
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(false);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                      className={`w-full px-4 py-4 bg-white/[0.03] border-2 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-0 transition-all duration-300 ${
                        error
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/10 focus:border-neon-cortex-blue/60'
                      }`}
                      placeholder="Password"
                    />
                    {error && (
                      <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Incorrect password. Contact your Mind & Muscle representative.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleUnlock}
                    className="group/btn relative w-full py-4 px-4 font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange" />
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange opacity-0 group-hover/btn:opacity-100 blur-xl transition-opacity" />
                    <span className="relative flex items-center justify-center gap-2 text-white">
                      <Unlock className="w-5 h-5" />
                      Access Playbook
                    </span>
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <Link
                    href="/dbat/vault"
                    className="inline-flex items-center gap-2 text-neon-cortex-blue hover:text-neon-cortex-blue/80 transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Resources
                  </Link>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>
    );
  }

  // Unlocked Content - Premium Design
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
      <section className="relative pt-40 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Premium Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F3A] via-[#0F1123] to-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.1)_0%,transparent_50%)]" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Back Link & Status */}
          <FadeInWhenVisible delay={0} direction="down">
            <div className="flex items-center justify-between mb-12">
              <Link
                href="/dbat/vault"
                className="inline-flex items-center gap-2 text-neon-cortex-blue hover:text-neon-cortex-blue/80 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Resources
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
                <Shield className="w-4 h-4" style={{filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))'}} />
                Partner Access Granted
              </div>
            </div>
          </FadeInWhenVisible>

          {/* Header */}
          <FadeInWhenVisible delay={0.1} direction="up" className="text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-solar-surge-orange/30 blur-2xl rounded-full" />
                <Building2
                  className="relative w-16 h-16 text-solar-surge-orange"
                  style={{filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.6))'}}
                />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-solar-surge-orange/20 to-neon-cortex-blue/20 border border-solar-surge-orange/30 text-solar-surge-orange text-sm font-bold mb-8 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <Sparkles className="w-4 h-4" style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.8))'}} />
              FOR FACILITY MANAGERS
            </div>
            <GradientTextReveal
              text="D-BAT Partner Playbook"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8"
              gradientFrom="#F97316"
              gradientTo="#0EA5E9"
              delay={0.2}
            />
            <p className="text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto font-medium leading-relaxed">
              Everything you need to run a successful pilot with The Vault
            </p>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-6 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                <h2 className="text-xl font-black mb-4 text-white">Quick Navigation</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setExpandedSection(item.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                        expandedSection === item.id
                          ? 'bg-neon-cortex-blue/20 border-2 border-neon-cortex-blue/60 text-neon-cortex-blue shadow-[0_0_20px_rgba(14,165,233,0.2)]'
                          : 'bg-white/[0.03] border-2 border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <item.icon
                        className="w-5 h-5 flex-shrink-0"
                        style={expandedSection === item.id ? {filter: 'drop-shadow(0 0 6px rgba(14,165,233,0.5))'} : {}}
                      />
                      <span className="text-sm font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Setup Checklist */}
          <AnimatePresence mode="wait">
            {expandedSection === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="group relative">
                  <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

                  <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                        <CheckCircle2
                          className="w-6 h-6 text-solar-surge-orange"
                          style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))'}}
                        />
                      </div>
                      <h2 className="text-2xl font-black text-white">Pre-Pilot Setup Checklist</h2>
                    </div>

                    <StaggerChildren staggerDelay={0.08} className="space-y-3">
                      {setupChecklist.map((item, i) => (
                        <motion.div
                          key={i}
                          variants={staggerItemVariants}
                          className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:border-solar-surge-orange/30 transition-colors"
                        >
                          <div className="w-6 h-6 rounded-lg border-2 border-white/30 flex-shrink-0 hover:border-solar-surge-orange transition-colors cursor-pointer" />
                          <span className="text-white/80">{item.task}</span>
                        </motion.div>
                      ))}
                    </StaggerChildren>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Materials */}
            {expandedSection === 'materials' && (
              <motion.div
                key="materials"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="group relative">
                  <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

                  <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                        <Printer
                          className="w-6 h-6 text-neon-cortex-blue"
                          style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}}
                        />
                      </div>
                      <h2 className="text-2xl font-black text-white">Materials to Prepare</h2>
                    </div>

                    <StaggerChildren staggerDelay={0.1} className="space-y-4">
                      {materials.map((item, i) => (
                        <motion.div
                          key={i}
                          variants={staggerItemVariants}
                          className="p-5 bg-white/[0.03] rounded-xl border border-white/10 hover:border-neon-cortex-blue/30 transition-colors"
                        >
                          <h3 className="font-bold text-white mb-2">{item.item}</h3>
                          <p className="text-sm text-white/50">{item.description}</p>
                        </motion.div>
                      ))}
                    </StaggerChildren>

                    <div className="mt-8 p-5 bg-solar-surge-orange/10 border-2 border-solar-surge-orange/30 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                      <p className="text-solar-surge-orange flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" style={{filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.5))'}} />
                        Contact your Mind & Muscle rep to receive these materials customized for your facility.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Talking Points */}
            {expandedSection === 'talking' && (
              <motion.div
                key="talking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="group relative">
                  <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

                  <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                        <MessageSquare
                          className="w-6 h-6 text-solar-surge-orange"
                          style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))'}}
                        />
                      </div>
                      <h2 className="text-2xl font-black text-white">Talking Points</h2>
                    </div>

                    <StaggerChildren staggerDelay={0.12} className="space-y-6">
                      {talkingPoints.map((item, i) => (
                        <motion.div
                          key={i}
                          variants={staggerItemVariants}
                          className="p-5 bg-white/[0.03] rounded-xl border border-white/10"
                        >
                          <h3 className="font-bold text-solar-surge-orange mb-3">{item.question}</h3>
                          <p className="text-white/70 italic leading-relaxed">&ldquo;{item.answer}&rdquo;</p>
                        </motion.div>
                      ))}
                    </StaggerChildren>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Metrics */}
            {expandedSection === 'metrics' && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="group relative">
                  <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

                  <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                        <BarChart3
                          className="w-6 h-6 text-neon-cortex-blue"
                          style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}}
                        />
                      </div>
                      <h2 className="text-2xl font-black text-white">Metrics to Track</h2>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-white/10">
                            <th className="text-left py-4 px-4 font-bold text-white">Metric</th>
                            <th className="text-left py-4 px-4 font-bold text-white">Target</th>
                            <th className="text-left py-4 px-4 font-bold text-white">How to Measure</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.map((row, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-4 text-white/80 font-medium">{row.metric}</td>
                              <td className="py-4 px-4 text-neon-cortex-blue font-bold">{row.target}</td>
                              <td className="py-4 px-4 text-white/50">{row.measure}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Weekly Check-ins */}
            {expandedSection === 'checkins' && (
              <motion.div
                key="checkins"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="group relative">
                  <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

                  <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                        <Calendar
                          className="w-6 h-6 text-solar-surge-orange"
                          style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))'}}
                        />
                      </div>
                      <h2 className="text-2xl font-black text-white">Weekly Check-in Structure</h2>
                    </div>

                    <div className="mb-8 p-5 bg-white/[0.03] rounded-xl border border-white/10">
                      <p className="text-white/80">
                        <strong className="text-solar-surge-orange">Your weekly call with Mind & Muscle:</strong> Fridays, 10 minutes, phone or video
                      </p>
                    </div>

                    <StaggerChildren staggerDelay={0.1} className="space-y-4">
                      {weeklyAgenda.map((item, i) => (
                        <motion.div
                          key={i}
                          variants={staggerItemVariants}
                          className="p-5 bg-white/[0.03] rounded-xl border border-white/10 hover:border-solar-surge-orange/30 transition-colors"
                        >
                          <h3 className="font-bold text-solar-surge-orange mb-2">{item.week}</h3>
                          <p className="text-white/70">{item.focus}</p>
                        </motion.div>
                      ))}
                    </StaggerChildren>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success Criteria */}
            {expandedSection === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="group relative">
                  <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-neon-cortex-blue/30 group-hover:opacity-60 transition-opacity duration-500" />

                  <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-neon-cortex-blue/20 border border-neon-cortex-blue/30">
                        <Target
                          className="w-6 h-6 text-neon-cortex-blue"
                          style={{filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.6))'}}
                        />
                      </div>
                      <h2 className="text-2xl font-black text-white">Success Criteria</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-5 bg-white/[0.03] rounded-xl border-l-4 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                        <h3 className="font-bold text-yellow-400 mb-4">Minimum (Pilot Worked)</h3>
                        <ul className="space-y-3">
                          {successCriteria.minimum.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                              <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" style={{filter: 'drop-shadow(0 0 4px rgba(234,179,8,0.5))'}} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-5 bg-white/[0.03] rounded-xl border-l-4 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        <h3 className="font-bold text-green-400 mb-4">Target (Strong Pilot)</h3>
                        <ul className="space-y-3">
                          {successCriteria.target.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" style={{filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.5))'}} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-5 bg-white/[0.03] rounded-xl border-l-4 border-neon-cortex-blue shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                        <h3 className="font-bold text-neon-cortex-blue mb-4">Exceptional (Case Study)</h3>
                        <ul className="space-y-3">
                          {successCriteria.exceptional.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                              <CheckCircle2 className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" style={{filter: 'drop-shadow(0 0 4px rgba(14,165,233,0.5))'}} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Support Contact */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-solar-surge-orange/20 border border-solar-surge-orange/30">
                    <Phone
                      className="w-6 h-6 text-solar-surge-orange"
                      style={{filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))'}}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">Support & Contact</h2>
                </div>

                <div className="p-6 bg-white/[0.03] rounded-xl border border-white/10 hover:border-solar-surge-orange/30 transition-colors text-center">
                  <h3 className="font-bold text-white mb-3">General Support</h3>
                  <a
                    href="mailto:support@mindandmuscle.ai"
                    className="text-xl text-solar-surge-orange hover:text-solar-surge-orange/80 transition-colors"
                  >
                    support@mindandmuscle.ai
                  </a>
                  <p className="text-sm text-white/50 mt-3">We typically respond within 24 hours</p>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Share Guides CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08)_0%,transparent_60%)]" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <FadeInWhenVisible delay={0} direction="up">
            <h2 className="text-3xl font-black text-white mb-4">Share These Guides</h2>
            <p className="text-white/60 mb-10">
              Public guides for your athletes, instructors, and parents:
            </p>
            <StaggerChildren staggerDelay={0.1} className="flex flex-wrap justify-center gap-4">
              {[
                { href: '/dbat/vault/instructor-guide', label: 'Instructor Guide' },
                { href: '/dbat/vault/athlete-guide', label: 'Athlete Guide' },
                { href: '/dbat/vault/parent-guide', label: 'Parent Guide' },
              ].map((link, i) => (
                <motion.div key={i} variants={staggerItemVariants}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 px-6 py-4 rounded-xl font-bold bg-white/[0.05] border-2 border-white/20 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300 text-white"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </StaggerChildren>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  );
}
