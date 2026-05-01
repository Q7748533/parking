export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 bg-secondary rounded w-40 mb-2" />
          <div className="h-4 bg-secondary/50 rounded w-64" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card/50 border border-border/50 rounded-lg p-6">
            <div className="h-4 bg-secondary rounded w-1/2 mb-3" />
            <div className="h-8 bg-secondary rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
