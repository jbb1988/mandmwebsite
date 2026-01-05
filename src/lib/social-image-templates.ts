/**
 * Social Image Templates Library
 *
 * Premium, agency-quality social media image templates for partners.
 * 40+ templates across 5 categories, each designed to professional standards.
 *
 * Design Philosophy:
 * - NO visible URLs (uses QR codes instead)
 * - Partner's name/org prominently featured
 * - Professional typography and spacing
 * - Would Nike/Under Armour post this? (gut check)
 */

// ============================================================================
// Type Definitions (shared with social-image-generator.ts)
// ============================================================================

export type TemplateStyle = 'bold_impact' | 'clean_minimal' | 'split_layout' | 'story' | 'data_stats';

export type TemplateCategory = 'feature' | 'benefit' | 'social_proof' | 'cta' | 'seasonal';

export type GradientPreset = 'mind' | 'action' | 'tech' | 'premium' | 'dark' | 'energy' | 'fresh' | 'fire';

// ============================================================================
// Template Interface
// ============================================================================

export interface SocialImageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  style: TemplateStyle;

  // Content
  headline: string;
  subheadline?: string;
  bodyText?: string;
  ctaText?: string;

  // Feature-specific
  featureName?: string;
  featureIcon?: string; // emoji or icon name

  // Visual customization
  primaryColor: string;
  accentColor: string;
  backgroundType: 'photo' | 'gradient';
  gradientPreset?: GradientPreset;

  // Layout options
  includeQR: boolean;
  includePartnerBadge: boolean;
  includeFeatureBadge: boolean;
  badgeText?: string;

  // Platform optimization hints
  bestFor: ('instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok')[];

  // Seasonal/time-limited
  seasonal?: boolean;
  activeMonths?: number[]; // 1-12
}

// ============================================================================
// Color Constants (for easy reference in templates)
// ============================================================================

const COLORS = {
  cortexBlue: '#0EA5E9',
  solarOrange: '#F97316',
  successGreen: '#22C55E',
  premiumGold: '#F59E0B',
  energyRed: '#EF4444',
  deepPurple: '#8B5CF6',
  freshCyan: '#06B6D4',
  white: '#FFFFFF',
};

// ============================================================================
// FEATURE HIGHLIGHT TEMPLATES (12)
// ============================================================================

