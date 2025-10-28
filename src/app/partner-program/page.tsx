'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Turnstile } from '@marsidev/react-turnstile';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { GradientTextReveal } from '@/components/animations';
import { EnhancedEarningsCalculator } from '@/components/partner/EnhancedEarningsCalculator';
import { ScenarioCard } from '@/components/partner/ScenarioCard';
import { DollarSign, TrendingUp, Users, Gift, BarChart, Rocket, Check, Link2, Star, Zap, Target, Award, BookOpen, Sparkles, Clock, Trophy, ChevronDown, GraduationCap, Briefcase, UserPlus, Building2 } from 'lucide-react';

export default function PartnerProgramPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    audience: '',
    networkSize: '',
    promotionChannel: '',
    whyExcited: '',
  });

  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      alert('Please complete the security verification.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/partner-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstileToken: captchaToken,
        }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setFormData({ name: '', email: '', organization: '', audience: '', networkSize: '', promotionChannel: '', whyExcited: '' });
        setCaptchaToken('');
      } else {
        const data = await response.json();
        alert(data.error || 'There was an error submitting your application. Please try again.');
      }
    } catch (error) {
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Scale to 15% Commission',
      description: 'Start at 10%, earn 15% when you refer teams with 101+ users. The bigger the organization, the more you earn per user.',
      variant: 'orange' as const,
    },
    {
      icon: Target,
      title: 'Target High-Value Organizations',
      description: 'One training facility or travel ball organization can generate more recurring income than 50 individual referrals.',
      variant: 'blue' as const,
    },
    {
      icon: Star,
      title: 'Lifetime Recurring Commission',
      description: 'Earn commission on every payment your referrals make - initial signup plus every renewal, forever.',
      variant: 'orange' as const,
    },
    {
      icon: Gift,
      title: 'Done-For-You Marketing Kit',
      description: 'Email templates, social graphics, landing pages - we create everything you need. Just share.',
      variant: 'orange' as const,
    },
    {
      icon: BarChart,
      title: 'Track Your Growing Income',
      description: 'See every click, sign-up, and commission in real-time as the platform scales',
      variant: 'blue' as const,
    },
    {
      icon: Users,
      title: 'Automatic Payouts',
      description: 'Earn commission on every referral payment - automatically paid via PayPal 60 days after payment clears',
      variant: 'orange' as const,
    },
    {
      icon: Target,
      title: 'No Earnings Cap',
      description: 'Unlimited potential - the more you share, the more you earn. No limits, no restrictions.',
      variant: 'orange' as const,
    },
    {
      icon: Sparkles,
      title: 'Co-Marketing Opportunities',
      description: 'Get featured in our content, social media, and product announcements. Grow your brand with ours.',
      variant: 'blue' as const,
    },
  ];

  const scenarios = [
    {
      title: 'Youth Coach Sarah',
      subtitle: 'Local Team Coach',
      icon: GraduationCap,
      stats: [
        { label: 'Coaches', value: '3 local teams' },
        { label: 'Total users', value: '45 players' },
        { label: 'Time invested', value: 'Shares at team meetings' },
      ],
      earnings: '$641.90/year (if renewed)',
      variant: 'blue' as const,
    },
    {
      title: 'Facility Owner Mike',
      subtitle: 'Batting Cage Owner',
      icon: Briefcase,
      stats: [
        { label: 'Regular clients', value: '125 users' },
        { label: 'Commission tier', value: '10% + 15% bonus' },
        { label: 'Time invested', value: 'Promotes in facility + email' },
      ],
      earnings: '$1,972.62/year (if renewed)',
      variant: 'orange' as const,
    },
    {
      title: 'Baseball Influencer Jordan',
      subtitle: 'YouTube Coach (50k subs)',
      icon: UserPlus,
      stats: [
        { label: 'Subscribers', value: '50,000' },
        { label: 'Conversion', value: '8 teams (240 users)' },
        { label: 'Time invested', value: 'One video + link' },
      ],
      earnings: '$4,283.38/year (if renewed)',
      variant: 'blue' as const,
    },
  ];

  const faqs = [
    {
      question: 'How much can I really earn?',
      answer: 'You earn 10% commission on every 6-month payment (15% on users 101+ for organizations). Customers subscribe for 6 months at a time. Examples per 6-month subscription: Individual referrals = $7.90 each. 12-user team = $85.32 total. 150-user facility = $930.29 per payment. If they renew after 6 months, you earn commission again - so annual potential doubles (2 payments = 2× commission). Commission is calculated on 6-month pricing: $79 (1-11 users), $71.10 (12-119 users), $67.15 (120-199 users), $63.20 (200+ users).'
    },
    {
      question: 'How does the referral tracking work?',
      answer: 'We use Tolt, a professional affiliate tracking platform, to manage your referral link and commissions. When someone clicks your unique tracking link, Tolt sets a 30-day cookie to track the conversion. Your partner dashboard at app.tolt.io shows real-time stats: every click, signup, conversion, and commission earned. You can see exactly which referrals are pending, which have paid, and your total earnings. All commission calculations are automatic, and payouts go directly to your PayPal account 60 days after payment clears.'
    },
    {
      question: 'What if I know facility owners or league directors?',
      answer: 'Perfect! One training facility or travel ball organization can generate more recurring income than dozens of individual referrals. Focus on organizations with 100+ users to unlock 15% commission on the volume above 100. We also offer special bonuses for partners who introduce other high-value partners to our program—contact us to learn more.'
    },
    {
      question: 'What if the platform doesn\'t succeed?',
      answer: 'There\'s zero cost to you. You only win if we win. No risk, all upside. Plus, you can stop participating at any time with no penalties.'
    },
    {
      question: 'What if I can\'t make any sales?',
      answer: 'We provide everything you need to succeed: email templates, social graphics, demo videos, and comprehensive marketing materials. Most partners get their first referral within 45 days just by sharing with their existing network.'
    },
    {
      question: 'Why should I join the partner program?',
      answer: 'Partners earn 10% lifetime commission on every referral - true passive income that compounds as your referrals renew year after year. Plus, you get co-marketing opportunities and access to new features before they\'re publicly available.'
    },
    {
      question: 'How long does approval take?',
      answer: 'We review applications within 24 hours. Our goal is same-day approval for qualified partners. You\'ll receive your tracking link and partner portal access immediately upon approval.'
    },
    {
      question: 'Do I need to be a coach to join?',
      answer: 'Not at all! We welcome coaches, athletic directors, sports bloggers, influencers, parents, and anyone with connections to the youth sports community. If you know people who coach teams, you\'re qualified.'
    },
    {
      question: 'How do payouts work?',
      answer: 'You earn 10% commission each time a referral pays for a subscription. Commissions are held for 60 days after payment clears (standard industry practice to protect against chargebacks), then paid automatically via PayPal. There\'s a $50 minimum threshold. Example: Referral subscribes January 1st = commission paid March 1st. If they renew next year, you earn another commission. Your dashboard shows real-time earnings and tracks every referral.'
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Apply',
      description: 'Fill out the application form below (takes 2 minutes)',
    },
    {
      number: '2',
      title: 'Get Approved',
      description: 'We\'ll review your application within 24 hours',
    },
    {
      number: '3',
      title: 'Get Your Link',
      description: 'Receive your unique tracking link and partner portal access',
    },
    {
      number: '4',
      title: 'Start Earning',
      description: 'Share your link and earn 10% commission on every referral payment',
    },
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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-20">
        <div className="inline-block mb-8">
          <LiquidGlass variant="orange" rounded="full" padding="none" glow={true} className="px-6 py-3">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-solar-surge-orange drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]" />
              <span className="text-base md:text-lg font-bold">PARTNER PROGRAM</span>
            </div>
          </LiquidGlass>
        </div>

        <GradientTextReveal
          text="Turn Your Baseball & Softball Connections Into Recurring Income"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-relaxed"
          gradientFrom="#F97316"
          gradientTo="#0EA5E9"
          delay={0.2}
        />

        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12">
          Earn up to 15% commission on every subscription payment—forever. Perfect for coaches, facility owners, league directors, and influencers with connections in youth sports.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <LiquidGlass variant="orange" glow={true} className="p-6 text-center min-w-[200px]">
            <div className="text-4xl font-black text-solar-surge-orange mb-2">10-15%</div>
            <div className="text-sm text-text-secondary">Lifetime Commission</div>
          </LiquidGlass>

          <LiquidGlass variant="blue" glow={true} className="p-6 text-center min-w-[200px]">
            <div className="text-4xl font-black text-neon-cortex-blue mb-2">Forever</div>
            <div className="text-sm text-text-secondary">Recurring Income</div>
          </LiquidGlass>

          <LiquidGlass variant="orange" glow={true} className="p-6 text-center min-w-[200px]">
            <div className="text-4xl font-black text-solar-surge-orange mb-2">8+ Teams</div>
            <div className="text-sm text-text-secondary">Unlocks 15%</div>
          </LiquidGlass>
        </div>
      </div>

      {/* Market Opportunity */}
      <div className="max-w-7xl mx-auto mb-20">
        <GradientTextReveal
          text="The Opportunity is Massive"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed text-center"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12 text-center">
          Youth sports is a $19.2B market. Coaches are actively seeking better tools. You're just connecting them to what they need.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <LiquidGlass variant="blue" glow={true} className="p-8 text-center">
            <div className="text-5xl font-black text-neon-cortex-blue mb-3">12.5M</div>
            <div className="text-text-secondary">Youth athletes in the US</div>
          </LiquidGlass>

          <LiquidGlass variant="orange" glow={true} className="p-8 text-center">
            <div className="text-5xl font-black text-solar-surge-orange mb-3">$19.2B</div>
            <div className="text-text-secondary">Youth sports market size</div>
          </LiquidGlass>

          <LiquidGlass variant="blue" glow={true} className="p-8 text-center">
            <div className="text-5xl font-black text-neon-cortex-blue mb-3">2.4M</div>
            <div className="text-text-secondary">Coaches nationwide</div>
          </LiquidGlass>
        </div>
      </div>

      {/* Interactive Calculator */}
      <div className="max-w-7xl mx-auto mb-20">
        <EnhancedEarningsCalculator />
      </div>

      {/* Perfect For High-Impact Partners */}
      <div className="max-w-7xl mx-auto mb-20">
        <GradientTextReveal
          text="Perfect For High-Impact Partners"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed text-center"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12 text-center">
          Whether you're a facility owner, league director, coach, or influencer—if you have connections in youth baseball and softball, you can earn serious recurring income.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Organizations & Facilities */}
          <LiquidGlass variant="orange" className="p-8">
            <div className="text-center mb-6">
              <div className="inline-block p-4 rounded-xl bg-solar-surge-orange/20 mb-4">
                <Building2 className="w-8 h-8 text-solar-surge-orange" />
              </div>
              <h3 className="text-2xl font-black mb-2">Organizations & Facilities</h3>
            </div>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">⚾</span>
                <span>Travel Ball Organizations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">🏟️</span>
                <span>Batting Cages & Performance Centers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">🎓</span>
                <span>High School & College Programs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">🥎</span>
                <span>Local Leagues (Little League, Babe Ruth, Pony)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">🏋️</span>
                <span>Multi-Sport Training Facilities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">🏅</span>
                <span>Sports Performance Centers</span>
              </li>
            </ul>
          </LiquidGlass>

          {/* Coaches & Trainers */}
          <LiquidGlass variant="blue" className="p-8">
            <div className="text-center mb-6">
              <div className="inline-block p-4 rounded-xl bg-neon-cortex-blue/20 mb-4">
                <Users className="w-8 h-8 text-neon-cortex-blue" />
              </div>
              <h3 className="text-2xl font-black mb-2">Coaches & Trainers</h3>
            </div>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-neon-cortex-blue mt-1">⚾</span>
                <span>Private Hitting Coaches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-cortex-blue mt-1">🥎</span>
                <span>Pitching Instructors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-cortex-blue mt-1">🧠</span>
                <span>Mental Performance Coaches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-cortex-blue mt-1">💪</span>
                <span>Strength & Conditioning Trainers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-cortex-blue mt-1">👥</span>
                <span>Team Coaches (Travel Ball, High School)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-cortex-blue mt-1">🎯</span>
                <span>Recruiting Consultants</span>
              </li>
            </ul>
          </LiquidGlass>

          {/* Influencers & Creators */}
          <LiquidGlass variant="orange" className="p-8">
            <div className="text-center mb-6">
              <div className="inline-block p-4 rounded-xl bg-solar-surge-orange/20 mb-4">
                <Star className="w-8 h-8 text-solar-surge-orange" />
              </div>
              <h3 className="text-2xl font-black mb-2">Influencers & Creators</h3>
            </div>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">📹</span>
                <span>YouTube Baseball/Softball Coaches (5k+ subscribers)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">📱</span>
                <span>TikTok/Instagram Skill Trainers (10k+ followers)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">🎙️</span>
                <span>Sports Performance Podcasters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">✍️</span>
                <span>Baseball/Softball Bloggers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">📺</span>
                <span>Equipment Review Channels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-surge-orange mt-1">🎓</span>
                <span>Recruiting Advice Content Creators</span>
              </li>
            </ul>
          </LiquidGlass>
        </div>

        {/* Call-out box */}
        <div className="mt-8">
          <LiquidGlass variant="blue" className="p-6">
            <div className="text-center">
              <div className="inline-block p-3 rounded-xl bg-neon-cortex-green/20 mb-3">
                <TrendingUp className="w-6 h-6 text-neon-cortex-green" />
              </div>
              <h4 className="text-xl font-bold mb-2">Know High-Value Partners?</h4>
              <p className="text-text-secondary text-sm max-w-3xl mx-auto">
                Know facility owners, league directors, or influencers who could be great partners? One introduction to a high-value partner can generate more recurring income than dozens of individual referrals. <a href="mailto:support@mindandmuscle.ai" className="text-neon-cortex-blue hover:underline font-bold">Contact us</a> about special introducer opportunities.
              </p>
            </div>
          </LiquidGlass>
        </div>
      </div>

      {/* Aspirational Scenarios */}
      <div className="max-w-7xl mx-auto mb-20">
        <GradientTextReveal
          text="What Partners Like You Can Earn"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed text-center"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12 text-center">
          Real scenarios based on typical networks and conversion rates. Your actual earnings depend on your connections and how actively you promote.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {scenarios.map((scenario, index) => (
            <ScenarioCard key={index} {...scenario} />
          ))}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-7xl mx-auto mb-20">
        <GradientTextReveal
          text="Why Partner With Us?"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed text-center"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12 text-center">
          Lifetime commission opportunity. Earn on every payment. Everything you need to succeed.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <LiquidGlass key={index} variant={benefit.variant} className="p-6">
                <div className={`inline-block p-3 rounded-xl mb-4 ${
                  benefit.variant === 'blue'
                    ? 'bg-neon-cortex-blue/20'
                    : 'bg-solar-surge-orange/20'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    benefit.variant === 'blue'
                      ? 'text-mind-primary'
                      : 'text-muscle-primary'
                  }`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-text-secondary text-sm">{benefit.description}</p>
              </LiquidGlass>
            );
          })}
        </div>
      </div>

      {/* Why Partners Choose Mind & Muscle - Competitive Talking Points */}
      <div className="max-w-7xl mx-auto mb-20">
        <GradientTextReveal
          text="What Makes Mind & Muscle Easy to Sell"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed text-center"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12 text-center">
          These talking points help partners explain why Mind & Muscle is different from other apps in the market.
        </p>

        <div className="space-y-6">
          {/* Talking Point 1: All-in-One Integration */}
          <LiquidGlass variant="blue" className="p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-neon-cortex-blue/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black mb-3 text-neon-cortex-blue">All-In-One Integration</h3>
                <p className="text-text-secondary mb-4 leading-relaxed">
                  <strong className="text-white">What coaches are dealing with now:</strong> Juggling 7+ different apps (team communication, mental training, video analysis, strength training, nutrition, IQ training, goal tracking). Multiple monthly payments. Data that never connects. Athletes who quit because it's too complicated.
                </p>
                <p className="text-gray-200 leading-relaxed">
                  <strong className="text-neon-cortex-blue">Mind & Muscle solution:</strong> One intelligent platform where everything connects. The AI learns from swing videos, workouts, mental training, and goals—making smarter recommendations across all areas. One login. One 6-month payment. Development that actually integrates.
                </p>
                <div className="mt-4 p-4 bg-neon-cortex-blue/10 border border-neon-cortex-blue/30 rounded-lg">
                  <p className="text-sm text-gray-300">
                    💡 <strong>Differentiator:</strong> "Stop piecing together 7 apps that cost $1,060/year per athlete. Get everything integrated for $79 per 6 months—or less with team discounts."
                  </p>
                </div>
              </div>
            </div>
          </LiquidGlass>

          {/* Talking Point 2: Baseball-Specific AI */}
          <LiquidGlass variant="orange" className="p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-solar-surge-orange/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-solar-surge-orange" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black mb-3 text-solar-surge-orange">Built from Scratch for Baseball</h3>
                <p className="text-text-secondary mb-4 leading-relaxed">
                  <strong className="text-white">What coaches are dealing with now:</strong> Generic multi-sport apps with a "baseball filter" slapped on. Mental training designed for general athletes. Strength programs not optimized for rotational power. Scenarios that don't match real game situations.
                </p>
                <p className="text-gray-200 leading-relaxed">
                  <strong className="text-solar-surge-orange">Mind & Muscle solution:</strong> Every drill designed for baseball movements. AI trained exclusively on baseball content. 186 real game scenarios. Position-specific strength training (pitchers get rotational power, catchers get explosive legs). Not adapted—purpose-built.
                </p>
                <div className="mt-4 p-4 bg-solar-surge-orange/10 border border-solar-surge-orange/30 rounded-lg">
                  <p className="text-sm text-gray-300">
                    💡 <strong>Differentiator:</strong> "Unlike multi-sport apps, Mind & Muscle was built exclusively for baseball players. Every feature is designed for your sport."
                  </p>
                </div>
              </div>
            </div>
          </LiquidGlass>

          {/* Talking Point 3: Adaptive Learning AI */}
          <LiquidGlass variant="blue" className="p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-neon-cortex-blue/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black mb-3 text-neon-cortex-blue">AI That Actually Learns</h3>
                <p className="text-text-secondary mb-4 leading-relaxed">
                  <strong className="text-white">What coaches are dealing with now:</strong> Static content libraries. One-size-fits-all training programs. Apps that deliver the same workouts to every athlete regardless of position, skill level, or progress. No personalization. No adaptation.
                </p>
                <p className="text-gray-200 leading-relaxed">
                  <strong className="text-neon-cortex-blue">Mind & Muscle solution:</strong> AI creates a complete profile of each athlete. Learns from every session, workout, and analysis. Cross-feature insights: swing analysis identifies timing issues → Mind Coach recommends focus training → Goals AI suggests milestones → Muscle Coach designs bat speed workouts. Everything connects and improves together.
                </p>
                <div className="mt-4 p-4 bg-neon-cortex-blue/10 border border-neon-cortex-blue/30 rounded-lg">
                  <p className="text-sm text-gray-300">
                    💡 <strong>Differentiator:</strong> "Other apps deliver the same content to everyone. Mind & Muscle's AI learns each athlete's strengths and gaps, then engineers personalized development plans."
                  </p>
                </div>
              </div>
            </div>
          </LiquidGlass>

          {/* Talking Point 4: Team Value Proposition */}
          <LiquidGlass variant="orange" className="p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-solar-surge-orange/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-solar-surge-orange" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black mb-3 text-solar-surge-orange">Beyond Team Logistics</h3>
                <p className="text-text-secondary mb-4 leading-relaxed">
                  <strong className="text-white">What coaches are dealing with now:</strong> Free team communication apps handle logistics (schedules, messages, stats) but offer zero athlete development. When practice ends, athletes are on their own for mental training, strength work, and skill development.
                </p>
                <p className="text-gray-200 leading-relaxed">
                  <strong className="text-solar-surge-orange">Mind & Muscle solution:</strong> Team communication PLUS 7 AI development tools. Yes, we have scheduling and team chat. But we also have AI mental training, swing analysis, position-specific strength programs, baseball IQ scenarios, nutrition planning, and goal coaching. We're not replacing team logistics apps—we're adding what happens between games.
                </p>
                <div className="mt-4 p-4 bg-solar-surge-orange/10 border border-solar-surge-orange/30 rounded-lg">
                  <p className="text-sm text-gray-300">
                    💡 <strong>Differentiator:</strong> "Team communication apps track what happened. Mind & Muscle develops what happens next. Get logistics + athlete development in one platform."
                  </p>
                </div>
              </div>
            </div>
          </LiquidGlass>
        </div>
      </div>

      {/* Partner Resources Preview */}
      <div className="max-w-6xl mx-auto mb-20">
        <GradientTextReveal
          text="Everything You Need to Succeed"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed text-center"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12 text-center">
          We do the heavy lifting. You just share. Here's what you get when approved:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <LiquidGlass variant="blue" className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-mind-primary" />
              Marketing Materials
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                3 pre-written email templates (ready to send)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                20+ social media graphics (all sizes)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Product demo videos (30s, 60s, 2min)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Landing page copy templates
              </li>
            </ul>
          </LiquidGlass>

          <LiquidGlass variant="orange" className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-muscle-primary" />
              Real-Time Tracking
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Track every click and signup
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                See commission earnings in real-time
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Monitor conversion rates
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Automatic PayPal payouts (60 days after sale)
              </li>
            </ul>
          </LiquidGlass>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto mb-20">
        <GradientTextReveal
          text="How It Works"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-12 leading-relaxed text-center"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-neon-cortex-blue to-solar-surge-orange mb-4 text-2xl font-black">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mb-20">
        <GradientTextReveal
          text="Questions? We've Got Answers"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed text-center"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12 text-center">
          Everything you need to know about becoming a partner.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <LiquidGlass key={index} variant="blue" className="p-6">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full text-left flex items-center justify-between gap-4"
              >
                <h3 className="text-lg font-bold">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-neon-cortex-blue transition-transform flex-shrink-0 ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFaq === index && (
                <p className="text-text-secondary text-sm mt-4 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </LiquidGlass>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <div className="max-w-3xl mx-auto">
        <LiquidGlass variant="blue" glow={true} className="p-8">
          <GradientTextReveal
            text="Ready to Start Earning?"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-relaxed text-center"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12 text-center">
            Apply below. Most applications are approved within 24 hours.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-semibold mb-2">
                Organization/Website (Optional)
              </label>
              <input
                type="text"
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md"
                placeholder="Your organization or website"
              />
            </div>

            <div>
              <label htmlFor="networkSize" className="block text-sm font-semibold mb-2">
                How many coaches/teams are in your network? *
              </label>
              <select
                id="networkSize"
                required
                value={formData.networkSize}
                onChange={(e) => setFormData({ ...formData, networkSize: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md"
              >
                <option value="">Select range...</option>
                <option value="1-5">1-5 coaches/teams</option>
                <option value="6-15">6-15 coaches/teams</option>
                <option value="16-30">16-30 coaches/teams</option>
                <option value="31-50">31-50 coaches/teams</option>
                <option value="50+">50+ coaches/teams</option>
              </select>
            </div>

            <div>
              <label htmlFor="promotionChannel" className="block text-sm font-semibold mb-2">
                How will you primarily promote? *
              </label>
              <select
                id="promotionChannel"
                required
                value={formData.promotionChannel}
                onChange={(e) => setFormData({ ...formData, promotionChannel: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md"
              >
                <option value="">Select channel...</option>
                <option value="email">Direct email to coaches</option>
                <option value="social">Social media (Instagram, Twitter, etc.)</option>
                <option value="blog">Blog or website</option>
                <option value="inperson">In-person at games/events</option>
                <option value="community">Online community or group</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="whyExcited" className="block text-sm font-semibold mb-2">
                Why are you excited about Mind & Muscle? *
              </label>
              <textarea
                id="whyExcited"
                required
                rows={3}
                value={formData.whyExcited}
                onChange={(e) => setFormData({ ...formData, whyExcited: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md resize-none"
                placeholder="What excites you about helping coaches with mental and physical training..."
              />
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-semibold mb-2">
                Tell us about your audience
              </label>
              <textarea
                id="audience"
                rows={3}
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md resize-none"
                placeholder="Optional: demographics, sports, competitive level, etc."
              />
            </div>

            <div className="p-4 bg-neon-cortex-green/10 border border-neon-cortex-green/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-neon-cortex-green flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary">
                  By applying, you agree to our{' '}
                  <a href="/partner-terms" target="_blank" className="text-neon-cortex-green hover:underline">
                    partner terms
                  </a>
                  . No commitments required - you can stop at any time. Zero risk, all upside.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken('')}
                onExpire={() => setCaptchaToken('')}
              />
            </div>

            <LiquidButton
              type="submit"
              variant="orange"
              size="lg"
              fullWidth={true}
              disabled={!captchaToken || isSubmitting}
              className="!bg-gradient-to-r !from-solar-surge-orange !to-muscle-primary !shadow-[0_0_30px_rgba(251,146,60,0.6)] hover:!shadow-[0_0_40px_rgba(251,146,60,0.8)] !border-solar-surge-orange/60 !text-white !font-black !text-xl animate-pulse-subtle"
            >
              {isSubmitting ? 'Submitting...' : 'Apply Now - Start Earning'}
            </LiquidButton>

            <p className="text-xs text-text-secondary text-center">
              Most applications are reviewed within 24 hours. You'll receive your tracking link immediately upon approval.
            </p>
          </form>
        </LiquidGlass>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <LiquidGlass variant="orange" glow={true} className="max-w-2xl w-full p-8 relative">
            <div className="text-center">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neon-cortex-green to-muscle-primary mb-6 animate-float">
                <Check className="w-12 h-12 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue bg-clip-text text-transparent">
                Welcome to the Team! 🎉
              </h2>

              {/* Message */}
              <p className="text-lg sm:text-xl text-gray-300 mb-6 leading-relaxed">
                Your partner application has been submitted and you've been automatically approved!
              </p>

              {/* Info Cards */}
              <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-neon-cortex-green/10 border border-neon-cortex-green/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-neon-cortex-green flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm mb-1">Check Your Email</h3>
                      <p className="text-xs text-text-secondary">
                        We sent two emails: one from Mind & Muscle and one from Tolt with your dashboard login link.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-solar-surge-orange/10 border border-solar-surge-orange/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Rocket className="w-5 h-5 text-solar-surge-orange flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm mb-1">Access Your Dashboard</h3>
                      <p className="text-xs text-text-secondary">
                        Click the link in your Tolt email to access your partner dashboard and get your referral link.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-neon-cortex-blue/10 border border-neon-cortex-blue/30 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-neon-cortex-blue" />
                  Next Steps to Start Earning
                </h3>
                <ol className="space-y-3 text-sm text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-solar-surge-orange/20 flex items-center justify-center text-xs font-bold">1</span>
                    <span><strong>Check your email inbox</strong> (and spam folder) for two emails - one welcome email and one from Tolt</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-solar-surge-orange/20 flex items-center justify-center text-xs font-bold">2</span>
                    <span><strong>Click the Tolt login link</strong> to access your partner dashboard at app.tolt.io</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-solar-surge-orange/20 flex items-center justify-center text-xs font-bold">3</span>
                    <span><strong>Get your unique referral link</strong> from the dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-solar-surge-orange/20 flex items-center justify-center text-xs font-bold">4</span>
                    <span><strong>Share with your network</strong> and start earning 10% lifetime commission!</span>
                  </li>
                </ol>
              </div>

              {/* Warning about spam */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
                <p className="text-xs text-yellow-200">
                  ⚠️ <strong>Important:</strong> The Tolt email might land in your spam folder. Please check spam and mark it as "Not Spam" to receive future updates.
                </p>
              </div>

              {/* CTA Button */}
              <LiquidButton
                onClick={() => setShowSuccessModal(false)}
                variant="orange"
                size="lg"
                fullWidth={true}
                className="!bg-gradient-to-r !from-solar-surge-orange !to-muscle-primary"
              >
                Got It - Check My Email
              </LiquidButton>
            </div>
          </LiquidGlass>
        </div>
      )}
    </div>
  );
}
