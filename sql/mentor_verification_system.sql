-- PHASE 4: MENTOR VERIFICATION SYSTEM - DATABASE SCHEMA
-- This script creates the database schema for mentor verification and document management

-- Create 'mentor_verification_documents' table
CREATE TABLE IF NOT EXISTS public.mentor_verification_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(user_id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'government_id',
        'experience_proof',
        'education_certificate',
        'professional_certification',
        'portfolio',
        'reference_letter',
        'award',
        'other'
    )),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'feedback_reports' table for feedback moderation
CREATE TABLE IF NOT EXISTS public.feedback_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    feedback_id UUID REFERENCES public.mentor_feedback(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN (
        'inappropriate_language',
        'spam',
        'false_information',
        'harassment',
        'other'
    )),
    reported_by UUID REFERENCES auth.users(id) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mentor_verification_documents_mentor_id 
    ON public.mentor_verification_documents(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_verification_documents_status 
    ON public.mentor_verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_mentor_verification_documents_document_type 
    ON public.mentor_verification_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_mentor_verification_documents_uploaded_at 
    ON public.mentor_verification_documents(uploaded_at);

CREATE INDEX IF NOT EXISTS idx_feedback_reports_feedback_id 
    ON public.feedback_reports(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_reported_by 
    ON public.feedback_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_status 
    ON public.feedback_reports(status);

-- Add RLS policies for mentor_verification_documents
ALTER TABLE public.mentor_verification_documents ENABLE ROW LEVEL SECURITY;

-- Mentors can view and manage their own documents
CREATE POLICY "Mentors can manage their verification documents" ON public.mentor_verification_documents
    FOR ALL USING (auth.uid() = mentor_id);

-- Admins can view all documents
CREATE POLICY "Admins can view all verification documents" ON public.mentor_verification_documents
    FOR SELECT TO service_role USING (TRUE);

-- Admins can update document status
CREATE POLICY "Admins can update verification documents" ON public.mentor_verification_documents
    FOR UPDATE TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Add RLS policies for feedback_reports
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON public.feedback_reports
    FOR SELECT USING (auth.uid() = reported_by);

-- Users can create reports
CREATE POLICY "Users can create feedback reports" ON public.feedback_reports
    FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Admins can manage all reports
CREATE POLICY "Admins can manage all feedback reports" ON public.feedback_reports
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_mentor_verification_documents_updated_at 
    BEFORE UPDATE ON public.mentor_verification_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_reports_updated_at 
    BEFORE UPDATE ON public.feedback_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate file uploads
CREATE OR REPLACE FUNCTION validate_document_upload()
RETURNS TRIGGER AS $$
BEGIN
    -- Check file size (10MB limit)
    IF NEW.file_size > 10485760 THEN
        RAISE EXCEPTION 'File size exceeds 10MB limit';
    END IF;
    
    -- Check mime type
    IF NEW.mime_type NOT IN (
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) THEN
        RAISE EXCEPTION 'Invalid file type. Only images and PDFs are allowed.';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for document validation
CREATE TRIGGER validate_document_upload_trigger
    BEFORE INSERT ON public.mentor_verification_documents
    FOR EACH ROW EXECUTE FUNCTION validate_document_upload();

-- Create function to clean up old rejected documents
CREATE OR REPLACE FUNCTION cleanup_rejected_documents()
RETURNS void AS $$
BEGIN
    -- Delete documents that have been rejected for more than 30 days
    DELETE FROM public.mentor_verification_documents 
    WHERE status = 'rejected' 
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$ language 'plpgsql';

-- Create function to get verification statistics
CREATE OR REPLACE FUNCTION get_verification_stats(period_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_requests BIGINT,
    pending_requests BIGINT,
    approved_requests BIGINT,
    rejected_requests BIGINT,
    needs_more_info_requests BIGINT,
    approval_rate NUMERIC,
    average_review_time_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH verification_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'approved') as approved,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
            COUNT(*) FILTER (WHERE status = 'needs_more_info') as needs_more_info,
            AVG(EXTRACT(EPOCH FROM (reviewed_at - requested_at)) / 86400) as avg_review_time
        FROM public.mentor_verification_requests
        WHERE requested_at >= NOW() - (period_days || ' days')::INTERVAL
    )
    SELECT 
        vs.total,
        vs.pending,
        vs.approved,
        vs.rejected,
        vs.needs_more_info,
        CASE 
            WHEN vs.total > 0 THEN (vs.approved::NUMERIC / vs.total::NUMERIC) * 100
            ELSE 0
        END as approval_rate,
        COALESCE(vs.avg_review_time, 0)
    FROM verification_stats vs;
END;
$$ language 'plpgsql';

-- Create function to get mentor verification status
CREATE OR REPLACE FUNCTION get_mentor_verification_status(mentor_uuid UUID)
RETURNS TABLE (
    is_verified BOOLEAN,
    verification_level TEXT,
    verification_status TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    pending_request_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.is_verified,
        m.verification_level,
        COALESCE(vr.status, 'not_requested') as verification_status,
        m.verified_at,
        vr.id as pending_request_id
    FROM public.mentors m
    LEFT JOIN public.mentor_verification_requests vr 
        ON m.user_id = vr.mentor_id 
        AND vr.status IN ('pending', 'under_review')
    WHERE m.user_id = mentor_uuid
    ORDER BY vr.requested_at DESC
    LIMIT 1;
END;
$$ language 'plpgsql';

-- Insert sample verification types (if not exists)
INSERT INTO public.verification_types (id, name, description, requirements, estimated_time)
VALUES 
    ('basic', 'Basic Verification', 'Basic identity and experience verification', 
     ARRAY['Government-issued ID', 'Professional experience proof', 'LinkedIn profile verification'], 
     '1-2 business days'),
    ('professional', 'Professional Verification', 'Comprehensive professional credential verification',
     ARRAY['Government-issued ID', 'Professional experience proof', 'Educational certificates', 
           'Professional certifications', 'LinkedIn profile verification', 'Portfolio or work samples'],
     '3-5 business days'),
    ('expert', 'Expert Verification', 'Highest level of verification for industry experts',
     ARRAY['Government-issued ID', 'Professional experience proof', 'Educational certificates',
           'Professional certifications', 'Industry awards or recognition', 'Portfolio or work samples',
           'Reference letters', 'LinkedIn profile verification'],
     '5-7 business days')
ON CONFLICT (id) DO NOTHING;

-- Create view for verification dashboard
CREATE OR REPLACE VIEW public.verification_dashboard AS
SELECT 
    vr.id as request_id,
    vr.mentor_id,
    p.full_name as mentor_name,
    p.email as mentor_email,
    m.title as mentor_title,
    m.company as mentor_company,
    vr.verification_type,
    vr.status,
    vr.requested_at,
    vr.reviewed_at,
    vr.verification_level,
    vr.review_notes,
    COUNT(vd.id) as document_count,
    COUNT(vd.id) FILTER (WHERE vd.status = 'verified') as verified_documents,
    COUNT(vd.id) FILTER (WHERE vd.status = 'rejected') as rejected_documents
FROM public.mentor_verification_requests vr
JOIN public.mentors m ON vr.mentor_id = m.user_id
JOIN public.profiles p ON m.user_id = p.id
LEFT JOIN public.mentor_verification_documents vd ON vr.mentor_id = vd.mentor_id
GROUP BY vr.id, vr.mentor_id, p.full_name, p.email, m.title, m.company, 
         vr.verification_type, vr.status, vr.requested_at, vr.reviewed_at, 
         vr.verification_level, vr.review_notes;

-- Grant permissions
GRANT SELECT ON public.verification_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_verification_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_mentor_verification_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_rejected_documents() TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.mentor_verification_documents IS 'Stores uploaded verification documents for mentors';
COMMENT ON TABLE public.feedback_reports IS 'Stores reports of inappropriate feedback for moderation';
COMMENT ON FUNCTION get_verification_stats(INTEGER) IS 'Returns verification statistics for a given period';
COMMENT ON FUNCTION get_mentor_verification_status(UUID) IS 'Returns current verification status for a mentor';
COMMENT ON VIEW public.verification_dashboard IS 'Dashboard view for verification requests with document counts';
