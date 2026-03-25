import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { PrivacyContent } from '@/components/legal/PrivacyContent';

export function generateMetadata(): Metadata {
  return {
    title: `Privacy Policy - ${siteConfig.name}`,
  };
}

export default function PrivacidadePage() {
  return (
    <SiteShell>
      <PrivacyContent />
    </SiteShell>
  );
}
