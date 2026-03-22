'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Comment } from '@/types/database';

interface CommentsProps {
  seriesId: string;
}

export function Comments({ seriesId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadComments = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('series_id', seriesId)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(50);
    setComments(data || []);
    setLoading(false);
  }, [seriesId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Restaurar nickname do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('comment_nickname');
    if (saved) setNickname(saved);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedNick = nickname.trim();
    const trimmedContent = content.trim();

    if (!trimmedNick || trimmedNick.length < 2) {
      setError('O apelido deve ter pelo menos 2 caracteres.');
      return;
    }
    if (!trimmedContent || trimmedContent.length < 3) {
      setError('O comentário deve ter pelo menos 3 caracteres.');
      return;
    }
    if (trimmedContent.length > 1000) {
      setError('O comentário deve ter no máximo 1000 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from('comments').insert({
        series_id: seriesId,
        nickname: trimmedNick,
        content: trimmedContent,
      });

      if (insertError) {
        console.error('Comment insert error:', insertError);
        if (insertError.code === '42501') {
          setError('Permissão negada. Execute a migration de correção: src/lib/supabase/comments-fix.sql');
        } else if (insertError.code === '42P01') {
          setError('Tabela de comentários não encontrada. Execute a migration: src/lib/supabase/comments-migration.sql');
        } else {
          setError(`Erro ao enviar comentário: ${insertError.message}`);
        }
      } else {
        localStorage.setItem('comment_nickname', trimmedNick);
        setContent('');
        setSuccess('Comentário enviado com sucesso!');
        loadComments();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `${diffMin}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-neon-blue" />
        Comentários ({comments.length})
      </h3>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface-700/50 border border-surface-600 rounded-lg p-4 mb-6">
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Seu apelido"
              maxLength={50}
              className="w-full bg-surface-800 border border-surface-600 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue"
            />
          </div>
        </div>
        <div className="relative mb-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva seu comentário..."
            maxLength={1000}
            rows={3}
            className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue resize-none"
          />
          <span className="absolute bottom-2 right-3 text-xs text-gray-600">
            {content.length}/1000
          </span>
        </div>

        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
        {success && <p className="text-green-400 text-xs mb-2">{success}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {submitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-700/30 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-surface-600 rounded w-24 mb-2" />
              <div className="h-3 bg-surface-600 rounded w-full mb-1" />
              <div className="h-3 bg-surface-600 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-surface-700/30 border border-surface-600 rounded-lg p-6 text-center">
          <MessageCircle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Nenhum comentário ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-surface-700/30 border border-surface-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neon-blue text-sm font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {comment.nickname}
                </span>
                <span className="text-gray-600 text-xs">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line break-words">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
