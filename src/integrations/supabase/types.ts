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
      // ... other table definitions ...
      users: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          id: string
          last_signed_in_at: string | null
          mobile_number: string | null
          name: string
          password_changed_at: string | null
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
          password_changed_at?: string | null
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
          password_changed_at?: string | null
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
      // ... other table definitions ...
    }
  }
}
