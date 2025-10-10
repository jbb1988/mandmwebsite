import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ToltScript } from '@/components/ToltScript';

export const metadata: Metadata = {
  title: 'Mind & Muscle | Elite Sports Training Platform',
  description: 'Transform your athletes with comprehensive mental and physical training. Team licensing, partner programs, and cutting-edge sports performance technology.',
  keywords: ['sports training', 'mental training', 'strength training', 'team licensing', 'athlete development'],
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mindandmuscle.ai',
    siteName: 'Mind & Muscle',
    title: 'Mind & Muscle | 100% Baseball Training',
    description: 'The only app built exclusively for baseball players. AI coaches for mind, muscle, and game IQ. Train smarter, recover faster, outthink every play.',
    images: [
      {
        url: 'https://mindandmuscle.ai/assets/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mind & Muscle - 100% Baseball Training',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mind & Muscle | 100% Baseball Training',
    description: 'The only app built exclusively for baseball players. AI coaches for mind, muscle, and game IQ. Train smarter, recover faster, outthink every play.',
    images: ['https://mindandmuscle.ai/assets/images/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
