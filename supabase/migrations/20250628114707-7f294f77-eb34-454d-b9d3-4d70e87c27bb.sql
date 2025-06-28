
-- Add 'patient_invitation' to the allowed categories for notifications
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_category_check;

-- Recreate the constraint with the patient_invitation category included
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_category_check 
CHECK (category IN ('system', 'patient', 'flow', 'team', 'patient_invitation'));
