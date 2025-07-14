-- Make clinic-materials bucket public for direct downloads
UPDATE storage.buckets 
SET public = true 
WHERE id = 'clinic-materials';

-- Remove complex access policies and use simple ones for public bucket
DROP POLICY IF EXISTS "Clinic users can view their materials" ON storage.objects;
DROP POLICY IF EXISTS "Clinic users can update their materials" ON storage.objects;
DROP POLICY IF EXISTS "Clinic users can delete their materials" ON storage.objects;
DROP POLICY IF EXISTS "Clinic users can upload materials" ON storage.objects;

-- Create simple public policies for clinic-materials bucket
CREATE POLICY "Public read access for clinic materials"
ON storage.objects
FOR SELECT
USING (bucket_id = 'clinic-materials');

CREATE POLICY "Clinic users can upload materials"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'clinic-materials' AND
  (get_current_user_role() = ANY (ARRAY['clinic', 'super_admin']))
);

CREATE POLICY "Clinic users can delete their materials"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'clinic-materials' AND
  (
    get_current_user_role() = 'super_admin' OR
    (get_current_user_role() = 'clinic' AND (storage.foldername(name))[1] = get_current_user_clinic_id()::text)
  )
);