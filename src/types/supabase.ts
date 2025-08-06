export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      attribute_definitions: {
        Row: {
          created_at: string | null;
          data_type: string;
          default_value: string | null;
          description: string | null;
          display_label: string;
          display_order: number | null;
          help_text: string | null;
          id: string;
          is_filterable: boolean | null;
          is_required: boolean | null;
          is_searchable: boolean | null;
          name: string;
          options: Json | null;
          updated_at: string | null;
          validation_rules: Json | null;
        };
        Insert: {
          created_at?: string | null;
          data_type: string;
          default_value?: string | null;
          description?: string | null;
          display_label: string;
          display_order?: number | null;
          help_text?: string | null;
          id?: string;
          is_filterable?: boolean | null;
          is_required?: boolean | null;
          is_searchable?: boolean | null;
          name: string;
          options?: Json | null;
          updated_at?: string | null;
          validation_rules?: Json | null;
        };
        Update: {
          created_at?: string | null;
          data_type?: string;
          default_value?: string | null;
          description?: string | null;
          display_label?: string;
          display_order?: number | null;
          help_text?: string | null;
          id?: string;
          is_filterable?: boolean | null;
          is_required?: boolean | null;
          is_searchable?: boolean | null;
          name?: string;
          options?: Json | null;
          updated_at?: string | null;
          validation_rules?: Json | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          color: string | null;
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          is_active: boolean | null;
          metadata: Json | null;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number | null;
          updated_at: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          metadata?: Json | null;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          metadata?: Json | null;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      category_attributes: {
        Row: {
          attribute_definition_id: string;
          category_id: string;
          category_specific_validation: Json | null;
          created_at: string | null;
          display_order: number | null;
          id: string;
          is_required: boolean | null;
        };
        Insert: {
          attribute_definition_id: string;
          category_id: string;
          category_specific_validation?: Json | null;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          is_required?: boolean | null;
        };
        Update: {
          attribute_definition_id?: string;
          category_id?: string;
          category_specific_validation?: Json | null;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          is_required?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "category_attributes_attribute_definition_id_fkey";
            columns: ["attribute_definition_id"];
            isOneToOne: false;
            referencedRelation: "attribute_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "category_attributes_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      friend_requests: {
        Row: {
          created_at: string | null;
          id: string;
          message: string | null;
          receiver_id: string;
          sender_id: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          message?: string | null;
          receiver_id: string;
          sender_id: string;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          message?: string | null;
          receiver_id?: string;
          sender_id?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      items: {
        Row: {
          attributes: Json | null;
          category_id: string;
          condition: string;
          created_at: string | null;
          description: string | null;
          id: string;
          images: string[] | null;
          is_available: boolean | null;
          is_public: boolean | null;
          is_shareable: boolean | null;
          location: string | null;
          name: string;
          owner_id: string;
          search_vector: unknown | null;
          tags: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          attributes?: Json | null;
          category_id: string;
          condition: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          images?: string[] | null;
          is_available?: boolean | null;
          is_public?: boolean | null;
          is_shareable?: boolean | null;
          location?: string | null;
          name: string;
          owner_id: string;
          search_vector?: unknown | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          attributes?: Json | null;
          category_id?: string;
          condition?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          images?: string[] | null;
          is_available?: boolean | null;
          is_public?: boolean | null;
          is_shareable?: boolean | null;
          location?: string | null;
          name?: string;
          owner_id?: string;
          search_vector?: unknown | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "items_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      loan_ratings: {
        Row: {
          comment: string | null;
          created_at: string | null;
          id: string;
          loan_id: string;
          rated_user_id: string;
          rater_id: string;
          rating: number;
        };
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          loan_id: string;
          rated_user_id: string;
          rater_id: string;
          rating: number;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          loan_id?: string;
          rated_user_id?: string;
          rater_id?: string;
          rating?: number;
        };
        Relationships: [
          {
            foreignKeyName: "loan_ratings_loan_id_fkey";
            columns: ["loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loan_ratings_rated_user_id_fkey";
            columns: ["rated_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loan_ratings_rater_id_fkey";
            columns: ["rater_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      loans: {
        Row: {
          actual_return_date: string | null;
          borrower_id: string;
          created_at: string | null;
          end_date: string;
          id: string;
          lender_id: string;
          notes: string | null;
          start_date: string;
          status: string;
          tool_id: string;
          updated_at: string | null;
        };
        Insert: {
          actual_return_date?: string | null;
          borrower_id: string;
          created_at?: string | null;
          end_date: string;
          id?: string;
          lender_id: string;
          notes?: string | null;
          start_date: string;
          status: string;
          tool_id: string;
          updated_at?: string | null;
        };
        Update: {
          actual_return_date?: string | null;
          borrower_id?: string;
          created_at?: string | null;
          end_date?: string;
          id?: string;
          lender_id?: string;
          notes?: string | null;
          start_date?: string;
          status?: string;
          tool_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "loans_borrower_id_fkey";
            columns: ["borrower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_lender_id_fkey";
            columns: ["lender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_tool_id_fkey";
            columns: ["tool_id"];
            isOneToOne: false;
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          loan_id: string | null;
          receiver_id: string;
          sender_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          loan_id?: string | null;
          receiver_id: string;
          sender_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          loan_id?: string | null;
          receiver_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_loan_id_fkey";
            columns: ["loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      permissions: {
        Row: {
          action: string;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          resource: string;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          resource: string;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          resource?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          first_name: string;
          id: string;
          last_name: string;
          phone: string | null;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          first_name: string;
          id: string;
          last_name: string;
          phone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          phone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          created_at: string | null;
          id: string;
          permission_id: string;
          role_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          permission_id: string;
          role_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          permission_id?: string;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_system_role: boolean | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_system_role?: boolean | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_system_role?: boolean | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      social_connections: {
        Row: {
          created_at: string | null;
          friend_id: string;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          friend_id: string;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          friend_id?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_connections_friend_id_fkey";
            columns: ["friend_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tools: {
        Row: {
          category: string;
          condition: string;
          created_at: string | null;
          description: string | null;
          id: string;
          images: string[] | null;
          is_available: boolean | null;
          location: string | null;
          name: string;
          owner_id: string;
          updated_at: string | null;
        };
        Insert: {
          category: string;
          condition: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          images?: string[] | null;
          is_available?: boolean | null;
          location?: string | null;
          name: string;
          owner_id: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string;
          condition?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          images?: string[] | null;
          is_available?: boolean | null;
          location?: string | null;
          name?: string;
          owner_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tools_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_reputation: {
        Row: {
          average_rating: number | null;
          created_at: string | null;
          failed_loans: number | null;
          id: string;
          successful_loans: number | null;
          total_loans: number | null;
          trust_score: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          average_rating?: number | null;
          created_at?: string | null;
          failed_loans?: number | null;
          id?: string;
          successful_loans?: number | null;
          total_loans?: number | null;
          trust_score?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          average_rating?: number | null;
          created_at?: string | null;
          failed_loans?: number | null;
          id?: string;
          successful_loans?: number | null;
          total_loans?: number | null;
          trust_score?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_reputation_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          assigned_at: string | null;
          assigned_by: string | null;
          expires_at: string | null;
          id: string;
          is_active: boolean | null;
          role_id: string;
          user_id: string;
        };
        Insert: {
          assigned_at?: string | null;
          assigned_by?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          role_id: string;
          user_id: string;
        };
        Update: {
          assigned_at?: string | null;
          assigned_by?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          role_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_friend_request: {
        Args: { request_id: string };
        Returns: undefined;
      };
      get_category_path: {
        Args: { category_uuid: string };
        Returns: string;
      };
      get_user_roles: {
        Args: { user_uuid: string };
        Returns: {
          role_description: string;
          role_name: string;
        }[];
      };
      reject_friend_request: {
        Args: { request_id: string };
        Returns: undefined;
      };
      user_has_permission: {
        Args: { permission_name: string; user_uuid: string };
        Returns: boolean;
      };
      validate_item_attributes: {
        Args: { category_uuid: string; item_attributes: Json };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
