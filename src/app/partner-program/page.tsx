'use client';

import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { EarningsCalculator } from '@/components/partner/EarningsCalculator';
import { ScenarioCard } from '@/components/partner/ScenarioCard';
import { DollarSign, TrendingUp, Users, Gift, BarChart, Rocket, Check, Link2, Star, Zap, Target, Award, BookOpen, Sparkles, Clock, Trophy, ChevronDown, GraduationCap, Briefcase, UserPlus } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      alert('Please complete the security verification.');
      return;
    }

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
        alert('Application submitted! We\'ll review and get back to you within 24 hours. Check your email for next steps.');
        setFormData({ name: '', email: '', organization: '', audience: '', networkSize: '', promotionChannel: '', whyExcited: '' });
        setCaptchaToken('');
      } else {
        const data = await response.json();
        alert(data.error || 'There was an error submitting your application. Please try again.');
      }
    } catch (error) {
      alert('There was an error submitting your application. Please try again.');
    }
  };

  const benefits = [
    {
      icon: Star,
      title: 'Lifetime Commission',
      description: 'Earn 10% commission each time your referral pays - initial signup plus every renewal they make',
      variant: 'orange' as const,
    },
    {
      icon: TrendingUp,
      title: 'Unlimited Earning Potential',
      description: 'Earn commission every time your referrals pay - as long as they keep subscribing, you keep earning.',
      variant: 'blue' as const,
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
      icon: Zap,
      title: 'Feature Preview Access',
      description: 'Test new features before public release and provide feedback that shapes the product roadmap.',
      variant: 'orange' as const,
    },
    {
      icon: Users,
      title: 'Automatic Payouts',
      description: 'Earn commission on every referral payment - automatically paid via PayPal 60 days after payment clears',
      variant: 'blue' as const,
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
      subtitle: 'Rec League Coach',
      icon: GraduationCap,
      stats: [
        { label: 'Network', value: '150 families' },
        { label: 'Refers', value: '3 teams' },
        { label: 'Time invested', value: 'Just shares link' },
      ],
      earnings: '$385.56/year',
      variant: 'blue' as const,
    },
    {
      title: 'Athletic Director Mike',
      subtitle: 'High School AD',
      icon: Briefcase,
      stats: [
        { label: 'Oversees', value: '8 teams' },
        { label: 'All adopt M&M', value: '8 teams' },
        { label: 'Budget impact', value: 'Offset by commission' },
      ],
      earnings: '$1,028.16/year',
      variant: 'orange' as const,
    },
    {
      title: 'Sports Blogger Jordan',
      subtitle: 'Content Creator',
      icon: UserPlus,
      stats: [
        { label: 'Monthly readers', value: '10,000' },
        { label: '2% conversion', value: '17 teams' },
        { label: 'Passive income', value: 'From one article' },
      ],
      earnings: '$2,184.84/year',
      variant: 'blue' as const,
    },
  ];

  const faqs = [
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
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
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

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue bg-clip-text text-transparent">
            Build Passive Income<br />Helping Coaches Win
          </span>
        </h1>

        <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-12">
          Join our partner program and earn 10% commission on every subscription payment. Lifetime earning potential as referrals renew.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <LiquidGlass variant="orange" glow={true} className="p-6 text-center min-w-[200px]">
            <div className="text-4xl font-black text-solar-surge-orange mb-2">10%</div>
            <div className="text-sm text-text-secondary">Lifetime Commission</div>
          </LiquidGlass>

          <LiquidGlass variant="blue" glow={true} className="p-6 text-center min-w-[200px]">
            <div className="text-4xl font-black text-neon-cortex-blue mb-2">Forever</div>
            <div className="text-sm text-text-secondary">Recurring Income</div>
          </LiquidGlass>

          <LiquidGlass variant="orange" glow={true} className="p-6 text-center min-w-[200px]">
            <div className="text-4xl font-black text-solar-surge-orange mb-2">90 Days</div>
            <div className="text-sm text-text-secondary">Attribution Window</div>
          </LiquidGlass>
        </div>
      </div>

      {/* Market Opportunity */}
      <div className="max-w-7xl mx-auto mb-20">
        <h2 className="text-4xl font-black text-center mb-4">
          The Opportunity is Massive
        </h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto mb-12">
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

      {/* Aspirational Scenarios */}
      <div className="max-w-7xl mx-auto mb-20">
        <h2 className="text-4xl font-black text-center mb-4">
          What Partners Like You Can Earn
        </h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto mb-12">
          Real scenarios based on typical networks and conversion rates. Your actual earnings depend on how many coaches you know and how actively you share.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {scenarios.map((scenario, index) => (
            <ScenarioCard key={index} {...scenario} />
          ))}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-7xl mx-auto mb-20">
        <h2 className="text-4xl font-black text-center mb-4">
          Why Partner With Us?
        </h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto mb-12">
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

      {/* Interactive Calculator */}
      <div className="max-w-4xl mx-auto mb-20">
        <EarningsCalculator />
      </div>

      {/* Partner Resources Preview */}
      <div className="max-w-6xl mx-auto mb-20">
        <h2 className="text-4xl font-black text-center mb-4">
          Everything You Need to Succeed
        </h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto mb-12">
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
        <h2 className="text-4xl font-black text-center mb-12">
          How It Works
        </h2>

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
        <h2 className="text-4xl font-black text-center mb-4">
          Questions? We've Got Answers
        </h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto mb-12">
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
          <h2 className="text-3xl font-black text-center mb-2">
            Ready to Start Earning?
          </h2>
          <p className="text-text-secondary text-center mb-8">
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
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
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
              disabled={!captchaToken}
            >
              Apply Now - Start Earning
            </LiquidButton>

            <p className="text-xs text-text-secondary text-center">
              Most applications are reviewed within 24 hours. You'll receive your tracking link immediately upon approval.
            </p>
          </form>
        </LiquidGlass>
      </div>
    </div>
  );
}
