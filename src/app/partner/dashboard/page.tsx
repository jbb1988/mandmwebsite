'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Home,
  Mail,
  FolderOpen,
  Image as ImageIcon,
  Copy,
  Check,
  Download,
  ExternalLink,
  LogOut,
  Loader2,
  DollarSign,
  Clock,
  Users,
  QrCode,
  FileText,
  FileCode,
  Palette,
  Share2,
  Building2,
  Dumbbell,
  Star,
  Eye,
  X,
  User,
  Briefcase,
  MapPin,
  Globe,
  TrendingUp,
  BarChart3,
  Award,
  Sparkles,
  RefreshCw,
  Filter,
  Grid3X3,
  ChevronDown,
  Upload,
  MousePointerClick,
  Wallet,
  FileDown
} from 'lucide-react';

// Types
interface Partner {
  name: string;
  firstName: string;
  email: string;
  referralUrl: string;
  referralSlug: string;
  toltPartnerId: string | null;
  logoUrl: string | null;
  qrCodeUrl: string | null;
  bannerUrl: string | null;
  bannerFacebookUrl: string | null;
  bannerFacebookCobrandedUrl: string | null;
  bannerTwitterUrl: string | null;
  bannerTwitterCobrandedUrl: string | null;
}

interface Metrics {
  totalEarnings: number;
  pendingPayout: number;
  totalReferrals: number;
  totalClicks: number;
  lastUpdated: string;
}

interface EarningsTransaction {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  customerEmail?: string;
  paidAt?: string;
}

interface Template {
  segment: string;
  sequence_step: number;
  subject_line: string;
  body_template: string;
}

interface RecipientInfo {
  firstName: string;
  organizationName: string;
  facilityName: string;
  platform: string;
}

interface Resource {
  id: string;
  title: string;
  category: 'pdf' | 'social' | 'brand';
  fileUrl: string;
  thumbnailUrl?: string;
  description?: string;
}

interface SocialTemplate {
  id: string;
  title: string;
  category: 'feature' | 'benefit' | 'social_proof' | 'cta';
  platform: 'all' | 'instagram' | 'facebook' | 'twitter' | 'tiktok';
  body: string;
  hashtags?: string[];
}

interface SocialImageTemplate {
  id: string;
  name: string;
  category: 'feature' | 'benefit' | 'social_proof' | 'cta' | 'seasonal';
  style: string;
  headline: string;
  subheadline?: string;
  primaryColor: string;
  accentColor: string;
  bestFor: string[];
  badgeText?: string;
  seasonal?: boolean;
  activeMonths?: number[];
}

interface GeneratedSocialImage {
  templateId: string;
  format: string;
  url: string;
  width: number;
  height: number;
}

// Segment info for email templates
const SEGMENT_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  national_org: {
    label: 'National Organizations',
    icon: <Building2 className="w-5 h-5" />,
    color: 'blue',
  },
  travel_org: {
    label: 'Travel Teams',
    icon: <Users className="w-5 h-5" />,
    color: 'cyan',
  },
  facility: {
    label: 'Training Facilities',
    icon: <Dumbbell className="w-5 h-5" />,
    color: 'orange',
  },
  influencer: {
    label: 'Influencers',
    icon: <Star className="w-5 h-5" />,
    color: 'purple',
  },
};

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook', 'Other'];

