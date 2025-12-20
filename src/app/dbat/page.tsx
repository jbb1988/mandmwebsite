'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { GradientTextReveal } from '@/components/animations';
import {
  DollarSign, TrendingUp, Users, Check, Zap, Target,
  Building2, ChevronDown, Calendar, Phone, Mail, MapPin,
  Play, ArrowRight, Sparkles, Shield, Clock
} from 'lucide-react';

export default function DBatPartnerPage() {
  const [athleteCount, setAthleteCount] = useState(200);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Commission calculation (same as partner program)
  const pricePerUser = athleteCount >= 200 ? 63.20 : athleteCount >= 120 ? 67.15 : athleteCount >= 12 ? 71.10 : 79;
  const commissionRate = athleteCount >= 101 ? 0.15 : 0.10;
  const sixMonthRevenue = athleteCount * pricePerUser * commissionRate;
  const annualRevenue = sixMonthRevenue * 2;
  const threeYearRevenue = annualRevenue * 3;

  const valueProps = [
    {
      icon: Zap,
      title: 'Complement Your Lessons',
      description: 'Athletes use Mind & Muscle between cage sessions to develop the mental side. Your lessons work on mechanics, we work on the mind.',
      color: 'orange',
    },
    {
      icon: Target,
      title: 'Complete Player Development',
      description: 'D-BAT already provides elite physical training. Add mental training, strength programs, and baseball IQ to create truly complete players.',
      color: 'blue',
    },
    {
      icon: DollarSign,
      title: 'Passive Revenue Stream',
      description: 'Earn 15-20% commission on every athlete who subscribes. No extra work, no inventory, no staff needed.',
      color: 'orange',
    },
    {
      icon: Shield,
      title: 'Zero Risk Partnership',
      description: 'No upfront costs. No commitments. Just share with your athletes and earn when they subscribe.',
      color: 'blue',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'QR Codes in Your Tunnels',
      description: 'We provide printable QR code posters for your batting cages. Athletes scan before or after lessons.',
    },
    {
      step: '2',
      title: 'Athletes Start Training',
      description: 'They get AI-powered mental training, swing analysis, strength programs, and 186 game scenarios.',
    },
    {
      step: '3',
      title: 'You Earn Automatically',
      description: 'Every subscription generates 15-20% commission paid directly to you. Forever, on every renewal.',
    },
  ];

  const faqs = [
    {
      question: 'How does this fit with what D-BAT already offers?',
      answer: 'D-BAT provides elite physical training in the cages. Mind & Muscle adds what happens between sessions: mental training, game IQ, goal tracking, and at-home development. We complement your lessons, not compete with them.',
    },
    {
      question: 'What do I actually have to do?',
      answer: 'Almost nothing. We provide QR code posters for your tunnels, email templates for your athlete list, and social graphics. Athletes see it, scan it, subscribe. You earn commission automatically.',
    },
    {
      question: 'How much can a typical D-BAT location earn?',
      answer: 'A D-BAT with 200 active athletes could generate $4,000-6,000+ per year in passive commission. With 300+ athletes, you\'re looking at $6,000-9,000+ annually. Zero additional work required.',
    },
    {
      question: 'Is there a franchise-wide deal available?',
      answer: 'We\'re in discussions with D-BAT corporate about a franchise-wide partnership. Individual locations can start earning now, and any deal would include early adopters.',
    },
    {
      question: 'What if our athletes already use other apps?',
      answer: 'Most "baseball apps" are single-purpose: just video, just workouts, or just stats. Mind & Muscle integrates 8 AI tools into one platform. Athletes save money and get better development.',
    },
  ];

  const dbatLocations = [
    'Select your D-BAT location...',
    'D-BAT Frisco', 'D-BAT Addison', 'D-BAT Allen', 'D-BAT Arlington',
    'D-BAT Austin', 'D-BAT Atlanta', 'D-BAT Buckhead', 'D-BAT Centennial',
    'D-BAT Colorado Springs', 'D-BAT Columbus', 'D-BAT Dallas',
    'D-BAT Fort Worth', 'D-BAT Houston', 'D-BAT Jacksonville',
    'D-BAT Kansas City', 'D-BAT Nashville', 'D-BAT Phoenix',
    'D-BAT San Antonio', 'D-BAT Tampa', 'D-BAT The Woodlands',
    'Other D-BAT Location',
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#003366]/10 via-transparent to-[#228B22]/10 pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        {/* D-BAT + M&M Logos */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Image
            src="/assets/images/dbat-logo.png"
            alt="D-BAT"
            width={120}
            height={120}
            className="object-contain"
          />
          <div className="text-4xl text-white/30 font-thin">×</div>
          <Image
            src="/assets/images/logo.png"
            alt="Mind & Muscle"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        <div className="inline-block mb-6">
          <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-6 py-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-neon-cortex-blue" />
              <span className="text-base font-bold">D-BAT FRANCHISE PARTNERSHIP</span>
            </div>
          </LiquidGlass>
        </div>

        <GradientTextReveal
          text="Add Mental Training to Your D-BAT Academy"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          gradientFrom="#003366"
          gradientTo="#228B22"
          delay={0.2}
        />

        <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed mb-10">
          Give your athletes complete player development. Earn passive income on every subscription.
          <br />
          <span className="text-white/50 text-lg">No extra staff. No inventory. No risk.</span>
        </p>

        {/* Quick Stats */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <LiquidGlass variant="orange" glow={true} className="p-5 text-center min-w-[180px]">
            <div className="text-3xl font-black text-solar-surge-orange mb-1">15-20%</div>
            <div className="text-sm text-text-secondary">Commission Rate</div>
          </LiquidGlass>

          <LiquidGlass variant="blue" glow={true} className="p-5 text-center min-w-[180px]">
            <div className="text-3xl font-black text-neon-cortex-blue mb-1">$6K+</div>
            <div className="text-sm text-text-secondary">Annual Potential</div>
          </LiquidGlass>

          <LiquidGlass variant="orange" glow={true} className="p-5 text-center min-w-[180px]">
            <div className="text-3xl font-black text-solar-surge-orange mb-1">Zero</div>
            <div className="text-sm text-text-secondary">Upfront Cost</div>
          </LiquidGlass>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://calendly.com/mindandmuscle/dbat-partnership"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#003366] to-[#228B22] hover:from-[#003366]/90 hover:to-[#228B22]/90 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Calendar className="w-5 h-5" />
            Schedule Partnership Call
          </a>
          <a
            href="#calculator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl transition-all border border-white/20"
          >
            <DollarSign className="w-5 h-5" />
            See Your Earnings Potential
          </a>
        </div>
      </div>

      {/* Value Props */}
      <div className="max-w-7xl mx-auto mb-20">
        <GradientTextReveal
          text="Why D-BAT + Mind & Muscle?"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 text-center"
          gradientFrom="#003366"
          gradientTo="#228B22"
          delay={0.2}
        />
        <p className="text-xl text-gray-300 max-w-3xl mx-auto text-center mb-12">
          D-BAT develops elite physical skills. We add the mental edge that separates good players from great ones.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <LiquidGlass key={index} variant={prop.color as 'orange' | 'blue'} className="p-6">
                <div className={`inline-block p-3 rounded-xl mb-4 ${
                  prop.color === 'blue' ? 'bg-neon-cortex-blue/20' : 'bg-solar-surge-orange/20'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    prop.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
                  }`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{prop.title}</h3>
                <p className="text-text-secondary text-sm">{prop.description}</p>
              </LiquidGlass>
            );
          })}
        </div>
      </div>

      {/* Earnings Calculator */}
      <div id="calculator" className="max-w-4xl mx-auto mb-20 scroll-mt-32">
        <GradientTextReveal
          text="Calculate Your D-BAT's Earnings"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 text-center"
          gradientFrom="#228B22"
          gradientTo="#003366"
          delay={0.2}
        />

        <LiquidGlass variant="blue" glow={true} className="p-8">
          <div className="mb-8">
            <label className="block text-lg font-bold mb-4">
              How many active athletes does your D-BAT have?
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={athleteCount}
              onChange={(e) => setAthleteCount(Number(e.target.value))}
              className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#228B22]"
            />
            <div className="flex justify-between text-sm text-text-secondary mt-2">
              <span>50</span>
              <span className="text-2xl font-black text-white">{athleteCount} athletes</span>
              <span>500</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-text-secondary mb-2">Per 6-Month Cycle</p>
              <p className="text-3xl font-black text-[#228B22]">
                ${sixMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-center p-6 bg-[#228B22]/10 rounded-xl border border-[#228B22]/30">
              <p className="text-sm text-text-secondary mb-2">Annual Earnings</p>
              <p className="text-4xl font-black text-[#228B22]">
                ${annualRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-text-secondary mb-2">3-Year Value</p>
              <p className="text-3xl font-black text-[#003366]">
                ${threeYearRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#228B22]/10 border border-[#228B22]/30 rounded-lg">
            <p className="text-sm text-center">
              <strong className="text-[#228B22]">Commission Rate:</strong>{' '}
              {athleteCount >= 101 ? '15%' : '10%'}
              {athleteCount < 101 && (
                <span className="text-text-secondary"> (hits 15% at 101+ athletes)</span>
              )}
              <br />
              <span className="text-text-secondary text-xs">
                Based on team pricing: ${pricePerUser.toFixed(2)}/user per 6-month subscription
              </span>
            </p>
          </div>
        </LiquidGlass>
      </div>

      {/* How It Works */}
      <div className="max-w-5xl mx-auto mb-20">
        <GradientTextReveal
          text="How It Works at Your D-BAT"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-12 text-center"
          gradientFrom="#003366"
          gradientTo="#228B22"
          delay={0.2}
        />

        <div className="grid md:grid-cols-3 gap-8">
          {howItWorks.map((item, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#003366] to-[#228B22] mb-4 text-2xl font-black">
                {item.step}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>

        {/* QR Code Visual */}
        <div className="mt-12">
          <LiquidGlass variant="orange" className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">QR Codes for Your Tunnels</h3>
                <p className="text-text-secondary mb-4">
                  We create custom QR code posters with your D-BAT location name. Athletes scan before or after lessons to access:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#228B22]" />
                    <span>5-minute pre-lesson mental focus routine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#228B22]" />
                    <span>AI swing analysis (upload cage videos)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#228B22]" />
                    <span>Position-specific strength training</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#228B22]" />
                    <span>186 real game scenarios for baseball IQ</span>
                  </li>
                </ul>
              </div>
              <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">QR Preview</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">D-BAT [Your Location]</p>
                </div>
              </div>
            </div>
          </LiquidGlass>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-3xl mx-auto mb-20">
        <GradientTextReveal
          text="Start Your D-BAT Partnership"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 text-center"
          gradientFrom="#228B22"
          gradientTo="#003366"
          delay={0.2}
        />

        <LiquidGlass variant="blue" glow={true} className="p-8">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Your Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#228B22] focus:outline-none transition-colors"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#228B22] focus:outline-none transition-colors"
                  placeholder="john@dbatfrisco.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Your D-BAT Location *</label>
              <select
                required
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#228B22] focus:outline-none transition-colors"
              >
                {dbatLocations.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#0A0B14]">{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Approximate Active Athletes</label>
              <select
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#228B22] focus:outline-none transition-colors"
              >
                <option value="" className="bg-[#0A0B14]">Select range...</option>
                <option value="50-100" className="bg-[#0A0B14]">50-100 athletes</option>
                <option value="100-200" className="bg-[#0A0B14]">100-200 athletes</option>
                <option value="200-300" className="bg-[#0A0B14]">200-300 athletes</option>
                <option value="300+" className="bg-[#0A0B14]">300+ athletes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Questions or Comments</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#228B22] focus:outline-none transition-colors resize-none"
                placeholder="Any questions about the partnership?"
              />
            </div>

            <div className="p-4 bg-[#228B22]/10 border border-[#228B22]/30 rounded-lg">
              <p className="text-xs text-center text-text-secondary">
                <Check className="w-4 h-4 inline mr-1 text-[#228B22]" />
                No commitment required. We'll send you a partnership kit and schedule a quick call to answer questions.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-gradient-to-r from-[#003366] to-[#228B22] hover:from-[#003366]/90 hover:to-[#228B22]/90 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Get Partnership Kit
            </button>

            <p className="text-center text-sm text-text-secondary">
              Or schedule directly:{' '}
              <a
                href="https://calendly.com/mindandmuscle/dbat-partnership"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#228B22] hover:underline font-semibold"
              >
                Book a 15-min call →
              </a>
            </p>
          </form>
        </LiquidGlass>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mb-20">
        <GradientTextReveal
          text="D-BAT Partner FAQs"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 text-center"
          gradientFrom="#003366"
          gradientTo="#228B22"
          delay={0.2}
        />

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <LiquidGlass key={index} variant="blue" className="p-6">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full text-left flex items-center justify-between gap-4"
              >
                <h3 className="text-lg font-bold">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-[#228B22] transition-transform flex-shrink-0 ${
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

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto text-center">
        <LiquidGlass variant="orange" glow={true} className="p-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Ready to Add Passive Revenue to Your D-BAT?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join the D-BAT locations already earning with Mind & Muscle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mindandmuscle/dbat-partnership"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#003366] to-[#228B22] hover:from-[#003366]/90 hover:to-[#228B22]/90 text-white font-bold text-lg rounded-xl transition-all"
            >
              <Calendar className="w-5 h-5" />
              Schedule Call with Jeff
            </a>
            <a
              href="mailto:jeff@mindandmuscle.ai?subject=D-BAT Partnership Inquiry"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl transition-all border border-white/20"
            >
              <Mail className="w-5 h-5" />
              Email Directly
            </a>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}
