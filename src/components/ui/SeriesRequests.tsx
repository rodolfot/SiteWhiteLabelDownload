'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileQuestion, Send, ThumbsUp, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SeriesRequest } from '@/types/database';
import { useI18n } from '@/lib/i18n/context';

export function SeriesRequests() {
  const { t } = useI18n();
  const [requests, setRequests] = useState<SeriesRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<'serie' | 'movie' | 'book' | 'game'>('serie');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('series_requests')
      .select('*')
      .eq('type', requestType)
      .order('votes', { ascending: false })
      .limit(50);
    setRequests(data || []);
    setLoading(false);
  }, [requestType]);

  useEffect(() => {
    loadRequests();
    // Restaurar nickname e votos
    const saved = localStorage.getItem('comment_nickname');
    if (saved) setNickname(saved);
    const voted = localStorage.getItem('voted_requests');
    if (voted) setVotedIds(new Set(JSON.parse(voted)));
  }, [loadRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedTitle = title.trim();
    const trimmedNick = nickname.trim();

    if (!trimmedTitle) {
      setError(t.requests.errorTitle);
      return;
    }
    if (!trimmedNick || trimmedNick.length < 2) {
      setError(t.requests.errorNick);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from('series_requests').insert({
        title: trimmedTitle,
        description: description.trim() || null,
        nickname: trimmedNick,
        type: requestType,
      });

      if (insertError) {
        setError(t.requests.errorTitle);
      } else {
        localStorage.setItem('comment_nickname', trimmedNick);
        setTitle('');
        setDescription('');
        setSuccess(t.requests.success);
        loadRequests();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError(t.requests.errorTitle);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (id: string) => {
    if (votedIds.has(id)) return;

    const supabase = createClient();
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    const { error } = await supabase
      .from('series_requests')
      .update({ votes: req.votes + 1 })
      .eq('id', id);

    if (!error) {
      const newVoted = new Set(votedIds);
      newVoted.add(id);
      setVotedIds(newVoted);
      localStorage.setItem('voted_requests', JSON.stringify(Array.from(newVoted)));
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, votes: r.votes + 1 } : r))
          .sort((a, b) => b.votes - a.votes)
      );
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    approved: 'text-green-400 bg-green-400/10',
    rejected: 'text-red-400 bg-red-400/10',
    completed: 'text-neon-blue bg-neon-blue/10',
  };

  const statusLabels: Record<string, string> = {
    pending: t.requests.pending,
    approved: t.requests.approved,
    rejected: t.requests.rejected,
    completed: t.requests.completed,
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
        <FileQuestion className="h-5 w-5 text-neon-purple" />
        {t.requests.title}
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        {t.requests.subtitle}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface-700/50 border border-surface-600 rounded-lg p-4 mb-6">
        {/* Type selector */}
        <div className="flex flex-wrap gap-2 mb-3">
          {([
            { key: 'serie' as const, label: t.requests.typeSerie },
            { key: 'movie' as const, label: t.requests.typeMovie },
            { key: 'book' as const, label: t.requests.typeBook },
            { key: 'game' as const, label: t.requests.typeGame },
          ]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setRequestType(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                requestType === key
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                  : 'bg-surface-700 border border-surface-500 text-gray-300 hover:text-white hover:border-neon-blue'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              requestType === 'movie' ? t.requests.movieName :
              requestType === 'book' ? t.requests.bookName :
              requestType === 'game' ? t.requests.gameName :
              t.requests.seriesName
            }
            maxLength={255}
            className="bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue"
          />
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.requests.nickname}
              maxLength={50}
              className="w-full bg-surface-800 border border-surface-600 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue"
            />
          </div>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.requests.description}
          maxLength={500}
          rows={2}
          className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue resize-none mb-3"
        />

        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
        {success && <p className="text-green-400 text-xs mb-2">{success}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {submitting ? t.requests.submitting : t.requests.submit}
        </button>
      </form>

      {/* Requests list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-700/30 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-surface-600 rounded w-48 mb-2" />
              <div className="h-3 bg-surface-600 rounded w-24" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-surface-700/30 border border-surface-600 rounded-lg p-6 text-center">
          <FileQuestion className="h-6 w-6 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">{t.requests.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <div key={req.id} className="flex items-center gap-3 bg-surface-700/30 border border-surface-600 rounded-lg p-3">
              <button
                onClick={() => handleVote(req.id)}
                disabled={votedIds.has(req.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all shrink-0 ${
                  votedIds.has(req.id)
                    ? 'text-neon-blue bg-neon-blue/10'
                    : 'text-gray-400 hover:text-neon-blue hover:bg-neon-blue/5'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-xs font-bold">{req.votes}</span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-white text-sm font-medium truncate">{req.title}</h4>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[req.status]}`}>
                    {statusLabels[req.status]}
                  </span>
                </div>
                {req.description && (
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{req.description}</p>
                )}
                <span className="text-gray-600 text-xs">{t.requests.by} {req.nickname}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
