import Link from "next/link";

import { AppHeader } from "@/common/components/AppHeader";
import { Button } from "@/primitives/button";

import { ToolsList } from "./components/ToolsList";
import { getUserTools } from "./getUserTools";

export default async function ToolsPage() {
  const tools = await getUserTools();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="My Tools" subtitle="Manage your tool inventory">
        <Link href="/tools/add">
          <Button>Add New Tool</Button>
        </Link>
      </AppHeader>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <ToolsList tools={tools} />
        </div>
      </main>
    </div>
  );
}