const FEATURE_TEMPLATES: SocialImageTemplate[] = [
  // 1. Swing Lab - AI Video Analysis
  {
    id: 'feature_swing_lab',
    name: 'Swing Lab - AI Video Analysis',
    category: 'feature',
    style: 'bold_impact',
    headline: 'Your Swing Flaws\nHave Nowhere to Hide',
    subheadline: 'AI analysis that\'s brutally honest. You\'re welcome.',
    ctaText: 'Scan to Learn More',
    featureName: 'Swing Lab',
    featureIcon: '🎯',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.solarOrange,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'AI-POWERED',
    bestFor: ['instagram', 'facebook', 'twitter'],
  },

  // 2. Plate IQ - Pitch Anticipation
  {
    id: 'feature_plate_iq',
    name: 'Plate IQ - Read the Pitch',
    category: 'feature',
    style: 'bold_impact',
    headline: 'See It Before\nThey Throw It',
    subheadline: 'Creepy? Maybe. Effective? Definitely.',
    ctaText: 'Start Training',
    featureName: 'Plate IQ',
    featureIcon: '👁️',
    primaryColor: COLORS.solarOrange,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'gradient',
    gradientPreset: 'action',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'GAME-CHANGER',
    bestFor: ['instagram', 'twitter', 'tiktok'],
  },

  // 3. Pitch Lab - Pitcher Analysis
  {
    id: 'feature_pitch_lab',
    name: 'Pitch Lab - Pitcher Analysis',
    category: 'feature',
    style: 'data_stats',
    headline: 'Your Pitches Are Mid.\nLet\'s Fix That.',
    subheadline: 'Break down every pitch. Build something scary.',
    ctaText: 'Analyze Your Pitches',
    featureName: 'Pitch Lab',
    featureIcon: '⚾',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.successGreen,
    backgroundType: 'gradient',
    gradientPreset: 'tech',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'FOR PITCHERS',
    bestFor: ['instagram', 'facebook', 'linkedin'],
  },

  // 4. Game Lab - Baseball IQ
  {
    id: 'feature_game_lab',
    name: 'Game Lab - Baseball IQ',
    category: 'feature',
    style: 'clean_minimal',
    headline: 'Baseball IQ >\nTalent',
    subheadline: 'When you know what\'s coming, everything changes.',
    ctaText: 'Build Your Baseball IQ',
    featureName: 'Game Lab',
    featureIcon: '🧠',
    primaryColor: COLORS.premiumGold,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'gradient',
    gradientPreset: 'premium',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'STRATEGY',
    bestFor: ['linkedin', 'facebook', 'twitter'],
  },

  // 5. The Zone - Mental Training
  {
    id: 'feature_the_zone',
    name: 'The Zone - Mental Training',
    category: 'feature',
    style: 'clean_minimal',
    headline: 'Your Thoughts Were\nToo Loud Anyway',
    subheadline: 'Audio-first mental training. Silence the noise.',
    ctaText: 'Find Your Edge',
    featureName: 'The Zone',
    featureIcon: '🧠',
    primaryColor: COLORS.deepPurple,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'gradient',
    gradientPreset: 'mind',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'MENTAL EDGE',
    bestFor: ['instagram', 'linkedin', 'facebook'],
  },

  // 6. Sound Lab - Pre-Game Focus
  {
    id: 'feature_sound_lab',
    name: 'Sound Lab - Pre-Game Focus',
    category: 'feature',
    style: 'story',
    headline: 'Headphones On.\nWorld Off.',
    subheadline: 'Pre-game audio that hits different.',
    ctaText: 'Find Your Focus',
    featureName: 'Sound Lab',
    featureIcon: '🎧',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.deepPurple,
    backgroundType: 'gradient',
    gradientPreset: 'dark',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'PRE-GAME',
    bestFor: ['instagram', 'tiktok'],
  },

  // 7. The Vault - Professional Drill Library
  {
    id: 'feature_the_vault',
    name: 'The Vault - Professional Drills',
    category: 'feature',
    style: 'bold_impact',
    headline: 'Drills That\nDon\'t Suck',
    subheadline: 'From verified pros who actually know things.',
    ctaText: 'Access Drills',
    featureName: 'The Vault',
    featureIcon: '🎬',
    primaryColor: COLORS.energyRed,
    accentColor: COLORS.solarOrange,
    backgroundType: 'gradient',
    gradientPreset: 'fire',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'DRILLS',
    bestFor: ['instagram', 'facebook', 'tiktok'],
  },

  // 8. Fuel AI - Nutrition
  {
    id: 'feature_fuel_ai',
    name: 'Fuel AI - Nutrition Planning',
    category: 'feature',
    style: 'clean_minimal',
    headline: 'Stop Eating\nLike a Rookie',
    subheadline: 'AI nutrition that matches your training. Finally.',
    ctaText: 'Optimize Nutrition',
    featureName: 'Fuel AI',
    featureIcon: '🥗',
    primaryColor: COLORS.successGreen,
    accentColor: COLORS.freshCyan,
    backgroundType: 'gradient',
    gradientPreset: 'fresh',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'NUTRITION',
    bestFor: ['instagram', 'facebook', 'linkedin'],
  },

  // 9. Arm Builder (FREE)
  {
    id: 'feature_arm_builder',
    name: 'Arm Builder - FREE',
    category: 'feature',
    style: 'bold_impact',
    headline: 'Free Arm Care.\nNo Excuses Left.',
    subheadline: 'Your arm doesn\'t care about your budget.',
    ctaText: 'Start Free',
    featureName: 'Arm Builder',
    featureIcon: '🦾',
    primaryColor: COLORS.successGreen,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'FREE',
    bestFor: ['instagram', 'facebook', 'twitter', 'tiktok'],
  },

  // 10. Weekly Reports
  {
    id: 'feature_weekly_reports',
    name: 'Weekly Progress Reports',
    category: 'feature',
    style: 'data_stats',
    headline: 'Receipts for\nYour Grind',
    subheadline: 'Weekly proof you\'re not wasting your time.',
    ctaText: 'See Your Progress',
    featureName: 'Weekly Reports',
    featureIcon: '📊',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.premiumGold,
    backgroundType: 'gradient',
    gradientPreset: 'tech',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'DATA',
    bestFor: ['linkedin', 'facebook', 'twitter'],
  },

  // 11. AI Assistant Coach
  {
    id: 'feature_ai_assistant',
    name: 'AI Assistant Coach',
    category: 'feature',
    style: 'clean_minimal',
    headline: 'Your Coach\nNever Sleeps',
    subheadline: 'Ask anything. Get answers that don\'t suck.',
    ctaText: 'Meet Your AI Coach',
    featureName: 'AI Assistant',
    featureIcon: '🤖',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.solarOrange,
    backgroundType: 'gradient',
    gradientPreset: 'tech',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'AI COACH',
    bestFor: ['instagram', 'twitter', 'linkedin'],
  },

  // 12. Full Platform Overview
  {
    id: 'feature_full_platform',
    name: 'Full Platform Overview',
    category: 'feature',
    style: 'split_layout',
    headline: 'One App to Replace\nYour Whole Stack',
    subheadline: '10+ AI coaches. Zero excuses.',
    bodyText: 'Swing • Plate IQ • Mind • Muscle • Fuel • Sound',
    ctaText: 'Explore the Platform',
    featureName: 'Mind & Muscle',
    featureIcon: '⚡',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.solarOrange,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'facebook', 'linkedin', 'twitter'],
  },
];

