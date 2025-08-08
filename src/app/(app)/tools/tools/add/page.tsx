import { AppHeader } from "@/common/components/AppHeader";

import { AddToolFormWrapper } from "./components/AddToolFormWrapper";
import { getAddToolData } from "./getAddToolData";

export default async function AddToolPage() {
  const { categories, categoryOptions } = await getAddToolData();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Add New Tool"
        subtitle="Share your tools with the community"
      />

      <main className="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AddToolFormWrapper
            categories={categories}
            categoryOptions={categoryOptions}
          />
        </div>
      </main>
    </div>
  );
}
