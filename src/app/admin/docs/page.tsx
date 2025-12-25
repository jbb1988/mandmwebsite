'use client';

import { useState } from 'react';
import AdminGate from '@/components/AdminGate';
import {
  Book,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Users,
  Gift,
  BarChart3,
  Settings,
  Key,
  Shield,
  Handshake,
  Target,
  Mail,
  Bell,
  Database,
  Cloud,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: typeof Book;
  color: string;
  content: React.ReactNode;
}

function CodeBlock({ children, copyable = true }: { children: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-emerald-400 overflow-x-auto">
        <code>{children}</code>
      </pre>
      {copyable && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-white/50" />
          )}
        </button>
      )}
    </div>
  );
}

function DocSectionComponent({ section, isOpen, onToggle }: {
  section: DocSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = section.icon;
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${colorClasses[section.color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-medium text-white">{section.title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-white/50" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white/50" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-white/10 bg-white/[0.02]">
          <div className="prose prose-invert prose-sm max-w-none">
            {section.content}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDocsPage() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['getting-started']));

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Book,
      color: 'emerald',
      content: (
        <div className="space-y-4 text-white/70">
          <p>
            Welcome to the Mind & Muscle Admin Portal. This guide covers all features
            and how to use them effectively.
          </p>

          <h4 className="text-white font-medium mt-4">Quick Navigation</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">Dashboard</span> - Revenue metrics, expiring trials, recent activity
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">User Management</span> - Search users, grant/revoke trials, view details
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">Partners</span> - Manage affiliates, sync with Tolt
            </li>
            <li className="flex items-center gap-2">
              <span className="text-cyan-400">Outreach CRM</span> - Track sales pipeline
            </li>
          </ul>

          <h4 className="text-white font-medium mt-4">Keyboard Shortcuts</h4>
          <ul className="space-y-1">
            <li><code className="bg-white/10 px-2 py-0.5 rounded">⌘K</code> - Global search (users, partners, pages)</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'revenue-dashboard',
      title: 'Revenue Dashboard',
      icon: DollarSign,
      color: 'emerald',
      content: (
        <div className="space-y-4 text-white/70">
          <p>
            The revenue dashboard shows subscription metrics, credit purchases, and trial status.
          </p>

          <h4 className="text-white font-medium">Data Sources</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Cloud className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-emerald-400 font-medium">RevenueCat API</p>
                <p className="text-sm">Most accurate. Real-time data from RevenueCat.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Database className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium">Subscription Events</p>
                <p className="text-sm">Logged from webhook. Accurate for new subscriptions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="text-orange-400 font-medium">Estimated</p>
                <p className="text-sm">Fallback. Based on profile tier data (less accurate).</p>
              </div>
            </div>
          </div>

          <h4 className="text-white font-medium mt-4">Metrics Explained</h4>
          <ul className="space-y-2">
            <li><strong className="text-white">Est. MRR</strong> - Monthly Recurring Revenue (paid subscribers × $13.17/month base rate)</li>
            <li><strong className="text-white">Paid Subscribers</strong> - Users with active paid subscriptions</li>
            <li><strong className="text-white">Active Trials</strong> - Users on trial (promo_tier_expires_at in future)</li>
            <li><strong className="text-white">Conversion</strong> - Paid ÷ (Paid + Trials + Free) × 100</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'revenuecat-setup',
      title: 'RevenueCat API Setup',
      icon: Key,
      color: 'purple',
      content: (
        <div className="space-y-4 text-white/70">
          <p>
            To get accurate revenue data, configure RevenueCat API access.
          </p>

          <h4 className="text-white font-medium">Step 1: Get API Credentials</h4>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to <a href="https://app.revenuecat.com" target="_blank" rel="noopener" className="text-blue-400 hover:underline">RevenueCat Dashboard</a></li>
            <li>Select your project</li>
            <li>Go to Project Settings → API Keys</li>
            <li>Copy the <strong>Secret API Key</strong> (starts with <code className="bg-white/10 px-1 rounded">sk_</code>)</li>
            <li>Copy the <strong>Project ID</strong> from the URL or settings</li>
          </ol>

          <h4 className="text-white font-medium mt-4">Step 2: Add to Vercel</h4>
          <p>Add these environment variables in Vercel Dashboard → Settings → Environment Variables:</p>
          <CodeBlock>{`REVENUECAT_SECRET_API_KEY=sk_xxxxxxxxxxxxxxxx
REVENUECAT_PROJECT_ID=proj_xxxxxxxx`}</CodeBlock>

          <h4 className="text-white font-medium mt-4">Step 3: Redeploy</h4>
          <p>Trigger a new deployment for the changes to take effect.</p>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>Note:</strong> The webhook already logs subscription events to the database.
              The API integration provides additional real-time metrics.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: Users,
      color: 'blue',
      content: (
        <div className="space-y-4 text-white/70">
          <p>
            Manage users, grant trials, and view detailed user information.
          </p>

          <h4 className="text-white font-medium">Finding Users</h4>
          <ul className="space-y-2">
            <li>Use the search bar to find users by email or name</li>
            <li>Filter by tier (Core/Pro) or status (Trial/Paid/Free/Expired)</li>
            <li>Click a row to view detailed user info</li>
          </ul>

          <h4 className="text-white font-medium mt-4">User Actions</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-emerald-400 font-medium flex items-center gap-2">
                <Gift className="w-4 h-4" /> Grant Trial
              </p>
              <p className="text-sm mt-1">Give user Pro access for X days. Sends welcome email automatically.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-cyan-400 font-medium flex items-center gap-2">
                <Gift className="w-4 h-4" /> Extend Trial
              </p>
              <p className="text-sm mt-1">Add days to existing trial. Extends from current expiration date.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-red-400 font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" /> Revoke Trial
              </p>
              <p className="text-sm mt-1">Remove Pro access immediately. Sets user back to free tier.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-blue-400 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email User
              </p>
              <p className="text-sm mt-1">Opens email client with pre-filled subject line.</p>
            </div>
          </div>

          <h4 className="text-white font-medium mt-4">User Status Types</h4>
          <ul className="space-y-1">
            <li><span className="text-emerald-400">Paid</span> - Active subscription via RevenueCat</li>
            <li><span className="text-cyan-400">Trial (Xd)</span> - On trial, X days remaining</li>
            <li><span className="text-white/60">Free</span> - Core tier, no subscription</li>
            <li><span className="text-red-400">Expired</span> - Trial ended, reverted to free</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'trial-management',
      title: 'Trial Management',
      icon: Gift,
      color: 'cyan',
      content: (
        <div className="space-y-4 text-white/70">
          <p>
            Trials give users temporary Pro access. Here's how they work.
          </p>

          <h4 className="text-white font-medium">How Trials Work</h4>
          <ul className="space-y-2">
            <li>Trials set <code className="bg-white/10 px-1 rounded">tier = 'pro'</code> and <code className="bg-white/10 px-1 rounded">promo_tier_expires_at</code> to expiration date</li>
            <li>App checks expiration on each session</li>
            <li>When expired, user loses Pro features but keeps their data</li>
          </ul>

          <h4 className="text-white font-medium mt-4">Trial Sources</h4>
          <ul className="space-y-2">
            <li><strong className="text-white">Manual Grant</strong> - Admin grants via user management</li>
            <li><strong className="text-white">Promo Code</strong> - User redeems a promo code</li>
            <li><strong className="text-white">Partner Referral</strong> - Automatic trial for partner referrals</li>
            <li><strong className="text-white">Team Invite</strong> - Coach invites player to team</li>
          </ul>

          <h4 className="text-white font-medium mt-4">Expiring Trials Alert</h4>
          <p>
            The dashboard shows trials expiring in the next 7 days. Use this to:
          </p>
          <ul className="space-y-1">
            <li>Send retention emails before expiration</li>
            <li>Extend trials for engaged users</li>
            <li>Track conversion opportunities</li>
          </ul>

          <h4 className="text-white font-medium mt-4">Trial Emails</h4>
          <p>Automatic emails are sent:</p>
          <ul className="space-y-1">
            <li><strong>On Grant:</strong> Welcome email with trial details</li>
            <li><strong>7 days before:</strong> Reminder email</li>
            <li><strong>3 days before:</strong> Urgency reminder</li>
            <li><strong>1 day before:</strong> Final reminder</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'partners',
      title: 'Partner Management',
      icon: Handshake,
      color: 'emerald',
      content: (
        <div className="space-y-4 text-white/70">
          <p>
            Partners (affiliates) earn commission for referring users. Managed via Tolt.
          </p>

          <h4 className="text-white font-medium">Partner Flow</h4>
          <ol className="list-decimal list-inside space-y-2">
            <li>Partner signs up at <code className="bg-white/10 px-1 rounded">/partner-program</code></li>
            <li>Application syncs to Tolt for approval</li>
            <li>Approved partners get unique referral link</li>
            <li>Referred users get tracked via cookies</li>
            <li>Commission paid on successful conversions</li>
          </ol>

          <h4 className="text-white font-medium mt-4">Tolt Integration</h4>
          <p>
            Tolt handles payment processing and tracking. Use "Sync with Tolt" to pull latest data.
          </p>
          <a
            href="https://app.tolt.io"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 text-blue-400 hover:underline mt-2"
          >
            Open Tolt Dashboard <ExternalLink className="w-4 h-4" />
          </a>

          <h4 className="text-white font-medium mt-4">Partner Tiers</h4>
          <ul className="space-y-1">
            <li><strong className="text-white">Standard (Finder Fee)</strong> - One-time $15 per conversion</li>
            <li><strong className="text-white">VIP (Recurring)</strong> - 20% recurring commission</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'outreach-crm',
      title: 'Outreach CRM',
      icon: Target,
      color: 'cyan',
      content: (
        <div className="space-y-4 text-white/70">
          <p>
            Track sales outreach across Facebook groups and X (Twitter).
          </p>

          <h4 className="text-white font-medium">Pipeline Stages</h4>
          <ul className="space-y-2">
            <li><span className="text-white/60">Identified</span> - Found potential lead</li>
            <li><span className="text-blue-400">Contacted</span> - Sent initial DM</li>
            <li><span className="text-cyan-400">Responded</span> - Got a reply</li>
            <li><span className="text-purple-400">Interested</span> - Showing buying intent</li>
            <li><span className="text-emerald-400">Converted</span> - Became customer/partner</li>
            <li><span className="text-red-400">Not Interested</span> - Declined</li>
          </ul>

          <h4 className="text-white font-medium mt-4">Best Practices</h4>
          <ul className="space-y-2">
            <li>Update status after each interaction</li>
            <li>Add notes for context on follow-ups</li>
            <li>Use templates for consistent messaging</li>
            <li>Track which messages get best response rates</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'feature-analytics',
      title: 'Feature Analytics',
      icon: BarChart3,
      color: 'purple',
      content: (
        <div className="space-y-4 text-white/70">
          <p>
            Track which features users engage with most.
          </p>

          <h4 className="text-white font-medium">Tracked Features</h4>
          <ul className="space-y-1">
            <li>Swing Lab (video analysis)</li>
            <li>Pitch Lab</li>
            <li>Speed Lab</li>
            <li>Arm Care</li>
            <li>Mind Training</li>
            <li>Muscle Training</li>
            <li>Coach's Corner</li>
            <li>GameFlow</li>
            <li>Plate IQ</li>
          </ul>

          <h4 className="text-white font-medium mt-4">Health Score</h4>
          <p>
            Each user gets a health score (0-100) based on:
          </p>
          <ul className="space-y-1">
            <li>Feature diversity (using multiple features)</li>
            <li>Recent activity (last 7/30 days)</li>
            <li>Session frequency</li>
            <li>Feature depth (completing vs starting)</li>
          </ul>

          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-400 text-sm">
              <strong>Tip:</strong> Users with low health scores but active trials are churn risks.
              Consider reaching out proactively.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'audit-log',
      title: 'Audit Log',
      icon: Shield,
      color: 'orange',
      content: (
        <div className="space-y-4 text-white/70">
          <p>
            All admin actions are logged for security and accountability.
          </p>

          <h4 className="text-white font-medium">Logged Actions</h4>
          <ul className="space-y-1">
            <li><code className="bg-white/10 px-1 rounded">grant_trial</code> - Trial granted to user</li>
            <li><code className="bg-white/10 px-1 rounded">extend_trial</code> - Trial extended</li>
            <li><code className="bg-white/10 px-1 rounded">revoke_trial</code> - Trial revoked</li>
            <li><code className="bg-white/10 px-1 rounded">create_promo_code</code> - Promo code created</li>
            <li><code className="bg-white/10 px-1 rounded">delete_promo_code</code> - Promo code deleted</li>
            <li><code className="bg-white/10 px-1 rounded">sync_partners</code> - Partner sync with Tolt</li>
            <li><code className="bg-white/10 px-1 rounded">send_announcement</code> - In-app announcement sent</li>
          </ul>

          <h4 className="text-white font-medium mt-4">Log Entry Details</h4>
          <p>Each entry includes:</p>
          <ul className="space-y-1">
            <li>Action type and timestamp</li>
            <li>Target user/entity</li>
            <li>IP address and user agent</li>
            <li>Additional context (days granted, etc.)</li>
          </ul>

          <h4 className="text-white font-medium mt-4">Viewing Logs</h4>
          <p>
            Logs are stored in the <code className="bg-white/10 px-1 rounded">admin_audit_log</code> table.
            Query via Supabase dashboard for detailed analysis.
          </p>
        </div>
      ),
    },
    {
      id: 'announcements',
      title: 'Announcements',
      icon: Bell,
      color: 'pink',
      content: (
        <div className="space-y-4 text-white/70">
          <p>
            Send in-app announcements to all users or specific segments.
          </p>

          <h4 className="text-white font-medium">Announcement Types</h4>
          <ul className="space-y-2">
            <li><strong className="text-blue-400">Info</strong> - General updates, tips</li>
            <li><strong className="text-emerald-400">Success</strong> - New features, achievements</li>
            <li><strong className="text-orange-400">Warning</strong> - Maintenance, changes</li>
            <li><strong className="text-red-400">Alert</strong> - Urgent notices</li>
          </ul>

          <h4 className="text-white font-medium mt-4">Targeting</h4>
          <p>Announcements can target:</p>
          <ul className="space-y-1">
            <li>All users</li>
            <li>Pro tier only</li>
            <li>Free tier only</li>
            <li>Specific app versions</li>
          </ul>

          <h4 className="text-white font-medium mt-4">Best Practices</h4>
          <ul className="space-y-2">
            <li>Keep messages short and actionable</li>
            <li>Use sparingly to avoid notification fatigue</li>
            <li>Include deep links to relevant features</li>
            <li>Set expiration dates for time-sensitive content</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <AdminGate title="Admin Docs" description="Enter admin password to view documentation">
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 py-8 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Book className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Admin Documentation
                  </h1>
                  <p className="text-white/50 text-sm">
                    How-to guides and feature reference
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mb-6 flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setOpenSections(new Set([section.id]));
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                >
                  {section.title}
                </button>
              ))}
            </div>

            {/* Documentation Sections */}
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} id={section.id}>
                  <DocSectionComponent
                    section={section}
                    isOpen={openSections.has(section.id)}
                    onToggle={() => toggleSection(section.id)}
                  />
                </div>
              ))}
            </div>

            {/* External Links */}
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="font-medium text-white mb-3">External Resources</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <a
                  href="https://supabase.com/dashboard/project/kuswlvbjplkgrqlmqtok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Database className="w-5 h-5 text-emerald-400" />
                  <span className="text-white/70">Supabase Dashboard</span>
                  <ExternalLink className="w-4 h-4 text-white/30 ml-auto" />
                </a>
                <a
                  href="https://vercel.com/jbb1988s-projects/mandmwebsite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-white/60" />
                  <span className="text-white/70">Vercel Dashboard</span>
                  <ExternalLink className="w-4 h-4 text-white/30 ml-auto" />
                </a>
                <a
                  href="https://app.revenuecat.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-purple-400" />
                  <span className="text-white/70">RevenueCat Dashboard</span>
                  <ExternalLink className="w-4 h-4 text-white/30 ml-auto" />
                </a>
                <a
                  href="https://app.tolt.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Handshake className="w-5 h-5 text-cyan-400" />
                  <span className="text-white/70">Tolt Dashboard</span>
                  <ExternalLink className="w-4 h-4 text-white/30 ml-auto" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
