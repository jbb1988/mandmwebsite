'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Copy,
  Check,
  ChevronDown,
  ArrowRight,
  Building2,
  Users,
  Dumbbell,
  Star,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';

interface Template {
  segment: string;
  sequence_step: number;
  subject_line: string;
  body_template: string;
}

interface Partner {
  name: string;
  firstName: string;
  referralUrl: string;
  referralSlug: string;
}

const SEGMENT_INFO: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  national_org: {
    label: 'National Organizations',
    icon: <Building2 className="w-5 h-5" />,
    description: 'For reaching out to national baseball/softball organizations',
  },
  travel_org: {
    label: 'Travel Teams',
    icon: <Users className="w-5 h-5" />,
    description: 'For travel ball teams and competitive organizations',
  },
  facility: {
    label: 'Training Facilities',
    icon: <Dumbbell className="w-5 h-5" />,
    description: 'For batting cages, academies, and training centers',
  },
  influencer: {
    label: 'Influencers',
    icon: <Star className="w-5 h-5" />,
    description: 'For social media influencers and content creators',
  },
};

export default function PartnerEmailTemplatesPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/partner/verify-and-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      setPartner(data.partner);
      setTemplates(data.templates);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const replacePartnerPlaceholders = (content: string): string => {
    if (!partner) return content;

    return content
      .replace(/\[Your Name\]/g, partner.firstName || partner.name)
      .replace(/\{\{your_name\}\}/g, partner.firstName || partner.name)
      .replace(/\[link\]/g, partner.referralUrl || '[Your Referral Link]')
      .replace(/\[Get Started\]/g, partner.referralUrl || '[Your Referral Link]');
  };

  const getPlainTextFromHtml = (html: string): string => {
    // Check if it's HTML
    if (html.includes('<html') || html.includes('<!DOCTYPE')) {
      // Create a temporary element to extract text
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || '';
    }
    return html;
  };

  const copyToClipboard = async (text: string, id: string, isHtml: boolean = false) => {
    try {
      const processedText = replacePartnerPlaceholders(text);

      if (isHtml && (text.includes('<html') || text.includes('<!DOCTYPE'))) {
        // For HTML templates, copy as rich text
        const blob = new Blob([processedText], { type: 'text/html' });
        const plainBlob = new Blob([getPlainTextFromHtml(processedText)], { type: 'text/plain' });

        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blob,
            'text/plain': plainBlob,
          }),
        ]);
      } else {
        // For plain text, just copy as-is
        await navigator.clipboard.writeText(processedText);
      }

      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = replacePartnerPlaceholders(text);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredTemplates = selectedSegment
    ? templates.filter(t => t.segment === selectedSegment)
    : templates;

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.segment]) {
      acc[template.segment] = [];
    }
    acc[template.segment].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  // Show verification form if not verified
  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-md bg-background-primary/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/assets/images/logo.png"
                alt="Mind & Muscle"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-lg font-bold">Mind & Muscle</span>
            </Link>
            <Link
              href="/partner-program"
              className="text-sm text-text-secondary hover:text-white transition-colors"
            >
              Partner Program
            </Link>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 mb-6">
              <Mail className="w-8 h-8 text-neon-cortex-blue" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Partner Email Templates</h1>
            <p className="text-text-secondary">
              Access professionally written email templates to promote Mind & Muscle to your network.
            </p>
          </div>

          <LiquidGlass variant="blue" glow>
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Partner Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your partner email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-cortex-blue/50 focus:border-neon-cortex-blue transition-all"
                  required
                />
                <p className="text-xs text-text-secondary mt-2">
                  Use the email you registered with for the partner program
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-neon-cortex-blue to-mind-primary rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Access Templates
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </LiquidGlass>

          <div className="mt-8 text-center">
            <p className="text-text-secondary text-sm">
              Not a partner yet?{' '}
              <Link href="/partner-program" className="text-neon-cortex-blue hover:underline">
                Join the Partner Program
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Show templates after verification
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-background-primary/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/images/logo.png"
              alt="Mind & Muscle"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-lg font-bold">Mind & Muscle</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">
              Welcome, <span className="text-white font-medium">{partner.firstName || partner.name}</span>
            </span>
            <a
              href="https://mind-and-muscle.tolt.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neon-cortex-blue hover:underline flex items-center gap-1"
            >
              Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Partner Info Banner */}
        <LiquidGlass variant="blue" className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-solar-surge-orange" />
                <span className="text-sm font-medium text-solar-surge-orange">Your Referral Link</span>
              </div>
              <p className="text-lg font-mono bg-white/10 px-4 py-2 rounded-lg">
                {partner.referralUrl || 'Not set up yet'}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(partner.referralUrl || '', 'referral-link')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {copiedId === 'referral-link' ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </LiquidGlass>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Templates</h1>
          <p className="text-text-secondary">
            {templates.length} ready-to-use templates. Your name and referral link are pre-filled where applicable.
          </p>
        </div>

        {/* Segment Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedSegment(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedSegment === null
                ? 'bg-neon-cortex-blue text-white'
                : 'bg-white/10 hover:bg-white/20 text-text-secondary'
            }`}
          >
            All Templates
          </button>
          {Object.entries(SEGMENT_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedSegment(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedSegment === key
                  ? 'bg-neon-cortex-blue text-white'
                  : 'bg-white/10 hover:bg-white/20 text-text-secondary'
              }`}
            >
              {info.icon}
              {info.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([segment, segmentTemplates]) => (
            <div key={segment}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  {SEGMENT_INFO[segment]?.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{SEGMENT_INFO[segment]?.label || segment}</h2>
                  <p className="text-sm text-text-secondary">{SEGMENT_INFO[segment]?.description}</p>
                </div>
              </div>

              <div className="grid gap-4">
                {segmentTemplates
                  .sort((a, b) => a.sequence_step - b.sequence_step)
                  .map((template) => {
                    const templateId = `${template.segment}-${template.sequence_step}`;
                    const isExpanded = expandedTemplate === templateId;
                    const isHtml = template.body_template.includes('<html') || template.body_template.includes('<!DOCTYPE');

                    return (
                      <LiquidGlass key={templateId} variant="neutral" padding="none">
                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium px-2 py-0.5 bg-white/10 rounded">
                                  Email {template.sequence_step}
                                </span>
                                {isHtml && (
                                  <span className="text-xs font-medium px-2 py-0.5 bg-neon-cortex-blue/20 text-neon-cortex-blue rounded">
                                    HTML
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-lg">
                                {replacePartnerPlaceholders(template.subject_line)}
                              </h3>
                            </div>
                            <button
                              onClick={() => copyToClipboard(template.subject_line, `${templateId}-subject`)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                              {copiedId === `${templateId}-subject` ? (
                                <>
                                  <Check className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Subject</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Body Preview / Expanded */}
                          <div
                            className={`relative overflow-hidden transition-all duration-300 ${
                              isExpanded ? 'max-h-[600px]' : 'max-h-32'
                            }`}
                          >
                            <div className="bg-white/5 rounded-lg p-4 text-sm text-text-secondary whitespace-pre-wrap font-mono">
                              {isHtml
                                ? getPlainTextFromHtml(replacePartnerPlaceholders(template.body_template)).slice(0, isExpanded ? undefined : 300)
                                : replacePartnerPlaceholders(template.body_template).slice(0, isExpanded ? undefined : 300)}
                              {!isExpanded && template.body_template.length > 300 && '...'}
                            </div>
                            {!isExpanded && template.body_template.length > 300 && (
                              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background-secondary to-transparent pointer-events-none" />
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                            <button
                              onClick={() => setExpandedTemplate(isExpanded ? null : templateId)}
                              className="flex items-center gap-1 text-sm text-text-secondary hover:text-white transition-colors"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                              {isExpanded ? 'Show Less' : 'Show Full Email'}
                            </button>
                            <button
                              onClick={() => copyToClipboard(template.body_template, `${templateId}-body`, isHtml)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-cortex-blue to-mind-primary rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                            >
                              {copiedId === `${templateId}-body` ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy Email Body
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </LiquidGlass>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder Help */}
        <LiquidGlass variant="orange" className="mt-12">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Placeholder Guide
          </h3>
          <p className="text-text-secondary mb-4">
            Some templates have placeholders you&apos;ll need to fill in before sending:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">{'{{first_name}}'}</code>
              <span className="text-text-secondary">→ Recipient&apos;s first name</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">{'{{organization_name}}'}</code>
              <span className="text-text-secondary">→ Their organization</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">{'{{facility_name}}'}</code>
              <span className="text-text-secondary">→ Their facility name</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-white/10 rounded font-mono text-xs">{'{{platform}}'}</code>
              <span className="text-text-secondary">→ Social platform (Instagram, etc.)</span>
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-4">
            Your name and referral link have already been filled in automatically!
          </p>
        </LiquidGlass>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-text-secondary mb-4">
            Need more marketing materials?
          </p>
          <a
            href="https://mind-and-muscle.tolt.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
          >
            Visit Partner Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>
    </div>
  );
}
