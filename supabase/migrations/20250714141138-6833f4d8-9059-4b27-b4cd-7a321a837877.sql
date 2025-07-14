-- Create clinic_documents table for organized file management
CREATE TABLE public.clinic_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  theme TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.clinic_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for clinic_documents
CREATE POLICY "Clinics can manage their own documents"
ON public.clinic_documents
FOR ALL
USING (clinic_id = get_current_user_clinic_id())
WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Super admins can manage all documents"
ON public.clinic_documents
FOR ALL
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');

-- Create storage bucket for clinic materials
INSERT INTO storage.buckets (id, name, public) VALUES ('clinic-materials', 'clinic-materials', false);

-- Create storage policies for clinic-materials bucket
CREATE POLICY "Clinic users can upload materials"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'clinic-materials' AND
  (get_current_user_role() = ANY (ARRAY['clinic', 'super_admin']))
);

CREATE POLICY "Clinic users can view their materials"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'clinic-materials' AND
  (
    get_current_user_role() = 'super_admin' OR
    (get_current_user_role() = 'clinic' AND (storage.foldername(name))[1] = get_current_user_clinic_id()::text)
  )
);

CREATE POLICY "Clinic users can update their materials"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'clinic-materials' AND
  (
    get_current_user_role() = 'super_admin' OR
    (get_current_user_role() = 'clinic' AND (storage.foldername(name))[1] = get_current_user_clinic_id()::text)
  )
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

-- Create trigger for updated_at
CREATE TRIGGER update_clinic_documents_updated_at
BEFORE UPDATE ON public.clinic_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create material_disponivel WhatsApp template
INSERT INTO whatsapp_templates (name, content, placeholders, is_official, is_active, clinic_id)
VALUES (
  'material_disponivel',
  '📋 *Materiais Disponíveis*

Olá {patient_name}! 

Seus materiais estão prontos para download:

{file_list}

🔗 Para acessar, clique nos links acima
⏰ Links válidos por {expiry_time}
📱 Você pode baixar direto no seu celular

_{clinic_name}_',
  ARRAY['patient_name', 'clinic_name', 'file_list', 'expiry_time'],
  true,
  true,
  null
) ON CONFLICT (name, clinic_id) DO UPDATE SET
  content = EXCLUDED.content,
  placeholders = EXCLUDED.placeholders,
  updated_at = now();