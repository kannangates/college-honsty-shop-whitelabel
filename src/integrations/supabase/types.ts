export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      badge_progress: {
        Row: {
          badge_id: string | null
          current_progress: number | null
          last_updated: string | null
          target_progress: number | null
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          current_progress?: number | null
          last_updated?: string | null
          target_progress?: number | null
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          current_progress?: number | null
          last_updated?: string | null
          target_progress?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badge_progress_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          badge_type: string | null
          condition: Json | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_points: number
          name: string
        }
        Insert: {
          badge_type?: string | null
          condition?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_points: number
          name: string
        }
        Update: {
          badge_type?: string | null
          condition?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_points?: number
          name?: string
        }
        Relationships: []
      }
      college_settings: {
        Row: {
          address: string | null
          college_name: string
          contact_number: string | null
          created_at: string | null
          grievance_poc_email: string | null
          grievance_poc_name: string | null
          grievance_poc_phone: string | null
          id: string
          logo_url: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          college_name: string
          contact_number?: string | null
          created_at?: string | null
          grievance_poc_email?: string | null
          grievance_poc_name?: string | null
          grievance_poc_phone?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          college_name?: string
          contact_number?: string | null
          created_at?: string | null
          grievance_poc_email?: string | null
          grievance_poc_name?: string | null
          grievance_poc_phone?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_stock_operations: {
        Row: {
          actual_closing_stock: number | null
          additional_stock: number | null
          created_at: string | null
          estimated_closing_stock: number | null
          id: string
          opening_stock: number
          order_count: number
          product_id: string | null
          sales: number | null
          stolen_stock: number | null
          warehouse_stock: number | null
          wastage_stock: number
        }
        Insert: {
          actual_closing_stock?: number | null
          additional_stock?: number | null
          created_at?: string | null
          estimated_closing_stock?: number | null
          id?: string
          opening_stock: number
          order_count?: number
          product_id?: string | null
          sales?: number | null
          stolen_stock?: number | null
          warehouse_stock?: number | null
          wastage_stock: number
        }
        Update: {
          actual_closing_stock?: number | null
          additional_stock?: number | null
          created_at?: string | null
          estimated_closing_stock?: number | null
          id?: string
          opening_stock?: number
          order_count?: number
          product_id?: string | null
          sales?: number | null
          stolen_stock?: number | null
          warehouse_stock?: number | null
          wastage_stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_event_logs: {
        Row: {
          badge_id: string | null
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
          points_awarded: number | null
          rule_id: string | null
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          points_awarded?: number | null
          rule_id?: string | null
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          points_awarded?: number | null
          rule_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gamification_event_logs_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gamification_event_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "gamification_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_rules: {
        Row: {
          active: boolean
          condition_type: string
          condition_value: string
          cooldown_seconds: number | null
          created_at: string | null
          event_type: string
          id: string
          label: string | null
          operator: string
          points_awarded: number
        }
        Insert: {
          active?: boolean
          condition_type: string
          condition_value: string
          cooldown_seconds?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          label?: string | null
          operator: string
          points_awarded: number
        }
        Update: {
          active?: boolean
          condition_type?: string
          condition_value?: string
          cooldown_seconds?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          label?: string | null
          operator?: string
          points_awarded?: number
        }
        Relationships: []
      }
      honesty_log: {
        Row: {
          choice: string
          created_at: string | null
          id: string
          order_id: string | null
          user_id: string | null
        }
        Insert: {
          choice: string
          created_at?: string | null
          id?: string
          order_id?: string | null
          user_id?: string | null
        }
        Update: {
          choice?: string
          created_at?: string | null
          id?: string
          order_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "honesty_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "honesty_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          created_at: string | null
          gmail_client_id_hash: string | null
          gmail_client_secret_hash: string | null
          gmail_refresh_token_hash: string | null
          gmail_user_hash: string | null
          id: string
          payment_qr_url: string | null
          razorpay_api_key_hash: string | null
          razorpay_webhook_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          gmail_client_id_hash?: string | null
          gmail_client_secret_hash?: string | null
          gmail_refresh_token_hash?: string | null
          gmail_user_hash?: string | null
          id?: string
          payment_qr_url?: string | null
          razorpay_api_key_hash?: string | null
          razorpay_webhook_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          gmail_client_id_hash?: string | null
          gmail_client_secret_hash?: string | null
          gmail_refresh_token_hash?: string | null
          gmail_user_hash?: string | null
          id?: string
          payment_qr_url?: string | null
          razorpay_api_key_hash?: string | null
          razorpay_webhook_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      n8n_webhooks: {
        Row: {
          created_at: string
          id: string
          last_called_at: string | null
          last_error: string | null
          last_status: string | null
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_called_at?: string | null
          last_error?: string | null
          last_status?: string | null
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          last_called_at?: string | null
          last_error?: string | null
          last_status?: string | null
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      notification_reads: {
        Row: {
          id: string
          is_read: boolean | null
          notification_id: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_read?: boolean | null
          notification_id?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_read?: boolean | null
          notification_id?: string | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          department: string[] | null
          id: string
          is_pinned: boolean | null
          is_read: boolean | null
          pin_till: string | null
          reach_count: number | null
          shared_count: number | null
          target_user_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          body: string
          created_at?: string | null
          department?: string[] | null
          id?: string
          is_pinned?: boolean | null
          is_read?: boolean | null
          pin_till?: string | null
          reach_count?: number | null
          shared_count?: number | null
          target_user_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          body?: string
          created_at?: string | null
          department?: string[] | null
          id?: string
          is_pinned?: boolean | null
          is_read?: boolean | null
          pin_till?: string | null
          reach_count?: number | null
          shared_count?: number | null
          target_user_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          friendly_id: string | null
          id: string
          paid_at: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          total_amount: number
          transaction_id: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          friendly_id?: string | null
          id?: string
          paid_at?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          total_amount: number
          transaction_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          friendly_id?: string | null
          id?: string
          paid_at?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          total_amount?: number
          transaction_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string | null
          paid_at: string
          payment_method: string | null
          transaction_id: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id?: string | null
          paid_at?: string
          payment_method?: string | null
          transaction_id: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          paid_at?: string
          payment_method?: string | null
          transaction_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      points_config: {
        Row: {
          after_72h_points: number | null
          created_at: string | null
          id: string
          immediate_payment_points: number | null
          updated_at: string | null
          within_30h_points: number | null
          within_48h_points: number | null
          within_72h_points: number | null
        }
        Insert: {
          after_72h_points?: number | null
          created_at?: string | null
          id?: string
          immediate_payment_points?: number | null
          updated_at?: string | null
          within_30h_points?: number | null
          within_48h_points?: number | null
          within_72h_points?: number | null
        }
        Update: {
          after_72h_points?: number | null
          created_at?: string | null
          id?: string
          immediate_payment_points?: number | null
          updated_at?: string | null
          within_30h_points?: number | null
          within_48h_points?: number | null
          within_72h_points?: number | null
        }
        Relationships: []
      }
      points_log: {
        Row: {
          created_at: string | null
          id: string
          points: number
          reason: string
          related_order_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          points: number
          reason: string
          related_order_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          reason?: string
          related_order_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "points_log_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          is_archived: boolean | null
          name: string
          opening_stock: number
          shelf_stock: number | null
          status: string | null
          unit_price: number
          updated_at: string | null
          updated_by: string | null
          warehouse_stock: number | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          name: string
          opening_stock?: number
          shelf_stock?: number | null
          status?: string | null
          unit_price: number
          updated_at?: string | null
          updated_by?: string | null
          warehouse_stock?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          name?: string
          opening_stock?: number
          shelf_stock?: number | null
          status?: string | null
          unit_price?: number
          updated_at?: string | null
          updated_by?: string | null
          warehouse_stock?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_cooldowns: {
        Row: {
          id: string
          last_triggered_at: string
          rule_id: string
          user_id: string
        }
        Insert: {
          id?: string
          last_triggered_at: string
          rule_id: string
          user_id: string
        }
        Update: {
          id?: string
          last_triggered_at?: string
          rule_id?: string
          user_id?: string
        }
        Relationships: []
      }
      top_departments: {
        Row: {
          department: string
          id: string
          is_archived: boolean | null
          points: number
          rank: number
          updated_at: string | null
        }
        Insert: {
          department: string
          id?: string
          is_archived?: boolean | null
          points: number
          rank: number
          updated_at?: string | null
        }
        Update: {
          department?: string
          id?: string
          is_archived?: boolean | null
          points?: number
          rank?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      top_students: {
        Row: {
          department: string
          id: string
          is_archived: boolean | null
          name: string
          points: number
          rank: number
          student_id: string
          updated_at: string | null
        }
        Insert: {
          department: string
          id?: string
          is_archived?: boolean | null
          name: string
          points: number
          rank: number
          student_id: string
          updated_at?: string | null
        }
        Update: {
          department?: string
          id?: string
          is_archived?: boolean | null
          name?: string
          points?: number
          rank?: number
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          id: string
          last_signed_in_at: string | null
          mobile_number: string | null
          name: string
          points: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          shift: string
          status: string
          student_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          id: string
          last_signed_in_at?: string | null
          mobile_number?: string | null
          name: string
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          shift?: string
          status?: string
          student_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          last_signed_in_at?: string | null
          mobile_number?: string | null
          name?: string
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          shift?: string
          status?: string
          student_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      whitelabel_config: {
        Row: {
          config: Json
          id: number
          updated_at: string | null
        }
        Insert: {
          config: Json
          id?: number
          updated_at?: string | null
        }
        Update: {
          config?: Json
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_by_student_id: {
        Args: { _student_id: string; _password: string }
        Returns: {
          user_id: string
          email: string
          user_data: Json
        }[]
      }
      generate_friendly_order_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_function_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          function_name: string
          return_type: string
          argument_types: string
        }[]
      }
      get_policy_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          policy_name: string
          policy_command: string
          policy_roles: string[]
        }[]
      }
      get_table_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          column_count: number
          columns: Json
        }[]
      }
      get_todays_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          todays_orders: number
          todays_paid_orders: number
          total_revenue: number
          todays_unique_customers: number
          todays_sold_products: Json
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      refresh_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_top_departments_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_top_students_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      notification_type:
        | "top_rank_change"
        | "badge_earned"
        | "announcement"
        | "payment_reminder"
      payment_mode: "qr_manual" | "razorpay" | "pay_later"
      payment_status: "paid" | "unpaid"
      user_role: "admin" | "student" | "teacher" | "developer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_type: [
        "top_rank_change",
        "badge_earned",
        "announcement",
        "payment_reminder",
      ],
      payment_mode: ["qr_manual", "razorpay", "pay_later"],
      payment_status: ["paid", "unpaid"],
      user_role: ["admin", "student", "teacher", "developer"],
    },
  },
} as const
