import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { SeriesRequests } from '@/components/ui/SeriesRequests';
import { PageViewTracker } from '@/components/ui/PageViewTracker';

export const metadata: Metadata = {
  title: `Pedir uma Série - ${siteConfig.name}`,
  description: `Peça séries para serem adicionadas ao ${siteConfig.name}. Vote nas requisições de outros usuários.`,
};

export default function RequestsPage() {
  return (
    <SiteShell>
      <PageViewTracker />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SeriesRequests />
      </div>
    </SiteShell>
  );
}
