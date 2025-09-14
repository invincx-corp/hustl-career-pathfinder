-- PHASE 4: CONTEXT-AWARE AI RESPONSES - DATABASE SCHEMA
-- This script creates the database schema for context-aware AI responses and user context management

-- Create 'user_activity_log' table for tracking user activities
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'learning_goals' table for user learning objectives
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

-- Create 'career_milestones' table for career achievements
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

-- Create 'job_applications' table for tracking job applications
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

-- Create 'networking_activities' table for professional networking
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

-- Create 'mood_tracking' table for emotional state monitoring
CREATE TABLE IF NOT EXISTS public.mood_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mood_level INTEGER NOT NULL CHECK (mood_level >= 1 AND mood_level <= 5),
    mood_description TEXT,
    factors TEXT[], -- Array of factors affecting mood
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'stress_indicators' table for stress monitoring
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

-- Create 'user_preferences' table for user customization
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

-- Create 'mentor_relationships' table for mentor-mentee relationships
CREATE TABLE IF NOT EXISTS public.mentor_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Create 'mentorship_goals' table for mentorship objectives
CREATE TABLE IF NOT EXISTS public.mentorship_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    mentor_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'project_skills' table for skills associated with projects
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

-- Create 'project_reviews' table for project feedback
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

-- Create 'notification_preferences' table for user notification settings
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

-- Create 'app_usage_logs' table for tracking app usage patterns
CREATE TABLE IF NOT EXISTS public.app_usage_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feature_used TEXT NOT NULL,
    session_duration INTEGER, -- in seconds
    session_count INTEGER DEFAULT 1,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'user_engagement' table for engagement metrics
