import { getActiveLoans } from "@/app/loans/operations/loanTrackingOperationsClient";
import { createClient } from "@/common/supabase/server";

import { LoansDashboard } from "./components/LoansDashboard";

export default async function LoansPage() {
  const supabase = await createClient();

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
