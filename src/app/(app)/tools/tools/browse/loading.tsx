export default function BrowseToolsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Search Sidebar */}
            <div className="lg:col-span-1">
              <div className="animate-pulse">
                <div className="mb-4 h-8 rounded bg-gray-200"></div>
                <div className="space-y-3">
                  <div className="h-4 rounded bg-gray-200"></div>
                  <div className="h-4 rounded bg-gray-200"></div>
                  <div className="h-4 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                  </div>
                  <p className="text-gray-600">Loading tools...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
