-- =====================================================
-- PHASE 4: MENTORSHIP & COMMUNITY DATABASE SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 4.1 MENTOR PROFILES & MATCHMAKING
-- =====================================================

-- Mentor profiles table
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bio TEXT,
    expertise_areas TEXT[] NOT NULL DEFAULT '{}',
    years_of_experience INTEGER NOT NULL DEFAULT 0,
    current_position VARCHAR(255),
    company VARCHAR(255),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    hourly_rate DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    languages TEXT[] DEFAULT '{"English"}',
    timezone VARCHAR(50) DEFAULT 'UTC',
    availability_schedule JSONB DEFAULT '{}',
    max_students INTEGER DEFAULT 10,
    current_students INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_sessions INTEGER DEFAULT 0,
    total_hours DECIMAL(8,2) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor specializations
CREATE TABLE IF NOT EXISTS public.mentor_specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'technical', 'soft_skills', 'career', 'domain_specific'
    skill VARCHAR(100) NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    years_experience INTEGER DEFAULT 0,
    certifications TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor availability slots
CREATE TABLE IF NOT EXISTS public.mentor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_recurring BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor sessions
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(50) DEFAULT 'one_on_one', -- 'one_on_one', 'group', 'workshop'
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
    meeting_url VARCHAR(500),
    meeting_id VARCHAR(255),
    meeting_password VARCHAR(255),
    session_notes TEXT,
    student_goals TEXT[] DEFAULT '{}',
    topics_covered TEXT[] DEFAULT '{}',
    action_items JSONB DEFAULT '{}',
    student_rating INTEGER CHECK (student_rating BETWEEN 1 AND 5),
    student_feedback TEXT,
    mentor_rating INTEGER CHECK (mentor_rating BETWEEN 1 AND 5),
    mentor_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor matching preferences
CREATE TABLE IF NOT EXISTS public.mentor_matching_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_mentor_types TEXT[] DEFAULT '{}', -- 'industry_expert', 'career_coach', 'technical_mentor'
    preferred_expertise TEXT[] DEFAULT '{}',
    preferred_experience_level VARCHAR(50) DEFAULT 'any', -- 'junior', 'mid', 'senior', 'executive', 'any'
    preferred_session_types TEXT[] DEFAULT '{"one_on_one"}',
    preferred_time_slots JSONB DEFAULT '{}',
    max_hourly_rate DECIMAL(10,2),
    preferred_languages TEXT[] DEFAULT '{"English"}',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4.2 VIRTUAL CAREER COACH (AI)
-- =====================================================

-- AI conversation history
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    message_type VARCHAR(50) NOT NULL, -- 'user', 'ai', 'system'
    content TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    intent_category VARCHAR(100),
    confidence_score DECIMAL(3,2),
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI coaching sessions
CREATE TABLE IF NOT EXISTS public.ai_coaching_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) DEFAULT 'general', -- 'general', 'career_planning', 'skill_development', 'crisis_support'
    initial_context JSONB DEFAULT '{}',
    goals TEXT[] DEFAULT '{}',
    topics_discussed TEXT[] DEFAULT '{}',
    insights_generated JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    escalation_triggered BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    escalation_to_human BOOLEAN DEFAULT FALSE,
    session_rating INTEGER CHECK (session_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER
);

-- AI model configurations
CREATE TABLE IF NOT EXISTS public.ai_model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    provider VARCHAR(100) NOT NULL, -- 'openai', 'anthropic', 'google', 'custom'
    api_endpoint VARCHAR(500),
    api_key_encrypted TEXT,
    model_parameters JSONB DEFAULT '{}',
    context_window INTEGER DEFAULT 4000,
    max_tokens INTEGER DEFAULT 1000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4.3 COMMUNITY FEATURES
-- =====================================================

-- User public profiles
CREATE TABLE IF NOT EXISTS public.user_public_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_picture_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    location VARCHAR(255),
    website_url VARCHAR(500),
    social_links JSONB DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    current_position VARCHAR(255),
    company VARCHAR(255),
    is_public BOOLEAN DEFAULT TRUE,
    is_mentor BOOLEAN DEFAULT FALSE,
    is_student BOOLEAN DEFAULT TRUE,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User connections (follow/following)