// Card component
function Card({ children, className = '', variant = 'default' }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}) {
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };

  return (
    <div className={`rounded-xl ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Stat Card component
function StatCard({ label, value, icon, color = 'blue' }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <Card variant="elevated" className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// Tab definitions
const TABS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
  { id: 'templates', label: 'Email Templates', icon: Mail },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'images', label: 'Social Images', icon: Sparkles },
  { id: 'resources', label: 'Resources', icon: FolderOpen },
  { id: 'assets', label: 'Your Assets', icon: ImageIcon },
];

// Static resources from Supabase storage
const STATIC_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Pro Tips & Usage Guidelines',
    category: 'pdf',
    fileUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/partner-resources/Pro_Tips___Usage_Guidelines.pdf',
    description: 'Best practices for promoting Mind & Muscle',
  },
  {
    id: '2',
    title: 'Partner Program Overview',
    category: 'pdf',
    fileUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/partner-resources/Partner_Program_Overview.pdf',
    description: 'Complete guide to the partner program',
  },
  {
    id: '3',
    title: 'Community Support Program',
    category: 'pdf',
    fileUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/partner-resources/Community-Support-Program..pdf',
    description: 'How to leverage community partnerships',
  },
  {
    id: '4',
    title: 'League Partnership Program',
    category: 'pdf',
    fileUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/partner-resources/League-Partnership-Program.pdf',
    description: 'Guide for league-level partnerships',
  },
  {
    id: '5',
    title: 'Scholarship Athlete Program',
    category: 'pdf',
    fileUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/partner-resources/Scholarship-Athlete-Program.pdf',
    description: 'Supporting athletes through scholarships',
  },
  {
    id: '6',
    title: 'Mind & Muscle Logo',
    category: 'brand',
    fileUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/partner-resources/Mind_and_Muscle_Logo.png',
    description: 'Official logo (PNG, transparent)',
  },
  {
    id: '7',
    title: 'Brand Colors',
    category: 'brand',
    fileUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/partner-resources/1760027339403-Brand_Colors.png',
    description: 'Official brand color palette',
  },
];

// Social Media Post Templates - Accurate Mind & Muscle Features
const SOCIAL_TEMPLATES: SocialTemplate[] = [
  // FEATURE HIGHLIGHTS - Specific Modules
  {
    id: 'f1',
    title: 'Swing Lab - AI Video Analysis',
    category: 'feature',
    platform: 'all',
    body: `Upload your swing. Get instant AI coaching.

Mind & Muscle's Swing Lab analyzes your video and gives you real feedback on:
- Bat path & mechanics
- Timing issues
- Load & weight transfer
- What's actually working

It's like having a hitting coach who watches every rep.

Check it out: {referral_link}`,
    hashtags: ['BaseballTraining', 'SwingAnalysis', 'HittingCoach', 'YouthBaseball'],
  },
  {
    id: 'f2',
    title: 'Plate IQ - Pitch Anticipation',
    category: 'feature',
    platform: 'all',
    body: `Great hitters know what's coming before it's thrown.

Mind & Muscle's Plate IQ trains pitch anticipation with:
- 20+ game scenarios
- Hunt Mode & Battle Mode
- 13-zone recognition system
- Real pitch sequences

Train your brain to read pitchers: {referral_link}`,
    hashtags: ['PlateIQ', 'PitchRecognition', 'HitterTraining', 'BaseballIQ'],
  },
  {
    id: 'f3',
    title: 'Pitch Lab - For Pitchers',
    category: 'feature',
    platform: 'all',
    body: `Pitchers need video analysis too.

Mind & Muscle's Pitch Lab breaks down your delivery:
- 8-component mechanical analysis
- Arm health assessment
- Release point consistency
- Movement patterns

Upload a video, get coaching: {referral_link}`,
    hashtags: ['PitchingCoach', 'PitcherDevelopment', 'ArmCare', 'BaseballPitcher'],
  },
  {
    id: 'f4',
    title: 'Game Lab - Baseball IQ',
    category: 'feature',
    platform: 'all',
    body: `How's your baseball IQ?

Mind & Muscle's Game Lab has 186 scenarios covering:
- Every position on the field
- Situational decisions
- Game management
- XP & badges to track progress

Know what to do before the ball is hit: {referral_link}`,
    hashtags: ['BaseballIQ', 'GameSmart', 'PlayerDevelopment', 'YouthBaseball'],
  },
  {
    id: 'f5',
    title: 'Mind Coach AI - Mental Training',
    category: 'feature',
    platform: 'all',
    body: `The mental game separates good from great.

Mind Coach AI trains:
- Focus under pressure
- Confidence building
- Pre-game visualization
- Bounce-back strategies

Your mind is a muscle. Train it: {referral_link}`,
    hashtags: ['MentalGame', 'SportsPerformance', 'MindCoach', 'AthletesMindset'],
  },
  {
    id: 'f6',
    title: 'Sound Lab - Pre-Game Focus',
    category: 'feature',
    platform: 'all',
    body: `Pro athletes use this. Now you can too.

Mind & Muscle's Sound Lab uses binaural beats for:
- Alpha waves (calm focus)
- Beta waves (high energy)
- Gamma waves (peak performance)

Perfect pre-game mental prep: {referral_link}`,
    hashtags: ['SoundLab', 'BinauralBeats', 'PreGameRoutine', 'MentalPrep'],
  },
  {
    id: 'f7',
    title: 'Arm Builder - FREE Arm Care',
    category: 'feature',
    platform: 'all',
    body: `Arm Builder is 100% FREE inside Mind & Muscle.

Get:
- Throwing development programs
- Arm care routines
- Warmup protocols
- Injury prevention

Protect your arm. Build velocity: {referral_link}`,
    hashtags: ['ArmCare', 'ThrowingProgram', 'VelocityTraining', 'FreeApp'],
  },
  // BENEFIT-FOCUSED
  {
    id: 'b1',
    title: 'Train the Complete Player',
    category: 'benefit',
    platform: 'all',
    body: `One app. Every skill.

Mind & Muscle covers:
- Hitting (Swing Lab AI analysis)
- Pitching (Pitch Lab breakdown)
- Mental game (Mind Coach AI)
- Baseball IQ (186 scenarios)
- Nutrition (Fuel AI)
- Strength (Muscle Coach AI)
- Arm care (FREE)

Stop juggling 5 different apps: {referral_link}`,
    hashtags: ['CompletePlayer', 'AllInOne', 'BaseballApp', 'PlayerDevelopment'],
  },
  {
    id: 'b2',
    title: 'Performance Under Pressure',
    category: 'benefit',
    platform: 'all',
    body: `Big moment. Bases loaded. Two outs.

Some players shrink. Others step up.

Mind & Muscle trains the mental side:
- Visualization before at-bats
- Focus techniques during pressure
- Recovery strategies after mistakes

Perform when it matters: {referral_link}`,
    hashtags: ['ClutchPerformance', 'PressurePlayers', 'BigMoments', 'GameReady'],
  },
  {
    id: 'b3',
    title: 'Weekly Progress Reports',
    category: 'benefit',
    platform: 'all',
    body: `Stop guessing if training is working.

Mind & Muscle sends weekly reports showing:
- Skills improving
- Areas to focus on
- Training consistency
- Comparison to benchmarks

Data-driven development: {referral_link}`,
    hashtags: ['TrackProgress', 'WeeklyReports', 'PlayerDevelopment', 'DataDriven'],
  },
  {
    id: 'b4',
    title: 'AI Coaches for Everything',
    category: 'benefit',
    platform: 'all',
    body: `Mind & Muscle has AI coaches for:
- Hitting (Swing Lab)
- Pitching (Pitch Lab)
- Mental game (Mind Coach AI)
- Workouts (Muscle Coach AI)
- Nutrition (Fuel AI)
- Practice planning (AI Assistant)

Elite coaching on your phone: {referral_link}`,
    hashtags: ['AICoach', 'PersonalTraining', 'BaseballTech', 'FutureOfTraining'],
  },
  // SOCIAL PROOF
  {
    id: 's1',
    title: 'Partner Recommendation',
    category: 'social_proof',
    platform: 'all',
    body: `I've been recommending Mind & Muscle because the features actually work:

Swing Lab catches things I miss on video.
Plate IQ improves pitch recognition fast.
Mind Coach builds mental toughness.

Players are showing up more prepared: {referral_link}`,
    hashtags: ['CoachApproved', 'ProvenResults', 'BaseballCoach', 'AthleteSuccess'],
  },
  {
    id: 's2',
    title: 'Player Transformation',
    category: 'social_proof',
    platform: 'all',
    body: `What I've noticed with players using Mind & Muscle:

They're reading pitchers better (Plate IQ works).
They're more locked in at the plate (mental training).
They're recovering faster from bad at-bats.

The combination of physical + mental training shows: {referral_link}`,
    hashtags: ['PlayerTransformation', 'ResultsThatShow', 'BaseballDevelopment', 'GameChanger'],
  },
  {
    id: 's3',
    title: 'Parent Question',
    category: 'social_proof',
    platform: 'all',
    body: `Parent asked: "What can my kid do at home to get better?"

My answer: Mind & Muscle.

They can work on pitch recognition (Plate IQ), review swings (Swing Lab), train their mental game (Mind Coach AI), and do arm care (Arm Builder).

All from their phone: {referral_link}`,
    hashtags: ['AtHomeTraining', 'ParentTips', 'YouthBaseball', 'GetBetter'],
  },
  // CALL-TO-ACTION
  {
    id: 'c1',
    title: 'All-In-One Value',
    category: 'cta',
    platform: 'all',
    body: `What Mind & Muscle includes:

- Swing Lab (AI video analysis)
- Pitch Lab (pitching breakdown)
- Plate IQ (pitch anticipation)
- Game Lab (186 baseball IQ scenarios)
- Mind Coach AI (mental training)
- Sound Lab (focus audio)
- Arm Builder (FREE arm care)
- Weekly Reports
- And more...

One subscription. Everything: {referral_link}`,
    hashtags: ['AllInOne', 'BaseballApp', 'ValueForMoney', 'GetStarted'],
  },
  {
    id: 'c2',
    title: 'Question Hook - Parents',
    category: 'cta',
    platform: 'all',
    body: `Baseball & softball parents:

What if your player could:
- Get AI swing analysis anytime
- Train pitch recognition
- Build mental toughness
- Track weekly progress

All from their phone?

That's Mind & Muscle: {referral_link}`,
    hashtags: ['BaseballParents', 'SoftballMom', 'SoftballDad', 'YouthSportsParent'],
  },
  {
    id: 'c3',
    title: 'Short & Punchy',
    category: 'cta',
    platform: 'twitter',
    body: `Discipline the Mind. Dominate the Game.

Mind & Muscle: AI swing analysis + pitch anticipation + mental training for baseball & softball.

14 training modules. One app: {referral_link}`,
    hashtags: ['BaseballTraining', 'MentalGame'],
  },
  {
    id: 'c4',
    title: 'The Edge',
    category: 'cta',
    platform: 'all',
    body: `Everyone's doing cage work.
Everyone's taking ground balls.

Few are training pitch anticipation (Plate IQ).
Few are doing AI swing analysis (Swing Lab).
Few are building mental toughness (Mind Coach AI).

That's your edge: {referral_link}`,
    hashtags: ['CompetitiveEdge', 'TrainDifferent', 'NextLevel', 'BaseballTraining'],
  },
];

// Category info for social templates
const SOCIAL_CATEGORY_INFO: Record<string, { label: string; color: string }> = {
  feature: { label: 'Features', color: 'blue' },
  benefit: { label: 'Benefits', color: 'emerald' },
  social_proof: { label: 'Social Proof', color: 'purple' },
  cta: { label: 'Call to Action', color: 'orange' },
};

