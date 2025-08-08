import { createClient } from "@/common/supabase/server";

export async function getUserLoans() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get loans where user is borrower
  const { data: borrowedLoans, error: borrowedError } = await supabase
    .from("loans")
    .select(
      `
      *,
      items(
        id,
        name,
        description,
        image_url,
        profiles!items_owner_id_fkey(name, avatar_url)
      ),
      profiles!loans_borrower_id_fkey(name, avatar_url)
    `,
    )
    .eq("borrower_id", user.id)
    .order("created_at", { ascending: false });

  if (borrowedError) throw borrowedError;

  // Get loans where user is lender (owns the tools)
  const { data: lentLoans, error: lentError } = await supabase
    .from("loans")
    .select(
      `
      *,
      items!inner(
        id,
        name,
        description,
        image_url,
        owner_id
      ),
      profiles!loans_borrower_id_fkey(name, avatar_url)
    `,
    )
    .eq("items.owner_id", user.id)
    .order("created_at", { ascending: false });

  if (lentError) throw lentError;

  // Get loan statistics
  const [activeCount, completedCount, pendingCount] = await Promise.all([
    supabase
      .from("loans")
      .select("id", { count: "exact" })
      .eq("borrower_id", user.id)
      .eq("status", "active"),
    supabase
      .from("loans")
      .select("id", { count: "exact" })
      .eq("borrower_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("loans")
      .select("id", { count: "exact" })
      .eq("borrower_id", user.id)
      .eq("status", "pending"),
  ]);

  return {
    borrowedLoans: borrowedLoans || [],
    lentLoans: lentLoans || [],
    stats: {
      active: activeCount.count || 0,
      completed: completedCount.count || 0,
      pending: pendingCount.count || 0,
    },
  };
}
