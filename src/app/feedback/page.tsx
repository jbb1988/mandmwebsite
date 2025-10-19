'use client';

import React, { useState } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

type FeedbackCategory = 'bug_report' | 'feature_request' | 'general_feedback' | 'ai_coach_feedback';

interface FormData {
  category: FeedbackCategory;
  subject: string;
  message: string;
}

interface FormErrors {
  subject?: string;
  message?: string;
}

export default function FeedbackPage() {
  const [formData, setFormData] = useState<FormData>({
    category: 'general_feedback',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const categoryOptions: { value: FeedbackCategory; label: string }[] = [
    { value: 'bug_report', label: 'Bug Report' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'general_feedback', label: 'General Feedback' },
    { value: 'ai_coach_feedback', label: 'AI Coach Feedback' },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please enter a subject';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitStatus('success');
      setFormData({
        category: 'general_feedback',
        subject: '',
        message: '',
      });
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="max-w-4xl mx-auto text-center mb-12">
        <GradientTextReveal
          text="Send Feedback"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-relaxed"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
          Share your ideas and help us improve
        </p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto">
        <LiquidGlass
          variant="blue"
          rounded="2xl"
          className="p-8 md:p-12 [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white/[0.02] [&>div:first-child]:via-transparent [&>div:first-child]:to-transparent"
        >
          {/* Info Banner */}
          <div className="mb-8 p-4 rounded-lg bg-neon-cortex-blue/10 border border-neon-cortex-blue/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-neon-cortex-blue mt-0.5 flex-shrink-0" />
              <p className="text-text-secondary text-sm">
                We value your feedback! Share bugs, feature requests, or any suggestions to help us improve Mind & Muscle.
              </p>
            </div>
          </div>

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-6 rounded-xl bg-green-500/10 border border-green-500/30 animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-white">Thank you!</h3>
                  <p className="text-text-secondary text-sm mt-1">
                    Your feedback has been submitted successfully. We appreciate your input!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="mb-8 p-6 rounded-xl bg-red-500/10 border border-red-500/30 animate-fadeIn">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-white">Oops!</h3>
                  <p className="text-text-secondary text-sm mt-1">
                    Failed to submit feedback. Please try again or email us at support@mindandmuscle.ai
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-text-secondary mb-2 tracking-wider">
                CATEGORY
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as FeedbackCategory })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-neon-cortex-blue focus:outline-none focus:ring-2 focus:ring-neon-cortex-blue/50 transition-all"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-background-primary text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-xs font-semibold text-text-secondary mb-2 tracking-wider">
                SUBJECT
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of your feedback"
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                  errors.subject ? 'border-red-500' : 'border-white/10'
                } text-white placeholder-text-secondary focus:border-neon-cortex-blue focus:outline-none focus:ring-2 focus:ring-neon-cortex-blue/50 transition-all`}
              />
              {errors.subject && (
                <p className="mt-2 text-sm text-red-400">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-xs font-semibold text-text-secondary mb-2 tracking-wider">
                MESSAGE
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please provide details about your feedback..."
                rows={8}
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                  errors.message ? 'border-red-500' : 'border-white/10'
                } text-white placeholder-text-secondary focus:border-neon-cortex-blue focus:outline-none focus:ring-2 focus:ring-neon-cortex-blue/50 transition-all resize-none`}
              />
              {errors.message && (
                <p className="mt-2 text-sm text-red-400">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 rounded-lg font-semibold bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </button>

            {/* Privacy Notice */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xs text-text-secondary">
                  Your feedback is private and will only be used to improve Mind & Muscle.
                </p>
              </div>
            </div>
          </form>
        </LiquidGlass>
      </div>
    </div>
  );
}
