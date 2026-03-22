import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/lib/env';
import { siteConfig } from '@/lib/site-config';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { AdBlockDetector } from '@/components/ads/AdBlockDetector';
import { AdSenseScript } from '@/components/ads/AdSenseScript';
import { ClarityScript } from '@/components/ui/ClarityScript';
import { TurnstileScript } from '@/components/ui/TurnstileScript';

const inter = Inter({ subsets: ['latin'] });

export function generateMetadata(): Metadata {
  const title = `${siteConfig.name} - ${siteConfig.tagline}`;
  return {
    title,
    description: `${siteConfig.name} - ${siteConfig.description}`,
    keywords: 'download, series, filmes, streaming, gratis, HD, 1080p',
    icons: {
      icon: '/favicon.svg',
    },
    openGraph: {
      title,
      description: siteConfig.description,
      type: 'website',
      locale: siteConfig.locale,
      siteName: siteConfig.name,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AdBlockDetector />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <AdSenseScript />
        <ClarityScript />
        <TurnstileScript />
      </body>
    </html>
  );
}
