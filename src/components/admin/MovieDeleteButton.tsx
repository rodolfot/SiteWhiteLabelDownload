'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logAdminAction } from '@/lib/audit-log';

interface MovieDeleteButtonProps {
  id: string;
  title: string;
}

export function MovieDeleteButton({ id, title }: MovieDeleteButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir "${title}"?`)) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('movies').delete().eq('id', id);
      if (error) {
        alert(`Erro ao excluir: ${error.message}`);
      } else {
        logAdminAction({ action: 'delete', entity: 'movie', entity_id: id, details: title });
        router.refresh();
      }
    } catch {
      alert('Erro inesperado ao excluir o filme. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-2 text-gray-400 hover:text-red-400 hover:bg-surface-600 rounded-lg transition-all disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
