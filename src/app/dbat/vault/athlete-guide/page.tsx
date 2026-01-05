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
  Lock,
  Unlock,
  HelpCircle,
  Smartphone,
  Eye,
  Video,
  Sparkles,
  Zap,
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

  const workflowSteps = [
    { step: 'Coach assigns drill', icon: Bell, color: '#3B82F6' },
    { step: 'You get push notification', icon: Smartphone, color: '#3B82F6' },
    { step: 'Open "For You" tab', icon: Eye, color: '#F97316' },
    { step: 'Watch the FULL video (80%+)', icon: Play, color: '#F97316' },
    { step: 'Tap "Practice This"', icon: Video, color: '#22C55E' },
    { step: 'Record yourself in Swing Lab or Pitch Lab', icon: Video, color: '#22C55E' },
    { step: 'Get AI analysis of your technique', icon: CheckCircle2, color: '#A855F7' },
    { step: 'Tap "Mark Complete"', icon: CheckCircle2, color: '#A855F7' },
    { step: 'Coach sees your progress!', icon: CheckCircle2, color: '#22C55E' },
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
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
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

      {/* How It Works - Workflow */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#1A1F3A]/50 to-[#0F1123]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              {/* Outer Glow */}
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-60 bg-gradient-to-r from-neon-cortex-blue/30 to-solar-surge-orange/30 group-hover:opacity-80 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-neon-cortex-blue/40 p-8 md:p-12 shadow-[0_0_40px_rgba(14,165,233,0.2)]">
                <h2 className="text-2xl sm:text-3xl font-black text-center mb-10 text-white">How It Works</h2>

                <div className="space-y-4">
                  {workflowSteps.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 group/step">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover/step:scale-110"
                        style={{ backgroundColor: `${item.color}20`, border: `2px solid ${item.color}40` }}
                      >
                        <item.icon
                          className="w-5 h-5"
                          style={{ color: item.color, filter: `drop-shadow(0 0 6px ${item.color})` }}
                        />
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-white/80">{item.step}</span>
                      </div>
                      {index < workflowSteps.length - 1 && (
                        <div className="hidden sm:block w-4 text-white/30">|</div>
                      )}
                    </div>
                  ))}
                </div>
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

                <p className="text-white/50 mb-8">
                  This is where the magic happens. After watching any drill:
                </p>

                <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { step: 'Tap "Practice This" button', detail: 'Below the video player' },
                    { step: 'Swing Lab or Pitch Lab opens', detail: 'Based on drill type' },
                    { step: 'Record yourself doing the drill', detail: 'Camera guides you' },
                    { step: 'Get instant AI analysis', detail: 'See what to improve' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItemVariants}
                      className="p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:border-neon-cortex-blue/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-neon-cortex-blue/20 border border-neon-cortex-blue/30 flex items-center justify-center text-xs font-bold text-neon-cortex-blue">
                          {i + 1}
                        </div>
                        <span className="font-semibold text-white">{item.step}</span>
                      </div>
                      <p className="text-sm text-white/50 ml-9">{item.detail}</p>
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

      {/* Free vs Pro */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.05)_0%,transparent_60%)]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-solar-surge-orange/30 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] rounded-2xl border-2 border-solar-surge-orange/40 p-8 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <h2 className="text-2xl font-black mb-8 text-white">Free vs Pro</h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 font-semibold text-white">Feature</th>
                        <th className="text-center py-4 px-4 font-semibold">
                          <div className="flex items-center justify-center gap-2 text-white/60">
                            <Lock className="w-4 h-4" />
                            Free
                          </div>
                        </th>
                        <th className="text-center py-4 px-4 font-semibold">
                          <div className="flex items-center justify-center gap-2 text-solar-surge-orange">
                            <Unlock className="w-4 h-4" style={{filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.5))'}} />
                            Pro
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {proComparison.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-4 text-white/80">{row.feature}</td>
                          <td className="py-4 px-4 text-center text-white/50">{row.free}</td>
                          <td className="py-4 px-4 text-center text-solar-surge-orange font-medium">{row.pro}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-white/40 mt-6 text-center">
                  *Free drill resets every Monday
                </p>
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
