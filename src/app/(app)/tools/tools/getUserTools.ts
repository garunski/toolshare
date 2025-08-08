import { cookies } from "next/headers";

import { createClient } from "@/common/supabase/server";

export async function getUserTools() {
  const cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: tools, error } = await supabase
    .from("items")
    .select(
      `
      *,
      categories(name, slug),
      profiles!items_owner_id_fkey(name, avatar_url)
    `,
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return tools || [];
}
