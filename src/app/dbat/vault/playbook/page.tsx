'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
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
  Building2
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
    { task: 'Upgrade facility account to Pro tier', done: false },
    { task: 'Create facility team in Chatter', done: false },
    { task: 'Generate team join code (30-day expiration)', done: false },
    { task: 'Create QR code poster with facility branding', done: false },
    { task: 'Prepare athlete onboarding email template', done: false },
    { task: 'Brief instructors on The Vault workflow', done: false },
    { task: 'Schedule kickoff call', done: false },
    { task: 'Schedule weekly check-in cadence', done: false },
  ];

  const materials = [
    { item: 'QR Code Poster (PDF)', description: 'Print-ready, facility-branded, scannable from 3+ feet' },
    { item: 'Athlete Welcome Email', description: 'Template for facility to send to athlete list' },
    { item: 'Parent FAQ One-Pager', description: 'Print and have at front desk' },
    { item: 'Instructor Briefing Card', description: 'One-page guide for instructors' },
    { item: 'Table Tent / Counter Card', description: 'For front desk and instructor tables' },
  ];

  const talkingPoints = [
    {
      question: 'When athletes ask: "What is this?"',
      answer: '"It\'s a free training app where we can assign you drills between lessons. You get a notification, watch the drill, then record yourself practicing it - the AI analyzes your swing or pitch. We can see who\'s putting in work. Scan the code, download it, enter our team code. Takes 2 minutes."'
    },
    {
      question: 'When parents ask: "Do we have to pay for this?"',
      answer: '"No, it\'s free during our pilot. After that, there\'s a free version with 8 features. If your athlete wants the full thing, it\'s $9.99/month — but that\'s totally optional."'
    },
    {
      question: 'When parents ask: "Does this replace lessons?"',
      answer: '"Not at all. It extends lessons. We assign specific drills your kid should practice. They get a notification, watch the drill video, then record themselves doing it - the AI analyzes their technique. We see who\'s putting in work before they show up. Kids arrive more prepared."'
    },
    {
      question: 'When instructors ask: "What do I need to do?"',
      answer: '"This is actually FOR you. You can upload your own drills or assign from the library. Athletes get a notification, watch your drill, then record themselves practicing in Swing Lab or Pitch Lab. You see who watched, who practiced, who\'s actually doing the work. It\'s accountability between lessons."'
    },
    {
      question: 'When asked: "Why are you doing this?"',
      answer: '"I want to see if it helps our athletes improve faster between sessions. If it works, we\'ll keep using it. If not, no harm done. We\'re one of the first D-BATs to try it."'
    },
  ];

  const metrics = [
    { metric: 'Athletes Onboarded', target: '50+', measure: 'Team member count' },
    { metric: 'Weekly Active Users', target: '35+ (70%)', measure: 'Activity in last 7 days' },
    { metric: 'Vault Drills Assigned', target: '100+', measure: 'Drills assigned by instructors' },
    { metric: 'Drill Completion Rate', target: '60%+', measure: 'Completions ÷ Assignments' },
    { metric: 'Practice Recordings', target: '50+', measure: 'Swing Lab / Pitch Lab from drills' },
    { metric: 'Parent Dashboard Links', target: '20+', measure: 'Parent accounts linked' },
    { metric: 'NPS/Satisfaction', target: '4.5/5', measure: 'End-of-pilot survey' },
  ];

  const weeklyAgenda = [
    { week: 'Week 1', focus: 'Onboarding status, initial reactions, technical issues, adjustments needed' },
    { week: 'Week 2-3', focus: 'Engagement update, feedback themes, instructor involvement, parent perception' },
    { week: 'Week 4', focus: 'Results review, qualitative assessment, next steps, case study permission' },
  ];

  const successCriteria = {
    minimum: [
      '30+ athletes onboarded',
      '20+ weekly active users (65%)',
      '3+ features used per user',
      '0 unresolved major issues',
      'Partner says "would recommend"',
    ],
    target: [
      '50+ athletes onboarded',
      '35+ weekly active users (70%)',
      '4+ features used per user',
      '15+ parent dashboard links',
      'At least 1 instructor actively using The Vault',
      'Partner says "definitely continuing"',
    ],
    exceptional: [
      '70+ athletes onboarded',
      '50+ weekly active users (70%+)',
      '5+ unsolicited parent praise instances',
      'Athletes asking "what happens after pilot?"',
      'Partner willing to refer other D-BATs',
    ],
  };

  // Password Gate
  if (!isUnlocked) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <LiquidGlass variant="blue" rounded="2xl" className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-neon-cortex-blue" />
              </div>
              <h1 className="text-2xl font-black mb-2">D-BAT Partner Playbook</h1>
              <p className="text-gray-400">
                This content is for D-BAT facility partners only.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cortex-blue ${
                    error ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Password"
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2">
                    Incorrect password. Contact your Mind & Muscle representative.
                  </p>
                )}
              </div>

              <button
                onClick={handleUnlock}
                className="w-full py-3 px-4 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                <Unlock className="w-5 h-5 inline mr-2" />
                Access Playbook
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <Link
                href="/dbat/vault"
                className="text-neon-cortex-blue hover:text-neon-cortex-blue/80 text-sm"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back to Resources
              </Link>
            </div>
          </LiquidGlass>
        </div>
      </div>
    );
  }

  // Unlocked Content
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo Watermark */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
        <Image
          src="/assets/images/logo.png"
          alt=""
          width={1200}
          height={1200}
          className="object-contain"
        />
      </div>

      {/* Back Link */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <Link
          href="/dbat/vault"
          className="inline-flex items-center gap-2 text-neon-cortex-blue hover:text-neon-cortex-blue/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Link>
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <Unlock className="w-4 h-4" />
          Partner Access
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Building2 className="w-12 h-12 text-solar-surge-orange" />
        </div>
        <GradientTextReveal
          text="D-BAT Partner Playbook"
          className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 leading-relaxed"
          gradientFrom="#F97316"
          gradientTo="#0EA5E9"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
          Everything you need to run a successful pilot with The Vault
        </p>
      </div>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto mb-16">
        <LiquidGlass variant="blue" rounded="2xl" className="p-6">
          <h2 className="text-xl font-black mb-4">Quick Navigation</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'setup', label: 'Setup Checklist', icon: CheckCircle2 },
              { id: 'materials', label: 'Materials', icon: Printer },
              { id: 'talking', label: 'Talking Points', icon: MessageSquare },
              { id: 'metrics', label: 'Tracking & Metrics', icon: BarChart3 },
              { id: 'checkins', label: 'Weekly Check-ins', icon: Calendar },
              { id: 'success', label: 'Success Criteria', icon: Target },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setExpandedSection(item.id)}
                className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  expandedSection === item.id
                    ? 'bg-neon-cortex-blue/20 text-neon-cortex-blue'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </LiquidGlass>
      </div>

      {/* Setup Checklist */}
      <AnimatePresence>
        {expandedSection === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <LiquidGlass variant="orange" rounded="2xl" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-solar-surge-orange/20">
                  <CheckCircle2 className="w-6 h-6 text-solar-surge-orange" />
                </div>
                <h2 className="text-2xl font-black">Pre-Pilot Setup Checklist</h2>
              </div>

              <div className="space-y-3">
                {setupChecklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-5 h-5 rounded border-2 border-white/30 flex-shrink-0" />
                    <span className="text-gray-300">{item.task}</span>
                  </div>
                ))}
              </div>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Materials */}
      <AnimatePresence>
        {expandedSection === 'materials' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <LiquidGlass variant="blue" rounded="2xl" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                  <Printer className="w-6 h-6 text-neon-cortex-blue" />
                </div>
                <h2 className="text-2xl font-black">Materials to Prepare</h2>
              </div>

              <div className="space-y-4">
                {materials.map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl">
                    <h3 className="font-bold text-white mb-1">{item.item}</h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-solar-surge-orange/10 border border-solar-surge-orange/30 rounded-xl">
                <p className="text-sm text-solar-surge-orange">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Contact your Mind & Muscle rep to receive these materials customized for your facility.
                </p>
              </div>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Talking Points */}
      <AnimatePresence>
        {expandedSection === 'talking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <LiquidGlass variant="orange" rounded="2xl" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-solar-surge-orange/20">
                  <MessageSquare className="w-6 h-6 text-solar-surge-orange" />
                </div>
                <h2 className="text-2xl font-black">Talking Points</h2>
              </div>

              <div className="space-y-6">
                {talkingPoints.map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl">
                    <h3 className="font-bold text-solar-surge-orange mb-2">{item.question}</h3>
                    <p className="text-gray-300 italic">{item.answer}</p>
                  </div>
                ))}
              </div>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics */}
      <AnimatePresence>
        {expandedSection === 'metrics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <LiquidGlass variant="blue" rounded="2xl" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                  <BarChart3 className="w-6 h-6 text-neon-cortex-blue" />
                </div>
                <h2 className="text-2xl font-black">Metrics to Track</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-semibold">Metric</th>
                      <th className="text-left py-3 px-4 font-semibold">Target</th>
                      <th className="text-left py-3 px-4 font-semibold">How to Measure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 text-gray-300 font-medium">{row.metric}</td>
                        <td className="py-3 px-4 text-neon-cortex-blue font-bold">{row.target}</td>
                        <td className="py-3 px-4 text-gray-400">{row.measure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Check-ins */}
      <AnimatePresence>
        {expandedSection === 'checkins' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <LiquidGlass variant="orange" rounded="2xl" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-solar-surge-orange/20">
                  <Calendar className="w-6 h-6 text-solar-surge-orange" />
                </div>
                <h2 className="text-2xl font-black">Weekly Check-in Structure</h2>
              </div>

              <div className="mb-6 p-4 bg-white/5 rounded-xl">
                <p className="text-gray-300">
                  <strong>Cadence:</strong> Every Friday, 10 minutes, Phone or video call
                </p>
              </div>

              <div className="space-y-4">
                {weeklyAgenda.map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl">
                    <h3 className="font-bold text-solar-surge-orange mb-2">{item.week}</h3>
                    <p className="text-gray-300">{item.focus}</p>
                  </div>
                ))}
              </div>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Criteria */}
      <AnimatePresence>
        {expandedSection === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <LiquidGlass variant="blue" rounded="2xl" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                  <Target className="w-6 h-6 text-neon-cortex-blue" />
                </div>
                <h2 className="text-2xl font-black">Success Criteria</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-white/5 rounded-xl border-l-4 border-yellow-500">
                  <h3 className="font-bold text-yellow-400 mb-3">Minimum (Pilot Worked)</h3>
                  <ul className="space-y-2">
                    {successCriteria.minimum.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border-l-4 border-green-500">
                  <h3 className="font-bold text-green-400 mb-3">Target (Strong Pilot)</h3>
                  <ul className="space-y-2">
                    {successCriteria.target.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border-l-4 border-neon-cortex-blue">
                  <h3 className="font-bold text-neon-cortex-blue mb-3">Exceptional (Case Study)</h3>
                  <ul className="space-y-2">
                    {successCriteria.exceptional.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support Contact */}
      <div className="max-w-4xl mx-auto mb-16">
        <LiquidGlass variant="orange" rounded="2xl" className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-solar-surge-orange/20">
              <Phone className="w-6 h-6 text-solar-surge-orange" />
            </div>
            <h2 className="text-2xl font-black">Support & Contact</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-4 bg-white/5 rounded-xl">
              <h3 className="font-bold text-white mb-2">Technical Issues</h3>
              <p className="text-gray-400 mb-2">support@mindandmuscle.ai</p>
              <p className="text-sm text-gray-500">Response: Within 24 hours</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <h3 className="font-bold text-white mb-2">Urgent Issues</h3>
              <p className="text-gray-400 mb-2">jeff@mindandmuscle.ai</p>
              <p className="text-sm text-gray-500">Response: Within 2 hours (business hours)</p>
            </div>
          </div>
        </LiquidGlass>
      </div>

      {/* Other Guides */}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-black mb-4">Share These Guides</h2>
        <p className="text-gray-400 mb-6">
          Public guides for your athletes, instructors, and parents:
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/dbat/vault/instructor-guide"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
          >
            Instructor Guide
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dbat/vault/athlete-guide"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
          >
            Athlete Guide
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dbat/vault/parent-guide"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
          >
            Parent Guide
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
