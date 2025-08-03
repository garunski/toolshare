import { supabase } from "@/common/supabase";

export async function submitLoanRequest(data: any, userId: string, tool: any) {
  const client = supabase;

  const { error } = await supabase.from("loans").insert({
    tool_id: data.tool_id,
    borrower_id: userId,
    lender_id: tool.owner_id,
    start_date: data.start_date.toISOString().split("T")[0],
    end_date: data.end_date.toISOString().split("T")[0],
    status: "pending",
  });

  if (error) {
    throw error;
  }

  // Add message if provided
  if (data.message) {
    await supabase.from("messages").insert({
      sender_id: userId,
      receiver_id: tool.owner_id,
      content: data.message,
      loan_id: tool.id, // This will be updated with actual loan ID
    });
  }
}
