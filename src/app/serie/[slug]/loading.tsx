import { SiteShell } from '@/components/ui/SiteShell';

export default function SerieLoading() {
  return (
    <SiteShell>
      <div className="animate-pulse">
        {/* Backdrop skeleton */}
        <div className="relative w-full h-[50vh] bg-surface-800 rounded-b-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster skeleton */}
            <div className="w-48 h-72 bg-surface-700 rounded-xl shrink-0" />

            <div className="flex-1 space-y-4 pt-4">
              {/* Title */}
              <div className="h-8 bg-surface-700 rounded w-2/3" />
              {/* Meta */}
              <div className="flex gap-3">
                <div className="h-5 bg-surface-700 rounded w-16" />
                <div className="h-5 bg-surface-700 rounded w-20" />
                <div className="h-5 bg-surface-700 rounded w-12" />
              </div>
              {/* Synopsis */}
              <div className="space-y-2">
                <div className="h-4 bg-surface-700 rounded w-full" />
                <div className="h-4 bg-surface-700 rounded w-5/6" />
                <div className="h-4 bg-surface-700 rounded w-4/6" />
              </div>
            </div>
          </div>

          {/* Seasons skeleton */}
          <div className="mt-12 space-y-4">
            <div className="h-6 bg-surface-700 rounded w-40" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-surface-800 border border-surface-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
