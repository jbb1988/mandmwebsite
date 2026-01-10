/**
 * Centralized SEO Metadata Configuration
 * Single source of truth for all page metadata, OpenGraph, and Twitter cards
 */

export const SITE_CONFIG = {
  name: 'Mind & Muscle',
  domain: 'mindandmuscle.ai',
  url: 'https://mindandmuscle.ai',
  email: 'support@mindandmuscle.ai',
  twitter: '@mindandmuscleai',
  description: 'Elite baseball and softball training platform with AI coaching for mind, muscle, and game IQ. Team licensing, partner programs, and cutting-edge sports performance technology.',
  keywords: [
    'baseball training app',
    'softball training app',
    'AI baseball coaching',
    'AI softball coaching',
    'mental skills training',
    'baseball strength training',
    'softball strength training',
    'youth baseball training',
    'youth softball training',
    'team training software',
    'baseball mental training',
    'softball mental training',
    'sports performance app',
    'baseball team management',
    'softball team management',
    'athletic development',
  ],
};

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  canonical?: string;
}

export const PAGE_SEO: Record<string, PageSEO> = {
  home: {
    title: 'Mind & Muscle | AI Baseball & Softball Training App - Mental & Physical Development',
    description: 'The complete training platform for baseball and softball athletes. AI coaches for mind, muscle, and game IQ. Train smarter, recover faster, outthink every play. Team licensing available.',
    keywords: [
      'baseball training app',
      'softball training app',
      'AI baseball coaching',
      'AI softball coaching',
      'mental skills training baseball',
      'mental skills training softball',
      'baseball strength training app',
      'softball strength training app',
      'youth baseball training',
      'youth softball training',
      'baseball game IQ',
      'softball game IQ',
      'mental training for athletes',
      'baseball development app',
      'softball development app',
    ],
    ogTitle: 'Mind & Muscle',
    ogDescription: 'Discipline the Mind. Dominate the Game.',
    ogImage: `${SITE_CONFIG.url}/assets/images/og-image.png`,
    twitterCard: 'summary_large_image',
  },

  'partner-program': {
    title: 'Partner Program | Earn 10-15% Lifetime Commission - Mind & Muscle',
    description: 'Join the Mind & Muscle partner program. Earn up to 15% lifetime commission on every subscription. Perfect for coaches, facility owners, and baseball influencers. Apply today.',
    keywords: [
      'baseball affiliate program',
      'sports coaching referral program',
      'baseball training affiliate',
      'coaching income opportunity',
      'sports app referral program',
      'baseball influencer program',
      'facility owner partnership',
      'youth sports affiliate',
    ],
    ogTitle: 'Partner Program | Earn Recurring Income with Mind & Muscle',
    ogDescription: 'Earn up to 15% commission on every subscription payment—forever. Perfect for coaches, facility owners, and influencers with connections in youth sports.',
    ogImage: `${SITE_CONFIG.url}/assets/images/og-image.png`,
  },

  'team-licensing': {
    title: 'Team Licensing | Volume Discounts for Baseball & Softball Teams - Mind & Muscle',
    description: 'Team licensing for baseball and softball organizations. Pay monthly ($12.79-$14.39/seat/mo) or upfront ($63.20-$71.10/seat) and save 17%. Give your entire team access to AI mental training, strength coaching, and game IQ development.',
    keywords: [
      'team training software',
      'baseball team management app',
      'team licensing software',
      'baseball team subscription',
      'youth baseball team app',
      'travel ball team software',
      'baseball coaching platform',
      'team volume discounts',
    ],
    ogTitle: 'Team Licensing | Train Your Entire Team with Mind & Muscle',
    ogDescription: 'Volume discounts for baseball and softball teams. Monthly or upfront pricing. As low as $12.79/seat/mo. AI coaches for every player.',
    ogImage: `${SITE_CONFIG.url}/assets/images/og-image.png`,
  },

  'team-licensing-manage': {
    title: 'Manage Team License | Mind & Muscle',
    description: 'Manage your team license. View usage, add seats, generate team codes, and manage your baseball or softball team\'s access to Mind & Muscle training platform.',
    noindex: true, // Don't index authenticated management pages
  },

  'team-licensing-success': {
    title: 'Purchase Successful | Mind & Muscle Team Licensing',
    description: 'Your team license purchase was successful. Welcome to Mind & Muscle! Access your team dashboard to start training.',
    noindex: true, // Don't index success pages
  },

  'dugout-talk': {
    title: 'Dugout Talk | Baseball Mental Training Journal - Mind & Muscle',
    description: 'Reflect on your baseball and softball training with Dugout Talk. Your personal journal for mental game development with AI-powered insights and coaching feedback.',
    keywords: [
      'baseball mental training journal',
      'softball mental training journal',
      'baseball player journal',
      'sports psychology journal',
      'athlete reflection app',
      'mental game baseball',
      'baseball journaling',
    ],
    ogTitle: 'Dugout Talk | Your Mental Training Journal',
    ogDescription: 'Reflect on your Daily Hit sessions and get personalized insights from your AI coach in Dugout Talk.',
    ogImage: `${SITE_CONFIG.url}/assets/images/og-image.png`,
  },

  feedback: {
    title: 'Send Feedback | Help Us Improve - Mind & Muscle',
    description: 'Share your feedback, bug reports, feature requests, or suggestions to help us improve Mind & Muscle baseball and softball training app.',
    keywords: [
      'mind and muscle feedback',
      'baseball app feedback',
      'feature request',
      'bug report',
      'app suggestions',
    ],
    ogTitle: 'Send Feedback | Mind & Muscle',
    ogDescription: 'Share your ideas and help us improve Mind & Muscle.',
    ogImage: `${SITE_CONFIG.url}/assets/images/og-image.png`,
  },

  faq: {
    title: 'FAQ | Frequently Asked Questions - Mind & Muscle',
    description: 'Get answers about Mind & Muscle baseball and softball training app. Learn about features, pricing, team licensing, AI coaching, mental training, and more. Find solutions to common questions.',
    keywords: [
      'baseball training app faq',
      'mind and muscle questions',
      'baseball app help',
      'team licensing questions',
      'AI coaching questions',
      'baseball training support',
    ],
    ogTitle: 'Frequently Asked Questions | Mind & Muscle',
    ogDescription: 'Get answers about features, pricing, team licensing, AI coaching, and more.',
    ogImage: `${SITE_CONFIG.url}/assets/images/og-image.png`,
  },

  support: {
    title: 'Support | Get Help with Mind & Muscle Baseball & Softball Training',
    description: 'Need help with Mind & Muscle? Contact our support team for assistance with the app, team licensing, partner program, technical issues, or general questions.',
    keywords: [
      'baseball app support',
      'mind and muscle help',
      'training app customer service',
      'team licensing support',
      'technical support',
    ],
    ogTitle: 'Support | Mind & Muscle',
    ogDescription: 'Get help with your Mind & Muscle account, features, or billing.',
    ogImage: `${SITE_CONFIG.url}/assets/images/og-image.png`,
  },

  legal: {
    title: 'Legal | Terms & Privacy Policy - Mind & Muscle',
    description: 'Mind & Muscle legal information, terms of service, privacy policy, and user agreements. Learn how we protect your data and what you need to know about using our platform.',
    noindex: false, // Index legal pages for transparency
    ogTitle: 'Legal Information | Mind & Muscle',
  },

  'partner-terms': {
    title: 'Partner Program Terms | Mind & Muscle Affiliate Agreement',
    description: 'Terms and conditions for the Mind & Muscle partner program. Review commission structure, payout terms, and program requirements.',
    noindex: false,
    ogTitle: 'Partner Program Terms | Mind & Muscle',
  },

  welcome: {
    title: 'Welcome to Mind & Muscle | Get Started with Baseball & Softball Training',
    description: 'Welcome to Mind & Muscle! Get started with AI-powered baseball and softball training. Set up your profile, explore features, and begin your development journey.',
    noindex: true, // Don't index onboarding pages
  },

  'auth-gate': {
    title: 'Sign In | Mind & Muscle',
    description: 'Sign in to your Mind & Muscle account to access AI baseball and softball coaching, mental training, strength programs, and game IQ development.',
    noindex: true, // Don't index auth pages
  },

  'auth-reset-password': {
    title: 'Reset Password | Mind & Muscle',
    description: 'Reset your Mind & Muscle password to regain access to your baseball and softball training account.',
    noindex: true,
  },

  'tools-qr-generator': {
    title: 'QR Code Generator | Share Team Code - Mind & Muscle',
    description: 'Generate QR codes for your team license. Make it easy for players to join your team on Mind & Muscle.',
    noindex: true,
  },

  'admin-team-lookup': {
    title: 'Admin: Team Lookup | Mind & Muscle',
    description: 'Admin tool for team license lookup and management.',
    noindex: true,
  },

};

