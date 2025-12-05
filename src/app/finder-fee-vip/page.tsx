'use client';

import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { DollarSign, Users, Check, Handshake, Clock, Shield, Star, TrendingUp, Repeat, Crown } from 'lucide-react';

export default function FinderFeeVIPPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    networkDescription: '',
    expectedReferrals: '',
    howYouKnowUs: '',
  });

  const [captchaToken, setCaptchaToken] = useState<string>('');
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
      const response = await fetch('/api/finder-fee-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstileToken: captchaToken,
          programType: 'vip',
        }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setFormData({ name: '', email: '', phone: '', organization: '', networkDescription: '', expectedReferrals: '', howYouKnowUs: '' });
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black text-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
            <Crown className="w-5 h-5 text-orange-400" />
            <span className="text-orange-300 font-medium">VIP Finder Fee Program</span>
            <Star className="w-4 h-4 text-yellow-400" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Earn <span className="text-orange-400">10%</span> + <span className="text-purple-400">5% Forever</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Our exclusive VIP program for high-value partners. Earn 10% on first purchase
            PLUS 5% on every renewal - building passive income that grows year after year.
          </p>

          <div className="inline-flex items-center gap-4 p-4 bg-gradient-to-r from-orange-900/30 to-purple-900/30 rounded-xl border border-orange-500/20">
            <div className="text-left">
              <p className="text-sm text-gray-400">First Purchase</p>
              <p className="text-2xl font-bold text-orange-400">10%</p>
            </div>
            <div className="text-3xl text-gray-600">+</div>
            <div className="text-left">
              <p className="text-sm text-gray-400">Every Renewal</p>
              <p className="text-2xl font-bold text-purple-400">5%</p>
            </div>
            <div className="text-3xl text-gray-600">=</div>
            <div className="text-left">
              <p className="text-sm text-gray-400">Lifetime Value</p>
              <p className="text-2xl font-bold text-green-400">Passive Income</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Standard vs VIP</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Standard */}
            <LiquidGlass className="p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-400" />
                Standard Finder Fee
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>10% on first purchase</span>
                </li>
                <li className="flex items-center gap-3 text-gray-500">
                  <span className="w-5 h-5 flex items-center justify-center">-</span>
                  <span>No renewal commissions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>One-time payout</span>
                </li>
              </ul>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400">Example: $2,500 license</p>
                <p className="text-xl font-bold text-green-400">$250 one-time</p>
              </div>
              <a
                href="/finder-fee"
                className="block mt-6 text-center text-gray-400 hover:text-white"
              >
                Learn about Standard Program →
              </a>
            </LiquidGlass>

            {/* VIP */}
            <LiquidGlass className="p-8 border-2 border-orange-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-purple-500 text-white text-xs font-bold px-4 py-1">
                VIP
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6 text-orange-400" />
                VIP Finder Fee
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-orange-400" />
                  <span className="font-semibold">10% on first purchase</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold">5% on EVERY renewal</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="font-semibold">Lifetime passive income</span>
                </li>
              </ul>
              <div className="p-4 bg-gradient-to-r from-orange-900/30 to-purple-900/30 rounded-lg">
                <p className="text-sm text-gray-400">Example: $2,500 license (5 year retention)</p>
                <p className="text-xl font-bold">
                  <span className="text-orange-400">$250</span>
                  <span className="text-gray-500"> + </span>
                  <span className="text-purple-400">$500</span>
                  <span className="text-gray-500"> = </span>
                  <span className="text-green-400">$750 total</span>
                </p>
              </div>
            </LiquidGlass>
          </div>
        </div>
      </section>

      {/* Long-term Value Calculator */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">The Power of Recurring</h2>
          <p className="text-center text-gray-400 mb-12">See how VIP commissions compound over time</p>

          <LiquidGlass className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Scenario</th>
                    <th className="text-right py-3 px-4">Year 1</th>
                    <th className="text-right py-3 px-4">Year 3</th>
                    <th className="text-right py-3 px-4">Year 5</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">
                      <p className="font-semibold">1 Travel Ball Org</p>
                      <p className="text-sm text-gray-400">50 seats @ $50/seat/year</p>
                    </td>
                    <td className="text-right py-4 px-4 text-orange-400">$250</td>
                    <td className="text-right py-4 px-4 text-purple-400">$500</td>
                    <td className="text-right py-4 px-4 text-green-400 font-bold">$750</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">
                      <p className="font-semibold">1 Training Facility</p>
                      <p className="text-sm text-gray-400">200 seats @ $50/seat/year</p>
                    </td>
                    <td className="text-right py-4 px-4 text-orange-400">$1,000</td>
                    <td className="text-right py-4 px-4 text-purple-400">$2,000</td>
                    <td className="text-right py-4 px-4 text-green-400 font-bold">$3,000</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4">
                      <p className="font-semibold">5 Organizations</p>
                      <p className="text-sm text-gray-400">Avg 100 seats each</p>
                    </td>
                    <td className="text-right py-4 px-4 text-orange-400">$2,500</td>
                    <td className="text-right py-4 px-4 text-purple-400">$5,000</td>
                    <td className="text-right py-4 px-4 text-green-400 font-bold">$7,500</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg">
              <p className="text-center">
                <span className="text-gray-400">VIP partners who refer 5+ organizations can earn </span>
                <span className="text-green-400 font-bold">$1,000+/year</span>
                <span className="text-gray-400"> in passive renewal income</span>
              </p>
            </div>
          </LiquidGlass>
        </div>
      </section>

      {/* Who Qualifies */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Who Qualifies for VIP?</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Users, title: 'League Directors', desc: 'Connected to multiple organizations in your region' },
              { icon: TrendingUp, title: 'Facility Owners', desc: 'Training centers with client organizations' },
              { icon: Star, title: 'Industry Influencers', desc: 'Coaches, trainers, or media with large followings' },
              { icon: Handshake, title: 'Strategic Partners', desc: 'Businesses serving the youth baseball market' },
            ].map((item, index) => (
              <LiquidGlass key={index} className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </LiquidGlass>
            ))}
          </div>

          <p className="text-center text-gray-400 mt-8">
            VIP status is granted on a case-by-case basis for partners with significant referral potential.
          </p>
        </div>
      </section>

      {/* Sign Up Form */}
      <section className="py-16 px-4 bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="max-w-2xl mx-auto">
          <LiquidGlass className="p-8 border border-orange-500/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-center">Apply for VIP Status</h2>
            </div>
            <p className="text-center text-gray-400 mb-8">Tell us about your network and referral potential</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium mb-2">Your Organization *</label>
                  <input
                    type="text"
                    id="organization"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="networkDescription" className="block text-sm font-medium mb-2">
                  Describe Your Network *
                </label>
                <textarea
                  id="networkDescription"
                  rows={3}
                  required
                  value={formData.networkDescription}
                  onChange={(e) => setFormData({ ...formData, networkDescription: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="What organizations do you have relationships with? How did you build these connections?"
                />
              </div>

              <div>
                <label htmlFor="expectedReferrals" className="block text-sm font-medium mb-2">
                  Expected Referrals (Next 12 Months) *
                </label>
                <select
                  id="expectedReferrals"
                  required
                  value={formData.expectedReferrals}
                  onChange={(e) => setFormData({ ...formData, expectedReferrals: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="1-2">1-2 organizations</option>
                  <option value="3-5">3-5 organizations</option>
                  <option value="6-10">6-10 organizations</option>
                  <option value="10+">10+ organizations</option>
                </select>
              </div>

              <div>
                <label htmlFor="howYouKnowUs" className="block text-sm font-medium mb-2">How did you hear about us?</label>
                <input
                  type="text"
                  id="howYouKnowUs"
                  value={formData.howYouKnowUs}
                  onChange={(e) => setFormData({ ...formData, howYouKnowUs: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-center">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                  onSuccess={(token) => setCaptchaToken(token)}
                />
              </div>

              <LiquidButton
                type="submit"
                disabled={isSubmitting || !captchaToken}
                fullWidth
                variant="orange"
              >
                {isSubmitting ? 'Submitting...' : 'Apply for VIP Status'}
              </LiquidButton>
            </form>
          </LiquidGlass>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <LiquidGlass className="max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">VIP Application Received!</h3>
            <p className="text-gray-300 mb-6">
              Thanks for applying to our VIP Finder Fee program. Our team will review your application
              and contact you within 24-48 hours to discuss next steps.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg hover:from-orange-700 hover:to-purple-700 transition-colors"
            >
              Got It
            </button>
          </LiquidGlass>
        </div>
      )}
    </main>
  );
}
