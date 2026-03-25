import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { TermsContent } from '@/components/legal/TermsContent';

export function generateMetadata(): Metadata {
  return {
    title: `Terms of Use - ${siteConfig.name}`,
  };
}

export default function TermosPage() {
  return (
    <SiteShell>
      <TermsContent />
    </SiteShell>
  );
}
