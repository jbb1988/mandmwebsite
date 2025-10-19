import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Send Feedback | Mind & Muscle',
  description: 'Share your ideas and suggestions to help us improve Mind & Muscle. We value your feedback!',
  openGraph: {
    title: 'Send Feedback | Mind & Muscle',
    description: 'Share your ideas and suggestions to help us improve Mind & Muscle.',
  },
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
