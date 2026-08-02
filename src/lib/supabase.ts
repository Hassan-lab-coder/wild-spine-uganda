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
          verification_token: string;
          verification_revoked_at: string | null;
          verification_last_rotated_at: string;
          assigned_journey_planner: string | null;
          deposit_amount: number;
          non_refundable_amount: number;
          balance_due_date: string | null;
          beneficiary_legal_name: string;
          updated_at: string;
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
          verification_token?: string;
          verification_revoked_at?: string | null;
          verification_last_rotated_at?: string;
          assigned_journey_planner?: string | null;
          deposit_amount?: number;
          non_refundable_amount?: number;
          balance_due_date?: string | null;
          beneficiary_legal_name?: string;
          updated_at?: string;
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
          payment_request_id: string | null;
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
          payment_request_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["receipts"]["Insert"]>;
        Relationships: [];
      };
      inbound_emails: {
        Row: {
          id: string;
          resend_email_id: string;
          message_id: string | null;
          from_email: string;
          to_emails: string[];
          cc_emails: string[];
          bcc_emails: string[];
          subject: string | null;
          text_body: string | null;
          html_body: string | null;
          headers: Record<string, unknown> | null;
          attachments: Array<{
            id: string;
            filename: string | null;
            content_type: string | null;
            content_disposition: string | null;
            content_id: string | null;
          }> | null;
          raw_download_url: string | null;
          raw_expires_at: string | null;
          received_at: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          resend_email_id: string;
          message_id?: string | null;
          from_email: string;
          to_emails?: string[];
          cc_emails?: string[];
          bcc_emails?: string[];
          subject?: string | null;
          text_body?: string | null;
          html_body?: string | null;
          headers?: Record<string, unknown> | null;
          attachments?: Array<{
            id: string;
            filename: string | null;
            content_type: string | null;
            content_disposition: string | null;
            content_id: string | null;
          }> | null;
          raw_download_url?: string | null;
          raw_expires_at?: string | null;
          received_at?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inbound_emails"]["Insert"]>;
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
          role: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          role?: string;
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
      email_automation_events: {
        Row: {
          id: string;
          lead_id: string;
          lead_table: string;
          event_type: string;
          scheduled_for: string;
          sent_at: string | null;
          status: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          lead_table: string;
          event_type: string;
          scheduled_for: string;
          sent_at?: string | null;
          status?: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_automation_events"]["Insert"]>;
        Relationships: [];
      };
      bank_transfer_reconciliations: {
        Row: {
          id: string;
          invoice_id: string;
          bank_transaction_reference: string;
          sender_name: string;
          amount: number;
          currency: string;
          value_date: string;
          invoice_reference: string;
          status: string;
          transfer_advice_received: boolean;
          reconciled_by: string | null;
          reconciled_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          bank_transaction_reference: string;
          sender_name: string;
          amount: number;
          currency?: string;
          value_date: string;
          invoice_reference: string;
          status?: string;
          transfer_advice_received?: boolean;
          reconciled_by?: string | null;
          reconciled_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bank_transfer_reconciliations"]["Insert"]>;
        Relationships: [];
      };
      invoice_audit_events: {
        Row: {
          id: string;
          invoice_id: string | null;
          event_type: string;
          old_status: string | null;
          new_status: string | null;
          actor_id: string | null;
          actor_role: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id?: string | null;
          event_type: string;
          old_status?: string | null;
          new_status?: string | null;
          actor_id?: string | null;
          actor_role?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_audit_events"]["Insert"]>;
        Relationships: [];
      };
      financial_documents: {
        Row: {
          id: string;
          document_type: string;
          invoice_id: string | null;
          receipt_id: string | null;
          document_number: string;
          version: number;
          generated_by: string | null;
          generated_by_role: string | null;
          generated_at: string;
          verification_url: string | null;
          qr_payload: string | null;
          content_hash: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_type: string;
          invoice_id?: string | null;
          receipt_id?: string | null;
          document_number: string;
          version: number;
          generated_by?: string | null;
          generated_by_role?: string | null;
          generated_at?: string;
          verification_url?: string | null;
          qr_payload?: string | null;
          content_hash: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["financial_documents"]["Insert"]>;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      current_admin_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_finance_or_admin: {
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
