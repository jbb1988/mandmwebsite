import { generateMetadata as genMeta } from '@/config/seo';

export const metadata = genMeta('partner-program');

export default function PartnerProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
