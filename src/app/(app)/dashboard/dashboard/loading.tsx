export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
          <div className="mt-1 h-4 w-96 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg bg-white p-6 shadow">
                <div className="animate-pulse">
                  <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>
                  <div className="mb-4 h-4 w-1/2 rounded bg-gray-200"></div>
                  <div className="mb-4 h-16 rounded bg-gray-200"></div>
                  <div className="h-10 w-1/3 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
