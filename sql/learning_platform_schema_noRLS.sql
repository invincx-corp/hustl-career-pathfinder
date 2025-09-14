-- Phase 3 Minimal Tables - NO RLS POLICIES
-- This file creates ONLY the tables with NO security policies
-- Run this file in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- MENTOR AND PEER REVIEW SYSTEM TABLES
-- =====================================================

-- Mentors table
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    bio TEXT,
    expertise_areas TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    availability_schedule JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project reviews table
CREATE TABLE IF NOT EXISTS public.project_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL,
    submission_id UUID,
    reviewer_id UUID NOT NULL,
    review_type TEXT NOT NULL CHECK (review_type IN ('mentor', 'peer')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    strengths TEXT[] DEFAULT '{}',
    improvements TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project submissions table
CREATE TABLE IF NOT EXISTS public.project_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    submission_data JSONB DEFAULT '{}',
    notes TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Review criteria table
CREATE TABLE IF NOT EXISTS public.review_criteria (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    weight DECIMAL(3,2) DEFAULT 0.25,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review scores table
CREATE TABLE IF NOT EXISTS public.review_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.project_reviews(id) ON DELETE CASCADE,
    criteria_id UUID NOT NULL REFERENCES public.review_criteria(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LIVING RESUME SYSTEM TABLES
-- =====================================================

-- Living Resume table
CREATE TABLE IF NOT EXISTS public.living_resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'My Living Resume',
    summary TEXT,
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    skills TEXT[] DEFAULT '{}',
    projects JSONB DEFAULT '[]',
    achievements JSONB DEFAULT '[]',
    contact_info JSONB DEFAULT '{}',
    template_id UUID,
    is_public BOOLEAN DEFAULT FALSE,
    public_link TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume sections table
CREATE TABLE IF NOT EXISTS public.resume_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES public.living_resumes(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume templates table
CREATE TABLE IF NOT EXISTS public.resume_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    template_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume analytics table
CREATE TABLE IF NOT EXISTS public.resume_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES public.living_resumes(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume exports table
CREATE TABLE IF NOT EXISTS public.resume_exports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES public.living_resumes(id) ON DELETE CASCADE,
    export_type TEXT NOT NULL,
    export_data BYTEA,
    file_path TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI PHASE 3 TABLES
-- =====================================================

-- AI content recommendations table
CREATE TABLE IF NOT EXISTS public.ai_content_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL,
    recommendation_type TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    reason TEXT,
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI resume suggestions table
CREATE TABLE IF NOT EXISTS public.ai_resume_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES public.living_resumes(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI learning analytics table
CREATE TABLE IF NOT EXISTS public.ai_learning_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    analytics_type TEXT NOT NULL,
    analytics_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REAL-TIME FEATURES TABLES
-- =====================================================

-- Real-time notifications table
CREATE TABLE IF NOT EXISTS public.realtime_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WebSocket connections table
CREATE TABLE IF NOT EXISTS public.websocket_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    connection_id TEXT NOT NULL,
    room_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    disconnected_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Mentors indexes
CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON public.mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_expertise ON public.mentors USING GIN(expertise_areas);
CREATE INDEX IF NOT EXISTS idx_mentors_available ON public.mentors(is_available);

-- Project reviews indexes
CREATE INDEX IF NOT EXISTS idx_project_reviews_project_id ON public.project_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_reviewer_id ON public.project_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_status ON public.project_reviews(status);

-- Project submissions indexes
CREATE INDEX IF NOT EXISTS idx_project_submissions_project_id ON public.project_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_user_id ON public.project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON public.project_submissions(status);

-- Living resumes indexes
CREATE INDEX IF NOT EXISTS idx_living_resumes_user_id ON public.living_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_living_resumes_public ON public.living_resumes(is_public);
CREATE INDEX IF NOT EXISTS idx_living_resumes_public_link ON public.living_resumes(public_link);

-- Resume sections indexes
CREATE INDEX IF NOT EXISTS idx_resume_sections_resume_id ON public.resume_sections(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_sections_type ON public.resume_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_resume_sections_order ON public.resume_sections(order_index);

-- Resume analytics indexes
CREATE INDEX IF NOT EXISTS idx_resume_analytics_resume_id ON public.resume_analytics(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_analytics_event_type ON public.resume_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_resume_analytics_created_at ON public.resume_analytics(created_at);

-- AI recommendations indexes
CREATE INDEX IF NOT EXISTS idx_ai_content_rec_user_id ON public.ai_content_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_rec_type ON public.ai_content_recommendations(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_resume_suggestions_resume_id ON public.ai_resume_suggestions(resume_id);

-- Real-time notifications indexes
CREATE INDEX IF NOT EXISTS idx_realtime_notifications_user_id ON public.realtime_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_notifications_unread ON public.realtime_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_websocket_connections_user_id ON public.websocket_connections(user_id);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample resume templates
INSERT INTO public.resume_templates (name, description, template_data) VALUES
('Modern Professional', 'Clean, contemporary design perfect for tech roles', '{"layout": "modern", "sections": ["experience", "education", "skills", "projects"]}'),
('Creative Portfolio', 'Bold, eye-catching design for creative professionals', '{"layout": "creative", "sections": ["projects", "skills", "experience", "education"]}'),
('Academic', 'Traditional format great for academic positions', '{"layout": "academic", "sections": ["education", "publications", "experience", "skills"]}'),
('Minimalist', 'Simple, clean design that works for any industry', '{"layout": "minimalist", "sections": ["experience", "skills", "education"]}')
ON CONFLICT (name) DO NOTHING;

-- Insert sample review criteria
INSERT INTO public.review_criteria (name, description, weight, category) VALUES
('Code Quality', 'Clean, readable, and well-structured code', 0.25, 'technical'),
('Functionality', 'Does the code work as intended', 0.20, 'technical'),
('Documentation', 'Clear comments and documentation', 0.15, 'technical'),
('Best Practices', 'Follows industry standards and conventions', 0.20, 'technical'),
('Creativity', 'Innovative solutions and approaches', 0.10, 'creative'),
('Problem Solving', 'Effective approach to solving problems', 0.10, 'analytical')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

-- This will show a success message when the script completes
DO $$
BEGIN
    RAISE NOTICE 'Phase 3 tables created successfully! All tables are ready to use.';
END $$;
