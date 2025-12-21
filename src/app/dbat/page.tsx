'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { motion } from 'framer-motion';
import {
  FadeInWhenVisible,
  StaggerChildren,
  GradientTextReveal,
  staggerItemVariants,
} from '@/components/animations';
import {
  TrendingDown, UserX, Target, Repeat, Video, Brain, Gamepad2,
  Dumbbell, DollarSign, Users, TrendingUp, Mail,
  CheckCircle, ArrowRight, Play, Award, Building2, Zap, UserPlus
} from 'lucide-react';

export default function DBatPartnerPage() {
  const [athleteCount, setAthleteCount] = useState(200);
  const [retentionLift, setRetentionLift] = useState(10); // % of members who stay longer
  const [conversionRate, setConversionRate] = useState(5); // % of lesson-only athletes who become members

  // D-BAT specific costs (researched)
  const avgLessonPrice = 100; // $100/hour average (user confirmed)
  const avgMembershipPrice = 68; // $48-88/mo, using average
  const lessonsPerMonth = 4; // Typical lessons per month
  const extraMonths = 3; // How many extra months retained members stay

  // Assume 30% of athletes are lesson-only (not members)
  const lessonOnlyAthletes = Math.round(athleteCount * 0.3);

  // Retention value: X% of members stay 3 extra months = (lessons + membership) × 3
  const retainedMembers = Math.round(athleteCount * 0.7 * (retentionLift / 100));
  const monthlyValuePerMember = (lessonsPerMonth * avgLessonPrice) + avgMembershipPrice;
  const retentionValue = Math.round(retainedMembers * monthlyValuePerMember * extraMonths);

  // New member conversion: Y% of lesson-only athletes become members
  const newMembers = Math.round(lessonOnlyAthletes * (conversionRate / 100));
  const conversionValue = Math.round(newMembers * avgMembershipPrice * 12); // Annual membership value

  // Commission calculation (10% base, 15% at 101+)
  const pricePerUser = athleteCount >= 200 ? 63.20 : athleteCount >= 120 ? 67.15 : athleteCount >= 12 ? 71.10 : 79;
  const commissionRate = athleteCount >= 101 ? 0.15 : 0.10;
  const annualCommission = Math.round(athleteCount * pricePerUser * commissionRate * 2);

  // Total annual value
  const totalAnnualValue = retentionValue + conversionValue + annualCommission;

  // Training facility pain points (business-focused)
  const painPoints = [
    {
      icon: TrendingDown,
      title: 'Lessons Plateau',
      description: 'Athletes forget mechanical changes between visits. Progress stalls, and parents question the value of continued lessons.',
    },
    {
      icon: UserX,
      title: 'Parents Question Value',
      description: 'Parents don\'t see progress outside the cage. Without visible results between sessions, they reconsider the investment.',
    },
    {
      icon: Target,
      title: 'Drop-Off Between Seasons',
      description: 'Athletes disengage between sessions or seasons. When they return, you\'re starting over instead of building forward.',
    },
  ];

  // Features for training facilities
  const features = [
    {
      id: 'swing-lab',
      title: 'Reinforce Mechanical Changes',
      tagline: 'Swing Lab',
      description: 'Athletes upload videos from lessons. AI analyzes mechanics and reminds them what you taught. They practice the right things between sessions.',
      color: 'orange',
      videoUrl: '/assets/videos/swing_lab.mp4',
      iconImage: '/assets/images/Swing Lab1.png',
      forInstructor: 'Athletes come prepared. They remember what you worked on.',
    },
    {
      id: 'mind-coach',
      title: 'Build Confidence Between Visits',
      tagline: 'Mind Coach AI',
      description: 'Pre-lesson focus routine. Post-game reflection. Confidence building between sessions. Finally, structured mental training.',
      color: 'blue',
      videoUrl: '/assets/videos/mind_coachai.mp4',
      iconImage: '/assets/images/Mind AI Coach.png',
      forInstructor: 'You coach mechanics. AI coaches mindset. Complete player.',
    },
    {
      id: 'fuel-lab',
      title: 'Support Recovery & Performance at Home',
      tagline: 'Fuel Lab',
      description: 'Nutrition guidance and recovery protocols athletes can follow at home. Proper fueling means better performance in the cage.',
      color: 'orange',
      videoUrl: '/assets/videos/plate_iq.mp4',
      iconImage: '/assets/images/plate_iq_icon.png',
      forInstructor: 'Athletes arrive fueled and recovered. Ready to train.',
    },
    {
      id: 'progress',
      title: 'Visible Progress for Parents',
      tagline: 'Progress Tracking',
      description: 'Parents see what their athlete is working on between lessons. Weekly reports show engagement, improvement, and value delivered.',
      color: 'blue',
      videoUrl: '/assets/videos/pitch_lab.mp4',
      iconImage: '/assets/images/pitch_lab_icon.png',
      forInstructor: 'Parents see the value. Retention increases.',
    },
  ];

  // What each stakeholder gets
  const stakeholders = [
    {
      role: 'D-BAT Owners',
      icon: Building2,
      benefits: [
        'New recurring revenue stream',
        'Stronger lesson retention',
        'Increased perceived value of training programs',
        'Differentiation from competing facilities',
      ],
      color: 'blue',
    },
    {
      role: 'Coaches & Instructors',
      icon: Award,
      benefits: [
        'Athletes arrive prepared with 5-min pre-lesson focus',
        'They practice what you taught (not random swings)',
        'Faster progress = you look good = more referrals',
        'AI handles mental coaching so you can focus on mechanics',
      ],
      color: 'orange',
    },
    {
      role: 'Athletes & Parents',
      icon: Users,
      benefits: [
        'See real progress between lessons',
        'Complete development: physical + mental + game IQ',
        'AI swing analysis from their own cage videos',
        'Finally understand what to work on at home',
      ],
      color: 'blue',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Section 1: Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cortex-blue/20 via-[#0F1123] to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Logo */}
          <FadeInWhenVisible delay={0} direction="down">
            <div className="flex flex-col items-center justify-center mb-10">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <Image
                  src="/assets/images/logo.png"
                  alt="Mind & Muscle"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </FadeInWhenVisible>

          {/* Headline */}
          <div className="text-center">
            <FadeInWhenVisible delay={0.2} direction="up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                <span className="text-white">A Partnership Built for</span>
                <br />
                <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
                  D-BAT Facility Owners.
                </span>
              </h1>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.3} direction="up">
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-medium mb-4">
                Mind & Muscle helps D-BAT locations extend lesson impact, keep athletes engaged between visits, and increase long-term retention.
              </p>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.4} direction="up">
              <div className="flex flex-col items-center mt-8">
                <a
                  href="#calculator"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange hover:from-neon-cortex-blue/90 hover:to-solar-surge-orange/90 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl mb-4"
                >
                  <ArrowRight className="w-5 h-5" />
                  Explore the Partner Program
                </a>
                <p className="text-white/50 text-sm">
                  Questions? <a href="mailto:partners@mindandmuscle.ai" className="text-white/70 hover:text-white underline underline-offset-4 transition-colors">partners@mindandmuscle.ai</a>
                </p>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* Section: Built for Training Facilities */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up">
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 17, 35, 0.9) 0%, rgba(27, 31, 57, 0.9) 100%)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
              }}
            >
              <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-8">
                Built for D-BAT Facilities
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: DollarSign, text: 'Creates a new recurring revenue stream' },
                  { icon: TrendingUp, text: 'Keeps athletes progressing between lessons' },
                  { icon: Repeat, text: 'Increases lesson retention & repeat visits' },
                  { icon: UserPlus, text: 'Zero additional staff or coaching time' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neon-cortex-blue/20 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-neon-cortex-blue" />
                    </div>
                    <p className="text-white/80 text-sm font-medium leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Section 2: Partner Banner Example */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up">
            <div className="text-center mb-6">
              <p className="text-sm text-neon-cortex-blue font-bold uppercase tracking-wider">
                Your Custom Partner Banner
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* EXAMPLE Badge */}
              <div className="absolute top-4 right-4 z-10 bg-solar-surge-orange text-white px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider shadow-lg">
                Example
              </div>
              <Image
                src="/assets/images/example-partner-banner.png"
                alt="Example Partner Banner"
                width={1456}
                height={816}
                className="w-full h-auto"
              />
            </div>
            <p className="text-center text-white/50 text-sm mt-4">
              We create custom co-branded marketing materials for every partner location
            </p>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Section 3: Pain Points */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/5 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Common Challenges for Training Facilities
            </h2>
            <p className="text-lg text-text-secondary">
              These challenges affect every training facility. Mind & Muscle helps solve them.
            </p>
          </FadeInWhenVisible>

          <StaggerChildren staggerDelay={0.1} className="grid sm:grid-cols-3 gap-6">
            {painPoints.map((point, index) => (
              <motion.div key={index} variants={staggerItemVariants} className="group">
                <div
                  className="relative h-full rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 17, 35, 0.9) 0%, rgba(27, 31, 57, 0.9) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="relative p-6 flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.6) 100%)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      <point.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{point.title}</h3>
                      <p className="text-white/70 leading-relaxed">{point.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Section 3: The Solution - Features */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F3A] via-[#0F1123] to-[#1A1F3A]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cortex-blue/20 text-neon-cortex-blue text-sm font-bold mb-6">
              <Zap className="w-4 h-4" />
              EXTEND YOUR COACHING IMPACT
            </div>
            <GradientTextReveal
              text="Training Between Lessons"
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6"
              gradientFrom="#0EA5E9"
              gradientTo="#F97316"
              delay={0.2}
            />
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Facilities use Mind & Muscle to extend coaching impact—without replacing lessons.
            </p>
          </FadeInWhenVisible>

          <StaggerChildren staggerDelay={0.15} className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const isBlue = feature.color === 'blue';
              return (
                <motion.div key={feature.id} className="group relative" variants={staggerItemVariants}>
                  <div
                    className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${
                      isBlue ? 'bg-gradient-to-b from-neon-cortex-blue/30 to-transparent' : 'bg-gradient-to-b from-solar-surge-orange/30 to-transparent'
                    }`}
                  />
                  <div
                    className={`relative backdrop-blur-sm bg-white/[0.02] p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.05] h-full ${
                      isBlue
                        ? 'border-neon-cortex-blue/40 hover:border-neon-cortex-blue shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                        : 'border-solar-surge-orange/40 hover:border-solar-surge-orange shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                    }`}
                  >
                    {/* Video */}
                    <div className="relative aspect-video bg-gradient-to-br from-white/5 to-transparent rounded-xl mb-4 overflow-hidden">
                      <video
                        src={feature.videoUrl}
                        className="w-full h-full object-cover opacity-95"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                      />
                    </div>

                    {/* Icon + Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                          isBlue ? 'bg-neon-cortex-blue/10 border border-neon-cortex-blue/30' : 'bg-solar-surge-orange/10 border border-solar-surge-orange/30'
                        }`}
                      >
                        <Image
                          src={feature.iconImage}
                          alt={`${feature.title} icon`}
                          width={36}
                          height={36}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h3 className={`text-xl font-black ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}>
                          {feature.title}
                        </h3>
                        <p className={`text-sm font-medium ${isBlue ? 'text-neon-cortex-blue/70' : 'text-solar-surge-orange/70'}`}>
                          {feature.tagline}
                        </p>
                      </div>
                    </div>

                    <p className="text-text-secondary leading-relaxed mb-4">{feature.description}</p>

                    {/* Instructor benefit callout */}
                    <div className={`p-3 rounded-lg ${isBlue ? 'bg-neon-cortex-blue/10' : 'bg-solar-surge-orange/10'}`}>
                      <p className={`text-sm font-medium ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}>
                        <span className="font-bold">For instructors:</span> {feature.forInstructor}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* Section: How Facilities Use Mind & Muscle */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up">
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 17, 35, 0.9) 0%, rgba(27, 31, 57, 0.9) 100%)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
              }}
            >
              <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-8">
                How Facilities Use Mind & Muscle
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'QR code at front desk or cage exits',
                  'Included with lessons, camps, or memberships',
                  'Optional add-on for families',
                  'Co-branded with your facility',
                  'No staff training required',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-solar-surge-orange flex-shrink-0" />
                    <p className="text-white/80 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Section 4: What's In It For You */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              What's In It For You?
            </h2>
            <p className="text-lg text-text-secondary">
              Everyone wins. Here's how.
            </p>
          </FadeInWhenVisible>

          <StaggerChildren staggerDelay={0.1} className="grid md:grid-cols-3 gap-6">
            {stakeholders.map((stakeholder, index) => (
              <motion.div key={index} variants={staggerItemVariants}>
                <LiquidGlass
                  variant={stakeholder.color as 'blue' | 'orange'}
                  padding="lg"
                  className="h-full"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${
                      stakeholder.color === 'blue' ? 'bg-neon-cortex-blue/20' : 'bg-solar-surge-orange/20'
                    }`}>
                      <stakeholder.icon className={`w-6 h-6 ${
                        stakeholder.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{stakeholder.role}</h3>
                  </div>
                  <ul className="space-y-3">
                    {stakeholder.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          stakeholder.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
                        }`} />
                        <span className="text-text-secondary text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </LiquidGlass>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Section 5: The Calculator - Retention + Conversion + Commission */}
      <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              What If Every Lesson Created More Long-Term Value?
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Facilities use Mind & Muscle to increase engagement and retention—not replace lessons.
            </p>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.2} direction="up">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 17, 35, 0.95) 0%, rgba(27, 31, 57, 0.95) 100%)',
                border: '2px solid rgba(14, 165, 233, 0.4)',
                boxShadow: '0 8px 32px rgba(14, 165, 233, 0.2)',
              }}
            >
              <div className="p-8">
                {/* Assumptions callout */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-text-secondary">
                    <span className="font-bold text-white">Based on D-BAT averages:</span> $100/hr lessons, $68/mo membership (Gold $48, Platinum $88), 4 lessons/month
                  </p>
                </div>

                {/* Athlete Count Slider */}
                <div className="mb-8">
                  <label className="block text-lg font-bold mb-4 text-white">
                    How many active athletes at your D-BAT?
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={athleteCount}
                    onChange={(e) => setAthleteCount(Number(e.target.value))}
                    className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                  />
                  <div className="flex justify-between text-sm text-text-secondary mt-2">
                    <span>50</span>
                    <span className="text-2xl font-black text-white">{athleteCount}</span>
                    <span>500</span>
                  </div>
                </div>

                {/* Retention Lift Slider */}
                <div className="mb-8">
                  <label className="block text-lg font-bold mb-2 text-white">
                    If <span className="text-neon-cortex-blue">{retentionLift}%</span> of members stay 3 extra months...
                  </label>
                  <p className="text-sm text-text-secondary mb-4">
                    Because they're seeing faster progress with structured between-lesson training
                  </p>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="5"
                    value={retentionLift}
                    onChange={(e) => setRetentionLift(Number(e.target.value))}
                    className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cortex-blue"
                  />
                  <div className="flex justify-between text-sm text-text-secondary mt-2">
                    <span>5%</span>
                    <span>25%</span>
                  </div>
                </div>

                {/* New Member Conversion Slider */}
                <div className="mb-8">
                  <label className="block text-lg font-bold mb-2 text-white">
                    If <span className="text-solar-surge-orange">{conversionRate}%</span> of lesson-only athletes become members...
                  </label>
                  <p className="text-sm text-text-secondary mb-4">
                    {lessonOnlyAthletes} athletes take lessons but aren't members. The app shows them the value of training more.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="5"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-surge-orange"
                  />
                  <div className="flex justify-between text-sm text-text-secondary mt-2">
                    <span>0%</span>
                    <span>20%</span>
                  </div>
                </div>

                {/* Results */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-5 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-text-secondary mb-2">Member Retention</p>
                    <p className="text-2xl font-black text-neon-cortex-blue">
                      ${retentionValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {retainedMembers} members × 3 mo
                    </p>
                  </div>
                  <div className="text-center p-5 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-text-secondary mb-2">New Members</p>
                    <p className="text-2xl font-black text-solar-surge-orange">
                      ${conversionValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {newMembers} converted × 12 mo
                    </p>
                  </div>
                  <div className="text-center p-5 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-text-secondary mb-2">Partner Earnings</p>
                    <p className="text-2xl font-black text-white/80">
                      ${annualCommission.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {athleteCount >= 101 ? '15%' : '10%'} of app subs
                    </p>
                  </div>
                  <div className="text-center p-5 bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 rounded-xl border-2 border-neon-cortex-blue/40">
                    <p className="text-xs text-white/80 mb-2 font-medium">Total Annual Value</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
                      ${totalAnnualValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      Per year
                    </p>
                  </div>
                </div>

                {/* Key insight */}
                <div className="p-4 bg-neon-cortex-blue/10 border border-neon-cortex-blue/30 rounded-lg">
                  <p className="text-center text-sm">
                    <span className="font-bold text-neon-cortex-blue">The insight:</span>{' '}
                    <span className="text-white/80">
                      Retention + conversion value is {Math.round((retentionValue + conversionValue) / annualCommission * 10) / 10}x the partner earnings.
                      Zero cost to you—athletes buy their own subscriptions.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Section 6: How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up">
            <div
              className="rounded-3xl overflow-hidden text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 17, 35, 0.95) 0%, rgba(27, 31, 57, 0.95) 100%)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                boxShadow: '0 8px 32px rgba(14, 165, 233, 0.2)',
              }}
            >
              <div className="p-8 sm:p-12">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-8">
                  Getting Started Takes 10 Minutes
                </h2>

                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                  {[
                    { step: '1', title: 'We Set You Up', desc: 'Custom referral link, QR codes, email templates - all branded for your D-BAT' },
                    { step: '2', title: 'You Share It', desc: 'QR poster in your facility. Quick email to your athlete list. That\'s it.' },
                    { step: '3', title: 'Track Everything', desc: 'See who\'s signed up, who\'s training, and your commission in real-time' },
                  ].map((item) => (
                    <div key={item.step} className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-neon-cortex-blue to-solar-surge-orange mb-4 text-xl font-black text-white">
                        {item.step}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                  <span className="px-4 py-2 rounded-full bg-neon-cortex-blue/20 text-neon-cortex-blue font-medium">Zero upfront cost</span>
                  <span className="px-4 py-2 rounded-full bg-neon-cortex-blue/20 text-neon-cortex-blue font-medium">Zero staff time</span>
                  <span className="px-4 py-2 rounded-full bg-neon-cortex-blue/20 text-neon-cortex-blue font-medium">Zero risk</span>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Section 7: CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up">
            <div
              className="rounded-3xl overflow-hidden text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)',
                border: '2px solid rgba(14, 165, 233, 0.5)',
                boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3)',
              }}
            >
              <div className="p-8 sm:p-12">
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  Ready to Extend the Value of Every Lesson?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
                  Sign up takes 2 minutes. Get your referral link, QR code, and co-branded materials instantly.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                  <a
                    href="/partner-program?source=dbat&type=facility#apply"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange hover:from-neon-cortex-blue/90 hover:to-solar-surge-orange/90 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Become a Partner
                  </a>
                </div>

                <p className="text-white/40 text-sm">
                  Questions? <a href="mailto:partners@mindandmuscle.ai" className="text-white/60 hover:text-white underline">partners@mindandmuscle.ai</a>
                </p>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  );
}
