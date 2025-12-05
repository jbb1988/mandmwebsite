'use client';

import PasswordGate from '@/components/PasswordGate';
import { LiquidGlass } from '@/components/LiquidGlass';
import { DollarSign, Users, Handshake, CheckCircle, ArrowRight, Building2, Trophy, Clock } from 'lucide-react';

export default function FinderFeePage() {
  const password = process.env.NEXT_PUBLIC_FINDER_FEE_PASSWORD || 'fastball';

  return (
    <PasswordGate
      password={password}
      title="Finder Fee Program"
      description="Enter password to view program details"
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 py-16 px-4">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-6">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">Finder Fee Program</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Mind & Muscle Finder Fee Program
              </h1>
              <p className="text-xl text-gray-400">
                Earn Money for Introductions
              </p>
            </div>

            {/* What Is This */}
            <LiquidGlass className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">What is this?</h2>
              <p className="text-gray-300 mb-4">
                The <strong className="text-white">Finder Fee Program</strong> rewards people who introduce organizations (travel ball associations, facilities, leagues) to Mind & Muscle.
              </p>
              <p className="text-gray-300">
                If you connect us with an organization and they purchase,{' '}
                <strong className="text-green-400">you earn 10% of their first purchase</strong>.
              </p>
            </LiquidGlass>

            {/* How It Works */}
            <LiquidGlass className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-8">How it works</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">You get a custom link</h3>
                    <code className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm text-gray-300 block">
                      https://mindandmuscle.ai/team-licensing?finder=yourcode
                    </code>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">You share it with organizations</h3>
                    <ul className="text-gray-400 space-y-1">
                      <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-blue-400" /> Travel ball associations</li>
                      <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-blue-400" /> Baseball/softball facilities</li>
                      <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-blue-400" /> Youth sports leagues</li>
                      <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-blue-400" /> Tournament organizers</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">They purchase</h3>
                    <ul className="text-gray-400 space-y-1">
                      <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-blue-400" /> Organization clicks your link</li>
                      <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-blue-400" /> They buy team licensing ($3,000-$50,000+)</li>
                      <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-blue-400" /> We track the intro to you</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-green-500/30">
                    <span className="text-green-400 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">You get paid</h3>
                    <ul className="text-gray-400 space-y-1">
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> First purchase: <strong className="text-green-400">10% finder fee</strong></li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Example: $10,000 purchase = $1,000 for you</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Payment via your choice (Venmo, Zelle, check, etc.)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </LiquidGlass>

            {/* Real Examples */}
            <h2 className="text-2xl font-bold text-white mb-6">Real examples</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <LiquidGlass className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white">Small travel ball team</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">50 players + coaches, 6 months</p>
                <p className="text-gray-300 mb-2">Purchase: <strong className="text-white">$3,357.50</strong></p>
                <p className="text-green-400 font-bold text-xl">Your Fee: $335.75</p>
              </LiquidGlass>

              <LiquidGlass className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                    <Building2 className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-white">Large facility</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">200 athletes, annual</p>
                <p className="text-gray-300 mb-2">Purchase: <strong className="text-white">$15,000</strong></p>
                <p className="text-green-400 font-bold text-xl">Your Fee: $1,500</p>
              </LiquidGlass>

              <LiquidGlass className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                    <Trophy className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white">Regional association</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">500+ players</p>
                <p className="text-gray-300 mb-2">Purchase: <strong className="text-white">$35,000</strong></p>
                <p className="text-green-400 font-bold text-xl">Your Fee: $3,500</p>
              </LiquidGlass>
            </div>

            {/* Payment Process */}
            <LiquidGlass className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-8">Payment process</h2>

              <div className="space-y-6">
                {[
                  { num: 1, title: 'Introduction tracked', desc: 'Organization uses your finder link, system records you as connector', color: 'blue' },
                  { num: 2, title: 'They purchase', desc: 'Organization completes checkout, we receive instant notification', color: 'blue' },
                  { num: 3, title: 'You get email notification', desc: 'Subject: Finder Fee Opportunity: $1,500 - Organization purchased $15,000, Your Finder Fee (10%): $1,500', color: 'blue' },
                  { num: 4, title: 'We approve & pay', desc: 'We verify, contact you for payment method, send payment (usually 5-7 business days)', color: 'green' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className={`w-10 h-10 bg-${step.color}-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-${step.color}-500/30`}>
                      <span className={`text-${step.color}-400 font-bold`}>{step.num}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                      <p className="text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </LiquidGlass>

            {/* FAQ */}
            <LiquidGlass className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently asked questions</h2>

              <div className="space-y-6">
                {[
                  { q: 'Is there a limit to how many organizations I can introduce?', a: 'No limit! Introduce as many as you\'d like.' },
                  { q: 'What counts as an "organization"?', a: 'Travel ball teams, leagues, facilities, associations, tournaments - any multi-athlete group purchase.' },
                  { q: 'How do you track that they came from my link?', a: 'When they click your link, we store a tracking code. When they purchase (even weeks later), we know it was your introduction.' },
                  { q: 'How long does the tracking last?', a: '90 days from when they click your link. If they purchase within 90 days, you get credit.' },
                  { q: 'What if I\'m already a Tolt Partner?', a: 'Absolutely! These are separate programs. Use Partner link for individuals, Finder link for organizations.' },
                ].map((faq, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-400">{faq.a}</p>
                  </div>
                ))}
              </div>
            </LiquidGlass>

            {/* Who to Introduce */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <LiquidGlass className="p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-orange-400" />
                  Perfect candidates
                </h3>
                <ul className="text-gray-400 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Travel ball teams (10+ players)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Baseball/softball training facilities</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Youth sports leagues and associations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Tournament organizers</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> High school teams</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> College club programs</li>
                </ul>
              </LiquidGlass>

              <LiquidGlass className="p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Pricing transparency
                </h3>
                <ul className="text-gray-400 space-y-2">
                  <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> 6-month license: $6,715 (unlimited users)</li>
                  <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Annual license: $13,430 (save $6,715)</li>
                  <li className="flex items-center gap-2"><Building2 className="w-4 h-4 text-purple-400" /> Enterprise: Custom pricing for 200+ athletes</li>
                </ul>
              </LiquidGlass>
            </div>

            {/* The Difference */}
            <LiquidGlass className="p-8 mb-8 border border-green-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">The difference you make</h2>
              <p className="text-gray-300 mb-4">When you introduce an organization to Mind & Muscle:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300"><strong className="text-white">You earn money</strong> for the introduction</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300"><strong className="text-white">Coaches get better tools</strong> to develop athletes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300"><strong className="text-white">Athletes get personalized training</strong> that actually works</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300"><strong className="text-white">Parents stay informed</strong> about their child&apos;s development</span>
                </li>
              </ul>
              <p className="text-white mt-6 font-semibold">
                You&apos;re not just earning a fee - you&apos;re helping transform youth baseball and softball.
              </p>
            </LiquidGlass>

            {/* Footer */}
            <div className="text-center text-gray-400 text-sm">
              <p className="mb-2">Questions? Contact us for details.</p>
              <p className="font-semibold text-orange-400">This is an invitation-only program. If you received access, you&apos;ve been selected to participate!</p>
            </div>
          </div>
        </div>
      </div>
    </PasswordGate>
  );
}
