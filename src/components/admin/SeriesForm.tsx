'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Plus, Trash2, Upload, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface Episode {
  id?: string;
  number: number;
  title: string;
  download_url: string;
  file_size: string;
  quality: string;
}

interface Season {
  id?: string;
  number: number;
  title: string;
  episodes: Episode[];
}

interface SeriesFormProps {
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
    category: string;
    featured: boolean;
  };
  initialSeasons?: Season[];
}

const CATEGORIES = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Ficção Científica', 'Terror', 'Romance', 'Anime', 'Documentário', 'Geral'];
const QUALITIES = ['480p', '720p', '1080p', '4K'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function SeriesForm({ initialData, initialSeasons }: SeriesFormProps) {
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
    category: initialData?.category || 'Geral',
    featured: initialData?.featured || false,
  });

  const [seasons, setSeasons] = useState<Season[]>(
    initialSeasons || []
  );

  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([0]));

  const updateForm = (field: string, value: string | number | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !initialData) {
        updated.slug = slugify(value as string);
      }
      return updated;
    });
  };

  const addSeason = () => {
    const num = seasons.length + 1;
    setSeasons([...seasons, { number: num, title: `Temporada ${num}`, episodes: [] }]);
    setExpandedSeasons((prev) => new Set(prev).add(seasons.length));
  };

  const removeSeason = (index: number) => {
    setSeasons(seasons.filter((_, i) => i !== index));
  };

  const addEpisode = (seasonIndex: number) => {
    const updated = [...seasons];
    const num = updated[seasonIndex].episodes.length + 1;
    updated[seasonIndex].episodes.push({
      number: num,
      title: `Episódio ${num}`,
      download_url: '',
      file_size: '',
      quality: '1080p',
    });
    setSeasons(updated);
  };

  const removeEpisode = (seasonIndex: number, epIndex: number) => {
    const updated = [...seasons];
    updated[seasonIndex].episodes = updated[seasonIndex].episodes.filter((_, i) => i !== epIndex);
    setSeasons(updated);
  };

  const updateEpisode = (seasonIndex: number, epIndex: number, field: string, value: string | number) => {
    const updated = [...seasons];
    (updated[seasonIndex].episodes[epIndex] as unknown as Record<string, string | number>)[field] = value;
    setSeasons(updated);
  };

  const handleImageUpload = async (file: File, field: 'poster_url' | 'backdrop_url') => {
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${field === 'poster_url' ? 'posters' : 'backdrops'}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('media').upload(path, file);
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

    try {
      const supabase = createClient();

      if (initialData) {
        // Update existing series
        const { error: updateError } = await supabase
          .from('series')
          .update(form)
          .eq('id', initialData.id);
        if (updateError) throw updateError;

        // Delete old seasons and re-create
        await supabase.from('seasons').delete().eq('series_id', initialData.id);

        for (const season of seasons) {
          const { data: newSeason, error: seasonError } = await supabase
            .from('seasons')
            .insert({ series_id: initialData.id, number: season.number, title: season.title })
            .select()
            .single();
          if (seasonError) throw seasonError;

          if (season.episodes.length > 0) {
            const episodes = season.episodes.map((ep) => ({
              season_id: newSeason.id,
              number: ep.number,
              title: ep.title,
              download_url: ep.download_url,
              file_size: ep.file_size,
              quality: ep.quality,
            }));
            const { error: epError } = await supabase.from('episodes').insert(episodes);
            if (epError) throw epError;
          }
        }
      } else {
        // Create new series
        const { data: newSeries, error: insertError } = await supabase
          .from('series')
          .insert(form)
          .select()
          .single();
        if (insertError) throw insertError;

        for (const season of seasons) {
          const { data: newSeason, error: seasonError } = await supabase
            .from('seasons')
            .insert({ series_id: newSeries.id, number: season.number, title: season.title })
            .select()
            .single();
          if (seasonError) throw seasonError;

          if (season.episodes.length > 0) {
            const episodes = season.episodes.map((ep) => ({
              season_id: newSeason.id,
              number: ep.number,
              title: ep.title,
              download_url: ep.download_url,
              file_size: ep.file_size,
              quality: ep.quality,
            }));
            const { error: epError } = await supabase.from('episodes').insert(episodes);
            if (epError) throw epError;
          }
        }
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('Erro ao salvar. Verifique os dados e tente novamente.');
      setSaving(false);
    }
  };

  const toggleSeason = (index: number) => {
    setExpandedSeasons((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {initialData ? 'Editar Série' : 'Nova Série'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-surface-800 border border-surface-600 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Informações Básicas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Título *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                required
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-neon-blue"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateForm('slug', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-neon-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Sinopse</label>
            <textarea
              value={form.synopsis}
              onChange={(e) => updateForm('synopsis', e.target.value)}
              rows={3}
              className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-neon-blue resize-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ano</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => updateForm('year', parseInt(e.target.value))}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-neon-blue"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Gênero</label>
              <input
                type="text"
                value={form.genre}
                onChange={(e) => updateForm('genre', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-neon-blue"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nota (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={form.rating}
                onChange={(e) => updateForm('rating', parseFloat(e.target.value))}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-neon-blue"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => updateForm('category', e.target.value)}
                className="w-full bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-neon-blue"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateForm('featured', e.target.checked)}
              className="w-4 h-4 rounded bg-surface-700 border-surface-500 text-neon-blue focus:ring-neon-blue"
            />
            <span className="text-sm text-gray-300">Série em destaque (aparece no carrossel)</span>
          </label>
        </section>

        {/* Images */}
        <section className="bg-surface-800 border border-surface-600 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Imagens</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Poster URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.poster_url}
                  onChange={(e) => updateForm('poster_url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-neon-blue"
                />
                <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer shrink-0">
                  <Upload className="h-3 w-3" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'poster_url')}
                  />
                </label>
              </div>
              {form.poster_url && (
                <img src={form.poster_url} alt="Poster" className="mt-2 w-24 h-36 object-cover rounded-lg" />
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Backdrop URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.backdrop_url}
                  onChange={(e) => updateForm('backdrop_url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-surface-700 border border-surface-500 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-neon-blue"
                />
                <label className="btn-secondary flex items-center gap-1 text-xs cursor-pointer shrink-0">
                  <Upload className="h-3 w-3" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'backdrop_url')}
                  />
                </label>
              </div>
              {form.backdrop_url && (
                <img src={form.backdrop_url} alt="Backdrop" className="mt-2 w-full h-24 object-cover rounded-lg" />
              )}
            </div>
          </div>
        </section>

        {/* Seasons & Episodes */}
        <section className="bg-surface-800 border border-surface-600 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">Temporadas e Episódios</h2>
            <button
              type="button"
              onClick={addSeason}
              className="flex items-center gap-1 text-neon-blue text-sm hover:underline"
            >
              <Plus className="h-4 w-4" />
              Temporada
            </button>
          </div>

          {seasons.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              Nenhuma temporada adicionada. Clique em &quot;+ Temporada&quot; para começar.
            </p>
          )}

          {seasons.map((season, si) => (
            <div key={si} className="border border-surface-500 rounded-lg overflow-hidden">
              {/* Season Header */}
              <div
                className="flex items-center justify-between p-3 bg-surface-700 cursor-pointer"
                onClick={() => toggleSeason(si)}
              >
                <div className="flex items-center gap-3">
                  {expandedSeasons.has(si) ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                  <input
                    type="text"
                    value={season.title}
                    onChange={(e) => {
                      const updated = [...seasons];
                      updated[si].title = e.target.value;
                      setSeasons(updated);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent text-white text-sm font-medium focus:outline-none border-b border-transparent focus:border-neon-blue"
                  />
                  <span className="text-gray-500 text-xs">({season.episodes.length} eps.)</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeSeason(si); }}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Episodes */}
              {expandedSeasons.has(si) && (
                <div className="p-3 space-y-2">
                  {season.episodes.map((ep, ei) => (
                    <div key={ei} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1">
                        <input
                          type="number"
                          value={ep.number}
                          onChange={(e) => updateEpisode(si, ei, 'number', parseInt(e.target.value))}
                          className="w-full bg-surface-600 border border-surface-500 rounded py-1.5 px-2 text-xs text-center text-white focus:outline-none focus:border-neon-blue"
                          placeholder="#"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={ep.title}
                          onChange={(e) => updateEpisode(si, ei, 'title', e.target.value)}
                          className="w-full bg-surface-600 border border-surface-500 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-neon-blue"
                          placeholder="Título"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={ep.download_url}
                          onChange={(e) => updateEpisode(si, ei, 'download_url', e.target.value)}
                          className="w-full bg-surface-600 border border-surface-500 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-neon-blue"
                          placeholder="URL de Download"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={ep.file_size}
                          onChange={(e) => updateEpisode(si, ei, 'file_size', e.target.value)}
                          className="w-full bg-surface-600 border border-surface-500 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-neon-blue"
                          placeholder="Size"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={ep.quality}
                          onChange={(e) => updateEpisode(si, ei, 'quality', e.target.value)}
                          className="w-full bg-surface-600 border border-surface-500 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-neon-blue"
                        >
                          {QUALITIES.map((q) => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeEpisode(si, ei)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addEpisode(si)}
                    className="w-full py-2 border border-dashed border-surface-500 rounded text-gray-500 text-xs hover:text-neon-blue hover:border-neon-blue transition-colors"
                  >
                    + Episódio
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Submit */}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Série'}
          </button>
          <Link href="/admin" className="btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
