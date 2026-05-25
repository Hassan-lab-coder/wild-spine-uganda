import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type Database = {
  public: {
    Tables: {
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
