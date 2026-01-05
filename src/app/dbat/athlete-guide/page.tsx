'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import {
  Play,
  Bell,
  CheckCircle2,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Link2,
  Lock,
  Unlock,
  HelpCircle,
  Smartphone,
  Eye,
  Video
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

  const proComparison = [
    { feature: 'Watch drills', free: '1/week', pro: 'Unlimited' },
    { feature: 'Preview length', free: '15 sec', pro: 'Full video' },
    { feature: 'Coach assignments', free: 'Locked', pro: 'Full access' },
    { feature: 'Practice This', free: 'Yes', pro: 'Yes' },
  ];

  const proTips = [
    { tip: 'Check "For You" first', why: 'Coach assigned these for YOU' },
    { tip: 'Watch the whole video', why: 'You\'re not "viewed" until 80%' },
    { tip: 'Use Practice This', why: 'Get real feedback on your form' },
    { tip: 'Complete assignments promptly', why: 'Coaches see everything' },
    { tip: 'Save drills you\'ll repeat', why: 'Build your routine' },
  ];

  const troubleshooting = [
    { issue: 'Drill won\'t play?', solution: 'Check your internet connection' },
    { issue: 'Link doesn\'t work?', solution: 'May be expired - ask coach for new one' },
    { issue: 'Locked drills?', solution: 'Upgrade to Pro or wait for weekly reset' },
    { issue: 'Can\'t find assigned drill?', solution: 'Pull down to refresh For You tab' },
  ];

  const faqs: FAQ[] = [
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
      answer: 'Tap the link your coach sent you (it opens in the app). Preview the drill info, then tap "Claim Drill." It will appear in your For You tab. Note: You need Pro access to claim shared drills.'
    },
    {
      question: 'Why can\'t I see all drills?',
      answer: 'Free users get 1 drill per week and 15-second previews. Pro users get unlimited access. Your weekly free drill resets every Monday.'
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
          text="D-BAT Athlete Guide"
          className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 leading-relaxed"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
          How to use The Vault to watch drills, practice with AI analysis, and level up your game
        </p>
      </div>

      {/* The Workflow */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="blue" rounded="2xl" className="p-8 md:p-12">
            <h2 className="text-2xl font-black text-center mb-8">How It Works</h2>

            <div className="space-y-4">
              {[
                { step: 'Coach assigns drill', icon: Bell, color: '#3B82F6' },
                { step: 'You get push notification', icon: Smartphone, color: '#3B82F6' },
                { step: 'Open "For You" tab', icon: Eye, color: '#F97316' },
                { step: 'Watch the FULL video (80%+)', icon: Play, color: '#F97316' },
                { step: 'Tap "Practice This"', icon: Video, color: '#22C55E' },
                { step: 'Record yourself in Swing Lab or Pitch Lab', icon: Video, color: '#22C55E' },
                { step: 'Get AI analysis of your technique', icon: CheckCircle2, color: '#A855F7' },
                { step: 'Tap "Mark Complete"', icon: CheckCircle2, color: '#A855F7' },
                { step: 'Coach sees your progress!', icon: CheckCircle2, color: '#22C55E' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.color}20`, border: `2px solid ${item.color}40` }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-gray-300">{item.step}</span>
                  </div>
                  {index < 8 && (
                    <div className="hidden sm:block w-4 text-gray-600">↓</div>
                  )}
                </div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Your Three Tabs */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="orange" rounded="2xl" className="p-8">
            <h2 className="text-2xl font-black mb-6">Your Three Tabs</h2>

            <div className="grid sm:grid-cols-3 gap-4">
              {tabs.map((tab, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <tab.icon className="w-5 h-5 text-solar-surge-orange" />
                    <h3 className="font-bold text-solar-surge-orange">{tab.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{tab.description}</p>
                  <p className="text-sm text-white font-medium">{tab.priority}</p>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Practice This Feature */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="blue" rounded="2xl" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                <Video className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <h2 className="text-2xl font-black">The "Practice This" Button</h2>
            </div>

            <p className="text-gray-400 mb-6">
              This is where the magic happens. After watching any drill:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { step: 'Tap "Practice This" button', detail: 'Below the video player' },
                { step: 'Swing Lab or Pitch Lab opens', detail: 'Based on drill type' },
                { step: 'Record yourself doing the drill', detail: 'Camera guides you' },
                { step: 'Get instant AI analysis', detail: 'See what to improve' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-neon-cortex-blue/30 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="font-semibold text-white">{item.step}</span>
                  </div>
                  <p className="text-sm text-gray-400 ml-8">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 font-medium">
                <CheckCircle2 className="w-5 h-5 inline mr-2" />
                Coach can see you actually practiced — not just watched!
              </p>
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Free vs Pro */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="orange" rounded="2xl" className="p-8">
            <h2 className="text-2xl font-black mb-6">Free vs Pro</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                        Free
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      <div className="flex items-center justify-center gap-2 text-solar-surge-orange">
                        <Unlock className="w-4 h-4" />
                        Pro
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proComparison.map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 px-4 text-gray-300">{row.feature}</td>
                      <td className="py-3 px-4 text-center text-gray-400">{row.free}</td>
                      <td className="py-3 px-4 text-center text-solar-surge-orange font-medium">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-400 mt-4 text-center">
              *Free drill resets every Monday
            </p>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Pro Tips */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="blue" rounded="2xl" className="p-8">
            <h2 className="text-2xl font-black mb-6">Pro Tips</h2>

            <div className="space-y-3">
              {proTips.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">{item.tip}</span>
                    <span className="text-gray-400"> — {item.why}</span>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Claiming Shared Drills */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="orange" rounded="2xl" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-solar-surge-orange/20">
                <Link2 className="w-6 h-6 text-solar-surge-orange" />
              </div>
              <h2 className="text-2xl font-black">Claiming a Shared Drill Link</h2>
            </div>

            <p className="text-gray-400 mb-6">Got a link from your coach?</p>

            <div className="space-y-3">
              {[
                'Tap the link (opens in app)',
                'Preview the drill info',
                'Tap "Claim Drill"',
                'Find it in your For You tab',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-solar-surge-orange/20 flex items-center justify-center text-solar-surge-orange font-bold">
                    {i + 1}
                  </div>
                  <span className="text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Troubleshooting */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="blue" rounded="2xl" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                <HelpCircle className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <h2 className="text-2xl font-black">Need Help?</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {troubleshooting.map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl">
                  <p className="font-semibold text-white mb-1">{item.issue}</p>
                  <p className="text-sm text-neon-cortex-blue">{item.solution}</p>
                </div>
              ))}
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
        <h2 className="text-3xl font-black mb-4">Ready to Train?</h2>
        <p className="text-xl text-gray-400 mb-8">
          The Vault. Professional drills. Your schedule. Let&apos;s go.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/download"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange hover:opacity-90 transition-all"
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
