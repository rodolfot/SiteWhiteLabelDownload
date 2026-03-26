import { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { AuthPage } from '@/components/ui/AuthPage';

export const metadata: Metadata = {
  title: `Conta - ${siteConfig.name}`,
  description: `Faça login ou crie sua conta no ${siteConfig.name}.`,
};

export default function ContaPage() {
  return (
    <SiteShell>
      <AuthPage />
    </SiteShell>
  );
}
