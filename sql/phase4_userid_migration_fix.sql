-- PHASE 4: MIGRATION FIX
-- This script properly handles existing tables and adds missing columns

-- Step 1: Add missing columns to existing tables
-- First, check if user_id column exists and add it if missing

-- Add user_id to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Update existing records to set user_id = id
        UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;
        -- Make user_id NOT NULL after updating
        ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Add user_id to mentors table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mentors' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.mentors ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Update existing records to set user_id = id
        UPDATE public.mentors SET user_id = id WHERE user_id IS NULL;
        -- Make user_id NOT NULL after updating
        ALTER TABLE public.mentors ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Add user_id to projects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Update existing records to set user_id = id
        UPDATE public.projects SET user_id = id WHERE user_id IS NULL;
        -- Make user_id NOT NULL after updating
        ALTER TABLE public.projects ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Add user_id to learning_progress table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learning_progress' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.learning_progress ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Update existing records to set user_id = id
        UPDATE public.learning_progress SET user_id = id WHERE user_id IS NULL;
        -- Make user_id NOT NULL after updating
        ALTER TABLE public.learning_progress ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Add user_id to user_skills table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_skills' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_skills ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Update existing records to set user_id = id
        UPDATE public.user_skills SET user_id = id WHERE user_id IS NULL;
        -- Make user_id NOT NULL after updating
        ALTER TABLE public.user_skills ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Add user_id to career_goals table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'career_goals' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.career_goals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Update existing records to set user_id = id
        UPDATE public.career_goals SET user_id = id WHERE user_id IS NULL;
        -- Make user_id NOT NULL after updating
        ALTER TABLE public.career_goals ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Add user_id to mentorship_sessions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mentorship_sessions' 
        AND column_name = 'mentee_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.mentorship_sessions ADD COLUMN mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Update existing records to set mentee_id = id
        UPDATE public.mentorship_sessions SET mentee_id = id WHERE mentee_id IS NULL;
        -- Make mentee_id NOT NULL after updating
        ALTER TABLE public.mentorship_sessions ALTER COLUMN mentee_id SET NOT NULL;
    END IF;
END $$;

-- Add user_id to notifications table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Update existing records to set user_id = id
        UPDATE public.notifications SET user_id = id WHERE user_id IS NULL;
        -- Make user_id NOT NULL after updating
        ALTER TABLE public.notifications ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Step 2: Create Phase 4 specific tables
-- These are new tables that should be created

-- Mentor Profiles System
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    expertise_areas TEXT[] DEFAULT '{}',
    years_experience INTEGER DEFAULT 0,
    credentials TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    achievements TEXT[] DEFAULT '{}',
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentor_specializations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    specialization TEXT NOT NULL,
    proficiency_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentor_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    achievement_title TEXT NOT NULL,
    description TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE,
    verification_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification System
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Coaching System
CREATE TABLE IF NOT EXISTS public.ai_coaching_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id TEXT,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    sentiment JSONB,
    insights JSONB,
    context_used BOOLEAN DEFAULT FALSE,
    needs_escalation BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    escalation_priority TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_coaching_summaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_coaching_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    coaching_style TEXT DEFAULT 'balanced',
    response_length TEXT DEFAULT 'medium',
    topics_of_interest TEXT[] DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    escalation_threshold DECIMAL(3,2) DEFAULT 0.7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Escalation System
