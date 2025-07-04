
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      advertisement: {
        Row: {
          id: number
          image_url: string | null
          is_enabled: boolean
          target_url: string | null
        }
        Insert: {
          id?: number
          image_url?: string | null
          is_enabled?: boolean
          target_url?: string | null
        }
        Update: {
          id?: number
          image_url?: string | null
          is_enabled?: boolean
          target_url?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean
          report_id: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          report_id: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          report_id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      evidence_files: {
        Row: {
          file_path: string
          id: string
          mime_type: string | null
          original_name: string
          report_id: string
          size: number | null
        }
        Insert: {
          file_path: string
          id?: string
          mime_type?: string | null
          original_name: string
          report_id: string
          size?: number | null
        }
        Update: {
          file_path?: string
          id?: string
          mime_type?: string | null
          original_name?: string
          report_id?: string
          size?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          identifier: string | null
          is_admin: boolean
          is_banned: boolean
          updated_at: string | null
        }
        Insert: {
          id: string
          identifier?: string | null
          is_admin?: boolean
          is_banned?: boolean
          updated_at?: string | null
        }
        Update: {
          id?: string
          identifier?: string | null
          is_admin?: boolean
          is_banned?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          category: string
          contact_info: string | null
          created_at: string
          description: string
          id: string
          reported_by_id: string | null
          status: string
          target_type: string
          title: string
          title_description_tokens: unknown | null
        }
        Insert: {
          category: string
          contact_info?: string | null
          created_at?: string
          description: string
          id?: string
          reported_by_id?: string | null
          status?: string
          target_type: string
          title: string
          title_description_tokens?: unknown | null
        }
        Update: {
          category?: string
          contact_info?: string | null
          created_at?: string
          description?: string
          id?: string
          reported_by_id?: string | null
          status?: string
          target_type?: string
          title?: string
          title_description_tokens?: unknown | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      report_category: "Scam" | "Spam" | "Phishing" | "Malware"
      report_status: "Pending" | "Approved" | "Rejected"
      target_type: "Business" | "Person" | "Company" | "Website" | "Other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
