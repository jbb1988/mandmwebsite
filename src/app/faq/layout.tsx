import { generateMetadata as genMeta } from '@/config/seo';
import { FAQSchema } from '@/components/seo/StructuredData';
import { TOP_FAQS } from '@/config/faqData';

export const metadata = genMeta('faq');

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FAQSchema items={TOP_FAQS} />
      {children}
    </>
  );
}
