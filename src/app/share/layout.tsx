import type { Metadata } from 'next';

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple layout without navigation/footer for share pages
  return children;
}
