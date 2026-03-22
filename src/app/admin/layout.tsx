import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export function generateMetadata(): Metadata {
  return {
    title: `Admin - ${siteConfig.name}`,
    robots: 'noindex, nofollow',
  };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-900 pt-16">
      {children}
    </div>
  );
}
