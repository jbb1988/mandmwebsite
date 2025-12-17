'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Copy,
  Check,
  ArrowRight,
  Building2,
  Users,
  Dumbbell,
  Star,
  ExternalLink,
  Eye,
  X,
  Download,
  QrCode,
  User,
  Briefcase,
  MapPin,
  Globe
} from 'lucide-react';

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
  qrCodeUrl: string | null;
}

interface RecipientInfo {
  firstName: string;
  organizationName: string;
  facilityName: string;
  platform: string;
}

const SEGMENT_INFO: Record<string, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  national_org: {
    label: 'National Organizations',
    icon: <Building2 className="w-5 h-5" />,
    description: 'For reaching out to national baseball/softball organizations',
    color: 'blue',
  },
  travel_org: {
    label: 'Travel Teams',
    icon: <Users className="w-5 h-5" />,
    description: 'For travel ball teams and competitive organizations',
    color: 'cyan',
  },
  facility: {
    label: 'Training Facilities',
    icon: <Dumbbell className="w-5 h-5" />,
    description: 'For batting cages, academies, and training centers',
    color: 'orange',
  },
  influencer: {
    label: 'Influencers',
    icon: <Star className="w-5 h-5" />,
    description: 'For social media influencers and content creators',
    color: 'purple',
  },
};

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook', 'Other'];

// Card component matching admin style
function Card({ children, className = '', variant = 'default', glow = false }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  glow?: boolean;
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };
  const glowClass = glow ? 'shadow-lg shadow-blue-500/10' : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}>
      {children}
    </div>
  );
}

export default function PartnerEmailTemplatesPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    firstName: '',
    organizationName: '',
    facilityName: '',
    platform: '',
  });

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

  // Strip out the "Book a Call" CTA section and replace with partner referral link
  const transformForPartner = (content: string): string => {
    if (!partner) return content;

    // Pattern to match the "Book a Call" CTA table section
    // This matches the full CTA block with schedule link
    const ctaPattern = /<tr><td align="center" style="padding:24px 40px">[\s\S]*?mindandmuscle\.ai\/schedule[\s\S]*?<\/td><\/tr>/gi;

    // Replace with partner referral CTA
    const partnerCta = `<tr><td align="center" style="padding:24px 40px">
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;width:100%">
    <tr><td align="center" style="background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);border-radius:12px;padding:32px;box-shadow:0 8px 24px rgba(59,130,246,0.35)">
      <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#fff">Ready to take your mental game to the next level?</p>
      <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,0.9)">Get started with Mind & Muscle today.</p>
      <a href="${partner.referralUrl || 'https://mindandmuscle.ai'}" style="display:inline-block;background:#fff;color:#2563eb;padding:18px 48px;border-radius:10px;text-decoration:none;font-weight:700;font-size:18px;box-shadow:0 6px 16px rgba(0,0,0,0.2)">Get Started →</a>
    </td></tr>
  </table>
</td></tr>`;

    return content.replace(ctaPattern, partnerCta);
  };

  const replaceAllPlaceholders = (content: string): string => {
    if (!partner) return content;

    // First transform for partner (replace booking CTA with referral link)
    let result = transformForPartner(content);

    // Partner info (auto-filled)
    result = result.replace(/\[Your Name\]/g, partner.firstName || partner.name);
    result = result.replace(/\{\{your_name\}\}/g, partner.firstName || partner.name);
    result = result.replace(/\[link\]/g, partner.referralUrl || '[Your Referral Link]');
    result = result.replace(/\[Get Started\]/g, partner.referralUrl || '[Your Referral Link]');

    // Recipient info (from form)
    if (recipientInfo.firstName) {
      result = result.replace(/\{\{first_name\}\}/g, recipientInfo.firstName);
    }
    if (recipientInfo.organizationName) {
      result = result.replace(/\{\{organization_name\}\}/g, recipientInfo.organizationName);
      result = result.replace(/\{\{company_name\}\}/g, recipientInfo.organizationName);
    }
    if (recipientInfo.facilityName) {
      result = result.replace(/\{\{facility_name\}\}/g, recipientInfo.facilityName);
    }
    if (recipientInfo.platform) {
      result = result.replace(/\{\{platform\}\}/g, recipientInfo.platform);
    }

    return result;
  };

  const getCleanTextFromHtml = (html: string): string => {
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      return html;
    }
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    // Clean up whitespace aggressively
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const copyToClipboard = async (text: string, id: string, isHtml: boolean = false) => {
    try {
      const processedText = replaceAllPlaceholders(text);

      if (isHtml && (text.includes('<html') || text.includes('<!DOCTYPE'))) {
        const blob = new Blob([processedText], { type: 'text/html' });
        const plainBlob = new Blob([getCleanTextFromHtml(processedText)], { type: 'text/plain' });

        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blob,
            'text/plain': plainBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(processedText);
      }

      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = replaceAllPlaceholders(text);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const downloadQrCode = async () => {
    if (!partner?.qrCodeUrl) return;

    try {
      const response = await fetch(partner.qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mind-muscle-qr-${partner.referralSlug || 'code'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(partner.qrCodeUrl, '_blank');
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

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  };

  // Verification page
  if (!partner) {
    return (
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <header className="border-b border-white/[0.08] backdrop-blur-md bg-[#0A0B14]/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/assets/images/logo.png" alt="Mind & Muscle" width={40} height={40} className="w-10 h-10" />
              <span className="text-lg font-bold">Mind & Muscle</span>
            </Link>
            <Link href="/partner-program" className="text-sm text-white/50 hover:text-white transition-colors">
              Partner Program
            </Link>
          </div>
        </header>

        <main className="relative z-10 max-w-lg mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Partner Email Templates</h1>
            <p className="text-white/50">
              Access professionally written email templates to promote Mind & Muscle to your network.
            </p>
          </div>

          <Card variant="elevated" className="p-6">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-white/70">
                  Partner Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your partner email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder-white/30"
                  required
                />
                <p className="text-xs text-white/30 mt-2">
                  Use the email you registered with for the partner program
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl font-semibold text-white hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
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
          </Card>

          <div className="mt-8 text-center">
            <p className="text-white/40 text-sm">
              Not a partner yet?{' '}
              <Link href="/partner-program" className="text-blue-400 hover:underline">
                Join the Partner Program
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Main templates page
  return (
    <div className="min-h-screen bg-[#0A0B14] text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/[0.08] backdrop-blur-md bg-[#0A0B14]/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/images/logo.png" alt="Mind & Muscle" width={40} height={40} className="w-10 h-10" />
            <span className="text-lg font-bold hidden sm:block">Mind & Muscle</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50 hidden sm:block">
              Welcome, <span className="text-white font-medium">{partner.firstName || partner.name}</span>
            </span>
            <a
              href="https://mind-and-muscle.tolt.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-8">
        {/* Partner Info + Recipient Info Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Your Info */}
          <Card variant="elevated" className="p-5">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4 flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Your Partner Info
            </h2>
            <div className="space-y-4">
              {/* Referral Link */}
              <div>
                <label className="text-xs text-white/40 mb-1 block">Referral Link</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white/5 px-3 py-2 rounded-lg text-cyan-400 truncate">
                    {partner.referralUrl || 'Not set up'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(partner.referralUrl || '', 'referral-link')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {copiedId === 'referral-link' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/50" />
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {partner.qrCodeUrl && (
                <div className="flex items-center gap-4">
                  <Image
                    src={partner.qrCodeUrl}
                    alt="Your QR Code"
                    width={80}
                    height={80}
                    className="rounded-lg bg-white p-1"
                  />
                  <button
                    onClick={downloadQrCode}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download QR
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Recipient Info Form */}
          <Card variant="elevated" className="p-5">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Recipient Info (Optional)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={recipientInfo.firstName}
                    onChange={(e) => setRecipientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-white placeholder-white/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Organization</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={recipientInfo.organizationName}
                    onChange={(e) => setRecipientInfo(prev => ({ ...prev, organizationName: e.target.value }))}
                    placeholder="Wildcats Baseball"
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-white placeholder-white/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Facility Name</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={recipientInfo.facilityName}
                    onChange={(e) => setRecipientInfo(prev => ({ ...prev, facilityName: e.target.value }))}
                    placeholder="Elite Training Center"
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-white placeholder-white/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Platform</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <select
                    value={recipientInfo.platform}
                    onChange={(e) => setRecipientInfo(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-white appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0F1123]">Select platform</option>
                    {PLATFORMS.map(p => (
                      <option key={p} value={p} className="bg-[#0F1123]">{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/30 mt-3">
              Fill in recipient details to auto-populate placeholders in templates
            </p>
          </Card>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Email Templates</h1>
          <p className="text-white/50 text-sm">
            {templates.length} ready-to-use templates • Click preview to see the full email
          </p>
        </div>

        {/* Segment Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedSegment(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedSegment === null
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/[0.08]'
            }`}
          >
            All Templates
          </button>
          {Object.entries(SEGMENT_INFO).map(([key, info]) => {
            const colors = colorMap[info.color] || colorMap.blue;
            return (
              <button
                key={key}
                onClick={() => setSelectedSegment(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedSegment === key
                    ? `${colors.bg} ${colors.text} border ${colors.border}`
                    : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/[0.08]'
                }`}
              >
                {info.icon}
                <span className="hidden sm:inline">{info.label}</span>
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([segment, segmentTemplates]) => {
            const info = SEGMENT_INFO[segment];
            const colors = colorMap[info?.color || 'blue'];

            return (
              <div key={segment}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center border ${colors.border}`}>
                    <span className={colors.text}>{info?.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{info?.label || segment}</h2>
                    <p className="text-xs text-white/40">{info?.description}</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {segmentTemplates
                    .sort((a, b) => a.sequence_step - b.sequence_step)
                    .map((template) => {
                      const templateId = `${template.segment}-${template.sequence_step}`;
                      const isHtml = template.body_template.includes('<html') || template.body_template.includes('<!DOCTYPE');
                      const previewText = getCleanTextFromHtml(replaceAllPlaceholders(template.body_template));

                      return (
                        <Card key={templateId} variant="default" className="p-4 hover:border-white/20 transition-all">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium px-2 py-0.5 bg-white/10 rounded text-white/60">
                                  Email {template.sequence_step}
                                </span>
                                {isHtml && (
                                  <span className={`text-xs font-medium px-2 py-0.5 ${colors.bg} ${colors.text} rounded`}>
                                    HTML
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-white truncate">
                                {replaceAllPlaceholders(template.subject_line)}
                              </h3>
                            </div>
                            <button
                              onClick={() => copyToClipboard(template.subject_line, `${templateId}-subject`)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
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

                          {/* Preview */}
                          <div className="bg-white/[0.03] rounded-xl p-3 mb-3 max-h-24 overflow-hidden relative">
                            <p className="text-sm text-white/50 whitespace-pre-wrap line-clamp-3">
                              {previewText.slice(0, 250)}
                              {previewText.length > 250 && '...'}
                            </p>
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0F1123] to-transparent" />
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setPreviewTemplate(template)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Preview
                            </button>
                            <button
                              onClick={() => copyToClipboard(template.body_template, `${templateId}-body`, isHtml)}
                              className={`flex items-center gap-2 px-4 py-2 ${colors.bg} border ${colors.border} rounded-xl font-medium ${colors.text} hover:opacity-80 transition-opacity text-sm`}
                            >
                              {copiedId === `${templateId}-body` ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy Email
                                </>
                              )}
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Placeholder Help */}
        <Card variant="bordered" className="mt-10 p-5">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">
            Unfilled Placeholders
          </h3>
          <p className="text-sm text-white/40 mb-3">
            If you see any of these in your copied email, replace them manually:
          </p>
          <div className="flex flex-wrap gap-2">
            {!recipientInfo.firstName && (
              <span className="text-xs px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400">
                {'{{first_name}}'} → Recipient&apos;s name
              </span>
            )}
            {!recipientInfo.organizationName && (
              <span className="text-xs px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400">
                {'{{organization_name}}'} → Their org
              </span>
            )}
            {!recipientInfo.facilityName && (
              <span className="text-xs px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400">
                {'{{facility_name}}'} → Facility name
              </span>
            )}
            {!recipientInfo.platform && (
              <span className="text-xs px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400">
                {'{{platform}}'} → Social platform
              </span>
            )}
          </div>
        </Card>
      </main>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card variant="elevated" className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Email Preview</span>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Header */}
            <div className="p-4 bg-white/[0.02] border-b border-white/[0.08]">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 w-16">From:</span>
                  <span className="text-white/70">you@email.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 w-16">To:</span>
                  <span className="text-white/70">
                    {recipientInfo.firstName || 'recipient'}@{recipientInfo.organizationName?.toLowerCase().replace(/\s+/g, '') || 'company'}.com
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 w-16">Subject:</span>
                  <span className="text-white font-medium">
                    {replaceAllPlaceholders(previewTemplate.subject_line)}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-auto p-4">
              {previewTemplate.body_template.includes('<html') || previewTemplate.body_template.includes('<!DOCTYPE') ? (
                <div
                  className="bg-white rounded-lg p-4"
                  dangerouslySetInnerHTML={{
                    __html: replaceAllPlaceholders(previewTemplate.body_template)
                  }}
                />
              ) : (
                <div className="bg-white/5 rounded-xl p-4 whitespace-pre-wrap text-white/80 text-sm">
                  {replaceAllPlaceholders(previewTemplate.body_template)}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-white/[0.08]">
              <button
                onClick={() => copyToClipboard(previewTemplate.subject_line, 'modal-subject')}
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
              >
                {copiedId === 'modal-subject' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                Copy Subject
              </button>
              <button
                onClick={() => copyToClipboard(previewTemplate.body_template, 'modal-body', true)}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                {copiedId === 'modal-body' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy Email Body
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
