import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ToltScript } from '@/components/ToltScript';
import { ReferralTracker } from '@/components/ReferralTracker';
import { OrganizationSchema, WebSiteSchema, SoftwareApplicationSchema } from '@/components/seo/StructuredData';
import { generateMetadata } from '@/config/seo';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

export const metadata: Metadata = {
  ...generateMetadata('home'),
  metadataBase: new URL('https://mindandmuscle.ai'),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/assets/images/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/images/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/assets/images/apple-touch-icon.png',
      },
    ],
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0EA5E9' },
    { media: '(prefers-color-scheme: dark)', color: '#02124A' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mind & Muscle',
  },
  verification: {
    google: 'UguKt1huYwNQyN2tdO9WWTpBplOaSckrQ75P44-CEt8',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
        <SoftwareApplicationSchema />
      </head>
      <body className="antialiased">
        <GoogleAnalytics />
        <ToltScript />
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        <div className="animated-bg min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
