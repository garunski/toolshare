import { createClient } from "@/common/supabase/client";

export async function updateLoanInDatabase(
  loanId: string,
  status: string,
  message?: string,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("loans")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", loanId);

  if (error) {
    throw error;
  }

  // Add message if provided
  if (message) {
    await supabase.from("messages").insert({
      sender_id: "system",
      receiver_id: "system",
      content: message,
      loan_id: loanId,
    });
  }
}

export async function updateToolAvailability(
  toolId: string,
  isAvailable: boolean,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("tools")
    .update({ is_available: isAvailable })
    .eq("id", toolId);

  if (error) {
    throw error;
  }
}

export async function fetchLoanWithDetails(loanId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("loans")
    .select(
      `
      *,
      tools (
        id,
        name,
        owner_id,
        is_available
      ),
      profiles!loans_borrower_id_fkey (
        id,
        first_name,
        last_name
      ),
      profiles!loans_lender_id_fkey (
        id,
        first_name,
        last_name
      )
    `,
    )
    .eq("id", loanId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchUserLoans(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("loans")
    .select(
      `
      *,
      tools (
        id,
        name,
        description,
        images
      ),
      profiles!loans_borrower_id_fkey (
        id,
        first_name,
        last_name
      ),
      profiles!loans_lender_id_fkey (
        id,
        first_name,
        last_name
      )
    `,
    )
    .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`)
    .in("status", ["pending", "approved", "active"])
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
