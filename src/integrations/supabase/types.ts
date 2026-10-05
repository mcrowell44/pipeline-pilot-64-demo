export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      lead_activity: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["activity_kind"]
          lead_id: string
          occurred_at: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["activity_kind"]
          lead_id: string
          occurred_at?: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["activity_kind"]
          lead_id?: string
          occurred_at?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activity_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          brand: Database["public"]["Enums"]["brand"]
          city: string | null
          company: string
          contact_name: string | null
          country: string
          created_at: string
          email: string | null
          geo: string | null
          ghl_contact_id: string | null
          id: string
          last_touch_at: string | null
          lead_type: Database["public"]["Enums"]["lead_type"] | null
          next_step: string | null
          next_step_due: string | null
          notes: string | null
          owner_id: string | null
          pay_range: string | null
          phone: string | null
          play: Database["public"]["Enums"]["play"]
          priority: Database["public"]["Enums"]["priority"]
          role_title: string | null
          scan_date: string | null
          scan_source: string | null
          stage: Database["public"]["Enums"]["stage"]
          state: string | null
          tech: string | null
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          brand?: Database["public"]["Enums"]["brand"]
          city?: string | null
          company: string
          contact_name?: string | null
          country?: string
          created_at?: string
          email?: string | null
          geo?: string | null
          ghl_contact_id?: string | null
          id?: string
          last_touch_at?: string | null
          lead_type?: Database["public"]["Enums"]["lead_type"] | null
          next_step?: string | null
          next_step_due?: string | null
          notes?: string | null
          owner_id?: string | null
          pay_range?: string | null
          phone?: string | null
          play?: Database["public"]["Enums"]["play"]
          priority?: Database["public"]["Enums"]["priority"]
          role_title?: string | null
          scan_date?: string | null
          scan_source?: string | null
          stage?: Database["public"]["Enums"]["stage"]
          state?: string | null
          tech?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          brand?: Database["public"]["Enums"]["brand"]
          city?: string | null
          company?: string
          contact_name?: string | null
          country?: string
          created_at?: string
          email?: string | null
          geo?: string | null
          ghl_contact_id?: string | null
          id?: string
          last_touch_at?: string | null
          lead_type?: Database["public"]["Enums"]["lead_type"] | null
          next_step?: string | null
          next_step_due?: string | null
          notes?: string | null
          owner_id?: string | null
          pay_range?: string | null
          phone?: string | null
          play?: Database["public"]["Enums"]["play"]
          priority?: Database["public"]["Enums"]["priority"]
          role_title?: string | null
          scan_date?: string | null
          scan_source?: string | null
          stage?: Database["public"]["Enums"]["stage"]
          state?: string | null
          tech?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      outreach_drafts: {
        Row: {
          body_html: string
          created_at: string
          from_address: string | null
          id: string
          lead_id: string
          owner_id: string | null
          preview_text: string | null
          provider: string | null
          provider_message_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["draft_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          body_html?: string
          created_at?: string
          from_address?: string | null
          id?: string
          lead_id: string
          owner_id?: string | null
          preview_text?: string | null
          provider?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["draft_status"]
          subject?: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          created_at?: string
          from_address?: string | null
          id?: string
          lead_id?: string
          owner_id?: string | null
          preview_text?: string | null
          provider?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["draft_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_drafts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_kind: "Email Sent" | "Reply" | "Call" | "Meeting" | "Note"
      app_role: "admin" | "subscriber"
      brand: "ZapAI" | "Newton Health" | "KinematicOps"
      draft_status: "Draft" | "Approved" | "Sent" | "Bounced"
      lead_type: "Employer" | "Recruiter"
      play: "Apply" | "Subcontract" | "Both"
      priority: "High" | "Medium" | "Low"
      stage:
        | "New"
        | "Contacted"
        | "Replied"
        | "Discovery Booked"
        | "Meeting Held"
        | "Proposal Sent"
        | "Won"
        | "Lost"
        | "Needs Contact Info"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      activity_kind: ["Email Sent", "Reply", "Call", "Meeting", "Note"],
      app_role: ["admin", "subscriber"],
      brand: ["ZapAI", "Newton Health", "KinematicOps"],
      draft_status: ["Draft", "Approved", "Sent", "Bounced"],
      lead_type: ["Employer", "Recruiter"],
      play: ["Apply", "Subcontract", "Both"],
      priority: ["High", "Medium", "Low"],
      stage: [
        "New",
        "Contacted",
        "Replied",
        "Discovery Booked",
        "Meeting Held",
        "Proposal Sent",
        "Won",
        "Lost",
        "Needs Contact Info",
      ],
    },
  },
} as const
