'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
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
  AlertCircle
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

  const drillMetrics = [
    { metric: 'Assignment Count', meaning: 'Times you/others assigned it' },
    { metric: 'View Count', meaning: 'Athletes who watched 80%+' },
    { metric: 'Completion Count', meaning: 'Marked complete' },
    { metric: 'Completion Rate', meaning: 'Completions ÷ Views' },
  ];

  const quickActions = [
    { action: 'Assign a drill', how: 'Open drill → Assign → Select athletes' },
    { action: 'Create share link', how: 'Open drill → Share → Generate' },
    { action: 'Check who\'s training', how: 'Dashboard → Training Engagement' },
    { action: 'Message an athlete', how: 'Tap athlete card → DM' },
    { action: 'Upload new drill', how: 'My Drills → + button' },
    { action: 'See drill stats', how: 'Open your drill → view metrics' },
  ];

  const faqs: FAQ[] = [
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
      answer: 'Athletes need the Mind & Muscle app to receive assignments. Share the download link (mindandmuscle.ai/download) with them. Once they sign up and join your team, they\'ll see any pending assignments.'
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
      answer: 'Yes! Go to My Drills → tap the + button. Upload a video (max 5 minutes, 1-3 min ideal), add title, description, category, and age range. Your drill is ready to assign to athletes.'
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
          text="D-BAT Instructor Guide"
          className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 leading-relaxed"
          gradientFrom="#F97316"
          gradientTo="#0EA5E9"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
          How to use The Vault to assign drills, track athlete progress, and extend your coaching between lessons
        </p>
      </div>

      {/* The Full Loop */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="blue" rounded="2xl" className="p-8 md:p-12">
            <h2 className="text-2xl font-black text-center mb-8 text-neon-cortex-blue">The Complete Loop</h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 text-sm md:text-base">
              {[
                { step: 'You assign drill', icon: UserPlus },
                { step: 'Athlete notified', icon: Bell },
                { step: 'Watches drill', icon: Eye },
                { step: 'Taps "Practice This"', icon: ArrowRight },
                { step: 'Records in Swing/Pitch Lab', icon: Upload },
                { step: 'AI analyzes technique', icon: BarChart3 },
                { step: 'You see results', icon: CheckCircle2 },
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-neon-cortex-blue/20 border border-neon-cortex-blue/40 flex items-center justify-center mb-2">
                      <item.icon className="w-5 h-5 text-neon-cortex-blue" />
                    </div>
                    <span className="text-gray-300 max-w-[100px]">{item.step}</span>
                  </div>
                  {index < 6 && (
                    <ArrowRight className="hidden md:block w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <p className="text-center text-gray-400 mt-8 text-sm">
              No more &quot;did you practice?&quot; — you&apos;ll SEE who did.
            </p>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Your Four Tabs */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="orange" rounded="2xl" className="p-8">
            <h2 className="text-2xl font-black mb-6">Your Four Tabs in The Vault</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {tabs.map((tab, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="font-bold text-solar-surge-orange mb-1">{tab.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{tab.description}</p>
                  <p className="text-sm text-gray-300">Use for: {tab.use}</p>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Assigning Drills */}
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="text-3xl font-black text-center mb-8">How to Assign Drills</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Method 1: Direct Assignment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <LiquidGlass variant="blue" rounded="2xl" className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                  <Users className="w-6 h-6 text-neon-cortex-blue" />
                </div>
                <h3 className="text-xl font-bold text-neon-cortex-blue">Method 1: Direct Assignment</h3>
              </div>

              <div className="space-y-3">
                {[
                  'Open any drill (yours or from Master Library)',
                  'Tap "Assign" button',
                  'Select team(s)',
                  'Check athletes (or "Select All")',
                  'Add optional note — PRO TIP: Personalize it!',
                  'Tap "Assign Drill"',
                  'Athletes get push notification instantly'
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-neon-cortex-blue/30 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-gray-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </LiquidGlass>
          </motion.div>

          {/* Method 2: Share Link */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <LiquidGlass variant="orange" rounded="2xl" className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-solar-surge-orange/20">
                  <Link2 className="w-6 h-6 text-solar-surge-orange" />
                </div>
                <h3 className="text-xl font-bold text-solar-surge-orange">Method 2: Share Link</h3>
              </div>

              <div className="space-y-3">
                {[
                  'Open your drill → Tap "Share"',
                  'Configure options:',
                  '  • Multi-use or Single-use',
                  '  • Max uses (optional)',
                  '  • Expiration (optional)',
                  'Tap "Generate Link"',
                  'Copy or Share via text/email/WhatsApp'
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {!step.startsWith('  ') ? (
                      <div className="w-6 h-6 rounded-full bg-solar-surge-orange/30 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {i < 2 ? i + 1 : i - 2}
                      </div>
                    ) : (
                      <div className="w-6" />
                    )}
                    <span className={`text-gray-300 text-sm ${step.startsWith('  ') ? 'text-gray-400' : ''}`}>
                      {step.trim()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-400">
                  Link format: <code className="text-solar-surge-orange">mindandmuscle.ai/d/AbC12345</code>
                </p>
              </div>
            </LiquidGlass>
          </motion.div>
        </div>
      </div>

      {/* Tracking Engagement */}
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
              <h2 className="text-2xl font-black">Tracking Athlete Engagement</h2>
            </div>

            <p className="text-gray-400 mb-6">
              Find this in: <span className="text-white font-semibold">Coach Dashboard → Training Engagement</span>
            </p>

            <h3 className="font-bold text-lg mb-4">Color Codes</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {engagementColors.map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border-l-4" style={{ borderColor: item.hex }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.hex }} />
                    <span className="font-bold" style={{ color: item.hex }}>{item.status}</span>
                  </div>
                  <p className="text-sm text-gray-400">{item.meaning}</p>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-lg mb-4">Per-Athlete Metrics</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { metric: 'Total Assigned', meaning: 'Drills you\'ve given them' },
                { metric: 'Viewed', meaning: 'Watched 80%+ of video' },
                { metric: 'Completed', meaning: 'Marked as done' },
                { metric: 'Last Activity', meaning: 'When they last engaged' },
                { metric: 'Completion Rate', meaning: 'Completions ÷ Assignments' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-neon-cortex-blue flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">{item.metric}</span>
                    <span className="text-gray-400"> — {item.meaning}</span>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Best Practices */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="orange" rounded="2xl" className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-solar-surge-orange/20">
                <Lightbulb className="w-6 h-6 text-solar-surge-orange" />
              </div>
              <h2 className="text-2xl font-black">Best Practices</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4 text-solar-surge-orange">Assignment Strategy</h3>
                <ul className="space-y-3">
                  {[
                    '2-3 drills per week — Don\'t overwhelm',
                    'Add personal notes — "Focus on hip rotation" beats generic',
                    'Check engagement weekly — Follow up with inactive athletes',
                    'Use share links for groups — Faster than individual assignments',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-solar-surge-orange flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4 text-solar-surge-orange">Upload Tips</h3>
                <ul className="space-y-3">
                  {[
                    'Under 3 minutes — Attention spans are short',
                    'One concept per drill — Don\'t overload',
                    'Clear titles — "Power Hip Rotation" > "Drill 47"',
                    'Show common mistakes — What NOT to do',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-solar-surge-orange flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <LiquidGlass variant="blue" rounded="2xl" className="p-8">
            <h2 className="text-2xl font-black mb-6">Quick Actions</h2>

            <div className="grid sm:grid-cols-2 gap-3">
              {quickActions.map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl">
                  <p className="font-semibold text-white mb-1">{item.action}</p>
                  <p className="text-sm text-neon-cortex-blue">{item.how}</p>
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
        <h2 className="text-3xl font-black mb-4">Ready to Start Assigning Drills?</h2>
        <p className="text-xl text-gray-400 mb-8">
          The Vault makes you a better coach. Assign. Track. Improve.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/download"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-solar-surge-orange to-amber-500 hover:opacity-90 transition-all"
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
