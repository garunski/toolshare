import { useCallback, useEffect, useState } from "react";

import { RealtimeConnectionManager } from "@/common/operations/realtimeConnectionManager";
import { createClient } from "@/common/supabase/client";

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalCategories: number;
  activeLoans: number;
  recentActivity: any[];
}

export function useRealtimeAdminData() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalItems: 0,
    totalCategories: 0,
    activeLoans: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadInitialData = useCallback(async () => {
    try {
      const supabase = createClient();
      const [users, items, categories, loans, activity] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("items").select("id", { count: "exact" }),
        supabase
          .from("external_product_taxonomy")
          .select("external_id", { count: "exact" }),
        supabase
          .from("loan_requests")
          .select("id", { count: "exact" })
          .eq("status", "active"),
        supabase
          .from("activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalItems: items.count || 0,
        totalCategories: categories.count || 0,
        activeLoans: loans.count || 0,
        recentActivity: activity.data || [],
      });
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRealtimeUpdate = useCallback((data: any) => {
    setLastUpdate(new Date());

    switch (data.type) {
      case "users":
        if (data.payload.eventType === "INSERT") {
          setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
        } else if (data.payload.eventType === "DELETE") {
          setStats((prev) => ({
            ...prev,
            totalUsers: Math.max(0, prev.totalUsers - 1),
          }));
        }
        break;

      case "items":
        if (data.payload.eventType === "INSERT") {
          setStats((prev) => ({ ...prev, totalItems: prev.totalItems + 1 }));
        } else if (data.payload.eventType === "DELETE") {
          setStats((prev) => ({
            ...prev,
            totalItems: Math.max(0, prev.totalItems - 1),
          }));
        }
        break;

      case "categories":
        if (data.payload.eventType === "INSERT") {
          setStats((prev) => ({
            ...prev,
            totalCategories: prev.totalCategories + 1,
          }));
        } else if (data.payload.eventType === "DELETE") {
          setStats((prev) => ({
            ...prev,
            totalCategories: Math.max(0, prev.totalCategories - 1),
          }));
        }
        break;

      case "loans":
        if (
          data.payload.eventType === "INSERT" &&
          data.payload.new.status === "active"
        ) {
          setStats((prev) => ({ ...prev, activeLoans: prev.activeLoans + 1 }));
        } else if (
          data.payload.eventType === "UPDATE" &&
          data.payload.new.status !== "active"
        ) {
          setStats((prev) => ({
            ...prev,
            activeLoans: Math.max(0, prev.activeLoans - 1),
          }));
        }
        break;
    }
  }, []);

  useEffect(() => {
    loadInitialData();

    const unsubscribe =
      RealtimeConnectionManager.subscribeToAdminUpdates(handleRealtimeUpdate);

    return () => {
      unsubscribe();
    };
  }, [loadInitialData, handleRealtimeUpdate]);

  return {
    stats,
    loading,
    lastUpdate,
    refresh: loadInitialData,
  };
}
