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
      profiles: {
        Row: {
          id: string
          full_name: string
          age: number | null
          city: string | null
          skills: string[]
          interests: string[]
          goals: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          age?: number | null
          city?: string | null
          skills?: string[]
          interests?: string[]
          goals?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          age?: number | null
          city?: string | null
          skills?: string[]
          interests?: string[]
          goals?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string
          required_skills: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description: string
          required_skills?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string
          required_skills?: string[]
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      swipes: {
        Row: {
          id: string
          swiper_id: string
          idea_id: string
          direction: "left" | "right"
          created_at: string
        }
        Insert: {
          id?: string
          swiper_id: string
          idea_id: string
          direction: "left" | "right"
          created_at?: string
        }
        Update: {
          id?: string
          direction?: "left" | "right"
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          idea_id: string
          idea_owner_id: string
          interested_user_id: string
          status: "pending" | "matched" | "declined"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          idea_owner_id: string
          interested_user_id: string
          status?: "pending" | "matched" | "declined"
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: "pending" | "matched" | "declined"
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          content: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          read_at?: string | null
        }
        Relationships: []
      }
      pactums: {
        Row: {
          id: string
          match_id: string
          title: string
          description: string
          owner_role: string
          collaborator_role: string
          terms: string
          owner_signed_at: string | null
          collaborator_signed_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          title: string
          description: string
          owner_role: string
          collaborator_role: string
          terms: string
          owner_signed_at?: string | null
          collaborator_signed_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          owner_role?: string
          collaborator_role?: string
          terms?: string
          owner_signed_at?: string | null
          collaborator_signed_at?: string | null
          updated_at?: string
        }
        Relationships: []
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