CREATE TABLE IF NOT EXISTS public.escalation_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    original_message TEXT NOT NULL,
    escalation_reason TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'accepted', 'in_session', 'resolved', 'cancelled')),
    factors JSONB DEFAULT '{}',
    assigned_mentor_id UUID REFERENCES public.mentors(id),
    assigned_by UUID REFERENCES auth.users(id),
    accepted_by UUID REFERENCES auth.users(id),
    resolved_by UUID REFERENCES auth.users(id),
    session_id UUID REFERENCES public.mentorship_sessions(id),
    resolution TEXT,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    acceptance_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    session_started_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    rated_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.escalation_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    escalation_id UUID REFERENCES public.escalation_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('escalation_created', 'mentor_assigned', 'session_scheduled', 'escalation_resolved', 'rating_requested')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.escalation_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    total_escalations INTEGER DEFAULT 0,
    pending_escalations INTEGER DEFAULT 0,
    assigned_escalations INTEGER DEFAULT 0,
    resolved_escalations INTEGER DEFAULT 0,
    cancelled_escalations INTEGER DEFAULT 0,
    urgent_escalations INTEGER DEFAULT 0,
    high_priority_escalations INTEGER DEFAULT 0,
    medium_priority_escalations INTEGER DEFAULT 0,
    low_priority_escalations INTEGER DEFAULT 0,
    average_resolution_time INTEGER DEFAULT 0,
    mentor_assignments INTEGER DEFAULT 0,
    user_satisfaction_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Context Awareness System
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.career_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    milestone_title TEXT NOT NULL,
    description TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE,
    category TEXT CHECK (category IN ('education', 'certification', 'promotion', 'project', 'skill', 'award', 'other')),
    verification_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    position_title TEXT NOT NULL,
    application_url TEXT,
    status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'interview', 'rejected', 'accepted', 'withdrawn')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.networking_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('meeting', 'conference', 'webinar', 'coffee_chat', 'linkedin_connection', 'email_exchange', 'phone_call', 'other')),
    contact_name TEXT,
    contact_company TEXT,
    contact_email TEXT,
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mood_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mood_level INTEGER NOT NULL CHECK (mood_level >= 1 AND mood_level <= 5),
    mood_description TEXT,
    factors TEXT[],
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stress_indicators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 5),
    stress_source TEXT,
    coping_strategies TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing')),
    preferred_topics TEXT[] DEFAULT '{}',
    difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily', 'weekly', 'never')),
    privacy_level TEXT DEFAULT 'medium' CHECK (privacy_level IN ('low', 'medium', 'high')),
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentor_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    relationship_type TEXT DEFAULT 'mentorship' CHECK (relationship_type IN ('mentorship', 'coaching', 'peer', 'sponsor')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    goals TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, mentee_id)
);

CREATE TABLE IF NOT EXISTS public.mentorship_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    mentor_id UUID REFERENCES public.mentors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    skill_name TEXT NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id, skill_name)
);

CREATE TABLE IF NOT EXISTS public.project_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    strengths TEXT[],
    improvements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    notification_types JSONB DEFAULT '{}',
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_usage_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feature_used TEXT NOT NULL,
    session_duration INTEGER,
    session_count INTEGER DEFAULT 1,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_engagement (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    engagement_score DECIMAL(3,2) DEFAULT 0.0 CHECK (engagement_score >= 0 AND engagement_score <= 1),
    sessions_count INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    features_used TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON public.mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_career_goals_user_id ON public.career_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentor_id ON public.mentorship_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentee_id ON public.mentorship_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Step 4: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 5: Create basic RLS policies
CREATE POLICY "Users can manage their own profiles" ON public.profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mentors" ON public.mentors
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects" ON public.projects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own learning progress" ON public.learning_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills" ON public.user_skills
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own career goals" ON public.career_goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can manage all data" ON public.profiles
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all mentors" ON public.mentors
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all projects" ON public.projects
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all learning progress" ON public.learning_progress
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all user skills" ON public.user_skills
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all career goals" ON public.career_goals
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Step 6: Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mentors_updated_at 
    BEFORE UPDATE ON public.mentors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_learning_progress_updated_at 
    BEFORE UPDATE ON public.learning_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_skills_updated_at 
    BEFORE UPDATE ON public.user_skills 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_career_goals_updated_at 
    BEFORE UPDATE ON public.career_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mentorship_sessions_updated_at 
    BEFORE UPDATE ON public.mentorship_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Success message
SELECT 'Phase 4 migration completed successfully! All tables created and columns added.' as status;
