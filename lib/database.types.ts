export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar: string
          studying_what: string
          interests: string[]
          xp: number
          level: number
          streak: number
          last_active: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar?: string
          studying_what?: string
          interests?: string[]
          xp?: number
          level?: number
          streak?: number
          last_active?: string
        }
        Update: {
          name?: string
          avatar?: string
          studying_what?: string
          interests?: string[]
          xp?: number
          level?: number
          streak?: number
          last_active?: string
        }
      }
      game_rooms: {
        Row: {
          id: string
          code: string
          host_id: string | null
          host_name: string
          subject: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          game_type: 'summit' | 'tugofwar' | 'surfer'
          status: 'lobby' | 'playing' | 'finished'
          questions: Json
          current_q: number
          max_players: number
          created_at: string
          started_at: string | null
          finished_at: string | null
        }
        Insert: {
          code: string
          host_id?: string
          host_name: string
          subject?: string
          difficulty?: string
          game_type?: string
          status?: string
          questions?: Json
          max_players?: number
        }
        Update: {
          status?: string
          questions?: Json
          current_q?: number
          started_at?: string
          finished_at?: string
        }
      }
      game_players: {
        Row: {
          id: string
          room_id: string
          user_id: string | null
          player_name: string
          avatar: string
          score: number
          energy: number
          is_host: boolean
          is_ready: boolean
          team: 'red' | 'blue' | 'none'
          joined_at: string
        }
        Insert: {
          room_id: string
          user_id?: string
          player_name: string
          avatar?: string
          score?: number
          energy?: number
          is_host?: boolean
          is_ready?: boolean
          team?: string
        }
        Update: {
          score?: number
          energy?: number
          is_ready?: boolean
          team?: string
        }
      }
      game_answers: {
        Row: {
          id: string
          room_id: string
          player_id: string
          question_idx: number
          chosen: string
          correct: boolean
          time_taken_ms: number | null
          score_gained: number
          answered_at: string
        }
        Insert: {
          room_id: string
          player_id: string
          question_idx: number
          chosen: string
          correct: boolean
          time_taken_ms?: number
          score_gained?: number
        }
        Update: Record<string, never>
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          emoji: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          estimated_hours: number
          is_prebuilt: boolean
          tags: string[]
          modules: Json
          created_by: string | null
          created_at: string
        }
        Insert: {
          title: string
          description?: string
          emoji?: string
          category?: string
          difficulty?: string
          estimated_hours?: number
          is_prebuilt?: boolean
          tags?: string[]
          modules?: Json
          created_by?: string
        }
        Update: {
          title?: string
          modules?: Json
        }
      }
      course_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          completed_lessons: string[]
          started_at: string
          last_active: string
        }
        Insert: {
          user_id: string
          course_id: string
          completed_lessons?: string[]
        }
        Update: {
          completed_lessons?: string[]
          last_active?: string
        }
      }
      roadmaps: {
        Row: {
          id: string
          user_id: string
          title: string
          goal: string
          nodes: Json
          node_statuses: Json
          completion_percent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          goal: string
          nodes: Json
          node_statuses?: Json
          completion_percent?: number
        }
        Update: {
          nodes?: Json
          node_statuses?: Json
          completion_percent?: number
        }
      }
      learn_sessions: {
        Row: {
          id: string
          user_id: string
          subject: string
          messages: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          subject: string
          messages?: Json
        }
        Update: {
          messages?: Json
        }
      }
      coding_submissions: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          level: 'blocks' | 'fill' | 'real'
          code: string | null
          passed: boolean
          xp_awarded: number
          submitted_at: string
        }
        Insert: {
          user_id: string
          challenge_id: string
          level: string
          code?: string
          passed?: boolean
          xp_awarded?: number
        }
        Update: Record<string, never>
      }
      xp_events: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string
          room_id: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          amount: number
          reason: string
          room_id?: string
        }
        Update: Record<string, never>
      }
    }
    Views: {
      leaderboard: {
        Row: {
          id: string
          name: string
          avatar: string
          xp: number
          level: number
          streak: number
          studying_what: string
        }
      }
      rooms_with_players: {
        Row: {
          id: string
          code: string
          host_name: string
          subject: string
          game_type: string
          status: string
          player_count: number
          created_at: string
        }
      }
    }
    Functions: {
      award_xp: {
        Args: { p_user_id: string; p_amount: number; p_reason: string; p_room_id?: string }
        Returns: number
      }
    }
  }
}
