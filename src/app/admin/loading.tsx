export default function AdminLoading() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
        <div className="mt-1 h-4 w-96 animate-pulse rounded bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow">
            <div className="animate-pulse">
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-8 w-1/2 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-32 animate-pulse rounded bg-gray-200"></div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded bg-gray-200"
            ></div>
          ))}
        </div>
        <div className="h-48 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  );
}
