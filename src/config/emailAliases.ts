// Email aliases available for sending from admin portal
// All aliases must be verified in Resend before use

export interface EmailAlias {
  id: string;
  email: string;
  name: string;
  description: string;
  category: 'support' | 'marketing' | 'alerts' | 'partnerships' | 'other';
}

export const EMAIL_ALIASES: EmailAlias[] = [
  {
    id: 'support',
    email: 'support@mindandmuscle.ai',
    name: 'Support Team',
    description: 'General user support and transactional emails',
    category: 'support',
  },
  {
    id: 'hello',
    email: 'hello@mindandmuscle.ai',
    name: 'Hello',
    description: 'Friendly outreach and special campaigns',
    category: 'marketing',
  },
  {
    id: 'team',
    email: 'team@mindandmuscle.ai',
    name: 'The Team',
    description: 'Team communications and win-back campaigns',
    category: 'marketing',
  },
  {
    id: 'partnerships',
    email: 'partnerships@mindandmuscle.ai',
    name: 'Partnerships',
    description: 'Partnership outreach and marketing campaigns',
    category: 'partnerships',
  },
  {
    id: 'partners',
    email: 'partners@mindandmuscle.ai',
    name: 'Partner Program',
    description: 'Partner onboarding and program communications',
    category: 'partnerships',
  },
  {
    id: 'leagues',
    email: 'leagues@mindandmuscle.ai',
    name: 'Leagues',
    description: 'League and organization communications',
    category: 'partnerships',
  },
  {
    id: 'legal',
    email: 'legal@mindandmuscle.ai',
    name: 'Legal',
    description: 'Legal notices and compliance communications',
    category: 'other',
  },
  {
    id: 'notifications',
    email: 'notifications@mindandmuscle.ai',
    name: 'Notifications',
    description: 'System notifications and alerts',
    category: 'alerts',
  },
  {
    id: 'alerts',
    email: 'alerts@mindandmuscle.ai',
    name: 'Alerts',
    description: 'System alerts and error notifications',
    category: 'alerts',
  },
  {
    id: 'feedback',
    email: 'feedback@mindandmuscle.ai',
    name: 'Feedback',
    description: 'User feedback collection',
    category: 'support',
  },
  {
    id: 'noreply',
    email: 'noreply@mindandmuscle.ai',
    name: 'No Reply',
    description: 'Automated emails that don\'t need responses',
    category: 'other',
  },
];

export const getAliasByEmail = (email: string): EmailAlias | undefined => {
  return EMAIL_ALIASES.find(alias => alias.email === email);
};

export const getAliasesByCategory = (category: EmailAlias['category']): EmailAlias[] => {
  return EMAIL_ALIASES.filter(alias => alias.category === category);
};
