import { generateMetadata as genMeta } from '@/config/seo';

export const metadata = genMeta('support');

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
