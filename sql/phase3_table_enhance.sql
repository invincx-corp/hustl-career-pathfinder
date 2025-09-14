-- Phase 3 Table Structure Fixes
-- This fixes the actual table structure issues

-- =====================================================
-- FIX RESUME_TEMPLATES TABLE
-- =====================================================

-- Add missing template_data column to resume_templates
ALTER TABLE public.resume_templates 
ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT '{}';

-- Add missing is_active column if it doesn't exist
ALTER TABLE public.resume_templates 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- =====================================================
-- FIX ANY OTHER MISSING COLUMNS
-- =====================================================

-- Ensure all tables have the correct structure
-- This will add any missing columns without breaking existing data

-- Fix mentors table
ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS expertise_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{}';

-- Fix project_reviews table
ALTER TABLE public.project_reviews 
ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS improvements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Fix living_resumes table
ALTER TABLE public.living_resumes 
ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS template_id UUID,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS public_link TEXT UNIQUE;

-- Fix resume_sections table
ALTER TABLE public.resume_sections 
ADD COLUMN IF NOT EXISTS section_type TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- Fix resume_analytics table
ALTER TABLE public.resume_analytics 
ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS event_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Fix resume_exports table
ALTER TABLE public.resume_exports 
ADD COLUMN IF NOT EXISTS export_type TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS export_data BYTEA,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Fix AI tables
ALTER TABLE public.ai_content_recommendations 
ADD COLUMN IF NOT EXISTS content_id UUID NOT NULL,
ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS recommendation_type TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS is_applied BOOLEAN DEFAULT FALSE;

ALTER TABLE public.ai_resume_suggestions 
ADD COLUMN IF NOT EXISTS suggestion_type TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS is_applied BOOLEAN DEFAULT FALSE;

ALTER TABLE public.ai_learning_analytics 
ADD COLUMN IF NOT EXISTS analytics_type TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS analytics_data JSONB DEFAULT '{}';

-- Fix real-time tables
ALTER TABLE public.realtime_notifications 
ADD COLUMN IF NOT EXISTS notification_type TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS message TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE public.websocket_connections 
ADD COLUMN IF NOT EXISTS connection_id TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS room_id TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS disconnected_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Phase 3 table structure fixed successfully!';
    RAISE NOTICE 'All tables now have the correct columns.';
END $$;
