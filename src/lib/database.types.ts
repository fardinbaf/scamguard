
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
        Relationships: [
          {
            foreignKeyName: "comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "evidence_files_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          }
        ]
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
        Update:
