export default function ParkingDetailLoading() {
  return (
    <div className="flex-1 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-8 bg-white rounded mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left content skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-7 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="flex gap-4">
                <div className="h-6 w-16 bg-gray-200 rounded" />
                <div className="h-6 w-24 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 mb-3">
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                  <div className="h-2 flex-1 bg-gray-100 rounded-full" />
                  <div className="h-4 w-8 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-6 w-24 bg-gray-100 rounded-full" />
                ))}
              </div>
            </div>
          </div>
          {/* Sidebar skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-64">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="space-y-2 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded w-full" />
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
