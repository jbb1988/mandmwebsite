import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Mind & Muscle - AI Baseball Training',
  description: 'Get AI-powered swing analysis, pitch mechanics feedback, mental training, and personalized nutrition. The complete baseball development app.',
  openGraph: {
    title: 'Mind & Muscle - AI Baseball Training',
    description: 'AI swing analysis, pitch mechanics, mental training & more. The complete baseball development app.',
    url: 'https://www.mindandmuscle.ai/download',
    siteName: 'Mind & Muscle',
    images: [
      {
        url: 'https://www.mindandmuscle.ai/assets/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mind & Muscle App - AI Baseball Training',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mind & Muscle - AI Baseball Training',
    description: 'AI swing analysis, pitch mechanics, mental training & more.',
    images: ['https://www.mindandmuscle.ai/assets/images/og-image.png'],
  },
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
