import { LoansDashboard } from "./components/LoansDashboard";
import { getUserLoans } from "./getUserLoans";

export default async function LoansPage() {
  const { borrowedLoans, lentLoans, stats } = await getUserLoans();

  // Combine all loans for the dashboard
  const allLoans = [...borrowedLoans, ...lentLoans];

  return (
    <LoansDashboard
      activeLoans={allLoans}
      borrowedLoans={borrowedLoans}
      lentLoans={lentLoans}
      stats={stats}
    />
  );
}
