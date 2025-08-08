import { AppHeader } from "@/common/components/AppHeader";

export default function BrowseToolsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Browse Tools"
        subtitle="Discover tools available in your community"
      />

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Search Sidebar */}
            <div className="lg:col-span-1">
              <div className="animate-pulse">
                <div className="mb-4 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-3">
                  <div className="h-6 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-6 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-6 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <div className="animate-pulse">
                <div className="mb-4 h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-48 rounded-lg bg-gray-200 dark:bg-gray-700"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
