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
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          app_name: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          updated_at: string | null
        }
        Insert: {
          app_name?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          app_name?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clinic_documents: {
        Row: {
          category: string
          clinic_id: string
          created_at: string
          created_by: string
          description: string | null
          file_size: number
          file_type: string
          file_url: string
          filename: string
          id: string
          is_active: boolean
          original_filename: string
          tags: string[] | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          clinic_id: string
          created_at?: string
          created_by: string
          description?: string | null
          file_size: number
          file_type: string
          file_url: string
          filename: string
          id?: string
          is_active?: boolean
          original_filename: string
          tags?: string[] | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          file_size?: number
          file_type?: string
          file_url?: string
          filename?: string
          id?: string
          is_active?: boolean
          original_filename?: string
          tags?: string[] | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clinics: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      content_access: {
        Row: {
          access_token: string
          created_at: string
          execution_id: string
          expires_at: string
          files: Json
          id: string
          metadata: Json | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          access_token?: string
          created_at?: string
          execution_id: string
          expires_at: string
          files?: Json
          id?: string
          metadata?: Json | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          execution_id?: string
          expires_at?: string
          files?: Json
          id?: string
          metadata?: Json | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      delay_tasks: {
        Row: {
          created_at: string
          execution_id: string
          form_name: string
          id: string
          next_node_id: string
          next_node_type: string
          patient_id: string
          processed: boolean
          processed_at: string | null
          processing_instance_id: string | null
          processing_started_at: string | null
          trigger_at: string
        }
        Insert: {
          created_at?: string
          execution_id: string
          form_name: string
          id?: string
          next_node_id: string
          next_node_type: string
          patient_id: string
          processed?: boolean
          processed_at?: string | null
          processing_instance_id?: string | null
          processing_started_at?: string | null
          trigger_at: string
        }
        Update: {
          created_at?: string
          execution_id?: string
          form_name?: string
          id?: string
          next_node_id?: string
          next_node_type?: string
          patient_id?: string
          processed?: boolean
          processed_at?: string | null
          processing_instance_id?: string | null
          processing_started_at?: string | null
          trigger_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delay_tasks_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "flow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          completed_at: string | null
          created_at: string | null
          flow_id: string | null
          id: string
          notes: string | null
          patient_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          flow_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          flow_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_assignments_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_executions: {
        Row: {
          completed_at: string | null
          completed_steps: number | null
          created_at: string | null
          current_node: string | null
          current_step: Json | null
          flow_id: string | null
          flow_name: string
          id: string
          next_step_available_at: string | null
          patient_id: string | null
          progress: number | null
          started_at: string | null
          status: string | null
          total_steps: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string | null
          current_node?: string | null
          current_step?: Json | null
          flow_id?: string | null
          flow_name: string
          id?: string
          next_step_available_at?: string | null
          patient_id?: string | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          total_steps?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string | null
          current_node?: string | null
          current_step?: Json | null
          flow_id?: string | null
          flow_name?: string
          id?: string
          next_step_available_at?: string | null
          patient_id?: string | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          total_steps?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_executions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          execution_id: string
          id: string
          metadata: Json | null
          node_id: string
          node_type: string
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          execution_id: string
          id?: string
          metadata?: Json | null
          node_id: string
          node_type: string
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          execution_id?: string
          id?: string
          metadata?: Json | null
          node_id?: string
          node_type?: string
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      flows: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          edges: Json | null
          id: string
          is_active: boolean | null
          name: string
          nodes: Json | null
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          edges?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          nodes?: Json | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          edges?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          nodes?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actionable: boolean | null
          category: string
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actionable?: boolean | null
          category: string
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actionable?: boolean | null
          category?: string
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      patient_invitations: {
        Row: {
          accepted_at: string | null
          clinic_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          clinic_id: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invitation_token: string
          invited_by: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          clinic_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clinic_id: string | null
          created_at: string | null
          email: string
          is_chief: boolean | null
          name: string
          phone: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email: string
          is_chief?: boolean | null
          name: string
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string
          is_chief?: boolean | null
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          clinic_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          name: string
          permissions: Json | null
          role: Database["public"]["Enums"]["team_role"]
          status: string
          updated_at: string
          whatsapp_phone: string | null
        }
        Insert: {
          accepted_at?: string | null
          clinic_id: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invitation_token: string
          invited_by: string
          name: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["team_role"]
          status?: string
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Update: {
          accepted_at?: string | null
          clinic_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          name?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["team_role"]
          status?: string
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["team_role"]
          updated_at: string
          user_id: string
          whatsapp_phone: string | null
          whatsapp_verified: boolean | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["team_role"]
          updated_at?: string
          user_id: string
          whatsapp_phone?: string | null
          whatsapp_verified?: boolean | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["team_role"]
          updated_at?: string
          user_id?: string
          whatsapp_phone?: string | null
          whatsapp_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_settings: {
        Row: {
          access_token: string | null
          account_sid: string | null
          api_key: string | null
          auth_token: string | null
          base_url: string | null
          business_account_id: string | null
          clinic_id: string | null
          created_at: string
          id: string
          is_active: boolean
          phone_number: string | null
          provider: string
          session_name: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          account_sid?: string | null
          api_key?: string | null
          auth_token?: string | null
          base_url?: string | null
          business_account_id?: string | null
          clinic_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number?: string | null
          provider: string
          session_name?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          account_sid?: string | null
          api_key?: string | null
          auth_token?: string | null
          base_url?: string | null
          business_account_id?: string | null
          clinic_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number?: string | null
          provider?: string
          session_name?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_settings_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          clinic_id: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean
          is_official: boolean
          name: string
          placeholders: string[] | null
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_official?: boolean
          name: string
          placeholders?: string[] | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_official?: boolean
          name?: string
          placeholders?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_clinic_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_clinic_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_team_permission: {
        Args: { _user_id: string; _clinic_id: string; _permission: string }
        Returns: boolean
      }
    }
    Enums: {
      team_role: "admin" | "manager" | "professional" | "assistant" | "viewer"
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
      team_role: ["admin", "manager", "professional", "assistant", "viewer"],
    },
  },
} as const
