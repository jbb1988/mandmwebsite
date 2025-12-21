'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Turnstile } from '@marsidev/react-turnstile';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { GradientTextReveal } from '@/components/animations';
import { EnhancedEarningsCalculator } from '@/components/partner/EnhancedEarningsCalculator';
import { DollarSign, TrendingUp, Users, Gift, BarChart, Rocket, Check, Link2, Star, Zap, Target, Award, BookOpen, Sparkles, Clock, Trophy, ChevronDown, GraduationCap, Briefcase, UserPlus, Building2, Upload, X, ArrowRight, Video, Brain, Apple, LineChart } from 'lucide-react';

// Component that handles URL search params
function SearchParamsHandler({
  onSourceChange,
  onTypeChange
}: {
  onSourceChange: (source: string) => void;
  onTypeChange: (type: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const typeParam = searchParams.get('type');
    const sourceParam = searchParams.get('source');

    if (sourceParam) {
      onSourceChange(sourceParam);
    }

    if (typeParam) {
      onTypeChange(typeParam);
    }
  }, [searchParams, onSourceChange, onTypeChange]);

  return null;
}

export default function PartnerProgramPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    audience: '',
    networkSize: '',
    promotionChannel: '',
    whyExcited: '',
  });

  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Handlers for URL params (wrapped in Suspense below)
  const handleSourceChange = React.useCallback((newSource: string) => {
    setSource(newSource);
  }, []);

  const handleTypeChange = React.useCallback((type: string) => {
    if (type === 'facility' && !formData.promotionChannel) {
      setFormData(prev => ({ ...prev, promotionChannel: 'facility' }));
    }
  }, [formData.promotionChannel]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, SVG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo file must be less than 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      alert('Please complete the security verification.');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('organization', formData.organization);
      submitData.append('audience', formData.audience);
      submitData.append('networkSize', formData.networkSize);
      submitData.append('promotionChannel', formData.promotionChannel);
      submitData.append('whyExcited', formData.whyExcited);
      submitData.append('turnstileToken', captchaToken);
      if (source) {
        submitData.append('source', source);
      }

      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      const response = await fetch('/api/partner-application', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setFormData({ name: '', email: '', organization: '', audience: '', networkSize: '', promotionChannel: '', whyExcited: '' });
        setCaptchaToken('');
        removeLogo();
      } else {
        const data = await response.json();
        alert(data.error || 'There was an error submitting your application. Please try again.');
      }
    } catch (error) {
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqs = [
    {
      question: 'How much can I really earn?',
      answer: 'You earn 10% commission on every 6-month payment (15% on users 101+ for organizations). Customers subscribe for 6 months at a time. Examples per 6-month subscription: Individual referrals = $7.90 each. 12-user team = $85.32 total. 150-user facility = $930.29 per payment. If they renew after 6 months, you earn commission again - so annual potential doubles (2 payments = 2x commission).'
    },
    {
      question: 'How does the referral tracking work?',
      answer: 'We use Tolt, a professional affiliate tracking platform, to manage your referral link and commissions. When you sign up, we automatically create your unique referral link and send it to you via email along with a QR code and co-branded marketing banners. When someone clicks your unique tracking link, Tolt sets a 90-day cookie to track the conversion.'
    },
    {
      question: 'What if I know facility owners or league directors?',
      answer: 'Perfect! One training facility or travel ball organization can generate more recurring income than dozens of individual referrals. Focus on organizations with 100+ users to unlock 15% commission on the volume above 100.'
    },
    {
      question: 'How do payouts work?',
      answer: 'You earn 10% commission each time a referral pays for a subscription. Commissions are held for 60 days after payment clears (standard industry practice to protect against chargebacks), then paid automatically via PayPal. There\'s a $50 minimum threshold.'
    },
    {
      question: 'Do I need to be a coach to join?',
      answer: 'Not at all! We welcome coaches, facility owners, athletic directors, sports bloggers, influencers, parents, and anyone with connections to the youth sports community.'
    },
    {
      question: 'How long does approval take?',
      answer: 'Instant! When you submit your application, you\'re automatically approved and your referral link is created immediately. Check your email for your unique referral link, QR code, and co-branded marketing banners.'
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Apply',
      description: 'Fill out the application form below (takes 2 minutes)',
    },
    {
      number: '2',
      title: 'Instantly Approved',
      description: 'Your referral link and marketing banners are created automatically',
    },
    {
      number: '3',
      title: 'Check Your Email',
      description: 'Receive your unique referral link, QR code, and co-branded banners',
    },
    {
      number: '4',
      title: 'Start Earning',
      description: 'Share your link and earn 10% base + 15% bonus at 100+ users',
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Handle URL search params (wrapped in Suspense for Next.js 15) */}
      <Suspense fallback={null}>
        <SearchParamsHandler
          onSourceChange={handleSourceChange}
          onTypeChange={handleTypeChange}
        />
      </Suspense>

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

      {/* ============================================= */}
      {/* SECTION 1: HERO - Value-First Messaging */}
      {/* ============================================= */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <div className="inline-block mb-8">
          <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-6 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-neon-cortex-blue drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
              <span className="text-base md:text-lg font-bold">PARTNER PROGRAM</span>
            </div>
          </LiquidGlass>
        </div>

        <GradientTextReveal
          text="Extend Training Beyond the Facility"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />

        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-12">
          Mind & Muscle helps facilities, coaches, and teams keep athletes progressing between sessions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <LiquidButton
            variant="orange"
            size="lg"
            onClick={() => scrollToSection('facilities')}
            className="!bg-gradient-to-r !from-solar-surge-orange !to-muscle-primary !shadow-[0_0_30px_rgba(251,146,60,0.6)] hover:!shadow-[0_0_40px_rgba(251,146,60,0.8)] !border-solar-surge-orange/60 !text-white !font-bold !text-lg"
          >
            Become a Partner
          </LiquidButton>
          <button
            onClick={() => scrollToSection('facilities')}
            className="text-neon-cortex-blue hover:text-white transition-colors font-medium flex items-center gap-2"
          >
            See how it works for your role
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================= */}
      {/* SECTION 2: AUDIENCE SELECTOR CARDS */}
      {/* ============================================= */}
      <div className="max-w-5xl mx-auto mb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Facilities Card */}
          <button
            onClick={() => scrollToSection('facilities')}
            className="text-left group"
          >
            <LiquidGlass variant="orange" glow={true} className="p-8 h-full transition-all group-hover:scale-[1.02]">
              <div className="flex flex-col items-center text-center">
                <div className="inline-block p-4 rounded-xl bg-solar-surge-orange/20 mb-4">
                  <Building2 className="w-10 h-10 text-solar-surge-orange" />
                </div>
                <h3 className="text-2xl font-black mb-2">Training Facilities</h3>
                <p className="text-text-secondary text-sm mb-4">Batting cages, academies, indoor facilities</p>
                <span className="text-solar-surge-orange font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Facility Use Case <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </LiquidGlass>
          </button>

          {/* Coaches Card */}
          <button
            onClick={() => scrollToSection('coaches')}
            className="text-left group"
          >
            <LiquidGlass variant="blue" glow={true} className="p-8 h-full transition-all group-hover:scale-[1.02]">
              <div className="flex flex-col items-center text-center">
                <div className="inline-block p-4 rounded-xl bg-neon-cortex-blue/20 mb-4">
                  <Users className="w-10 h-10 text-neon-cortex-blue" />
                </div>
                <h3 className="text-2xl font-black mb-2">Coaches & Instructors</h3>
                <p className="text-text-secondary text-sm mb-4">Private coaches, team trainers</p>
                <span className="text-neon-cortex-blue font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Coach Use Case <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </LiquidGlass>
          </button>

          {/* Teams & Training Creators Card */}
          <button
            onClick={() => scrollToSection('teams')}
            className="text-left group"
          >
            <LiquidGlass variant="orange" glow={true} className="p-8 h-full transition-all group-hover:scale-[1.02]">
              <div className="flex flex-col items-center text-center">
                <div className="inline-block p-4 rounded-xl bg-solar-surge-orange/20 mb-4">
                  <Star className="w-10 h-10 text-solar-surge-orange" />
                </div>
                <h3 className="text-2xl font-black mb-2">Teams & Training Creators</h3>
                <p className="text-text-secondary text-sm mb-4">Travel teams, orgs, training creators</p>
                <span className="text-solar-surge-orange font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Team Use Case <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </LiquidGlass>
          </button>
        </div>
      </div>

      {/* ============================================= */}
      {/* SECTION 3: FACILITIES (Largest Section) */}
      {/* ============================================= */}
      <div id="facilities" className="max-w-7xl mx-auto mb-24 scroll-mt-32">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <LiquidGlass variant="orange" rounded="full" padding="none" glow={true} className="px-4 py-2">
              <span className="text-sm font-bold text-solar-surge-orange">FOR TRAINING FACILITIES</span>
            </LiquidGlass>
          </div>

          <GradientTextReveal
            text="Turn Every Lesson Into Ongoing Training"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight"
            gradientFrom="#F97316"
            gradientTo="#0EA5E9"
            delay={0.2}
          />

          <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed mb-4">
            Increase athlete retention by extending coaching value beyond the facility.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
            Most training happens outside the cage. Mind & Muscle ensures your coaching continues between visits.
          </p>

          {/* Retention Benefits */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 max-w-3xl mx-auto">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-solar-surge-orange"></span>
              Athletes stay engaged with your facility between lessons
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-solar-surge-orange"></span>
              Parents see progress outside paid sessions
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-solar-surge-orange"></span>
              Programs feel more complete, increasing repeat visits
            </span>
          </div>
        </div>

        {/* Facility Banner */}
        <LiquidGlass variant="orange" glow={true} className="p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-3xl sm:text-4xl font-black mb-4">
                <span className="text-white">Your Facility</span>
                <span className="text-solar-surge-orange"> × </span>
                <span className="bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue bg-clip-text text-transparent">Mind & Muscle</span>
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Facilities use Mind & Muscle to extend lesson impact—not replace lessons. Athletes continue developing between visits, making your instruction more valuable.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image
                src="/assets/images/logo.png"
                alt="Mind & Muscle"
                width={150}
                height={150}
                className="opacity-90"
              />
            </div>
          </div>
        </LiquidGlass>

        {/* 4-Bullet Value Grid - Order: Retention → Value → Zero Staff → Revenue */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <LiquidGlass variant="blue" className="p-6 text-center">
            <div className="inline-block p-3 rounded-xl bg-neon-cortex-blue/20 mb-4">
              <TrendingUp className="w-8 h-8 text-neon-cortex-blue" />
            </div>
            <h4 className="text-lg font-bold mb-2">Stronger Lesson Retention</h4>
            <p className="text-sm text-text-secondary">Athletes practice your cues and drills between visits to your facility</p>
          </LiquidGlass>

          <LiquidGlass variant="orange" className="p-6 text-center">
            <div className="inline-block p-3 rounded-xl bg-solar-surge-orange/20 mb-4">
              <Star className="w-8 h-8 text-solar-surge-orange" />
            </div>
            <h4 className="text-lg font-bold mb-2">Increased Perceived Value</h4>
            <p className="text-sm text-text-secondary">Parents see continuous development from your facility, not just hourly lessons</p>
          </LiquidGlass>

          <LiquidGlass variant="blue" className="p-6 text-center">
            <div className="inline-block p-3 rounded-xl bg-neon-cortex-blue/20 mb-4">
              <Zap className="w-8 h-8 text-neon-cortex-blue" />
            </div>
            <h4 className="text-lg font-bold mb-2">Zero Staff Training Required</h4>
            <p className="text-sm text-text-secondary">Athletes use the app independently—your team doesn't manage it</p>
          </LiquidGlass>

          <LiquidGlass variant="orange" className="p-6 text-center">
            <div className="inline-block p-3 rounded-xl bg-solar-surge-orange/20 mb-4">
              <DollarSign className="w-8 h-8 text-solar-surge-orange" />
            </div>
            <h4 className="text-lg font-bold mb-2">New Recurring Revenue Stream</h4>
            <p className="text-sm text-text-secondary">Earn 10-15% on every athlete subscription you refer</p>
          </LiquidGlass>
        </div>

        {/* Feature Cards - Renamed for Facilities */}
        <h3 className="text-2xl font-bold text-center mb-8">How Athletes Continue Your Training at Home</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <LiquidGlass variant="blue" className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-neon-cortex-blue/20">
                <Video className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <div>
                <h4 className="font-bold mb-2">Reinforce Your Mechanical Cues</h4>
                <p className="text-sm text-text-secondary">AI swing analysis reinforces exactly what your coaches teach</p>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass variant="orange" className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-solar-surge-orange/20">
                <Brain className="w-6 h-6 text-solar-surge-orange" />
              </div>
              <div>
                <h4 className="font-bold mb-2">Build Confidence Between Visits</h4>
                <p className="text-sm text-text-secondary">Mental training keeps athletes sharp before their next session with you</p>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass variant="blue" className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-neon-cortex-blue/20">
                <Apple className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <div>
                <h4 className="font-bold mb-2">Support Recovery at Home</h4>
                <p className="text-sm text-text-secondary">Nutrition and arm care guidance so athletes arrive ready to train</p>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass variant="orange" className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-solar-surge-orange/20">
                <LineChart className="w-6 h-6 text-solar-surge-orange" />
              </div>
              <div>
                <h4 className="font-bold mb-2">Show Parents Their ROI</h4>
                <p className="text-sm text-text-secondary">Weekly reports prove their investment in your facility is working</p>
              </div>
            </div>
          </LiquidGlass>
        </div>

        {/* How Facilities Deploy It */}
        <LiquidGlass variant="blue" className="p-8 mb-12">
          <h3 className="text-xl font-bold mb-6 text-center">How Facilities Deploy Mind & Muscle</h3>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
              <span className="text-sm text-text-secondary">Recommended next step after lessons</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
              <span className="text-sm text-text-secondary">QR code or follow-up link shared post-session</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
              <span className="text-sm text-text-secondary">Positioned as at-home training between visits</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-neon-cortex-blue flex-shrink-0 mt-0.5" />
              <span className="text-sm text-text-secondary">Paid upgrade for athletes who want continued progress</span>
            </div>
          </div>
        </LiquidGlass>

        {/* ROI Calculator */}
        <div className="mb-8">
          <p className="text-center text-lg text-gray-300 mb-6">
            <strong className="text-white">Calculate your facility's potential:</strong> See how much recurring revenue you could generate from your existing clients.
          </p>
          <EnhancedEarningsCalculator />
        </div>

        {/* Transparency Line */}
        <p className="text-center text-sm text-gray-500 mb-8">
          Mind & Muscle is free to try. Paid plans are required for full training access.
        </p>

        {/* Facility CTA */}
        <div className="text-center">
          <LiquidButton
            variant="orange"
            size="lg"
            onClick={() => scrollToSection('apply')}
            className="!bg-gradient-to-r !from-solar-surge-orange !to-muscle-primary !shadow-[0_0_30px_rgba(251,146,60,0.6)] hover:!shadow-[0_0_40px_rgba(251,146,60,0.8)]"
          >
            Become a Partner
          </LiquidButton>
        </div>
      </div>

      {/* ============================================= */}
      {/* SECTION 4: COACHES (Short Section) */}
      {/* ============================================= */}
      <div id="coaches" className="max-w-5xl mx-auto mb-24 scroll-mt-32">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-4 py-2">
              <span className="text-sm font-bold text-neon-cortex-blue">FOR COACHES & INSTRUCTORS</span>
            </LiquidGlass>
          </div>

          <GradientTextReveal
            text="Extend Your Impact Beyond the Session"
            className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
            Help athletes stay bought in between lessons and keep parents confident in your coaching.
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto font-medium">
            Built to reinforce your coaching — not replace it.
          </p>
        </div>

        <LiquidGlass variant="blue" glow={true} className="p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-neon-cortex-blue" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Prevent Regression Between Lessons</h4>
                <p className="text-sm text-text-secondary">Lessons build instead of reset—athletes practice your cues at home</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-neon-cortex-blue" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Recommend Structured Drills</h4>
                <p className="text-sm text-text-secondary">Athletes unlock drills through the app between lessons</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-neon-cortex-blue" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Parents See Structure & Continuity</h4>
                <p className="text-sm text-text-secondary">Not just one-off lessons—an intentional program</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-neon-cortex-blue" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Your Coaching Feels Intentional</h4>
                <p className="text-sm text-text-secondary">Professional, not episodic</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <LiquidButton
              variant="blue"
              size="lg"
              onClick={() => scrollToSection('apply')}
            >
              See Coach Tools
            </LiquidButton>
          </div>
        </LiquidGlass>
      </div>

      {/* ============================================= */}
      {/* SECTION 5: TEAMS & TRAINING INFLUENCERS (Short Section) */}
      {/* ============================================= */}
      <div id="teams" className="max-w-5xl mx-auto mb-24 scroll-mt-32">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <LiquidGlass variant="orange" rounded="full" padding="none" glow={true} className="px-4 py-2">
              <span className="text-sm font-bold text-solar-surge-orange">FOR TEAMS & TRAINING CREATORS</span>
            </LiquidGlass>
          </div>

          <GradientTextReveal
            text="Add Value Without Extra Work"
            className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight"
            gradientFrom="#F97316"
            gradientTo="#0EA5E9"
            delay={0.2}
          />

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
            Create year-round engagement that keeps athletes connected to your program.
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Examples: travel ball programs, performance teams, content creators in the baseball/softball space.
          </p>
        </div>

        <LiquidGlass variant="orange" glow={true} className="p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-solar-surge-orange/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-solar-surge-orange" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Keep Athletes Engaged Year-Round</h4>
                <p className="text-sm text-text-secondary">Even outside practice and season</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-solar-surge-orange/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-solar-surge-orange" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Parents See Added Value</h4>
                <p className="text-sm text-text-secondary">Beyond games and tournaments</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-solar-surge-orange/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-solar-surge-orange" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Drive Athletes to Premium Training</h4>
                <p className="text-sm text-text-secondary">Revenue share applies to paid subscriptions</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-solar-surge-orange/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-solar-surge-orange" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Programs Feel Complete, Not Seasonal</h4>
                <p className="text-sm text-text-secondary">Engagement continues during off-season</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <LiquidButton
              variant="orange"
              size="lg"
              onClick={() => scrollToSection('apply')}
              className="!bg-gradient-to-r !from-solar-surge-orange !to-muscle-primary"
            >
              Enable Your Program
            </LiquidButton>
          </div>
        </LiquidGlass>
      </div>

      {/* Universal Retention Statement */}
      <div className="max-w-4xl mx-auto mb-16 text-center">
        <p className="text-lg text-gray-400 leading-relaxed border-l-4 border-solar-surge-orange/40 pl-6 text-left">
          Retention looks different for every partner—but it always comes from consistent engagement, visible progress, and continued development outside scheduled sessions.
        </p>
      </div>

      {/* ============================================= */}
      {/* SECTION 6: PARTNER MECHANICS (Quieter, Factual) */}
      {/* ============================================= */}
      <div className="max-w-7xl mx-auto mb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-200">
            Partner Program Details
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-4">
            Setup, tracking, and payouts.
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Partners earn commission on paid subscriptions, not free accounts.
          </p>
        </div>

        {/* How It Works Steps */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-neon-cortex-blue to-solar-surge-orange mb-4 text-2xl font-black">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Revenue Share Details */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <LiquidGlass variant="blue" className="p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">10%</div>
            <div className="text-base font-medium mb-1">Base Commission</div>
            <div className="text-sm text-text-secondary">On every subscription payment</div>
          </LiquidGlass>

          <LiquidGlass variant="blue" className="p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">15%</div>
            <div className="text-base font-medium mb-1">Volume Bonus</div>
            <div className="text-sm text-text-secondary">On users 101+ for large organizations</div>
          </LiquidGlass>

          <LiquidGlass variant="blue" className="p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">90 Days</div>
            <div className="text-base font-medium mb-1">Cookie Duration</div>
            <div className="text-sm text-text-secondary">Credit for clicks up to 90 days before signup</div>
          </LiquidGlass>
        </div>

        {/* What You Get */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <LiquidGlass variant="blue" className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-mind-primary" />
              Marketing Materials
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Your unique referral link and QR code
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Co-branded banners (if you upload your logo)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Email templates ready to customize
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Social media graphics and posts
              </li>
            </ul>
          </LiquidGlass>

          <LiquidGlass variant="orange" className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-muscle-primary" />
              Tracking & Payouts
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Real-time click and conversion tracking
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Commission dashboard with full transparency
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                Automatic PayPal payouts (60 days after sale)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-neon-cortex-green flex-shrink-0" />
                $50 minimum threshold for payout
              </li>
            </ul>
          </LiquidGlass>
        </div>

        {/* Example Banner */}
        <LiquidGlass variant="blue" className="p-8">
          <h3 className="text-lg font-medium mb-4 text-center text-gray-300">Example Co-Branded Banner</h3>
          <p className="text-center text-text-secondary text-sm mb-6">Upload your logo when applying and we'll generate banners like this:</p>
          <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
            <Image
              src="/assets/images/example-partner-banner.png"
              alt="Example Co-Branded Partner Banner"
              width={1600}
              height={900}
              className="w-full h-auto"
            />
          </div>
          <p className="text-xs text-center text-text-secondary">
            Use on social media, email, or your website
          </p>
        </LiquidGlass>
      </div>

      {/* ============================================= */}
      {/* SECTION 7: APPLICATION FORM */}
      {/* ============================================= */}
      <div id="apply" className="max-w-3xl mx-auto mb-24 scroll-mt-32">
        <LiquidGlass variant="blue" glow={true} className="p-8">
          <GradientTextReveal
            text="Apply in 2 Minutes"
            className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight text-center"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 text-center">
            Instant approval. Your referral link and marketing materials are sent immediately.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-semibold mb-2">
                Organization/Facility Name (Optional)
              </label>
              <input
                type="text"
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md"
                placeholder="Your facility or organization name"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Your Logo (Optional)
              </label>
              <p className="text-xs text-text-secondary mb-3">
                Upload your logo and we'll create co-branded marketing materials for you
              </p>

              {logoPreview ? (
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-xl border border-white/20 overflow-hidden bg-white/5">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="logo-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-neon-cortex-blue/50 hover:bg-white/5 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">Click to upload</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG, SVG (max 5MB)</span>
                  <input
                    ref={logoInputRef}
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <label htmlFor="networkSize" className="block text-sm font-semibold mb-2">
                How many coaches/teams/athletes do you reach? *
              </label>
              <select
                id="networkSize"
                required
                value={formData.networkSize}
                onChange={(e) => setFormData({ ...formData, networkSize: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md"
              >
                <option value="">Select range...</option>
                <option value="1-25">1-25 athletes</option>
                <option value="26-50">26-50 athletes</option>
                <option value="51-100">51-100 athletes</option>
                <option value="101-200">101-200 athletes</option>
                <option value="200+">200+ athletes</option>
              </select>
            </div>

            <div>
              <label htmlFor="promotionChannel" className="block text-sm font-semibold mb-2">
                What best describes you? *
              </label>
              <select
                id="promotionChannel"
                required
                value={formData.promotionChannel}
                onChange={(e) => setFormData({ ...formData, promotionChannel: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md"
              >
                <option value="">Select type...</option>
                <option value="facility">Training Facility / Academy</option>
                <option value="coach">Private Coach / Instructor</option>
                <option value="team">Team Coach / Organization</option>
                <option value="influencer">Content Creator / Influencer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="whyExcited" className="block text-sm font-semibold mb-2">
                How would you use Mind & Muscle with your athletes? *
              </label>
              <textarea
                id="whyExcited"
                required
                rows={3}
                value={formData.whyExcited}
                onChange={(e) => setFormData({ ...formData, whyExcited: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md resize-none"
                placeholder="Tell us how you'd integrate Mind & Muscle into your training..."
              />
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-semibold mb-2">
                Anything else we should know? (Optional)
              </label>
              <textarea
                id="audience"
                rows={2}
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors backdrop-blur-md resize-none"
                placeholder="Additional context, questions, or ideas..."
              />
            </div>

            <div className="p-4 bg-neon-cortex-green/10 border border-neon-cortex-green/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-neon-cortex-green flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary">
                  By applying, you agree to our{' '}
                  <a href="/partner-terms" target="_blank" className="text-neon-cortex-green hover:underline">
                    partner terms
                  </a>
                  . No commitments required—you can stop at any time.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken('')}
                onExpire={() => setCaptchaToken('')}
              />
            </div>

            <LiquidButton
              type="submit"
              variant="orange"
              size="lg"
              fullWidth={true}
              disabled={!captchaToken || isSubmitting}
              className="!bg-gradient-to-r !from-solar-surge-orange !to-muscle-primary !shadow-[0_0_30px_rgba(251,146,60,0.6)] hover:!shadow-[0_0_40px_rgba(251,146,60,0.8)] !border-solar-surge-orange/60 !text-white !font-black !text-xl"
            >
              {isSubmitting ? 'Submitting...' : 'Become a Partner'}
            </LiquidButton>

            <p className="text-xs text-text-secondary text-center">
              Instant approval! Your referral link and marketing materials will be emailed immediately.
            </p>
          </form>
        </LiquidGlass>
      </div>

      {/* ============================================= */}
      {/* SECTION 8: FINAL CTA */}
      {/* ============================================= */}
      <div className="max-w-4xl mx-auto mb-24 text-center">
        <GradientTextReveal
          text="Grow Engagement, Retention & Athlete Development"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight"
          gradientFrom="#F97316"
          gradientTo="#0EA5E9"
          delay={0.2}
        />
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Whether you're a facility, coach, or team—let's elevate your training programs together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <LiquidButton
            variant="orange"
            size="lg"
            onClick={() => scrollToSection('apply')}
            className="!bg-gradient-to-r !from-solar-surge-orange !to-muscle-primary !shadow-[0_0_30px_rgba(251,146,60,0.6)] hover:!shadow-[0_0_40px_rgba(251,146,60,0.8)]"
          >
            Become a Partner
          </LiquidButton>
          <a
            href="https://calendly.com/jeff-mindandmuscle/mind-muscle-discovery-call"
            target="_blank"
            className="text-neon-cortex-blue hover:text-white transition-colors font-medium flex items-center gap-2"
          >
            Schedule a 15-Minute Walkthrough
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ============================================= */}
      {/* FAQ SECTION */}
      {/* ============================================= */}
      <div className="max-w-4xl mx-auto mb-20">
        <GradientTextReveal
          text="Frequently Asked Questions"
          className="text-3xl sm:text-4xl font-black mb-8 leading-tight text-center"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <LiquidGlass key={index} variant="blue" className="p-6">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full text-left flex items-center justify-between gap-4"
              >
                <h3 className="text-lg font-bold">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-neon-cortex-blue transition-transform flex-shrink-0 ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFaq === index && (
                <p className="text-text-secondary text-sm mt-4 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </LiquidGlass>
          ))}
        </div>
      </div>

      {/* Footer Micro-Copy */}
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-sm text-text-secondary">
          Questions? Reach out to{' '}
          <a href="mailto:partners@mindandmuscle.ai" className="text-neon-cortex-blue hover:underline">
            partners@mindandmuscle.ai
          </a>
        </p>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <LiquidGlass variant="orange" glow={true} className="max-w-2xl w-full p-8 relative">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neon-cortex-green to-muscle-primary mb-6 animate-float">
                <Check className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue bg-clip-text text-transparent">
                Welcome to the Team!
              </h2>

              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                You're in! Check your email for your referral link and marketing materials.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-neon-cortex-green/10 border border-neon-cortex-green/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-neon-cortex-green flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm mb-1">Partner Dashboard Ready</h3>
                      <p className="text-xs text-text-secondary">
                        Access your marketing materials and track earnings
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-solar-surge-orange/10 border border-solar-surge-orange/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Rocket className="w-5 h-5 text-solar-surge-orange flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm mb-1">Materials in Your Inbox</h3>
                      <p className="text-xs text-text-secondary">
                        {logoFile ? 'Co-branded banners attached!' : 'QR code and referral link ready.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
                <p className="text-xs text-yellow-200">
                  Check your spam folder if you don't see the welcome email within a few minutes.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="https://mindandmuscle.ai/partner/login"
                  className="block w-full py-4 px-6 bg-gradient-to-r from-solar-surge-orange to-muscle-primary hover:from-solar-surge-orange/90 hover:to-muscle-primary/90 text-white font-bold text-lg rounded-xl transition-all text-center"
                >
                  Go to Partner Dashboard
                </a>
                <LiquidButton
                  onClick={() => setShowSuccessModal(false)}
                  variant="blue"
                  size="lg"
                  fullWidth={true}
                >
                  Close
                </LiquidButton>
              </div>
            </div>
          </LiquidGlass>
        </div>
      )}
    </div>
  );
}
