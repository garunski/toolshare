import { Badge } from "@/primitives/badge";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface LoanSummaryCardsProps {
  pendingLoans: any[];
  activeLoansList: any[];
  activeLoans: any[];
  stats: {
    active: number;
    completed: number;
    pending: number;
  };
}

export function LoanSummaryCards({
  pendingLoans,
  activeLoansList,
  activeLoans,
  stats,
}: LoanSummaryCardsProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <Heading
            level={3}
            className="text-sm font-medium text-zinc-900 dark:text-white"
          >
            Pending Requests
          </Heading>
          <Badge color="zinc">{stats.pending}</Badge>
        </div>
        <div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.pending}
          </div>
          <Text className="text-xs text-zinc-500 dark:text-zinc-400">
            Awaiting approval
          </Text>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <Heading
            level={3}
            className="text-sm font-medium text-zinc-900 dark:text-white"
          >
            Active Loans
          </Heading>
          <Badge color="blue">{stats.active}</Badge>
        </div>
        <div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.active}
          </div>
          <Text className="text-xs text-zinc-500 dark:text-zinc-400">
            Currently borrowed
          </Text>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <Heading
            level={3}
            className="text-sm font-medium text-zinc-900 dark:text-white"
          >
            Completed
          </Heading>
          <Badge color="green">{stats.completed}</Badge>
        </div>
        <div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.completed}
          </div>
          <Text className="text-xs text-zinc-500 dark:text-zinc-400">
            Successfully returned
          </Text>
        </div>
      </div>
    </div>
  );
}