// Platform info
const SOCIAL_PLATFORM_INFO: Record<string, { label: string; maxChars?: number }> = {
  all: { label: 'All Platforms' },
  instagram: { label: 'Instagram', maxChars: 2200 },
  facebook: { label: 'Facebook', maxChars: 63206 },
  twitter: { label: 'Twitter/X', maxChars: 280 },
  tiktok: { label: 'TikTok', maxChars: 2200 },
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Email templates state
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    firstName: '',
    organizationName: '',
    facilityName: '',
    platform: '',
  });
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [emailFormat, setEmailFormat] = useState<'html' | 'plain'>('html');

  // Social templates state
  const [socialPlatformFilter, setSocialPlatformFilter] = useState<string>('all');
  const [socialCategoryFilter, setSocialCategoryFilter] = useState<string | null>(null);
  const [expandedSocialPost, setExpandedSocialPost] = useState<string | null>(null);

  // PDF preview state
  const [previewPdf, setPreviewPdf] = useState<Resource | null>(null);

  // Social Images state
  const [socialImageTemplates, setSocialImageTemplates] = useState<SocialImageTemplate[]>([]);
  const [imagesCategoryFilter, setImagesCategoryFilter] = useState<string | null>(null);
  const [selectedImageTemplate, setSelectedImageTemplate] = useState<SocialImageTemplate | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<string>('feed_square');

  // Logo upload and banner regeneration state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isRegeneratingBanners, setIsRegeneratingBanners] = useState(false);
  const [bannerRegenerateMessage, setBannerRegenerateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Earnings history state
  const [earningsHistory, setEarningsHistory] = useState<EarningsTransaction[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsFilter, setEarningsFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');

  // Check auth and verify magic link token if present
  useEffect(() => {
    const checkAuthAndVerifyToken = async () => {
      const token = searchParams.get('token');

      if (token) {
        // Verify magic link token
        try {
          const response = await fetch('/api/partner/verify-magic-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setPartner(data.partner);
            // Remove token from URL
            router.replace('/partner/dashboard');
          } else {
            setError(data.error || 'Invalid login link');
            router.replace('/partner/login');
            return;
          }
        } catch {
          setError('Failed to verify login link');
          router.replace('/partner/login');
          return;
        }
      } else {
        // Check existing session
        try {
          const response = await fetch('/api/partner/verify-magic-link', {
            method: 'GET',
          });

          const data = await response.json();

          if (response.ok && data.authenticated) {
            setPartner(data.partner);
          } else {
            router.replace('/partner/login');
            return;
          }
        } catch {
          router.replace('/partner/login');
          return;
        }
      }

      setIsLoading(false);
    };

    checkAuthAndVerifyToken();
  }, [searchParams, router]);

  // Fetch templates when partner is loaded
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!partner?.email) return;

      try {
        const response = await fetch('/api/partner/verify-and-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: partner.email }),
        });

        const data = await response.json();
        if (response.ok) {
          setTemplates(data.templates || []);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      }
    };

    fetchTemplates();
  }, [partner?.email]);

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!partner?.email) return;

      try {
        const response = await fetch('/api/partner/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: partner.email }),
        });

        const data = await response.json();
        if (response.ok) {
          setMetrics(data);
        }
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
        // Set default metrics if API fails
        setMetrics({
          totalEarnings: 0,
          pendingPayout: 0,
          totalReferrals: 0,
          totalClicks: 0,
          lastUpdated: new Date().toISOString(),
        });
      }
    };

    fetchMetrics();
  }, [partner?.email]);

  // Logout handler
  const handleLogout = async () => {
    await fetch('/api/partner/verify-magic-link', { method: 'DELETE' });
    router.replace('/partner/login');
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  // Transform template for partner (replace booking CTA with referral link)
  const transformForPartner = useCallback((content: string): string => {
    if (!partner) return content;

    const ctaPattern = /<tr><td align="center" style="padding:24px 40px">[\s\S]*?mindandmuscle\.ai\/schedule[\s\S]*?<\/td><\/tr>/gi;

    const partnerCta = `<tr><td align="center" style="padding:24px 40px">
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;width:100%">
    <tr><td align="center" style="background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);border-radius:12px;padding:32px;box-shadow:0 8px 24px rgba(59,130,246,0.35)">
      <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#fff">Ready to take your mental game to the next level?</p>
      <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,0.9)">Get started with Mind & Muscle today.</p>
      <a href="${partner.referralUrl || 'https://mindandmuscle.ai'}" style="display:inline-block;background:#fff;color:#2563eb;padding:18px 48px;border-radius:10px;text-decoration:none;font-weight:700;font-size:18px;box-shadow:0 6px 16px rgba(0,0,0,0.2)">Get Started</a>
    </td></tr>
  </table>
</td></tr>`;

    return content.replace(ctaPattern, partnerCta);
  }, [partner]);

  // Replace placeholders in template
  const replaceAllPlaceholders = useCallback((content: string): string => {
    if (!partner) return content;

    let result = transformForPartner(content);

    // Partner info
    result = result.replace(/\[Your Name\]/g, partner.firstName || partner.name);
    result = result.replace(/\{\{your_name\}\}/g, partner.firstName || partner.name);
    result = result.replace(/\[link\]/g, partner.referralUrl || '[Your Referral Link]');
    result = result.replace(/\[Get Started\]/g, partner.referralUrl || '[Your Referral Link]');

    // Recipient info
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
  }, [partner, recipientInfo, transformForPartner]);

  // Get clean text from HTML
  const getCleanTextFromHtml = (html: string): string => {
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      return html;
    }
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Copy template content - respects emailFormat preference
  const copyTemplateContent = async (template: Template, type: 'subject' | 'body' | 'both') => {
    const processedSubject = replaceAllPlaceholders(template.subject_line);
    const processedBody = replaceAllPlaceholders(template.body_template);
    const plainBody = getCleanTextFromHtml(processedBody);

    if (type === 'subject') {
      await copyToClipboard(processedSubject, `subject-${template.segment}-${template.sequence_step}`);
    } else if (type === 'body') {
      const isHtml = template.body_template.includes('<html') || template.body_template.includes('<!DOCTYPE');

      // If plain text mode is selected, always copy plain text
      if (emailFormat === 'plain') {
        await copyToClipboard(plainBody, `body-${template.segment}-${template.sequence_step}`);
      } else if (isHtml) {
        // HTML mode with HTML template
        try {
          const blob = new Blob([processedBody], { type: 'text/html' });
          const plainBlob = new Blob([plainBody], { type: 'text/plain' });
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/html': blob,
              'text/plain': plainBlob,
            }),
          ]);
          setCopiedId(`body-${template.segment}-${template.sequence_step}`);
          setTimeout(() => setCopiedId(null), 2000);
        } catch {
          await copyToClipboard(plainBody, `body-${template.segment}-${template.sequence_step}`);
        }
      } else {
        await copyToClipboard(processedBody, `body-${template.segment}-${template.sequence_step}`);
      }
    } else {
      await copyToClipboard(`Subject: ${processedSubject}\n\n${plainBody}`, `both-${template.segment}-${template.sequence_step}`);
    }
  };

  // Download file
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(url, '_blank');
    }
  };

  // Copy social media template
  const copySocialTemplate = async (template: SocialTemplate, includeHashtags: boolean = false) => {
    if (!partner) return;

    let content = template.body.replace(/\{referral_link\}/g, partner.referralUrl || 'https://mindandmuscle.ai');

    if (includeHashtags && template.hashtags && template.hashtags.length > 0) {
      content += '\n\n' + template.hashtags.map(h => `#${h}`).join(' ');
    }

    await copyToClipboard(content, `social-${template.id}${includeHashtags ? '-hashtags' : ''}`);
  };

  // Filter social templates
  const filteredSocialTemplates = SOCIAL_TEMPLATES.filter(template => {
    const platformMatch = socialPlatformFilter === 'all' || template.platform === 'all' || template.platform === socialPlatformFilter;
    const categoryMatch = !socialCategoryFilter || template.category === socialCategoryFilter;
    return platformMatch && categoryMatch;
  });

  // Get character count for a social post (with referral link replaced)
  const getSocialPostCharCount = (template: SocialTemplate): number => {
    if (!partner) return template.body.length;
    const content = template.body.replace(/\{referral_link\}/g, partner.referralUrl || 'https://mindandmuscle.ai');
    return content.length;
  };

  // Fetch social image templates when tab is active
  useEffect(() => {
    if (activeTab === 'images' && socialImageTemplates.length === 0) {
      fetchSocialImageTemplates();
    }
  }, [activeTab, socialImageTemplates.length]);

  // Fetch earnings history when tab is active
  useEffect(() => {
    if (activeTab === 'earnings' && earningsHistory.length === 0 && partner?.email) {
      fetchEarningsHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, partner?.email]);

  // Fetch earnings history
  const fetchEarningsHistory = async () => {
    if (!partner?.email) return;
    setEarningsLoading(true);
    try {
      const response = await fetch('/api/partner/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: partner.email, includeTransactions: true }),
      });
      const data = await response.json();
      if (response.ok && data.earningsHistory) {
        setEarningsHistory(data.earningsHistory);
      }
    } catch (err) {
      console.error('Failed to fetch earnings history:', err);
    } finally {
      setEarningsLoading(false);
    }
  };

  // Export earnings to CSV
  const exportEarningsCSV = () => {
    const filteredTransactions = earningsFilter === 'all'
      ? earningsHistory
      : earningsHistory.filter(t => t.status === earningsFilter);

    const csvContent = [
      ['Date', 'Amount', 'Status', 'Customer', 'Paid Date'].join(','),
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        `$${t.amount.toFixed(2)}`,
        t.status.charAt(0).toUpperCase() + t.status.slice(1),
        t.customerEmail || 'N/A',
        t.paidAt ? new Date(t.paidAt).toLocaleDateString() : 'N/A',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fetch social image templates
  const fetchSocialImageTemplates = async () => {
    try {
      const response = await fetch('/api/partner/generate-social-images');
      if (response.ok) {
        const data = await response.json();
        setSocialImageTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Error fetching social image templates:', err);
    }
  };

  // Filter social image templates
  const filteredImageTemplates = socialImageTemplates.filter(template => {
    if (!imagesCategoryFilter) return true;
    return template.category === imagesCategoryFilter;
  });

  // Get static image URL for a template (all images are pre-generated)
  const getStaticImageUrl = (templateId: string, format: string): string => {
    return `https://kuswlvbjplkgrqlmqtok.supabase.co/storage/v1/object/public/social-images/${templateId}-${format}.png`;
  };

  // Handle logo file selection
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setBannerRegenerateMessage({ type: 'error', text: 'Please select an image file (PNG, JPG, etc.)' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setBannerRegenerateMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
      setBannerRegenerateMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Regenerate banners with logo
  const regenerateBanners = async () => {
    if (!logoPreview && !partner?.logoUrl) {
      setBannerRegenerateMessage({ type: 'error', text: 'Please upload a logo first' });
      return;
    }

    setIsRegeneratingBanners(true);
    setBannerRegenerateMessage(null);

    try {
      const response = await fetch('/api/partner/regenerate-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoDataUrl: logoPreview }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate banners');
      }

      // Update partner state with new banner URLs
      if (partner) {
        setPartner({
          ...partner,
          logoUrl: data.logoUrl,
          qrCodeUrl: data.banners.qrCodeUrl,
          bannerUrl: data.banners.bannerUrl,
          bannerFacebookUrl: data.banners.bannerFacebookUrl,
          bannerFacebookCobrandedUrl: data.banners.bannerFacebookCobrandedUrl,
          bannerTwitterUrl: data.banners.bannerTwitterUrl,
          bannerTwitterCobrandedUrl: data.banners.bannerTwitterCobrandedUrl,
        });
      }

      setLogoPreview(null);
      setBannerRegenerateMessage({ type: 'success', text: 'Banners generated successfully! Scroll down to see your new co-branded banners.' });
    } catch (err) {
      console.error('Error regenerating banners:', err);
      setBannerRegenerateMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to regenerate banners. Please try again.'
      });
    } finally {
      setIsRegeneratingBanners(false);
    }
  };

  // Image category info
  const IMAGE_CATEGORY_INFO: Record<string, { label: string; color: string }> = {
    feature: { label: 'Features', color: 'blue' },
    benefit: { label: 'Benefits', color: 'cyan' },
    social_proof: { label: 'Social Proof', color: 'green' },
    cta: { label: 'Call to Action', color: 'orange' },
    seasonal: { label: 'Seasonal', color: 'purple' },
  };

  // Platform format info
  const PLATFORM_FORMAT_INFO: Record<string, { label: string; desc: string }> = {
    feed_square: { label: 'Square (1:1)', desc: 'Instagram & Facebook Feed' },
    feed_portrait: { label: 'Portrait (4:5)', desc: 'Instagram Optimal' },
    story: { label: 'Story (9:16)', desc: 'IG/TikTok Stories' },
    twitter: { label: 'Twitter (16:9)', desc: 'Twitter/X Posts' },
    linkedin: { label: 'LinkedIn', desc: 'LinkedIn Posts' },
  };

  // Filter templates by segment
  const filteredTemplates = selectedSegment
    ? templates.filter(t => t.segment === selectedSegment)
    : templates;

  // Group templates by segment
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.segment]) {
      acc[template.segment] = [];
    }
    acc[template.segment].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white/50">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
        <Card variant="elevated" className="p-8 max-w-md text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            href="/partner/login"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Return to login
          </Link>
        </Card>
      </div>
    );
  }

  if (!partner) return null;

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] backdrop-blur-md bg-[#0A0B14]/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/assets/images/logo.png" alt="Mind & Muscle" width={40} height={40} className="w-10 h-10" />
              <span className="text-lg font-bold hidden sm:block">Partner Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50 hidden sm:block">
              Welcome, <span className="text-white font-medium">{partner.firstName || partner.name}</span>
            </span>
            <a
              href="https://mindandmuscle.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Website</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <Card variant="elevated" className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">
                    Welcome{partner.firstName ? `, ${partner.firstName}` : ''}! 👋
                  </h2>
                  <p className="text-white/70 mb-4">
                    This is your Partner Dashboard - your central hub for all partner resources, marketing materials, and performance tracking.
                  </p>

                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      About Your Analytics
                    </h3>
                    <p className="text-sm text-white/60">
                      Your referral tracking is powered by <span className="text-white font-medium">Tolt</span>, our affiliate management platform.
                      The earnings, referrals, and payout information you see here are synced from Tolt. For detailed analytics including
                      conversion rates and payout history, visit your{' '}
                      <a
                        href="https://mind-and-muscle.tolt.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Tolt Dashboard
                      </a>.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <a
                      href="mailto:partners@mindandmuscle.ai"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      partners@mindandmuscle.ai
                    </a>
                    <span className="text-white/30">|</span>
                    <span className="text-white/50">Need help? We&apos;re here for you!</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Earnings"
                value={metrics ? `$${metrics.totalEarnings.toFixed(2)}` : '$0.00'}
                icon={<DollarSign className="w-5 h-5" />}
                color="green"
              />
              <StatCard
                label="Pending Payout"
                value={metrics ? `$${metrics.pendingPayout.toFixed(2)}` : '$0.00'}
                icon={<Clock className="w-5 h-5" />}
                color="orange"
              />
              <StatCard
                label="Total Referrals"
                value={metrics?.totalReferrals || 0}
                icon={<Users className="w-5 h-5" />}
                color="blue"
              />
              <StatCard
                label="Link Clicks"
                value={metrics?.totalClicks || 0}
                icon={<MousePointerClick className="w-5 h-5" />}
                color="cyan"
              />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <Card variant="elevated" className="p-4 lg:col-span-2">
                <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Your Referral Link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white/5 px-2 py-1 rounded text-cyan-400 truncate">
                    {partner.referralUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(partner.referralUrl, 'referral-link')}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors"
                  >
                    {copiedId === 'referral-link' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/50" />
                    )}
                  </button>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('templates')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] rounded-xl hover:border-blue-500/30 transition-colors text-left"
                >
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Email Templates</p>
                    <p className="text-xs text-white/50">Send outreach emails</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] rounded-xl hover:border-orange-500/30 transition-colors text-left"
                >
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium">Resources</p>
                    <p className="text-xs text-white/50">PDFs & brand assets</p>
                  </div>
                </button>
                {partner.bannerUrl && (
                  <button
                    onClick={() => downloadFile(partner.bannerUrl!, `${partner.referralSlug}-banner.png`)}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] rounded-xl hover:border-purple-500/30 transition-colors text-left"
                  >
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">Download Banner</p>
                      <p className="text-xs text-white/50">Your custom banner</p>
                    </div>
                  </button>
                )}
                {partner.qrCodeUrl && (
                  <button
                    onClick={() => downloadFile(partner.qrCodeUrl!, `${partner.referralSlug}-qr-code.png`)}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] rounded-xl hover:border-cyan-500/30 transition-colors text-left"
                  >
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <QrCode className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-medium">Download QR Code</p>
                      <p className="text-xs text-white/50">Your referral QR</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Partner Info Card */}
            <div className="grid lg:grid-cols-2 gap-4">
              <Card variant="elevated" className="p-6">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  Your Partner Assets
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {partner.qrCodeUrl && (
                    <div>
                      <p className="text-xs text-white/40 mb-2">QR Code</p>
                      <div className="bg-white p-2 rounded-lg inline-block">
                        <Image
                          src={partner.qrCodeUrl}
                          alt="QR Code"
                          width={100}
                          height={100}
                          className="w-24 h-24"
                          unoptimized
                        />
                      </div>
                      <button
                        onClick={() => downloadFile(partner.qrCodeUrl!, `${partner.referralSlug}-qr-code.png`)}
                        className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  )}
                  {partner.bannerUrl && (
                    <div>
                      <p className="text-xs text-white/40 mb-2">Custom Banner</p>
                      <div className="relative aspect-video bg-white/5 rounded-lg overflow-hidden">
                        <Image
                          src={partner.bannerUrl}
                          alt="Partner Banner"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <button
                        onClick={() => downloadFile(partner.bannerUrl!, `${partner.referralSlug}-banner.png`)}
                        className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              <Card variant="elevated" className="p-6">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Quick Links
                </h3>
                <div className="space-y-3">
                  <a
                    href="https://mind-and-muscle.tolt.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className="text-sm">Tolt Dashboard</span>
                    <ExternalLink className="w-4 h-4 text-white/40" />
                  </a>
                  <a
                    href="/partner-program"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className="text-sm">Partner Program Page</span>
                    <ExternalLink className="w-4 h-4 text-white/40" />
                  </a>
                  <a
                    href={partner.referralUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className="text-sm">Your Referral Link</span>
                    <ExternalLink className="w-4 h-4 text-white/40" />
                  </a>
                </div>
              </Card>
            </div>

            {/* Performance Analytics Section */}
            <Card variant="elevated" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Performance Overview
                </h3>
                <span className="text-xs text-white/40">
                  {metrics?.lastUpdated && `Updated ${new Date(metrics.lastUpdated).toLocaleDateString()}`}
                </span>
              </div>

              {metrics && (metrics.totalReferrals > 0 || metrics.totalEarnings > 0) ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Earnings Chart */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Earnings Summary
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Approved', value: metrics.totalEarnings, fill: '#10b981' },
                          { name: 'Pending', value: metrics.pendingPayout, fill: '#f59e0b' },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="name" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                          <YAxis tick={{ fill: '#ffffff80', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F1123',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value) => [`$${Number(value || 0).toFixed(2)}`, 'Amount']}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-white/50">
                      <span>Total: <span className="text-emerald-400 font-medium">${(metrics.totalEarnings + metrics.pendingPayout).toFixed(2)}</span></span>
                      <span className="text-white/30">30% commission rate</span>
                    </div>
                  </div>

                  {/* Referrals Chart */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      Referral Activity
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { month: 'Start', referrals: 0 },
                          { month: 'Now', referrals: metrics.totalReferrals },
                        ]}>
                          <defs>
                            <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="month" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                          <YAxis tick={{ fill: '#ffffff80', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F1123',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="referrals" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReferrals)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="text-2xl font-bold text-blue-400">{metrics.totalReferrals}</span>
                      <span className="text-xs text-white/50 ml-2">total referrals</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No Activity Yet</h4>
                  <p className="text-sm text-white/50 mb-4 max-w-md mx-auto">
                    Start sharing your referral link to see your performance analytics here.
                    Charts will show your earnings and referral growth over time.
                  </p>
                  <button
                    onClick={() => copyToClipboard(partner.referralUrl, 'referral-link')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium"
                  >
                    Copy Your Referral Link
                  </button>
                </div>
              )}
            </Card>

            {/* Partner Tier & Achievements Section */}
            <Card variant="elevated" className="p-6">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-6 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Partner Status & Achievements
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Tier Progress */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-white/50 mb-1">Current Tier</p>
                      <p className="text-xl font-bold text-blue-400">
                        {(metrics?.totalReferrals || 0) >= 50 ? 'Elite' :
                         (metrics?.totalReferrals || 0) >= 20 ? 'Pro' :
                         (metrics?.totalReferrals || 0) >= 5 ? 'Rising Star' : 'Starter'}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">Progress to next tier</span>
                      <span className="text-white/70">
                        {metrics?.totalReferrals || 0} / {
                          (metrics?.totalReferrals || 0) >= 50 ? '50' :
                          (metrics?.totalReferrals || 0) >= 20 ? '50' :
                          (metrics?.totalReferrals || 0) >= 5 ? '20' : '5'
                        } referrals
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((metrics?.totalReferrals || 0) /
                            ((metrics?.totalReferrals || 0) >= 50 ? 50 :
                             (metrics?.totalReferrals || 0) >= 20 ? 50 :
                             (metrics?.totalReferrals || 0) >= 5 ? 20 : 5)
                          ) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40">
                      {(metrics?.totalReferrals || 0) >= 50
                        ? 'You\'ve reached the highest tier! Thank you for your partnership.'
                        : `${
                            (metrics?.totalReferrals || 0) >= 20 ? 50 - (metrics?.totalReferrals || 0) :
                            (metrics?.totalReferrals || 0) >= 5 ? 20 - (metrics?.totalReferrals || 0) :
                            5 - (metrics?.totalReferrals || 0)
                          } more referrals to unlock ${
                            (metrics?.totalReferrals || 0) >= 20 ? 'Elite' :
                            (metrics?.totalReferrals || 0) >= 5 ? 'Pro' : 'Rising Star'
                          } status`
                      }
                    </p>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-white/5 rounded-xl p-5">
                  <h4 className="text-sm font-medium mb-4">Achievements</h4>
                  <div className="space-y-3">
                    {/* First Referral Badge */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      (metrics?.totalReferrals || 0) >= 1 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 opacity-50'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        (metrics?.totalReferrals || 0) >= 1 ? 'bg-emerald-500' : 'bg-white/10'
                      }`}>
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">First Referral</p>
                        <p className="text-xs text-white/50">Get your first customer sign-up</p>
                      </div>
                      {(metrics?.totalReferrals || 0) >= 1 && (
                        <Check className="w-5 h-5 text-emerald-400 ml-auto" />
                      )}
                    </div>

                    {/* First $100 Badge */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      (metrics?.totalEarnings || 0) >= 100 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5 opacity-50'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        (metrics?.totalEarnings || 0) >= 100 ? 'bg-amber-500' : 'bg-white/10'
                      }`}>
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Century Club</p>
                        <p className="text-xs text-white/50">Earn $100 in commissions</p>
                      </div>
                      {(metrics?.totalEarnings || 0) >= 100 && (
                        <Check className="w-5 h-5 text-amber-400 ml-auto" />
                      )}
                    </div>

                    {/* 10 Referrals Badge */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      (metrics?.totalReferrals || 0) >= 10 ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5 opacity-50'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        (metrics?.totalReferrals || 0) >= 10 ? 'bg-blue-500' : 'bg-white/10'
                      }`}>
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Top Performer</p>
                        <p className="text-xs text-white/50">Refer 10+ customers</p>
                      </div>
                      {(metrics?.totalReferrals || 0) >= 10 && (
                        <Check className="w-5 h-5 text-blue-400 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            {/* Header with Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  Earnings History
                </h2>
                <p className="text-sm text-white/50 mt-1">
                  Track your commissions and payment status
                </p>
              </div>
              <button
                onClick={exportEarningsCSV}
                disabled={earningsHistory.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card variant="elevated" className="p-4 text-center">
                <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">${(metrics?.totalEarnings || 0).toFixed(2)}</p>
                <p className="text-xs text-white/50">Total Earned</p>
              </Card>
              <Card variant="elevated" className="p-4 text-center">
                <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-400">${(metrics?.pendingPayout || 0).toFixed(2)}</p>
                <p className="text-xs text-white/50">Pending</p>
              </Card>
              <Card variant="elevated" className="p-4 text-center">
                <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{metrics?.totalReferrals || 0}</p>
                <p className="text-xs text-white/50">Referrals</p>
              </Card>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'approved', 'paid'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setEarningsFilter(status)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    earningsFilter === status
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Transactions Table */}
            <Card variant="bordered" className="overflow-hidden">
              {earningsLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-white/40 animate-spin mx-auto" />
                  <p className="text-white/50 mt-3">Loading earnings history...</p>
                </div>
              ) : earningsHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <Wallet className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">No earnings yet</p>
                  <p className="text-sm text-white/30 mt-1">
                    Start sharing your referral link to earn commissions!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5">
                      <tr className="text-left text-white/50">
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium hidden sm:table-cell">Customer</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(earningsFilter === 'all'
                        ? earningsHistory
                        : earningsHistory.filter(t => t.status === earningsFilter)
                      ).map(transaction => (
                        <tr key={transaction.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-white">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-medium text-white">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : transaction.status === 'approved'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : transaction.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                transaction.status === 'paid'
                                  ? 'bg-emerald-400'
                                  : transaction.status === 'approved'
                                  ? 'bg-blue-400'
                                  : transaction.status === 'pending'
                                  ? 'bg-amber-400'
                                  : 'bg-red-400'
                              }`} />
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/50 hidden sm:table-cell">
                            {transaction.customerEmail || '—'}
                          </td>
                          <td className="px-4 py-3 text-white/50 hidden md:table-cell">
                            {transaction.paidAt ? new Date(transaction.paidAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(earningsFilter !== 'all' &&
                    earningsHistory.filter(t => t.status === earningsFilter).length === 0) && (
                    <div className="p-8 text-center">
                      <p className="text-white/50">No {earningsFilter} transactions</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Payout Info */}
            <Card variant="bordered" className="p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Payout Information</h3>
              <div className="space-y-2 text-sm text-white/60">
                <p>• Commissions are tracked automatically through your referral link</p>
                <p>• Pending commissions become approved after the customer&apos;s refund period expires</p>
                <p>• Payouts are processed monthly via PayPal or bank transfer</p>
                <p>• Minimum payout threshold: $50</p>
              </div>
            </Card>
          </div>
        )}

        {/* Email Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Recipient Info Form */}
            <Card variant="elevated" className="p-5">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Recipient Info (Optional)
              </h2>
              <p className="text-xs text-white/40 mb-4">Fill in recipient details to auto-populate placeholders in templates</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={recipientInfo.firstName}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pl-9 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
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
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pl-9 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
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
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pl-9 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Email Format Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Email Templates</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/50">Format:</span>
                <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-xl border border-white/10">
                  <button
                    onClick={() => setEmailFormat('html')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      emailFormat === 'html'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    HTML
                  </button>
                  <button
                    onClick={() => setEmailFormat('plain')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      emailFormat === 'plain'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Plain Text
                  </button>
                </div>
              </div>
            </div>

            {/* Segment Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSegment(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedSegment
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                All Templates
              </button>
              {Object.entries(SEGMENT_INFO).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSegment(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSegment === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
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
                  <div className="flex items-center gap-2 mb-4">
                    {SEGMENT_INFO[segment]?.icon}
                    <h3 className="text-lg font-semibold">{SEGMENT_INFO[segment]?.label || segment}</h3>
                  </div>
                  <div className="grid gap-4">
                    {segmentTemplates.sort((a, b) => a.sequence_step - b.sequence_step).map(template => {
                      const isHtml = template.body_template.includes('<html') || template.body_template.includes('<!DOCTYPE');
                      const previewText = getCleanTextFromHtml(replaceAllPlaceholders(template.body_template)).slice(0, 200);

                      return (
                        <Card key={`${template.segment}-${template.sequence_step}`} variant="default" className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Email {template.sequence_step}</span>
                                {isHtml && emailFormat === 'html' && (
                                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded flex items-center gap-1">
                                    <FileCode className="w-3 h-3" /> HTML
                                  </span>
                                )}
                                {emailFormat === 'plain' && (
                                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Plain Text
                                  </span>
                                )}
                              </div>
                              <h4 className="font-medium mb-2 truncate">{replaceAllPlaceholders(template.subject_line)}</h4>
                              <p className="text-sm text-white/50 line-clamp-2">{previewText}...</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => setPreviewTemplate(template)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4 text-white/50" />
                              </button>
                              <button
                                onClick={() => copyTemplateContent(template, 'subject')}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Copy Subject"
                              >
                                {copiedId === `subject-${template.segment}-${template.sequence_step}` ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-white/50" />
                                )}
                              </button>
                              <button
                                onClick={() => copyTemplateContent(template, 'body')}
                                className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                  emailFormat === 'plain'
                                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                                }`}
                              >
                                {copiedId === `body-${template.segment}-${template.sequence_step}` ? (
                                  <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Copied</span>
                                ) : (
                                  emailFormat === 'plain' ? 'Copy Plain Text' : 'Copy Email'
                                )}
                              </button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Social Media Posts</h2>
                <p className="text-sm text-white/50 mt-1">Ready-to-use posts for your social media channels</p>
              </div>
            </div>

            {/* Platform Filter */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(SOCIAL_PLATFORM_INFO).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSocialPlatformFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    socialPlatformFilter === key
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {info.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSocialCategoryFilter(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !socialCategoryFilter
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                All Categories
              </button>
              {Object.entries(SOCIAL_CATEGORY_INFO).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSocialCategoryFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    socialCategoryFilter === key
                      ? `bg-${info.color}-500/30 text-${info.color}-400 border border-${info.color}-500/30`
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {info.label}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid gap-4">
              {filteredSocialTemplates.map(template => {
                const charCount = getSocialPostCharCount(template);
                const isOverTwitterLimit = charCount > 280;
                const categoryInfo = SOCIAL_CATEGORY_INFO[template.category];
                const isExpanded = expandedSocialPost === template.id;
                const previewText = template.body.replace(/\{referral_link\}/g, partner?.referralUrl || '[your-link]');

                return (
                  <Card key={template.id} variant="default" className="p-4 hover:border-cyan-500/30 transition-colors">
                    <div className="flex flex-col gap-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-medium text-sm">{template.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded bg-${categoryInfo.color}-500/20 text-${categoryInfo.color}-400`}>
                              {categoryInfo.label}
                            </span>
                            {template.platform !== 'all' && (
                              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">
                                {SOCIAL_PLATFORM_INFO[template.platform]?.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <span>{charCount} characters</span>
                            {isOverTwitterLimit && (
                              <span className="text-orange-400 flex items-center gap-1">
                                (exceeds Twitter limit)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Preview / Full Content */}
                      <div
                        className={`text-sm text-white/70 whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}
                      >
                        {previewText}
                      </div>

                      {/* Hashtags */}
                      {template.hashtags && template.hashtags.length > 0 && isExpanded && (
                        <div className="flex flex-wrap gap-1">
                          {template.hashtags.map(tag => (
                            <span key={tag} className="text-xs text-cyan-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => setExpandedSocialPost(isExpanded ? null : template.id)}
                          className="text-xs text-white/50 hover:text-white/70 transition-colors"
                        >
                          {isExpanded ? 'Show less' : 'Show full post'}
                        </button>
                        <div className="flex items-center gap-2">
                          {template.hashtags && template.hashtags.length > 0 && (
                            <button
                              onClick={() => copySocialTemplate(template, true)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-colors text-xs font-medium"
                            >
                              {copiedId === `social-${template.id}-hashtags` ? (
                                <span className="flex items-center gap-1 text-green-400"><Check className="w-3 h-3" /> Copied</span>
                              ) : (
                                '+ Hashtags'
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => copySocialTemplate(template, false)}
                            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors text-xs font-medium"
                          >
                            {copiedId === `social-${template.id}` ? (
                              <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                            ) : (
                              <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy Post</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredSocialTemplates.length === 0 && (
              <Card variant="bordered" className="p-6 text-center">
                <p className="text-white/50">No templates match your filters</p>
              </Card>
            )}
          </div>
        )}

        {/* Social Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Professional Social Images
              </h2>
              <p className="text-sm text-white/50 mt-1">
                Agency-quality graphics ready to download. Post to social media and add your referral link.
              </p>
            </div>

            {/* Info Banner */}
            <Card variant="bordered" className="p-4 bg-purple-500/10 border-purple-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-purple-300">How to Use These Images</h3>
                  <p className="text-xs text-white/60 mt-1">
                    <strong className="text-white/80">1. Download</strong> - Choose a template and select your platform size.{' '}
                    <strong className="text-white/80">2. Post</strong> - Share to Instagram, Facebook, Twitter, or LinkedIn.{' '}
                    <strong className="text-white/80">3. Add your link</strong> - Put your referral URL in the post caption or bio.
                    Images get 2-3x more engagement than text links!
                  </p>
                </div>
              </div>
            </Card>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setImagesCategoryFilter(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !imagesCategoryFilter
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                All Categories
              </button>
              {Object.entries(IMAGE_CATEGORY_INFO).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setImagesCategoryFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    imagesCategoryFilter === key
                      ? `bg-${info.color}-500/30 text-${info.color}-400 border border-${info.color}-500/30`
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {info.label}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImageTemplates.map(template => {
                const categoryInfo = IMAGE_CATEGORY_INFO[template.category];

                return (
                  <Card
                    key={template.id}
                    variant="default"
                    className="overflow-hidden hover:border-purple-500/30 transition-colors group"
                  >
                    {/* Preview Area */}
                    <div className="relative aspect-square bg-gradient-to-br from-slate-800 to-slate-900">
                      <Image
                        src={getStaticImageUrl(template.id, 'feed_square')}
                        alt={template.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />

                      {/* Badge */}
                      {template.badgeText && (
                        <div className="absolute top-2 left-2">
                          <span className={`text-xs px-2 py-0.5 rounded bg-${categoryInfo.color}-500/80 text-white font-medium`}>
                            {template.badgeText}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedImageTemplate(template)}
                          className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadFile(getStaticImageUrl(template.id, downloadFormat), `${template.id}-${downloadFormat}.png`)}
                          className="px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-sm line-clamp-1">{template.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded bg-${categoryInfo.color}-500/20 text-${categoryInfo.color}-400 shrink-0`}>
                          {categoryInfo.label}
                        </span>
                      </div>

                      {/* Platform badges */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.bestFor.slice(0, 3).map(platform => (
                          <span key={platform} className="text-xs px-1.5 py-0.5 bg-white/5 text-white/50 rounded">
                            {platform}
                          </span>
                        ))}
                        {template.bestFor.length > 3 && (
                          <span className="text-xs text-white/40">+{template.bestFor.length - 3}</span>
                        )}
                      </div>

                      {/* Download dropdown - always show */}
                      <div className="flex items-center gap-2">
                        <select
                          value={downloadFormat}
                          onChange={(e) => setDownloadFormat(e.target.value)}
                          className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/70"
                        >
                          {Object.entries(PLATFORM_FORMAT_INFO).map(([key, info]) => (
                            <option key={key} value={key} className="bg-slate-900">
                              {info.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => downloadFile(getStaticImageUrl(template.id, downloadFormat), `${template.id}-${downloadFormat}.png`)}
                          className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredImageTemplates.length === 0 && (
              <Card variant="bordered" className="p-8 text-center">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 mb-2">No templates match your filter</p>
                <button
                  onClick={() => setImagesCategoryFilter(null)}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Clear filter
                </button>
              </Card>
            )}

            {/* Image Preview Modal */}
            {selectedImageTemplate && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedImageTemplate(null)}
              >
                <div
                  className="bg-[#0F1123] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div>
                      <h3 className="font-semibold">{selectedImageTemplate.name}</h3>
                      <p className="text-sm text-white/50">{selectedImageTemplate.headline.replace('\n', ' ')}</p>
                    </div>
                    <button
                      onClick={() => setSelectedImageTemplate(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Image Preview */}
                  <div className="p-4">
                    <div className="relative aspect-square max-w-xl mx-auto bg-slate-800 rounded-lg overflow-hidden">
                      <Image
                        src={getStaticImageUrl(selectedImageTemplate.id, downloadFormat)}
                        alt={selectedImageTemplate.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border-t border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/50">Format:</span>
                      <select
                        value={downloadFormat}
                        onChange={(e) => setDownloadFormat(e.target.value)}
                        className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm"
                      >
                        {Object.entries(PLATFORM_FORMAT_INFO).map(([key, info]) => (
                          <option key={key} value={key} className="bg-slate-900">
                            {info.label} - {info.desc}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadFile(getStaticImageUrl(selectedImageTemplate.id, downloadFormat), `${selectedImageTemplate.id}-${downloadFormat}.png`)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-8">
            {/* PDFs */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Program Guides & PDFs
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {STATIC_RESOURCES.filter(r => r.category === 'pdf').map(resource => (
                  <Card key={resource.id} variant="default" className="p-4 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-xs text-white/50 mb-3">{resource.description}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setPreviewPdf(resource)}
                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                          >
                            <Eye className="w-3 h-3" /> Preview
                          </button>
                          <button
                            onClick={() => downloadFile(resource.fileUrl, `${resource.title}.pdf`)}
                            className="flex items-center gap-1 text-xs text-white/50 hover:text-white/70"
                          >
                            <Download className="w-3 h-3" /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Brand Assets */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" />
                Brand Assets
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {STATIC_RESOURCES.filter(r => r.category === 'brand').map(resource => (
                  <Card key={resource.id} variant="default" className="p-4 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
                        <Palette className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-xs text-white/50 mb-3">{resource.description}</p>
                        )}
                        <button
                          onClick={() => downloadFile(resource.fileUrl, resource.title)}
                          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                        >
                          <Download className="w-3 h-3" /> Download
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Your Assets Tab */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            {/* Referral Link */}
            <Card variant="elevated" className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-blue-400" />
                Your Referral Link
              </h2>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-white/5 px-4 py-3 rounded-lg text-cyan-400 text-sm overflow-x-auto">
                  {partner.referralUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(partner.referralUrl, 'assets-referral-link')}
                  className="shrink-0 flex items-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors font-medium"
                >
                  {copiedId === 'assets-referral-link' ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </Card>

            {/* Logo Upload Section - Show if partner doesn't have co-branded banners */}
            {!partner.bannerFacebookCobrandedUrl && (
              <Card variant="bordered" className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left side - Info and Upload */}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-amber-400" />
                      Get Custom Co-Branded Banners
                    </h2>
                    <p className="text-sm text-white/70 mb-4">
                      Upload your organization&apos;s logo to get personalized banners featuring both your brand and Mind &amp; Muscle.
                      Co-branded banners build trust and help your audience recognize you!
                    </p>

                    {/* Message display */}
                    {bannerRegenerateMessage && (
                      <div className={`p-3 rounded-lg mb-4 text-sm ${
                        bannerRegenerateMessage.type === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {bannerRegenerateMessage.text}
                      </div>
                    )}

                    {/* Logo preview */}
                    {(logoPreview || partner.logoUrl) && (
                      <div className="mb-4">
                        <p className="text-xs text-white/50 mb-2">Your logo:</p>
                        <div className="inline-flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                          <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                            <Image
                              src={logoPreview || partner.logoUrl!}
                              alt="Your logo"
                              width={64}
                              height={64}
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                          {logoPreview && (
                            <button
                              onClick={() => setLogoPreview(null)}
                              className="text-xs text-white/50 hover:text-white/70"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Upload and generate buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                          <Upload className="w-4 h-4" />
                          {logoPreview || partner.logoUrl ? 'Change Logo' : 'Upload Logo'}
                        </span>
                      </label>

                      <button
                        onClick={regenerateBanners}
                        disabled={isRegeneratingBanners || (!logoPreview && !partner.logoUrl)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
                      >
                        {isRegeneratingBanners ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate My Banners
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-white/40 mt-3">
                      Recommended: Square logo (at least 200x200px), PNG or JPG format
                    </p>
                  </div>

                  {/* Right side - Example banner */}
                  <div className="lg:w-80 shrink-0">
                    <p className="text-xs text-white/50 mb-2 text-center lg:text-left">Example co-branded banner:</p>
                    <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-white/10">
                      <Image
                        src="https://api.mindandmuscle.ai/storage/v1/object/public/partner-banners/samples/sample-cobranded-banner.png"
                        alt="Example co-branded banner with partner logo"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <p className="text-xs text-white/40 mt-2 text-center">
                      Your logo appears in the corner with your QR code
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Option to regenerate banners if they already have co-branded banners */}
            {partner.bannerFacebookCobrandedUrl && (
              <Card variant="default" className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {partner.logoUrl ? (
                      <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                        <Image
                          src={partner.logoUrl}
                          alt="Your logo"
                          width={40}
                          height={40}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Palette className="w-5 h-5 text-amber-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Your banners include your logo</p>
                      <p className="text-xs text-white/50">Want to update your logo? Upload a new one and regenerate.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
                        <Upload className="w-3 h-3" />
                        {partner.logoUrl ? 'New Logo' : 'Upload Logo'}
                      </span>
                    </label>
                    {logoPreview && (
                      <button
                        onClick={regenerateBanners}
                        disabled={isRegeneratingBanners}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 rounded-lg text-xs font-medium text-white transition-colors"
                      >
                        {isRegeneratingBanners ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Regenerate
                      </button>
                    )}
                  </div>
                </div>
                {bannerRegenerateMessage && (
                  <div className={`mt-3 p-2 rounded-lg text-xs ${
                    bannerRegenerateMessage.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {bannerRegenerateMessage.text}
                  </div>
                )}
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Partner Banner */}
              <Card variant="elevated" className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Partner Banner
                </h2>
                {partner.bannerUrl ? (
                  <div>
                    <div className="relative aspect-video bg-white/5 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={partner.bannerUrl}
                        alt="Partner Banner"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <button
                      onClick={() => downloadFile(partner.bannerUrl!, `${partner.referralSlug}-banner.png`)}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors font-medium"
                    >
                      <Download className="w-5 h-5" />
                      Download Banner
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/40">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No partner banner available yet</p>
                  </div>
                )}
              </Card>

              {/* QR Code */}
              <Card variant="elevated" className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-cyan-400" />
                  Your QR Code
                </h2>
                {partner.qrCodeUrl ? (
                  <div>
                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-4 rounded-xl">
                        <Image
                          src={partner.qrCodeUrl}
                          alt="QR Code"
                          width={200}
                          height={200}
                          className="w-48 h-48"
                          unoptimized
                        />
                      </div>
                    </div>
                    <p className="text-center text-xs text-white/50 mb-4">
                      Scans to: {partner.referralUrl}
                    </p>
                    <button
                      onClick={() => downloadFile(partner.qrCodeUrl!, `${partner.referralSlug}-qr-code.png`)}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors font-medium"
                    >
                      <Download className="w-5 h-5" />
                      Download QR Code
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/40">
                    <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No QR code available yet</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Social Media Banners */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-400" />
                Social Media Banners
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Facebook Banner */}
                <Card variant="default" className="p-4">
                  <h3 className="font-medium text-sm mb-3 text-blue-400">Facebook</h3>
                  {partner.bannerFacebookUrl ? (
                    <div>
                      <div className="relative aspect-video bg-white/5 rounded-lg overflow-hidden mb-3">
                        <Image
                          src={partner.bannerFacebookUrl}
                          alt="Facebook Banner"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <button
                        onClick={() => downloadFile(partner.bannerFacebookUrl!, `${partner.referralSlug}-facebook.png`)}
                        className="flex items-center justify-center gap-1 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-xs font-medium"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-white/30 text-xs">Not available</div>
                  )}
                </Card>

                {/* Facebook Co-branded */}
                <Card variant="default" className="p-4">
                  <h3 className="font-medium text-sm mb-3 text-blue-400">Facebook (Co-branded)</h3>
                  {partner.bannerFacebookCobrandedUrl ? (
                    <div>
                      <div className="relative aspect-video bg-white/5 rounded-lg overflow-hidden mb-3">
                        <Image
                          src={partner.bannerFacebookCobrandedUrl}
                          alt="Facebook Co-branded Banner"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <button
                        onClick={() => downloadFile(partner.bannerFacebookCobrandedUrl!, `${partner.referralSlug}-facebook-cobranded.png`)}
                        className="flex items-center justify-center gap-1 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-xs font-medium"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-white/30 text-xs">Not available</div>
                  )}
                </Card>

                {/* Twitter Banner */}
                <Card variant="default" className="p-4">
                  <h3 className="font-medium text-sm mb-3 text-cyan-400">Twitter/X</h3>
                  {partner.bannerTwitterUrl ? (
                    <div>
                      <div className="relative aspect-video bg-white/5 rounded-lg overflow-hidden mb-3">
                        <Image
                          src={partner.bannerTwitterUrl}
                          alt="Twitter Banner"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <button
                        onClick={() => downloadFile(partner.bannerTwitterUrl!, `${partner.referralSlug}-twitter.png`)}
                        className="flex items-center justify-center gap-1 w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors text-xs font-medium"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-white/30 text-xs">Not available</div>
                  )}
                </Card>

                {/* Twitter Co-branded */}
                <Card variant="default" className="p-4">
                  <h3 className="font-medium text-sm mb-3 text-cyan-400">Twitter/X (Co-branded)</h3>
                  {partner.bannerTwitterCobrandedUrl ? (
                    <div>
                      <div className="relative aspect-video bg-white/5 rounded-lg overflow-hidden mb-3">
                        <Image
                          src={partner.bannerTwitterCobrandedUrl}
                          alt="Twitter Co-branded Banner"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <button
                        onClick={() => downloadFile(partner.bannerTwitterCobrandedUrl!, `${partner.referralSlug}-twitter-cobranded.png`)}
                        className="flex items-center justify-center gap-1 w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors text-xs font-medium"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-white/30 text-xs">Not available</div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Email Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">Email Preview</h3>
                <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                  emailFormat === 'plain'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {emailFormat === 'plain' ? (
                    <><FileText className="w-3 h-3" /> Plain Text</>
                  ) : (
                    <><FileCode className="w-3 h-3" /> HTML</>
                  )}
                </span>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subject */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-xs text-white/40 mb-1">Subject:</p>
              <p className="font-medium">{replaceAllPlaceholders(previewTemplate.subject_line)}</p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-4">
              {emailFormat === 'plain' ? (
                <div className="whitespace-pre-wrap text-white/80 font-mono text-sm bg-white/5 p-4 rounded-lg">
                  {getCleanTextFromHtml(replaceAllPlaceholders(previewTemplate.body_template))}
                </div>
              ) : previewTemplate.body_template.includes('<html') || previewTemplate.body_template.includes('<!DOCTYPE') ? (
                <iframe
                  srcDoc={replaceAllPlaceholders(previewTemplate.body_template)}
                  className="w-full h-full min-h-[500px] bg-white rounded-lg"
                  title="Email Preview"
                />
              ) : (
                <div className="whitespace-pre-wrap text-white/80">
                  {replaceAllPlaceholders(previewTemplate.body_template)}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
              <button
                onClick={() => copyTemplateContent(previewTemplate, 'subject')}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
              >
                {copiedId === `subject-${previewTemplate.segment}-${previewTemplate.sequence_step}` ? 'Copied!' : 'Copy Subject'}
              </button>
              <button
                onClick={() => copyTemplateContent(previewTemplate, 'body')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  emailFormat === 'plain'
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {copiedId === `body-${previewTemplate.segment}-${previewTemplate.sequence_step}`
                  ? 'Copied!'
                  : emailFormat === 'plain' ? 'Copy Plain Text' : 'Copy Body'}
              </button>
              <button
                onClick={() => copyTemplateContent(previewTemplate, 'both')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  emailFormat === 'plain'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {copiedId === `both-${previewTemplate.segment}-${previewTemplate.sequence_step}` ? 'Copied!' : 'Copy Both'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl max-h-[95vh] bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">{previewPdf.title}</h3>
              </div>
              <button
                onClick={() => setPreviewPdf(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-auto bg-white/5">
              <iframe
                src={`${previewPdf.fileUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full min-h-[70vh]"
                title={previewPdf.title}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                Having trouble viewing? Click download to save the PDF.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={previewPdf.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </a>
                <button
                  onClick={() => downloadFile(previewPdf.fileUrl, `${previewPdf.title}.pdf`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading fallback for Suspense
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-white/50">Loading dashboard...</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function PartnerDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
