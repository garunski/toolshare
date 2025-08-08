import { notFound } from "next/navigation";

import { createClient } from "@/common/supabase/server";

import { ToolDetailView } from "./components/ToolDetailView";

interface ToolDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch tool data
  const { data: tool, error } = await supabase
    .from("items")
    .select(
      `
      *,
      categories(name, slug),
      profiles!items_owner_id_fkey (
        id,
        first_name,
        last_name,
        bio,
        avatar_url
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !tool) {
    notFound();
  }

  return <ToolDetailView tool={tool} />;
}
