"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LiquidGlass } from "@/components/LiquidGlass";
import { motion } from "framer-motion";
import {
  FadeInWhenVisible,
  StaggerChildren,
  GradientTextReveal,
  staggerItemVariants,
} from "@/components/animations";
import {
  Brain,
  Video,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Mic,
  BookOpen,
  Gamepad2,
  Wind,
  Eye,
  Repeat,
  CheckCircle,
  Zap,
  ArrowRight,
  Mail,
  Award,
  RefreshCw,
  UserCheck,
  MousePointerClick,
  X,
  Play,
  Pause,
} from "lucide-react";

export default function USAPrimePage() {
  const [activeFeature, setActiveFeature] = useState<any>(null);

  // Pain points coaches recognize
  const painPoints = [
    {
      icon: MessageSquare,
      title: "Communication Chaos",
      description:
        'GroupMe threads that never end. Uniform info buried. Parents asking "what time?" for the 10th time.',
    },
    {
      icon: Brain,
      title: "Mental Game Gap",
      description:
        "Players grind the physical side, but who's training the mental game? No structure, no consistency.",
    },
    {
      icon: Eye,
      title: "No Visibility",
      description:
        "Can't see who's actually putting in work between practices. You hope they're preparing, but you don't know.",
    },
    {
      icon: Repeat,
      title: "Repeating Yourself",
      description:
        "Same conversation about focus, composure, and routines - 20 times per season with different players.",
    },
  ];

  // Free features that replace their current stack
  const freeFeatures = [
    {
      icon: MessageSquare,
      iconImage: "/assets/images/chatter_icon_3x.png",
      title: "Chatter + Events",
      replaces: "GroupMe + spreadsheets",
      description:
        "Team chat, calendar sync, attendance tracking, directions to every field. Uniforms saved with one tap.",
      videoUrl: "/assets/videos/chatter.mp4",
      image: "/assets/images/Team Communications.png",
    },
    {
      icon: Mic,
      title: "Daily Hit",
      replaces: "Generic motivation apps",
      description:
        "3-minute daily mental toughness audiograms. 100% baseball/softball - zero generic content.",
      image: "/assets/images/dailyhit.png",
    },
    {
      icon: BookOpen,
      title: "Dugout Talk",
      replaces: "Nothing (they skip this)",
      description:
        "Player journal that feeds AI learning. What they write here makes Pro features smarter.",
      image: "/assets/images/dugout_talk.png",
    },
    {
      icon: Gamepad2,
      iconImage: "/assets/images/game_lab_icon copy.png",
      title: "Game Lab Level 1",
      replaces: "Hoping they figure it out",
      description:
        "Game IQ scenarios. Real decisions, not quizzes. Players learn situational baseball.",
      videoUrl: "/assets/videos/game_lab.mp4",
      image: "/assets/images/game-lab.png",
    },
    {
      icon: Wind,
      title: "Breathwork",
      replaces: "YouTube videos",
      description:
        "Pre-game focus animation. Repeatable routine players can use before every at-bat.",
      image: "/assets/images/breathwork.png",
    },
  ];

  // Pro features (the pilot unlocks these) - with videos and rich media
  const proFeatures = [
    {
      id: "mind-coach",
      title: "Mind Coach AI",
      iconImage: "/assets/images/Mind AI Coach.png",
      tagline: "This is what we pitched you on.",
      description:
        "Personalized mental training sessions. Pressure management, focus, visualization - all engineered for each player's mental profile.",
      color: "blue",
      videoUrl: "/assets/videos/mind_coachai.mp4",
      image: "/assets/mind/Mind AI Coach Hero.png",
    },
    {
      id: "swing-lab",
      title: "Swing Lab & Plate IQ",
      iconImage: "/assets/images/Swing Lab1.png",
      tagline: "Like having a hitting coach in their pocket.",
      description:
        "Upload video → Get AI coaching analysis → Plus Plate IQ trains pitch anticipation with real game situations. See it. Swing it. Know it.",
      color: "orange",
      videoUrl: "/assets/videos/swing_lab.mp4",
      image: "/assets/dashboard/swing_lab.png",
    },
    {
      id: "ai-assistant",
      title: "AI Assistant Coach",
      iconImage: "/assets/images/Whistle.png",
      tagline: "Turn your notes into practice plans.",
      description:
        "Share what you're working on. The AI creates custom drills that target exactly what your team needs.",
      color: "blue",
      videoUrl: "/assets/videos/ai_assistant_coach.mp4",
      image: "/assets/images/ai_coach_robot_crop.png",
    },
    {
      id: "goals-reports",
      title: "Goals + Weekly Reports",
      iconImage: "/assets/images/Goals Icon.png",
      tagline: "See who's committed without asking.",
      description:
        "Players set goals, coaches provide feedback and guidance. Weekly AI reports go to coaches AND parents (parents don't take license seats).",
      color: "orange",
      videoUrl: "/assets/videos/goalsai.mp4",
      image: "/assets/images/Results Goals.png",
    },
  ];

  return (
      <div className="min-h-screen">
        {/* Section 1: Hero with 3 Logos */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F3A] via-[#0F1123] to-transparent" />

          <div className="max-w-6xl mx-auto relative z-10">
            {/* 3 Logos: Prime + M&M = Combined */}
            <FadeInWhenVisible delay={0} direction="down">
              <div className="flex flex-col items-center justify-center mb-12">
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                  {/* USA Prime Logo */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <Image
                      src="/assets/images/prime.png"
                      alt="USA Prime Baseball"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Plus sign */}
                  <div className="text-2xl sm:text-3xl font-bold text-white/40">
                    +
                  </div>

                  {/* Mind & Muscle Logo */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <Image
                      src="/assets/images/logo.png"
                      alt="Mind & Muscle"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Equals sign */}
                  <div className="text-2xl sm:text-3xl font-bold text-white/40">
                    =
                  </div>

                  {/* Combined Logo */}
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                    <Image
                      src="/assets/images/prime_custom.png"
                      alt="Mind & Muscle x USA Prime"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Headline */}
            <div className="text-center">
              <FadeInWhenVisible delay={0.2} direction="up">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                  <span className="text-neon-cortex-blue">Mind & Muscle</span>
                  <span className="text-white/50"> + </span>
                  <span className="text-[#c8102e]">USA Prime</span>
                </h1>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.3} direction="up">
                <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto font-medium">
                  Built for elite travel ball. Partnering with USA Prime Tampa.
                </p>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.4} direction="up">
                <p className="text-lg text-text-secondary/80 max-w-2xl mx-auto">
                  One app that replaces your scattered tools and gives your
                  players the mental edge that separates good programs from
                  great ones.
                </p>
              </FadeInWhenVisible>
            </div>
          </div>
        </section>

        {/* Section 2: The 4 Pain Points - Sophisticated Card Style */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/5 to-transparent" />

          <div className="max-w-6xl mx-auto relative z-10">
            <FadeInWhenVisible
              delay={0}
              direction="up"
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Sound familiar?
              </h2>
              <p className="text-lg text-text-secondary">
                Every travel ball coach deals with this.
              </p>
            </FadeInWhenVisible>

            <StaggerChildren
              staggerDelay={0.1}
              className="grid sm:grid-cols-2 gap-6"
            >
              {painPoints.map((point, index) => (
                <motion.div
                  key={index}
                  variants={staggerItemVariants}
                  className="group"
                >
                  {/* Sophisticated Card with Gradient & Glow */}
                  <div
                    className="relative h-full rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(15, 17, 35, 0.9) 0%, rgba(27, 31, 57, 0.9) 100%)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      boxShadow:
                        "0 4px 16px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    {/* Hover glow effect */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                      style={{
                        boxShadow:
                          "0 0 30px rgba(239, 68, 68, 0.3), inset 0 0 20px rgba(239, 68, 68, 0.05)",
                      }}
                    />

                    <div className="relative p-6 flex items-start gap-4">
                      {/* Icon with gradient background */}
                      <div
                        className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.6) 100%)",
                          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
                        }}
                      >
                        <point.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          {point.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Section 3: Replace Your Stack (FREE) */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-neon-cortex-blue/5 via-transparent to-transparent" />

          <div className="max-w-6xl mx-auto relative z-10">
            <FadeInWhenVisible
              delay={0}
              direction="up"
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cortex-green/20 text-neon-cortex-green text-sm font-bold mb-6">
                <CheckCircle className="w-4 h-4" />
                FREE VERSION
              </div>
              <GradientTextReveal
                text="Free alone beats GameChanger + GroupMe"
                className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6"
                gradientFrom="#0EA5E9"
                gradientTo="#10B981"
                delay={0.2}
              />
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Your players already have their phones. Give them one app that
                does what 3-4 apps can&apos;t.
              </p>
            </FadeInWhenVisible>

            <StaggerChildren
              staggerDelay={0.1}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {freeFeatures.map((feature, index) => (
                <motion.div key={index} variants={staggerItemVariants}>
                  <LiquidGlass
                    variant="blue"
                    padding="md"
                    className="h-full hover:scale-[1.02] transition-transform"
                  >
                    {/* Video if available, otherwise Image */}
                    {feature.videoUrl ? (
                      <div
                        className="relative aspect-video bg-gradient-to-br from-white/5 to-transparent rounded-xl mb-4 overflow-hidden"
                        onMouseEnter={(e) => {
                          const video = e.currentTarget.querySelector("video");
                          if (video) {
                            video.currentTime = 0;
                            video.play().catch(() => {});
                          }
                        }}
                        onMouseLeave={(e) => {
                          const video = e.currentTarget.querySelector("video");
                          if (video) {
                            video.pause();
                            video.currentTime = 0;
                          }
                        }}
                      >
                        <video
                          src={feature.videoUrl}
                          poster={feature.image}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                      </div>
                    ) : feature.image ? (
                      <div className="relative aspect-video bg-gradient-to-br from-white/5 to-transparent rounded-xl mb-4 overflow-hidden">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="flex items-center gap-3 mb-3">
                      {feature.iconImage ? (
                        <div className="w-10 h-10 relative">
                          <Image
                            src={feature.iconImage}
                            alt={feature.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-neon-cortex-blue/20">
                          <feature.icon className="w-5 h-5 text-neon-cortex-blue" />
                        </div>
                      )}
                      <h3 className="text-base font-bold text-white">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-xs text-neon-cortex-green font-medium mb-2">
                      Replaces: {feature.replaces}
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </LiquidGlass>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Section 4: Unlock the Edge (PRO) - Full Video Cards */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F3A] via-[#0F1123] to-[#1A1F3A]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

          <div className="max-w-7xl mx-auto relative z-10">
            <FadeInWhenVisible
              delay={0}
              direction="up"
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-solar-surge-orange/20 text-solar-surge-orange text-sm font-bold mb-6">
                <Zap className="w-4 h-4" />
                PRO VERSION - WHAT THE PILOT UNLOCKS
              </div>
              <GradientTextReveal
                text="The AI-powered edge that separates programs"
                className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6"
                gradientFrom="#0EA5E9"
                gradientTo="#F97316"
                delay={0.2}
              />
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                This is what USA Prime Tampa gets access to this spring.
              </p>
            </FadeInWhenVisible>

            <StaggerChildren
              staggerDelay={0.15}
              className="grid md:grid-cols-2 gap-8"
            >
              {proFeatures.map((feature, index) => {
                const isBlue = feature.color === "blue";

                return (
                  <motion.div
                    key={feature.id}
                    className="group relative"
                    variants={staggerItemVariants}
                  >
                    {/* Glow Effect */}
                    <div
                      className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${
                        isBlue
                          ? "bg-gradient-to-b from-neon-cortex-blue/30 to-transparent"
                          : "bg-gradient-to-b from-solar-surge-orange/30 to-transparent"
                      }`}
                    />

                    {/* Card */}
                    <div
                      className={`relative backdrop-blur-sm bg-white/[0.02] p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.05] h-full ${
                        isBlue
                          ? "border-neon-cortex-blue/40 hover:border-neon-cortex-blue shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)]"
                          : "border-solar-surge-orange/40 hover:border-solar-surge-orange shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]"
                      }`}
                    >
                      {/* Video - Autoplay like homepage */}
                      <div className="relative aspect-video bg-gradient-to-br from-white/5 to-transparent rounded-xl mb-4 overflow-hidden">
                        <video
                          src={feature.videoUrl}
                          className="w-full h-full object-cover opacity-95"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                        />
                      </div>

                      {/* Icon + Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                            isBlue
                              ? "bg-neon-cortex-blue/10 border border-neon-cortex-blue/30"
                              : "bg-solar-surge-orange/10 border border-solar-surge-orange/30"
                          }`}
                        >
                          <Image
                            src={feature.iconImage}
                            alt={`${feature.title} icon`}
                            width={36}
                            height={36}
                            className="object-contain"
                            style={{
                              filter: `drop-shadow(0 0 10px ${isBlue ? "rgba(14,165,233,0.8)" : "rgba(249,115,22,0.8)"})`,
                            }}
                          />
                        </div>

                        <div>
                          <h3
                            className={`text-xl font-black ${isBlue ? "text-neon-cortex-blue" : "text-solar-surge-orange"}`}
                          >
                            {feature.title}
                          </h3>
                          <p
                            className={`text-sm font-medium ${isBlue ? "text-neon-cortex-blue/70" : "text-solar-surge-orange/70"}`}
                          >
                            {feature.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-text-secondary leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </StaggerChildren>
          </div>
        </section>

        {/* Section 5: How It Works Together - Sophisticated Style */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FadeInWhenVisible delay={0} direction="up">
              <div
                className="relative rounded-3xl overflow-hidden text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(15, 17, 35, 0.95) 0%, rgba(27, 31, 57, 0.95) 100%)",
                  border: "1px solid rgba(14, 165, 233, 0.3)",
                  boxShadow:
                    "0 8px 32px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <div className="p-8 sm:p-12">
                  {/* Icon container with glow */}
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(14, 165, 233, 0.6) 100%)",
                      boxShadow: "0 4px 12px rgba(14, 165, 233, 0.4)",
                    }}
                  >
                    <RefreshCw className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
                    Everything Connects
                  </h2>

                  <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                    This isn&apos;t just another app. It&apos;s an intelligent
                    system that learns from every interaction.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 text-sm mb-6">
                    <span
                      className="px-4 py-2 rounded-full font-medium text-neon-cortex-blue"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 0.3) 100%)",
                        border: "1px solid rgba(14, 165, 233, 0.4)",
                        boxShadow: "0 2px 8px rgba(14, 165, 233, 0.2)",
                      }}
                    >
                      Dugout Talk journal
                    </span>
                    <ArrowRight className="w-5 h-5 text-white/50" />
                    <span
                      className="px-4 py-2 rounded-full font-medium text-neon-cortex-blue"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 0.3) 100%)",
                        border: "1px solid rgba(14, 165, 233, 0.4)",
                        boxShadow: "0 2px 8px rgba(14, 165, 233, 0.2)",
                      }}
                    >
                      feeds Mind Coach AI
                    </span>
                    <ArrowRight className="w-5 h-5 text-white/50 hidden sm:block" />
                    <span
                      className="px-4 py-2 rounded-full font-medium text-solar-surge-orange"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.3) 100%)",
                        border: "1px solid rgba(249, 115, 22, 0.4)",
                        boxShadow: "0 2px 8px rgba(249, 115, 22, 0.2)",
                      }}
                    >
                      Swing Lab & Plate IQ
                    </span>
                    <ArrowRight className="w-5 h-5 text-white/50" />
                    <span
                      className="px-4 py-2 rounded-full font-medium text-solar-surge-orange"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.3) 100%)",
                        border: "1px solid rgba(249, 115, 22, 0.4)",
                        boxShadow: "0 2px 8px rgba(249, 115, 22, 0.2)",
                      }}
                    >
                      informs Goals
                    </span>
                  </div>

                  <p className="text-white/50">
                    The more players use it, the smarter it gets. Weekly Reports
                    show coaches the full picture.
                  </p>
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </section>

        {/* Section 6: For Parents - Sophisticated Style */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FadeInWhenVisible delay={0} direction="up">
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(15, 17, 35, 0.95) 0%, rgba(27, 31, 57, 0.95) 100%)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  boxShadow:
                    "0 4px 16px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                  {/* Icon with gradient */}
                  <div
                    className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.6) 100%)",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                    }}
                  >
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Parents Stay Informed. Coaches Stay in Control.
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      Parents can view Goals and Weekly Reports without using a
                      license seat. They see their kid&apos;s progress without
                      cluttering team communication. No more &quot;how&apos;s
                      Johnny doing?&quot; texts - they already know.
                    </p>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </section>

        {/* Section 7: Pilot CTA - Sophisticated Style */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <FadeInWhenVisible delay={0} direction="up">
              <div
                className="relative rounded-3xl overflow-hidden text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(15, 17, 35, 0.95) 0%, rgba(27, 31, 57, 0.95) 100%)",
                  border: "2px solid rgba(16, 185, 129, 0.4)",
                  boxShadow:
                    "0 8px 32px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <div className="p-8 sm:p-12">
                  {/* Badge with glow */}
                  <div
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold mb-8"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.5) 100%)",
                      border: "1px solid rgba(16, 185, 129, 0.5)",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                      color: "#10B981",
                    }}
                  >
                    <Award className="w-4 h-4" />
                    SPRING 2025 PILOT PROGRAM
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                    USA Prime Tampa is Running a Pilot
                  </h2>

                  <p className="text-xl text-white/80 mb-6 max-w-xl mx-auto">
                    Full Pro access for coaches and players. No cost, no
                    commitment.
                  </p>

                  <p className="text-lg text-white/60 mb-8 max-w-lg mx-auto">
                    Prove it helps your guys compete at the next level. If it
                    works, we figure out the best way to roll it out wider.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                    {[
                      "Full Pro features",
                      "Team management",
                      "Direct support",
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-white/80"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.7) 100%)",
                            boxShadow: "0 2px 6px rgba(16, 185, 129, 0.4)",
                          }}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <p className="text-white/60 mb-4">
                      Questions about the pilot?
                    </p>
                    <a
                      href="mailto:jeff@mindandmuscle.ai"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(14, 165, 233, 0.6) 0%, rgba(14, 165, 233, 0.8) 100%)",
                        border: "2px solid rgba(14, 165, 233, 0.6)",
                        boxShadow: "0 4px 16px rgba(14, 165, 233, 0.4)",
                      }}
                    >
                      <Mail className="w-5 h-5" />
                      jeff@mindandmuscle.ai
                    </a>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </section>
      </div>
  );
}
