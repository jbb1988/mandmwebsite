'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import { ChevronDown, Search, Brain, Dumbbell, Zap, TrendingUp, Award, Users, Utensils, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSection {
  id: string;
  title: string;
  icon?: any;
  iconImage?: string;
  color: 'blue' | 'orange';
  faqs: FAQ[];
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const faqSections: FAQSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started & Account Setup',
      icon: HelpCircle,
      color: 'blue',
      faqs: [
        {
          question: 'How do I download the Mind & Muscle app?',
          answer: 'Mind & Muscle is available on both iOS and Android. Search "Mind and Muscle" in the App Store (iOS) or Google Play Store (Android) and download the app for free. Premium features are unlocked through individual subscription or team licensing.'
        },
        {
          question: 'How do I create an account?',
          answer: 'Download the app and tap "Sign Up". You\'ll choose your role (Athlete, Coach, or Parent), then create your account with email and password. Follow the onboarding prompts to set up your profile. If you have a team code, you can enter it during sign-up or later in Settings.'
        },
        {
          question: 'What\'s the difference between the user roles?',
          answer: 'Athlete: Full access to training features, progress tracking, and team features.\n\nCoach: Full access plus team management tools, roster views, and coaching insights.\n\nParent: Read-only access to your linked athlete\'s Goals and Reports. Parents don\'t consume license seats!'
        },
        {
          question: 'Can I change my role after signing up?',
          answer: 'Contact <a href="mailto:support@mindandmuscle.ai" class="text-solar-surge-orange hover:underline">support@mindandmuscle.ai</a> to change your role. Your data will be preserved, but your dashboard and available features will adjust to match your new role.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'On the login screen, tap "Forgot Password?" and enter your email. You\'ll receive a password reset link. If you don\'t receive it, check your spam folder or contact <a href="mailto:support@mindandmuscle.ai" class="text-solar-surge-orange hover:underline">support@mindandmuscle.ai</a>.'
        }
      ]
    },
    {
      id: 'platform-features',
      title: 'Platform & Features',
      icon: Zap,
      color: 'blue',
      faqs: [
        {
          question: 'What makes Mind & Muscle different from other baseball apps?',
          answer: 'Mind & Muscle is the first AI platform built exclusively for baseball that integrates all aspects of player development. Instead of juggling 7+ different apps (team communication, mental training, video analysis, strength training, nutrition, IQ training, goal tracking), you get one intelligent system where everything connects. The AI learns from your swing videos, workouts, mental training, and goals—continuously improving recommendations across all areas. Every drill, every scenario, every mental training session is designed specifically for baseball movements and situations. We didn\'t adapt generic training for baseball. We built it from scratch for the sport.'
        },
        {
          question: 'Why is an all-in-one platform better than specialized apps?',
          answer: 'Fragmented apps create fragmented development:\n\n• Data Silos: Your swing analysis doesn\'t inform your strength training. Your mental training doesn\'t connect to your game situations.\n• No Learning: Specialized apps can\'t improve because they only see one piece of your development.\n• Complexity Kills Consistency: Managing 7 logins, 7 interfaces, and 7 monthly bills means most athletes quit before they see results.\n\nMind & Muscle solves this with integration:\n\n• Connected Intelligence: The AI sees your complete player profile and makes smarter recommendations\n• Adaptive Learning: Every session, workout, and analysis makes the entire system smarter\n• One Experience: Log in once. Everything in one place. One 6-month payment—perfect for seasonal sports.\n\nDevelopment isn\'t about using the most tools. It\'s about using tools that work together.'
        },
        {
          question: 'How does AI personalization work across the platform?',
          answer: 'Mind & Muscle\'s AI creates a complete profile of you as a player:\n\n• Position-Specific Intelligence: Pitchers get rotational power workouts. Catchers get explosive leg training. Outfielders get sprint mechanics.\n• Learning From Feedback: After each mental training session, workout, or swing analysis, the AI asks for feedback and adjusts future recommendations.\n• Cross-Feature Insights: Your swing analysis identifies timing issues → Mind Coach recommends focus training → Goals AI suggests practice milestones → Muscle Coach designs bat speed workouts. Everything connects.\n• Adaptive Difficulty: Game Lab scenarios get harder as your mental batting average improves. Workouts progress as you get stronger.\n\nThe system learns your strengths, identifies your gaps, and engineers development plans that actually work—because it sees the complete picture of who you are as a player.'
        },
        {
          question: 'Does Mind & Muscle require internet connection?',
          answer: 'Partial offline support:\n\n✅ Works Offline:\n• Previously loaded mental training sessions\n• Logged workouts (sync when back online)\n• Game Lab scenarios you\'ve already played\n• Viewing your saved data and history\n\n❌ Requires Internet:\n• AI analysis (Swing Lab, Goals AI, recommendations)\n• Team chat and events\n• Downloading new content\n• Syncing progress across devices\n\nFor best experience, use wifi or cellular data when using AI-powered features.'
        }
      ]
    },
    {
      id: 'mind-coach',
      title: 'Mind Coach AI - Mental Training',
      iconImage: '/assets/images/Mind AI Coach.png',
      color: 'blue',
      faqs: [
        {
          question: 'What is Mind Coach AI?',
          answer: 'Mind Coach AI is your personal mental training coach that creates personalized sessions to build mental toughness, focus, confidence, and pressure management. It learns from your feedback after each session and adapts to your needs.'
        },
        {
          question: 'How do I start a mental training session?',
          answer: 'Go to the Mind tab → Mind Coach AI. New exercises are generated each week, or you can browse sessions you\'ve favorited or custom sessions you\'ve created. Tap a session to start and follow the guided exercises. After completing, provide feedback so the AI can personalize future sessions.'
        },
        {
          question: 'What types of mental training are available?',
          answer: 'Mind Coach AI offers sessions in:\n\n• Focus Training - Eliminate distractions and lock in\n• Pressure Management - Stay calm in clutch moments\n• Confidence Building - Develop unshakeable self-belief\n• Visualization - Mental rehearsal for game situations\n• Mindfulness - Present-moment awareness for peak performance\n\nEach type has multiple sessions tailored to your experience level.'
        },
        {
          question: 'Can I create custom mental training sessions?',
          answer: 'Yes! In Mind Coach AI, tap "Create Custom Session". Describe what you\'re working on (e.g., "pre-game anxiety" or "staying confident after an error"), and the AI will generate a personalized session targeting your specific challenge.'
        },
        {
          question: 'How do I track my mental training progress?',
          answer: 'Your mental training progress is tracked in multiple places:\n\n• Mind Coach dashboard shows completed sessions and current streak\n• Goals section tracks mental training goals\n• Dashboard displays daily mental training check-ins\n• Reports section shows weekly mental training summaries'
        },
        {
          question: 'What are session streaks?',
          answer: 'Build a streak by completing mental training sessions on consecutive days. Streaks motivate consistency and help build lasting mental skills. Your current streak is displayed in the Mind Coach section. Miss a day and your streak resets, but your progress and completed sessions remain.'
        }
      ]
    },
    {
      id: 'muscle-coach',
      title: 'Muscle Coach AI - Strength Training',
      iconImage: '/assets/images/Muscle AI Coach Icon.png',
      color: 'orange',
      faqs: [
        {
          question: 'What is Muscle Coach AI?',
          answer: 'Muscle Coach AI is your baseball-specific strength training system. It provides position-specific power training, tracks progressive overload, and offers hundreds of exercises designed by MLB coaches. Build explosive bat speed, throwing velocity, and game-ready endurance.'
        },
        {
          question: 'What are the three training zones?',
          answer: 'AI Coach Tab: Smart workout recommendations based on your position, goals, and progress. Just tap and start.\n\nExercise Vault: Library of hundreds of baseball-specific exercises with video demonstrations. Browse by muscle group, equipment, or training goal.\n\nBuild Tab: Create custom workout plans. Select exercises, set sets/reps, track your workouts over time.'
        },
        {
          question: 'How do I log a workout?',
          answer: 'Go to Muscle tab → Start a recommended workout from AI Coach, or create your own in Build Tab. As you complete each exercise, log sets, reps, and weight used. The app tracks your progressive overload automatically and suggests when to increase weight.'
        },
        {
          question: 'How does position-specific training work?',
          answer: 'When you set your position (pitcher, catcher, infield, outfield), Muscle Coach AI prioritizes exercises that develop the power systems most important for your role:\n\n• Pitchers: Rotational power, shoulder stability, explosive leg drive\n• Catchers: Lower body strength, quick feet, throwing power\n• Infielders: Explosive first step, quick hands, throwing accuracy\n• Outfielders: Sprint speed, throwing distance, tracking ability'
        },
        {
          question: 'How do I create a custom workout plan?',
          answer: 'Go to Muscle → Build Tab → Create New Plan. Name your plan, select exercises from the vault, set target sets/reps for each. Save the plan to reuse it. Track your progress each time you complete the plan. The app automatically suggests progressive overload.'
        },
        {
          question: 'Can I see exercise demonstrations?',
          answer: 'Yes! Every exercise in the Exercise Vault includes video demonstrations showing proper form. Tap any exercise to see the demo, read coaching notes, and learn common mistakes to avoid.'
        }
      ]
    },
    {
      id: 'game-lab',
      title: 'Game Lab - Baseball IQ Training',
      iconImage: '/assets/images/game_lab_icon copy.png',
      color: 'blue',
      faqs: [
        {
          question: 'What is Game Lab?',
          answer: 'Game Lab is your baseball IQ training system with 186 real game scenarios. It forces you to think faster, decide smarter, and train the mental side of baseball. Make decisions under pressure and build the instincts that separate smart players from reactive ones.'
        },
        {
          question: 'How do I play scenarios?',
          answer: 'Go to Game Lab and tap "Start Training". You\'ll be presented with a game situation (score, inning, outs, runners). Read the scenario, then choose the best play from multiple options. You\'ll get immediate feedback on whether your decision was optimal.'
        },
        {
          question: 'How many scenarios are there?',
          answer: 'Game Lab includes 186 unique game scenarios covering all positions and situations. Scenarios include: defensive positioning, baserunning decisions, pitch selection, cutoff plays, bunt defense, and more. New scenarios are added regularly.'
        },
        {
          question: 'What is my "mental batting average"?',
          answer: 'Your mental batting average is the percentage of scenarios you answer correctly. Just like a batting average measures hitting success, your mental average measures baseball IQ. Track it over time to see your game knowledge improve.'
        },
        {
          question: 'How do I earn XP and unlock badges?',
          answer: 'Every correct answer earns XP (experience points). Build streaks by training multiple days in a row for bonus XP. As you accumulate XP, you unlock badges like "IQ Rookie", "Student of the Game", and "Baseball Einstein". Higher difficulty scenarios earn more XP.'
        },
        {
          question: 'Do scenarios get harder as I improve?',
          answer: 'Yes! Game Lab adapts to your skill level. As your mental batting average increases, you\'ll see more advanced scenarios with multiple correct answers, tighter game situations, and complex strategic decisions. This keeps challenging even elite players.'
        }
      ]
    },
    {
      id: 'swing-lab',
      title: 'Swing Lab - Video Analysis',
      iconImage: '/assets/images/Swing Lab1.png',
      color: 'orange',
      faqs: [
        {
          question: 'How do I upload my swing video?',
          answer: 'Go to Swing Lab → tap "Upload Swing". Record a new video or select one from your camera roll. Best results: film from the side (parallel to the plate), capture full swing from stance to follow-through, ensure good lighting. Upload and the AI will analyze within seconds.'
        },
        {
          question: 'What kind of analysis will I get?',
          answer: 'Swing Lab provides elite coaching feedback:\n\n• The Good Stuff: Specific strengths to build on\n• Power Opportunities: 1-2 changes to unlock explosive contact\n• Your Practice Plan: 2 precision drills targeting your issues\n• Mental Game Strategy: Situational hitting advice\n• #1 Focus: Most important thing to work on next\n\nThink of it as a veteran MLB hitting coach breaking down your swing—instant, actionable, precise.'
        },
        {
          question: 'How long does analysis take?',
          answer: 'AI analysis is nearly instant—typically 5-15 seconds after upload. You\'ll get a complete breakdown with video thumbnails showing key positions in your swing.'
        },
        {
          question: 'Can I save and favorite analyses?',
          answer: 'Yes! Every analysis is automatically saved in your history. Tap the star icon to "favorite" your best analyses for quick reference. Compare analyses over time to track improvement and see which coaching cues are working.'
        },
        {
          question: 'Can I share my analysis with my coach?',
          answer: 'Absolutely! Each analysis has a "Share" button. You can send the full report via text, email, or any messaging app. Your coach can review the AI feedback and add their own coaching points.'
        },
        {
          question: 'How do I view my analysis history?',
          answer: 'Go to Swing Lab → tap "History" to see all your past analyses. Filter by date, view your favorited swings, or search by the feedback you received (e.g., "timing"). Track your progress by comparing recent swings to older ones.'
        }
      ]
    },
    {
      id: 'sound-lab',
      title: 'Sound Lab - Mental State Engineering',
      iconImage: '/assets/images/Sound Lab copy.png',
      color: 'blue',
      faqs: [
        {
          question: 'What is Sound Lab?',
          answer: 'Sound Lab isn\'t background music—it\'s a remote control for your mental state. Using binaural beats and Solfeggio frequencies, it engineers your brainwaves for peak performance. Alpha waves for laser focus. Beta for superhuman concentration. Gamma for explosive reactions.'
        },
        {
          question: 'What are binaural beats?',
          answer: 'Binaural beats are audio frequencies that sync your brainwaves to specific mental states. When you listen through headphones, your brain hears slightly different frequencies in each ear, creating a third frequency that influences your brainwave patterns. Science-backed and used by elite athletes.'
        },
        {
          question: 'What are Solfeggio frequencies?',
          answer: 'Ancient sound frequencies (like 528Hz, 432Hz) believed to promote healing, focus, and peak performance. Sound Lab combines Solfeggio frequencies with modern athletic performance mixes to create powerful pre-competition soundscapes.'
        },
        {
          question: 'When should I use Sound Lab?',
          answer: 'Use Sound Lab strategically:\n\n• Before Training: 10-15 minutes to lock in focus\n• Pre-Game: 5-10 minutes in the parking lot or dugout\n• Between Innings: Quick mental reset\n• Before Sleep: For recovery and mental preparation\n• Study Sessions: For homework concentration\n\nMake it a ritual. Feel your brain lock in.'
        },
        {
          question: 'How long should I listen?',
          answer: 'For best results, listen for at least 10 minutes to allow your brainwaves to sync to the frequency. Pre-game sessions are typically 10-15 minutes. Longer sessions (20-30 minutes) are great for deep focus work or pre-sleep recovery.'
        },
        {
          question: 'Can I use Sound Lab while training?',
          answer: 'Sound Lab is designed for pre-training mental preparation, not during active practice. Use it before training to get in the zone, then switch to your regular training mindset. During competition, you\'ll feel the mental state you engineered.'
        }
      ]
    },
    {
      id: 'goals-ai',
      title: 'Goals AI - Goal Setting & Tracking',
      iconImage: '/assets/images/Goals Icon.png',
      color: 'orange',
      faqs: [
        {
          question: 'How do I create a goal?',
          answer: 'Go to Goals section → tap "Create New Goal". Describe your goal in plain language (e.g., "increase squat by 25lbs" or "hit .400 this season"). Goals AI will analyze it, suggest specific milestones, and help you create an action plan. Choose season goal or daily habit tracking.'
        },
        {
          question: 'What\'s the difference between season goals and daily habits?',
          answer: 'Season Goals: Long-term outcomes you\'re working toward (e.g., "make varsity", "throw 85mph", "hit 10 home runs"). Tracked over weeks/months with progress milestones.\n\nDaily Habits: Small actions that compound over time (e.g., "practice visualization 5 minutes", "complete mental training", "drink 100oz water"). Track daily completion and build streaks.'
        },
        {
          question: 'How does the AI help with my goals?',
          answer: 'Goals AI is your performance architect:\n\n• Analyzes vague goals and makes them surgical ("get stronger" becomes "increase squat 25lbs in 8 weeks")\n• Identifies gaps between where you are and where you\'re going\n• Suggests specific action steps and milestones\n• Provides weekly check-ins and progress analysis\n• Alerts you when you\'re off track or ahead of schedule'
        },
        {
          question: 'How do I track goal progress?',
          answer: 'Each goal has a progress tracker. Log updates as you hit milestones (completed workouts, measurable improvements, game stats). Goals AI analyzes your progress and provides coaching feedback. You\'ll see visual progress bars and trend charts showing your trajectory toward the goal.'
        },
        {
          question: 'Can I share goals with my coach or team?',
          answer: 'Yes! Goals can be shared with your coach for accountability and feedback. Team goals can be created for entire roster (e.g., "win conference championship"). Coaches see all athlete goals on their dashboard and can provide encouragement and adjustments.'
        },
        {
          question: 'What happens when I complete a goal?',
          answer: 'Celebrate! When you mark a goal complete, you\'ll earn XP, unlock achievement badges, and get prompted to set your next goal. Completed goals stay in your history so you can track your long-term progress and see how far you\'ve come.'
        }
      ]
    },
    {
      id: 'fuel-ai',
      title: 'Fuel AI - Nutrition Planning',
      iconImage: '/assets/images/Fuel.png',
      color: 'orange',
      faqs: [
        {
          question: 'How do I create a meal plan?',
          answer: 'Go to Fuel AI → tap "Create Meal Plan". Tell the AI about your preferences (favorite foods, foods to avoid, cooking time available). The AI generates 7 days of performance-optimized meals designed for training fuel and recovery. Real food that fits your lifestyle, not generic meal prep.'
        },
        {
          question: 'Does it generate shopping lists?',
          answer: 'Yes! Every weekly meal plan automatically generates a shopping list with all ingredients. Organized by store section (produce, meat, dairy, etc.). Walk into the store with your list, walk out ready to fuel greatness. No more "what should I buy?"'
        },
        {
          question: 'How do I add dietary restrictions or allergies?',
          answer: 'When creating your meal plan, tap "Dietary Restrictions" and select any allergies, intolerances, or dietary preferences (vegetarian, gluten-free, lactose intolerant, etc.). Fuel AI will only include meals that fit your restrictions while still optimizing for performance.'
        },
        {
          question: 'Can I specify cooking time preferences?',
          answer: 'Absolutely! Tell Fuel AI how much time you have:\n\n• Quick (15 min or less)\n• Moderate (30 min)\n• Advanced (60+ min for meal prep)\n\nThe AI adjusts meal complexity to match your available time. Busy athletes get quick, simple meals. Those with more time get elaborate performance nutrition.'
        },
        {
          question: 'How do I update my food preferences?',
          answer: 'Go to Fuel AI → Settings → Update Preferences. Add new favorite foods, remove ones you tried and didn\'t like, adjust macros if your training changes. Each week\'s meal plan gets smarter based on your updated preferences and feedback.'
        }
      ]
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant Coach - Custom Drills',
      iconImage: '/assets/images/Whistle.png',
      color: 'blue',
      faqs: [
        {
          question: 'What is AI Assistant Coach?',
          answer: 'AI Assistant Coach is your 24/7 coaching partner that turns your coaching notes into professional practice plans. Share what you\'re working on, and the AI creates custom drills that target exactly what your team needs. Built for coaches, athletes, and parents who demand personalized training.'
        },
        {
          question: 'How do I create custom drills?',
          answer: 'Go to AI Assistant Coach → tap "Create Drill". Describe what you want to work on (e.g., "infield double play footwork" or "hitting outside fastballs"). The AI generates a complete drill with:\n\n• Setup instructions\n• Step-by-step execution\n• Common mistakes to avoid\n• Variations for different skill levels\n• Success metrics to track'
        },
        {
          question: 'Can the AI design practice plans for my team?',
          answer: 'Yes! Share your practice goals and time available. AI Assistant Coach creates a complete practice plan with:\n\n• Warm-up routine\n• Skill stations with drills\n• Competitive games\n• Cool-down\n• Time allocations for each segment\n\nEvery plan is tailored to your team\'s skill level and practice objectives.'
        },
        {
          question: 'How do I share drills with others?',
          answer: 'Each drill has a "Share" button. Send via text, email, or team chat. Coaches can save drills to their library and reuse them throughout the season. Athletes can save drills for individual practice. Build your personal drill library over time.'
        }
      ]
    },
    {
      id: 'chatter-events',
      title: 'Chatter + Events - Team Communication',
      iconImage: '/assets/images/chatter_icon_3x.png',
      color: 'orange',
      faqs: [
        {
          question: 'How do I join team chat?',
          answer: 'When you redeem a team code, you\'re automatically added to your team\'s Chatter. Go to Chatter tab to see team messages. That dugout energy, 24/7. Build the brotherhood that separates great teams from good ones.'
        },
        {
          question: 'How do I create an event?',
          answer: 'Coaches: Go to Events → tap "Create Event". Add details (game, practice, tournament), set date/time/location. The event automatically appears on all team members\' calendars. Enable notifications so nobody misses it.'
        },
        {
          question: 'How does attendance tracking work?',
          answer: 'Each event has RSVP options: Going, Can\'t Make It, Maybe. Coaches see attendance dashboard with real-time responses. Parents can mark their athlete\'s availability. No more "I thought practice was at 5pm" excuses.'
        },
        {
          question: 'What is the Uniform Creator?',
          answer: 'Create custom team uniforms with one tap. Select:\n\n• Cap style and color\n• Jersey (home/away/practice)\n• Pants color\n• Belt color\n• Sock style\n\nVisual presets show exactly how the uniform will look. Perfect team coordination, zero confusion on game day.'
        },
        {
          question: 'How do I get directions to fields?',
          answer: 'Every event location has navigation integration. Tap "Get Directions" to open in your preferred maps app (Apple Maps, Google Maps, Waze). No one gets lost. No one shows up late. Your team moves like a championship machine.'
        },
        {
          question: 'Can parents see team events?',
          answer: 'Yes! Parents linked to their athlete see all team events on their calendar. They can view event details, location, and RSVP for their athlete. Parents stay informed without needing Premium access.'
        }
      ]
    },
    {
      id: 'team-licensing',
      title: 'Team Licensing & Team Codes',
      icon: Users,
      color: 'blue',
      faqs: [
        {
          question: 'What is a team code?',
          answer: 'A team code (format: TEAM-XXXX-XXXX-XXXX) is a reusable Premium access code for your team, organization, or program. One code works for all your athletes and coaches. Share it with your roster, and they get instant Premium access when they redeem it in the app.'
        },
        {
          question: 'How do I redeem my team code?',
          answer: 'New Users: During sign-up, you\'ll be prompted "Do you have a team code?" Enter it there and you\'ll get Premium access immediately.\n\nExisting Users: Go to More → Settings → Teams (or "Redeem Team Code"). Enter your team code and tap "Redeem". Your account upgrades to Premium instantly.\n\nDuring registration, you selected your role (Athlete/Coach/Parent). This determines if you consume a license seat.'
        },
        {
          question: 'I lost my team code email - how do I get it?',
          answer: 'Contact <a href="mailto:support@mindandmuscle.ai" class="text-solar-surge-orange hover:underline">support@mindandmuscle.ai</a> with the email address used for purchase. Support can look up your team code within minutes using the admin lookup tool. You\'ll receive your code via email. Check your spam folder for the original email first!'
        },
        {
          question: 'Do parents consume license seats?',
          answer: 'NO! Parents get FREE read-only access to their athlete\'s Goals and Reports without consuming any license seats. This is a huge bonus:\n\n• Athletes and Coaches: Get full Premium access and consume 1 seat each\n• Parents: Get free access to view their athlete\'s progress and DON\'T consume a seat\n\nExample: You buy 12 seats. You can have 12 athletes/coaches + unlimited parents!'
        },
        {
          question: 'Who consumes a license seat?',
          answer: 'Only Athletes and Coaches consume license seats when they redeem your team code. Here\'s the breakdown:\n\n✅ Consumes a seat:\n• Athletes - Full Premium access\n• Coaches - Full Premium + team management tools\n\n❌ Doesn\'t consume a seat:\n• Parents - Read-only access to their athlete\'s Goals & Reports\n\nThe system automatically handles this based on the role selected during registration.'
        },
        {
          question: 'How many seats do I have left?',
          answer: 'Visit <a href="https://mindandmuscle.ai/team-licensing/manage" class="text-solar-surge-orange hover:underline">mindandmuscle.ai/team-licensing/manage</a> and enter your team code to see your seat count. You\'ll see "X / Y Seats Used" showing exactly how many seats are consumed and how many remain. You can also email <a href="mailto:support@mindandmuscle.ai" class="text-solar-surge-orange hover:underline">support@mindandmuscle.ai</a> with your team code for assistance.'
        },
        {
          question: 'Can I add more seats mid-season?',
          answer: 'Yes! Go to mindandmuscle.ai/team-licensing/manage and enter your team code. You can purchase additional seats at your original locked-in rate (even if pricing has increased!). Maximum: You can add up to 2x your original seat count. New seats are added immediately to your existing team code.'
        },
        {
          question: 'What happens if I run out of seats?',
          answer: 'If all seats are consumed and someone tries to redeem your code:\n\n• The app will notify them "This team code is at capacity"\n• They won\'t get Premium access\n• You\'ll receive an email notification\n• You can purchase additional seats or remove inactive users\n\nWe recommend buying 10-20% more seats than your roster to account for tryouts, new players, and staff.'
        },
        {
          question: 'Can I remove someone from my team?',
          answer: 'For seasonal sports, there\'s no need to manually remove players! When your 6-month license expires, simply purchase a new license for your returning players only. The team code stays the same year after year. Players who left can join their new teams with different codes. This makes roster management simple and fair—everyone only pays for what they use.'
        },
        {
          question: 'When does my subscription renew?',
          answer: 'Team licenses are 6-month subscriptions—perfect for seasonal sports like baseball! You\'ll be charged 6 months from your purchase date. This means: Spring season starts in March → license expires in September. Buy again for fall ball with just your returning players. Your locked-in rate stays the same—even if we raise prices for new customers. You\'ll receive renewal reminder emails 30 days and 7 days before renewal.'
        },
        {
          question: 'What\'s your refund policy?',
          answer: 'We offer a 30-day money-back guarantee. If Mind & Muscle isn\'t right for your team within the first 30 days, contact <a href="mailto:support@mindandmuscle.ai" class="text-solar-surge-orange hover:underline">support@mindandmuscle.ai</a> for a full refund. No questions asked. After 30 days, subscriptions are non-refundable but you can cancel anytime to prevent future renewals.'
        },
        {
          question: 'How do I cancel my subscription?',
          answer: 'We don\'t want to see you go, but you can cancel anytime:\n\n1. Email <a href="mailto:support@mindandmuscle.ai" class="text-solar-surge-orange hover:underline">support@mindandmuscle.ai</a> with your team code\n2. We\'ll process the cancellation\n3. Your team keeps Premium access until the end of your paid period\n4. No future charges will occur\n\nYou can also manage your subscription through your Stripe customer portal (link in your purchase email).'
        }
      ]
    },
    {
      id: 'progress-tracking',
      title: 'Progress Tracking & Gamification',
      icon: TrendingUp,
      color: 'orange',
      faqs: [
        {
          question: 'What are streaks and how do I build them?',
          answer: 'Streaks track consecutive days you complete activities:\n\n• Mental Training Streak: Complete Mind Coach sessions daily\n• Workout Streak: Log strength training daily\n• Game Lab Streak: Play baseball IQ scenarios daily\n\nLonger streaks earn bonus XP and special badges. Miss a day? Your streak resets, but your progress and total completions remain. Streaks motivate consistency—the key to real improvement.'
        },
        {
          question: 'What badges can I unlock?',
          answer: 'Badges reward achievements across all areas:\n\n• Training Badges: "7-Day Warrior", "30-Day Champion", "100 Sessions"\n• IQ Badges: "Student of the Game", "Baseball Einstein"\n• Strength Badges: "Iron Will", "Power Player"\n• Progress Badges: "Goal Crusher", "Comeback Kid"\n• Special Badges: Hidden achievements for elite milestones\n\nView all available badges in your profile. See which ones you\'ve unlocked and what you need to earn the rest.'
        },
        {
          question: 'How do I earn XP?',
          answer: 'XP (Experience Points) is earned through:\n\n• Completing mental training sessions (10-50 XP)\n• Logging workouts (10-30 XP)\n• Playing Game Lab scenarios (5-20 XP based on difficulty)\n• Achieving goals (50-200 XP)\n• Building streaks (bonus multipliers)\n• Uploading swing analysis (15 XP)\n\nHigher difficulty activities earn more XP. Perfect scores and streaks earn bonus XP.'
        },
        {
          question: 'Where can I see my overall progress?',
          answer: 'Your progress is tracked in multiple places:\n\n• Dashboard: Daily overview of all activities, current streaks, recent achievements\n• Profile: Total XP, level, badges earned, lifetime stats\n• Goals Section: Individual goal progress with milestones\n• Reports Tab: Weekly summaries showing training volume, consistency, areas of improvement\n\nEach section gives you different insights into your development.'
        },
        {
          question: 'What\'s tracked in Dashboard vs Reports?',
          answer: 'Dashboard: Real-time, today-focused. Shows today\'s activities, active streaks, quick stats, and your daily checklist. Use it every day to see what to work on.\n\nReports: Historical analysis. Weekly summaries showing trends over time, comparing this week to last week, identifying patterns, and providing coaching insights. Use it weekly to reflect on progress and adjust your training.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical & Troubleshooting',
      icon: HelpCircle,
      color: 'blue',
      faqs: [
        {
          question: 'Which devices are supported?',
          answer: 'Mind & Muscle is available on:\n\n• iOS: iPhone and iPad running iOS 14.0 or later\n• Android: Phones and tablets running Android 8.0 or later\n\nFor best experience, keep your device updated to the latest OS version. Some features (like Swing Lab video analysis) work best on newer devices with better cameras and processors.'
        },
        {
          question: 'Does the app work offline?',
          answer: 'Partial offline support:\n\n✅ Works Offline:\n• Previously loaded mental training sessions\n• Logged workouts (sync when back online)\n• Game Lab scenarios you\'ve already played\n• Viewing your saved data and history\n\n❌ Requires Internet:\n• Uploading swing videos to Swing Lab\n• AI analysis and recommendations\n• Team chat and events\n• Downloading new content\n\nFor best experience, use Mind & Muscle with wifi or cellular data.'
        },
        {
          question: 'The app won\'t load - what should I do?',
          answer: 'Try these steps in order:\n\n1. Force close the app and reopen it\n2. Check your internet connection (wifi or cellular)\n3. Update to the latest version in App Store/Google Play\n4. Restart your device\n5. Delete and reinstall the app (your account data is saved in the cloud)\n\nStill having issues? Email <a href="mailto:support@mindandmuscle.ai" class="text-solar-surge-orange hover:underline">support@mindandmuscle.ai</a> with your device model and iOS/Android version.'
        },
        {
          question: 'My videos won\'t upload - help!',
          answer: 'Video upload issues are usually related to:\n\n1. File Size: Videos over 200MB may timeout. Trim your video to 10-15 seconds of your swing.\n2. Internet Speed: Use wifi for best results. Cellular uploads can be slow.\n3. Format: Use MP4 or MOV. Other formats may not be supported.\n4. Permissions: Make sure the app has permission to access your camera and photo library (Settings → Mind & Muscle → Photos).\n\nIf issues persist, try recording a new video directly in the Swing Lab camera.'
        },
        {
          question: 'How do I update the app?',
          answer: 'iOS: Open App Store → tap your profile icon → scroll to Mind & Muscle → tap "Update" if available.\n\nAndroid: Open Google Play Store → tap menu → "My apps & games" → find Mind & Muscle → tap "Update" if available.\n\nEnable automatic updates in your store settings to always have the latest features and fixes.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'To delete your account and all associated data:\n\n1. Go to More → Settings → Account Settings\n2. Scroll to bottom and tap "Delete Account"\n3. Confirm deletion (this is permanent!)\n\nOr email <a href="mailto:support@mindandmuscle.ai" class="text-solar-surge-orange hover:underline">support@mindandmuscle.ai</a> requesting account deletion. Your data will be permanently removed within 30 days per our privacy policy. If you have an active team license, you may need to remove yourself from the team first.'
        },
        {
          question: 'Where is my data stored?',
          answer: 'Your data is securely stored in the cloud using enterprise-grade encryption. This means:\n\n• Your progress syncs across devices\n• You can reinstall the app without losing data\n• Your coaches/parents can see shared data in real-time\n• Automatic backups protect against data loss\n\nWe use industry-standard security practices. Your personal information and training data are never sold to third parties.'
        },
        {
          question: 'Is my data secure and private?',
          answer: 'Yes. We take privacy seriously:\n\n• All data is encrypted in transit and at rest\n• We never sell your data to third parties\n• Parents only see data you explicitly share\n• Coaches only see data for their team members\n• You can delete your account and data anytime\n\nRead our full privacy policy at mindandmuscle.ai/legal. Questions? Email privacy@mindandmuscle.ai.'
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredSections = faqSections.map(section => ({
    ...section,
    faqs: section.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.faqs.length > 0);

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
          text="Frequently Asked Questions"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-relaxed"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed mb-8">
          Everything you need to know about using Mind & Muscle
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:border-neon-cortex-blue focus:ring-2 focus:ring-neon-cortex-blue/20 transition-all text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="max-w-5xl mx-auto space-y-6">
        {filteredSections.length === 0 ? (
          <LiquidGlass variant="neutral" rounded="2xl" className="p-12 text-center [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white/[0.02] [&>div:first-child]:via-transparent [&>div:first-child]:to-transparent">
            <p className="text-text-secondary">No results found for "{searchQuery}". Try different keywords or browse all categories below.</p>
          </LiquidGlass>
        ) : (
          filteredSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id];

            return (
              <LiquidGlass
                key={section.id}
                variant={section.color}
                rounded="2xl"
                className="overflow-hidden [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white/[0.02] [&>div:first-child]:via-transparent [&>div:first-child]:to-transparent"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      section.color === 'blue'
                        ? 'bg-neon-cortex-blue/20 border border-neon-cortex-blue/30'
                        : 'bg-solar-surge-orange/20 border border-solar-surge-orange/30'
                    }`}>
                      {section.iconImage ? (
                        <img
                          src={section.iconImage}
                          alt={`${section.title} icon`}
                          className="w-10 h-10 object-contain"
                          style={{filter: `drop-shadow(0 0 10px ${section.color === 'blue' ? 'rgba(14,165,233,0.8)' : 'rgba(249,115,22,0.8)'})`}}
                        />
                      ) : Icon ? (
                        <Icon className={`w-6 h-6 ${
                          section.color === 'blue' ? 'text-neon-cortex-blue' : 'text-solar-surge-orange'
                        }`} />
                      ) : null}
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-black">{section.title}</h2>
                      <p className="text-sm text-text-secondary">{section.faqs.length} questions</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Section Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 space-y-4">
                        {section.faqs.map((faq, faqIndex) => {
                          const questionId = `${section.id}-${faqIndex}`;
                          const isQuestionExpanded = expandedQuestions[questionId];

                          return (
                            <div
                              key={faqIndex}
                              className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                            >
                              <button
                                onClick={() => toggleQuestion(questionId)}
                                className="w-full p-4 text-left hover:bg-white/5 transition-all flex items-start justify-between gap-4"
                              >
                                <span className="font-semibold text-white">{faq.question}</span>
                                <ChevronDown
                                  className={`w-5 h-5 flex-shrink-0 transition-transform mt-1 ${
                                    isQuestionExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>

                              <AnimatePresence>
                                {isQuestionExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-white/10"
                                  >
                                    <div
                                      className="p-4 text-text-secondary whitespace-pre-line"
                                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </LiquidGlass>
            );
          })
        )}
      </div>

      {/* Still Need Help Section */}
      <div className="max-w-5xl mx-auto mt-12">
        <LiquidGlass variant="neutral" rounded="2xl" className="p-8 text-center [&>div:first-child]:bg-gradient-to-br [&>div:first-child]:from-white/[0.02] [&>div:first-child]:via-transparent [&>div:first-child]:to-transparent">
          <h3 className="text-2xl font-black mb-4">Still need help?</h3>
          <p className="text-text-secondary mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@mindandmuscle.ai"
              className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange hover:opacity-90 transition-all"
            >
              Email Support
            </a>
            <a
              href="/support"
              className="px-6 py-3 rounded-lg font-semibold border border-white/20 hover:bg-white/5 transition-all"
            >
              View Support Page
            </a>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}
