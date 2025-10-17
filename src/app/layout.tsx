import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ToltScript } from '@/components/ToltScript';
import { OrganizationSchema, WebSiteSchema, SoftwareApplicationSchema } from '@/components/seo/StructuredData';
import { generateMetadata } from '@/config/seo';

export const metadata: Metadata = {
  ...generateMetadata('home'),
  metadataBase: new URL('https://mindandmuscle.ai'),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
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
        <ToltScript />
        <div className="animated-bg min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
