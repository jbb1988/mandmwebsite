'use client';

import PasswordGate from '@/components/PasswordGate';
import { LiquidGlass } from '@/components/LiquidGlass';
import { DollarSign, Users, CheckCircle, Star, Crown, TrendingUp, Repeat, Building2, Award } from 'lucide-react';

export default function FinderFeeVIPPage() {
  const password = process.env.NEXT_PUBLIC_FINDER_FEE_VIP_PASSWORD || 'dominate';

  return (
    <PasswordGate
      password={password}
      title="VIP Finder Fee Program"
      description="Enter password to view VIP program details"
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 py-16 px-4">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
                <Crown className="w-5 h-5 text-orange-400" />
                <span className="text-orange-300 font-medium">VIP RECURRING PROGRAM</span>
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                VIP Finder Fee Program
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                10% First Purchase + 5% Every Renewal
              </p>

              {/* Stats highlight */}
              <div className="inline-flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-center px-4">
                  <p className="text-sm text-gray-400">First Purchase</p>
                  <p className="text-2xl font-bold text-orange-400">10%</p>
                </div>
                <div className="text-2xl text-gray-600">+</div>
                <div className="text-center px-4">
                  <p className="text-sm text-gray-400">Every Renewal</p>
                  <p className="text-2xl font-bold text-purple-400">5%</p>
                </div>
                <div className="text-2xl text-gray-600">=</div>
                <div className="text-center px-4">
                  <p className="text-sm text-gray-400">Lifetime Value</p>
                  <p className="text-2xl font-bold text-green-400">Passive Income</p>
                </div>
              </div>
            </div>

            {/* What Makes VIP Different */}
            <LiquidGlass className="p-8 mb-8 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4">What makes VIP different?</h2>
              <p className="text-gray-300 mb-6">
                As a <strong className="text-white">VIP Finder Partner</strong>, you don&apos;t just earn a one-time fee - you earn ongoing credit for the relationships you build.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                      <DollarSign className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="font-bold text-orange-400">First Purchase</h3>
                  </div>
                  <p className="text-4xl font-bold text-white mb-2">10%</p>
                  <p className="text-gray-400">Reward for the introduction</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                      <Repeat className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="font-bold text-purple-400">Every Renewal</h3>
                  </div>
                  <p className="text-4xl font-bold text-white mb-2">5%</p>
                  <p className="text-gray-400">Ongoing appreciation forever</p>
                </div>
              </div>
            </LiquidGlass>

            {/* VIP Example */}
            <LiquidGlass className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">VIP earnings example</h2>
              <h3 className="text-lg font-semibold text-gray-300 mb-6">You introduce: California Youth Baseball League</h3>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">First Purchase</p>
                    <p className="text-sm text-gray-400">January 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">$25,000 x 10%</p>
                    <p className="text-2xl font-bold text-green-400">$2,500</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Renewal #1</p>
                    <p className="text-sm text-gray-400">July 2025 (6 months)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">$25,000 x 5%</p>
                    <p className="text-2xl font-bold text-green-400">$1,250</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Renewal #2</p>
                    <p className="text-sm text-gray-400">January 2026 (12 months)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">$25,000 x 5%</p>
                    <p className="text-2xl font-bold text-green-400">$1,250</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Renewal #3</p>
                    <p className="text-sm text-gray-400">July 2026 (18 months)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">$25,000 x 5%</p>
                    <p className="text-2xl font-bold text-green-400">$1,250</p>
                  </div>
                </div>

                <div className="border-t border-purple-500/30 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-white">Total over 2 years:</p>
                    <p className="text-3xl font-bold text-purple-400">$6,250</p>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">And 5% on every future renewal...</p>
                </div>
              </div>
            </LiquidGlass>

            {/* Standard vs VIP Comparison */}
            <LiquidGlass className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Standard vs VIP comparison</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Aspect</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Standard Finder</th>
                      <th className="text-left py-3 px-4 text-purple-400 font-medium bg-purple-500/10">VIP Recurring</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="py-4 px-4 text-white font-semibold">First Purchase</td>
                      <td className="py-4 px-4 text-gray-300">10% one-time</td>
                      <td className="py-4 px-4 text-white bg-purple-500/5"><strong>10%</strong> (tracked as first)</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-4 px-4 text-white font-semibold">Renewals</td>
                      <td className="py-4 px-4 text-gray-500">Nothing</td>
                      <td className="py-4 px-4 text-purple-400 bg-purple-500/5"><strong>5% ongoing</strong></td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-4 px-4 text-white font-semibold">Use Case</td>
                      <td className="py-4 px-4 text-gray-300">99% of finders</td>
                      <td className="py-4 px-4 text-white bg-purple-500/5"><strong>Ultra-high-value VIPs</strong></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-white font-semibold">Duration</td>
                      <td className="py-4 px-4 text-gray-300">One payment</td>
                      <td className="py-4 px-4 text-green-400 bg-purple-500/5"><strong>As long as they subscribe</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </LiquidGlass>

            {/* Real World Example */}
            <LiquidGlass className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Same-sized org, different results</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    Standard Finder (Sarah)
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>Introduces Texas Thunder ($3,357.50)</li>
                    <li>First purchase: <strong className="text-green-400">$335.75</strong> (10%)</li>
                    <li>Renewal: <strong className="text-gray-500">$0</strong></li>
                    <li className="pt-2 border-t border-white/10 text-white font-bold">Total: $335.75</li>
                  </ul>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-400" />
                    VIP Recurring (John)
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>Introduces same org ($3,357.50)</li>
                    <li>First purchase: <strong className="text-green-400">$335.75</strong> (10%)</li>
                    <li>Renewal #1: <strong className="text-purple-400">$167.88</strong> (5%)</li>
                    <li>Renewal #2: <strong className="text-purple-400">$167.88</strong> (5%)</li>
                    <li>Renewal #3: <strong className="text-purple-400">$167.88</strong> (5%)</li>
                    <li className="pt-2 border-t border-purple-500/30 text-white font-bold">Total over 2 years: $839.39</li>
                  </ul>
                </div>
              </div>

              <p className="text-center text-gray-400 mt-6">
                VIP earns <strong className="text-green-400">2.5x more</strong> over time
              </p>
            </LiquidGlass>

            {/* Who Qualifies */}
            <h2 className="text-2xl font-bold text-white mb-6">Who qualifies for VIP?</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { icon: Users, title: 'League Directors', desc: 'Connected to multiple organizations in your region', color: 'blue' },
                { icon: Building2, title: 'Facility Owners', desc: 'Training centers with client organizations', color: 'orange' },
                { icon: Star, title: 'Industry Influencers', desc: 'Coaches, trainers, or media with large followings', color: 'yellow' },
                { icon: Award, title: 'Strategic Partners', desc: 'Businesses serving the youth baseball market', color: 'purple' },
              ].map((item, i) => (
                <LiquidGlass key={i} className="p-6 flex items-start gap-4">
                  <div className={`w-12 h-12 bg-${item.color}-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-${item.color}-500/30`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </LiquidGlass>
              ))}
            </div>

            <p className="text-center text-gray-400 mb-8">
              VIP status is granted on a case-by-case basis for partners with significant referral potential.
            </p>

            {/* Why VIP */}
            <LiquidGlass className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Why VIP recurring?</h2>
              <div className="space-y-4">
                {[
                  { title: 'Big reward upfront', desc: '10% on first purchase recognizes the value of the introduction' },
                  { title: 'Ongoing appreciation', desc: '5% renewals show we value long-term relationships' },
                  { title: 'Sustainable model', desc: 'More reasonable than 10% forever, fair for both sides' },
                  { title: 'Recognition of partnership', desc: 'VIP status acknowledges your exceptional value as a connector' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </LiquidGlass>

            {/* FAQ */}
            <LiquidGlass className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">VIP frequently asked questions</h2>
              <div className="space-y-6">
                {[
                  { q: 'Why 10% first, 5% renewals instead of 10% forever?', a: 'More sustainable. Rewards the introduction heavily (10%), then ongoing support at a reasonable rate (5%). Prevents excessive liability on large accounts.' },
                  { q: 'How long do the renewal fees continue?', a: 'As long as the organization continues to subscribe to Mind & Muscle. If they renew for 10 years, you earn 5% for 10 years.' },
                  { q: 'What if they cancel and re-subscribe later?', a: 'If they cancel and come back within 90 days with your link, it\'s treated as a renewal (5%). After 90 days, it would be a new first purchase (10%).' },
                  { q: 'Can I have both standard AND VIP introductions?', a: 'Yes! Past standard introductions stay one-time. Future introductions use VIP recurring (10% first, 5% renewals).' },
                  { q: 'Is this different from the Tolt Partner Program?', a: 'Yes, completely separate. Tolt is for public promotion (10-15% recurring). VIP Finder is invitation-only for organization introductions (10% first, 5% renewals). You can do both!' },
                ].map((faq, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-400">{faq.a}</p>
                  </div>
                ))}
              </div>
            </LiquidGlass>

            {/* VIP Benefits */}
            <LiquidGlass className="p-8 mb-8 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">Your VIP benefits</h2>
              <ul className="space-y-3">
                {[
                  '10% first purchase reward - Big appreciation for the introduction',
                  '5% ongoing renewals - As long as they subscribe',
                  'Recognition as strategic partner - VIP status acknowledgment',
                  'Unlimited introductions - No cap on how many orgs you can introduce',
                  'Priority support - Direct access for your finder fee questions',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </LiquidGlass>

            {/* Footer */}
            <div className="text-center text-gray-400 text-sm border-t border-white/10 pt-8">
              <p className="mb-2 font-semibold text-purple-400">You&apos;ve been selected for VIP Finder Fee status!</p>
              <p>This recognition is reserved for our most valuable connectors who bring exceptional organizations to Mind & Muscle.</p>
              <p className="mt-4">Questions? Contact us for details.</p>
            </div>
          </div>
        </div>
      </div>
    </PasswordGate>
  );
}