CREATE TABLE IF NOT EXISTS public.user_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_type VARCHAR(50) DEFAULT 'follow', -- 'follow', 'mentor_student', 'peer'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'blocked', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Direct messages
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
    attachment_url VARCHAR(500),
    attachment_type VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion forums
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7), -- hex color
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    post_type VARCHAR(50) DEFAULT 'discussion', -- 'discussion', 'question', 'announcement', 'poll'
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum replies
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT FALSE, -- for Q&A posts
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study groups
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(255) NOT NULL,
    skill_level VARCHAR(50) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced', 'mixed'
    max_members INTEGER DEFAULT 20,
    current_members INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    meeting_schedule JSONB DEFAULT '{}',
    meeting_link VARCHAR(500),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study group members
CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Peer reviews
CREATE TABLE IF NOT EXISTS public.peer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    review_type VARCHAR(50) NOT NULL, -- 'project', 'skill', 'portfolio', 'resume'
    target_id UUID, -- ID of the project/skill being reviewed
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT NOT NULL,
    categories JSONB DEFAULT '{}', -- structured feedback categories
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Mentor profiles indexes
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_expertise ON public.mentor_profiles USING GIN(expertise_areas);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_active ON public.mentor_profiles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_rating ON public.mentor_profiles(rating DESC);

-- Mentor sessions indexes
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_id ON public.mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_student_id ON public.mentor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_scheduled_at ON public.mentor_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_status ON public.mentor_sessions(status);

-- AI conversations indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON public.ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON public.ai_conversations(created_at DESC);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_follower ON public.user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following ON public.user_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON public.direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_matching_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;

-- Mentor profiles policies
CREATE POLICY "Users can view active mentor profiles" ON public.mentor_profiles
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can manage their own mentor profile" ON public.mentor_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Mentor sessions policies
CREATE POLICY "Users can view their own sessions" ON public.mentor_sessions
    FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = student_id);

CREATE POLICY "Users can create sessions" ON public.mentor_sessions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own sessions" ON public.mentor_sessions
    FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- AI conversations policies
CREATE POLICY "Users can view their own AI conversations" ON public.ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI conversations" ON public.ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community policies
CREATE POLICY "Users can view public profiles" ON public.user_public_profiles
    FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own public profile" ON public.user_public_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages" ON public.direct_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.direct_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view forum posts" ON public.forum_posts
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can create forum posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own forum posts" ON public.forum_posts
    FOR UPDATE USING (auth.uid() = author_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_mentor_profiles_updated_at BEFORE UPDATE ON public.mentor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_sessions_updated_at BEFORE UPDATE ON public.mentor_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_public_profiles_updated_at BEFORE UPDATE ON public.user_public_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON public.study_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample forum categories
INSERT INTO public.forum_categories (name, description, icon, color, sort_order) VALUES
('General Discussion', 'General topics and discussions', 'message-circle', '#3B82F6', 1),
('Career Advice', 'Career guidance and advice', 'briefcase', '#10B981', 2),
('Technical Help', 'Technical questions and solutions', 'code', '#F59E0B', 3),
('Study Groups', 'Find and join study groups', 'users', '#8B5CF6', 4),
('Project Showcase', 'Show off your projects', 'star', '#EF4444', 5),
('Mentorship', 'Mentor and mentee discussions', 'heart', '#EC4899', 6)
ON CONFLICT DO NOTHING;

-- Insert sample AI model config
INSERT INTO public.ai_model_configs (model_name, model_version, provider, model_parameters, is_active) VALUES
('gpt-4', 'gpt-4-turbo-preview', 'openai', '{"temperature": 0.7, "max_tokens": 1000}', TRUE),
('claude-3', 'claude-3-sonnet-20240229', 'anthropic', '{"temperature": 0.7, "max_tokens": 1000}', TRUE)
ON CONFLICT DO NOTHING;

COMMIT;
