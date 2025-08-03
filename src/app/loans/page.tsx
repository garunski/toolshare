import { getActiveLoans } from "@/common/operations/loanStatusTracker";
import { supabase } from "@/common/supabase";

import { LoansDashboard } from "./components/LoansDashboard";

export default async function LoansPage() {
  const client = supabase;

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your loans.</div>;
  }

  // Get active loans
  const activeLoans = await getActiveLoans(user.id);

  return <LoansDashboard activeLoans={activeLoans} userId={user.id} />;
}
