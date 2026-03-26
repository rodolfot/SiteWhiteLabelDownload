import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { BookForm } from '@/components/admin/BookForm';
import { DownloadLinksEditor } from '@/components/admin/DownloadLinksEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: PageProps) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  const { data: book } = await supabase.from('books').select('*').eq('id', id).single();
  if (!book) notFound();

  return (
    <>
      <BookForm initialData={book} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DownloadLinksEditor contentType="book" contentId={id} />
      </div>
    </>
  );
}