// ============================================================================
// BENEFIT-FOCUSED TEMPLATES (8)
// ============================================================================

const BENEFIT_TEMPLATES: SocialImageTemplate[] = [
  // 1. Train the Complete Player
  {
    id: 'benefit_complete_player',
    name: 'Train the Complete Player',
    category: 'benefit',
    style: 'bold_impact',
    headline: 'Stop Being Mid\nat Everything',
    subheadline: 'Mind. Body. Game. All in one place.',
    ctaText: 'Get Started',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.solarOrange,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'facebook', 'twitter'],
  },

  // 2. Performance Under Pressure
  {
    id: 'benefit_under_pressure',
    name: 'Performance Under Pressure',
    category: 'benefit',
    style: 'bold_impact',
    headline: 'Clutch Is a Skill.\nTrain It.',
    subheadline: 'Big moments favor the prepared.',
    ctaText: 'Build Clutch Skills',
    primaryColor: COLORS.solarOrange,
    accentColor: COLORS.energyRed,
    backgroundType: 'gradient',
    gradientPreset: 'action',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'twitter', 'tiktok'],
  },

  // 3. The Mental Edge
  {
    id: 'benefit_mental_edge',
    name: 'The Mental Edge',
    category: 'benefit',
    style: 'clean_minimal',
    headline: 'Talent Is Common.\nMental Toughness Isn\'t.',
    subheadline: 'The difference between good and remembered.',
    ctaText: 'Gain Your Edge',
    primaryColor: COLORS.deepPurple,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'gradient',
    gradientPreset: 'mind',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['linkedin', 'instagram', 'facebook'],
  },

  // 4. Data-Driven Development
  {
    id: 'benefit_data_driven',
    name: 'Data-Driven Development',
    category: 'benefit',
    style: 'data_stats',
    headline: 'Your Gut Is Wrong.\nData Isn\'t.',
    subheadline: 'Track. Analyze. Stop guessing.',
    ctaText: 'See Your Stats',
    primaryColor: COLORS.freshCyan,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'gradient',
    gradientPreset: 'tech',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['linkedin', 'twitter', 'facebook'],
  },

  // 5. Elite Coaching on Your Phone
  {
    id: 'benefit_elite_coaching',
    name: 'Elite Coaching on Your Phone',
    category: 'benefit',
    style: 'clean_minimal',
    headline: 'Pro Secrets.\nZero Pro Prices.',
    subheadline: 'What used to cost thousands now fits in your pocket.',
    ctaText: 'Train Like a Pro',
    primaryColor: COLORS.premiumGold,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'gradient',
    gradientPreset: 'premium',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'facebook', 'linkedin'],
  },

  // 6. One App, Every Skill
  {
    id: 'benefit_one_app',
    name: 'One App, Every Skill',
    category: 'benefit',
    style: 'split_layout',
    headline: 'Delete the\nOther 7 Apps',
    subheadline: 'Juggling apps is for clowns. You\'re not a clown.',
    ctaText: 'Simplify Training',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.successGreen,
    backgroundType: 'gradient',
    gradientPreset: 'tech',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'facebook', 'twitter'],
  },

  // 7. The Competitive Edge
  {
    id: 'benefit_competitive_edge',
    name: 'The Competitive Edge',
    category: 'benefit',
    style: 'bold_impact',
    headline: 'While They Rest,\nYou Train',
    subheadline: 'The gap widens every day they skip.',
    ctaText: 'Get Ahead',
    primaryColor: COLORS.solarOrange,
    accentColor: COLORS.premiumGold,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'twitter', 'tiktok'],
  },

  // 8. Train What Others Don't
  {
    id: 'benefit_train_different',
    name: 'Train What Others Don\'t',
    category: 'benefit',
    style: 'bold_impact',
    headline: 'The 1% Nobody\nTalks About',
    subheadline: 'Mental reps. The edge hiding in plain sight.',
    ctaText: 'Be Different',
    primaryColor: COLORS.deepPurple,
    accentColor: COLORS.solarOrange,
    backgroundType: 'gradient',
    gradientPreset: 'dark',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'twitter', 'tiktok'],
  },
];

