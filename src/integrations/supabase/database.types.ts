export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      fire_reports: {
        Row: {
          id: string
          user_id: string
          latitude: number
          longitude: number
          images: string[]
          description: string
          ai_confidence: number
          ai_detected_elements: string[]
          ai_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          ai_is_likely_fire: boolean
          status: 'PENDING' | 'VERIFIED' | 'FALSE_ALARM' | 'RESOLVED'
          reported_at: string
          verified_at: string | null
          emergency_112_notified: boolean
          satellite_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          latitude: number
          longitude: number
          images: string[]
          description: string
          ai_confidence?: number
          ai_detected_elements?: string[]
          ai_risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          ai_is_likely_fire?: boolean
          status?: 'PENDING' | 'VERIFIED' | 'FALSE_ALARM' | 'RESOLVED'
          reported_at?: string
          verified_at?: string | null
          emergency_112_notified?: boolean
          satellite_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          latitude?: number
          longitude?: number
          images?: string[]
          description?: string
          ai_confidence?: number
          ai_detected_elements?: string[]
          ai_risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          ai_is_likely_fire?: boolean
          status?: 'PENDING' | 'VERIFIED' | 'FALSE_ALARM' | 'RESOLVED'
          reported_at?: string
          verified_at?: string | null
          emergency_112_notified?: boolean
          satellite_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fire_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          reliability_score: number
          total_reports: number
          verified_reports: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          reliability_score?: number
          total_reports?: number
          verified_reports?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          reliability_score?: number
          total_reports?: number
          verified_reports?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          type: 'FIRE_ALERT' | 'VERIFICATION' | 'EMERGENCY' | 'SYSTEM'
          data: Json | null
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          type: 'FIRE_ALERT' | 'VERIFICATION' | 'EMERGENCY' | 'SYSTEM'
          data?: Json | null
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string
          type?: 'FIRE_ALERT' | 'VERIFICATION' | 'EMERGENCY' | 'SYSTEM'
          data?: Json | null
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]