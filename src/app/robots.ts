import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/seo';

/**
 * Robots.txt configuration for search engine crawling
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/auth/',
          '/api/',
          '/tools/',
          '/team-licensing/manage',
          '/team-licensing/success',
          '/welcome',
          '/share/',
          '/partner/',
          '/finder-fee',
          '/finder-fee-vip',
          '/settings',
          '/delete-account',
          '/usa-prime',
          '/schedule',
          '/app/',
        ],
      },
      {
        // Allow Google to crawl everything except private areas
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/auth/',
          '/api/',
          '/tools/',
          '/team-licensing/manage',
          '/team-licensing/success',
          '/welcome',
          '/share/',
          '/partner/',
          '/finder-fee',
          '/finder-fee-vip',
          '/settings',
          '/delete-account',
          '/usa-prime',
          '/schedule',
          '/app/',
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
