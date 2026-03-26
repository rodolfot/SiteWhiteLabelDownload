'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { createClient } from '@/lib/supabase/client';

const STORAGE_KEY = 'downdoor_favorites';

function getSnapshot(): string[] {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : EMPTY;
  } catch {
    return EMPTY;
  }
}

const EMPTY: string[] = [];

function getServerSnapshot(): string[] {
  return EMPTY;
}

// Global listeners para sincronizar entre componentes
let listeners: Array<() => void> = [];
let cachedFavorites: string[] | null = null;

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emitChange() {
  cachedFavorites = null;
  listeners.forEach((l) => l());
}

function getFavorites(): string[] {
  if (cachedFavorites !== null) return cachedFavorites;
  cachedFavorites = getSnapshot();
  return cachedFavorites;
}

export function useFavorites() {
  const { user } = useAuth();
  const localFavorites = useSyncExternalStore(subscribe, getFavorites, getServerSnapshot);
  const [dbFavorites, setDbFavorites] = useState<string[] | null>(null);
  const [synced, setSynced] = useState(false);

  // Load favorites from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      setDbFavorites(null);
      setSynced(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from('user_favorites')
      .select('content_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const ids = (data || []).map((r: { content_id: string }) => r.content_id);
        setDbFavorites(ids);

        // Merge localStorage favorites into DB on first login
        if (!synced) {
          const localIds = getSnapshot();
          const newIds = localIds.filter((id) => !ids.includes(id));
          if (newIds.length > 0) {
            const rows = newIds.map((id) => ({ user_id: user.id, content_id: id }));
            supabase.from('user_favorites').upsert(rows, { onConflict: 'user_id,content_id' }).then(() => {
              setDbFavorites([...ids, ...newIds]);
            });
          }
          setSynced(true);
        }
      });
  }, [user, synced]);

  const favorites = user && dbFavorites !== null ? dbFavorites : localFavorites;

  const toggleFavorite = useCallback((contentId: string) => {
    if (user && dbFavorites !== null) {
      // Sync with Supabase
      const supabase = createClient();
      const isFav = dbFavorites.includes(contentId);
      if (isFav) {
        setDbFavorites(dbFavorites.filter((id) => id !== contentId));
        supabase.from('user_favorites').delete().eq('user_id', user.id).eq('content_id', contentId).then();
      } else {
        setDbFavorites([...dbFavorites, contentId]);
        supabase.from('user_favorites').insert({ user_id: user.id, content_id: contentId }).then();
      }
    }

    // Always update localStorage too (fallback + offline)
    const current = getSnapshot();
    const updated = current.includes(contentId)
      ? current.filter((id) => id !== contentId)
      : [...current, contentId];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage full or unavailable
    }
    emitChange();
  }, [user, dbFavorites]);

  const isFavorite = useCallback((contentId: string) => {
    return favorites.includes(contentId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