// ============================================================================
// SOCIAL PROOF TEMPLATES (6)
// ============================================================================

const SOCIAL_PROOF_TEMPLATES: SocialImageTemplate[] = [
  // 1. What I've Seen with My Players
  {
    id: 'social_coach_seen',
    name: 'What I\'ve Seen',
    category: 'social_proof',
    style: 'clean_minimal',
    headline: 'My Players Used\nto Be Average',
    subheadline: 'Key word: used to.',
    ctaText: 'Learn More',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.successGreen,
    backgroundType: 'gradient',
    gradientPreset: 'dark',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'COACH RECOMMENDED',
    bestFor: ['facebook', 'linkedin', 'instagram'],
  },

  // 2. Parent Recommendation
  {
    id: 'social_parent_rec',
    name: 'Parent Recommendation',
    category: 'social_proof',
    style: 'clean_minimal',
    headline: 'They Open This\nMore Than TikTok',
    subheadline: 'Okay, almost. But still.',
    ctaText: 'See Why',
    primaryColor: COLORS.successGreen,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'gradient',
    gradientPreset: 'fresh',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'PARENT APPROVED',
    bestFor: ['facebook', 'instagram'],
  },

  // 3. Coach Approved
  {
    id: 'social_coach_approved',
    name: 'Coach Approved',
    category: 'social_proof',
    style: 'bold_impact',
    headline: 'Coach Tested.\nBS Filtered.',
    subheadline: 'If it didn\'t work, we\'d tell you.',
    ctaText: 'Join Us',
    primaryColor: COLORS.premiumGold,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'TRUSTED',
    bestFor: ['instagram', 'twitter', 'facebook'],
  },

  // 4. Player Transformation
  {
    id: 'social_transformation',
    name: 'Player Transformation',
    category: 'social_proof',
    style: 'split_layout',
    headline: 'Same Kid.\nDifferent Player.',
    subheadline: 'Consistency hits different.',
    ctaText: 'Start the Journey',
    primaryColor: COLORS.solarOrange,
    accentColor: COLORS.successGreen,
    backgroundType: 'gradient',
    gradientPreset: 'action',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'tiktok', 'facebook'],
  },

  // 5. Results That Show
  {
    id: 'social_results',
    name: 'Results That Show',
    category: 'social_proof',
    style: 'data_stats',
    headline: 'The Receipts\nDon\'t Lie',
    subheadline: 'Progress you can screenshot.',
    ctaText: 'Track Progress',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.premiumGold,
    backgroundType: 'gradient',
    gradientPreset: 'tech',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['linkedin', 'facebook', 'twitter'],
  },

  // 6. The Difference
  {
    id: 'social_difference',
    name: 'The Difference',
    category: 'social_proof',
    style: 'clean_minimal',
    headline: 'The Gap\nIs Real',
    subheadline: 'Between almost-made-it and actually-made-it.',
    ctaText: 'Make the Leap',
    primaryColor: COLORS.deepPurple,
    accentColor: COLORS.solarOrange,
    backgroundType: 'gradient',
    gradientPreset: 'mind',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'twitter', 'linkedin'],
  },
];

