-- =====================================================
-- PHASE 4: PUBLIC USER PROFILES FOR NETWORKING (MINIMAL VERSION)
-- =====================================================

-- Create public user profiles table
CREATE TABLE IF NOT EXISTS public.public_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    headline VARCHAR(200),
    location VARCHAR(100),
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    twitter_url VARCHAR(255),
    profile_image_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    industries TEXT[] DEFAULT '{}',
    experience_level VARCHAR(20) DEFAULT 'entry',
    availability_status VARCHAR(20) DEFAULT 'available',
    looking_for TEXT[] DEFAULT '{}',
    portfolio_projects JSONB DEFAULT '[]',
    achievements JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    work_experience JSONB DEFAULT '[]',
    social_links JSONB DEFAULT '{}',
    contact_preferences JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_badges JSONB DEFAULT '[]',
    profile_views INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create privacy settings table
CREATE TABLE IF NOT EXISTS public.privacy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_visibility VARCHAR(20) DEFAULT 'public',
    show_email BOOLEAN DEFAULT false,
    show_phone BOOLEAN DEFAULT false,
    show_location BOOLEAN DEFAULT true,
    show_skills BOOLEAN DEFAULT true,
    show_experience BOOLEAN DEFAULT true,
    show_education BOOLEAN DEFAULT true,
    show_projects BOOLEAN DEFAULT true,
    show_achievements BOOLEAN DEFAULT true,
    show_connections BOOLEAN DEFAULT true,
    show_activity BOOLEAN DEFAULT true,
    allow_connection_requests BOOLEAN DEFAULT true,
    allow_messages BOOLEAN DEFAULT true,
    allow_profile_views BOOLEAN DEFAULT true,
    search_visibility VARCHAR(20) DEFAULT 'public',
    contact_visibility VARCHAR(20) DEFAULT 'connections',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create user connections table
CREATE TABLE IF NOT EXISTS public.user_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    connection_type VARCHAR(20) DEFAULT 'professional',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(requester_id, receiver_id),
    CHECK(requester_id != receiver_id)
);

-- Create profile views table
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.public_profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_source VARCHAR(50)
);

-- Create profile recommendations table
CREATE TABLE IF NOT EXISTS public.profile_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommended_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    reason TEXT,
    is_viewed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recommended_user_id, recommendation_type)
);

-- Create profile activities table
CREATE TABLE IF NOT EXISTS public.profile_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile bookmarks table
CREATE TABLE IF NOT EXISTS public.profile_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bookmarked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bookmark_type VARCHAR(20) DEFAULT 'profile',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, bookmarked_user_id)
);

-- Create profile tags table
CREATE TABLE IF NOT EXISTS public.profile_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    tag_type VARCHAR(20) DEFAULT 'custom',
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tag_name)
);

-- Create profile endorsements table
CREATE TABLE IF NOT EXISTS public.profile_endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endorser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endorsee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    endorsement_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(endorser_id, endorsee_id, skill_name),
    CHECK(endorser_id != endorsee_id)
);

-- Create profile reports table
CREATE TABLE IF NOT EXISTS public.profile_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    report_reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    CHECK(reporter_id != reported_user_id)
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_public_profiles_user_id ON public.public_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_public_profiles_username ON public.public_profiles(username);
CREATE INDEX IF NOT EXISTS idx_public_profiles_is_public ON public.public_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_public_profiles_skills ON public.public_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_public_profiles_interests ON public.public_profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_public_profiles_industries ON public.public_profiles USING GIN(industries);
CREATE INDEX IF NOT EXISTS idx_public_profiles_experience_level ON public.public_profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_public_profiles_location ON public.public_profiles(location);
CREATE INDEX IF NOT EXISTS idx_public_profiles_last_active ON public.public_profiles(last_active_at);

CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON public.privacy_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON public.user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_receiver ON public.user_connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);
CREATE INDEX IF NOT EXISTS idx_user_connections_connection_type ON public.user_connections(connection_type);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON public.profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON public.profile_views(viewed_at);

CREATE INDEX IF NOT EXISTS idx_profile_recommendations_user ON public.profile_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_recommendations_recommended ON public.profile_recommendations(recommended_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_recommendations_type ON public.profile_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_profile_recommendations_score ON public.profile_recommendations(score);

CREATE INDEX IF NOT EXISTS idx_profile_activities_user ON public.profile_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_activities_type ON public.profile_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_profile_activities_created_at ON public.profile_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_profile_bookmarks_user ON public.profile_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_bookmarks_bookmarked ON public.profile_bookmarks(bookmarked_user_id);

CREATE INDEX IF NOT EXISTS idx_profile_tags_user ON public.profile_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_tags_name ON public.profile_tags(tag_name);

CREATE INDEX IF NOT EXISTS idx_profile_endorsements_endorser ON public.profile_endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_profile_endorsements_endorsee ON public.profile_endorsements(endorsee_id);
CREATE INDEX IF NOT EXISTS idx_profile_endorsements_skill ON public.profile_endorsements(skill_name);

CREATE INDEX IF NOT EXISTS idx_profile_reports_reporter ON public.profile_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_profile_reports_reported ON public.profile_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_reports_status ON public.profile_reports(status);

-- Enable RLS (but don't create policies yet)
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;

-- Create basic update functions
CREATE OR REPLACE FUNCTION update_public_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_privacy_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_profile_recommendations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_profile_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create basic triggers
CREATE TRIGGER update_public_profiles_updated_at
    BEFORE UPDATE ON public.public_profiles
    FOR EACH ROW EXECUTE FUNCTION update_public_profile_updated_at();

CREATE TRIGGER update_privacy_settings_updated_at
    BEFORE UPDATE ON public.privacy_settings
    FOR EACH ROW EXECUTE FUNCTION update_privacy_settings_updated_at();

CREATE TRIGGER update_user_connections_updated_at
    BEFORE UPDATE ON public.user_connections
    FOR EACH ROW EXECUTE FUNCTION update_user_connections_updated_at();

CREATE TRIGGER update_profile_recommendations_updated_at
    BEFORE UPDATE ON public.profile_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_profile_recommendations_updated_at();

CREATE TRIGGER update_profile_reports_updated_at
    BEFORE UPDATE ON public.profile_reports
    FOR EACH ROW EXECUTE FUNCTION update_profile_reports_updated_at();
