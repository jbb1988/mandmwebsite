import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import { ToltScript } from '@/components/ToltScript';

export const metadata: Metadata = {
  title: 'Mind & Muscle | Elite Sports Training Platform',
  description: 'Transform your athletes with comprehensive mental and physical training. Team licensing, partner programs, and cutting-edge sports performance technology.',
  keywords: ['sports training', 'mental training', 'strength training', 'team licensing', 'athlete development'],
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
        <div className="animated-bg min-h-screen">
          <Navigation />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
