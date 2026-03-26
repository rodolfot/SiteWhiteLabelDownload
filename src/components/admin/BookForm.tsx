'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { validateImageFile, isValidDownloadUrl } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit-log';

interface BookFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    synopsis: string;
    poster_url: string;
    backdrop_url: string;
    year: number;
    genre: string;
    rating: number;
    category: string[];
    featured: boolean;
    author: string;
    pages: number | null;
    publisher: string;
    isbn: string;
    format: string;
    download_url: string;
    file_size: string;
  };
}

const DEFAULT_CATEGORIES = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Ficção Científica', 'Terror', 'Romance', 'Anime', 'Documentário', 'Adulto', 'Geral'];
const FORMATS = ['PDF', 'EPUB', 'MOBI', 'AZW3', 'CBR', 'CBZ', 'DJVU'];

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function BookForm({ initialData }: BookFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    synopsis: initialData?.synopsis || '',
    poster_url: initialData?.poster_url || '',
    backdrop_url: initialData?.backdrop_url || '',
    year: initialData?.year || new Date().getFullYear(),
    genre: initialData?.genre || '',
    rating: initialData?.rating || 0,
    category: Array.isArray(initialData?.category) ? initialData.category : ['Geral'],
    featured: initialData?.featured || false,
    author: initialData?.author || '',
    pages: initialData?.pages || null as number | null,
    publisher: initialData?.publisher || '',
    isbn: initialData?.isbn || '',
    format: initialData?.format || 'PDF',
    download_url: initialData?.download_url || '',
    file_size: initialData?.file_size || '',
  });

  const [dynamicCategories, setDynamicCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('name').order('sort_order', { ascending: true });
      if (data && data.length > 0) setDynamicCategories(data.map((c) => c.name));
    };
    loadCategories();
  }, []);

  const updateForm = (field: string, value: string | number | boolean | null) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !initialData) updated.slug = slugify(value as string);
      return updated;
    });
  };

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.includes(cat) ? prev.category.filter((c) => c !== cat) : [...prev.category, cat],
    }));
  };

  const handleImageUpload = async (file: File, field: 'poster_url' | 'backdrop_url') => {
    const validation = await validateImageFile(file);
    if (!validation.valid) { setError(validation.error!); return; }
    const supabase = createClient();
    const path = `${field === 'poster_url' ? 'posters' : 'backdrops'}/${Date.now()}.${validation.ext}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(path, file, { contentType: file.type });
    if (uploadError) { setError('Erro ao fazer upload da imagem.'); return; }
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    updateForm(field, publicUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (form.download_url && !isValidDownloadUrl(form.download_url)) {
      setError('URL de download inválida. Use http:// ou https://.'); setSaving(false); return;
    }
    if (form.category.length === 0) {
      setError('Selecione ao menos uma categoria.'); setSaving(false); return;
    }

    try {
      const supabase = createClient();

      if (initialData) {
        const { error: updateError } = await supabase.from('books').update(form).eq('id', initialData.id);
        if (updateError) throw updateError;
      } else {
        const { data: existing } = await supabase.from('books').select('id').eq('slug', form.slug).maybeSingle();
        if (existing) form.slug = `${form.slug}-${Date.now().toString(36)}`;
        const { error: insertError } = await supabase.from('books').insert(form).select().single();
        if (insertError) throw insertError;
      }

      logAdminAction({ action: initialData ? 'update' : 'create', entity: 'book', entity_id: initialData?.id, details: form.title });
      router.push('/admin/books');
      router.refresh();
    } catch (err: unknown) {
      console.error('Book save error:', err);
      const msg = err instanceof Object && 'code' in err && (err as { code: string }).code === '23505'
        ? 'Já existe um livro com este slug. Altere o título ou slug.'
        : 'Erro ao salvar. Verifique os dados e tente novamente.';
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/books" className="p-2 text-gray-400 hover:text-white hover:bg-surface-700 rounded-lg transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">{initialData ? 'Editar Livro' : 'Novo Livro'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{initialData ? `Editando "${initialData.title}"` : 'Preencha os dados do livro'}</p>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Informações Básicas</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Título *</label>
              <input type="text" value={form.title} onChange={(e) => updateForm('title', e.target.value)} required
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => updateForm('slug', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Sinopse</label>
              <textarea value={form.synopsis} onChange={(e) => updateForm('synopsis', e.target.value)} rows={4}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all resize-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Autor</label>
              <input type="text" value={form.author} onChange={(e) => updateForm('author', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Ano</label>
              <input type="number" value={form.year} onChange={(e) => updateForm('year', parseInt(e.target.value))} min={1900} max={new Date().getFullYear() + 2}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Páginas</label>
              <input type="number" value={form.pages ?? ''} onChange={(e) => updateForm('pages', e.target.value ? parseInt(e.target.value) : null)} min={1}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Nota (0–10)</label>
              <input type="number" value={form.rating} onChange={(e) => updateForm('rating', parseFloat(e.target.value))} min={0} max={10} step={0.1}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Editora</label>
              <input type="text" value={form.publisher} onChange={(e) => updateForm('publisher', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">ISBN</label>
              <input type="text" value={form.isbn} onChange={(e) => updateForm('isbn', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Gênero</label>
              <input type="text" value={form.genre} onChange={(e) => updateForm('genre', e.target.value)} placeholder="ex: Ficção, Drama"
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => updateForm('featured', e.target.checked)} className="w-4 h-4 rounded border-surface-500 accent-neon-blue" />
                <span className="text-sm text-gray-300">Destaque</span>
              </label>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide mb-3">Categorias <span className="text-gray-500 font-normal normal-case">({form.category.length} selecionada(s))</span></h2>
          <div className="flex flex-wrap gap-2">
            {dynamicCategories.map((cat) => (
              <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.category.includes(cat) ? 'bg-neon-blue/20 border border-neon-blue text-neon-blue' : 'bg-surface-700 border border-surface-500 text-gray-300 hover:border-neon-blue hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Download */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Download</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">URL de Download</label>
              <input type="url" value={form.download_url} onChange={(e) => updateForm('download_url', e.target.value)} placeholder="https://..."
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Tamanho</label>
              <input type="text" value={form.file_size} onChange={(e) => updateForm('file_size', e.target.value)} placeholder="ex: 15 MB"
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Formato</label>
              <select value={form.format} onChange={(e) => updateForm('format', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all">
                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Imagens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Capa (2:3)</label>
              {form.poster_url && <Image src={form.poster_url} alt="poster" width={120} height={180} className="object-cover rounded-lg mb-2" />}
              <input type="url" value={form.poster_url} onChange={(e) => updateForm('poster_url', e.target.value)} placeholder="https://..."
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all mb-2" />
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-neon-blue transition-colors">
                <Upload className="h-3.5 w-3.5" /> Upload de arquivo
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'poster_url')} />
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Backdrop (16:9)</label>
              {form.backdrop_url && <Image src={form.backdrop_url} alt="backdrop" width={240} height={135} className="object-cover rounded-lg mb-2" />}
              <input type="url" value={form.backdrop_url} onChange={(e) => updateForm('backdrop_url', e.target.value)} placeholder="https://..."
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all mb-2" />
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-neon-blue transition-colors">
                <Upload className="h-3.5 w-3.5" /> Upload de arquivo
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'backdrop_url')} />
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/admin/books" className="btn-secondary text-sm">Cancelar</Link>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar Livro'}
          </button>
        </div>
      </form>
    </div>
  );
}
