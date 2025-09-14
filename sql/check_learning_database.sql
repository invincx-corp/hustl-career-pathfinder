-- Phase 3 Debug - Create tables one by one to find the error
-- Run this file in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE TABLES ONE BY ONE
-- =====================================================

-- 1. Create mentors table
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

-- 2. Create project_reviews table
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

-- 3. Create project_submissions table
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

-- 4. Create review_criteria table
CREATE TABLE IF NOT EXISTS public.review_criteria (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    weight DECIMAL(3,2) DEFAULT 0.25,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create review_scores table
CREATE TABLE IF NOT EXISTS public.review_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID NOT NULL,
    criteria_id UUID NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create living_resumes table
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

-- 7. Create resume_sections table
CREATE TABLE IF NOT EXISTS public.resume_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resume_id UUID NOT NULL,
    section_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create resume_templates table
CREATE TABLE IF NOT EXISTS public.resume_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    template_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create resume_analytics table
CREATE TABLE IF NOT EXISTS public.resume_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resume_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create resume_exports table
CREATE TABLE IF NOT EXISTS public.resume_exports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resume_id UUID NOT NULL,
    export_type TEXT NOT NULL,
    export_data BYTEA,
    file_path TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create ai_content_recommendations table
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

-- 12. Create ai_resume_suggestions table
CREATE TABLE IF NOT EXISTS public.ai_resume_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resume_id UUID NOT NULL,
    suggestion_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Create ai_learning_analytics table
CREATE TABLE IF NOT EXISTS public.ai_learning_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    analytics_type TEXT NOT NULL,
    analytics_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Create realtime_notifications table
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

-- 15. Create websocket_connections table
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
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'All Phase 3 tables created successfully!';
END $$;
