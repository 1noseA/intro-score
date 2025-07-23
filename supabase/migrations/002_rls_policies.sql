-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_introductions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Recordings policies
CREATE POLICY "Users can view own recordings" ON public.recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings" ON public.recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings" ON public.recordings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings" ON public.recordings
  FOR DELETE USING (auth.uid() = user_id);

-- Voice analyses policies
CREATE POLICY "Users can view own voice analyses" ON public.voice_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = voice_analyses.recording_id
      AND recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own voice analyses" ON public.voice_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = recording_id
      AND recordings.user_id = auth.uid()
    )
  );

-- AI personas policies
CREATE POLICY "Users can view accessible personas" ON public.ai_personas
  FOR SELECT USING (
    is_preset = true OR auth.uid() = user_id
  );

CREATE POLICY "Users can insert own custom personas" ON public.ai_personas
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND is_preset = false
  );

CREATE POLICY "Users can update own custom personas" ON public.ai_personas
  FOR UPDATE USING (
    auth.uid() = user_id AND is_preset = false
  );

CREATE POLICY "Users can delete own custom personas" ON public.ai_personas
  FOR DELETE USING (
    auth.uid() = user_id AND is_preset = false
  );

-- Evaluations policies
CREATE POLICY "Users can view own evaluations" ON public.evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = evaluations.recording_id
      AND recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own evaluations" ON public.evaluations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = recording_id
      AND recordings.user_id = auth.uid()
    )
  );

-- Engineer profiles policies
CREATE POLICY "Users can view own engineer profiles" ON public.engineer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = engineer_profiles.recording_id
      AND recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own engineer profiles" ON public.engineer_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = recording_id
      AND recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own engineer profiles" ON public.engineer_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = engineer_profiles.recording_id
      AND recordings.user_id = auth.uid()
    )
  );

-- Generated introductions policies
CREATE POLICY "Users can view own generated introductions" ON public.generated_introductions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = generated_introductions.recording_id
      AND recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own generated introductions" ON public.generated_introductions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = recording_id
      AND recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own generated introductions" ON public.generated_introductions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = generated_introductions.recording_id
      AND recordings.user_id = auth.uid()
    )
  );