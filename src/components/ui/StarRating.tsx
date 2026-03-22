'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface StarRatingProps {
  seriesId: string;
  initialRating?: number;
}

async function hashIp(): Promise<string> {
  // Use a stable anonymous identifier based on localStorage
  const stored = localStorage.getItem('rating_uid');
  if (stored) return stored;
  const uid = crypto.randomUUID();
  localStorage.setItem('rating_uid', uid);
  return uid;
}

export function StarRating({ seriesId, initialRating = 0 }: StarRatingProps) {
  const [hovering, setHovering] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(initialRating);
  const [totalVotes, setTotalVotes] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadRatings = useCallback(async () => {
    const supabase = createClient();
    const ipHash = await hashIp();

    const { data: ratings } = await supabase
      .from('user_ratings')
      .select('rating, ip_hash')
      .eq('series_id', seriesId);

    if (ratings && ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      setAverageRating(Math.round((sum / ratings.length) * 10) / 10);
      setTotalVotes(ratings.length);
      const mine = ratings.find((r) => r.ip_hash === ipHash);
      if (mine) setUserRating(mine.rating);
    }
  }, [seriesId]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const handleRate = async (value: number) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const supabase = createClient();
      const ipHash = await hashIp();

      // Upsert: insert or update on conflict
      const { error } = await supabase.from('user_ratings').upsert(
        { series_id: seriesId, ip_hash: ipHash, rating: value },
        { onConflict: 'series_id,ip_hash' }
      );

      if (!error) {
        setUserRating(value);
        loadRatings();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hovering || userRating;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleRate(value)}
            onMouseEnter={() => setHovering(value)}
            onMouseLeave={() => setHovering(0)}
            disabled={submitting}
            className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
            aria-label={`Avaliar ${value} estrelas`}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                value <= displayRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-yellow-400 font-medium">{averageRating.toFixed(1)}</span>
        <span className="text-gray-500">({totalVotes} {totalVotes === 1 ? 'voto' : 'votos'})</span>
      </div>
      {userRating > 0 && (
        <span className="text-xs text-gray-500">Sua nota: {userRating}</span>
      )}
    </div>
  );
}
