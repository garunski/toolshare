export default function SocialLoading() {
  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200"></div>
      </div>

      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>

        <div className="space-y-4">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-3 w-48 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
