'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';

function PasswordGateContent() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  const returnUrl = searchParams.get('returnUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid password');
      }

      // Password correct, redirect to original page
      window.location.href = returnUrl;
    } catch (err: any) {
      setError(err.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background-primary via-background-secondary to-space-black">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-8 py-4">
              <div className="flex items-center gap-3">
                <Lock className="w-8 h-8 text-neon-cortex-blue drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
                <span className="text-xl md:text-2xl font-bold">PREVIEW ACCESS</span>
              </div>
            </LiquidGlass>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4">
            <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
              Mind & Muscle
            </span>
          </h1>
          <p className="text-text-secondary">
            This site is in preview mode. Enter the password to continue.
          </p>
        </div>

        <LiquidGlass variant="neutral">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-starlight-white">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter preview password"
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-neon-cortex-blue/40 rounded-lg focus:outline-none focus:border-neon-cortex-blue focus:ring-2 focus:ring-neon-cortex-blue/20 transition-all text-white placeholder:text-gray-400 font-medium"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full px-6 py-3 rounded-lg font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 border border-neon-cortex-blue/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10 hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Verifying...' : 'Enter Site'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-text-secondary text-center">
                Pre-launch preview • Not for public distribution
              </p>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}

export default function PasswordGate() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background-primary via-background-secondary to-space-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cortex-blue"></div>
      </div>
    }>
      <PasswordGateContent />
    </Suspense>
  );
}
