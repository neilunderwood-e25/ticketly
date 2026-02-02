-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'events' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Allow public access to view images
CREATE POLICY "Public access to event images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'events');

-- Policy: Users can update their own images
CREATE POLICY "Users can update own event images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'events' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'events' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own event images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'events' AND auth.uid()::text = (storage.foldername(name))[1]);
