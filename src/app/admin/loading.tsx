export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 bg-surface-700 rounded w-48" />
        <div className="h-10 bg-surface-700 rounded w-32" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-800 border border-surface-700 rounded-xl p-4">
            <div className="h-4 bg-surface-700 rounded w-20 mb-2" />
            <div className="h-8 bg-surface-700 rounded w-12" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-surface-800 border border-surface-700 rounded-xl overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-surface-700">
            <div className="w-12 h-16 bg-surface-700 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-700 rounded w-1/3" />
              <div className="h-3 bg-surface-700 rounded w-1/4" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-surface-700 rounded" />
              <div className="h-8 w-8 bg-surface-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
