'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

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
  const favorites = useSyncExternalStore(subscribe, getFavorites, getServerSnapshot);

  const toggleFavorite = useCallback((seriesId: string) => {
    const current = getSnapshot();
    const updated = current.includes(seriesId)
      ? current.filter((id) => id !== seriesId)
      : [...current, seriesId];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage full or unavailable
    }
    emitChange();
  }, []);

  const isFavorite = useCallback((seriesId: string) => {
    return favorites.includes(seriesId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
