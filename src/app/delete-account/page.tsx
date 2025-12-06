'use client';

import React from 'react';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import { Mail, AlertTriangle, Clock, ShieldAlert, CreditCard, Info, Smartphone, Settings } from 'lucide-react';

export default function DeleteAccountPage() {
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

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <GradientTextReveal
          text="Account Deletion"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-relaxed"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed">
          How to delete your Mind & Muscle account and data
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Warning Banner */}
        <LiquidGlass variant="orange" rounded="2xl" className="p-8 md:p-12">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold mb-3 text-red-400">Important Notice</h3>
              <p className="text-text-secondary">
                Account deletion is <strong className="text-white">permanent and cannot be reversed</strong>.
                All your data, including training history, workout plans, video uploads, and progress will be
                permanently removed. If you wish to use Mind & Muscle again, you will need to create a new account.
              </p>
            </div>
          </div>
        </LiquidGlass>

        {/* How to Delete Section - In App */}
        <LiquidGlass variant="blue" rounded="2xl" className="p-8 md:p-12">
          <h2 className="text-3xl font-black mb-8">How to Delete Your Account</h2>

          <div className="space-y-6">
            {/* Option 1 - In App */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange flex items-center justify-center font-bold text-lg">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-neon-cortex-blue" />
                  Delete in the App (Recommended)
                </h3>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-text-secondary mb-3">
                    You can delete your account directly from the Mind & Muscle app:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-text-secondary">
                    <li>Open the Mind & Muscle app</li>
                    <li>Go to <strong className="text-white">Settings</strong> <Settings className="w-4 h-4 inline" /></li>
                    <li>Scroll down and tap <strong className="text-red-400">Delete Account</strong></li>
                    <li>Confirm your decision</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Option 2 - Email */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange flex items-center justify-center font-bold text-lg">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-neon-cortex-blue" />
                  Or Email Us
                </h3>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-text-secondary mb-4">
                    If you prefer, we can delete your account for you:
                  </p>
                  <p className="text-text-secondary mb-3">
                    <strong>Email:</strong>{' '}
                    <a
                      href="mailto:support@mindandmuscle.ai?subject=Delete%20My%20Account"
                      className="text-solar-surge-orange hover:underline font-semibold"
                    >
                      support@mindandmuscle.ai
                    </a>
                  </p>
                  <p className="text-text-secondary mb-3">
                    <strong>Subject:</strong> Delete My Account
                  </p>
                  <p className="text-text-secondary">
                    <strong>Include:</strong> The email address associated with your account
                  </p>
                </div>
              </div>
            </div>

            {/* What Gets Deleted */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange flex items-center justify-center font-bold text-lg">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  What Gets Deleted
                </h3>
                <div className="space-y-2 text-text-secondary">
                  <p>When your account is deleted, we will permanently remove:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Your profile information (name, email, birthday)</li>
                    <li>Training history and workout data</li>
                    <li>Video uploads and analysis results</li>
                    <li>Subscription and purchase history</li>
                    <li>All personal preferences and settings</li>
                    <li>Team memberships and communications</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Timeline - only for email requests */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange flex items-center justify-center font-bold text-lg">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neon-cortex-blue" />
                  Timeline
                </h3>
                <p className="text-text-secondary">
                  Deletion in the app is <strong className="text-white">immediate</strong>. Email requests are processed within <strong className="text-white">30 days</strong>.
                  You will receive a confirmation email once your account has been deleted.
                </p>
              </div>
            </div>

            {/* Cannot Be Undone */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange flex items-center justify-center font-bold text-lg">
                  5
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Cannot Be Undone
                </h3>
                <p className="text-text-secondary">
                  Account deletion is <strong className="text-white">permanent and cannot be reversed</strong>.
                  If you wish to use Mind & Muscle again, you will need to create a new account from scratch.
                </p>
              </div>
            </div>

            {/* Subscription Cancellation */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange flex items-center justify-center font-bold text-lg">
                  6
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-yellow-400" />
                  Subscription Cancellation
                </h3>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-text-secondary">
                    <strong className="text-yellow-400">Important:</strong> Deleting your account does NOT automatically
                    cancel active subscriptions. Please cancel your subscription through the App Store or Google Play
                    <strong className="text-white"> before</strong> deleting your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </LiquidGlass>

        {/* Questions Section */}
        <LiquidGlass variant="blue" rounded="2xl" className="p-8 md:p-12">
          <div className="flex items-start gap-4">
            <Info className="w-8 h-8 text-neon-cortex-blue flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold mb-4">Questions?</h3>
              <p className="text-text-secondary mb-6">
                If you have questions about account deletion or data privacy, contact us at:
              </p>
              <div className="space-y-3">
                <div>
                  <span className="text-text-secondary">General Support: </span>
                  <a
                    href="mailto:support@mindandmuscle.ai"
                    className="text-solar-surge-orange hover:underline font-semibold"
                  >
                    support@mindandmuscle.ai
                  </a>
                </div>
                <div>
                  <span className="text-text-secondary">Privacy Inquiries: </span>
                  <a
                    href="mailto:privacy@mindandmuscle.ai"
                    className="text-solar-surge-orange hover:underline font-semibold"
                  >
                    privacy@mindandmuscle.ai
                  </a>
                </div>
              </div>
            </div>
          </div>
        </LiquidGlass>

        {/* Related Links */}
        <LiquidGlass variant="orange" rounded="2xl" className="p-8 md:p-12">
          <h3 className="text-xl font-bold mb-4">Related Resources</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="/legal#privacy"
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
            >
              <h4 className="font-semibold mb-2 group-hover:text-solar-surge-orange transition-colors">
                Privacy Policy →
              </h4>
              <p className="text-sm text-text-secondary">
                Learn how we handle your data
              </p>
            </a>
            <a
              href="/legal#terms"
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
            >
              <h4 className="font-semibold mb-2 group-hover:text-solar-surge-orange transition-colors">
                Terms of Service →
              </h4>
              <p className="text-sm text-text-secondary">
                Review our terms and conditions
              </p>
            </a>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}
