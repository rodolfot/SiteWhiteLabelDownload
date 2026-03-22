'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, GripVertical, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

interface CategoriesManagerProps {
  initialCategories: Category[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError('Categoria já existe.');
      return;
    }

    setSaving(true);
    setError('');
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from('categories')
      .insert({ name, slug: slugify(name), sort_order: categories.length + 1 })
      .select()
      .single();

    if (insertError) {
      setError('Erro ao criar categoria.');
    } else if (data) {
      setCategories([...categories, data]);
      setNewName('');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta categoria? Séries com esta categoria ficarão como "Geral".')) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', id);
    if (!deleteError) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const updated = [...categories];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((c, i) => { c.sort_order = i + 1; });
    setCategories(updated);

    // Save order
    const supabase = createClient();
    await Promise.all(
      updated.map((c) => supabase.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id))
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 text-gray-400 hover:text-white hover:bg-surface-700 rounded-lg transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Gerenciar Categorias</h1>
          <p className="text-gray-400 text-sm mt-1">Adicione, remova e reordene categorias</p>
        </div>
      </div>

      {/* Add new */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl p-5 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Nome da nova categoria"
            className="flex-1 bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-neon-blue"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      {/* Categories list */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="divide-y divide-surface-600">
          {categories.map((cat, i) => (
            <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-surface-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleReorder(i, 'up')}
                    disabled={i === 0}
                    className="text-gray-500 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <GripVertical className="h-3 w-3 rotate-180" />
                  </button>
                  <button
                    onClick={() => handleReorder(i, 'down')}
                    disabled={i === categories.length - 1}
                    className="text-gray-500 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <GripVertical className="h-3 w-3" />
                  </button>
                </div>
                <div>
                  <span className="text-white text-sm font-medium">{cat.name}</span>
                  <span className="text-gray-500 text-xs ml-2">/{cat.slug}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="p-8 text-gray-500 text-sm text-center">Nenhuma categoria. Adicione uma acima.</p>
          )}
        </div>
      </div>
    </div>
  );
}
