import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type Database = {
  public: {
    Tables: {
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          client_name: string;
          client_email: string | null;
          client_phone: string | null;
          trip_name: string | null;
          issue_date: string;
          due_date: string | null;
          currency: string;
          subtotal: number;
          tax: number;
          total: number;
          status: string;
          notes: string | null;
          line_items: Array<{ description: string; quantity: number; unit_price: number; total: number }>;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          client_name: string;
          client_email?: string | null;
          client_phone?: string | null;
          trip_name?: string | null;
          issue_date?: string;
          due_date?: string | null;
          currency?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          status?: string;
          notes?: string | null;
          line_items?: Array<{ description: string; quantity: number; unit_price: number; total: number }>;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: [];
      };
      receipts: {
        Row: {
          id: string;
          receipt_number: string;
          invoice_id: string | null;
          invoice_number: string | null;
          client_name: string;
          client_email: string | null;
          payment_date: string;
          currency: string;
          amount: number;
          payment_method: string;
          reference: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          receipt_number: string;
          invoice_id?: string | null;
          invoice_number?: string | null;
          client_name: string;
          client_email?: string | null;
          payment_date?: string;
          currency?: string;
          amount: number;
          payment_method?: string;
          reference?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["receipts"]["Insert"]>;
        Relationships: [];
      };
      itinerary_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          country: string | null;
          travel_month: string | null;
          route: string | null;
          message: string | null;
          status: string;
          lead_source: string | null;
          admin_notes: string | null;
          follow_up_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          country?: string | null;
          travel_month?: string | null;
          route?: string | null;
          message?: string | null;
          status?: string;
          lead_source?: string | null;
          admin_notes?: string | null;
          follow_up_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["itinerary_requests"]["Insert"]>;
        Relationships: [];
      };
      guide_leads: {
        Row: {
          id: string;
          email: string;
          source: string;
          status: string;
          admin_notes: string | null;
          follow_up_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          status?: string;
          admin_notes?: string | null;
          follow_up_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guide_leads"]["Insert"]>;
        Relationships: [];
      };
      volunteer_applications: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          country: string | null;
          program: string | null;
          motivation: string | null;
          status: string;
          lead_source: string | null;
          admin_notes: string | null;
          follow_up_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          country?: string | null;
          program?: string | null;
          motivation?: string | null;
          status?: string;
          lead_source?: string | null;
          admin_notes?: string | null;
          follow_up_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["volunteer_applications"]["Insert"]>;
        Relationships: [];
      };
      admin_users: {
        Row: {
          user_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          event_name: string;
          page_path: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          page_path?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
