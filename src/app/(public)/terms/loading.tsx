export default function TermsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 h-8 w-64 animate-pulse rounded bg-gray-200"></div>
          <div className="mx-auto h-4 w-96 animate-pulse rounded bg-gray-200"></div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg bg-white p-6 shadow-md"
            >
              <div className="mb-4 h-6 w-3/4 rounded bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                <div className="h-4 w-4/6 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
