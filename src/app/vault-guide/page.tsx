'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import {
  Video,
  UserPlus,
  PlayCircle,
  MessageSquare,
  ChevronDown,
  Upload,
  Users,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Bell,
  Link2,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkflowStep {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  color: string;
  // For steps with multiple options
  options?: {
    title: string;
    icon: React.ReactNode;
    details: string[];
  }[];
}

interface FAQ {
  question: string;
  answer: string;
}

export default function VaultGuidePage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const workflowSteps: WorkflowStep[] = [
    {
      number: 1,
      title: 'Create Drills',
      description: 'Upload instructional videos to teach specific skills to your athletes.',
      icon: <Upload className="w-8 h-8" />,
      details: [
        'Open The Vault and go to "My Drills" tab',
        'Tap the + button to create a new drill',
        'Record or upload a video demonstrating the technique',
        'Add a title, description, and select the skill category',
        'Your drill is now ready to assign'
      ],
      color: '#22C55E'
    },
    {
      number: 2,
      title: 'Assign to Athletes',
      description: 'Two ways to get your drill to athletes - assign directly or share a link.',
      icon: <UserPlus className="w-8 h-8" />,
      details: [],
      color: '#3B82F6',
      options: [
        {
          title: 'Option A: Direct Assignment',
          icon: <Users className="w-5 h-5" />,
          details: [
            'From your drill, tap "Assign to Athletes"',
            'Select athletes from your team roster',
            'Add optional instructions or notes',
            'Athletes receive a push notification',
            'The drill appears in their "For You" tab'
          ]
        },
        {
          title: 'Option B: Share Link',
          icon: <Link2 className="w-5 h-5" />,
          details: [
            'From your drill, tap the share icon',
            'Generate a unique shareable link',
            'Send via text, email, or any messaging app',
            'Athletes open the link to claim the drill',
            'Pro subscribers can access - encourages app downloads!'
          ]
        }
      ]
    },
    {
      number: 3,
      title: 'Athletes Practice',
      description: 'Athletes watch your drill, then record themselves practicing.',
      icon: <PlayCircle className="w-8 h-8" />,
      details: [
        'Athlete opens The Vault → "For You" tab',
        'Watches your instructional video',
        'Taps "Practice This" button',
        'Opens Swing Lab or Pitch Lab with drill context',
        'Records their practice attempt',
        'AI analyzes their technique automatically'
      ],
      color: '#F97316'
    },
    {
      number: 4,
      title: 'Review & Feedback',
      description: 'View practice submissions and give personalized coaching feedback.',
      icon: <MessageSquare className="w-8 h-8" />,
      details: [
        'Go to your drill → "Submissions" tab',
        'See all athletes who practiced this drill',
        'Tap any submission to view their analysis',
        'Watch their video and AI feedback',
        'Add your personalized coaching notes',
        'Athlete gets notified of your feedback'
      ],
      color: '#A855F7'
    }
  ];

  const faqs: FAQ[] = [
    {
      question: 'What if an athlete doesn\'t have the app installed?',
      answer: 'Athletes need the Mind & Muscle app to receive assignments. Share the download link (mindandmuscle.ai/download) with them. Once they sign up and join your team, they\'ll see any pending assignments.'
    },
    {
      question: 'Can I see practice videos for all my drills in one place?',
      answer: 'Yes! In Coach\'s Corner, the "Practice Submissions" section shows recent practice videos across all your drills. Tap any submission to jump directly to that drill\'s Submissions tab.'
    },
    {
      question: 'How do I know when an athlete practices?',
      answer: 'You\'ll receive a push notification when athletes submit practice videos. You can also check the Submissions tab on any drill to see who has practiced and who hasn\'t.'
    },
    {
      question: 'Do athletes get notified when I give feedback?',
      answer: 'Yes! When you add feedback to an athlete\'s practice analysis, they receive a push notification. They can open the notification to see your coaching notes directly on their analysis.'
    },
    {
      question: 'Can I assign the same drill to multiple athletes?',
      answer: 'Absolutely! When assigning a drill, you can select as many athletes as you want. Each athlete receives their own assignment and can submit their own practice video.'
    },
    {
      question: 'How do share links work?',
      answer: 'Share links let you distribute drills to athletes who aren\'t on your team roster yet. Generate a unique link from any drill and send it via text, email, or messaging apps. When athletes open the link, they\'ll be prompted to download the app (if needed) and claim the drill. Note: Athletes need a Pro subscription to access shared drills, which helps convert new users!'
    },
    {
      question: 'What\'s the difference between The Vault and Swing Lab?',
      answer: 'The Vault is your drill library - where you create, store, and assign instructional drills. Swing Lab is where athletes record and analyze their own swings. When an athlete taps "Practice This" on a drill, it opens Swing Lab with context about which drill they\'re practicing.'
    },
    {
      question: 'Can parents see the assigned drills?',
      answer: 'Parents with linked athlete accounts can see their child\'s progress and completed training. They can view that a drill was assigned and whether it was completed, but the detailed analysis and coaching feedback is primarily for the athlete.'
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
          text="The Vault: Coach Workflow"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-relaxed"
          gradientFrom="#F97316"
          gradientTo="#A855F7"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
          Your complete guide to creating drills, assigning to athletes, and providing personalized feedback
        </p>
      </div>

      {/* How It Works Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-black text-center mb-12">How It Works</h2>

        {/* Workflow Steps */}
        <div className="space-y-8">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <LiquidGlass
                variant={step.number % 2 === 0 ? 'blue' : 'orange'}
                rounded="2xl"
                className="p-8 [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white/[0.02] [&>div:first-child]:via-transparent [&>div:first-child]:to-transparent"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
                      style={{ backgroundColor: `${step.color}20`, border: `2px solid ${step.color}40` }}
                    >
                      <span
                        className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: step.color }}
                      >
                        {step.number}
                      </span>
                      <div style={{ color: step.color }}>
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: step.color }}>
                      {step.title}
                    </h3>
                    <p className="text-text-secondary text-lg mb-4">
                      {step.description}
                    </p>

                    {/* Step Details (regular) */}
                    {step.details.length > 0 && (
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2
                              className="w-5 h-5 mt-0.5 flex-shrink-0"
                              style={{ color: step.color }}
                            />
                            <span className="text-gray-300">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Step Options (for steps with multiple paths) */}
                    {step.options && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {step.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="p-4 rounded-xl bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${step.color}20` }}
                              >
                                <div style={{ color: step.color }}>
                                  {option.icon}
                                </div>
                              </div>
                              <h4 className="font-bold" style={{ color: step.color }}>
                                {option.title}
                              </h4>
                            </div>
                            <ul className="space-y-2">
                              {option.details.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2
                                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                                    style={{ color: step.color }}
                                  />
                                  <span className="text-gray-300">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Arrow to next step */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center">
                      <ArrowRight className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>
              </LiquidGlass>
            </motion.div>
          ))}
        </div>
      </div>

      {/* The Complete Loop Visual */}
      <div className="max-w-4xl mx-auto mb-16">
        <LiquidGlass variant="blue" rounded="2xl" className="p-8 md:p-12 [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white/[0.02] [&>div:first-child]:via-transparent [&>div:first-child]:to-transparent">
          <h2 className="text-3xl font-black text-center mb-8">The Complete Feedback Loop</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Coach Side */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-neon-cortex-blue flex items-center gap-2">
                <Users className="w-6 h-6" />
                Coach Experience
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-neon-cortex-blue/10 border border-neon-cortex-blue/20">
                  <p className="text-sm text-gray-400">Step 1</p>
                  <p className="font-medium">Create drill in The Vault</p>
                </div>
                <div className="p-4 rounded-xl bg-neon-cortex-blue/10 border border-neon-cortex-blue/20">
                  <p className="text-sm text-gray-400">Step 2</p>
                  <p className="font-medium">Assign to team athletes</p>
                </div>
                <div className="p-4 rounded-xl bg-neon-cortex-blue/10 border border-neon-cortex-blue/20">
                  <p className="text-sm text-gray-400">Step 4</p>
                  <p className="font-medium">View submissions & give feedback</p>
                </div>
              </div>
            </div>

            {/* Athlete Side */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-solar-surge-orange flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                Athlete Experience
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-solar-surge-orange/10 border border-solar-surge-orange/20">
                  <p className="text-sm text-gray-400">Notification</p>
                  <p className="font-medium">Receives drill assignment</p>
                </div>
                <div className="p-4 rounded-xl bg-solar-surge-orange/10 border border-solar-surge-orange/20">
                  <p className="text-sm text-gray-400">Step 3</p>
                  <p className="font-medium">Watches drill, records practice</p>
                </div>
                <div className="p-4 rounded-xl bg-solar-surge-orange/10 border border-solar-surge-orange/20">
                  <p className="text-sm text-gray-400">Notification</p>
                  <p className="font-medium">Receives coach feedback</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loop Arrow */}
          <div className="flex justify-center mt-8">
            <div className="px-6 py-3 rounded-full bg-gradient-to-r from-neon-cortex-blue/20 to-solar-surge-orange/20 border border-white/10">
              <p className="text-center font-medium">
                <Bell className="w-5 h-5 inline-block mr-2" />
                Push notifications keep everyone in sync
              </p>
            </div>
          </div>
        </LiquidGlass>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <LiquidGlass variant="orange" rounded="2xl" className="p-8 md:p-12 [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white/[0.02] [&>div:first-child]:via-transparent [&>div:first-child]:to-transparent">
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
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-black mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-gray-400 mb-8">
          Download Mind & Muscle and start building your drill library today.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/download"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-solar-surge-orange to-amber-500 hover:opacity-90 transition-all"
          >
            Download the App
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/faq"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
          >
            View Full FAQ
          </a>
        </div>
      </div>
    </div>
  );
}
