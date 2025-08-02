export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  owner_id: string;
  is_available: boolean;
  location?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ToolSearchFilters {
  category?: string;
  condition?: string;
  location?: string;
  available?: boolean;
} 