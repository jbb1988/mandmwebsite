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
          answer: 'Download the app and tap "Sign Up". You\'ll choose your role (Athlete, Coach, or Parent), then create your account with email and password. Follow the onboarding prompts to set up your profile.\n\n<strong>Have a team invite link?</strong> Even easier - tap the link your coach sent you. If you don\'t have the app yet, it will guide you to download it first, then automatically join your team after signup.'
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
          answer: 'Mind & Muscle is the first AI platform built exclusively for baseball and softball that integrates all aspects of player development. Instead of juggling 7+ different apps (team communication, mental training, video analysis, strength training, nutrition, IQ training, goal tracking), you get one intelligent system where everything connects. The AI learns from your swing videos, workouts, mental training, and goals—continuously improving recommendations across all areas. Every drill, every scenario, every mental training session is designed specifically for baseball and softball movements and situations. We didn\'t adapt generic training for baseball and softball. We built it from scratch for the sport.'
        },
        {
          question: 'Why is an all-in-one platform better than specialized apps?',
          answer: 'Fragmented apps create fragmented development:\n\n• Data Silos: Your swing analysis doesn\'t inform your strength training. Your mental training doesn\'t connect to your game situations.\n• No Learning: Specialized apps can\'t improve because they only see one piece of your development.\n• Complexity Kills Consistency: Managing 7 logins, 7 interfaces, and 7 monthly bills means most athletes quit before they see results.\n\nMind & Muscle solves this with integration:\n\n• Connected Intelligence: The AI sees your complete player profile and makes smarter recommendations\n• Adaptive Learning: Every session, workout, and analysis makes the entire system smarter\n• One Experience: Log in once. Everything in one place. One 6-month payment—perfect for seasonal sports.\n\nDevelopment isn\'t about using the most tools. It\'s about using tools that work together.'
        },
        {
          question: 'How does AI personalization work across the platform?',
          answer: 'Mind & Muscle\'s AI creates a complete profile of you as a player:\n\n• Position-Specific Intelligence: Pitchers get rotational power recommendations. Catchers get explosive leg training. Outfielders get sprint mechanics.\n• Learning From Feedback: After each mental training session, workout, or swing analysis, the AI asks for feedback and adjusts future recommendations.\n• Cross-Feature Insights: Your swing analysis identifies timing issues → The Zone recommends focus training → Goals AI suggests practice milestones → The Vault provides drills from verified instructors. Everything connects.\n• Adaptive Difficulty: Game Lab scenarios get harder as your mental batting average improves. Training progresses as you get stronger.\n\nThe system learns your strengths, identifies your gaps, and engineers development plans that actually work—because it sees the complete picture of who you are as a player.'
        },
        {
          question: 'Does Mind & Muscle require internet connection?',
          answer: 'Partial offline support:\n\n✅ Works Offline:\n• Previously loaded mental training sessions\n• Logged workouts (sync when back online)\n• Game Lab scenarios you\'ve already played\n• Viewing your saved data and history\n\n❌ Requires Internet:\n• AI analysis (Swing Lab, Goals AI, recommendations)\n• Team chat and events\n• Downloading new content\n• Syncing progress across devices\n\nFor best experience, use wifi or cellular data when using AI-powered features.'
        }
      ]
    },
    {
      id: 'the-zone',
      title: 'The Zone - Mental Training',
      iconImage: '/assets/mind/the_zone.png',
      color: 'blue',
      faqs: [
        {
          question: 'What is The Zone?',
          answer: 'The Zone is your mental command center—audio-first training designed to engineer peak performance states. It combines visualization, focus training, breathwork, and mental conditioning into powerful sessions that help you perform when it matters most.'
        },
        {
          question: 'How do I start a mental training session?',
          answer: 'Go to the Mind tab → The Zone. Browse content by archetype (CALM, FOCUS, ENERGY, EDGE) or explore curated collections. Tap a session to start and follow the guided audio experience. Sessions range from 3-20 minutes depending on your available time.'
        },
        {
          question: 'What are the Zone archetypes?',
          answer: 'The Zone offers sessions across four performance archetypes:\n\n• CALM - Deep relaxation and nervous system reset\n• FOCUS - Laser concentration and distraction elimination\n• ENERGY - Amp up intensity and competitive fire\n• EDGE - Pressure management and clutch performance\n\nEach archetype has multiple sessions tailored to different situations and experience levels.'
        },
        {
          question: 'When should I use The Zone?',
          answer: 'Use The Zone strategically:\n\n• Before Training: 5-10 minutes to lock in focus\n• Pre-Game: 3-5 minutes for mental preparation\n• Between Innings: Quick mental resets\n• Before Sleep: Recovery and next-day visualization\n• Anytime: Build mental skills through consistent practice\n\nThe more you train, the faster you can access peak performance states.'
        },
        {
          question: 'How do I track my mental training progress?',
          answer: 'Your mental training progress is tracked in multiple places:\n\n• The Zone shows completed sessions and favorites\n• Goals section tracks mental training goals\n• Dashboard displays daily mental training check-ins\n• Reports section shows weekly mental training summaries'
        },
        {
          question: 'What are session streaks?',
          answer: 'Build a streak by completing mental training sessions on consecutive days. Streaks motivate consistency and help build lasting mental skills. Your current streak is displayed in The Zone. Miss a day and your streak resets, but your progress and completed sessions remain.'
        }
      ]
    },
    {
      id: 'the-vault',
      title: 'The Vault - Professional Drill Library',
      iconImage: '/assets/images/the_vault.png',
      color: 'orange',
      faqs: [
        {
          question: 'What is The Vault?',
          answer: 'The Vault is your professional drill library—curated training content from verified instructors and top facilities. Stop searching YouTube for random drills. Get professional video demonstrations from certified coaches with real credentials.'
        },
        {
          question: 'Who creates the drills?',
          answer: 'Every drill in The Vault comes from verified instructors with real coaching credentials. Instructors are verified by facility affiliation or independent verification of their coaching background. You can see instructor profiles, credentials, and other drills they\'ve created.'
        },
        {
          question: 'How do I find drills?',
          answer: 'Browse The Vault by category (hitting, pitching, fielding, etc.), difficulty level, equipment needed, or instructor. Use the search to find specific drills or techniques. Filter by what you have available—some drills need equipment, others can be done anywhere.'
        },
        {
          question: 'Can I save favorite drills?',
          answer: 'Yes! Tap the heart icon on any drill to add it to your favorites. Access your saved drills anytime from the Saved tab. Build your personal drill library organized by your training focus areas.'
        },
        {
          question: 'Can I upload my own drills?',
          answer: 'Yes, if you\'re a verified instructor! Coaches with verified profiles can upload drills to share with the community. Apply for instructor verification through the app to share your expertise with thousands of athletes.'
        },
        {
          question: 'How do assigned drills work with Swing Lab and Pitch Lab?',
          answer: 'Coaches can assign drills to athletes from The Vault. When an athlete taps "Practice This Drill", the app automatically routes them to the right AI lab:\n\n• Hitting/Batting Drills → Swing Lab\n• Pitching Drills → Pitch Lab\n\nAthletes record their practice video and get instant AI analysis. The coach receives a push notification when practice is complete and can view the submission with AI feedback in The Vault\'s Submissions tab.'
        },
        {
          question: 'How do coaches assign drills to athletes?',
          answer: 'From any drill in The Vault, tap the "Assign" button. Select athletes from your team roster, add an optional note with coaching instructions, and send. Athletes receive a push notification and can view their assigned drills in the "Assigned to Me" tab. Track completion status and view practice submissions all in one place.'
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
          question: 'How do I earn XP and unlock badges?',
          answer: 'Every correct answer earns XP (experience points). Build streaks by training multiple days in a row for bonus XP. As you accumulate XP, you unlock badges like "IQ Rookie", "Student of the Game", and "Baseball Einstein". Higher difficulty scenarios earn more XP.'
        },
        {
          question: 'Do scenarios get harder as I improve?',
          answer: 'Yes! Game Lab adapts to your skill level. Each level gets progressively harder with more advanced scenarios, tighter game situations, and complex strategic decisions. This keeps challenging even elite players.'
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
          answer: 'AI analysis typically takes around 1 minute after upload. You\'ll get a complete breakdown with detailed feedback on your swing mechanics.'
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
        },
        {
          question: 'Can I practice assigned drills in Swing Lab?',
          answer: 'Yes! When your coach assigns you a hitting drill from The Vault, tap "Practice This Drill" to automatically open Swing Lab. Record your practice video and get AI analysis. Your coach is notified when you complete the practice and can view your submission with AI feedback. This creates a complete feedback loop between drill assignment and practice verification.'
        }
      ]
    },
    {
      id: 'plate-iq',
      title: 'Plate IQ - Pitch Anticipation Training',
      icon: TrendingUp,
      color: 'orange',
      faqs: [
        {
          question: 'What is Plate IQ?',
          answer: 'Plate IQ trains your brain to anticipate pitches through interactive scenario-based drills. It\'s like studying game film, but you\'re making decisions in real-time. 20+ real game scenarios teach you to think like an elite hitter—knowing what pitch is coming and where before it\'s thrown.'
        },
        {
          question: 'How does Plate IQ work?',
          answer: 'Each scenario presents a game situation: count, runners, outs, pitcher tendencies. You choose your approach:\n\n• Hunt Mode (0-1 strikes): Attack YOUR pitch. Pick a zone to hunt.\n• Battle Mode (2 strikes): Protect the plate. Compete and survive.\n\nSelect your zone target in our 13-zone system (9 strike zones + 4 chase zones), then get instant feedback on whether your approach matches what elite hitters would do.'
        },
        {
          question: 'What are Hunt Mode and Battle Mode?',
          answer: 'These two modes reflect how elite hitters approach different counts:\n\n<strong>Hunt Mode (0-1 strikes):</strong> You\'re the predator. Sit on your pitch, in your zone. Don\'t swing at anything else. Attack the fastball or wait for your pitch.\n\n<strong>Battle Mode (2 strikes):</strong> Survival mode. Expand your zone, shorten your swing, put the ball in play. A strikeout is the only bad outcome—make the pitcher earn it.'
        },
        {
          question: 'What is the 13-zone system?',
          answer: 'Based on MLB Statcast zones, the system includes:\n\n• 9 Strike Zones: Up-In, Up-Middle, Up-Away, Mid-In, Middle, Mid-Away, Down-In, Down-Middle, Down-Away\n• 4 Chase Zones: High (take), Low (classic chase zone), Inside (jam pitch), Outside (pitcher\'s favorite chase zone)\n\nEach zone has coaching tips about what pitches you\'ll see there and how to attack or lay off.'
        },
        {
          question: 'How do I improve my Plate IQ score?',
          answer: 'Your score improves by:\n\n1. Choosing the correct mode (Hunt vs Battle) for the count\n2. Selecting optimal zones based on the situation\n3. Learning from feedback after each scenario\n4. Practicing consistently to build instincts\n\nThe more you train, the faster these decisions become automatic—so you can focus on execution at the plate instead of thinking.'
        }
      ]
    },
    {
      id: 'pitch-lab',
      title: 'Pitch Lab - Pitching Video Analysis',
      icon: TrendingUp,
      color: 'blue',
      faqs: [
        {
          question: 'What is Pitch Lab?',
          answer: 'Pitch Lab is our AI-powered pitching video analysis tool. Upload a video of your pitching motion and get professional-grade mechanics breakdown in seconds. Design filthy pitches while protecting your arm.'
        },
        {
          question: 'How do I upload my pitching video?',
          answer: 'Go to Pitch Lab → tap "Upload". Record a new video or select from your camera roll.\n\nBest practices:\n• Film from the side (perpendicular to the rubber)\n• Capture full wind-up through follow-through\n• Good lighting helps the AI see better\n• Keep camera steady—use a tripod if possible\n\nWorks for both baseball (overhand) and softball (windmill/underhand) pitchers.'
        },
        {
          question: 'What analysis will I get?',
          answer: 'Pitch Lab provides an 8-component mechanical analysis:\n\n• Balance & posture\n• Leg drive & hip rotation\n• Arm action & slot\n• Release point consistency\n• Follow-through mechanics\n• Timing & tempo\n• Deception elements\n• Overall efficiency\n\nPlus arm health risk assessment and custom drill recommendations targeting your specific needs.'
        },
        {
          question: 'What is the Arm Health Assessment?',
          answer: 'Pitch Lab analyzes your mechanics for injury risk indicators:\n\n• Inverted W position (shoulder stress)\n• Early trunk rotation (arm drag)\n• Improper hip-shoulder separation\n• Landing mechanics (knee/ankle stress)\n• Deceleration patterns\n\nYou\'ll get a risk level indicator and specific recommendations to protect your arm while still throwing gas.'
        },
        {
          question: 'Does Pitch Lab work for softball pitchers?',
          answer: 'Yes! Pitch Lab supports both:\n\n• Baseball (overhand): Traditional pitching mechanics analysis\n• Softball (windmill): Underhand pitching motion analysis\n\nSelect your sport type before uploading, and the AI adjusts its analysis to match the specific mechanics of your pitching style.'
        },
        {
          question: 'How do analysis credits work?',
          answer: 'Analysis credits are shared between Swing Lab and Pitch Lab. Pro subscribers get monthly credits. Each video analysis uses 1 credit. You can purchase additional credit packs if needed, or upgrade your plan for more monthly credits.'
        },
        {
          question: 'Can I practice assigned pitching drills in Pitch Lab?',
          answer: 'Yes! When your coach assigns you a pitching drill from The Vault, tap "Practice This Drill" to automatically open Pitch Lab. Record your practice video and get AI mechanics analysis. Your coach is notified when you complete the practice and can view your submission with AI feedback on your pitching mechanics, including arm health assessment.'
        }
      ]
    },
    {
      id: 'arm-builder',
      title: 'Arm Builder - Arm Care & Throwing Development',
      icon: Dumbbell,
      color: 'blue',
      faqs: [
        {
          question: 'What is Arm Builder?',
          answer: 'Arm Builder is your complete arm care and throwing development system. Build velocity, prevent injury, and throw gas. Track your arm health, follow proper warmup routines, log long toss sessions, and work toward distance and velocity goals.'
        },
        {
          question: 'Is Arm Builder free?',
          answer: 'Yes! Arm Builder is completely free for all users. We believe arm health is too important to put behind a paywall. Every player deserves access to proper arm care tools. Build it right, build it for free.'
        },
        {
          question: 'What is the Arm Feel Check-In?',
          answer: 'Start each session by rating how your arm feels on a 1-5 scale:\n\n• 1-2: Rest day recommended (recovery focus)\n• 3: Light throwing only\n• 4: Normal throwing day\n• 5: Feeling great, full go\n\nThis helps you make smart decisions about your throwing load and prevents overuse injuries. Your arm is your career—listen to it.'
        },
        {
          question: 'How do I use the Long Toss Logger?',
          answer: 'After your throwing session:\n\n1. Log your maximum distance reached\n2. Record number of throws\n3. Add notes about how you felt\n4. Track progress toward your distance goals\n\nOver time, you\'ll see your arm strength improve as you consistently build up distance and recovery capacity.'
        },
        {
          question: 'What warmup routines are included?',
          answer: 'Arm Builder includes position-specific warmup routines:\n\n• Band work for shoulder stability\n• Arm circles and stretches\n• Progressive throwing distances\n• Wrist and forearm exercises\n\nFollow the routine before every throwing session. Proper prep prevents injury and helps you throw harder, longer.'
        },
        {
          question: 'How do I set throwing goals?',
          answer: 'In Arm Builder, you can set two types of goals:\n\n• Distance Goals: Target max long toss distance (e.g., "throw 250 feet by end of season")\n• Velocity Goals: Target throwing velocity if you have access to a radar gun\n\nThe app tracks your progress and celebrates when you hit milestones. Consistent training + proper arm care = velocity gains.'
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
          question: 'Can my coach or parent see my goals?',
          answer: 'Yes! Goals are automatically visible to:\n\n• Coaches: When you share a goal with your coach, they can track your progress.\n• Parents: When a parent is linked to your account, they automatically see all your goals and reports. No manual sharing needed—the link grants access.'
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
          answer: 'Go to AI Assistant Coach → tap "Create Drill". You can create your own custom drills to save alongside AI-generated drills. Add a title, description, and any notes you want to remember. Your custom drills are saved for easy access anytime.'
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
          answer: 'When you join a team (via invite link or code), you\'re automatically added to your team\'s Chatter. Go to Chatter tab to see team messages. That dugout energy, 24/7. Build the brotherhood that separates great teams from good ones.'
        },
        {
          question: 'How do I create an event?',
          answer: 'Coaches and Admins can create events. Go to Events → tap "Create Event". Add details (game, practice, tournament), set date/time/location. The event automatically appears on all team members\' calendars. Coaches can also promote team members to Admin, giving them the ability to create and manage events.'
        },
        {
          question: 'How does attendance tracking work?',
          answer: 'Simply swipe on any event card to reveal the attendance screen. Each event has RSVP options: Going, Can\'t Make It, Maybe. Coaches see attendance dashboard with real-time responses. Parents can mark their athlete\'s availability. No more "I thought practice was at 5pm" excuses.'
        },
        {
          question: 'What is the Uniform Creator?',
          answer: 'Coaches and Admins can create and save custom uniform presets for the team. Build a uniform by selecting hat, jersey, belt, pants, and socks—you can even add a photo of the actual uniform. Once saved, just select your preset when creating events. No more re-entering the same uniform details every time. Perfect team coordination, zero confusion on game day.'
        },
        {
          question: 'How do I get directions to fields?',
          answer: 'Every event location has navigation integration. Tap "Get Directions" to open in your preferred maps app (Apple Maps, Google Maps, Waze). No one gets lost. No one shows up late. Your team moves like a championship machine.'
        },
        {
          question: 'Can parents see team events?',
          answer: 'Yes! Parents linked to their athlete see all team events on their calendar. They can view event details, location, and RSVP for their athlete. Parents stay informed without needing Premium access. Plus, all users (Apple and Android) can sync events to their phone\'s calendar—either single events or the full team schedule.'
        },
        {
          question: 'How do parents link to their athlete?',
          answer: 'Parents connect to their athlete by entering their child\'s email address in the app. Go to Parent Dashboard → tap "Link Athlete" and enter the email your child used to create their Mind & Muscle account. Your child will receive a request and can approve or deny the connection. Once approved, you automatically see ALL their Goals, Weekly Reports, and assigned Drills—no manual sharing needed! This is independent of team membership—the link stays active even if your athlete changes teams.'
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
          question: 'How do I join a team?',
          answer: '<strong>Easy way (recommended):</strong> Your coach sends you a link like <code class="text-neon-cortex-blue">mindandmuscle.ai/t/TEAM-XXXX</code>. Tap the link → it opens in the app → tap "Join Team" → done! You\'re instantly connected with Premium access.\n\n<strong>Manual way (backup):</strong> Go to More → Settings → Teams → "Redeem Team Code". Enter your code (e.g., TEAM-XXXX-XXXX-XXXX) and tap "Redeem".\n\nBoth methods give you the same result - you\'ll be added to your team with Premium access instantly.'
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
          answer: 'Streaks track consecutive days you complete activities:\n\n• Daily Hit Streak: Complete your daily content\n• Zone Streak: Complete The Zone mental training sessions daily\n• Vault Streak: Watch drills and add favorites in The Vault daily\n• Dugout Talk Streak: Make Dugout Talk entries daily\n\nLonger streaks earn bonus XP and special badges. Miss a day? Your streak resets, but your progress and total completions remain. Streaks motivate consistency—the key to real improvement.'
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
          question: 'What are Weekly Reports?',
          answer: 'Weekly Reports provide historical analysis of your training. Get weekly summaries showing trends over time, comparing this week to last week, identifying patterns, and providing coaching insights. Use it weekly to reflect on progress and adjust your training.'
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
          answer: 'Video upload issues are usually related to:\n\n1. File Size: Videos over 25MB may timeout. Trim your video to 10-15 seconds of your swing.\n2. Internet Speed: Use wifi for best results. Cellular uploads can be slow.\n3. Format: Use MP4 or MOV. Other formats may not be supported.\n4. Permissions: Make sure the app has permission to access your camera and photo library (Settings → Mind & Muscle → Photos).\n\nIf issues persist, try recording a new video directly in the Swing Lab camera.'
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
