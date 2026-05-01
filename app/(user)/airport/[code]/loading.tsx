export default function AirportLoading() {
  return (
    <div className="flex-1 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        {/* Skeleton header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="h-7 bg-gray-200 rounded w-2/3 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
        {/* Skeleton table rows */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
            <div className="h-3 bg-gray-200 rounded col-span-4" />
            <div className="h-3 bg-gray-200 rounded col-span-2" />
            <div className="h-3 bg-gray-200 rounded col-span-2" />
            <div className="h-3 bg-gray-200 rounded col-span-2" />
            <div className="h-3 bg-gray-200 rounded col-span-2" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-100">
              <div className="h-4 bg-gray-100 rounded col-span-4" />
              <div className="h-4 bg-gray-100 rounded col-span-2" />
              <div className="h-4 bg-gray-100 rounded col-span-2" />
              <div className="h-4 bg-gray-100 rounded col-span-2" />
              <div className="h-4 bg-gray-100 rounded col-span-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
