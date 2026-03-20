import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { AdBlockDetector } from '@/components/ads/AdBlockDetector';
import { ClarityScript } from '@/components/ui/ClarityScript';
import { TurnstileScript } from '@/components/ui/TurnstileScript';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DownDoor - Seu Portal para Vídeos e Downloads Gratuitos',
  description:
    'DownDoor é seu portal premium para streaming e download de séries e vídeos gratuitos em alta qualidade.',
  keywords: 'download, séries, filmes, streaming, grátis, HD, 1080p',
  openGraph: {
    title: 'DownDoor - Seu Portal para Vídeos e Downloads Gratuitos',
    description:
      'Portal premium para streaming e download de séries e vídeos gratuitos em alta qualidade.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'DownDoor',
  },
};

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
        <ClarityScript />
        <TurnstileScript />
      </body>
    </html>
  );
}