CREATE TABLE IF NOT EXISTS public.user_engagement (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    engagement_score DECIMAL(3,2) DEFAULT 0.0 CHECK (engagement_score >= 0 AND engagement_score <= 1),
    sessions_count INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in minutes
    features_used TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON public.user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_learning_goals_user_id ON public.learning_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_status ON public.learning_goals(status);
CREATE INDEX IF NOT EXISTS idx_learning_goals_target_date ON public.learning_goals(target_date);

CREATE INDEX IF NOT EXISTS idx_career_milestones_user_id ON public.career_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_career_milestones_achieved_at ON public.career_milestones(achieved_at);
CREATE INDEX IF NOT EXISTS idx_career_milestones_category ON public.career_milestones(category);

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications(applied_at);

CREATE INDEX IF NOT EXISTS idx_networking_activities_user_id ON public.networking_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_networking_activities_activity_type ON public.networking_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_networking_activities_activity_date ON public.networking_activities(activity_date);

CREATE INDEX IF NOT EXISTS idx_mood_tracking_user_id ON public.mood_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_tracking_created_at ON public.mood_tracking(created_at);

CREATE INDEX IF NOT EXISTS idx_stress_indicators_user_id ON public.stress_indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_stress_indicators_created_at ON public.stress_indicators(created_at);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_mentor_relationships_mentor_id ON public.mentor_relationships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_relationships_mentee_id ON public.mentor_relationships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_relationships_status ON public.mentor_relationships(status);

CREATE INDEX IF NOT EXISTS idx_mentorship_goals_user_id ON public.mentorship_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_goals_mentor_id ON public.mentorship_goals(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_goals_status ON public.mentorship_goals(status);

CREATE INDEX IF NOT EXISTS idx_project_skills_user_id ON public.project_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_project_id ON public.project_skills(project_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_skill_name ON public.project_skills(skill_name);

CREATE INDEX IF NOT EXISTS idx_project_reviews_user_id ON public.project_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_project_id ON public.project_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_rating ON public.project_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_app_usage_logs_user_id ON public.app_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_app_usage_logs_feature_used ON public.app_usage_logs(feature_used);
CREATE INDEX IF NOT EXISTS idx_app_usage_logs_created_at ON public.app_usage_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON public.user_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_date ON public.user_engagement(date);

-- Add RLS policies
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.networking_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;

-- Users can manage their own data
CREATE POLICY "Users can manage their own activity logs" ON public.user_activity_log
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own learning goals" ON public.learning_goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own career milestones" ON public.career_milestones
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own job applications" ON public.job_applications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own networking activities" ON public.networking_activities
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mood tracking" ON public.mood_tracking
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own stress indicators" ON public.stress_indicators
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mentor relationships" ON public.mentor_relationships
    FOR ALL USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can manage their own mentorship goals" ON public.mentorship_goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own project skills" ON public.project_skills
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own project reviews" ON public.project_reviews
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own usage logs" ON public.app_usage_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own engagement data" ON public.user_engagement
    FOR ALL USING (auth.uid() = user_id);

-- Admins can manage all data
CREATE POLICY "Admins can manage all activity logs" ON public.user_activity_log
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all learning goals" ON public.learning_goals
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all career milestones" ON public.career_milestones
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all job applications" ON public.job_applications
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all networking activities" ON public.networking_activities
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all mood tracking" ON public.mood_tracking
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all stress indicators" ON public.stress_indicators
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all preferences" ON public.user_preferences
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all mentor relationships" ON public.mentor_relationships
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all mentorship goals" ON public.mentorship_goals
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all project skills" ON public.project_skills
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all project reviews" ON public.project_reviews
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all notification preferences" ON public.notification_preferences
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all usage logs" ON public.app_usage_logs
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all engagement data" ON public.user_engagement
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_activity_log_updated_at 
    BEFORE UPDATE ON public.user_activity_log 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_learning_goals_updated_at 
    BEFORE UPDATE ON public.learning_goals 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_career_milestones_updated_at 
    BEFORE UPDATE ON public.career_milestones 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_job_applications_updated_at 
    BEFORE UPDATE ON public.job_applications 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_networking_activities_updated_at 
    BEFORE UPDATE ON public.networking_activities 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_mood_tracking_updated_at 
    BEFORE UPDATE ON public.mood_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_stress_indicators_updated_at 
    BEFORE UPDATE ON public.stress_indicators 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_mentor_relationships_updated_at 
    BEFORE UPDATE ON public.mentor_relationships 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_mentorship_goals_updated_at 
    BEFORE UPDATE ON public.mentorship_goals 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_project_skills_updated_at 
    BEFORE UPDATE ON public.project_skills 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_project_reviews_updated_at 
    BEFORE UPDATE ON public.project_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at 
    BEFORE UPDATE ON public.notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

CREATE TRIGGER update_user_engagement_updated_at 
    BEFORE UPDATE ON public.user_engagement 
    FOR EACH ROW EXECUTE FUNCTION update_context_updated_at();

-- Create function to calculate user engagement score
CREATE OR REPLACE FUNCTION calculate_user_engagement_score(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    engagement_score DECIMAL(3,2) := 0.0;
    sessions_count INTEGER := 0;
    time_spent INTEGER := 0;
    features_used_count INTEGER := 0;
    total_possible_score DECIMAL(3,2) := 1.0;
BEGIN
    -- Get engagement data for the target date
    SELECT 
        COALESCE(sessions_count, 0),
        COALESCE(time_spent, 0),
        COALESCE(array_length(features_used, 1), 0)
    INTO sessions_count, time_spent, features_used_count
    FROM public.user_engagement
    WHERE user_id = user_uuid AND date = target_date;
    
    -- Calculate engagement score based on multiple factors
    -- Sessions weight: 0.3, Time spent weight: 0.4, Features used weight: 0.3
    engagement_score := 
        (LEAST(sessions_count, 10) / 10.0) * 0.3 +
        (LEAST(time_spent, 120) / 120.0) * 0.4 +
        (LEAST(features_used_count, 5) / 5.0) * 0.3;
    
    -- Ensure score is between 0 and 1
    engagement_score := GREATEST(0.0, LEAST(1.0, engagement_score));
    
    RETURN engagement_score;
END;
$$ language 'plpgsql';

-- Create function to get user context summary
CREATE OR REPLACE FUNCTION get_user_context_summary(user_uuid UUID)
RETURNS TABLE (
    profile_completeness INTEGER,
    learning_progress DECIMAL(5,2),
    career_stage TEXT,
    emotional_state TEXT,
    engagement_level TEXT,
    last_active TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH profile_data AS (
        SELECT 
            CASE 
                WHEN p.full_name IS NOT NULL THEN 1 ELSE 0
            END +
            CASE 
                WHEN p.role IS NOT NULL THEN 1 ELSE 0
            END +
            CASE 
                WHEN p.industry IS NOT NULL THEN 1 ELSE 0
            END +
            CASE 
                WHEN p.location IS NOT NULL THEN 1 ELSE 0
            END +
            CASE 
                WHEN p.bio IS NOT NULL THEN 1 ELSE 0
            END as completeness
        FROM public.profiles p
        WHERE p.id = user_uuid
    ),
    learning_data AS (
        SELECT AVG(progress_percentage) as avg_progress
        FROM public.learning_progress
        WHERE user_id = user_uuid
    ),
    career_data AS (
        SELECT 
            CASE 
                WHEN COUNT(*) = 0 THEN 'early'
                WHEN COUNT(*) FILTER (WHERE goal_title ILIKE '%senior%' OR goal_title ILIKE '%lead%') > 0 THEN 'senior'
                WHEN COUNT(*) FILTER (WHERE goal_title ILIKE '%mid%' OR goal_title ILIKE '%intermediate%') > 0 THEN 'mid'
                ELSE 'early'
            END as stage
        FROM public.career_goals
        WHERE user_id = user_uuid
    ),
    emotional_data AS (
        SELECT 
            CASE 
                WHEN AVG(mood_level) >= 4 THEN 'positive'
                WHEN AVG(mood_level) <= 2 THEN 'negative'
                ELSE 'neutral'
            END as state
        FROM public.mood_tracking
        WHERE user_id = user_uuid
        AND created_at >= NOW() - INTERVAL '7 days'
    ),
    engagement_data AS (
        SELECT 
            CASE 
                WHEN AVG(engagement_score) >= 0.7 THEN 'high'
                WHEN AVG(engagement_score) >= 0.4 THEN 'medium'
                ELSE 'low'
            END as level
        FROM public.user_engagement
        WHERE user_id = user_uuid
        AND date >= CURRENT_DATE - INTERVAL '7 days'
    ),
    activity_data AS (
        SELECT MAX(created_at) as last_activity
        FROM public.user_activity_log
        WHERE user_id = user_uuid
    )
    SELECT 
        COALESCE(pd.completeness * 20, 0)::INTEGER,
        COALESCE(ld.avg_progress, 0.0),
        COALESCE(cd.stage, 'unknown'),
        COALESCE(ed.state, 'neutral'),
        COALESCE(eng.level, 'low'),
        COALESCE(ad.last_activity, NOW())
    FROM profile_data pd, learning_data ld, career_data cd, emotional_data ed, engagement_data eng, activity_data ad;
END;
$$ language 'plpgsql';

-- Create view for context dashboard
CREATE OR REPLACE VIEW public.context_dashboard AS
SELECT 
    u.id as user_id,
    p.full_name,
    p.role,
    p.industry,
    p.location,
    ucs.profile_completeness,
    ucs.learning_progress,
    ucs.career_stage,
    ucs.emotional_state,
    ucs.engagement_level,
    ucs.last_active,
    COUNT(ual.id) as total_activities,
    COUNT(lg.id) as active_goals,
    COUNT(cm.id) as milestones_achieved,
    COUNT(ja.id) as job_applications,
    COUNT(na.id) as networking_activities
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN LATERAL get_user_context_summary(u.id) ucs ON TRUE
LEFT JOIN public.user_activity_log ual ON u.id = ual.user_id
LEFT JOIN public.learning_goals lg ON u.id = lg.user_id AND lg.status = 'active'
LEFT JOIN public.career_milestones cm ON u.id = cm.user_id
LEFT JOIN public.job_applications ja ON u.id = ja.user_id
LEFT JOIN public.networking_activities na ON u.id = na.user_id
GROUP BY u.id, p.full_name, p.role, p.industry, p.location, 
         ucs.profile_completeness, ucs.learning_progress, ucs.career_stage, 
         ucs.emotional_state, ucs.engagement_level, ucs.last_active;

-- Grant permissions
GRANT SELECT ON public.context_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_engagement_score(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_context_summary(UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.user_activity_log IS 'Tracks user activities for context awareness';
COMMENT ON TABLE public.learning_goals IS 'User learning objectives and goals';
COMMENT ON TABLE public.career_milestones IS 'Career achievements and milestones';
COMMENT ON TABLE public.job_applications IS 'Job application tracking';
COMMENT ON TABLE public.networking_activities IS 'Professional networking activities';
COMMENT ON TABLE public.mood_tracking IS 'User mood and emotional state tracking';
COMMENT ON TABLE public.stress_indicators IS 'Stress level monitoring and indicators';
COMMENT ON TABLE public.user_preferences IS 'User customization and preference settings';
COMMENT ON TABLE public.mentor_relationships IS 'Mentor-mentee relationship tracking';
COMMENT ON TABLE public.mentorship_goals IS 'Mentorship-specific goals and objectives';
COMMENT ON TABLE public.project_skills IS 'Skills associated with user projects';
COMMENT ON TABLE public.project_reviews IS 'Project feedback and reviews';
COMMENT ON TABLE public.notification_preferences IS 'User notification settings and preferences';
COMMENT ON TABLE public.app_usage_logs IS 'Application usage pattern tracking';
COMMENT ON TABLE public.user_engagement IS 'User engagement metrics and analytics';
COMMENT ON FUNCTION calculate_user_engagement_score(UUID, DATE) IS 'Calculates user engagement score for a given date';
COMMENT ON FUNCTION get_user_context_summary(UUID) IS 'Returns comprehensive user context summary';
COMMENT ON VIEW public.context_dashboard IS 'Dashboard view for user context and engagement metrics';
