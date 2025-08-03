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
      friend_requests: {
        Row: {
          created_at: string | null;
          id: string;
          message: string | null;
          receiver_id: string;
          sender_id: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          message?: string | null;
          receiver_id: string;
          sender_id: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          message?: string | null;
          receiver_id?: string;
          sender_id?: string;
          status?: string | null;
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
          borrower_id: string;
          created_at: string | null;
          end_date: string | null;
          id: string;
          lender_id: string;
          start_date: string | null;
          status: string | null;
          tool_id: string;
          updated_at: string | null;
        };
        Insert: {
          borrower_id: string;
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          lender_id: string;
          start_date?: string | null;
          status?: string | null;
          tool_id: string;
          updated_at?: string | null;
        };
        Update: {
          borrower_id?: string;
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          lender_id?: string;
          start_date?: string | null;
          status?: string | null;
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
          loan_id: string | null;
          receiver_id: string;
          sender_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          loan_id?: string | null;
          receiver_id: string;
          sender_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
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
      profiles: {
        Row: {
          address: string | null;
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
          category: string | null;
          condition: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          images: string[] | null;
          is_available: boolean | null;
          name: string;
          owner_id: string;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          condition?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          images?: string[] | null;
          is_available?: boolean | null;
          name: string;
          owner_id: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          condition?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          images?: string[] | null;
          is_available?: boolean | null;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_friend_request: {
        Args: { request_id: string };
        Returns: undefined;
      };
      reject_friend_request: {
        Args: { request_id: string };
        Returns: undefined;
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
