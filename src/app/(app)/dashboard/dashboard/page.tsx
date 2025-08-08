import { DashboardContent } from "./components/DashboardContent";
import { getDashboardData } from "./getDashboardData";

export default async function DashboardPage() {
  const { user, isAdmin } = await getDashboardData();

  return <DashboardContent user={user} isAdmin={isAdmin} />;
}
