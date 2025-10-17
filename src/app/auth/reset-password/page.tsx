'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [sessionReady, setSessionReady] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    // Handle auth errors from Supabase
    if (errorParam) {
      setError(decodeURIComponent(errorDescription || errorParam));
      return;
    }

    // Initialize Supabase client and handle the auth callback
    const initSupabase = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // PKCE Flow: Check if we have a code parameter (Supabase PKCE flow)
      const code = searchParams.get('code');
      if (code) {
        // Exchange code for session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError || !data.session) {
          setError('Failed to verify reset link. Please request a new one.');
          return;
        }

        setSessionReady(true);
        return;
      }

      // Legacy Flow: Check if we have tokens in the URL hash (password recovery flow)
      // Supabase redirects with tokens in hash fragment, e.g., #access_token=...&type=recovery
      const hash = window.location.hash.substring(1); // Remove # prefix
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const type = params.get('type');

      if (accessToken && type === 'recovery') {
        // We have recovery tokens in the hash, set the session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get('refresh_token') || '',
        });

        if (sessionError) {
          setError('Failed to verify reset link. Please request a new one.');
          return;
        }

        setSessionReady(true);
        return;
      }

      // Fallback: Check if we already have a session (shouldn't happen for recovery)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError('Failed to verify reset link. Please request a new one.');
        return;
      }

      if (session) {
        setSessionReady(true);
      } else {
        setError('Invalid or expired password reset link. Please request a new one.');
      }
    };

    initSupabase();
  }, [errorParam, errorDescription, searchParams]);

  // Validate password requirements
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];

    if (pwd.length < 10) {
      errors.push('Password must be at least 10 characters');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('Must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(pwd)) {
      errors.push('Must contain at least one special character');
    }

    return errors;
  };

  useEffect(() => {
    if (password) {
      setValidationErrors(validatePassword(password));
    } else {
      setValidationErrors([]);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Final validation
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError('Please fix the password requirements below');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!sessionReady) {
      setError('Invalid reset link. Please request a new password reset email.');
      setLoading(false);
      return;
    }

    try {
      // Use Supabase client to update the password
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Redirect to app login after 3 seconds
      setTimeout(() => {
        window.location.href = 'mindmuscle://login';
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background-primary via-background-secondary to-space-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-8 py-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-neon-cortex-green drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                  <span className="text-xl md:text-2xl font-bold">PASSWORD RESET!</span>
                </div>
              </LiquidGlass>
            </div>

            <GradientTextReveal
              text="Success!"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-relaxed"
              gradientFrom="#0EA5E9"
              gradientTo="#F97316"
              delay={0.2}
            />

            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-8">
              Your password has been reset successfully.
            </p>

            {/* Logo */}
            <div className="flex justify-center mb-12">
              <div className="relative w-32 h-32">
                <Image
                  src="/assets/images/logo.png"
                  alt="Mind & Muscle Logo"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
            </div>

            <LiquidGlass variant="blue" className="mb-8">
              <div className="p-8">
                <p className="text-lg text-text-secondary mb-4">
                  Opening the Mind & Muscle app...
                </p>
                <p className="text-sm text-text-secondary">
                  If the app doesn't open automatically, tap the button below
                </p>
                <a
                  href="mindmuscle://login"
                  className="inline-block mt-6 px-8 py-3 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-xl border border-neon-cortex-blue/30 hover:border-neon-cortex-blue/50 transition-all hover:scale-105 font-semibold"
                >
                  Open App
                </a>
              </div>
            </LiquidGlass>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background-primary via-background-secondary to-space-black">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-8 py-4">
              <div className="flex items-center gap-3">
                <Lock className="w-8 h-8 text-neon-cortex-blue drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
                <span className="text-xl md:text-2xl font-bold">RESET PASSWORD</span>
              </div>
            </LiquidGlass>
          </div>

          <GradientTextReveal
            text="Create New Password"
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 leading-relaxed"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />

          <p className="text-xl sm:text-2xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-2">
            Secure your account with a strong password
          </p>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-12">
          <div className="relative w-24 h-24">
            <Image
              src="/assets/images/logo.png"
              alt="Mind & Muscle Logo"
              width={96}
              height={96}
              className="object-contain"
            />
          </div>
        </div>

        <LiquidGlass variant="blue" className="mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Password Requirements</h2>

            {/* Password Requirements */}
            <div className="bg-slate-900/50 border border-neon-cortex-blue/20 rounded-lg p-6 mb-6">
              <ul className="space-y-3">
                <li className={`flex items-center gap-3 ${password.length >= 10 ? 'text-neon-cortex-green' : 'text-text-secondary'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${password.length >= 10 ? 'text-neon-cortex-green' : 'text-gray-500'}`} />
                  <span className="font-medium">At least 10 characters</span>
                </li>
                <li className={`flex items-center gap-3 ${/[A-Z]/.test(password) ? 'text-neon-cortex-green' : 'text-text-secondary'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${/[A-Z]/.test(password) ? 'text-neon-cortex-green' : 'text-gray-500'}`} />
                  <span className="font-medium">One uppercase letter (A-Z)</span>
                </li>
                <li className={`flex items-center gap-3 ${/[a-z]/.test(password) ? 'text-neon-cortex-green' : 'text-text-secondary'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${/[a-z]/.test(password) ? 'text-neon-cortex-green' : 'text-gray-500'}`} />
                  <span className="font-medium">One lowercase letter (a-z)</span>
                </li>
                <li className={`flex items-center gap-3 ${/[0-9]/.test(password) ? 'text-neon-cortex-green' : 'text-text-secondary'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${/[0-9]/.test(password) ? 'text-neon-cortex-green' : 'text-gray-500'}`} />
                  <span className="font-medium">One number (0-9)</span>
                </li>
                <li className={`flex items-center gap-3 ${/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password) ? 'text-neon-cortex-green' : 'text-text-secondary'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password) ? 'text-neon-cortex-green' : 'text-gray-500'}`} />
                  <span className="font-medium">One special character (!@#$%^&*)</span>
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* New Password Field */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-starlight-white">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoFocus
                    className="w-full px-4 py-3 pr-12 bg-slate-900 border-2 border-neon-cortex-blue/40 rounded-lg focus:outline-none focus:border-neon-cortex-blue focus:ring-2 focus:ring-neon-cortex-blue/20 transition-all text-white placeholder:text-gray-400 font-medium"
                    disabled={loading || !sessionReady}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-starlight-white">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 bg-slate-900 border-2 border-neon-cortex-blue/40 rounded-lg focus:outline-none focus:border-neon-cortex-blue focus:ring-2 focus:ring-neon-cortex-blue/20 transition-all text-white placeholder:text-gray-400 font-medium"
                    disabled={loading || !sessionReady}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Messages */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword || validationErrors.length > 0 || !sessionReady}
                className="w-full px-8 py-4 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-xl border border-neon-cortex-blue/30 hover:border-neon-cortex-blue/50 transition-all duration-300 hover:scale-105 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-liquid-glow-blue"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </LiquidGlass>

        {/* What's Next Card */}
        <LiquidGlass variant="neutral" className="mb-8">
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">What's Next?</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold mb-1">Reset Your Password</h4>
                  <p className="text-text-secondary text-sm">
                    Enter a new secure password above that meets all requirements
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold mb-1">Return to App</h4>
                  <p className="text-text-secondary text-sm">
                    You'll be redirected to the Mind & Muscle app automatically
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neon-cortex-blue to-mind-primary rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold mb-1">Login with New Password</h4>
                  <p className="text-text-secondary text-sm">
                    Use your email and new password to access your account
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <a
                href="mindmuscle://login"
                className="text-sm text-neon-cortex-blue hover:text-neon-cortex-blue/80 transition-colors font-semibold"
              >
                Back to App →
              </a>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background-primary via-background-secondary to-space-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cortex-blue"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
