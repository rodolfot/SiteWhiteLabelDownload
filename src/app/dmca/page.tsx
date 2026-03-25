import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { DmcaContent } from '@/components/legal/DmcaContent';

export function generateMetadata(): Metadata {
  return {
    title: `DMCA - ${siteConfig.name}`,
  };
}

export default function DmcaPage() {
  return (
    <SiteShell>
      <DmcaContent />
    </SiteShell>
  );
}
