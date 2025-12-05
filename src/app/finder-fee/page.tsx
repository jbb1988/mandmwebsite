'use client';

import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { DollarSign, Users, Check, Handshake, Clock, Shield } from 'lucide-react';

export default function FinderFeePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
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
          programType: 'standard',
        }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setFormData({ name: '', email: '', phone: '', organization: '', howYouKnowUs: '' });
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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-6">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">Finder Fee Program</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Earn <span className="text-green-400">10%</span> For Every Team You Refer
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Know a youth baseball organization that would benefit from Mind & Muscle?
            Introduce them to us and earn a 10% finder fee on their first purchase.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <LiquidGlass className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Make an Introduction</h3>
              <p className="text-gray-400">
                Connect us with a youth baseball league, training facility, or travel ball organization you know.
              </p>
            </LiquidGlass>

            <LiquidGlass className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. We Handle the Rest</h3>
              <p className="text-gray-400">
                Our team takes over - demos, onboarding, and support. You just make the introduction.
              </p>
            </LiquidGlass>

            <LiquidGlass className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Get Paid</h3>
              <p className="text-gray-400">
                When they purchase, you earn 10% of their first payment. Simple as that.
              </p>
            </LiquidGlass>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Become a Finder?</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: DollarSign, text: '10% commission on first purchase', color: 'green' },
              { icon: Clock, text: 'No ongoing commitment required', color: 'blue' },
              { icon: Shield, text: 'We handle all sales and support', color: 'orange' },
              { icon: Check, text: 'Get paid within 60 days of purchase', color: 'green' },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                <div className={`w-10 h-10 bg-${benefit.color}-500/20 rounded-full flex items-center justify-center`}>
                  <benefit.icon className={`w-5 h-5 text-${benefit.color}-400`} />
                </div>
                <span className="text-lg">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl border border-green-500/20">
            <h3 className="text-xl font-bold mb-2">Example Earnings</h3>
            <p className="text-gray-300">
              A travel ball organization purchases a 50-seat annual license for $2,500.
              <span className="text-green-400 font-bold"> You earn $250</span> just for making the introduction.
            </p>
          </div>
        </div>
      </section>

      {/* Sign Up Form */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <LiquidGlass className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Join the Finder Fee Program</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium mb-2">Your Organization (if any)</label>
                <input
                  type="text"
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="League, team, facility, etc."
                />
              </div>

              <div>
                <label htmlFor="howYouKnowUs" className="block text-sm font-medium mb-2">How did you hear about us?</label>
                <textarea
                  id="howYouKnowUs"
                  rows={3}
                  value={formData.howYouKnowUs}
                  onChange={(e) => setFormData({ ...formData, howYouKnowUs: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                {isSubmitting ? 'Submitting...' : 'Join Finder Fee Program'}
              </LiquidButton>
            </form>
          </LiquidGlass>
        </div>
      </section>

      {/* VIP Upsell */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-900/20 to-orange-900/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Want More? Check Out Our VIP Program</h2>
          <p className="text-gray-300 mb-6">
            For high-value partners, we offer a VIP Finder Fee program with 10% on first purchase
            PLUS 5% on all renewals - forever.
          </p>
          <a
            href="/finder-fee-vip"
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium"
          >
            Learn about VIP Finder Fees →
          </a>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <LiquidGlass className="max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">You&apos;re In!</h3>
            <p className="text-gray-300 mb-6">
              Thanks for joining our Finder Fee program. We&apos;ll be in touch within 24-48 hours
              with your unique referral information.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Got It
            </button>
          </LiquidGlass>
        </div>
      )}
    </main>
  );
}
