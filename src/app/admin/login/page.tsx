'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';

function AdminLoginContent() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnUrl = searchParams.get('returnUrl') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid password');
      }

      // Success - redirect to admin area
      router.push(returnUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-cortex-blue/20 mb-6">
            <Lock className="w-10 h-10 text-neon-cortex-blue" />
          </div>
          <h1 className="text-4xl font-black mb-2">Admin Access</h1>
          <p className="text-text-secondary">Enter password to access admin portal</p>
        </div>

        <LiquidGlass variant="blue">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none focus:ring-2 focus:ring-neon-cortex-blue/50 transition-all"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <LiquidButton
                type="submit"
                variant="blue"
                size="lg"
                fullWidth={true}
                disabled={loading || !password}
              >
                {loading ? 'Verifying...' : 'Access Admin Portal'}
              </LiquidButton>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-text-secondary text-center">
                Authorized personnel only • Session expires in 30 days
              </p>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <LiquidGlass variant="blue" className="max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cortex-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </LiquidGlass>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
