'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react';

export default function PartnerLoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/partner/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send login link');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.08] backdrop-blur-md bg-[#0A0B14]/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/images/logo.png" alt="Mind & Muscle" width={40} height={40} className="w-10 h-10" />
            <span className="text-lg font-bold hidden sm:block">Mind & Muscle</span>
          </Link>
          <Link
            href="/partner-program"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Become a Partner
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Partner Dashboard</h1>
            <p className="text-white/50">Sign in to access your partner resources</p>
          </div>

          {/* Login Card */}
          <div className="bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] rounded-2xl p-8 shadow-xl">
            {success ? (
              /* Success State */
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
                <p className="text-white/60 mb-6">
                  We sent a login link to <span className="text-white font-medium">{email}</span>
                </p>
                <p className="text-sm text-white/40">
                  The link expires in 30 minutes. If you don&apos;t see it, check your spam folder.
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="mt-6 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              /* Login Form */
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                    Partner Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Login Link
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/40">
              Not a partner yet?{' '}
              <Link href="/partner-program" className="text-blue-400 hover:text-blue-300 transition-colors">
                Apply to join
              </Link>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/30">
              We use magic links for secure, passwordless authentication.
              <br />
              Your login link is single-use and expires after 30 minutes.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium">
            <span className="text-blue-400">Discipline the Mind.</span>{' '}
            <span className="text-orange-400">Dominate the Game.</span>
          </p>
          <p className="text-xs text-white/30 mt-2">
            © 2025 Mind & Muscle Performance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