// ============================================================================
// CALL-TO-ACTION TEMPLATES (6)
// ============================================================================

const CTA_TEMPLATES: SocialImageTemplate[] = [
  // 1. Get Started Today
  {
    id: 'cta_get_started',
    name: 'Get Started Today',
    category: 'cta',
    style: 'bold_impact',
    headline: 'Your Future Self\nWill Thank You',
    subheadline: 'Current self might complain. Ignore them.',
    ctaText: 'Scan to Start',
    primaryColor: COLORS.solarOrange,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'facebook', 'twitter', 'tiktok'],
  },

  // 2. Download the App
  {
    id: 'cta_download',
    name: 'Download the App',
    category: 'cta',
    style: 'clean_minimal',
    headline: 'Your Competition\nHopes You Won\'t',
    subheadline: 'Available on iOS & Android. No excuses.',
    ctaText: 'Get the App',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.successGreen,
    backgroundType: 'gradient',
    gradientPreset: 'tech',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'facebook', 'twitter'],
  },

  // 3. Join the Movement
  {
    id: 'cta_join',
    name: 'Join the Movement',
    category: 'cta',
    style: 'bold_impact',
    headline: 'Join the 1% Who\nActually Train',
    subheadline: 'The other 99% are scrolling right now.',
    ctaText: 'Join Now',
    primaryColor: COLORS.deepPurple,
    accentColor: COLORS.solarOrange,
    backgroundType: 'gradient',
    gradientPreset: 'energy',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['instagram', 'twitter', 'tiktok'],
  },

  // 4. Limited Time
  {
    id: 'cta_limited',
    name: 'Limited Time Offer',
    category: 'cta',
    style: 'bold_impact',
    headline: 'The Price Goes Up.\nYour Skills Won\'t.',
    subheadline: 'Unless you do something about it.',
    ctaText: 'Claim Now',
    primaryColor: COLORS.energyRed,
    accentColor: COLORS.premiumGold,
    backgroundType: 'gradient',
    gradientPreset: 'fire',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'URGENT',
    bestFor: ['instagram', 'facebook', 'twitter'],
  },

  // 5. Baseball & Softball Parents
  {
    id: 'cta_parents',
    name: 'Baseball & Softball Parents',
    category: 'cta',
    style: 'clean_minimal',
    headline: 'Give Your Kid an\nUnfair Advantage',
    subheadline: 'Other parents will hate you. Worth it.',
    ctaText: 'Learn More',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.successGreen,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: false,
    bestFor: ['facebook', 'instagram'],
  },

  // 6. Coaches - Help Your Players
  {
    id: 'cta_coaches',
    name: 'Coaches - Help Your Players',
    category: 'cta',
    style: 'clean_minimal',
    headline: 'Stop Repeating\nYourself',
    subheadline: 'The app remembers. They\'ll remember too.',
    ctaText: 'Partner With Us',
    primaryColor: COLORS.premiumGold,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'gradient',
    gradientPreset: 'premium',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'FOR COACHES',
    bestFor: ['linkedin', 'facebook', 'twitter'],
  },
];

// ============================================================================
// SEASONAL TEMPLATES (8+)
// ============================================================================

