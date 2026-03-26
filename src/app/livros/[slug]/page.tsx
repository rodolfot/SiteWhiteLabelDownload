import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { BookDetail } from '@/components/ui/BookDetail';
import { PageViewTracker } from '@/components/ui/PageViewTracker';
import { AgeVerificationGate } from '@/components/ui/AgeVerificationGate';
import { Book } from '@/types/database';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBookData(slug: string): Promise<Book | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('books').select('*').eq('slug', slug).single();
  return data as Book | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookData(slug);
  if (!book) return { title: `Livro não encontrado - ${siteConfig.name}` };

  return {
    title: `${book.title} - Download Grátis | ${siteConfig.name}`,
    description: book.synopsis || `Baixe ${book.title} gratuitamente no ${siteConfig.name}.`,
    openGraph: {
      title: `${book.title} - ${siteConfig.name}`,
      description: book.synopsis || `Baixe ${book.title} gratuitamente.`,
      images: [{ url: book.backdrop_url || book.poster_url || '' }],
      type: 'book',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${book.title} - ${siteConfig.name}`,
      description: book.synopsis || `Baixe ${book.title} gratuitamente.`,
      images: [book.backdrop_url || book.poster_url || ''],
    },
  };
}

function generateJsonLd(book: Book) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    description: book.synopsis,
    image: book.poster_url || book.backdrop_url,
    url: `${baseUrl}/livros/${book.slug}`,
    datePublished: book.created_at,
    dateModified: book.updated_at,
    genre: book.genre,
    author: book.author ? { '@type': 'Person', name: book.author } : undefined,
    isbn: book.isbn || undefined,
    numberOfPages: book.pages || undefined,
    publisher: book.publisher ? { '@type': 'Organization', name: book.publisher } : undefined,
    aggregateRating: book.rating > 0 ? { '@type': 'AggregateRating', ratingValue: book.rating, bestRating: 10, worstRating: 0 } : undefined,
  };
}

export default async function LivroPage({ params }: PageProps) {
  const { slug } = await params;
  const book = await getBookData(slug);
  if (!book) notFound();

  const jsonLd = generateJsonLd(book);

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageViewTracker />
      <AgeVerificationGate category={book.category}>
        <BookDetail book={book} />
      </AgeVerificationGate>
    </SiteShell>
  );
}
