-- Create verification requests table
CREATE TABLE public.verification_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    document_type text CHECK (document_type IN ('id', 'passport', 'trade_license', 'other')) NOT NULL,
    document_urls text[] NOT NULL,
    document_number text NOT NULL,
    document_expiry date NOT NULL,
    verification_status text CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_notes text,
    rejection_reason text,
    verified_by uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at timestamp with time zone
);

-- Create indexes
CREATE INDEX verification_requests_user_id_idx ON public.verification_requests(user_id);
CREATE INDEX verification_requests_status_idx ON public.verification_requests(verification_status);
CREATE INDEX verification_requests_verified_by_idx ON public.verification_requests(verified_by);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Set up Row Level Security (RLS)
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Policies for viewing verification requests
CREATE POLICY "Users can view their own verification requests"
    ON public.verification_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for inserting new verification requests
CREATE POLICY "Users can create their own verification requests"
    ON public.verification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for admin access
CREATE POLICY "Admins have full access to verification requests"
    ON public.verification_requests FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));


-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification_docs', 'verification_docs', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for verification documents

-- Policy for uploading documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'verification_docs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND auth.role() = 'authenticated'
);

-- Policy for admin access
CREATE POLICY "Admins can access all verification documents"
ON storage.objects FOR ALL
USING (
    bucket_id = 'verification_docs' 
    AND public.is_admin(auth.uid())
)
WITH CHECK (
    bucket_id = 'verification_docs' 
    AND public.is_admin(auth.uid())
);

-- Create a secure URL generator function for verification documents
CREATE OR REPLACE FUNCTION public.get_verification_doc_url(file_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user is admin or document owner
    IF NOT (
        public.is_admin(auth.uid()) OR 
        (storage.foldername(file_path))[1] = auth.uid()::text
    ) THEN
        RAISE EXCEPTION 'Unauthorized access to verification document';
    END IF;

    RETURN storage.generate_presigned_url(
        'verification_docs'::text,
        file_path::text,
        3600 -- URL valid for 1 hour
    );
END;
$$;