const SEASONAL_TEMPLATES: SocialImageTemplate[] = [
  // 1. Spring Training
  {
    id: 'seasonal_spring',
    name: 'Spring Training',
    category: 'seasonal',
    style: 'bold_impact',
    headline: 'Spring Called.\nYou\'re Not Ready.',
    subheadline: 'Prove it wrong. Starting now.',
    ctaText: 'Start Training',
    primaryColor: COLORS.successGreen,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'SPRING',
    seasonal: true,
    activeMonths: [2, 3, 4], // Feb-April
    bestFor: ['instagram', 'facebook', 'twitter'],
  },

  // 2. Summer Camp Season
  {
    id: 'seasonal_summer',
    name: 'Summer Training',
    category: 'seasonal',
    style: 'bold_impact',
    headline: 'Summer Bodies Are Made Now.\nSo Are Champions.',
    subheadline: 'Don\'t waste the reps.',
    ctaText: 'Summer Plan',
    primaryColor: COLORS.solarOrange,
    accentColor: COLORS.premiumGold,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'SUMMER',
    seasonal: true,
    activeMonths: [5, 6, 7], // May-July
    bestFor: ['instagram', 'facebook', 'twitter', 'tiktok'],
  },

  // 3. Fall Ball
  {
    id: 'seasonal_fall',
    name: 'Fall Ball Prep',
    category: 'seasonal',
    style: 'clean_minimal',
    headline: 'Fall Ball Separates\nPretenders',
    subheadline: 'Which side are you on?',
    ctaText: 'Get Ready',
    primaryColor: COLORS.solarOrange,
    accentColor: COLORS.energyRed,
    backgroundType: 'gradient',
    gradientPreset: 'action',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'FALL BALL',
    seasonal: true,
    activeMonths: [8, 9, 10], // Aug-Oct
    bestFor: ['instagram', 'facebook'],
  },

  // 4. Tournament Season
  {
    id: 'seasonal_tournament',
    name: 'Tournament Season',
    category: 'seasonal',
    style: 'bold_impact',
    headline: 'Tournament Mode:\nActivated',
    subheadline: 'This is what you trained for. Right?',
    ctaText: 'Peak Now',
    primaryColor: COLORS.premiumGold,
    accentColor: COLORS.solarOrange,
    backgroundType: 'photo',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'COMPETE',
    seasonal: true,
    activeMonths: [5, 6, 7, 8], // May-Aug
    bestFor: ['instagram', 'twitter', 'tiktok'],
  },

  // 5. Off-Season Training
  {
    id: 'seasonal_offseason',
    name: 'Off-Season Training',
    category: 'seasonal',
    style: 'split_layout',
    headline: 'Off-Season\nIs a Myth',
    subheadline: 'Winners don\'t take breaks. They take advantages.',
    ctaText: 'Train Now',
    primaryColor: COLORS.deepPurple,
    accentColor: COLORS.cortexBlue,
    backgroundType: 'gradient',
    gradientPreset: 'dark',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'OFF-SEASON',
    seasonal: true,
    activeMonths: [10, 11, 12, 1], // Oct-Jan
    bestFor: ['instagram', 'facebook', 'linkedin'],
  },

  // 6. New Year Goals
  {
    id: 'seasonal_newyear',
    name: 'New Year Goals',
    category: 'seasonal',
    style: 'bold_impact',
    headline: 'New Year.\nSame Excuses?',
    subheadline: 'Or are we doing something different this time?',
    ctaText: 'Set Goals',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.premiumGold,
    backgroundType: 'gradient',
    gradientPreset: 'premium',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: '2026',
    seasonal: true,
    activeMonths: [12, 1], // Dec-Jan
    bestFor: ['instagram', 'facebook', 'twitter', 'linkedin'],
  },

  // 7. Back to School
  {
    id: 'seasonal_school',
    name: 'Back to School',
    category: 'seasonal',
    style: 'clean_minimal',
    headline: 'School\'s Back.\nSo Is Your Grind.',
    subheadline: 'Balance is possible. Champions prove it.',
    ctaText: 'Train Smart',
    primaryColor: COLORS.cortexBlue,
    accentColor: COLORS.successGreen,
    backgroundType: 'gradient',
    gradientPreset: 'tech',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'SCHOOL',
    seasonal: true,
    activeMonths: [8, 9], // Aug-Sep
    bestFor: ['facebook', 'instagram'],
  },

  // 8. Holiday Special
  {
    id: 'seasonal_holiday',
    name: 'Holiday Training',
    category: 'seasonal',
    style: 'clean_minimal',
    headline: 'The Gift That Keeps\non Grinding',
    subheadline: 'Better than socks. Actually useful.',
    ctaText: 'Gift Training',
    primaryColor: COLORS.energyRed,
    accentColor: COLORS.successGreen,
    backgroundType: 'gradient',
    gradientPreset: 'dark',
    includeQR: true,
    includePartnerBadge: true,
    includeFeatureBadge: true,
    badgeText: 'HOLIDAY',
    seasonal: true,
    activeMonths: [11, 12], // Nov-Dec
    bestFor: ['facebook', 'instagram'],
  },
];

