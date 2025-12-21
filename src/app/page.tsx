'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { Brain, Dumbbell, Users, TrendingUp, Award, Zap, X, Play, Pause, MousePointerClick, Check, Video, Apple, MessageCircle, Music } from 'lucide-react';
import { FadeInWhenVisible, StaggerChildren, TextReveal, GradientTextReveal, ScaleInWhenVisible, staggerItemVariants } from '@/components/animations';
import { AppScreenshotCarousel } from '@/components/AppScreenshotCarousel';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Daily Hit video player state
  const [isDailyHitPlaying, setIsDailyHitPlaying] = useState(false);
  const dailyHitVideoRef = useRef<HTMLVideoElement>(null);

  // Handle auth redirects from Supabase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    
    // Check if this is an auth callback (code or error from Supabase)
    const code = params.get('code');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    const errorCode = params.get('error_code');
    
    // Also check hash params (Supabase sometimes uses hash)
    const hashParams = new URLSearchParams(hash.replace('#', ''));
    const hashError = hashParams.get('error');
    const hashErrorDescription = hashParams.get('error_description');
    const hashErrorCode = hashParams.get('error_code');
    
    if (code) {
      // We have an auth code - redirect to callback handler
      window.location.href = `/api/auth/callback?code=${code}`;
    } else if (error || hashError) {
      // We have an error - redirect to reset password page with error
      const finalError = error || hashError;
      const finalErrorDesc = errorDescription || hashErrorDescription;
      const finalErrorCode = errorCode || hashErrorCode;
      
      const resetUrl = new URL('/auth/reset-password', window.location.origin);
      if (finalError) resetUrl.searchParams.set('error', finalError);
      if (finalErrorDesc) resetUrl.searchParams.set('error_description', finalErrorDesc);
      if (finalErrorCode) resetUrl.searchParams.set('error_code', finalErrorCode);
      
      window.location.href = resetUrl.toString();
    }
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeFeature) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [activeFeature]);

  // Hide browser chrome (URL bar and navigation) on tap
  const handleModalTap = () => {
    // Scroll to trigger browser chrome to hide on mobile
    window.scrollTo(0, 1);
  };

  const handleCloseModal = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioElement(null);
    }
    setIsPlaying(false);
    setActiveFeature(null);
  };

  const handleOpenModal = (feature: any, autoPlay: boolean = true) => {
    setActiveFeature(feature);
    if (autoPlay && feature.audioUrl) {
      setTimeout(() => {
        const audio = new Audio(feature.audioUrl);
        audio.play();
        setIsPlaying(true);
        setAudioElement(audio);
        audio.onended = () => setIsPlaying(false);
      }, 300);
    }
  };

  // Swipe to close gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd < -150) {
      // Swiped down more than 150px - close modal
      handleCloseModal();
    }
  };

  // Row 1: 3 cards - Swing Lab, Pitch Lab, Game Lab
  const row1Features = [
    {
      id: 'swing-lab',
      title: 'Swing Lab',
      icon: TrendingUp,
      iconImage: '/assets/images/Swing Lab1.png',
      color: 'blue',
      image: '/assets/dashboard/swing_lab.png',
      videoUrl: '/assets/videos/swinglab.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/swinglab_ob.mp3',
      tagline: 'AI Video Analysis For Your Swing.',
      description: 'See it. Fix it. Hit tanks.',
      modalDescription: '**Upload your swing. Get elite coaching feedback. Fix what\'s holding you back.**\n\nSwing Lab delivers AI coaching analysis that breaks down your swing like a veteran MLB hitting coach—instant, actionable, precise.\n\n**Elite AI Coaching Analysis:**\n\n- **The Good Stuff** - Specific strengths to build on\n- **Power Opportunities** - The 1-2 changes that unlock explosive contact\n- **Your Practice Plan** - 2 precision drills targeting your exact issues\n- **Mental Game Strategy** - Situational hitting advice\n- **#1 Focus** - The most important thing to work on next\n\n**Analysis Features:**\n\n- Video thumbnails for visual reference\n- Complete analysis history for progress tracking\n- Shareable reports for coaches and teammates\n- Favorite your best analyses\n\nWhile other players guess what\'s wrong, you\'ll KNOW exactly what to fix.\n\n**This is swing analysis. Engineered for champions.**',
    },
    {
      id: 'pitch-lab',
      title: 'Pitch Lab',
      icon: TrendingUp,
      iconImage: '/assets/images/pitch_lab_icon.png',
      color: 'orange',
      image: '/assets/images/pitch_lab_icon.png',
      videoUrl: '/assets/videos/pitch_lab.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/pitchlab_ob.mp3',
      tagline: 'Design Filthy Pitches. Protect Your Arm.',
      description: 'Design filthy pitches. Protect your arm.',
      modalDescription: '**Design filthy pitches. Protect your arm.**\n\nPitch Lab delivers AI coaching analysis that breaks down your delivery like a veteran pitching coach—instant, actionable, precise.\n\n**Elite AI Pitching Analysis:**\n\n- **8-Component Technical Breakdown** - Every phase of your delivery analyzed\n- **Arm Health Assessment** - Injury prevention insights to keep you on the mound\n- **Power Opportunities** - Unlock hidden velocity in your mechanics\n- **Custom Drill Recommendations** - Targeted fixes for your exact issues\n- **Progress Tracking** - Save and compare analyses over time\n\n**What You\'ll Get:**\n\n✅ Full mechanics breakdown (wind-up through follow-through)\n🩺 Arm health risk assessment\n🔥 Strengths to keep building\n⚠️ Areas for improvement\n🎯 Personalized drill recommendations\n\n**Works for Baseball & Softball**\n\nWhile other pitchers guess what\'s wrong, you\'ll KNOW exactly what to fix.\n\n**This is pitching analysis. Engineered for dominance.**',
    },
    {
      id: 'game-lab',
      title: 'Game Lab',
      icon: Zap,
      iconImage: '/assets/images/game_lab_icon copy.png',
      color: 'blue',
      image: '/assets/images/game-lab.png',
      videoUrl: '/assets/videos/game_lab.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/gamelab_ob.mp3',
      tagline: 'Play Smarter. Not Harder.',
      description: 'Game IQ. No Excuses.',
      modalDescription: 'Game Lab isn\'t about guessing. It\'s about knowing.\n\n186 real game scenarios that force you to think faster, decide smarter, and play like you\'ve already seen every situation.\n\nYour Baseball IQ gets measured. Your mental batting average gets tracked. Every decision earns XP, builds streaks, and unlocks badges.\n\nWhile other players freeze under pressure, you\'ll already know the play.\n\n**This is your baseball brain. Fully trained.**',
    },
  ];

  // Row 2: 3 cards - Sound Lab, Plate IQ, AI Assistant Coach
  const row2Features = [
    {
      id: 'sound-lab',
      title: 'Sound Lab',
      icon: Music,
      iconImage: '/assets/images/Sound Lab copy.png',
      color: 'orange',
      image: '/assets/mind/sound_lab.png',
      videoUrl: '/assets/videos/sound_lab.1mp4.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/soundlab_ob.mp3',
      tagline: 'Train Your Mind Through Sound.',
      description: 'Elite focus. Custom soundscapes.',
      modalDescription: 'Sound Lab isn\'t background music. It\'s a remote control for your mental state.\n\nBinaural beats sync your brainwaves. Alpha for laser focus. Beta for superhuman concentration. Gamma for explosive reactions.\n\nAncient Solfeggio frequencies meet athletic performance mixes. Pre-built combinations that pros use before competition.\n\nStart 10 minutes before training. Feel your brain lock in.\n\nWhile other athletes hope they\'ll be ready, you\'ll engineer your mental state.\n\n**This is sound. Weaponized for performance.**',
    },
    {
      id: 'plate-iq',
      title: 'Plate IQ',
      icon: TrendingUp,
      iconImage: '/assets/images/plate_iq_icon.png',
      color: 'blue',
      image: '/assets/images/plate_iq_detail.png',
      videoUrl: '/assets/videos/plate_iq.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/swinglab_ob.mp3',
      tagline: 'Anticipate. Adjust. Attack.',
      description: 'Anticipate. Adjust. Attack.',
      modalDescription: '**Anticipate. Adjust. Attack.**\n\nGreat hitters don\'t just react—they step in with a PLAN. Plate IQ trains the mental approach that separates good hitters from elite ones.\n\n**How It Works:**\n\n- Read the SITUATION (count, runners, outs, score)\n- Pick your MODE (Hunt with 0-1 strikes, Battle with 2 strikes)\n- Anticipate the ZONE (where will the pitcher throw?)\n- Lock in your approach and see if you read it right\n\n**Learn Situational Pitching:**\n\n- Why pitchers throw DOWN with runner on 3rd (prevent sac fly)\n- Why pitchers work AWAY with runner on 2nd (prevent pull-side damage)\n- How count changes pitcher aggression (2-0 vs 0-2)\n- How score affects location (nibbling when behind vs attacking when ahead)\n\n**Features:**\n\n- 20 real game scenarios with increasing difficulty\n- Heatmap visualization of pitcher tendencies by count\n- Streak tracking and accuracy stats\n- Explains the WHY behind every pitch location\n\nWhile other hitters guess, you\'ll KNOW what\'s coming.\n\n**This is pitch anticipation. Engineered for elite hitters.**',
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant Coach',
      icon: Award,
      iconImage: '/assets/images/Whistle.png',
      color: 'orange',
      image: '/assets/images/ai_coach_robot_crop.png',
      videoUrl: '/assets/videos/ai_assistant_coach.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/assistant_ob.mp3',
      tagline: 'Your 24/7 Coaching Partner.',
      description: 'Personal Drill Designer. Turns Coaching Notes Into Professional Plans.',
      modalDescription: 'AI Assistant Coach turns your coaching notes into professional practice plans.\n\nShare what you\'re working on. The AI creates custom drills that target exactly what your team needs.\n\nEvery session learns from your feedback. Every drill gets smarter. Every practice plan becomes more powerful.\n\nBuilt for coaches, athletes, and parents who demand training that\'s personalized, not generic.\n\nWhile other teams run cookie-cutter drills, yours will train with precision.\n\n**This is your personal drill designer. Built for champions.**',
    },
  ];

  // Row 3: 3 cards - Mind Coach AI, Muscle Coach AI, Goals AI
  const row3Features = [
    {
      id: 'mind-coach',
      title: 'Mind Coach AI',
      icon: Brain,
      iconImage: '/assets/images/Mind AI Coach.png',
      color: 'blue',
      image: '/assets/mind/Mind AI Coach Hero.png',
      videoUrl: '/assets/videos/mind_coachai.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/mindcoachai_ob.mp3',
      tagline: 'Your Elite Mental Training Coach That Actually Knows You',
      description: 'Where Mental Toughness Becomes Mental Dominance.',
      modalDescription: 'Mind Coach AI doesn\'t guess your mental game. It engineers it.\n\nThat clutch player who never gets rattled? They trained their mind like you train your body.\n\nAI-Powered Mental Training - Personalized sessions in focus, pressure management, confidence, visualization, and mindfulness. Each designed for your mental profile.\n\nLearns From Every Session - Feedback after each session makes the next one smarter. Your mental training evolves with you.\n\nCreate Custom Sessions - Need something specific? Build sessions tailored to your exact mental challenges.\n\nTrack Your Progress - Complete sessions, build streaks, watch your mental game level up.\n\nWhile other athletes hope their mental game shows up, yours gets engineered for peak performance.\n\n**This is your mind. Fully trained.**',
    },
    {
      id: 'muscle-training',
      title: 'Muscle Coach AI',
      icon: Dumbbell,
      iconImage: '/assets/images/Muscle AI Coach Icon.png',
      color: 'orange',
      image: '/assets/muscle/Muscle AI Coach Hero.png',
      videoUrl: '/assets/videos/muscle_coachai.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/musclecoachai_ob.mp3',
      tagline: 'Your Elite Strength Engineer That Builds Baseball and Softball Power',
      description: 'Build the Strength That Gets You Noticed.',
      modalDescription: 'Muscle Coach AI doesn\'t guess your strength needs. It engineers baseball and softball-specific power.\n\nMLB-level strength training, personalized for your position and power profile.\n\nThree Training Zones - AI Coach (smart recommendations), Exercise Vault (hundreds of baseball and softball-specific exercises), Build Tab (custom workout plan creator).\n\nPosition-Specific Power - Explosive power for bat speed. Rotational strength for throwing velocity. Endurance for clutch moments. All engineered for your position.\n\nAI-Driven Progression - Every set logged. Every workout analyzed. Progressive overload tracked automatically.\n\nCreate Custom Plans - Build workout routines with targeted exercises, track sets/reps, monitor strength gains.\n\nWhile other players hope their strength shows up, yours gets systematically engineered for peak performance.\n\n**This is strength training. Built for baseball and softball.**',
    },
    {
      id: 'goals-ai',
      title: 'Goals AI',
      icon: Award,
      iconImage: '/assets/images/Goals Icon.png',
      color: 'blue',
      image: '/assets/images/Results Goals.png',
      videoUrl: '/assets/videos/goalsai.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/goals_ob.mp3',
      tagline: 'Turn Intent Into Progress.',
      description: 'AI-Powered Goal Setting That Actually Gets Results.',
      modalDescription: 'Goals AI transforms vague ambitions into surgical precision.\n\n"I want to get stronger" becomes "Increase squat by 25lbs in 8 weeks through progressive overload."\n\nYour performance architect analyzes goals like a championship coach. Finding gaps you miss. Building bridges between where you are and where you\'re going.\n\nSeason goals. Daily habits. All tracked. All optimized.\n\nWhile other athletes hope for results, you\'ll engineer them.\n\n**This is goal setting. Weaponized for champions.**',
    },
  ];

  // Row 4: 3 cards - Chatter + Events, Dugout Talk, Fuel AI
  const row4Features = [
    {
      id: 'chatter',
      title: 'Chatter + Events',
      icon: Users,
      iconImage: '/assets/images/chatter_icon_3x.png',
      color: 'orange',
      image: '/assets/images/Team Communications.png',
      videoUrl: '/assets/videos/chatter.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/chatter_ob.mp3',
      tagline: 'Stay Connected. Stay Synced.',
      description: 'Game Day Perfection Starts With Perfect Logistics.',
      modalDescription: 'Chatter & Events: Where championship teams stay perfectly synchronized.\n\nGame day perfection starts with perfect communication and zero logistical chaos.\n\nTeam Chat - That dugout energy, 24/7. Build the brotherhood that separates great teams from good ones.\n\nEvent Management - Every tournament, every practice, every detail. Attendance tracking. Calendar sync. Everyone knows where to be, when to be there.\n\nUniform Creator - Professional team coordination with one tap. Create custom uniforms (home, away, practice) with visual presets. Cap, jersey, pants, belt, socks - all perfectly coordinated.\n\nNavigation Integration - Directions to every field, every facility. No one gets lost. No one shows up late.\n\nWhile other teams deal with communication breakdowns and logistical nightmares, yours moves like a championship machine.\n\n**This is team synchronization. Weaponized.**',
    },
    {
      id: 'dugout-talk',
      title: 'Dugout Talk',
      icon: MessageCircle,
      iconImage: '/assets/images/chatter_icon_3x.png',
      color: 'blue',
      image: '/assets/images/dugout_talk.png',
      videoUrl: '/assets/videos/dugout_talk.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/dugout_ob.mp3',
      tagline: 'Your Daily Mental Check-In.',
      description: 'Build Champion Mindsets Through Daily Reflection.',
      modalDescription: '**Your daily mental check-in that builds champion mindsets.**\n\nThe best athletes train their minds daily. Dugout Talk gives you the space to reflect, grow, and stay sharp between the ears.\n\n**What\'s Inside:**\n\n📅 **Daily Themes** - Fresh prompts every day to guide your reflection\n🔥 **Streak Tracking** - Build consistency, watch your flame grow\n📊 **Quick Ratings** - Track mood, energy, stress & motivation\n✍️ **Your Space** - Voice or type your thoughts, no judgment\n\n**Why It Matters:**\n\nJust 2 minutes here builds mental toughness, reveals performance patterns, and keeps you dialed in when it matters most.\n\n💡 **Pro Tip:** Check today\'s theme at the top - let it inspire your entry. Consistency beats perfection!\n\nWhile other athletes ignore their mental game, you\'ll build the mindset that separates good from great.\n\n**This is mental journaling. Engineered for champions.**',
    },
    {
      id: 'fuel-ai',
      title: 'Fuel AI',
      icon: Zap,
      iconImage: '/assets/images/Fuel.png',
      color: 'orange',
      image: '/assets/images/fuel_ai.png',
      videoUrl: '/assets/videos/fuelai.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/fuelai_ob.mp3',
      tagline: 'Precision Nutrition, No Guesswork.',
      description: 'AI-Powered Meal Plans That Turn Food Into Fuel.',
      modalDescription: 'Fuel AI turns your food preferences into performance-optimized meal plans.\n\nYour body is a high-performance machine. Stop guessing what to eat.\n\nAI-Powered Planning - Tell us what you love, what you avoid, how much time you have. The AI creates 7 days of personalized meals designed for peak performance.\n\nSmart Shopping Lists - Auto-generated from your weekly plan. Walk in with a list, walk out ready to fuel greatness.\n\nPerformance-Focused - Every meal targets training fuel and recovery. Real food that fits your lifestyle, not generic meal prep.\n\nLearns Your Preferences - Dietary restrictions, allergies, favorite foods, cooking time. Each week gets smarter.\n\nWhile other athletes count calories and hope, you\'ll eat with purpose.\n\n**This is nutrition. Engineered for champions.**',
    },
  ];

  // Row 5: 3 cards - FREE Features: Arm Builder, Speed Lab, Coach's Corner
  const row5Features = [
    {
      id: 'arm-builder',
      title: 'Arm Builder',
      icon: Dumbbell,
      iconImage: '/assets/images/arm_builder_icon.png',
      color: 'blue',
      image: '/assets/images/armcare_hero.png',
      videoUrl: '/assets/videos/armcare.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/armbuilder_ob.mp3',
      tagline: 'Protect Your Arm. Build Your Future.',
      description: 'Build velocity. Prevent injury. Throw gas.',
      modalDescription: '**Build velocity. Prevent injury. Throw gas.**\n\nArm Builder is your complete arm care system—designed to keep you healthy and throwing your hardest.\n\n**What\'s Inside:**\n\n🦾 **Daily Arm Check-In** - Rate how your arm feels. The system adapts to your condition.\n\n🔥 **Position-Specific Warmups** - Dynamic stretches and band work tailored to pitchers, catchers, and position players.\n\n📈 **Long Toss Programming** - Progressive distance protocols that build arm strength safely.\n\n🧊 **Recovery Routines** - Post-game and off-day protocols to keep your arm fresh.\n\n💡 **Pro Tips** - Coach-approved advice that builds elite arm care habits.\n\n**Track Your Progress:**\n\n- Daily streaks reward consistency\n- Log long toss distances and velocities\n- Visual progress over time\n\nWhile other players gamble with their arms, you\'ll build yours systematically.\n\n**This is arm care. Engineered for longevity.**',
    },
    {
      id: 'speed-lab',
      title: 'Speed Lab',
      icon: Zap,
      iconImage: '/assets/images/speed_lab_icon.png',
      color: 'orange',
      image: '/assets/images/speed_lab_crop.png',
      videoUrl: '/assets/videos/speed_lab.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/speedlab_ob.mp3',
      tagline: 'Run Smarter. Score More.',
      description: 'Run Smarter. Score More.',
      modalDescription: '**Run Smarter. Score More.**\n\nSpeed Lab is your complete baserunning education—28 pro tips across 5 modules that transform you into a weapon on the basepaths.\n\n**5 Training Modules:**\n\n🧠 **Read the Play** - Situational awareness and decision-making\n\n📏 **Win the Jump** - Lead techniques and timing\n\n👁️ **Beat the Pitcher** - Reading delivery tells and pickoff moves\n\n🛝 **Perfect Your Slide** - Head-first, pop-up, and evasive slides\n\n🏃 **Take Extra Bases** - First-to-third, tagging up, scoring runs\n\n**Features:**\n\n- Interactive flip cards with detailed explanations\n- Audio narration for every tip\n- Situation IQ quiz to test your knowledge\n- Streak tracking rewards daily learning\n\nWhile other players run by instinct, you\'ll run with intelligence.\n\n**This is baserunning. Engineered for speed.**',
    },
    {
      id: 'coachs-corner',
      title: "Coach's Corner",
      icon: Award,
      iconImage: '/assets/images/coachs_corner_icon.png',
      color: 'blue',
      image: '/assets/images/coachs_corner.png',
      videoUrl: '/assets/videos/coachcorner.mp4',
      audioUrl: 'https://api.mindandmuscle.ai/storage/v1/object/public/onboarding/coachscorner_ob.mp3',
      tagline: 'Wisdom. Strategy. Results.',
      description: 'Wisdom. Strategy. Results.',
      modalDescription: '**Wisdom. Strategy. Results.**\n\nCoach\'s Corner is command central for coaches—everything you need to run elite programs and develop champions.\n\n**Coach Tools:**\n\n📊 **Team Dashboard** - See every athlete\'s progress at a glance\n\n🎯 **Goal Tracking** - Monitor athlete goals and approve new ones\n\n📈 **Weekly Insights** - AI-generated summaries of team performance\n\n💬 **Team Communication** - Chatter integration for direct messaging\n\n🗓️ **Event Management** - Practices, games, and tournaments organized\n\n**For Athletes:**\n\n- Access coaching insights and feedback\n- View team announcements\n- Track your standing within the team\n\nWhile other coaches drown in spreadsheets, you\'ll coach with clarity.\n\n**This is team management. Engineered for champions.**',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Compact like Veroflow */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-40 pb-16">
        {/* Full Width Background Image */}
        <div className="absolute inset-0 z-0">
          {/* Baseball Field Background Image - WebP optimized */}
          <picture>
            <source srcSet="/assets/images/baseball_field_dusk.webp" type="image/webp" />
            <Image
              src="/assets/images/baseball_field_dusk.png"
              alt="Baseball Field at Dusk"
              fill
              className="object-cover object-center"
              priority
              quality={90}
            />
          </picture>

          {/* Enhanced Overlay: Blur + Dark Gradient for Text Pop */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent backdrop-blur-[2px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-full flex items-center justify-between gap-8">
            <div className="max-w-3xl">
            {/* Tagline */}
            <FadeInWhenVisible delay={0} direction="down">
              <h1 className="text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] font-black mb-10 leading-[1.0]">
                <span className="text-neon-cortex-blue" style={{textShadow: '0 0 30px rgba(14,165,233,0.6)'}}>Discipline the Mind.</span>
                <br />
                <span className="text-solar-surge-orange" style={{textShadow: '0 0 30px rgba(249,115,22,0.6)'}}>Dominate the Game.</span>
                <span className="text-solar-surge-orange text-[24px] sm:text-[32px] align-top" style={{textShadow: '0 0 20px rgba(249,115,22,0.5)'}}>™</span>
              </h1>
            </FadeInWhenVisible>

            {/* Primary Headline */}
            <FadeInWhenVisible delay={0.4} direction="up">
              <p className="text-[24px] sm:text-[32px] md:text-[40px] text-white font-bold mb-5 leading-tight max-w-2xl" style={{textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>
                Built for the Mental and Physical Demands of Baseball and Softball.
              </p>
            </FadeInWhenVisible>

            {/* Subheadline */}
            <FadeInWhenVisible delay={0.8} direction="up">
              <p className="text-[18px] sm:text-[22px] text-gray-300 mb-8 leading-relaxed max-w-2xl font-medium" style={{textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>
                AI-powered training for skills, mindset, strength, and game IQ — designed specifically for baseball and softball athletes.
              </p>
            </FadeInWhenVisible>

            {/* Micro-clarifier */}
            <FadeInWhenVisible delay={0.9} direction="up">
              <p className="text-[14px] sm:text-[16px] text-gray-400 mb-4 font-normal" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
                Train smarter between practices and games.
              </p>
            </FadeInWhenVisible>

            {/* App Store Buttons */}
            <FadeInWhenVisible delay={1.0} direction="up" className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <Link
                href="https://apps.apple.com/us/app/mind-muscle/id6754098729"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="shimmer-button px-8 py-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-text-secondary">Download on the</div>
                    <div className="text-lg font-semibold -mt-1">App Store</div>
                  </div>
                </div>
              </Link>
              <Link
                href="https://play.google.com/store/apps/details?id=com.exceptionalhabit.mind_and_muscle"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="shimmer-button shimmer-button-delayed px-8 py-3 bg-black rounded-xl border border-white/20 hover:border-white/40 transition-all hover:scale-105 flex items-center gap-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-text-secondary">GET IT ON</div>
                    <div className="text-lg font-semibold -mt-1">Google Play</div>
                  </div>
                </div>
              </Link>
            </FadeInWhenVisible>

          </div>

          {/* Logo - Right Side */}
          <div className="hidden lg:block flex-shrink-0 opacity-90">
            <Image
              src="/assets/images/logo.png"
              alt="Mind & Muscle Logo"
              width={400}
              height={400}
            />
          </div>
        </div>
        </div>
      </section>

      {/* The Complete Performance Ecosystem - Cinematic Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Deep Navy to Black Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F3A] via-[#0F1123] to-[#1A1F3A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-24">
            <GradientTextReveal
              text="A Connected Performance System — Not Disconnected Tools."
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-relaxed"
              gradientFrom="#0EA5E9"
              gradientTo="#F97316"
              delay={0.2}
            />
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-6">
              Elite development doesn&apos;t happen in silos. Mind & Muscle unifies mental training, physical prep, arm health, mechanics, and game IQ into one continuous performance loop.
            </p>
            <p className="text-base sm:text-lg text-text-secondary max-w-3xl mx-auto">
              <span className="text-neon-cortex-blue font-semibold">FREE features:</span> Chatter, Events, Daily Hit, Dugout Talk, Game Lab Level 1, Arm Builder, Speed Lab, Coach&apos;s Corner, Parent Dashboard, and Breathwork. <span className="text-solar-surge-orange font-semibold">PRO</span> unlocks AI coaching, video analysis, and advanced training tools.
            </p>
          </FadeInWhenVisible>

          {/* Row 1 - 3 Cards: Swing Lab, Pitch Lab, Game Lab */}
          <StaggerChildren staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {row1Features.map((feature, i) => {
              const Icon = feature.icon;
              const isBlue = feature.color === 'blue';

              return (
                <motion.div
                  key={feature.id}
                  onClick={() => setActiveFeature(feature)}
                  className="group relative cursor-pointer"
                  variants={staggerItemVariants}
                >
                  {/* Glow Effect */}
                  <div className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${
                    isBlue ? 'bg-gradient-to-b from-neon-cortex-blue/30 to-mind-primary/10' : 'bg-gradient-to-b from-solar-surge-orange/30 to-muscle-primary/10'
                  }`} />

                  {/* Card */}
                  <div className={`relative backdrop-blur-sm bg-white/[0.02] p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-105 hover:bg-white/[0.05] h-full ${
                    isBlue ? 'border-neon-cortex-blue/40 hover:border-neon-cortex-blue shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)]' : 'border-solar-surge-orange/40 hover:border-solar-surge-orange shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]'
                  }`}>
                    {/* Video/Image */}
                    <div
                      className="relative aspect-video bg-gradient-to-br from-white/5 to-transparent rounded-xl mb-4 overflow-hidden group/image"
                      ref={(node) => {
                        if (node) {
                          const video = node.querySelector('video');
                          if (video) {
                            // Intersection Observer for mobile auto-play on scroll
                            const observer = new IntersectionObserver(
                              (entries) => {
                                entries.forEach((entry) => {
                                  if (entry.isIntersecting) {
                                    video.currentTime = 0;
                                    video.play().catch(() => {});
                                  } else {
                                    video.pause();
                                    video.currentTime = 0;
                                  }
                                });
                              },
                              { threshold: 0.5 }
                            );
                            observer.observe(node);
                          }
                        }
                      }}
                      onMouseEnter={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          video.currentTime = 0;
                          video.play().catch(() => {/* Ignore autoplay errors */});
                        }
                      }}
                      onMouseLeave={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          video.pause();
                          video.currentTime = 0;
                        }
                      }}
                    >
                      {feature.videoUrl ? (
                        <video
                          src={feature.videoUrl}
                          poster={feature.image}
                          className="w-full h-full object-cover opacity-95"
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="auto"
                        />
                      ) : (
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover opacity-95"
                        />
                      )}
                    </div>

                    {/* Icon + Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        isBlue ? 'bg-neon-cortex-blue/10 border border-neon-cortex-blue/30' : 'bg-solar-surge-orange/10 border border-solar-surge-orange/30'
                      }`}>
                        {feature.iconImage ? (
                          <img
                            src={feature.iconImage}
                            alt={`${feature.title} icon`}
                            className="w-8 h-8 object-contain"
                            style={{filter: `drop-shadow(0 0 10px ${isBlue ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}}
                          />
                        ) : (
                          <Icon className={`w-6 h-6 ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}
                                style={{filter: `drop-shadow(0 0 10px ${isBlue ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}} />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={`text-xl font-black shimmer-text ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}>
                        {feature.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-300 leading-relaxed pr-12 pb-1">
                      {feature.description}
                    </p>
                    <p className="text-xs text-white/40 pb-2">Tap for audio overview</p>

                    {/* Click Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(feature);
                      }}
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center transition-all cursor-pointer hover:bg-white/20 hover:border-white/50 active:scale-95 animate-pulse"
                      aria-label={`View details for ${feature.title}`}
                    >
                      <MousePointerClick className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>

          {/* Row 2 - 3 Cards: Sound Lab, Plate IQ, AI Assistant Coach */}
          <StaggerChildren staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {row2Features.map((feature, i) => {
              const Icon = feature.icon;
              const isBlue = feature.color === 'blue';

              return (
                <motion.div
                  key={feature.id}
                  onClick={() => setActiveFeature(feature)}
                  className="group relative cursor-pointer"
                  variants={staggerItemVariants}
                >
                  {/* Glow Effect */}
                  <div className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${
                    isBlue ? 'bg-gradient-to-b from-neon-cortex-blue/30 to-mind-primary/10' : 'bg-gradient-to-b from-solar-surge-orange/30 to-muscle-primary/10'
                  }`} />

                  {/* Card */}
                  <div className={`relative backdrop-blur-sm bg-white/[0.02] p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-105 hover:bg-white/[0.05] h-full ${
                    isBlue ? 'border-neon-cortex-blue/40 hover:border-neon-cortex-blue shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)]' : 'border-solar-surge-orange/40 hover:border-solar-surge-orange shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]'
                  }`}>
                    {/* Video/Image */}
                    <div
                      className="relative aspect-video bg-gradient-to-br from-white/5 to-transparent rounded-xl mb-4 overflow-hidden group/image"
                      ref={(node) => {
                        if (node) {
                          const video = node.querySelector('video');
                          if (video) {
                            // Intersection Observer for mobile auto-play on scroll
                            const observer = new IntersectionObserver(
                              (entries) => {
                                entries.forEach((entry) => {
                                  if (entry.isIntersecting) {
                                    video.currentTime = 0;
                                    video.play().catch(() => {});
                                  } else {
                                    video.pause();
                                    video.currentTime = 0;
                                  }
                                });
                              },
                              { threshold: 0.5 }
                            );
                            observer.observe(node);
                          }
                        }
                      }}
                      onMouseEnter={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          video.currentTime = 0;
                          video.play().catch(() => {/* Ignore autoplay errors */});
                        }
                      }}
                      onMouseLeave={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          video.pause();
                          video.currentTime = 0;
                        }
                      }}
                    >
                      {feature.videoUrl ? (
                        <video
                          src={feature.videoUrl}
                          poster={feature.image}
                          className="w-full h-full object-cover opacity-95"
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="auto"
                        />
                      ) : (
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover opacity-95"
                        />
                      )}
                    </div>

                    {/* Icon + Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        isBlue ? 'bg-neon-cortex-blue/10 border border-neon-cortex-blue/30' : 'bg-solar-surge-orange/10 border border-solar-surge-orange/30'
                      }`}>
                        {feature.iconImage ? (
                          <img
                            src={feature.iconImage}
                            alt={`${feature.title} icon`}
                            className="w-8 h-8 object-contain"
                            style={{filter: `drop-shadow(0 0 10px ${isBlue ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}}
                          />
                        ) : (
                          <Icon className={`w-6 h-6 ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}
                                style={{filter: `drop-shadow(0 0 10px ${isBlue ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}} />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={`text-xl font-black shimmer-text ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}>
                        {feature.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-300 leading-relaxed pr-12 pb-1">
                      {feature.description}
                    </p>
                    <p className="text-xs text-white/40 pb-2">Tap for audio overview</p>

                    {/* Click Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(feature);
                      }}
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center transition-all cursor-pointer hover:bg-white/20 hover:border-white/50 active:scale-95 animate-pulse"
                      aria-label={`View details for ${feature.title}`}
                    >
                      <MousePointerClick className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>

          {/* Row 3 - 3 Cards: Mind Coach AI, Muscle Coach AI, Goals AI */}
          <StaggerChildren staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {row3Features.map((feature, i) => {
              const Icon = feature.icon;
              const isBlue = feature.color === 'blue';

              return (
                <motion.div
                  key={feature.id}
                  onClick={() => setActiveFeature(feature)}
                  className="group relative cursor-pointer"
                  variants={staggerItemVariants}
                >
                  {/* Glow Effect */}
                  <div className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${
                    isBlue ? 'bg-gradient-to-b from-neon-cortex-blue/30 to-mind-primary/10' : 'bg-gradient-to-b from-solar-surge-orange/30 to-muscle-primary/10'
                  }`} />

                  {/* Card */}
                  <div className={`relative backdrop-blur-sm bg-white/[0.02] p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-105 hover:bg-white/[0.05] h-full ${
                    isBlue ? 'border-neon-cortex-blue/40 hover:border-neon-cortex-blue shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)]' : 'border-solar-surge-orange/40 hover:border-solar-surge-orange shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]'
                  }`}>
                    {/* Video/Image */}
                    <div
                      className="relative aspect-video bg-gradient-to-br from-white/5 to-transparent rounded-xl mb-4 overflow-hidden group/image"
                      ref={(node) => {
                        if (node) {
                          const video = node.querySelector('video');
                          if (video) {
                            // Intersection Observer for mobile auto-play on scroll
                            const observer = new IntersectionObserver(
                              (entries) => {
                                entries.forEach((entry) => {
                                  if (entry.isIntersecting) {
                                    video.currentTime = 0;
                                    video.play().catch(() => {});
                                  } else {
                                    video.pause();
                                    video.currentTime = 0;
                                  }
                                });
                              },
                              { threshold: 0.5 }
                            );
                            observer.observe(node);
                          }
                        }
                      }}
                      onMouseEnter={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          video.currentTime = 0;
                          video.play().catch(() => {/* Ignore autoplay errors */});
                        }
                      }}
                      onMouseLeave={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          video.pause();
                          video.currentTime = 0;
                        }
                      }}
                    >
                      {feature.videoUrl ? (
                        <video
                          src={feature.videoUrl}
                          poster={feature.image}
                          className="w-full h-full object-cover opacity-95"
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="auto"
                        />
                      ) : (
                        <img src={feature.image} alt={feature.title} className="w-full h-full object-cover opacity-95" />
                      )}
                    </div>

                    {/* Icon + Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        isBlue ? 'bg-neon-cortex-blue/10 border border-neon-cortex-blue/30' : 'bg-solar-surge-orange/10 border border-solar-surge-orange/30'
                      }`}>
                        {feature.iconImage ? (
                          <img
                            src={feature.iconImage}
                            alt={`${feature.title} icon`}
                            className="w-8 h-8 object-contain"
                            style={{filter: `drop-shadow(0 0 10px ${isBlue ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}}
                          />
                        ) : (
                          <Icon className={`w-6 h-6 ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}
                                style={{filter: `drop-shadow(0 0 10px ${isBlue ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}} />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={`text-xl font-black shimmer-text ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}>
                        {feature.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-300 leading-relaxed pr-12 pb-1">
                      {feature.description}
                    </p>
                    <p className="text-xs text-white/40 pb-2">Tap for audio overview</p>

                    {/* Click Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(feature);
                      }}
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center transition-all cursor-pointer hover:bg-white/20 hover:border-white/50 active:scale-95 animate-pulse"
                      aria-label={`View details for ${feature.title}`}
                    >
                      <MousePointerClick className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>

          {/* Row 4 - 3 Cards: Chatter + Events, Dugout Talk, Fuel AI */}
          <StaggerChildren staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {row4Features.map((feature, i) => {
              const Icon = feature.icon;
              const isBlue = feature.color === 'blue';

              return (
                <motion.div
                  key={feature.id}
                  onClick={() => setActiveFeature(feature)}
                  className="group relative cursor-pointer"
                  variants={staggerItemVariants}
                >
                  {/* Glow Effect */}
                  <div className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${
                    isBlue ? 'bg-gradient-to-b from-neon-cortex-blue/30 to-mind-primary/10' : 'bg-gradient-to-b from-solar-surge-orange/30 to-muscle-primary/10'
                  }`} />

                  {/* Card */}
                  <div className={`relative backdrop-blur-sm bg-white/[0.02] p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-105 hover:bg-white/[0.05] h-full ${
                    isBlue ? 'border-neon-cortex-blue/40 hover:border-neon-cortex-blue shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)]' : 'border-solar-surge-orange/40 hover:border-solar-surge-orange shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]'
                  }`}>
                    {/* Video/Image */}
                    <div
                      className="relative aspect-video bg-gradient-to-br from-white/5 to-transparent rounded-xl mb-4 overflow-hidden group/image"
                      ref={(node) => {
                        if (node) {
                          const video = node.querySelector('video');
                          if (video) {
                            // Intersection Observer for mobile auto-play on scroll
                            const observer = new IntersectionObserver(
                              (entries) => {
                                entries.forEach((entry) => {
                                  if (entry.isIntersecting) {
                                    video.currentTime = 0;
                                    video.play().catch(() => {});
                                  } else {
                                    video.pause();
                                    video.currentTime = 0;
                                  }
                                });
                              },
                              { threshold: 0.5 }
                            );
                            observer.observe(node);
                          }
                        }
                      }}
                      onMouseEnter={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          video.currentTime = 0;
                          video.play().catch(() => {/* Ignore autoplay errors */});
                        }
                      }}
                      onMouseLeave={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          video.pause();
                          video.currentTime = 0;
                        }
                      }}
                    >
                      {feature.videoUrl ? (
                        <video
                          src={feature.videoUrl}
                          poster={feature.image}
                          className="w-full h-full object-cover opacity-95"
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="auto"
                        />
                      ) : (
                        <img src={feature.image} alt={feature.title} className="w-full h-full object-cover opacity-95" />
                      )}
                    </div>

                    {/* Icon + Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        isBlue ? 'bg-neon-cortex-blue/10 border border-neon-cortex-blue/30' : 'bg-solar-surge-orange/10 border border-solar-surge-orange/30'
                      }`}>
                        {feature.iconImage ? (
                          <img
                            src={feature.iconImage}
                            alt={`${feature.title} icon`}
                            className="w-8 h-8 object-contain"
                            style={{filter: `drop-shadow(0 0 10px ${isBlue ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}}
                          />
                        ) : (
                          <Icon className={`w-6 h-6 ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}
                                style={{filter: `drop-shadow(0 0 10px ${isBlue ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}} />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={`text-xl font-black shimmer-text ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}>
                        {feature.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-300 leading-relaxed pr-12 pb-1">
                      {feature.description}
                    </p>
                    <p className="text-xs text-white/40 pb-2">Tap for audio overview</p>

                    {/* Click Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(feature);
                      }}
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center transition-all cursor-pointer hover:bg-white/20 hover:border-white/50 active:scale-95 animate-pulse"
                      aria-label={`View details for ${feature.title}`}
                    >
                      <MousePointerClick className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>

          {/* Row 5 - 3 Cards: FREE Features - Arm Builder, Speed Lab, Coach's Corner */}
          <StaggerChildren staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {row5Features.map((feature, i) => {
              const Icon = feature.icon;
              const isBlue = feature.color === 'blue';

              return (
                <motion.div
                  key={feature.id}
                  onClick={() => setActiveFeature(feature)}
                  className="group relative cursor-pointer"
                  variants={staggerItemVariants}
                >
                  {/* Glow Effect */}
                  <div className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${
                    isBlue ? 'bg-gradient-to-b from-neon-cortex-blue/30 to-mind-primary/10' : 'bg-gradient-to-b from-solar-surge-orange/30 to-muscle-primary/10'
                  }`} />

                  {/* Card */}
                  <div className={`relative backdrop-blur-sm bg-white/[0.02] p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-105 hover:bg-white/[0.05] h-full ${
                    isBlue ? 'border-neon-cortex-blue/40 hover:border-neon-cortex-blue shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)]' : 'border-solar-surge-orange/40 hover:border-solar-surge-orange shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]'
                  }`}>
                    {/* Video/Image */}
                    <div
                      className="relative aspect-video bg-gradient-to-br from-white/5 to-transparent rounded-xl mb-4 overflow-hidden group/image"
                      ref={(node) => {
                        if (node) {
                          const video = node.querySelector('video');
                          if (video) {
                            // Intersection Observer for mobile auto-play on scroll
                            const observer = new IntersectionObserver(
                              (entries) => {
                                entries.forEach((entry) => {
                                  if (entry.isIntersecting) {
                                    video.currentTime = 0;
                                    video.play().catch(() => {});
                                  } else {
                                    video.pause();
                                    video.currentTime = 0;
                                  }
                                });
                              },
                              { threshold: 0.5 }
                            );
                            observer.observe(node);
                          }
                        }
                      }}
                      onMouseEnter={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          video.currentTime = 0;
                          video.play().catch(() => {/* Ignore autoplay errors */});
                        }
                      }}
                      onMouseLeave={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video) {
                          video.pause();
                          video.currentTime = 0;
                        }
                      }}
                    >
                      {feature.videoUrl ? (
                        <video
                          src={feature.videoUrl}
                          poster={feature.image}
                          className="w-full h-full object-cover opacity-95"
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="auto"
                        />
                      ) : (
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover opacity-95"
                        />
                      )}
                    </div>

                    {/* Icon + Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        isBlue ? 'bg-neon-cortex-blue/10 border border-neon-cortex-blue/30' : 'bg-solar-surge-orange/10 border border-solar-surge-orange/30'
                      }`}>
                        {feature.iconImage ? (
                          <img
                            src={feature.iconImage}
                            alt={`${feature.title} icon`}
                            className="w-8 h-8 object-contain"
                            style={{filter: `drop-shadow(0 0 10px ${isBlue ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}}
                          />
                        ) : (
                          <Icon className={`w-6 h-6 ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}
                                style={{filter: `drop-shadow(0 0 10px ${isBlue ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}} />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={`text-xl font-black shimmer-text ${isBlue ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`}>
                        {feature.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-300 leading-relaxed pr-12 pb-1">
                      {feature.description}
                    </p>
                    <p className="text-xs text-white/40 pb-2">Tap for audio overview</p>

                    {/* Click Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(feature);
                      }}
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center transition-all cursor-pointer hover:bg-white/20 hover:border-white/50 active:scale-95 animate-pulse"
                      aria-label={`View details for ${feature.title}`}
                    >
                      <MousePointerClick className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>

          {/* Anchor Line */}
          <FadeInWhenVisible delay={0.3}>
            <p className="text-center text-lg sm:text-xl text-gray-400 mt-12 font-medium italic">
              Every module feeds the next. Nothing is random.
            </p>
          </FadeInWhenVisible>
        </div>

        {/* Feature Modal */}
        {activeFeature && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn"
            onClick={handleCloseModal}
          >
            <div
              className="relative w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border-2 shadow-[0_8px_60px_rgba(14,165,233,0.3)]"
              style={{
                borderImage: activeFeature.color === 'blue'
                  ? 'linear-gradient(135deg, #0EA5E9, #06B6D4) 1'
                  : 'linear-gradient(135deg, #F97316, #EA580C) 1',
                animation: 'scaleIn 0.2s ease-out',
                WebkitOverflowScrolling: 'touch',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleModalTap();
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border-2 border-white/30 flex items-center justify-center transition-all z-20 shadow-lg"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>

              {/* Hero Image */}
              <div className="w-full max-w-2xl mx-auto aspect-video rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6">
                <img
                  src={activeFeature.image}
                  alt={activeFeature.title}
                  className="w-full h-full object-cover"
                  style={activeFeature.id === 'mind-coach' ? { transform: 'scale(1.44)' } : undefined}
                />
              </div>

              {/* Icon */}
              <div className="mb-4 sm:mb-6">
                <div className={`inline-flex w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl items-center justify-center ${
                  activeFeature.color === 'blue' ? 'bg-neon-cortex-blue/20 border-2 border-neon-cortex-blue/40' : 'bg-solar-surge-orange/20 border-2 border-solar-surge-orange/40'
                }`}>
                  {activeFeature.iconImage ? (
                    <img
                      src={activeFeature.iconImage}
                      alt={`${activeFeature.title} icon`}
                      className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                      style={{filter: `drop-shadow(0 0 12px ${activeFeature.color === 'blue' ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}}
                    />
                  ) : (
                    React.createElement(activeFeature.icon, {
                      className: `w-8 h-8 sm:w-10 sm:h-10 ${activeFeature.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'}`,
                      style: {filter: `drop-shadow(0 0 12px ${activeFeature.color === 'blue' ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}
                    })
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 pr-12 sm:pr-0" style={{textShadow: '0 2px 20px rgba(0,0,0,0.5)'}}>
                {activeFeature.title}
              </h2>

              {/* Tagline */}
              <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-5 sm:mb-6 ${
                activeFeature.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
              }`} style={{textShadow: '0 0 20px rgba(14,165,233,0.4)'}}>
                {activeFeature.tagline}
              </p>

              {/* Audio Player */}
              {activeFeature.audioUrl && (
                <div className="mb-6 sm:mb-8">
                  <button
                    onClick={() => {
                      if (audioElement) {
                        if (isPlaying) {
                          audioElement.pause();
                          setIsPlaying(false);
                        } else {
                          audioElement.play();
                          setIsPlaying(true);
                        }
                      } else {
                        const audio = new Audio(activeFeature.audioUrl);
                        audio.play();
                        setIsPlaying(true);
                        setAudioElement(audio);
                        audio.onended = () => setIsPlaying(false);
                      }
                    }}
                    className={`w-full px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 active:scale-95 sm:hover:scale-105 ${
                      activeFeature.color === 'blue'
                        ? 'bg-neon-cortex-blue/10 border-2 border-neon-cortex-blue hover:bg-neon-cortex-blue/20 text-neon-cortex-blue'
                        : 'bg-solar-surge-orange/10 border-2 border-solar-surge-orange hover:bg-solar-surge-orange/20 text-solar-surge-orange'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                        <span>Pause Audio Guide</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                        <span>Play Audio Guide</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Description */}
              <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed whitespace-pre-line pb-6 sm:pb-0">
                {(activeFeature.modalDescription || activeFeature.description).split('\n').map((line: string, i: number) => {
                  // Handle horizontal rule ---
                  if (line.trim() === '---') {
                    return <hr key={i} className="border-t border-white/20 my-6" />;
                  }

                  // Handle ## Heading
                  if (line.startsWith('## ')) {
                    const headingText = line.slice(3);
                    return (
                      <h3 key={i} className="text-xl sm:text-2xl font-black text-white mt-6 mb-3">
                        {headingText}
                      </h3>
                    );
                  }

                  // Handle list items - **text**
                  if (line.startsWith('- **') && line.includes('**')) {
                    const parts = line.slice(2).split('**');
                    return (
                      <div key={i} className="flex items-start gap-2 ml-2 mb-1">
                        <span className="text-neon-cortex-blue mt-1">•</span>
                        <p>
                          {parts.map((part, j) =>
                            j % 2 === 1 ? <strong key={j} className="text-white font-bold">{part}</strong> : part
                          )}
                        </p>
                      </div>
                    );
                  }

                  // Handle plain list items
                  if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="flex items-start gap-2 ml-2 mb-1">
                        <span className="text-neon-cortex-blue mt-1">•</span>
                        <p>{line.slice(2)}</p>
                      </div>
                    );
                  }

                  // Check if line starts with ** and ends with **
                  if (line.startsWith('**') && line.endsWith('**')) {
                    const boldText = line.slice(2, -2);
                    return (
                      <p key={i} className="text-white font-black mt-4 mb-2">
                        {boldText}
                      </p>
                    );
                  }

                  // Handle inline bold text with **text**
                  if (line.includes('**')) {
                    const parts = line.split('**');
                    return (
                      <p key={i}>
                        {parts.map((part, j) =>
                          j % 2 === 1 ? <strong key={j} className="text-white font-black">{part}</strong> : part
                        )}
                      </p>
                    );
                  }

                  return line ? <p key={i}>{line}</p> : <br key={i} />;
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Mind & Muscle Daily Hit - FREE Feature Showcase */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Deep Navy Background with Orange Accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#14182E] to-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.12)_0%,transparent_60%)]" />

        {/* Subtle animated glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-solar-surge-orange/10 rounded-full blur-[120px] animate-pulse" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="px-6 py-2 backdrop-blur-sm bg-solar-surge-orange/15 border-2 border-solar-surge-orange/50 rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <span className="text-solar-surge-orange font-black text-sm tracking-widest drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">
                  🔥 FREE FEATURE • DAILY MOTIVATION
                </span>
              </div>
            </div>
            <GradientTextReveal
              text="Daily Mental Reps for Every Athlete"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-relaxed"
              gradientFrom="#F97316"
              gradientTo="#0EA5E9"
              delay={0.2}
            />
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
              Mental reps — same as hitting or throwing. These aren&apos;t just quotes. They&apos;re short, repeatable lessons that train focus, resilience, and composure. <span className="text-solar-surge-orange font-bold">Always free.</span>
            </p>
          </FadeInWhenVisible>

          {/* Video Player */}
          <FadeInWhenVisible delay={0.3} direction="up" className="mb-16">
            <div className="max-w-md mx-auto">
              <div
                className="relative aspect-[9/16] rounded-3xl overflow-hidden cursor-pointer group
                  border-2 border-solar-surge-orange/40
                  shadow-[0_0_60px_rgba(249,115,22,0.25)]
                  hover:shadow-[0_0_80px_rgba(249,115,22,0.4)]
                  transition-shadow duration-500"
                onClick={() => {
                  if (dailyHitVideoRef.current) {
                    if (isDailyHitPlaying) {
                      dailyHitVideoRef.current.pause();
                    } else {
                      dailyHitVideoRef.current.play();
                    }
                    setIsDailyHitPlaying(!isDailyHitPlaying);
                  }
                }}
              >
                {/* Video */}
                <video
                  ref={dailyHitVideoRef}
                  src="/assets/videos/daily_hit_example.mp4"
                  className="w-full h-full object-cover"
                  playsInline
                  onEnded={() => setIsDailyHitPlaying(false)}
                />

                {/* Play/Pause Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${isDailyHitPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-solar-surge-orange to-solar-surge-orange/80
                    flex items-center justify-center
                    hover:scale-110 transition-all duration-300
                    shadow-[0_0_40px_rgba(249,115,22,0.6)]
                    ${!isDailyHitPlaying ? 'animate-pulse' : ''}`}>
                    {isDailyHitPlaying ? (
                      <Pause className="w-12 h-12 text-white" />
                    ) : (
                      <Play className="w-12 h-12 text-white ml-1" />
                    )}
                  </div>
                </div>

                {/* Corner Badge */}
                <div className="absolute top-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg border border-solar-surge-orange/40">
                  <span className="text-sm font-bold text-solar-surge-orange">🔥 Daily Hit Example: Unbreakable Minds</span>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>

          {/* Feature Cards */}
          <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Practice */}
            <motion.div variants={staggerItemVariants}>
              <LiquidGlass variant="orange" glow={true} className="p-6 h-full text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-black text-white mb-2">Practice</h3>
                <p className="text-gray-300 leading-relaxed">
                  New mental reps delivered daily at 8 AM. Short, focused lessons that build focus, composure, and confidence.
                </p>
              </LiquidGlass>
            </motion.div>

            {/* Skill */}
            <motion.div variants={staggerItemVariants}>
              <LiquidGlass variant="orange" glow={true} className="p-6 h-full text-center">
                <div className="text-4xl mb-4">🔥</div>
                <h3 className="text-xl font-black text-white mb-2">Skill</h3>
                <p className="text-gray-300 leading-relaxed">
                  Track your streak. Watch your mental toughness compound. Repetition turns lessons into reflexes.
                </p>
              </LiquidGlass>
            </motion.div>

            {/* Habit */}
            <motion.div variants={staggerItemVariants}>
              <LiquidGlass variant="orange" glow={true} className="p-6 h-full text-center">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-black text-white mb-2">Habit</h3>
                <p className="text-gray-300 leading-relaxed">
                  2 minutes a day that separates good athletes from great ones. Mental strength becomes automatic.
                </p>
              </LiquidGlass>
            </motion.div>
          </StaggerChildren>

          {/* Bottom Callout */}
          <FadeInWhenVisible delay={0.6} direction="up" className="text-center">
            <div className="inline-block">
              <div className="px-8 py-6 bg-gradient-to-r from-solar-surge-orange/20 via-neon-cortex-blue/10 to-solar-surge-orange/20 backdrop-blur-md border-2 border-solar-surge-orange/40 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                  The best athletes train their minds every single day.<br />
                  <span className="bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue bg-clip-text text-transparent">
                    This is where that starts.
                  </span>
                </p>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* The Secret Weapon - AI Learning Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Deep Navy Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1123] via-[#0A0E1F] to-[#0F1123]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15)_0%,transparent_50%,rgba(249,115,22,0.1)_100%)]" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="px-6 py-2 backdrop-blur-sm bg-solar-surge-orange/10 border-2 border-solar-surge-orange/40 rounded-lg">
                <span className="text-solar-surge-orange font-black text-sm tracking-widest drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">⚡ THE UNFAIR ADVANTAGE</span>
              </div>
            </div>
            <GradientTextReveal
              text="AI That Actually Learns How You Play"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-relaxed"
              gradientFrom="#0EA5E9"
              gradientTo="#F97316"
              delay={0.2}
            />
            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
              Week 1: solid suggestions. Week 4: knows your weak spots. Month 3: feels like a real coach who&apos;s been with you all season.
            </p>
          </FadeInWhenVisible>

          {/* Three Column Progression */}
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Week 1 */}
            <motion.div variants={staggerItemVariants}>
              <LiquidGlass variant="blue" glow={true} className="p-8 h-full">
                <div className="text-center">
                  <div className="text-5xl font-black text-neon-cortex-blue mb-4">Week 1</div>
                  <div className="text-2xl font-bold mb-4">🎯 Smart Coaching</div>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Solid training plans based on your goals
                  </p>
                </div>
              </LiquidGlass>
            </motion.div>

            {/* Week 4 */}
            <motion.div variants={staggerItemVariants}>
              <LiquidGlass variant="orange" glow={true} className="p-8 h-full">
                <div className="text-center">
                  <div className="text-5xl font-black text-solar-surge-orange mb-4">Week 4</div>
                  <div className="text-2xl font-bold mb-4">🧠 Learning Your Patterns</div>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Recognizes what works for YOUR swing, YOUR mentality, YOUR recovery
                  </p>
                </div>
              </LiquidGlass>
            </motion.div>

            {/* Week 12 */}
            <motion.div variants={staggerItemVariants}>
              <LiquidGlass variant="blue" glow={true} className="p-8 h-full">
                <div className="text-center">
                  <div className="text-5xl font-black bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent mb-4">Week 12</div>
                  <div className="text-2xl font-bold mb-4">🚀 UNSTOPPABLE</div>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Recognizes when you're ready for the next level. Adjusts training intensity based on your performance patterns. Personalized to how you actually play.
                  </p>
                </div>
              </LiquidGlass>
            </motion.div>
          </StaggerChildren>

          {/* Callout */}
          <FadeInWhenVisible delay={0.4} direction="up" className="text-center mb-8">
            <p className="text-lg sm:text-xl text-gray-400 italic max-w-3xl mx-auto">
              This isn&apos;t generic training. Every plan adapts to how you work, play, and recover.
            </p>
          </FadeInWhenVisible>

          {/* Bottom Callout */}
          <FadeInWhenVisible delay={0.6} direction="up" className="text-center">
            <div className="inline-block">
              <div className="px-8 py-6 bg-gradient-to-r from-neon-cortex-blue/20 via-solar-surge-orange/20 to-neon-cortex-blue/20 backdrop-blur-md border-2 border-neon-cortex-blue/40 rounded-2xl">
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                  This is why the best players never miss a session.<br />
                  <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
                    Their AI coach gets scary good.
                  </span>
                </p>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* App Screenshots Carousel Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Deep Navy to Black Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E1F] via-[#0F1123] to-[#0A0E1F]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />

        {/* Subtle Baseball Stitching Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(255,255,255,0.1) 100px, rgba(255,255,255,0.1) 102px)',
        }} />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="px-6 py-2 backdrop-blur-sm bg-neon-cortex-blue/10 border-2 border-neon-cortex-blue/40 rounded-lg">
                <span className="text-neon-cortex-blue font-black text-sm tracking-widest drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]">⚾ PREVIEW THE PLATFORM</span>
              </div>
            </div>
            <GradientTextReveal
              text="Where Champions Train"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-relaxed"
              gradientFrom="#0EA5E9"
              gradientTo="#F97316"
              delay={0.2}
            />
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed mb-4">
              Swipe through what&apos;s inside. Each screen is purpose-built for athletes in the diamond game.
            </p>
          </FadeInWhenVisible>

          {/* Carousel */}
          <FadeInWhenVisible delay={0.4} direction="up">
            <AppScreenshotCarousel />
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Baseball Obsession - Conviction-Driven Section */}
      <section id="features" className="relative py-48 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Dark Gradient Background with Deep Navy */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E1F] via-[#14182E] to-[#0A0E1F]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />

        {/* Subtle Baseball Stitching Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(255,255,255,0.1) 100px, rgba(255,255,255,0.1) 102px)',
        }} />

        {/* Logo Watermark - Larger and More Prominent */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
          <Image
            src="/assets/images/logo.png"
            alt=""
            width={1200}
            height={1200}
            className="object-contain"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main Headline */}
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-[1.1]">
              <span className="bg-gradient-to-r from-neon-cortex-blue via-mind-primary to-solar-surge-orange bg-clip-text text-transparent" style={{textShadow: '0 0 40px rgba(14,165,233,0.5)'}}>
                We Only Build for the Diamond.
              </span>
            </h2>
            {/* Opening Statement */}
            <div className="max-w-5xl mx-auto mb-20">
              <p className="text-2xl sm:text-3xl md:text-4xl text-gray-300 font-medium leading-relaxed mb-8">
                Every feature, every lesson, every AI insight — made specifically for baseball and softball athletes.
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl text-white font-black leading-relaxed mb-6">
                No generic content. No borrowed frameworks. Just pure diamond sport training.
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-medium leading-relaxed">
                Every drill designed for baseball and softball movements. Every AI model trained exclusively on baseball and softball content. Every mental scenario pulled from real game situations.
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl text-neon-cortex-blue font-black leading-relaxed mt-8" style={{textShadow: '0 0 20px rgba(14,165,233,0.8)'}}>
                This wasn't adapted. It was purpose-built.
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="max-w-6xl mx-auto mb-20">
              <div className="space-y-8">

                {/* Row 1: AI */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="backdrop-blur-sm bg-white/5 border-2 border-red-500/30 rounded-2xl p-8">
                    <div className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3">Their AI</div>
                    <p className="text-2xl text-gray-400 font-medium">No AI capabilities</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/5 border-2 border-neon-cortex-blue/50 rounded-2xl p-8">
                    <div className="text-neon-cortex-blue font-bold text-sm uppercase tracking-wider mb-3">Our AI</div>
                    <p className="text-2xl text-white font-black">Learns from every swing, journal entry, and workout—continuously improving with countless baseball and softball-specific data points</p>
                  </div>
                </div>

                {/* Row 2: Mental Training */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="backdrop-blur-sm bg-white/5 border-2 border-red-500/30 rounded-2xl p-8">
                    <div className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3">Their Mental Training</div>
                    <p className="text-2xl text-gray-400 font-medium">Generic "focus and confidence"</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/5 border-2 border-neon-cortex-blue/50 rounded-2xl p-8">
                    <div className="text-neon-cortex-blue font-bold text-sm uppercase tracking-wider mb-3">Our Mental Training</div>
                    <p className="text-2xl text-white font-black">186 real game scenarios</p>
                  </div>
                </div>

                {/* Row 3: Drills */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="backdrop-blur-sm bg-white/5 border-2 border-red-500/30 rounded-2xl p-8">
                    <div className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3">Their Drills</div>
                    <p className="text-2xl text-gray-400 font-medium">Adapted for general sports focus</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/5 border-2 border-neon-cortex-blue/50 rounded-2xl p-8">
                    <div className="text-neon-cortex-blue font-bold text-sm uppercase tracking-wider mb-3">Our Drills</div>
                    <p className="text-2xl text-white font-black">Custom-built for baseball and softball movements</p>
                  </div>
                </div>

                {/* Row 4: Approach */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="backdrop-blur-sm bg-white/5 border-2 border-red-500/30 rounded-2xl p-8">
                    <div className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3">Their Approach</div>
                    <p className="text-2xl text-gray-400 font-medium">Modify existing templates</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/5 border-2 border-neon-cortex-blue/50 rounded-2xl p-8">
                    <div className="text-neon-cortex-blue font-bold text-sm uppercase tracking-wider mb-3">Our Approach</div>
                    <p className="text-2xl text-white font-black">Built from zero for baseball and softball</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Closing Statement */}
            <div className="mt-20 pt-16 border-t border-white/10 max-w-4xl mx-auto text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl font-medium text-gray-300 leading-tight mb-4">
                Every other app tried to be everything to everyone.
              </p>
              <p className="text-4xl sm:text-5xl md:text-6xl font-black leading-relaxed mb-4">
                <span className="text-white">We became obsessed with </span>
                <span className="text-solar-surge-orange" style={{textShadow: '0 0 30px rgba(249,115,22,0.6)'}}>one thing.</span>
              </p>
              <p className="text-5xl sm:text-6xl md:text-7xl font-black text-neon-cortex-blue mt-8" style={{textShadow: '0 0 40px rgba(14,165,233,0.8)'}}>
                Baseball & Softball.
              </p>
            </div>
          </div>

          {/* Three Pillars Layout */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Pillar 1: Mental Edge */}
            <div className="group relative">
              {/* Mind Blue Glow */}
              <div className="absolute -inset-4 bg-gradient-to-b from-neon-cortex-blue/20 to-mind-primary/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-neon-cortex-blue/30 transition-all duration-500 hover:bg-white/[0.05] h-full">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cortex-blue/20 to-mind-primary/10 flex items-center justify-center border border-neon-cortex-blue/30">
                    <Brain className="w-8 h-8 text-neon-cortex-blue" style={{filter: 'drop-shadow(0 0 12px rgba(14,165,233,0.8))'}} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-black mb-4 text-neon-cortex-blue" style={{textShadow: '0 0 20px rgba(14,165,233,0.4)'}}>
                  Mental Edge
                </h3>

                {/* Description */}
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  Pressure simulation, focus under fire, resilience training. Built for the moments that define games.
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {[
                    'Pre-at-bat focus meditation',
                    'Pressure moment training',
                    'Mental armor for slumps',
                    'Game-day visualization',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-neon-cortex-blue rounded-full mt-2" style={{boxShadow: '0 0 8px rgba(14,165,233,0.8)'}} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pillar 2: Physical Precision */}
            <div className="group relative">
              {/* Muscle Orange Glow */}
              <div className="absolute -inset-4 bg-gradient-to-b from-solar-surge-orange/20 to-muscle-primary/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-solar-surge-orange/30 transition-all duration-500 hover:bg-white/[0.05] h-full">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-solar-surge-orange/20 to-muscle-primary/10 flex items-center justify-center border border-solar-surge-orange/30">
                    <Dumbbell className="w-8 h-8 text-solar-surge-orange" style={{filter: 'drop-shadow(0 0 12px rgba(249,115,22,0.8))'}} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-black mb-4 text-solar-surge-orange" style={{textShadow: '0 0 20px rgba(249,115,22,0.4)'}}>
                  Physical Precision
                </h3>

                {/* Description */}
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  AI workouts built by position and workload. Swing mechanics analysis. Recovery protocols.
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {[
                    'Pitcher vs. catcher workouts',
                    'Position-specific training',
                    'Swing Lab AI video analysis',
                    'Plate IQ pitch anticipation',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-solar-surge-orange rounded-full mt-2" style={{boxShadow: '0 0 8px rgba(249,115,22,0.8)'}} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pillar 3: Game IQ */}
            <div className="group relative">
              {/* Neutral White Glow */}
              <div className="absolute -inset-4 bg-gradient-to-b from-white/10 to-white/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative backdrop-blur-sm bg-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:bg-white/[0.05] h-full">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/20">
                    <Zap className="w-8 h-8 text-white" style={{filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.6))'}} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-black mb-4 text-white" style={{textShadow: '0 0 20px rgba(255,255,255,0.3)'}}>
                  Game IQ
                </h3>

                {/* Description */}
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  Situational intelligence and real-time decision drills. Baseball IQ that wins championships.
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {[
                    'Situational training scenarios',
                    'Real-time decision making',
                    'Baseball-specific IQ tests',
                    'Championship mindset drills',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2" style={{boxShadow: '0 0 8px rgba(255,255,255,0.6)'}} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Statement - Premium Pill */}
          <div className="text-center">
            <div className="inline-block relative group">
              {/* Animated Glow */}
              <div className="absolute -inset-6 bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange to-neon-cortex-blue opacity-30 blur-3xl group-hover:opacity-50 transition-opacity animate-pulse" />

              <div className="relative px-12 py-6 bg-gradient-to-r from-neon-cortex-blue/10 via-solar-surge-orange/10 to-neon-cortex-blue/10 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black">
                  <span className="text-white">This isn't motivation. It's </span>
                  <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent" style={{textShadow: '0 0 30px rgba(14,165,233,0.5)'}}>
                    mental and physical armor
                  </span>
                  <span className="text-white">.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Comparison - Baseball Lineup Card Design */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Deep Navy Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0F1123] to-[#0a0e1a]" />
        {/* Subtle field texture */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-24">
            <div className="inline-block mb-6">
              <div className="px-6 py-2 backdrop-blur-sm bg-neon-cortex-blue/10 border-2 border-neon-cortex-blue/40 rounded-lg">
                <span className="text-neon-cortex-blue font-black text-sm tracking-widest drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]">⚾ LINEUP COMPARISON</span>
              </div>
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-[1.1]">
              <span className="bg-gradient-to-r from-neon-cortex-blue via-mind-primary to-solar-surge-orange bg-clip-text text-transparent" style={{textShadow: '0 0 40px rgba(14,165,233,0.5)'}}>
                Depth Over Fragmentation.
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
              Other platforms make you piece together your own training stack. We built a complete system — so athletes actually use it.
            </p>
          </FadeInWhenVisible>

          {/* Lineup Card */}
          <ScaleInWhenVisible delay={0.3} className="max-w-6xl mx-auto">
            <div className="backdrop-blur-md bg-[#0F1123]/60 rounded-3xl border-2 border-white/10 overflow-hidden shadow-[0_20px_100px_rgba(0,0,0,0.9)]">
              <div className="grid md:grid-cols-2 gap-0 relative">
                {/* VS Divider */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange blur-2xl opacity-60" />
                    <div className="relative bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange text-white font-black text-2xl px-8 py-4 rounded-xl border-3 border-[#0F1123] shadow-[0_0_30px_rgba(14,165,233,0.6)]">
                      VS
                    </div>
                  </div>
                </div>

                {/* Their Roster Column */}
                <div className="p-10 md:p-14 border-r-2 border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent relative">
                  {/* Subtle red warning glow */}
                  <div className="absolute inset-0 bg-red-500/5 opacity-30" />

                  <div className="relative">
                    {/* Header */}
                    <div className="mb-8 pb-4 border-b-2 border-dashed border-red-500/30">
                      <h3 className="text-xl font-black text-white tracking-wider drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">GENERIC APPS</h3>
                      <p className="text-sm text-gray-400 mt-1">Separate subscriptions</p>
                    </div>

                    {/* Starting Lineup */}
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-red-400 mb-4 tracking-wide drop-shadow-[0_0_6px_rgba(239,68,68,0.3)]">STARTERS</h4>
                      <div className="space-y-4">
                        {[
                          { num: '1', name: 'Mental Training', price: '$80/yr', icon: Brain },
                          { num: '2', name: 'Workout Planner', price: '$120/yr', icon: Dumbbell },
                          { num: '3', name: 'Video Analysis', price: '$180/yr', icon: Video },
                          { num: '4', name: 'Nutrition Tracker', price: '$50/yr', icon: Apple },
                          { num: '5', name: 'Baseball IQ', price: '$40/yr', icon: Award },
                          { num: '6', name: 'Focus & Sound', price: '$80/yr', icon: Music },
                          { num: '7', name: '5 Hitting Lessons', price: '$550/yr', icon: Users, highlight: true },
                        ].map((item, i) => {
                          const Icon = item.icon;
                          return (
                            <div key={i} className={`flex items-center justify-between py-2 border-b border-dotted border-white/10 ${item.highlight ? 'bg-red-500/10 -mx-3 px-3 py-3 rounded-lg' : ''}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                                  <span className="text-xs font-black text-red-400">{item.num}</span>
                                </div>
                                <Icon className="w-4 h-4 text-gray-400" />
                                <span className={`text-base font-medium ${item.highlight ? 'text-white font-bold' : 'text-white'}`}>
                                  {item.name}
                                  {item.highlight && <span className="text-xs text-gray-400 ml-2">($110/hr)</span>}
                                </span>
                              </div>
                              <span className={`text-lg font-bold ${item.highlight ? 'text-white' : 'text-gray-300'}`}>{item.price}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bench */}
                    <div className="mb-8 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                      <h4 className="text-sm font-bold text-red-400 mb-3 tracking-wide">BENCH</h4>
                      <p className="text-sm text-gray-400 italic flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" /> No free features
                      </p>
                    </div>

                    {/* Coaching */}
                    <div className="mb-10 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                      <h4 className="text-sm font-bold text-red-400 mb-3 tracking-wide">COACHING</h4>
                      <p className="text-sm text-gray-400 italic flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" /> Generic content
                      </p>
                    </div>

                    {/* Total */}
                    <div className="pt-6 border-t-2 border-red-500/40">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg text-white font-bold">TOTAL</span>
                        <div className="text-right">
                          <div className="text-4xl sm:text-5xl font-black text-white line-through decoration-red-500 decoration-4 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                            $1,100
                          </div>
                          <div className="text-xs text-gray-400 mt-1">per 6 months</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mind & Muscle Full Roster Column */}
                <div className="p-10 md:p-14 bg-gradient-to-br from-neon-cortex-blue/8 via-transparent to-solar-surge-orange/8 relative">
                  {/* Animated glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-neon-cortex-blue via-solar-surge-orange to-neon-cortex-blue opacity-20 blur-2xl rounded-3xl animate-pulse" />

                  <div className="relative">
                    {/* Header with Logo */}
                    <div className="mb-8 pb-4 border-b-2 border-dashed border-neon-cortex-blue/40 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black text-white tracking-wider drop-shadow-[0_0_12px_rgba(14,165,233,0.6)]">MIND & MUSCLE</h3>
                        <p className="text-sm text-neon-cortex-blue mt-1 font-semibold">All-in-one system</p>
                      </div>
                      <img
                        src="/assets/images/logo.png"
                        alt="Mind & Muscle"
                        className="w-16 h-16 drop-shadow-[0_0_20px_rgba(14,165,233,0.6)]"
                      />
                    </div>

                    {/* Starting Lineup */}
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-neon-cortex-blue mb-4 tracking-wide drop-shadow-[0_0_8px_rgba(14,165,233,0.4)]">STARTERS</h4>
                      <div className="space-y-4">
                        {[
                          { num: '1', name: 'Mind AI Coach + Library', icon: Brain, desc: 'Baseball and softball mental training' },
                          { num: '2', name: 'Muscle AI Coach', icon: Dumbbell, desc: 'Position-specific workouts' },
                          { num: '3', name: 'Swing Lab', icon: Video, desc: 'AI swing analysis' },
                          { num: '4', name: 'Pitch Lab', icon: TrendingUp, desc: 'AI pitching analysis + arm health' },
                          { num: '5', name: 'Plate IQ', icon: TrendingUp, desc: 'Pitch anticipation training' },
                          { num: '6', name: 'Game Lab', icon: Award, desc: 'All levels unlocked' },
                          { num: '7', name: 'Sound Lab', icon: Music, desc: 'Customize frequencies for peak mental state' },
                          { num: '8', name: 'Fuel AI', icon: Apple, desc: 'Position-based nutrition' },
                          { num: '9', name: 'AI Assistant Coach', icon: Users, desc: 'Custom drill builder' },
                          { num: '10', name: 'Goals AI', icon: Award, desc: 'Enhanced, shareable goals' },
                        ].map((item, i) => {
                          const Icon = item.icon;
                          return (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-dotted border-white/10">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(14,165,233,0.5)]">
                                  <span className="text-xs font-black text-white">{item.num}</span>
                                </div>
                                <Icon className="w-4 h-4 text-neon-cortex-blue drop-shadow-[0_0_6px_rgba(14,165,233,0.4)]" />
                                <div className="flex flex-col">
                                  <span className="text-base text-white font-medium">{item.name}</span>
                                  <span className="text-xs text-gray-400">{item.desc}</span>
                                </div>
                              </div>
                              <Check className="w-5 h-5 text-neon-cortex-blue drop-shadow-[0_0_8px_rgba(14,165,233,0.6)] flex-shrink-0" strokeWidth={3} />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bench - FREE */}
                    <div className="mb-8 p-4 bg-neon-cortex-blue/15 rounded-lg border-2 border-neon-cortex-blue/40 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                      <h4 className="text-sm font-bold text-neon-cortex-blue mb-3 tracking-wide flex items-center gap-2 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]">
                        BENCH <span className="text-xs bg-gradient-to-r from-solar-surge-orange to-orange-600 text-white px-3 py-1 rounded-full font-black shadow-[0_0_12px_rgba(249,115,22,0.6)]">FREE</span>
                      </h4>
                      <div className="space-y-2 text-sm text-white">
                        {[
                          { num: '11', name: 'Daily Hit (audio motivation)' },
                          { num: '12', name: 'Field Notes (performance log)' },
                          { num: '13', name: 'Breathwork & Visualizations' },
                          { num: '14', name: 'Chatter & Events' },
                          { num: '15', name: "Coach's Corner" },
                          { num: '16', name: 'Parent Dashboard' },
                          { num: '17', name: 'Arm Builder (arm care & long toss)' },
                          { num: '18', name: 'Speed Lab (baserunning intelligence)' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.4)]">
                              <span className="text-[10px] font-black text-white">{item.num}</span>
                            </div>
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coaching Staff - AI */}
                    <div className="mb-10 p-4 bg-solar-surge-orange/15 rounded-lg border-2 border-solar-surge-orange/40 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                      <h4 className="text-sm font-bold text-solar-surge-orange mb-3 tracking-wide drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">COACHING STAFF</h4>
                      <ul className="space-y-2 text-sm text-white">
                        <li className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-solar-surge-orange drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" /> 8 AI coaches learn YOUR game
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-solar-surge-orange drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" /> Position-specific training plans
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-solar-surge-orange drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" /> 100% baseball and softball-focused content
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-solar-surge-orange drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" /> Everything syncs together
                        </li>
                      </ul>
                    </div>

                    {/* Total */}
                    <div className="pt-6 border-t-2 border-neon-cortex-blue/50">
                      <div className="flex items-baseline justify-between mb-4">
                        <span className="text-lg text-white font-bold">TOTAL</span>
                        <div className="text-right">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange blur-3xl opacity-80 animate-pulse" />
                            <div className="relative flex items-center gap-3">
                              <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-neon-cortex-blue via-mind-primary to-solar-surge-orange bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(14,165,233,0.8)]">
                                $79
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-text-secondary mt-1 font-semibold">per 6 months</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScaleInWhenVisible>

          {/* Championship Difference Callout - BOLD & DRAMATIC */}
          <FadeInWhenVisible delay={0.5} direction="up" className="text-center mt-20">
              <div className="max-w-5xl mx-auto relative">
                <div className="relative">
                  {/* Trophy Badge - Large & Bold */}
                  <div className="inline-block mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange blur-2xl opacity-60" />
                      <div className="relative px-8 py-3 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange rounded-full border-2 border-white/20 shadow-[0_0_40px_rgba(14,165,233,0.6)]">
                        <span className="text-white font-black text-lg tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🏆 THE CHAMPIONSHIP DIFFERENCE</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Content - High Contrast Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Their Side - Red Warning */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-red-500 blur-2xl opacity-10 group-hover:opacity-15 transition-opacity -z-10" />
                      <div className="relative backdrop-blur-xl bg-gradient-to-br from-red-500/15 to-red-900/10 border-2 border-red-500/40 rounded-2xl p-8 hover:border-red-500/60 transition-all shadow-[0_8px_32px_rgba(239,68,68,0.3)]">
                        <div className="flex items-center gap-3 mb-6">
                          <X className="w-8 h-8 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                          <h5 className="text-2xl font-black text-white">Generic Apps</h5>
                        </div>
                        <ul className="space-y-3 text-base text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">✗</span> Generic content for all sports
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">✗</span> No coordination between apps
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">✗</span> No family/coach features
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">✗</span> Still need hitting lessons
                          </li>
                          <li className="flex items-start gap-2 pt-3 border-t border-red-500/30">
                            <span className="text-red-500 mt-1">✗</span> <span className="font-black text-white text-xl">$1,100/year</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Our Side - Blue/Orange Win */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange blur-2xl opacity-15 group-hover:opacity-25 transition-opacity -z-10" />
                      <div className="relative backdrop-blur-xl bg-gradient-to-br from-neon-cortex-blue/15 via-transparent to-solar-surge-orange/15 border-2 border-neon-cortex-blue/40 rounded-2xl p-8 hover:border-neon-cortex-blue/60 transition-all shadow-[0_8px_32px_rgba(14,165,233,0.4)]">
                        <div className="flex items-center gap-3 mb-6">
                          <Check className="w-8 h-8 text-neon-cortex-blue drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]" strokeWidth={3} />
                          <h5 className="text-2xl font-black text-white">Mind & Muscle</h5>
                        </div>
                        <ul className="space-y-3 text-base text-white">
                          <li className="flex items-start gap-2">
                            <span className="text-neon-cortex-blue mt-1 font-black">✓</span> 8 AI coaches learn YOUR game
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-neon-cortex-blue mt-1 font-black">✓</span> Everything syncs together
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-neon-cortex-blue mt-1 font-black">✓</span> PLUS 6 free team/family features
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-neon-cortex-blue mt-1 font-black">✓</span> Baseball and softball training library
                          </li>
                          <li className="flex items-start gap-2 pt-3 border-t border-neon-cortex-blue/40">
                            <span className="text-neon-cortex-blue mt-1 font-black">✓</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-white text-xl">$79 per 6 months</span>
                              </div>
                              <div className="text-xs text-text-secondary">Individual License</div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="mt-10">
                    <p className="text-2xl font-black text-white mb-3 drop-shadow-[0_0_16px_rgba(14,165,233,0.4)]">
                      <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">10× The Value.</span> 1/10th The Cost.
                    </p>
                    <p className="text-gray-400 text-base mb-6">Less than ONE hitting lesson for an entire year of elite training.</p>

                    {/* AI Learning Callout */}
                    <div className="mb-6 p-6 bg-gradient-to-r from-neon-cortex-blue/10 to-solar-surge-orange/10 border border-neon-cortex-blue/30 rounded-xl">
                      <p className="text-white text-lg leading-relaxed">
                        Our AI doesn't just respond—it <span className="text-neon-cortex-blue font-black drop-shadow-[0_0_12px_rgba(14,165,233,0.6)]">learns</span>. Every workout, every field note, every swing analysis feeds the engine. In 30 days, you'll get recommendations that feel like they're from a coach who's known you for years.
                      </p>
                    </div>

                    {/* App Store Price */}
                    <div className="bg-gradient-to-r from-neon-cortex-blue/20 to-solar-surge-orange/20 border-2 border-neon-cortex-blue/40 rounded-xl px-6 py-3 mb-3 inline-block">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-white font-bold">Individual Pro:</span>
                        <span className="text-3xl font-black bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">$79 per 6 months</span>
                      </div>
                    </div>

                    {/* Team Licensing Link */}
                    <div className="text-center">
                      <a
                        href="/team-licensing"
                        className="inline-flex items-center gap-2 text-neon-cortex-blue hover:text-solar-surge-orange transition-colors font-semibold text-sm group"
                      >
                        <Users className="w-4 h-4" />
                        <span>Teams: Get 10-20% off bulk licenses</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </a>
                      <p className="text-xs text-gray-500 mt-1">12 users minimum</p>
                    </div>
                  </div>
                </div>
              </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Free Tier Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up" className="text-center mb-20">
            <div className="inline-block mb-8">
              <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-6 py-3">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-neon-cortex-blue drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
                  <span className="text-base md:text-lg font-bold">TRY BEFORE YOU BUY</span>
                </div>
              </LiquidGlass>
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-relaxed">
              Start Free. Stay Free.
              <br />
              <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent drop-shadow-[0_0_32px_rgba(14,165,233,0.4)]">
                Or Unlock Everything.
              </span>
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-text-secondary max-w-4xl mx-auto leading-relaxed font-medium">
              The free tier isn't a trial—it's fully functional. Team communication, daily motivation, journal tracking, and Game Lab Level 1. Forever free. No credit card required.
            </p>
          </FadeInWhenVisible>

          <StaggerChildren staggerDelay={0.15} className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <motion.div variants={staggerItemVariants}>
              <LiquidGlass variant="blue" glow={true} className="p-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-4xl md:text-5xl font-black">Free Forever</h3>
                <div className="text-5xl md:text-6xl font-black text-neon-cortex-blue drop-shadow-[0_0_24px_rgba(14,165,233,0.6)]">$0</div>
              </div>
              <p className="text-text-secondary mb-8 text-lg md:text-xl">Perfect for trying the app and staying connected with your team</p>
              <ul className="space-y-4 mb-10">
                {[
                  'Chatter: Full team communication',
                  'Events: Team scheduling & calendar',
                  'Daily Hit: Motivational content',
                  'Dugout Talk: Field notes (performance log)',
                  'Game Lab Level 1: Baseball IQ basics',
                  'Breathwork: Guided breathing exercises',
                  'Arm Builder: Arm care & throwing routines',
                  'Speed Lab: Baserunning intelligence',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-base md:text-lg text-gray-300">
                    <div className="w-2 h-2 bg-neon-cortex-blue rounded-full flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="block w-full px-12 py-5 text-lg font-semibold font-poppins text-center rounded-2xl border border-neon-cortex-blue/30 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(15,17,35,0.8) 0%, rgba(27,31,57,0.6) 60%, rgba(14,165,233,0.1) 100%)',
                  boxShadow: '0 4px 12px rgba(14,165,233,0.2), 0 2px 6px rgba(0,0,0,0.3), 0 2px 6px -2px rgba(14,165,233,0.1) inset'
                }}
              >
                Download Free
              </a>
            </LiquidGlass>
            </motion.div>

            {/* Premium */}
            <motion.div variants={staggerItemVariants} className="relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                <LiquidGlass variant="orange" rounded="full" padding="none" glow={true} className="px-6 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-base font-bold bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
                      🔥 BEST VALUE
                    </span>
                  </div>
                </LiquidGlass>
              </div>
              <LiquidGlass variant="orange" glow={true} className="p-10">
                <div className="flex items-center justify-between mb-4">
                <h3 className="text-4xl md:text-5xl font-black">Pro</h3>
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-2">
                    <div className="text-5xl md:text-6xl font-black text-solar-surge-orange drop-shadow-[0_0_24px_rgba(249,115,22,0.6)]">$79</div>
                    <div className="text-xl md:text-2xl text-text-secondary font-semibold">/6 months</div>
                  </div>
                  <div className="text-sm text-text-secondary mt-1">Individual License</div>
                </div>
              </div>
              <p className="text-center text-gray-400 italic text-sm mb-6">This is how serious athletes train.</p>

              {/* Team Licensing Callout */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-neon-cortex-blue/20 via-solar-surge-orange/10 to-transparent border-2 border-neon-cortex-blue/40">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-neon-cortex-blue" />
                  <span className="font-bold text-neon-cortex-blue">Team of 12+?</span>
                </div>
                <p className="text-sm text-text-secondary mb-2">
                  Save up to 20% with team licensing — as low as $63.20/seat per 6 months
                </p>
                <Link
                  href="/team-licensing"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-solar-surge-orange hover:text-solar-surge-orange/80 transition-colors"
                >
                  View team pricing <span className="text-lg">→</span>
                </Link>
              </div>

              <p className="text-text-secondary mb-8 text-lg md:text-xl">Everything free has, plus 8 AI coaches and unlimited access</p>
              <ul className="space-y-4 mb-8">
                {[
                  'Everything in Free',
                  'Mind AI Coach: Mental toughness training',
                  'Muscle AI Coach: All workouts',
                  'Swing Lab: AI swing analysis',
                  'Pitch Lab: AI pitching analysis + arm health',
                  'Plate IQ: Pitch anticipation training',
                  'Game Lab: All levels unlocked',
                  'Sound Lab: Customize frequencies for peak mental state',
                  'Fuel AI: Position-specific nutrition',
                  'Goals AI: Personalized roadmaps',
                  'AI Assistant Coach: Custom drill builder for coaches, parents & athletes',
                  'Weekly AI Reports',
                  'Parent Dashboard (for parents)',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-base md:text-lg text-gray-300">
                    <Check className="w-5 h-5 text-solar-surge-orange flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Highlighted AI Learning Feature */}
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-solar-surge-orange/20 via-neon-cortex-blue/10 to-solar-surge-orange/20 border-2 border-solar-surge-orange/40">
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">⚡</div>
                  <div>
                    <h4 className="text-xl font-black text-solar-surge-orange mb-2">Adaptive AI Learning</h4>
                    <p className="text-base text-gray-300 leading-relaxed">
                      Your coach doesn't just train you—it LEARNS you. Every swing logged makes it 1% smarter. That's 30% smarter after a month. 365% in a year. Do the math on what that does to your game.
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonial Pull Quote */}
              <div className="mb-10 p-6 rounded-xl bg-gradient-to-r from-neon-cortex-blue/10 to-transparent border-l-4 border-neon-cortex-blue">
                <p className="text-lg italic text-gray-300 mb-2">
                  "I swear this app knows when I need a rest day before I do. It's freaky."
                </p>
                <p className="text-sm font-semibold text-neon-cortex-blue">
                  — Jake M., Travel Ball
                </p>
              </div>
              <a
                href="/team-licensing"
                className="block w-full px-12 py-5 text-lg font-semibold font-poppins text-center rounded-xl bg-gradient-to-br from-solar-surge-orange/20 to-solar-surge-orange/10 border border-solar-surge-orange/30 backdrop-blur-liquid transition-all duration-300 hover:from-solar-surge-orange/30 hover:to-solar-surge-orange/15 hover:shadow-liquid-glow-orange hover:border-solar-surge-orange/50 hover:scale-105 active:scale-95"
              >
                Upgrade to Pro
              </a>
              </LiquidGlass>
            </motion.div>
          </StaggerChildren>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeInWhenVisible delay={0} direction="up">
            <LiquidGlass variant="blue" glow={true} className="p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Start Training Smarter Today.
            </h2>
            <p className="text-xl text-text-secondary mb-6 max-w-2xl mx-auto">
              Download the app. Start with free. Go Pro when you&apos;re ready.
            </p>
            <p className="text-sm text-text-secondary">
              Team licensing available • Partner program open
            </p>
          </LiquidGlass>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Footer with Trademark Notice */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/assets/images/logo.png"
              alt="Mind & Muscle Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-lg font-semibold text-white/90">Mind & Muscle™</span>
          </div>
          <p className="text-sm text-white/50 italic mb-4">
            &ldquo;Discipline the Mind. Dominate the Game.&rdquo;™
          </p>
          <p className="text-xs text-white/30 leading-relaxed">
            © {new Date().getFullYear()} Mind & Muscle Performance. All rights reserved.<br />
            Mind & Muscle and &ldquo;Discipline the Mind. Dominate the Game.&rdquo; are trademarks of Mind & Muscle Performance.
          </p>
        </div>
      </footer>
    </div>
  );
}
