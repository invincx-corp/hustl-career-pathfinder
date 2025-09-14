-- =====================================================
-- PHASE 4: PUBLIC USER PROFILES FOR NETWORKING (FINAL FIXED VERSION)
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

-- Create indexes for better performance
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

-- Enable RLS
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

-- Create RLS policies for public_profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.public_profiles
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own profile" ON public.public_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.public_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.public_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON public.public_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for privacy_settings
CREATE POLICY "Users can manage their own privacy settings" ON public.privacy_settings
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user_connections
CREATE POLICY "Users can view their own connections" ON public.user_connections
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create connection requests" ON public.user_connections
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own connection requests" ON public.user_connections
    FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Create RLS policies for profile_views
CREATE POLICY "Users can view their own profile views" ON public.profile_views
    FOR SELECT USING (auth.uid() = viewer_id OR auth.uid() = (SELECT user_id FROM public.public_profiles WHERE id = profile_id));

CREATE POLICY "Users can create profile views" ON public.profile_views
    FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Create RLS policies for profile_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.profile_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations" ON public.profile_recommendations
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for profile_activities
CREATE POLICY "Users can view public activities" ON public.profile_activities
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own activities" ON public.profile_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" ON public.profile_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for profile_bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON public.profile_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for profile_tags
CREATE POLICY "Users can manage their own tags" ON public.profile_tags
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for profile_endorsements
CREATE POLICY "Users can view endorsements for public profiles" ON public.profile_endorsements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.public_profiles 
            WHERE user_id = endorsee_id AND is_public = true
        )
    );

CREATE POLICY "Users can create endorsements" ON public.profile_endorsements
    FOR INSERT WITH CHECK (auth.uid() = endorser_id);

CREATE POLICY "Users can update their own endorsements" ON public.profile_endorsements
    FOR UPDATE USING (auth.uid() = endorser_id);

-- Create RLS policies for profile_reports
CREATE POLICY "Users can create reports" ON public.profile_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.profile_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create functions for profile management
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

-- Create triggers
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

