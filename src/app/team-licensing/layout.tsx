import { generateMetadata as genMeta } from '@/config/seo';
import { TeamLicensingProductSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';
import { SITE_CONFIG } from '@/config/seo';

export const metadata = genMeta('team-licensing');

export default function TeamLicensingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TeamLicensingProductSchema />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Team Licensing', url: `${SITE_CONFIG.url}/team-licensing` },
        ]}
      />
      {children}
    </>
  );
}
