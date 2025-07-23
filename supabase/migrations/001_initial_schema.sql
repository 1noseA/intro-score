-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Recordings table
CREATE TABLE public.recordings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  duration INTEGER, -- seconds
  file_size BIGINT, -- bytes
  status TEXT CHECK (status IN ('recording', 'uploaded', 'transcribed', 'analyzed', 'completed', 'error')) DEFAULT 'recording' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Voice analyses table
CREATE TABLE public.voice_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  clarity_score DECIMAL(4,2) CHECK (clarity_score >= 0 AND clarity_score <= 10) NOT NULL,
  volume_level TEXT CHECK (volume_level IN ('too_low', 'appropriate', 'too_high')) NOT NULL,
  speech_rate DECIMAL(6,2) NOT NULL, -- words per minute
  speech_rate_evaluation TEXT CHECK (speech_rate_evaluation IN ('too_slow', 'appropriate', 'too_fast')) NOT NULL,
  stability_score DECIMAL(4,2) CHECK (stability_score >= 0 AND stability_score <= 10) NOT NULL,
  total_voice_score DECIMAL(5,2) CHECK (total_voice_score >= 0 AND total_voice_score <= 100) NOT NULL,
  raw_analysis_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AI personas table
CREATE TABLE public.ai_personas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL for preset personas
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Evaluations table
CREATE TABLE public.evaluations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE NOT NULL,
  ai_persona_id UUID REFERENCES public.ai_personas(id) ON DELETE CASCADE NOT NULL,
  friendship_score INTEGER CHECK (friendship_score >= 1 AND friendship_score <= 100) NOT NULL,
  work_together_score INTEGER CHECK (work_together_score >= 1 AND work_together_score <= 100) NOT NULL,
  total_score DECIMAL(5,2) CHECK (total_score >= 1 AND total_score <= 100) NOT NULL,
  friendship_reason TEXT NOT NULL,
  work_reason TEXT NOT NULL,
  improvement_suggestions TEXT[] NOT NULL,
  evaluation_summary TEXT,
  processing_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(recording_id, ai_persona_id)
);

-- Engineer profiles table
CREATE TABLE public.engineer_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  basic_info JSONB NOT NULL DEFAULT '{}', -- {name, experience_years, position, team}
  technical_skills JSONB NOT NULL DEFAULT '{}', -- {programming_languages, frameworks_libraries, tools_infrastructure}
  specializations TEXT[] DEFAULT '{}' NOT NULL,
  skill_levels JSONB NOT NULL DEFAULT '{}', -- {skill_name: level}
  projects_achievements TEXT,
  personal_interests JSONB NOT NULL DEFAULT '{}', -- {hobbies, other_skills}
  extracted_keywords TEXT[] DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Generated introductions table
CREATE TABLE public.generated_introductions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE NOT NULL,
  platform_type TEXT CHECK (platform_type IN ('twitter', 'instagram', 'note', 'tech_blog')) NOT NULL,
  generated_text TEXT NOT NULL,
  user_edited_text TEXT,
  character_count INTEGER NOT NULL,
  user_edited BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(recording_id, platform_type)
);

-- Create indexes for better performance
CREATE INDEX idx_recordings_user_id ON public.recordings(user_id);
CREATE INDEX idx_recordings_status ON public.recordings(status);
CREATE INDEX idx_recordings_created_at ON public.recordings(created_at DESC);
CREATE INDEX idx_evaluations_recording_id ON public.evaluations(recording_id);
CREATE INDEX idx_evaluations_ai_persona_id ON public.evaluations(ai_persona_id);
CREATE INDEX idx_ai_personas_user_id ON public.ai_personas(user_id);
CREATE INDEX idx_ai_personas_is_preset ON public.ai_personas(is_preset);
CREATE INDEX idx_generated_introductions_recording_id ON public.generated_introductions(recording_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_recordings_updated_at
  BEFORE UPDATE ON public.recordings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_ai_personas_updated_at
  BEFORE UPDATE ON public.ai_personas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_engineer_profiles_updated_at
  BEFORE UPDATE ON public.engineer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_generated_introductions_updated_at
  BEFORE UPDATE ON public.generated_introductions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();