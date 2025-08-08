export default function MessagesLoading() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="flex h-[600px] flex-col rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-start">
                <div className="h-12 w-48 animate-pulse rounded-lg bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
          <div className="flex space-x-2">
            <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200"></div>
            <div className="h-10 w-16 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
