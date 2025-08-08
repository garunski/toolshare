import { AppHeader } from "@/common/components/AppHeader";

import { BrowseToolsWrapper } from "./components/BrowseToolsWrapper";
import { getSearchResults } from "./getSearchResults";

interface BrowseToolsPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    availability?: string;
    page?: string;
    // Advanced search parameters
    categories?: string;
    conditions?: string;
    location?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    tags?: string;
  }>;
}

export default async function BrowseToolsPage({
  searchParams,
}: BrowseToolsPageProps) {
  const resolvedSearchParams = await searchParams;

  const params = {
    query: resolvedSearchParams.query,
    category: resolvedSearchParams.category,
    availability: resolvedSearchParams.availability,
    page: resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1,
    // Advanced search parameters
    categories: resolvedSearchParams.categories,
    conditions: resolvedSearchParams.conditions,
    location: resolvedSearchParams.location,
    sortBy: resolvedSearchParams.sortBy,
    sortOrder: resolvedSearchParams.sortOrder as "asc" | "desc",
    tags: resolvedSearchParams.tags,
  };

  const { tools, facets, pagination } = await getSearchResults(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Browse Tools"
        subtitle="Discover tools available in your community"
      />

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <BrowseToolsWrapper
            tools={tools}
            pagination={pagination}
            facets={facets}
            searchParams={resolvedSearchParams}
          />
        </div>
      </main>
    </div>
  );
}
