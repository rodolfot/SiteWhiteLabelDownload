import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { FavoritesPage } from '@/components/ui/FavoritesPage';

export const metadata: Metadata = {
  title: `Meus Favoritos - ${siteConfig.name}`,
};

export default function Page() {
  return (
    <SiteShell>
      <FavoritesPage />
    </SiteShell>
  );
}
