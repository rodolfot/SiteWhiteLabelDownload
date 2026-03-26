import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';
import { SiteShell } from '@/components/ui/SiteShell';
import { BookBrowser } from '@/components/ui/BookBrowser';
import { Book } from '@/types/database';

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return {
    title: `Livros - ${siteConfig.name}`,
    description: `Explore todos os livros disponíveis no ${siteConfig.name}.`,
  };
}

async function getAllBooks(): Promise<Book[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('books')
      .select('id,title,slug,synopsis,poster_url,backdrop_url,year,genre,rating,category,featured,author,pages,publisher,isbn,format,download_url,file_size,title_en,title_es,synopsis_en,synopsis_es,created_at,updated_at')
      .order('title', { ascending: true });
    if (error) console.error('[Livros] Erro ao buscar livros:', error.message);
    return data || [];
  } catch (err) {
    console.error('[Livros] Falha ao buscar livros:', err);
    return [];
  }
}

export default async function LivrosPage() {
  const books = await getAllBooks();

  const categories = Array.from(
    new Set(books.flatMap((b) => Array.isArray(b.category) && b.category.length > 0 ? b.category : ['Geral']))
  ).sort();

  return (
    <SiteShell>
      <BookBrowser books={books} categories={categories} />
    </SiteShell>
  );
}
