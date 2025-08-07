export interface GDPRResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserDataExport {
  profile: any;
  items: any[];
  loans: any[];
  messages: any[];
  audit_log: any[];
}

export interface DataDeletionResult {
  success: boolean;
  deletedTables: string[];
  errors: string[];
}
