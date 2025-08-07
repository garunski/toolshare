export interface RetentionPolicy {
  table: string;
  retentionDays: number;
  archiveBeforeDelete: boolean;
  conditions?: Record<string, any>;
}

export interface RetentionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RetentionStats {
  processed: number;
  archived: number;
  deleted: number;
}

export const retentionPolicies: RetentionPolicy[] = [
  { table: "audit_log", retentionDays: 2555, archiveBeforeDelete: true },
  { table: "search_analytics", retentionDays: 365, archiveBeforeDelete: false },
  { table: "activity_log", retentionDays: 90, archiveBeforeDelete: false },
  {
    table: "notifications",
    retentionDays: 30,
    archiveBeforeDelete: false,
    conditions: { read: true },
  },
];
