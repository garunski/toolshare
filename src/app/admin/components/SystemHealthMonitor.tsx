"use client";

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";

import { HealthCheckOperations } from "./HealthCheckOperations";
import { HealthCheckItem } from "./HealthCheckItem";

interface HealthCheck {
  name: string;
  status: "healthy" | "warning" | "error";
  message: string;
  timestamp: Date;
}

export function SystemHealthMonitor() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const runHealthChecks = async () => {
    setLoading(true);
    try {
      const checks = await HealthCheckOperations.runAllHealthChecks();
      setHealthChecks(checks);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to run health checks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runHealthChecks();

    // Auto-refresh every 5 minutes
    const interval = setInterval(runHealthChecks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);



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

  const overallStatus = healthChecks.some((check) => check.status === "error") ? "error" :
                      healthChecks.some((check) => check.status === "warning") ? "warning" : "healthy";

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon(overallStatus)}
          <Heading level={3}>System Health</Heading>
          {getStatusBadge(overallStatus)}
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last check: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            outline
            onClick={runHealthChecks}
            disabled={loading}
          >
            {loading ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowPathIcon className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {loading && healthChecks.length === 0 ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-gray-200"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {healthChecks.map((check, index) => (
            <HealthCheckItem key={index} check={check} />
          ))}
        </div>
      )}
    </div>
  );
} 