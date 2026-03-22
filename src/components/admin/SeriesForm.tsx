'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Plus, Trash2, Upload, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { validateImageFile, isValidDownloadUrl, isValidTrailerUrl } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit-log';

interface EpisodeLinkForm {
  id?: string;
  language: string;
  download_url: string;
  file_size: string;
  quality: string;
}

interface Episode {
  id?: string;
  number: number;
  title: string;
  download_url: string;
  file_size: string;
  quality: string;
  links: EpisodeLinkForm[];
}

interface Season {
  id?: string;
  number: number;
  title: string;
  trailer_url: string;
  episodes: Episode[];
}

// Helper to ensure episodes have links array
function normalizeSeasons(seasons: Season[]): Season[] {
  return seasons.map((s) => ({
    ...s,
    episodes: s.episodes.map((ep) => ({
      ...ep,
      links: ep.links || [],
    })),
  }));
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

const DEFAULT_CATEGORIES = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Ficção Científica', 'Terror', 'Romance', 'Anime', 'Documentário', 'Geral'];
const QUALITIES = ['480p', '720p', '1080p', '4K'];
const LANGUAGES = ['Dublado', 'Legendado', 'Dual Audio', 'Nacional', 'Inglês', 'Espanhol', 'Japonês', 'Coreano'];

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
    normalizeSeasons(initialSeasons || [])
  );

  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([0]));
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
    setSeasons([...seasons, { number: num, title: `Temporada ${num}`, trailer_url: '', episodes: [] }]);
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
      links: [],
    });
    setSeasons(updated);
  };

  const addEpisodeLink = (seasonIndex: number, epIndex: number) => {
    const updated = [...seasons];
    updated[seasonIndex].episodes[epIndex].links.push({
      language: 'Dublado',
      download_url: '',
      file_size: '',
      quality: '1080p',
    });
    setSeasons(updated);
  };

  const removeEpisodeLink = (seasonIndex: number, epIndex: number, linkIndex: number) => {
    const updated = [...seasons];
    updated[seasonIndex].episodes[epIndex].links = updated[seasonIndex].episodes[epIndex].links.filter((_, i) => i !== linkIndex);
    setSeasons(updated);
  };

  const updateEpisodeLink = (seasonIndex: number, epIndex: number, linkIndex: number, field: string, value: string) => {
    const updated = [...seasons];
    (updated[seasonIndex].episodes[epIndex].links[linkIndex] as unknown as Record<string, string>)[field] = value;
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

    // Validar trailer e download URLs antes de salvar
    for (const season of seasons) {
      if (season.trailer_url && !isValidTrailerUrl(season.trailer_url)) {
        setError(`URL de trailer inválida em "${season.title}". Use YouTube, Twitch ou Kick.`);
        setSaving(false);
        return;
      }
      for (const ep of season.episodes) {
        if (ep.download_url && !isValidDownloadUrl(ep.download_url)) {
          setError(`URL de download inválida no episódio "${ep.title}". Use http:// ou https://.`);
          setSaving(false);
          return;
        }
        for (const link of ep.links) {
          if (link.download_url && !isValidDownloadUrl(link.download_url)) {
            setError(`URL de download inválida no link "${link.language}" do episódio "${ep.title}". Use http:// ou https://.`);
            setSaving(false);
            return;
          }
        }
      }
    }

    try {
      const supabase = createClient();

      if (initialData) {
        // Update existing series
        const { error: updateError } = await supabase
          .from('series')
          .update(form)
          .eq('id', initialData.id);
        if (updateError) throw updateError;

        // Collect IDs of seasons/episodes that still exist in the form
        const existingSeasonIds = seasons.filter((s) => s.id).map((s) => s.id!);
        const existingEpisodeIds = seasons
          .flatMap((s) => s.episodes)
          .filter((ep) => ep.id)
          .map((ep) => ep.id!);

        // Delete seasons that were removed from the form
        if (existingSeasonIds.length > 0) {
          await supabase
            .from('seasons')
            .delete()
            .eq('series_id', initialData.id)
            .not('id', 'in', `(${existingSeasonIds.join(',')})`);
        } else {
          await supabase.from('seasons').delete().eq('series_id', initialData.id);
        }

        for (const season of seasons) {
          let seasonId = season.id;

          if (seasonId) {
            // Update existing season
            const { error: seasonError } = await supabase
              .from('seasons')
              .update({ number: season.number, title: season.title, trailer_url: season.trailer_url })
              .eq('id', seasonId);
            if (seasonError) throw seasonError;

            // Delete episodes that were removed from this season
            const keepEpIds = season.episodes.filter((ep) => ep.id).map((ep) => ep.id!);
            if (keepEpIds.length > 0) {
              await supabase
                .from('episodes')
                .delete()
                .eq('season_id', seasonId)
                .not('id', 'in', `(${keepEpIds.join(',')})`);
            } else {
              await supabase.from('episodes').delete().eq('season_id', seasonId);
            }
          } else {
            // Insert new season
            const { data: newSeason, error: seasonError } = await supabase
              .from('seasons')
              .insert({ series_id: initialData.id, number: season.number, title: season.title, trailer_url: season.trailer_url })
              .select()
              .single();
            if (seasonError) throw seasonError;
            seasonId = newSeason.id;
          }

          // Upsert episodes + links
          for (const ep of season.episodes) {
            let epId = ep.id;
            if (epId) {
              const { error: epError } = await supabase
                .from('episodes')
                .update({
                  number: ep.number,
                  title: ep.title,
                  download_url: ep.download_url,
                  file_size: ep.file_size,
                  quality: ep.quality,
                })
                .eq('id', epId);
              if (epError) throw epError;
            } else {
              const { data: newEp, error: epError } = await supabase.from('episodes').insert({
                season_id: seasonId,
                number: ep.number,
                title: ep.title,
                download_url: ep.download_url,
                file_size: ep.file_size,
                quality: ep.quality,
              }).select().single();
              if (epError) throw epError;
              epId = newEp.id;
            }

            // Sync episode_links
            if (ep.links.length > 0) {
              const keepLinkIds = ep.links.filter((l) => l.id).map((l) => l.id!);
              if (keepLinkIds.length > 0) {
                await supabase.from('episode_links').delete().eq('episode_id', epId).not('id', 'in', `(${keepLinkIds.join(',')})`);
              } else {
                await supabase.from('episode_links').delete().eq('episode_id', epId);
              }
              for (const link of ep.links) {
                if (link.id) {
                  await supabase.from('episode_links').update({
                    language: link.language,
                    download_url: link.download_url,
                    file_size: link.file_size,
                    quality: link.quality,
                  }).eq('id', link.id);
                } else {
                  await supabase.from('episode_links').insert({
                    episode_id: epId,
                    language: link.language,
                    download_url: link.download_url,
                    file_size: link.file_size,
                    quality: link.quality,
                  });
                }
              }
            } else {
              // No links in form — delete all existing
              await supabase.from('episode_links').delete().eq('episode_id', epId);
            }
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
            .insert({ series_id: newSeries.id, number: season.number, title: season.title, trailer_url: season.trailer_url })
            .select()
            .single();
          if (seasonError) throw seasonError;

          for (const ep of season.episodes) {
            const { data: newEp, error: epError } = await supabase.from('episodes').insert({
              season_id: newSeason.id,
              number: ep.number,
              title: ep.title,
              download_url: ep.download_url,
              file_size: ep.file_size,
              quality: ep.quality,
            }).select().single();
            if (epError) throw epError;

            if (ep.links.length > 0) {
              const links = ep.links.map((link) => ({
                episode_id: newEp.id,
                language: link.language,
                download_url: link.download_url,
                file_size: link.file_size,
                quality: link.quality,
              }));
              const { error: linkError } = await supabase.from('episode_links').insert(links);
              if (linkError) throw linkError;
            }
          }
        }
      }

      const isEdit = !!initialData;
      logAdminAction({
        action: isEdit ? 'update' : 'create',
        entity: 'series',
        entity_id: isEdit ? initialData.id : undefined,
        details: form.title,
      });

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
                {dynamicCategories.map((cat) => (
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
                <Image src={form.poster_url} alt="Poster" width={96} height={144} className="mt-2 object-cover rounded-lg" />
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
                <Image src={form.backdrop_url} alt="Backdrop" width={400} height={96} className="mt-2 w-full h-24 object-cover rounded-lg" />
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

              {/* Trailer URL per season */}
              {expandedSeasons.has(si) && (
                <div className="px-3 pt-3">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Trailer (YouTube, Twitch, Kick)</label>
                  <input
                    type="url"
                    value={season.trailer_url || ''}
                    onChange={(e) => {
                      const updated = [...seasons];
                      updated[si].trailer_url = e.target.value;
                      setSeasons(updated);
                    }}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-neon-blue"
                  />
                </div>
              )}

              {/* Episodes */}
              {expandedSeasons.has(si) && (
                <div className="p-3 space-y-2">
                  {season.episodes.map((ep, ei) => (
                    <div key={ei} className="space-y-1">
                      <div className="grid grid-cols-12 gap-2 items-center">
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
                            placeholder="URL de Download (fallback)"
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

                      {/* Episode Links (idiomas) */}
                      {ep.links.map((link, li) => (
                        <div key={li} className="grid grid-cols-12 gap-2 items-center ml-8 pl-2 border-l-2 border-neon-purple/30">
                          <div className="col-span-2">
                            <select
                              value={link.language}
                              onChange={(e) => updateEpisodeLink(si, ei, li, 'language', e.target.value)}
                              className="w-full bg-surface-600 border border-surface-500 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-neon-purple"
                            >
                              {LANGUAGES.map((l) => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={link.download_url}
                              onChange={(e) => updateEpisodeLink(si, ei, li, 'download_url', e.target.value)}
                              className="w-full bg-surface-600 border border-surface-500 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-neon-purple"
                              placeholder="URL do idioma"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={link.file_size}
                              onChange={(e) => updateEpisodeLink(si, ei, li, 'file_size', e.target.value)}
                              className="w-full bg-surface-600 border border-surface-500 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-neon-purple"
                              placeholder="Size"
                            />
                          </div>
                          <div className="col-span-2">
                            <select
                              value={link.quality}
                              onChange={(e) => updateEpisodeLink(si, ei, li, 'quality', e.target.value)}
                              className="w-full bg-surface-600 border border-surface-500 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-neon-purple"
                            >
                              {QUALITIES.map((q) => (
                                <option key={q} value={q}>{q}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => removeEpisodeLink(si, ei, li)}
                              className="text-gray-500 hover:text-red-400 transition-colors text-xs"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addEpisodeLink(si, ei)}
                        className="ml-8 text-xs text-neon-purple hover:underline"
                      >
                        + Idioma/Link
                      </button>
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
