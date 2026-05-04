export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          color: string;
          monthly_profit_goal: number | null;
          is_admin: boolean;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          color?: string;
          monthly_profit_goal?: number | null;
          is_admin?: boolean;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          color?: string;
          monthly_profit_goal?: number | null;
          is_admin?: boolean;
          is_approved?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          message: string;
          type: "info" | "warning" | "danger";
          is_active: boolean;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          message: string;
          type?: "info" | "warning" | "danger";
          is_active?: boolean;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          message?: string;
          type?: "info" | "warning" | "danger";
          is_active?: boolean;
          created_by?: string | null;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          created_by: string;
          category: Database["public"]["Enums"]["article_category"];
          name: string;
          brand: string | null;
          reference: string | null;
          serial_number: string | null;
          size: string | null;
          colorway: string | null;
          condition: Database["public"]["Enums"]["article_condition"];
          has_certificate: boolean;
          certificate_number: string | null;
          has_original_box: boolean;
          has_accessories: boolean;
          accessories_description: string | null;
          notes: string | null;
          tags: string[];
          status: Database["public"]["Enums"]["article_status"];
          photos: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          category: Database["public"]["Enums"]["article_category"];
          name: string;
          brand?: string | null;
          reference?: string | null;
          serial_number?: string | null;
          size?: string | null;
          colorway?: string | null;
          condition?: Database["public"]["Enums"]["article_condition"];
          has_certificate?: boolean;
          certificate_number?: string | null;
          has_original_box?: boolean;
          has_accessories?: boolean;
          accessories_description?: string | null;
          notes?: string | null;
          tags?: string[];
          status?: Database["public"]["Enums"]["article_status"];
          photos?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          category?: Database["public"]["Enums"]["article_category"];
          name?: string;
          brand?: string | null;
          reference?: string | null;
          serial_number?: string | null;
          size?: string | null;
          colorway?: string | null;
          condition?: Database["public"]["Enums"]["article_condition"];
          has_certificate?: boolean;
          certificate_number?: string | null;
          has_original_box?: boolean;
          has_accessories?: boolean;
          accessories_description?: string | null;
          notes?: string | null;
          tags?: string[];
          status?: Database["public"]["Enums"]["article_status"];
          photos?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          article_id: string;
          buyer_id: string;
          purchase_date: string;
          purchase_price: number;
          purchase_platform: string | null;
          seller_name: string | null;
          shipping_cost_in: number;
          packaging_cost: number;
          authentication_cost: number;
          other_costs: number;
          notes: string | null;
          invoice_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          buyer_id: string;
          purchase_date: string;
          purchase_price: number;
          purchase_platform?: string | null;
          seller_name?: string | null;
          shipping_cost_in?: number;
          packaging_cost?: number;
          authentication_cost?: number;
          other_costs?: number;
          notes?: string | null;
          invoice_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          buyer_id?: string;
          purchase_date?: string;
          purchase_price?: number;
          purchase_platform?: string | null;
          seller_name?: string | null;
          shipping_cost_in?: number;
          packaging_cost?: number;
          authentication_cost?: number;
          other_costs?: number;
          notes?: string | null;
          invoice_url?: string | null;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          article_id: string;
          seller_id: string;
          sale_date: string;
          sale_price: number;
          sale_platform: string | null;
          buyer_name: string | null;
          shipping_cost_out: number;
          platform_fees_pct: number;
          platform_fees_amount: number;
          other_fees: number;
          payment_method: string | null;
          tracking_number: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          seller_id: string;
          sale_date: string;
          sale_price: number;
          sale_platform?: string | null;
          buyer_name?: string | null;
          shipping_cost_out?: number;
          platform_fees_pct?: number;
          platform_fees_amount?: number;
          other_fees?: number;
          payment_method?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          seller_id?: string;
          sale_date?: string;
          sale_price?: number;
          sale_platform?: string | null;
          buyer_name?: string | null;
          shipping_cost_out?: number;
          platform_fees_pct?: number;
          platform_fees_amount?: number;
          other_fees?: number;
          payment_method?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          description?: string;
          amount?: number;
          date?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: "INSERT" | "UPDATE" | "DELETE";
          user_id: string | null;
          changes: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: "INSERT" | "UPDATE" | "DELETE";
          user_id?: string | null;
          changes?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          platforms: string[];
          categories: string[];
          monthly_profit_goal: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          platforms?: string[];
          categories?: string[];
          monthly_profit_goal?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          platforms?: string[];
          categories?: string[];
          monthly_profit_goal?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      article_profit: {
        Row: {
          article_id: string | null;
          name: string | null;
          category: Database["public"]["Enums"]["article_category"] | null;
          status: Database["public"]["Enums"]["article_status"] | null;
          buyer_id: string | null;
          seller_id: string | null;
          purchase_price: number | null;
          total_cost: number | null;
          sale_price: number | null;
          platform_fees_amount: number | null;
          net_revenue: number | null;
          net_profit: number | null;
          roi_pct: number | null;
          days_held: number | null;
          purchase_date: string | null;
          sale_date: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      delete_user_cascade: {
        Args: { target_user: string };
        Returns: void;
      };
    };
    Enums: {
      article_category: "sneakers" | "cards" | "watches" | "other";
      article_condition:
        | "new_unworn"
        | "new_with_tags"
        | "very_good"
        | "good"
        | "fair"
        | "poor";
      article_status: "in_stock" | "reserved" | "sold" | "returned";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
