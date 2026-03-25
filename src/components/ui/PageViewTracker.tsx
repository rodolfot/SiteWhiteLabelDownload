'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface PageViewTrackerProps {
  seriesId?: string;
  movieId?: string;
}

export function PageViewTracker({ seriesId, movieId }: PageViewTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Não trackear admin
    if (pathname.startsWith('/admin')) return;

    const trackView = async () => {
      try {
        const supabase = createClient();
        await supabase.from('page_views').insert({
          page_path: pathname,
          series_id: seriesId || null,
          movie_id: movieId || null,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent.substring(0, 200),
        });
      } catch {
        // Silencioso — analytics não deve quebrar a experiência
      }
    };

    trackView();
  }, [pathname, seriesId, movieId]);

  return null;
}
