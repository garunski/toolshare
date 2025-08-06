import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";

interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "error";
  message: string;
  timestamp: Date;
}

interface HealthCheckItemProps {
  check: HealthCheck;
}

export function HealthCheckItem({ check }: HealthCheckItemProps) {
  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheck["status"]) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
      <div className="flex items-center space-x-3">
        {getStatusIcon(check.status)}
        <div>
          <span className="font-medium">{check.name}</span>
          <p className="text-sm text-gray-600">{check.message}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {getStatusBadge(check.status)}
        <span className="text-xs text-gray-500">
          {check.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
