-- 1. Add missing column 'notifications_enabled' to 'public.users'
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;

-- 2. Create 'avatars' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies (Standard security)

-- Allow public access to view avatar images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar
-- (Assumes file path starts with user_id/, enforced by client logic or trigger)
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own avatar
CREATE POLICY "Owner Update" 
ON storage.objects FOR UPDATE 
USING ( 
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);

-- Allow users to delete their own avatar
CREATE POLICY "Owner Delete" 
ON storage.objects FOR DELETE 
USING ( 
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);
