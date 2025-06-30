
-- Check current type constraint and add 'invitation' to allowed types
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recreate the constraint with the invitation type included
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('info', 'warning', 'error', 'success', 'invitation'));
