import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/admin';
import { BookForm } from '@/components/admin/BookForm';

export default async function NewBookPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  return <BookForm />;
}
