'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import { AlertTriangle, CheckCircle, Loader2, Mail } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DeleteAccountConfirmPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  }

  async function handleDeleteAccount() {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Send deletion request email to support
      const response = await fetch('/api/account-deletion-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit deletion request');
      }

      setDeleted(true);
      
      // Sign out user after 3 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-neon-cortex-blue" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Sign In Required</h1>
          <p className="text-text-secondary mb-8">
            You must be signed in to delete your account.
          </p>
          <a
            href="/auth/signin"
            className="inline-block px-8 py-4 rounded-lg font-semibold bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange hover:opacity-90 transition-all"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (deleted) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-6">Account Deletion Requested</h1>
          <p className="text-text-secondary mb-4">
            Your account deletion request has been submitted successfully.
          </p>
          <p className="text-text-secondary mb-8">
            Your account and all associated data will be permanently deleted within 30 days.
            You will receive a confirmation email once the deletion is complete.
          </p>
          <p className="text-sm text-text-secondary">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-3xl mx-auto">
        <GradientTextReveal
          text="Delete Account"
          className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 text-center"
          gradientFrom="#EF4444"
          gradientTo="#F97316"
          delay={0.2}
        />

        <LiquidGlass variant="orange" rounded="2xl" className="p-8 md:p-12 mb-8">
          <div className="flex items-start gap-4 mb-8">
            <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold mb-3 text-red-400">⚠️ Warning: This Cannot Be Undone</h3>
              <p className="text-text-secondary mb-4">
                Deleting your account will permanently remove:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                <li>Your profile and account information</li>
                <li>All training history and workout data</li>
                <li>Video uploads and analysis results</li>
                <li>Team memberships and communications</li>
                <li>Personal preferences and settings</li>
                <li>Achievement history and progress</li>
              </ul>
              <p className="text-text-secondary font-semibold">
                This action is permanent and cannot be reversed.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-text-secondary">
                <p className="font-semibold text-yellow-400 mb-2">Before Deleting:</p>
                <p>
                  If you have an active subscription, please cancel it through the App Store or Google Play
                  <strong className="text-white"> before</strong> deleting your account. Account deletion does
                  NOT automatically cancel subscriptions.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <p className="text-sm text-text-secondary mb-2">Currently signed in as:</p>
            <p className="text-white font-semibold">{user.email}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-white">
              Type <span className="text-red-400">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(null);
              }}
              placeholder="DELETE"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-all"
              disabled={deleting}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => window.history.back()}
              disabled={deleting}
              className="flex-1 px-6 py-4 rounded-lg font-semibold bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || confirmText !== 'DELETE'}
              className="flex-1 px-6 py-4 rounded-lg font-semibold bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                'Delete My Account Permanently'
              )}
            </button>
          </div>
        </LiquidGlass>

        <div className="text-center text-sm text-text-secondary">
          <p>Need help? Contact us at{' '}
            <a href="mailto:support@mindandmuscle.ai" className="text-solar-surge-orange hover:underline">
              support@mindandmuscle.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
