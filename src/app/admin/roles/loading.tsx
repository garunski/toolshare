export default function RolesLoading() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Admin header skeleton */}
        <div className="mb-8">
          <div className="mb-4 h-8 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg bg-white p-6 shadow"
              >
                <div className="mb-2 h-4 w-1/2 rounded bg-gray-200"></div>
                <div className="h-8 w-1/4 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Roles content skeleton */}
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="mb-4 h-6 w-1/3 animate-pulse rounded bg-gray-200"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-gray-200"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
