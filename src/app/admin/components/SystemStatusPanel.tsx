import { ArrowPathIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";

interface SystemTask {
  title: string;
  status: "up-to-date" | "healthy" | "warning" | "error";
  description: string;
}

interface SystemStatusPanelProps {
  systemTasks: SystemTask[];
  refreshing: boolean;
  onRefresh: () => void;
}

export function SystemStatusPanel({
  systemTasks,
  refreshing,
  onRefresh,
}: SystemStatusPanelProps) {
  const getStatusColor = (
    status: "up-to-date" | "healthy" | "warning" | "error",
  ) => {
    switch (status) {
      case "up-to-date":
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <Heading level={3}>System Status</Heading>
        <Button outline onClick={onRefresh} disabled={refreshing}>
          {refreshing ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowPathIcon className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {systemTasks.map((task) => (
          <div
            key={task.title}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
          >
            <div className="flex-1">
              <div className="text-sm font-medium">{task.title}</div>
              <div className="text-xs text-gray-600">{task.description}</div>
            </div>
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace("-", " ")}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
