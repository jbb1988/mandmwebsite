/**
 * Structured Data (JSON-LD) Components for SEO
 * These components generate rich snippets for Google search results
 */

import { SITE_CONFIG } from '@/config/seo';

interface StructuredDataProps {
  data: object;
}

/**
 * Base component for rendering JSON-LD structured data
 */
function StructuredDataScript({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Organization Schema
 * Displays company info in Google knowledge panel
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/assets/images/logo.png`,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.email,
    sameAs: [
      // Add social media profiles here when available
      // 'https://twitter.com/mindandmuscleai',
      // 'https://www.facebook.com/mindandmuscleai',
      // 'https://www.instagram.com/mindandmuscleai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: SITE_CONFIG.email,
      contactType: 'Customer Support',
      availableLanguage: 'English',
    },
  };

  return <StructuredDataScript data={schema} />;
}

/**
 * SoftwareApplication Schema
 * For the main product/app
 */
export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_CONFIG.name,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '119.00',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
      description: 'Annual subscription to Mind & Muscle baseball training platform',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    description: 'AI-powered baseball and softball training app with mental skills training, strength coaching, and game IQ development. Complete platform for baseball and softball athletes.',
    image: `${SITE_CONFIG.url}/assets/images/og-image.png`,
    url: SITE_CONFIG.url,
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
    },
  };

  return <StructuredDataScript data={schema} />;
}

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * FAQ Schema
 * Displays questions/answers in Google search results
 */
export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <StructuredDataScript data={schema} />;
}

/**
 * Product Schema for Team Licensing
 */
export function TeamLicensingProductSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Mind & Muscle Team License',
    description: 'Team licensing for baseball organizations. Pay monthly ($12.79-$14.39/seat/mo) or upfront ($63.20-$71.10/seat) and save 17%. Give your entire team access to AI mental training, strength coaching, and game IQ development.',
    image: `${SITE_CONFIG.url}/assets/images/og-image.png`,
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    offers: [
      {
        '@type': 'Offer',
        name: '1-11 Seats',
        price: '119.00',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2025-12-31',
        description: 'Individual or small team pricing',
      },
      {
        '@type': 'Offer',
        name: '12-120 Seats',
        price: '107.10',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2025-12-31',
        description: '10% volume discount for medium teams',
      },
      {
        '@type': 'Offer',
        name: '121-199 Seats',
        price: '101.15',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2025-12-31',
        description: '15% volume discount for large teams',
      },
      {
        '@type': 'Offer',
        name: '200+ Seats',
        price: '95.20',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2025-12-31',
        description: '20% volume discount for enterprise teams',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return <StructuredDataScript data={schema} />;
}

/**
 * Breadcrumb Schema
 * Shows navigation path in search results
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredDataScript data={schema} />;
}

/**
 * WebSite Schema with SearchAction
 * Enables site search in Google
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <StructuredDataScript data={schema} />;
}