// ============================================================================
// EXPORTED TEMPLATE COLLECTION
// ============================================================================

export const SOCIAL_IMAGE_TEMPLATES: SocialImageTemplate[] = [
  ...FEATURE_TEMPLATES,
  ...BENEFIT_TEMPLATES,
  ...SOCIAL_PROOF_TEMPLATES,
  ...CTA_TEMPLATES,
  ...SEASONAL_TEMPLATES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): SocialImageTemplate[] {
  return SOCIAL_IMAGE_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by style
 */
export function getTemplatesByStyle(style: TemplateStyle): SocialImageTemplate[] {
  return SOCIAL_IMAGE_TEMPLATES.filter(t => t.style === style);
}

/**
 * Get templates best suited for a specific platform
 */
export function getTemplatesForPlatform(platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'): SocialImageTemplate[] {
  return SOCIAL_IMAGE_TEMPLATES.filter(t => t.bestFor.includes(platform));
}

/**
 * Get currently active seasonal templates based on current month
 */
export function getActiveSeasonalTemplates(): SocialImageTemplate[] {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  return SEASONAL_TEMPLATES.filter(t =>
    t.activeMonths?.includes(currentMonth)
  );
}

/**
 * Get a single template by ID
 */
export function getTemplateById(id: string): SocialImageTemplate | undefined {
  return SOCIAL_IMAGE_TEMPLATES.find(t => t.id === id);
}

/**
 * Get template count by category
 */
export function getTemplateCounts(): Record<TemplateCategory, number> {
  return {
    feature: FEATURE_TEMPLATES.length,
    benefit: BENEFIT_TEMPLATES.length,
    social_proof: SOCIAL_PROOF_TEMPLATES.length,
    cta: CTA_TEMPLATES.length,
    seasonal: SEASONAL_TEMPLATES.length,
  };
}

// ============================================================================
// TEMPLATE METADATA (for dashboard display)
// ============================================================================

export const CATEGORY_INFO: Record<TemplateCategory, { name: string; description: string; icon: string }> = {
  feature: {
    name: 'Feature Highlights',
    description: 'Showcase specific Mind & Muscle features',
    icon: '⭐',
  },
  benefit: {
    name: 'Benefits',
    description: 'Focus on outcomes and value propositions',
    icon: '🎯',
  },
  social_proof: {
    name: 'Social Proof',
    description: 'Testimonial and recommendation style posts',
    icon: '✅',
  },
  cta: {
    name: 'Call to Action',
    description: 'Drive downloads and sign-ups',
    icon: '🚀',
  },
  seasonal: {
    name: 'Seasonal',
    description: 'Time-specific promotions and themes',
    icon: '📅',
  },
};

export const STYLE_INFO: Record<TemplateStyle, { name: string; description: string }> = {
  bold_impact: {
    name: 'Bold Impact',
    description: 'Large headline, minimal text, dramatic visual',
  },
  clean_minimal: {
    name: 'Clean Minimal',
    description: 'Elegant whitespace, centered composition',
  },
  split_layout: {
    name: 'Split Layout',
    description: '50/50 image and text split',
  },
  story: {
    name: 'Story Format',
    description: 'Vertical orientation for Stories/Reels',
  },
  data_stats: {
    name: 'Data & Stats',
    description: 'Infographic style with numbers',
  },
};
