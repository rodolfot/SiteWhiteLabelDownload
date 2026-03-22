import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/lib/env';
import { siteConfig } from '@/lib/site-config';
import { AdSenseScript } from '@/components/ads/AdSenseScript';
import { ClarityScript } from '@/components/ui/ClarityScript';
import { TurnstileScript } from '@/components/ui/TurnstileScript';
import { WebVitals } from '@/components/ui/WebVitals';
import { Analytics } from '@/components/ui/Analytics';

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
    manifest: '/manifest.json',
    openGraph: {
      title,
      description: siteConfig.description,
      type: 'website',
      locale: siteConfig.locale,
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: siteConfig.description,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0a0a0f" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.className='light'}catch(e){}})();
        `}} />
      </head>
      <body className={inter.className}>
        {children}
        <WebVitals />
        <Analytics />
        <AdSenseScript />
        <ClarityScript />
        <TurnstileScript />
      </body>
    </html>
  );
}
