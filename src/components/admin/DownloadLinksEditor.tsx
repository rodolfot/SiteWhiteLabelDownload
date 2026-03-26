'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Globe, Lock } from 'lucide-react';
import { isValidDownloadUrl } from '@/lib/validation';
import { DownloadLink } from '@/types/database';

interface DownloadLinksEditorProps {
  contentType: 'movie' | 'book' | 'game';
  contentId: string;
}

interface LinkForm {
  id?: string;
  label: string;
  download_url: string;
  file_size: string;
  quality: string;
  donor_only: boolean;
}

const QUALITIES = ['480p', '720p', '1080p', '4K', 'PDF', 'EPUB', 'MOBI', 'AZW3', 'CBR', 'DJVU', 'Outro'];

export function DownloadLinksEditor({ contentType, contentId }: DownloadLinksEditorProps) {
  const [links, setLinks] = useState<LinkForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadLinks = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('download_links')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('created_at', { ascending: true });
      if (data) {
        setLinks(data.map((d: DownloadLink) => ({
          id: d.id,
          label: d.label,
          download_url: d.download_url,
          file_size: d.file_size,
          quality: d.quality,
          donor_only: d.donor_only || false,
        })));
      }
      setLoading(false);
    };
    loadLinks();
  }, [contentType, contentId]);

  const addLink = () => {
    setLinks((prev) => [...prev, { label: '', download_url: '', file_size: '', quality: '1080p', donor_only: false }]);
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof LinkForm, value: string) => {
    setLinks((prev) => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  const handleSave = async () => {
    // Validate all URLs
    for (const link of links) {
      if (link.download_url && !isValidDownloadUrl(link.download_url)) {
        alert(`URL inválida: ${link.download_url}`);
        return;
      }
    }

    setSaving(true);
    try {
      const supabase = createClient();

      // Delete all existing links for this content
      await supabase
        .from('download_links')
        .delete()
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      // Insert new links
      if (links.length > 0) {
        const inserts = links
          .filter((l) => l.download_url.trim())
          .map((l) => ({
            content_type: contentType,
            content_id: contentId,
            label: l.label.trim() || 'Download',
            download_url: l.download_url.trim(),
            file_size: l.file_size.trim(),
            quality: l.quality,
            donor_only: l.donor_only,
          }));

        if (inserts.length > 0) {
          const { error } = await supabase.from('download_links').insert(inserts);
          if (error) throw error;
        }
      }

      alert('Links de download salvos!');
    } catch (err) {
      console.error('Error saving links:', err);
      alert('Erro ao salvar links.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-800 border border-surface-600 rounded-xl p-6">
        <div className="animate-pulse h-4 bg-surface-600 rounded w-48" />
      </div>
    );
  }

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Links de Download ({links.length})
        </h2>
        <button
          type="button"
          onClick={addLink}
          className="flex items-center gap-1.5 text-xs text-neon-blue hover:text-white transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar Link
        </button>
      </div>

      {links.length === 0 ? (
        <p className="text-gray-500 text-xs">Nenhum link adicional. Use o campo principal ou adicione links aqui.</p>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="bg-surface-700/50 border border-surface-500 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Link {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(index, 'label', e.target.value)}
                  placeholder="Label (ex: Dublado)"
                  className="bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-neon-blue transition-all"
                />
                <input
                  type="url"
                  value={link.download_url}
                  onChange={(e) => updateLink(index, 'download_url', e.target.value)}
                  placeholder="https://..."
                  className="sm:col-span-1 bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-neon-blue transition-all"
                />
                <select
                  value={link.quality}
                  onChange={(e) => updateLink(index, 'quality', e.target.value)}
                  className="bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-neon-blue transition-all"
                >
                  {QUALITIES.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
                <input
                  type="text"
                  value={link.file_size}
                  onChange={(e) => updateLink(index, 'file_size', e.target.value)}
                  placeholder="Tamanho (ex: 2 GB)"
                  className="bg-surface-700 border border-surface-500 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-neon-blue transition-all"
                />
              </div>
              <label className="flex items-center gap-2 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={link.donor_only}
                  onChange={(e) => {
                    setLinks((prev) => prev.map((l, i) => i === index ? { ...l, donor_only: e.target.checked } : l));
                  }}
                  className="rounded border-surface-500 bg-surface-700 text-neon-blue focus:ring-neon-blue/50"
                />
                <Lock className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-yellow-500">Exclusivo para doadores</span>
              </label>
            </div>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-xs disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar Links'}
        </button>
      )}
    </div>
  );
}
