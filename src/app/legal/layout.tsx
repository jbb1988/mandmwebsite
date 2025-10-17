import { generateMetadata as genMeta } from '@/config/seo';

export const metadata = genMeta('legal');

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
