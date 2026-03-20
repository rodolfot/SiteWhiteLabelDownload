import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - DownDoor',
  robots: 'noindex, nofollow',
};

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
