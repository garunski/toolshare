export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        {/* Header skeleton */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-8 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="mx-auto h-4 w-48 animate-pulse rounded bg-gray-200"></div>
        </div>

        {/* Form skeleton */}
        <div className="space-y-4">
          <div className="h-12 animate-pulse rounded bg-gray-200"></div>
          <div className="h-12 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 animate-pulse rounded bg-gray-200"></div>
        </div>

        {/* Footer skeleton */}
        <div className="mt-6 text-center">
          <div className="mx-auto h-4 w-48 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
