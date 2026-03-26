import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { DonateContent } from '@/components/ui/DonateContent';

export const metadata: Metadata = {
  title: `Apoie o Projeto - ${siteConfig.name}`,
  description: `Ajude a manter o ${siteConfig.name} no ar! Doe via PIX, PayPal ou criptomoedas.`,
};

export default function DoarPage() {
  return (
    <SiteShell>
      <DonateContent />
    </SiteShell>
  );
}