-- Create function to get user's public profile
CREATE OR REPLACE FUNCTION get_user_public_profile(profile_user_id UUID, requesting_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    username VARCHAR(50),
    display_name VARCHAR(100),
    bio TEXT,
    headline VARCHAR(200),
    location VARCHAR(100),
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    twitter_url VARCHAR(255),
    profile_image_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    skills TEXT[],
    interests TEXT[],
    industries TEXT[],
    experience_level VARCHAR(20),
    availability_status VARCHAR(20),
    looking_for TEXT[],
    portfolio_projects JSONB,
    achievements JSONB,
    certifications JSONB,
    education JSONB,
    work_experience JSONB,
    social_links JSONB,
    contact_preferences JSONB,
    is_public BOOLEAN,
    is_verified BOOLEAN,
    verification_badges JSONB,
    profile_views INTEGER,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    connection_status VARCHAR(20),
    can_view_contact BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.*,
        COALESCE(uc.status, 'not_connected') as connection_status,
        CASE 
            WHEN requesting_user_id IS NULL THEN false
            WHEN pp.user_id = requesting_user_id THEN true
            WHEN uc.status = 'accepted' THEN true
            WHEN ps.contact_visibility = 'public' THEN true
            WHEN ps.contact_visibility = 'connections' AND uc.status = 'accepted' THEN true
            ELSE false
        END as can_view_contact
    FROM public.public_profiles pp
    LEFT JOIN public.user_connections uc ON (
        uc.requester_id = requesting_user_id AND uc.receiver_id = pp.user_id
    ) OR (
        uc.receiver_id = requesting_user_id AND uc.requester_id = pp.user_id
    )
    LEFT JOIN public.privacy_settings ps ON ps.user_id = pp.user_id
    WHERE pp.user_id = profile_user_id
    AND (pp.is_public = true OR pp.user_id = requesting_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search public profiles
CREATE OR REPLACE FUNCTION search_public_profiles(
    search_query TEXT DEFAULT '',
    skills_filter TEXT[] DEFAULT NULL,
    industries_filter TEXT[] DEFAULT NULL,
    experience_level_filter VARCHAR(20) DEFAULT NULL,
    location_filter VARCHAR(100) DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    username VARCHAR(50),
    display_name VARCHAR(100),
    bio TEXT,
    headline VARCHAR(200),
    location VARCHAR(100),
    profile_image_url VARCHAR(500),
    skills TEXT[],
    interests TEXT[],
    industries TEXT[],
    experience_level VARCHAR(20),
    availability_status VARCHAR(20),
    profile_views INTEGER,
    last_active_at TIMESTAMP WITH TIME ZONE,
    match_score DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.id,
        pp.username,
        pp.display_name,
        pp.bio,
        pp.headline,
        pp.location,
        pp.profile_image_url,
        pp.skills,
        pp.interests,
        pp.industries,
        pp.experience_level,
        pp.availability_status,
        pp.profile_views,
        pp.last_active_at,
        CASE 
            WHEN search_query = '' THEN 1.0
            ELSE (
                CASE WHEN pp.display_name ILIKE '%' || search_query || '%' THEN 0.8 ELSE 0 END +
                CASE WHEN pp.headline ILIKE '%' || search_query || '%' THEN 0.6 ELSE 0 END +
                CASE WHEN pp.bio ILIKE '%' || search_query || '%' THEN 0.4 ELSE 0 END +
                CASE WHEN EXISTS (
                    SELECT 1 FROM unnest(pp.skills) as skill 
                    WHERE skill ILIKE '%' || search_query || '%'
                ) THEN 0.3 ELSE 0 END +
                CASE WHEN EXISTS (
                    SELECT 1 FROM unnest(pp.interests) as interest 
                    WHERE interest ILIKE '%' || search_query || '%'
                ) THEN 0.2 ELSE 0 END
            )
        END as match_score
    FROM public.public_profiles pp
    WHERE pp.is_public = true
    AND (search_query = '' OR (
        pp.display_name ILIKE '%' || search_query || '%' OR
        pp.headline ILIKE '%' || search_query || '%' OR
        pp.bio ILIKE '%' || search_query || '%' OR
        EXISTS (
            SELECT 1 FROM unnest(pp.skills) as skill 
            WHERE skill ILIKE '%' || search_query || '%'
        ) OR
        EXISTS (
            SELECT 1 FROM unnest(pp.interests) as interest 
            WHERE interest ILIKE '%' || search_query || '%'
        )
    ))
    AND (skills_filter IS NULL OR pp.skills && skills_filter)
    AND (industries_filter IS NULL OR pp.industries && industries_filter)
    AND (experience_level_filter IS NULL OR pp.experience_level = experience_level_filter)
    AND (location_filter IS NULL OR pp.location ILIKE '%' || location_filter || '%')
    ORDER BY match_score DESC, pp.profile_views DESC, pp.last_active_at DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get profile recommendations
CREATE OR REPLACE FUNCTION get_profile_recommendations(
    user_id UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    username VARCHAR(50),
    display_name VARCHAR(100),
    headline VARCHAR(200),
    location VARCHAR(100),
    profile_image_url VARCHAR(500),
    skills TEXT[],
    industries TEXT[],
    experience_level VARCHAR(20),
    recommendation_type VARCHAR(50),
    score DECIMAL(3,2),
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.id,
        pp.username,
        pp.display_name,
        pp.headline,
        pp.location,
        pp.profile_image_url,
        pp.skills,
        pp.industries,
        pp.experience_level,
        pr.recommendation_type,
        pr.score,
        pr.reason
    FROM public.profile_recommendations pr
    JOIN public.public_profiles pp ON pp.user_id = pr.recommended_user_id
    WHERE pr.user_id = get_profile_recommendations.user_id
    AND pp.is_public = true
    AND pr.is_viewed = false
    ORDER BY pr.score DESC, pr.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track profile view
CREATE OR REPLACE FUNCTION track_profile_view(
    profile_id UUID,
    viewer_id UUID DEFAULT NULL,
    view_source VARCHAR(50) DEFAULT 'direct'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profile_views (profile_id, viewer_id, view_source)
    VALUES (profile_id, viewer_id, view_source)
    ON CONFLICT DO NOTHING;
    
    UPDATE public.public_profiles 
    SET profile_views = profile_views + 1
    WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get connection suggestions
CREATE OR REPLACE FUNCTION get_connection_suggestions(
    user_id UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    username VARCHAR(50),
    display_name VARCHAR(100),
    headline VARCHAR(200),
    location VARCHAR(100),
    profile_image_url VARCHAR(500),
    skills TEXT[],
    industries TEXT[],
    experience_level VARCHAR(20),
    suggestion_reason TEXT,
    match_score DECIMAL(3,2)
) AS $$
DECLARE
    user_skills TEXT[];
    user_industries TEXT[];
    user_location VARCHAR(100);
BEGIN
    -- Get user's profile data
    SELECT skills, industries, location INTO user_skills, user_industries, user_location
    FROM public.public_profiles
    WHERE public_profiles.user_id = get_connection_suggestions.user_id;
    
    RETURN QUERY
    SELECT 
        pp.id,
        pp.username,
        pp.display_name,
        pp.headline,
        pp.location,
        pp.profile_image_url,
        pp.skills,
        pp.industries,
        pp.experience_level,
        CASE 
            WHEN pp.skills && user_skills THEN 'Shared skills: ' || array_to_string(pp.skills & user_skills, ', ')
            WHEN pp.industries && user_industries THEN 'Same industry: ' || array_to_string(pp.industries & user_industries, ', ')
            WHEN pp.location = user_location THEN 'Same location'
            ELSE 'Recommended for you'
        END as suggestion_reason,
        CASE 
            WHEN pp.skills && user_skills THEN 0.8
            WHEN pp.industries && user_industries THEN 0.6
            WHEN pp.location = user_location THEN 0.4
            ELSE 0.2
        END as match_score
    FROM public.public_profiles pp
    WHERE pp.user_id != get_connection_suggestions.user_id
    AND pp.is_public = true
    AND NOT EXISTS (
        SELECT 1 FROM public.user_connections uc
        WHERE (uc.requester_id = get_connection_suggestions.user_id AND uc.receiver_id = pp.user_id)
        OR (uc.receiver_id = get_connection_suggestions.user_id AND uc.requester_id = pp.user_id)
    )
    ORDER BY match_score DESC, pp.profile_views DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
