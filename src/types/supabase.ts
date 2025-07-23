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
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recordings: {
        Row: {
          id: string
          user_id: string
          title: string
          audio_url: string | null
          transcript: string | null
          duration: number | null
          file_size: number | null
          status: 'recording' | 'uploaded' | 'transcribed' | 'analyzed' | 'completed' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          audio_url?: string | null
          transcript?: string | null
          duration?: number | null
          file_size?: number | null
          status?: 'recording' | 'uploaded' | 'transcribed' | 'analyzed' | 'completed' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          audio_url?: string | null
          transcript?: string | null
          duration?: number | null
          file_size?: number | null
          status?: 'recording' | 'uploaded' | 'transcribed' | 'analyzed' | 'completed' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      voice_analyses: {
        Row: {
          id: string
          recording_id: string
          clarity_score: number
          volume_level: 'too_low' | 'appropriate' | 'too_high'
          speech_rate: number
          speech_rate_evaluation: 'too_slow' | 'appropriate' | 'too_fast'
          stability_score: number
          total_voice_score: number
          raw_analysis_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          recording_id: string
          clarity_score: number
          volume_level: 'too_low' | 'appropriate' | 'too_high'
          speech_rate: number
          speech_rate_evaluation: 'too_slow' | 'appropriate' | 'too_fast'
          stability_score: number
          total_voice_score: number
          raw_analysis_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          recording_id?: string
          clarity_score?: number
          volume_level?: 'too_low' | 'appropriate' | 'too_high'
          speech_rate?: number
          speech_rate_evaluation?: 'too_slow' | 'appropriate' | 'too_fast'
          stability_score?: number
          total_voice_score?: number
          raw_analysis_data?: Json | null
          created_at?: string
        }
      }
      ai_personas: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string
          is_preset: boolean
          is_active: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description: string
          is_preset?: boolean
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string
          is_preset?: boolean
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          recording_id: string
          ai_persona_id: string
          friendship_score: number
          work_together_score: number
          total_score: number
          friendship_reason: string
          work_reason: string
          improvement_suggestions: string[]
          evaluation_summary: string | null
          processing_time_ms: number
          created_at: string
        }
        Insert: {
          id?: string
          recording_id: string
          ai_persona_id: string
          friendship_score: number
          work_together_score: number
          total_score: number
          friendship_reason: string
          work_reason: string
          improvement_suggestions: string[]
          evaluation_summary?: string | null
          processing_time_ms: number
          created_at?: string
        }
        Update: {
          id?: string
          recording_id?: string
          ai_persona_id?: string
          friendship_score?: number
          work_together_score?: number
          total_score?: number
          friendship_reason?: string
          work_reason?: string
          improvement_suggestions?: string[]
          evaluation_summary?: string | null
          processing_time_ms?: number
          created_at?: string
        }
      }
      engineer_profiles: {
        Row: {
          id: string
          recording_id: string
          basic_info: Json
          technical_skills: Json
          specializations: string[]
          skill_levels: Json
          projects_achievements: string | null
          personal_interests: Json
          extracted_keywords: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recording_id: string
          basic_info?: Json
          technical_skills?: Json
          specializations?: string[]
          skill_levels?: Json
          projects_achievements?: string | null
          personal_interests?: Json
          extracted_keywords?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recording_id?: string
          basic_info?: Json
          technical_skills?: Json
          specializations?: string[]
          skill_levels?: Json
          projects_achievements?: string | null
          personal_interests?: Json
          extracted_keywords?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      generated_introductions: {
        Row: {
          id: string
          recording_id: string
          platform_type: 'twitter' | 'instagram' | 'note' | 'tech_blog'
          generated_text: string
          user_edited_text: string | null
          character_count: number
          user_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recording_id: string
          platform_type: 'twitter' | 'instagram' | 'note' | 'tech_blog'
          generated_text: string
          user_edited_text?: string | null
          character_count: number
          user_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recording_id?: string
          platform_type?: 'twitter' | 'instagram' | 'note' | 'tech_blog'
          generated_text?: string
          user_edited_text?: string | null
          character_count?: number
          user_edited?: boolean
          created_at?: string
          updated_at?: string
        }
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