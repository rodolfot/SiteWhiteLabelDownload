import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { BookForm } from '@/components/admin/BookForm';

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

  return <BookForm initialData={book} />;
}
