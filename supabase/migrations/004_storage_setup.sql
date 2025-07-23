-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-recordings', 'audio-recordings', false);

-- Set up storage policies for audio recordings
CREATE POLICY "Users can upload own audio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio-recordings' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own audio files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'audio-recordings' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own audio files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'audio-recordings' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own audio files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'audio-recordings' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to auto-delete audio files after 24 hours
CREATE OR REPLACE FUNCTION public.cleanup_old_audio_files()
RETURNS void AS $$
BEGIN
  -- Delete recordings older than 24 hours that are completed
  DELETE FROM storage.objects 
  WHERE 
    bucket_id = 'audio-recordings' 
    AND created_at < NOW() - INTERVAL '24 hours'
    AND EXISTS (
      SELECT 1 FROM public.recordings 
      WHERE 
        audio_url LIKE '%' || storage.objects.name || '%'
        AND status = 'completed'
        AND created_at < NOW() - INTERVAL '24 hours'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup function (requires pg_cron extension in production)
-- This would be set up in production Supabase project
-- SELECT cron.schedule('cleanup-audio-files', '0 2 * * *', 'SELECT public.cleanup_old_audio_files();');