/**
 * Get SEO metadata for a specific page
 */
export function getPageSEO(pageKey: keyof typeof PAGE_SEO): PageSEO {
  return PAGE_SEO[pageKey] || PAGE_SEO.home;
}

/**
 * Generate full metadata for Next.js Metadata API
 */
export function generateMetadata(pageKey: keyof typeof PAGE_SEO) {
  const pageSEO = getPageSEO(pageKey);
  const canonical = pageSEO.canonical || `${SITE_CONFIG.url}${pageKey === 'home' ? '' : `/${pageKey.replace(/-/g, '/')}`}`;

  return {
    title: pageSEO.title,
    description: pageSEO.description,
    keywords: pageSEO.keywords || SITE_CONFIG.keywords,
    ...(pageSEO.noindex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonical,
      siteName: SITE_CONFIG.name,
      title: pageSEO.ogTitle || pageSEO.title,
      description: pageSEO.ogDescription || pageSEO.description,
      images: [
        {
          url: pageSEO.ogImage || `${SITE_CONFIG.url}/assets/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: pageSEO.ogTitle || pageSEO.title,
        },
      ],
    },
    twitter: {
      card: pageSEO.twitterCard || 'summary_large_image',
      site: SITE_CONFIG.twitter,
      title: pageSEO.ogTitle || pageSEO.title,
      description: pageSEO.ogDescription || pageSEO.description,
      images: [pageSEO.ogImage || `${SITE_CONFIG.url}/assets/images/og-image.png`],
    },
  };
}
