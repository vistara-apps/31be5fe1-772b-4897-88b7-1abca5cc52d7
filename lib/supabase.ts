import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          created_at?: string
        }
      }
      clips: {
        Row: {
          clip_id: string
          source_url: string
          metadata: Record<string, any>
          owner_address: string
          story_protocol_id: string
        }
        Insert: {
          clip_id?: string
          source_url: string
          metadata: Record<string, any>
          owner_address: string
          story_protocol_id: string
        }
        Update: {
          clip_id?: string
          source_url?: string
          metadata?: Record<string, any>
          owner_address?: string
          story_protocol_id?: string
        }
      }
      remixes: {
        Row: {
          remix_id: string
          creator_id: string
          original_clip_ids: string[]
          output_url: string
          story_protocol_tx_hash: string
          created_at: string
        }
        Insert: {
          remix_id?: string
          creator_id: string
          original_clip_ids: string[]
          output_url: string
          story_protocol_tx_hash: string
          created_at?: string
        }
        Update: {
          remix_id?: string
          creator_id?: string
          original_clip_ids?: string[]
          output_url?: string
          story_protocol_tx_hash?: string
          created_at?: string
        }
      }
      royalty_distributions: {
        Row: {
          distribution_id: string
          remix_id: string
          original_owner_address: string
          amount: number
          timestamp: string
        }
        Insert: {
          distribution_id?: string
          remix_id: string
          original_owner_address: string
          amount: number
          timestamp?: string
        }
        Update: {
          distribution_id?: string
          remix_id?: string
          original_owner_address?: string
          amount?: number
          timestamp?: string
        }
      }
    }
  }
}
