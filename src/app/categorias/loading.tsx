import { SiteShell } from '@/components/ui/SiteShell';

export default function CategoriasLoading() {
  return (
    <SiteShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        {/* Header */}
        <div className="h-8 bg-surface-700 rounded w-48 mb-6" />

        {/* Category pills */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-surface-700 rounded-full w-24" />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] bg-surface-700 rounded-xl" />
              <div className="h-4 bg-surface-700 rounded w-3/4" />
              <div className="h-3 bg-surface-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
