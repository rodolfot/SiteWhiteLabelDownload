'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { validateImageFile, isValidDownloadUrl } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit-log';

interface MovieFormProps {
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
    duration: number | null;
    download_url: string;
    file_size: string;
    quality: string;
  };
}

const DEFAULT_CATEGORIES = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Ficção Científica', 'Terror', 'Romance', 'Anime', 'Documentário', 'Geral'];
const QUALITIES = ['480p', '720p', '1080p', '4K'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function MovieForm({ initialData }: MovieFormProps) {
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
    duration: initialData?.duration || null as number | null,
    download_url: initialData?.download_url || '',
    file_size: initialData?.file_size || '',
    quality: initialData?.quality || '1080p',
  });

  const [dynamicCategories, setDynamicCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('name')
        .order('sort_order', { ascending: true });
      if (data && data.length > 0) {
        setDynamicCategories(data.map((c) => c.name));
      }
    };
    loadCategories();
  }, []);

  const updateForm = (field: string, value: string | number | boolean | null) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !initialData) {
        updated.slug = slugify(value as string);
      }
      return updated;
    });
  };

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.includes(cat)
        ? prev.category.filter((c) => c !== cat)
        : [...prev.category, cat],
    }));
  };

  const handleImageUpload = async (file: File, field: 'poster_url' | 'backdrop_url') => {
    const validation = await validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    const supabase = createClient();
    const path = `${field === 'poster_url' ? 'posters' : 'backdrops'}/${Date.now()}.${validation.ext}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      setError('Erro ao fazer upload da imagem.');
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    updateForm(field, publicUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (form.download_url && !isValidDownloadUrl(form.download_url)) {
      setError('URL de download inválida. Use http:// ou https://.');
      setSaving(false);
      return;
    }

    if (form.category.length === 0) {
      setError('Selecione ao menos uma categoria.');
      setSaving(false);
      return;
    }

    try {
      const supabase = createClient();

      let savedMovieId = initialData?.id ?? '';

      if (initialData) {
        const { error: updateError } = await supabase
          .from('movies')
          .update(form)
          .eq('id', initialData.id);
        if (updateError) throw updateError;
      } else {
        // Ensure unique slug
        const { data: existing } = await supabase
          .from('movies')
          .select('id')
          .eq('slug', form.slug)
          .maybeSingle();
        if (existing) {
          form.slug = `${form.slug}-${Date.now().toString(36)}`;
        }

        const { data: newMovie, error: insertError } = await supabase
          .from('movies')
          .insert(form)
          .select()
          .single();
        if (insertError) throw insertError;
        savedMovieId = newMovie.id;
      }

      const isEdit = !!initialData;
      logAdminAction({
        action: isEdit ? 'update' : 'create',
        entity: 'movie',
        entity_id: isEdit ? initialData.id : undefined,
        details: form.title,
      });

      // Fire-and-forget: trigger translation in background
      if (savedMovieId) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.access_token) {
            fetch('/api/translate-movie', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ movieId: savedMovieId }),
            }).catch(() => {});
          }
        }).catch(() => {});
      }

      router.push('/admin/movies');
      router.refresh();
    } catch (err: unknown) {
      console.error('Movie save error:', err);
      const msg = err instanceof Object && 'code' in err && (err as { code: string }).code === '23505'
        ? 'Já existe um filme com este slug. Altere o título ou slug.'
        : 'Erro ao salvar. Verifique os dados e tente novamente.';
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/movies" className="p-2 text-gray-400 hover:text-white hover:bg-surface-700 rounded-lg transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">
            {initialData ? 'Editar Filme' : 'Novo Filme'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {initialData ? `Editando "${initialData.title}"` : 'Preencha os dados do filme'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Informações Básicas</h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Título *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                required
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateForm('slug', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Sinopse</label>
              <textarea
                value={form.synopsis}
                onChange={(e) => updateForm('synopsis', e.target.value)}
                rows={4}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Ano</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => updateForm('year', parseInt(e.target.value))}
                min={1900}
                max={new Date().getFullYear() + 2}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Nota (0–10)</label>
              <input
                type="number"
                value={form.rating}
                onChange={(e) => updateForm('rating', parseFloat(e.target.value))}
                min={0}
                max={10}
                step={0.1}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Duração (min)</label>
              <input
                type="number"
                value={form.duration ?? ''}
                onChange={(e) => updateForm('duration', e.target.value ? parseInt(e.target.value) : null)}
                min={1}
                placeholder="ex: 120"
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => updateForm('featured', e.target.checked)}
                  className="w-4 h-4 rounded border-surface-500 accent-neon-blue"
                />
                <span className="text-sm text-gray-300">Destaque</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Gênero</label>
            <input
              type="text"
              value={form.genre}
              onChange={(e) => updateForm('genre', e.target.value)}
              placeholder="ex: Ação, Aventura"
              className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide mb-3">
            Categorias <span className="text-gray-500 font-normal normal-case">({form.category.length} selecionada(s))</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  form.category.includes(cat)
                    ? 'bg-neon-blue/20 border border-neon-blue text-neon-blue'
                    : 'bg-surface-700 border border-surface-500 text-gray-300 hover:border-neon-blue hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Download */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Download</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 col-span-1">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">URL de Download</label>
              <input
                type="url"
                value={form.download_url}
                onChange={(e) => updateForm('download_url', e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Tamanho</label>
              <input
                type="text"
                value={form.file_size}
                onChange={(e) => updateForm('file_size', e.target.value)}
                placeholder="ex: 2.1 GB"
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Qualidade</label>
              <select
                value={form.quality}
                onChange={(e) => updateForm('quality', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all"
              >
                {QUALITIES.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Imagens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Poster */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Poster (2:3)</label>
              {form.poster_url && (
                <Image src={form.poster_url} alt="poster" width={120} height={180} className="object-cover rounded-lg mb-2" />
              )}
              <input
                type="url"
                value={form.poster_url}
                onChange={(e) => updateForm('poster_url', e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all mb-2"
              />
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-neon-blue transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Upload de arquivo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'poster_url')}
                />
              </label>
            </div>

            {/* Backdrop */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Backdrop (16:9)</label>
              {form.backdrop_url && (
                <Image src={form.backdrop_url} alt="backdrop" width={240} height={135} className="object-cover rounded-lg mb-2" />
              )}
              <input
                type="url"
                value={form.backdrop_url}
                onChange={(e) => updateForm('backdrop_url', e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-neon-blue transition-all mb-2"
              />
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-neon-blue transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Upload de arquivo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'backdrop_url')}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/admin/movies" className="btn-secondary text-sm">
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Filme'}
          </button>
        </div>
      </form>
    </div>
  );
}
