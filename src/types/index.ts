export interface User {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Recording {
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

export interface VoiceAnalysis {
  id: string
  recording_id: string
  clarity_score: number
  volume_level: 'too_low' | 'appropriate' | 'too_high'
  speech_rate: number
  speech_rate_evaluation: 'too_slow' | 'appropriate' | 'too_fast'
  stability_score: number
  total_voice_score: number
  raw_analysis_data: Record<string, unknown>
  created_at: string
}

export interface AIPersona {
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

export interface Evaluation {
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

export interface EngineerProfile {
  id: string
  recording_id: string
  basic_info: {
    name: string | null
    experience_years: number | null
    position: string | null
    team: string | null
  }
  technical_skills: {
    programming_languages: Array<{ name: string; confidence: number }>
    frameworks_libraries: Array<{ name: string; confidence: number }>
    tools_infrastructure: Array<{ name: string; confidence: number }>
  }
  specializations: string[]
  skill_levels: Record<string, 'beginner' | 'intermediate' | 'advanced'>
  projects_achievements: string | null
  personal_interests: {
    hobbies: string[]
    other_skills: string[]
  }
  extracted_keywords: string[]
  created_at: string
  updated_at: string
}

export interface GeneratedIntroduction {
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

export type APIResponse<T = unknown> = {
  success: boolean
  data: T | null
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  } | null
  metadata?: {
    timestamp: string
    request_id: string
    processing_time_ms: number
  }
}