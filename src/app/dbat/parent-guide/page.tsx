'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
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
  ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
}

export default function ParentGuidePage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const whatYouCanSee = [
    { info: 'Assigned drills', where: 'Athlete\'s training tab' },
    { info: 'Completion status', where: 'Each drill shows Pending/Complete' },
    { info: 'Progress metrics', where: 'Summary at top of screen' },
    { info: 'Last activity', where: 'When they last trained' },
  ];

  const keyMetrics = [
    { metric: 'Total Assigned', meaning: 'Drills coach has given them' },
    { metric: 'Completed', meaning: 'Drills they\'ve finished' },
    { metric: 'Pending', meaning: 'Drills still to do' },
    { metric: 'Completion %', meaning: 'Completed ÷ Assigned' },
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
      <div className="max-w-7xl mx-auto mb-8">
        <Link
          href="/dbat"
          className="inline-flex items-center gap-2 text-neon-cortex-blue hover:text-neon-cortex-blue/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to D-BAT Partnership
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Image
            src="/assets/images/the_vault_icon.png"
            alt="The Vault"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
        <GradientTextReveal
          text="D-BAT Parent Guide"
          className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 leading-relaxed"
          gradientFrom="#22C55E"
          gradientTo="#0EA5E9"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
          What you can see, how to support your athlete, and what the metrics mean
        </p>
      </div>

      {/* The Big Picture */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="blue" rounded="2xl" className="p-8 md:p-12">
            <h2 className="text-2xl font-black text-center mb-8">The Bigger Picture</h2>

            <div className="space-y-4">
              {[
                { text: 'Coach assigns drills based on athlete\'s needs', color: '#3B82F6' },
                { text: 'Athlete practices between lessons', color: '#F97316' },
                { text: 'Coach sees engagement data', color: '#3B82F6' },
                { text: 'Lessons focus on progression, not repetition', color: '#F97316' },
                { text: 'Faster improvement', color: '#22C55E' },
                { text: 'Better value from lessons', color: '#22C55E' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-300">{item.text}</span>
                  {index < 5 && <span className="text-gray-600 ml-auto">↓</span>}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <p className="text-green-400 font-medium">
                <Heart className="w-5 h-5 inline mr-2" />
                Your role: Encourage the process, celebrate the effort, trust the coach.
              </p>
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* What You Can See */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="orange" rounded="2xl" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-solar-surge-orange/20">
                <Eye className="w-6 h-6 text-solar-surge-orange" />
              </div>
              <h2 className="text-2xl font-black">What You Can See</h2>
            </div>

            <p className="text-gray-400 mb-6">When linked to your athlete&apos;s account:</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {whatYouCanSee.map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl">
                  <p className="font-semibold text-white mb-1">{item.info}</p>
                  <p className="text-sm text-solar-surge-orange">{item.where}</p>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Understanding Metrics */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="blue" rounded="2xl" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                <BarChart3 className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <h2 className="text-2xl font-black">Understanding the Metrics</h2>
            </div>

            <h3 className="font-bold text-lg mb-4">Key Numbers</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {keyMetrics.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-neon-cortex-blue flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">{item.metric}</span>
                    <span className="text-gray-400"> — {item.meaning}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-lg mb-4">Status Colors</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {statusColors.map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border-l-4" style={{ borderColor: item.hex }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.hex }} />
                    <span className="font-bold" style={{ color: item.hex }}>{item.status}</span>
                  </div>
                  <p className="text-sm text-gray-400">{item.action}</p>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* How to Support */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="orange" rounded="2xl" className="p-8">
            <h2 className="text-2xl font-black mb-6">How to Support Your Athlete</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp className="w-5 h-5 text-green-400" />
                  <h3 className="font-bold text-lg text-green-400">Do This</h3>
                </div>
                <ul className="space-y-3">
                  {doList.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsDown className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-lg text-red-400">Avoid This</h3>
                </div>
                <ul className="space-y-3">
                  {dontList.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Better Questions */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="blue" rounded="2xl" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                <MessageSquare className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <h2 className="text-2xl font-black">Weekly Check-In Questions</h2>
            </div>

            <div className="space-y-4">
              {betterQuestions.map((item, i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-400 mb-1">Instead of:</p>
                    <p className="text-gray-400 line-through">{item.instead}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-sm text-green-400 mb-1">Try:</p>
                    <p className="text-white font-medium">{item.try}</p>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Red Flags */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="orange" rounded="2xl" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-black">Red Flags to Watch</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold">You See</th>
                    <th className="text-left py-3 px-4 font-semibold">Possible Issue</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {redFlags.map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 px-4 text-gray-300">{row.see}</td>
                      <td className="py-3 px-4 text-yellow-400">{row.issue}</td>
                      <td className="py-3 px-4 text-neon-cortex-blue">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Value Comparison */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="blue" rounded="2xl" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                <DollarSign className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <h2 className="text-2xl font-black">Understanding the Value</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold">Option</th>
                    <th className="text-left py-3 px-4 font-semibold">Cost</th>
                    <th className="text-left py-3 px-4 font-semibold">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {costComparison.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-white/5 ${row.highlight ? 'bg-neon-cortex-blue/10' : ''}`}
                    >
                      <td className={`py-3 px-4 ${row.highlight ? 'font-bold text-neon-cortex-blue' : 'text-gray-300'}`}>
                        {row.option}
                      </td>
                      <td className={`py-3 px-4 ${row.highlight ? 'font-bold text-neon-cortex-blue' : 'text-gray-400'}`}>
                        {row.cost}
                      </td>
                      <td className={`py-3 px-4 ${row.highlight ? 'font-bold text-neon-cortex-blue' : 'text-gray-400'}`}>
                        {row.access}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <h3 className="font-bold mb-2">What Pro Includes:</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  'Unlimited drill access',
                  'AI-powered swing/pitch analysis',
                  'Coach assignments (full access)',
                  'Progress tracking',
                  'The Zone mental training',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-cortex-blue flex-shrink-0" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="orange" rounded="2xl" className="p-8 md:p-12">
            <h2 className="text-3xl font-black mb-8">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`}
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
                        <div className="px-6 pb-4 text-text-secondary">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-black mb-4">Questions?</h2>
        <p className="text-xl text-gray-400 mb-8">
          Support the process. Celebrate the effort. Watch them grow.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/download"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-neon-cortex-blue hover:opacity-90 transition-all"
          >
            Download the App
            <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            href="/dbat"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to D-BAT
          </Link>
        </div>
      </div>
    </div>
  );
}
