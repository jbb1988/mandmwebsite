import type { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/config/seo';

export const metadata: Metadata = genMeta('dugout-talk');

export default function DugoutTalkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
