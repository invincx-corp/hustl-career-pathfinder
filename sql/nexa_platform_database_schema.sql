-- =====================================================
-- NEXA PLATFORM - COMPLETE SUPABASE DATABASE SCHEMA
-- =====================================================
-- Copy and paste this entire file into Supabase SQL Editor
-- Run it to create all necessary tables and functions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- AUTHENTICATION & USER PROFILES
-- =====================================================

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    age INTEGER CHECK (age >= 13 AND age <= 100),
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    country TEXT,
    city TEXT,
    timezone TEXT DEFAULT 'UTC',
    
    -- Career & Learning Profile
    interests JSONB DEFAULT '{}',
    skills JSONB DEFAULT '{}',
    goals JSONB DEFAULT '{}',
    experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    preferred_learning_style TEXT CHECK (preferred_learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
    
    -- Compliance & Safety
    requires_parental_consent BOOLEAN DEFAULT FALSE,
    parental_consent_given BOOLEAN DEFAULT FALSE,
    parental_email TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE,
    privacy_policy_accepted BOOLEAN DEFAULT FALSE,
    marketing_emails_consent BOOLEAN DEFAULT FALSE,
    
    -- Onboarding & Status
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    selected_roadmaps JSONB DEFAULT '[]',
    skill_assessment_results JSONB DEFAULT '{}',
    is_mentor BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Role-Based Access Control
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin', 'recruiter', 'moderator')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions tracking (for analytics)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    device_type TEXT,
    browser TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI-POWERED ROADMAPS
-- =====================================================

-- User roadmaps
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goal TEXT NOT NULL,
    category TEXT NOT NULL,
    
    -- AI Generated Content
    steps JSONB NOT NULL DEFAULT '[]',
    estimated_total_time TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    skills_to_learn TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    
    -- Progress Tracking
    current_step INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    steps_completed INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    
    -- Status & Metadata
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    ai_generated BOOLEAN DEFAULT TRUE,
    generation_prompt TEXT,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roadmap step progress tracking
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    step_index INTEGER NOT NULL,
    step_title TEXT NOT NULL,
    
    -- Progress Details
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    notes TEXT,
    resources_completed TEXT[] DEFAULT '{}',
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(roadmap_id, step_index)
);

-- =====================================================
-- SKILL ASSESSMENT & TRACKING
-- =====================================================

-- Skill categories
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    color_hex TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual skills
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.skill_categories(id) ON DELETE SET NULL,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    prerequisites TEXT[] DEFAULT '{}',
    related_skills TEXT[] DEFAULT '{}',
    market_demand INTEGER DEFAULT 5 CHECK (market_demand >= 1 AND market_demand <= 10),
    is_trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skill assessments
CREATE TABLE IF NOT EXISTS public.skill_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    
    -- Assessment Results
    current_level INTEGER CHECK (current_level >= 1 AND current_level <= 10),
    target_level INTEGER CHECK (target_level >= 1 AND target_level <= 10),
    confidence_score INTEGER CHECK (confidence_score >= 1 AND confidence_score <= 10),
    
    -- AI Analysis
    assessment_data JSONB DEFAULT '{}',
    learning_recommendations JSONB DEFAULT '[]',
    suggested_resources JSONB DEFAULT '[]',
    time_to_target_weeks INTEGER,
    
    -- Progress
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_practiced TIMESTAMP WITH TIME ZONE,
    practice_streak_days INTEGER DEFAULT 0,
    
    -- Metadata
    assessment_type TEXT DEFAULT 'self' CHECK (assessment_type IN ('self', 'ai', 'mentor', 'peer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, skill_id)
);

-- =====================================================
-- PROJECT PLAYGROUND
-- =====================================================

-- Project templates
CREATE TABLE IF NOT EXISTS public.project_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    
    -- Project Details
    skills_required TEXT[] NOT NULL DEFAULT '{}',
    skills_learned TEXT[] DEFAULT '{}',
    estimated_time_hours INTEGER,
    technologies TEXT[] DEFAULT '{}',
    
    -- Content
    instructions JSONB NOT NULL DEFAULT '{}',
    starter_code JSONB DEFAULT '{}',
    solution_code JSONB DEFAULT '{}',
    resources JSONB DEFAULT '[]',
    
    -- Metadata
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.project_templates(id) ON DELETE SET NULL,
    
    -- Project Info
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    
    -- Technical Details
    skills_used TEXT[] DEFAULT '{}',
    technologies TEXT[] DEFAULT '{}',
    github_url TEXT,
    demo_url TEXT,
    project_files JSONB DEFAULT '{}',
    
    -- Progress
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'planning', 'in_progress', 'testing', 'completed', 'abandoned')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    time_spent_hours INTEGER DEFAULT 0,
    
    -- Collaboration
    is_collaborative BOOLEAN DEFAULT FALSE,
    team_members UUID[] DEFAULT '{}',
    mentor_assigned UUID REFERENCES public.profiles(id),
    
    -- Visibility & Sharing
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project submissions/showcases
CREATE TABLE IF NOT EXISTS public.project_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Submission Details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    demo_url TEXT,
    github_url TEXT,
    screenshots JSONB DEFAULT '[]',
    video_url TEXT,
    
    -- Review Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
    reviewer_id UUID REFERENCES public.profiles(id),
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metrics
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENTORSHIP SYSTEM
-- =====================================================

-- Mentor profiles
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Professional Info
    expertise_areas TEXT[] NOT NULL DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 0,
    industry TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    
    -- Mentorship Details
    bio TEXT NOT NULL,
    mentoring_style TEXT,
    languages_spoken TEXT[] DEFAULT '{"English"}',
    timezone TEXT DEFAULT 'UTC',
    
    -- Availability
    availability_hours_per_week INTEGER DEFAULT 5,
    preferred_session_duration INTEGER DEFAULT 60, -- minutes
    available_time_slots JSONB DEFAULT '{}',
    
    -- Ratings & Stats
    rating DECIMAL(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    total_mentees INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    response_rate DECIMAL(3,2) DEFAULT 100.0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    
    -- Application
    application_status TEXT DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected')),
    application_notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentorship requests
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    
    -- Request Details
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    session_type TEXT DEFAULT 'one_time' CHECK (session_type IN ('one_time', 'ongoing', 'project_based')),
    preferred_duration INTEGER DEFAULT 60, -- minutes
    preferred_times JSONB DEFAULT '{}',
    
    -- AI Matching
    match_score DECIMAL(3,2),
    matching_reasons TEXT[],
    ai_recommendation TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
    response_message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentorship sessions
CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    mentee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Session Details
    title TEXT NOT NULL,
    description TEXT,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_url TEXT,
    meeting_password TEXT,
    
    -- Content & Notes
    agenda JSONB DEFAULT '[]',
    notes TEXT,
    action_items JSONB DEFAULT '[]',
    resources_shared JSONB DEFAULT '[]',
    
    -- Status & Feedback
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    mentor_rating INTEGER CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
    mentee_rating INTEGER CHECK (mentee_rating >= 1 AND mentee_rating <= 5),
    mentor_feedback TEXT,
    mentee_feedback TEXT,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VIRTUAL CAREER COACH (AI CHAT)
-- =====================================================

-- Chat conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Conversation Details
    title TEXT,
    conversation_type TEXT DEFAULT 'career_coach' CHECK (conversation_type IN ('career_coach', 'skill_guidance', 'project_help', 'general')),
    context JSONB DEFAULT '{}', -- User context for AI
    
    -- AI Configuration
    ai_personality TEXT DEFAULT 'supportive_coach',
    conversation_goals TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    message_count INTEGER DEFAULT 0,
    
    -- Timestamps
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Message Content
    message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    formatted_content JSONB, -- For rich content (suggestions, action items, etc.)
    
    -- AI Metadata
    ai_model TEXT,
    ai_prompt TEXT,
    ai_response_time_ms INTEGER,
    confidence_score DECIMAL(3,2),
    
    -- Message Features
    has_suggestions BOOLEAN DEFAULT FALSE,
    suggestions JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    resources JSONB DEFAULT '[]',
    
    -- Status
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LIVING RESUME & ACHIEVEMENTS
-- =====================================================

-- User achievements
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Achievement Details
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('skill_mastery', 'project_completion', 'mentorship', 'learning_streak', 'community_contribution', 'certification')),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Visual & Rewards
    badge_url TEXT,
    badge_color TEXT,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    
    -- Requirements & Progress
    requirements JSONB DEFAULT '{}',
    progress_data JSONB DEFAULT '{}',
    completion_percentage INTEGER DEFAULT 100,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_data JSONB DEFAULT '{}',
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume sections (for living resume)
CREATE TABLE IF NOT EXISTS public.resume_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Section Details
    section_type TEXT NOT NULL CHECK (section_type IN ('education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'volunteer')),
    title TEXT NOT NULL,
    organization TEXT,
    position TEXT,
    description TEXT,
    
    -- Dates
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    
    -- Details & Links
    location TEXT,
    url TEXT,
    skills_used TEXT[] DEFAULT '{}',
    achievements_text TEXT[],
    
    -- Auto-generated from platform activity
    is_auto_generated BOOLEAN DEFAULT FALSE,
    source_type TEXT, -- 'project', 'skill_assessment', 'mentorship', etc.
    source_id UUID,
    
    -- Display
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CURIOSITY COMPASS & EXPLORATION
-- =====================================================

-- Career domains/paths
CREATE TABLE IF NOT EXISTS public.career_domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    
    -- Visual & Content
    icon_url TEXT,
    color_hex TEXT,
    banner_image_url TEXT,
    
    -- Career Info
    typical_roles TEXT[] DEFAULT '{}',
    required_skills TEXT[] DEFAULT '{}',
    salary_range_min INTEGER,
    salary_range_max INTEGER,
    job_outlook TEXT,
    growth_rate DECIMAL(5,2),
    
    -- Learning Path
    learning_difficulty TEXT CHECK (learning_difficulty IN ('beginner', 'intermediate', 'advanced')),
    time_to_proficiency_months INTEGER,
    
    -- Metadata
    is_trending BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    interest_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User exploration tracking
CREATE TABLE IF NOT EXISTS public.user_explorations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    domain_id UUID REFERENCES public.career_domains(id) ON DELETE CASCADE NOT NULL,
    
    -- Exploration Data
    interest_level INTEGER CHECK (interest_level >= 1 AND interest_level <= 10),
    time_spent_minutes INTEGER DEFAULT 0,
    resources_viewed INTEGER DEFAULT 0,
    
    -- Progress
    exploration_percentage INTEGER DEFAULT 0 CHECK (exploration_percentage >= 0 AND exploration_percentage <= 100),
    completed_activities TEXT[] DEFAULT '{}',
    
    -- AI Insights
    personality_match_score DECIMAL(3,2),
    skill_match_score DECIMAL(3,2),
    interest_match_score DECIMAL(3,2),
    overall_match_score DECIMAL(3,2),
    
    -- Status
    status TEXT DEFAULT 'exploring' CHECK (status IN ('exploring', 'interested', 'pursuing', 'not_interested')),
    
    -- Timestamps
    first_explored TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_explored TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, domain_id)
);

-- =====================================================
-- NOTIFICATIONS & COMMUNICATIONS
-- =====================================================

-- User notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification Details
    type TEXT NOT NULL CHECK (type IN ('achievement', 'mentor', 'project', 'system', 'reminder', 'social')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Rich Content
    data JSONB DEFAULT '{}',
    action_url TEXT,
    action_text TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'medium', 'normal', 'high', 'urgent')),
    
    -- Delivery
    delivery_method TEXT[] DEFAULT '{"in_app"}', -- in_app, email, push
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_push BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    read_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & TRACKING
-- =====================================================

-- User activity tracking
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Activity Details
    activity_type TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    category TEXT,
    
    -- Context & Data
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    session_id TEXT,
    
    -- Activity Data
    duration_seconds INTEGER,
    data JSONB DEFAULT '{}',
    
    -- Metadata
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning analytics
CREATE TABLE IF NOT EXISTS public.learning_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Learning Metrics
    total_learning_time_hours INTEGER DEFAULT 0,
    skills_learned_count INTEGER DEFAULT 0,
    projects_completed_count INTEGER DEFAULT 0,
    roadmaps_completed_count INTEGER DEFAULT 0,
    mentorship_sessions_count INTEGER DEFAULT 0,
    
    -- Engagement Metrics
    login_streak_days INTEGER DEFAULT 0,
    total_logins INTEGER DEFAULT 0,
    avg_session_duration_minutes INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    -- Achievement Metrics
    total_points INTEGER DEFAULT 0,
    achievement_count INTEGER DEFAULT 0,
    badges_earned INTEGER DEFAULT 0,
    
    -- AI Interaction Metrics
    ai_conversations_count INTEGER DEFAULT 0,
    ai_messages_sent INTEGER DEFAULT 0,
    ai_recommendations_accepted INTEGER DEFAULT 0,
    
    -- Weekly/Monthly aggregates
    week_start_date DATE,
    month_start_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, week_start_date),
    UNIQUE(user_id, month_start_date)
);

-- =====================================================
-- HELPER FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
    );
    
    -- Create initial chat conversation with AI coach
    INSERT INTO public.chat_conversations (user_id, title, conversation_type)
    VALUES (NEW.id, 'Welcome to Nexa!', 'career_coach');
    
    -- Send welcome notification
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
        NEW.id, 
        'system', 
        'Welcome to Nexa!', 
        'Welcome to your AI-powered career journey! Let''s start by exploring your interests in the Curiosity Compass.'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create/update user profile (bypasses RLS issues)
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT,
  user_username TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'student',
  user_selected_roadmaps JSONB DEFAULT '[]'::jsonb,
  user_skill_assessment_results JSONB DEFAULT '{}'::jsonb,
  user_interests JSONB DEFAULT '{}'::jsonb,
  user_skills JSONB DEFAULT '{}'::jsonb,
  user_goals JSONB DEFAULT '{}'::jsonb,
  user_experience_level TEXT DEFAULT 'beginner',
  user_onboarding_completed BOOLEAN DEFAULT false,
  user_onboarding_step INTEGER DEFAULT 0,
  user_terms_accepted BOOLEAN DEFAULT false,
  user_privacy_policy_accepted BOOLEAN DEFAULT false,
  user_is_active BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    -- Update existing profile
    UPDATE public.profiles SET
      email = user_email,
      full_name = user_full_name,
      username = COALESCE(user_username, username),
      role = COALESCE(user_role, role),
      selected_roadmaps = COALESCE(user_selected_roadmaps, selected_roadmaps),
      skill_assessment_results = COALESCE(user_skill_assessment_results, skill_assessment_results),
      interests = COALESCE(user_interests, interests),
      skills = COALESCE(user_skills, skills),
      goals = COALESCE(user_goals, goals),
      experience_level = COALESCE(user_experience_level, experience_level),
      onboarding_completed = COALESCE(user_onboarding_completed, onboarding_completed),
      onboarding_step = COALESCE(user_onboarding_step, onboarding_step),
      terms_accepted = COALESCE(user_terms_accepted, terms_accepted),
      privacy_policy_accepted = COALESCE(user_privacy_policy_accepted, privacy_policy_accepted),
      is_active = COALESCE(user_is_active, is_active),
      updated_at = NOW()
    WHERE id = user_id;
    
    RETURN jsonb_build_object('status', 'updated', 'message', 'Profile updated successfully');
  ELSE
    -- Create new profile
    INSERT INTO public.profiles (
      id, email, full_name, username, role, selected_roadmaps, skill_assessment_results,
      interests, skills, goals, experience_level, onboarding_completed,
      onboarding_step, terms_accepted, privacy_policy_accepted, is_active,
      created_at, updated_at
    ) VALUES (
      user_id, user_email, user_full_name, user_username, user_role, user_selected_roadmaps, user_skill_assessment_results,
      user_interests, user_skills, user_goals, user_experience_level, user_onboarding_completed,
      user_onboarding_step, user_terms_accepted, user_privacy_policy_accepted, user_is_active,
      NOW(), NOW()
    );
    
    RETURN jsonb_build_object('status', 'created', 'message', 'Profile created successfully');
  END IF;
END;
$$;

-- Function to calculate user level based on points
CREATE OR REPLACE FUNCTION calculate_user_level(total_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN GREATEST(1, FLOOR(SQRT(total_points / 100.0))::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats when achievement is earned
CREATE OR REPLACE FUNCTION update_user_stats_on_achievement()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total points and level in profile
    UPDATE public.profiles 
    SET 
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Update learning analytics
    INSERT INTO public.learning_analytics (user_id, total_points, achievement_count)
    VALUES (NEW.user_id, NEW.points, 1)
    ON CONFLICT (user_id, week_start_date) 
    DO UPDATE SET 
        total_points = learning_analytics.total_points + NEW.points,
        achievement_count = learning_analytics.achievement_count + 1;
        
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Updated_at triggers for all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roadmaps_updated_at BEFORE UPDATE ON public.roadmaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roadmap_progress_updated_at BEFORE UPDATE ON public.roadmap_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_assessments_updated_at BEFORE UPDATE ON public.skill_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_submissions_updated_at BEFORE UPDATE ON public.project_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentorship_requests_updated_at BEFORE UPDATE ON public.mentorship_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentorship_sessions_updated_at BEFORE UPDATE ON public.mentorship_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resume_sections_updated_at BEFORE UPDATE ON public.resume_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_domains_updated_at BEFORE UPDATE ON public.career_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_explorations_updated_at BEFORE UPDATE ON public.user_explorations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_analytics_updated_at BEFORE UPDATE ON public.learning_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Special triggers
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER on_achievement_earned AFTER INSERT ON public.achievements FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_achievement();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_explorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

-- Public tables (no RLS needed)
-- skill_categories, skills, project_templates, career_domains are public read

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

-- Roadmaps policies
CREATE POLICY "Users can view own roadmaps" ON public.roadmaps FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create own roadmaps" ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON public.roadmaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own roadmaps" ON public.roadmaps FOR DELETE USING (auth.uid() = user_id);

-- Roadmap progress policies
CREATE POLICY "Users can view own roadmap progress" ON public.roadmap_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own roadmap progress" ON public.roadmap_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmap progress" ON public.roadmap_progress FOR UPDATE USING (auth.uid() = user_id);

-- Skill assessments policies
CREATE POLICY "Users can view own skill assessments" ON public.skill_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own skill assessments" ON public.skill_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skill assessments" ON public.skill_assessments FOR UPDATE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Mentors policies (public read for discovery)
CREATE POLICY "Anyone can view active mentors" ON public.mentors FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create own mentor profile" ON public.mentors FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update own mentor profile" ON public.mentors FOR UPDATE USING (auth.uid() = profile_id);

-- Mentorship requests policies
CREATE POLICY "Users can view own mentorship requests" ON public.mentorship_requests FOR SELECT USING (
    auth.uid() = mentee_id OR 
    auth.uid() = (SELECT profile_id FROM public.mentors WHERE id = mentor_id)
);
CREATE POLICY "Users can create mentorship requests" ON public.mentorship_requests FOR INSERT WITH CHECK (auth.uid() = mentee_id);
CREATE POLICY "Mentors can update requests to them" ON public.mentorship_requests FOR UPDATE USING (
    auth.uid() = (SELECT profile_id FROM public.mentors WHERE id = mentor_id)
);

-- Chat conversations policies
CREATE POLICY "Users can view own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view messages in own conversations" ON public.chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create messages in own conversations" ON public.chat_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.chat_conversations WHERE id = conversation_id AND user_id = auth.uid())
);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);

-- Resume sections policies
CREATE POLICY "Users can view own resume sections" ON public.resume_sections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own resume sections" ON public.resume_sections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resume sections" ON public.resume_sections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resume sections" ON public.resume_sections FOR DELETE USING (auth.uid() = user_id);

-- User explorations policies
CREATE POLICY "Users can view own explorations" ON public.user_explorations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own explorations" ON public.user_explorations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own explorations" ON public.user_explorations FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- User activities policies
CREATE POLICY "Users can view own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning analytics policies
CREATE POLICY "Users can view own analytics" ON public.learning_analytics FOR SELECT USING (auth.uid() = user_id);

-- Grant necessary permissions for RPC function
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;

-- =====================================================
-- CREATE PERFORMANCE INDEXES
-- =====================================================

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_mentor ON public.profiles(is_mentor);

-- Roadmap indexes
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_status ON public.roadmaps(status);
CREATE INDEX IF NOT EXISTS idx_roadmaps_category ON public.roadmaps(category);
CREATE INDEX IF NOT EXISTS idx_roadmaps_public ON public.roadmaps(is_public);

-- Skill indexes
CREATE INDEX IF NOT EXISTS idx_skill_assessments_user_id ON public.skill_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_skill_id ON public.skill_assessments(skill_id);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_public ON public.projects(is_public);

-- Mentor indexes
CREATE INDEX IF NOT EXISTS idx_mentors_profile_id ON public.mentors(profile_id);
CREATE INDEX IF NOT EXISTS idx_mentors_active ON public.mentors(is_active);
CREATE INDEX IF NOT EXISTS idx_mentors_expertise ON public.mentors USING GIN(expertise_areas);
CREATE INDEX IF NOT EXISTS idx_mentors_industry ON public.mentors(industry);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at);

-- =====================================================
-- INSERT SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert skill categories
INSERT INTO public.skill_categories (name, description, icon_url, color_hex) VALUES
('Programming', 'Software development and coding skills', '/icons/code.svg', '#3B82F6'),
('Design', 'UI/UX design and creative skills', '/icons/design.svg', '#8B5CF6'),
('Data Science', 'Data analysis and machine learning', '/icons/data.svg', '#10B981'),
('Marketing', 'Digital marketing and growth skills', '/icons/marketing.svg', '#F59E0B'),
('Business', 'Entrepreneurship and business skills', '/icons/business.svg', '#EF4444'),
('Communication', 'Soft skills and interpersonal abilities', '/icons/communication.svg', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- Insert career domains
INSERT INTO public.career_domains (name, description, category, typical_roles, required_skills) VALUES
('Web Development', 'Build websites and web applications', 'Technology', 
 ARRAY['Frontend Developer', 'Backend Developer', 'Full Stack Developer'], 
 ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'Node.js']),
('Data Science', 'Analyze data to extract insights and build predictive models', 'Technology',
 ARRAY['Data Scientist', 'Data Analyst', 'ML Engineer'],
 ARRAY['Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization']),
('Digital Marketing', 'Promote products and services through digital channels', 'Marketing',
 ARRAY['Digital Marketer', 'SEO Specialist', 'Content Marketer'],
 ARRAY['SEO', 'Social Media Marketing', 'Content Creation', 'Analytics']),
('UI/UX Design', 'Design user interfaces and experiences for digital products', 'Design',
 ARRAY['UI Designer', 'UX Designer', 'Product Designer'],
 ARRAY['Figma', 'User Research', 'Prototyping', 'Design Systems'])
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ADDITIONAL FEATURES & ENHANCEMENTS
-- =====================================================

-- =====================================================
-- COURSE & LEARNING RESOURCES
-- =====================================================

-- Course providers/platforms
CREATE TABLE IF NOT EXISTS public.course_providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0,
    total_courses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID REFERENCES public.course_providers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    
    -- Course Details
    duration_weeks INTEGER,
    duration_hours INTEGER,
    price DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    is_free BOOLEAN DEFAULT FALSE,
    free_alternative TEXT,
    
    -- Content & Quality
    rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Skills & Learning
    skills_taught TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    learning_outcomes TEXT[] DEFAULT '{}',
    
    -- Metadata
    language TEXT DEFAULT 'English',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User course enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    
    -- Enrollment Details
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_date TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Learning Progress
    current_module INTEGER DEFAULT 1,
    total_modules INTEGER,
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'paused', 'dropped')),
    certificate_earned BOOLEAN DEFAULT FALSE,
    certificate_url TEXT,
    
    -- Feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_review TEXT,
    review_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, course_id)
);

-- =====================================================
-- SKILL GAP ANALYSIS & RECOMMENDATIONS
-- =====================================================

-- Skill gap analysis results
CREATE TABLE IF NOT EXISTS public.skill_gap_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_role TEXT NOT NULL,
    
    -- Analysis Results
    current_skills_assessment JSONB NOT NULL DEFAULT '{}',
    target_skills_required JSONB NOT NULL DEFAULT '{}',
    skill_gaps JSONB NOT NULL DEFAULT '{}',
    
    -- AI Recommendations
    recommended_courses JSONB DEFAULT '[]',
    recommended_projects JSONB DEFAULT '[]',
    learning_path JSONB DEFAULT '[]',
    estimated_time_to_target TEXT,
    
    -- Priority & Scoring
    priority_skills TEXT[] DEFAULT '{}',
    market_demand_scores JSONB DEFAULT '{}',
    overall_match_score DECIMAL(3,2),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT COLLABORATION & TEAMS
-- =====================================================

-- Project teams
CREATE TABLE IF NOT EXISTS public.project_teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Team Structure
    max_members INTEGER DEFAULT 5,
    current_members INTEGER DEFAULT 1,
    team_leader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Collaboration
    communication_channel TEXT,
    meeting_schedule JSONB DEFAULT '{}',
    shared_resources JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.project_teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Role & Responsibilities
    role TEXT NOT NULL,
    responsibilities TEXT[] DEFAULT '{}',
    skills_contributed TEXT[] DEFAULT '{}',
    
    -- Participation
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contribution_score INTEGER DEFAULT 0 CHECK (contribution_score >= 0 AND contribution_score <= 100),
    time_contributed_hours INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'left')),
    left_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, user_id)
);

-- =====================================================
-- MENTORSHIP ENHANCEMENTS
-- =====================================================

-- Mentor availability slots
CREATE TABLE IF NOT EXISTS public.mentor_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    
    -- Time Slots
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    
    -- Session Types
    session_types TEXT[] DEFAULT '{}', -- 'one_time', 'ongoing', 'project_based'
    max_duration_minutes INTEGER DEFAULT 60,
    
    -- Pricing
    hourly_rate DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor specializations
CREATE TABLE IF NOT EXISTS public.mentor_specializations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    specialization_name TEXT NOT NULL,
    
    -- Expertise Details
    expertise_level TEXT CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER DEFAULT 0,
    certifications TEXT[] DEFAULT '{}',
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES public.profiles(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(mentor_id, specialization_name)
);

-- =====================================================
-- RESUME & PORTFOLIO ENHANCEMENTS
-- =====================================================

-- Resume templates
CREATE TABLE IF NOT EXISTS public.resume_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Template Details
    category TEXT NOT NULL, -- 'modern', 'classic', 'creative', 'minimal'
    preview_image_url TEXT,
    template_file_url TEXT,
    
    -- Customization
    customizable_sections TEXT[] DEFAULT '{}',
    color_schemes JSONB DEFAULT '[]',
    font_options TEXT[] DEFAULT '{}',
    
    -- Usage
    is_free BOOLEAN DEFAULT TRUE,
    price DECIMAL(10,2) DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User resume instances
CREATE TABLE IF NOT EXISTS public.user_resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.resume_templates(id) ON DELETE SET NULL,
    
    -- Resume Details
    title TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    public_url TEXT,
    
    -- Content
    resume_data JSONB NOT NULL DEFAULT '{}',
    custom_styling JSONB DEFAULT '{}',
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CAREER EXPLORATION & INSIGHTS
-- =====================================================

-- Career insights and trends
CREATE TABLE IF NOT EXISTS public.career_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    career_domain_id UUID REFERENCES public.career_domains(id) ON DELETE CASCADE,
    
    -- Market Data
    job_market_trend TEXT CHECK (job_market_trend IN ('growing', 'stable', 'declining', 'emerging')),
    growth_rate_percentage DECIMAL(5,2),
    average_salary_min INTEGER,
    average_salary_max INTEGER,
    currency TEXT DEFAULT 'USD',
    
    -- Skills Demand
    high_demand_skills TEXT[] DEFAULT '{}',
    emerging_skills TEXT[] DEFAULT '{}',
    declining_skills TEXT[] DEFAULT '{}',
    
    -- Industry Insights
    top_companies TEXT[] DEFAULT '{}',
    remote_work_percentage INTEGER DEFAULT 0,
    entry_level_positions INTEGER DEFAULT 0,
    
    -- Data Source
    data_source TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User career preferences
CREATE TABLE IF NOT EXISTS public.user_career_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Career Goals
    preferred_work_environment TEXT[] DEFAULT '{}', -- 'remote', 'hybrid', 'office'
    preferred_company_size TEXT[] DEFAULT '{}', -- 'startup', 'midsize', 'enterprise'
    preferred_industries TEXT[] DEFAULT '{}',
    
    -- Work Preferences
    salary_expectations_min INTEGER,
    salary_expectations_max INTEGER,
    work_life_balance_priority INTEGER CHECK (work_life_balance_priority >= 1 AND work_life_balance_priority <= 5),
    
    -- Location Preferences
    preferred_locations TEXT[] DEFAULT '{}',
    relocation_willingness BOOLEAN DEFAULT FALSE,
    
    -- Growth Preferences
    learning_goals TEXT[] DEFAULT '{}',
    career_advancement_goals TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- GAMIFICATION & ENGAGEMENT
-- =====================================================

-- User levels and progression
CREATE TABLE IF NOT EXISTS public.user_levels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Level System
    current_level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 100,
    
    -- Streaks & Consistency
    login_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    learning_streak_days INTEGER DEFAULT 0,
    
    -- Achievements & Rewards
    total_achievements INTEGER DEFAULT 0,
    total_badges INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- XP transactions
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Transaction Details
    xp_amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- 'earned', 'spent', 'bonus', 'penalty'
    source TEXT NOT NULL, -- 'project_completion', 'skill_assessment', 'mentorship', 'daily_login'
    
    -- Context
    source_id UUID, -- ID of the related item (project, skill, etc.)
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Balance
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION & COMMUNICATION ENHANCEMENTS
-- =====================================================

-- Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Channel Preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    
    -- Type Preferences
    achievement_notifications BOOLEAN DEFAULT TRUE,
    project_updates BOOLEAN DEFAULT TRUE,
    mentorship_reminders BOOLEAN DEFAULT TRUE,
    skill_recommendations BOOLEAN DEFAULT TRUE,
    career_insights BOOLEAN DEFAULT TRUE,
    
    -- Frequency
    digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- ADDITIONAL TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to calculate XP for various activities
CREATE OR REPLACE FUNCTION calculate_activity_xp(activity_type TEXT, activity_data JSONB)
RETURNS INTEGER AS $$
BEGIN
    CASE activity_type
        WHEN 'project_completion' THEN
            CASE COALESCE((activity_data->>'difficulty')::TEXT, 'beginner')
                WHEN 'beginner' THEN RETURN 100;
                WHEN 'intermediate' THEN RETURN 200;
                WHEN 'advanced' THEN RETURN 300;
                ELSE RETURN 100;
            END CASE;
        WHEN 'skill_assessment' THEN
            RETURN COALESCE((activity_data->>'level_gained')::INTEGER, 1) * 50;
        WHEN 'mentorship_session' THEN
            RETURN 150;
        WHEN 'daily_login' THEN
            RETURN 10;
        WHEN 'course_completion' THEN
            RETURN COALESCE((activity_data->>'duration_weeks')::INTEGER, 1) * 25;
        ELSE
            RETURN 0;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user level based on total XP
    UPDATE public.user_levels 
    SET 
        current_level = calculate_user_level(NEW.balance_after),
        xp_to_next_level = (calculate_user_level(NEW.balance_after) + 1) * 100 - NEW.balance_after,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ADDITIONAL INDEXES
-- =====================================================

-- Course indexes
CREATE INDEX IF NOT EXISTS idx_courses_provider_id ON public.courses(provider_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON public.courses(difficulty);
CREATE INDEX IF NOT EXISTS idx_courses_price ON public.courses(price);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON public.courses(rating);

-- Course enrollment indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON public.course_enrollments(status);

-- Skill gap analysis indexes
CREATE INDEX IF NOT EXISTS idx_skill_gap_analyses_user_id ON public.skill_gap_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gap_analyses_target_role ON public.skill_gap_analyses(target_role);

-- Team indexes
CREATE INDEX IF NOT EXISTS idx_project_teams_project_id ON public.project_teams(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- Mentor availability indexes
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor_id ON public.mentor_availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_availability_day_time ON public.mentor_availability(day_of_week, start_time);

-- Resume indexes
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_template_id ON public.user_resumes(template_id);

-- Career insights indexes
CREATE INDEX IF NOT EXISTS idx_career_insights_domain_id ON public.career_insights(career_domain_id);
CREATE INDEX IF NOT EXISTS idx_career_insights_trend ON public.career_insights(job_market_trend);

-- User level indexes
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON public.user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_level ON public.user_levels(current_level);

-- XP transaction indexes
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_type ON public.xp_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON public.xp_transactions(created_at);

-- =====================================================
-- ADDITIONAL RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.course_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_career_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Course policies
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own course enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own course enrollments" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own course enrollments" ON public.course_enrollments FOR UPDATE USING (auth.uid() = user_id);

-- Skill gap analysis policies
CREATE POLICY "Users can view own skill gap analyses" ON public.skill_gap_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own skill gap analyses" ON public.skill_gap_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skill gap analyses" ON public.skill_gap_analyses FOR UPDATE USING (auth.uid() = user_id);

-- Team policies
CREATE POLICY "Team members can view team info" ON public.project_teams FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE team_id = id AND user_id = auth.uid())
);
CREATE POLICY "Team leaders can update team info" ON public.project_teams FOR UPDATE USING (
    team_leader_id = auth.uid()
);

-- Resume policies
CREATE POLICY "Users can view own resumes" ON public.user_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own resumes" ON public.user_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.user_resumes FOR UPDATE USING (auth.uid() = user_id);

-- User level policies
CREATE POLICY "Users can view own level info" ON public.user_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own XP transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- ADDITIONAL TRIGGERS
-- =====================================================

-- XP transaction trigger
CREATE TRIGGER on_xp_transaction AFTER INSERT ON public.xp_transactions FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- Updated_at triggers for new tables
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_enrollments_updated_at BEFORE UPDATE ON public.course_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_gap_analyses_updated_at BEFORE UPDATE ON public.skill_gap_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_teams_updated_at BEFORE UPDATE ON public.project_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_availability_updated_at BEFORE UPDATE ON public.mentor_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_specializations_updated_at BEFORE UPDATE ON public.mentor_specializations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_resumes_updated_at BEFORE UPDATE ON public.user_resumes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_levels_updated_at BEFORE UPDATE ON public.user_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR NEW FEATURES
-- =====================================================

-- Insert course providers
INSERT INTO public.course_providers (name, description, website_url, is_verified, rating) VALUES
('Coursera', 'World-class learning from top universities and companies', 'https://coursera.org', true, 4.8),
('Udemy', 'Learn anything, anywhere, anytime', 'https://udemy.com', true, 4.6),
('edX', 'Free online courses from the world''s best universities', 'https://edx.org', true, 4.7),
('DataCamp', 'Learn data science and analytics', 'https://datacamp.com', true, 4.5),
('Codecademy', 'Learn to code interactively', 'https://codecademy.com', true, 4.4)
ON CONFLICT (name) DO NOTHING;

-- Insert sample courses
INSERT INTO public.courses (provider_id, title, description, category, difficulty, duration_weeks, price, skills_taught) VALUES
((SELECT id FROM public.course_providers WHERE name = 'Coursera'), 'Machine Learning for Beginners', 'Introduction to ML algorithms and applications', 'Data Science', 'Beginner', 8, 49.99, ARRAY['Python', 'Machine Learning', 'Data Analysis']),
((SELECT id FROM public.course_providers WHERE name = 'Udemy'), 'Complete Web Development Bootcamp', 'Full-stack web development from scratch', 'Programming', 'Beginner', 12, 89.99, ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'Node.js']),
((SELECT id FROM public.course_providers WHERE name = 'DataCamp'), 'Python for Data Science', 'Learn Python programming for data analysis', 'Programming', 'Beginner', 6, 0, ARRAY['Python', 'Pandas', 'NumPy', 'Data Visualization'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- ADDITIONAL MISSING FEATURES & ENHANCEMENTS
-- =====================================================

-- =====================================================
-- CERTIFICATION & MICRO-CREDENTIALS SYSTEM
-- =====================================================

-- Certification providers (companies, organizations)
CREATE TABLE IF NOT EXISTS public.certification_providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    industry TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0,
    total_certifications INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Available certifications
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID REFERENCES public.certification_providers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    
    -- Certification Details
    duration_weeks INTEGER,
    exam_required BOOLEAN DEFAULT TRUE,
    exam_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    validity_years INTEGER DEFAULT 2,
    
    -- Requirements
    prerequisites TEXT[] DEFAULT '{}',
    skills_covered TEXT[] DEFAULT '{}',
    learning_objectives TEXT[] DEFAULT '{}',
    
    -- Market Value
    industry_recognition INTEGER DEFAULT 5 CHECK (industry_recognition >= 1 AND industry_recognition <= 10),
    average_salary_boost INTEGER,
    job_opportunities TEXT[] DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User certification progress
CREATE TABLE IF NOT EXISTS public.user_certifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    certification_id UUID REFERENCES public.certifications(id) ON DELETE CASCADE NOT NULL,
    
    -- Progress Details
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'exam_scheduled', 'exam_passed', 'certified', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    
    -- Exam Results
    exam_score INTEGER CHECK (exam_score >= 0 AND exam_score <= 100),
    exam_date TIMESTAMP WITH TIME ZONE,
    attempts_count INTEGER DEFAULT 0,
    
    -- Learning Progress
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_hours INTEGER DEFAULT 0,
    last_studied TIMESTAMP WITH TIME ZONE,
    
    -- Certification Details
    certificate_url TEXT,
    certificate_id TEXT,
    verification_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, certification_id)
);

-- =====================================================
-- WAITLIST & EMAIL SUBSCRIPTION SYSTEM
-- =====================================================

-- Waitlist subscribers
CREATE TABLE IF NOT EXISTS public.waitlist_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    
    -- Subscriber Details
    full_name TEXT,
    age INTEGER CHECK (age >= 13 AND age <= 100),
    interests TEXT[] DEFAULT '{}',
    career_goals TEXT[] DEFAULT '{}',
    
    -- Source & Marketing
    source TEXT, -- 'website', 'social_media', 'referral', 'advertisement'
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Preferences
    newsletter_consent BOOLEAN DEFAULT TRUE,
    marketing_emails_consent BOOLEAN DEFAULT FALSE,
    beta_testing_consent BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email campaigns and newsletters
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    
    -- Campaign Details
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('newsletter', 'announcement', 'onboarding', 'promotional', 'educational')),
    target_audience TEXT[] DEFAULT '{}', -- 'all', 'waitlist', 'active_users', 'mentors'
    
    -- Content
    html_content TEXT,
    text_content TEXT,
    preview_text TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Metrics
    total_recipients INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    created_by UUID REFERENCES public.profiles(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email tracking and analytics
CREATE TABLE IF NOT EXISTS public.email_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE NOT NULL,
    subscriber_id UUID REFERENCES public.waitlist_subscribers(id) ON DELETE CASCADE NOT NULL,
    
    -- Tracking Events
    event_type TEXT NOT NULL CHECK (event_type IN ('delivered', 'opened', 'clicked', 'unsubscribed', 'bounced')),
    event_data JSONB DEFAULT '{}',
    
    -- User Agent & Device
    user_agent TEXT,
    ip_address INET,
    device_type TEXT,
    
    -- Timestamps
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MULTILINGUAL & LOCALIZATION SYSTEM
-- =====================================================

-- Supported languages
CREATE TABLE IF NOT EXISTS public.supported_languages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    language_code TEXT UNIQUE NOT NULL, -- 'en', 'hi', 'ta', 'bn', 'te', etc.
    language_name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    
    -- Localization Details
    is_rtl BOOLEAN DEFAULT FALSE, -- Right-to-left languages
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Translation Status
    translation_completion_percentage INTEGER DEFAULT 0 CHECK (translation_completion_percentage >= 0 AND translation_completion_percentage <= 100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User language preferences
CREATE TABLE IF NOT EXISTS public.user_language_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Language Settings
    primary_language TEXT NOT NULL,
    secondary_languages TEXT[] DEFAULT '{}',
    interface_language TEXT NOT NULL,
    
    -- Content Preferences
    content_languages TEXT[] DEFAULT '{}',
    auto_translate BOOLEAN DEFAULT TRUE,
    translation_quality TEXT DEFAULT 'high' CHECK (translation_quality IN ('low', 'medium', 'high')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- OFFLINE & PWA FEATURES
-- =====================================================

-- Offline content cache
CREATE TABLE IF NOT EXISTS public.offline_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('course', 'project', 'skill', 'mentor', 'roadmap')),
    content_id UUID NOT NULL,
    
    -- Content Details
    title TEXT NOT NULL,
    description TEXT,
    content_data JSONB NOT NULL DEFAULT '{}',
    
    -- Caching
    cache_priority INTEGER DEFAULT 5 CHECK (cache_priority >= 1 AND cache_priority <= 10),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    
    -- Storage
    file_size_bytes INTEGER,
    compression_ratio DECIMAL(3,2),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service worker sync queue
CREATE TABLE IF NOT EXISTS public.sync_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Sync Details
    sync_type TEXT NOT NULL CHECK (sync_type IN ('profile_update', 'project_progress', 'skill_assessment', 'mentorship_request')),
    sync_data JSONB NOT NULL DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Error Handling
    error_message TEXT,
    error_details JSONB DEFAULT '{}'
);

-- =====================================================
-- AI CAREER THERAPIST & EMOTIONAL SUPPORT
-- =====================================================

-- Mood and emotional tracking
CREATE TABLE IF NOT EXISTS public.user_mood_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Mood Data
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    mood_label TEXT, -- 'happy', 'stressed', 'confident', 'anxious', 'excited'
    mood_description TEXT,
    
    -- Context
    activity_type TEXT, -- 'learning', 'project_work', 'mentorship', 'general'
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    
    -- AI Analysis
    ai_insights TEXT,
    recommended_actions TEXT[] DEFAULT '{}',
    escalation_needed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI therapy sessions
CREATE TABLE IF NOT EXISTS public.ai_therapy_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Session Details
    session_type TEXT NOT NULL CHECK (session_type IN ('career_guidance', 'stress_management', 'motivation', 'goal_setting', 'crisis_support')),
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
    
    -- Conversation
    conversation_summary TEXT,
    key_insights TEXT[] DEFAULT '{}',
    action_items TEXT[] DEFAULT '{}',
    
    -- AI Response
    ai_response_quality INTEGER CHECK (ai_response_quality >= 1 AND ai_response_quality <= 10),
    human_escalation_requested BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    
    -- Duration
    session_duration_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMMUNITY & SOCIAL FEATURES
-- =====================================================

-- User connections and networking
CREATE TABLE IF NOT EXISTS public.user_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    connected_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Connection Details
    connection_type TEXT NOT NULL CHECK (connection_type IN ('mentor', 'mentee', 'peer', 'project_collaborator', 'study_buddy')),
    connection_strength INTEGER DEFAULT 5 CHECK (connection_strength >= 1 AND connection_strength <= 10),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Interaction
    last_interaction TIMESTAMP WITH TIME ZONE,
    interaction_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, connected_user_id)
);

-- Community groups and forums
CREATE TABLE IF NOT EXISTS public.community_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Group Details
    group_type TEXT NOT NULL CHECK (group_type IN ('skill_based', 'career_path', 'project_team', 'geographic', 'interest_based')),
    category TEXT NOT NULL,
    max_members INTEGER DEFAULT 1000,
    
    -- Privacy
    is_public BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    is_moderated BOOLEAN DEFAULT TRUE,
    
    -- Content
    rules TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    banner_image_url TEXT,
    
    -- Stats
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ownership
    created_by UUID REFERENCES public.profiles(id),
    moderators UUID[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group memberships
CREATE TABLE IF NOT EXISTS public.group_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Membership Details
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin', 'owner')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Activity
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_count INTEGER DEFAULT 0,
    contribution_score INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'muted', 'banned', 'left')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(group_id, user_id)
);

-- =====================================================
-- ADDITIONAL INDEXES FOR NEW FEATURES
-- =====================================================

-- Certification indexes
CREATE INDEX IF NOT EXISTS idx_certifications_provider_id ON public.certifications(provider_id);
CREATE INDEX IF NOT EXISTS idx_certifications_category ON public.certifications(category);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON public.user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_status ON public.user_certifications(status);

-- Waitlist indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_subscribers_email ON public.waitlist_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_subscribers_status ON public.waitlist_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_type ON public.email_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_campaign_id ON public.email_tracking(campaign_id);

-- Language indexes
CREATE INDEX IF NOT EXISTS idx_supported_languages_code ON public.supported_languages(language_code);
CREATE INDEX IF NOT EXISTS idx_user_language_preferences_user_id ON public.user_language_preferences(user_id);

-- Offline content indexes
CREATE INDEX IF NOT EXISTS idx_offline_content_type ON public.offline_content(content_type);
CREATE INDEX IF NOT EXISTS idx_offline_content_priority ON public.offline_content(cache_priority);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON public.sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON public.sync_queue(status);

-- Mood tracking indexes
CREATE INDEX IF NOT EXISTS idx_user_mood_tracking_user_id ON public.user_mood_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mood_tracking_date ON public.user_mood_tracking(recorded_at);
CREATE INDEX IF NOT EXISTS idx_ai_therapy_sessions_user_id ON public.ai_therapy_sessions(user_id);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);
CREATE INDEX IF NOT EXISTS idx_community_groups_type ON public.community_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON public.group_memberships(group_id);

-- =====================================================
-- ADDITIONAL RLS POLICIES FOR NEW FEATURES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.certification_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Certification policies
CREATE POLICY "Anyone can view active certifications" ON public.certifications FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own certification progress" ON public.user_certifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own certification progress" ON public.user_certifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own certification progress" ON public.user_certifications FOR UPDATE USING (auth.uid() = user_id);

-- Waitlist policies (public for signup, private for management)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own waitlist data" ON public.waitlist_subscribers FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Language policies
CREATE POLICY "Anyone can view supported languages" ON public.supported_languages FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own language preferences" ON public.user_language_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own language preferences" ON public.user_language_preferences FOR ALL USING (auth.uid() = user_id);

-- Mood tracking policies
CREATE POLICY "Users can view own mood data" ON public.user_mood_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own mood entries" ON public.user_mood_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood entries" ON public.user_mood_tracking FOR UPDATE USING (auth.uid() = user_id);

-- Community policies
CREATE POLICY "Anyone can view public groups" ON public.community_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Group members can view private groups" ON public.community_groups FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.group_memberships WHERE group_id = id AND user_id = auth.uid())
);
-- CREATE POLICY "Users can view own connections" ON public.user_connections FOR SELECT USING (auth.uid() = user_id OR connected_user_id = auth.uid()); -- REMOVED DUPLICATE

-- =====================================================
-- ADDITIONAL TRIGGERS FOR NEW FEATURES
-- =====================================================

-- Updated_at triggers for new tables
CREATE TRIGGER update_certification_providers_updated_at BEFORE UPDATE ON public.certification_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_certifications_updated_at BEFORE UPDATE ON public.user_certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waitlist_subscribers_updated_at BEFORE UPDATE ON public.waitlist_subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_language_preferences_updated_at BEFORE UPDATE ON public.user_language_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offline_content_updated_at BEFORE UPDATE ON public.offline_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_groups_updated_at BEFORE UPDATE ON public.community_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_memberships_updated_at BEFORE UPDATE ON public.group_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR NEW FEATURES
-- =====================================================

-- Insert certification providers
INSERT INTO public.certification_providers (name, description, industry, is_verified, rating) VALUES
('AWS', 'Amazon Web Services cloud computing certifications', 'Technology', true, 4.9),
('Microsoft', 'Microsoft technology and cloud certifications', 'Technology', true, 4.8),
('Google', 'Google Cloud Platform and technology certifications', 'Technology', true, 4.7),
('Coursera', 'Professional certificates from top universities', 'Education', true, 4.6),
('edX', 'MicroMasters and professional certificates', 'Education', true, 4.5)
ON CONFLICT (name) DO NOTHING;

-- Insert sample certifications
INSERT INTO public.certifications (provider_id, name, description, category, difficulty, duration_weeks, exam_cost, industry_recognition) VALUES
((SELECT id FROM public.certification_providers WHERE name = 'AWS'), 'AWS Cloud Practitioner', 'Foundational cloud computing certification', 'Cloud Computing', 'beginner', 8, 100.00, 9),
((SELECT id FROM public.certification_providers WHERE name = 'Microsoft'), 'Microsoft Azure Fundamentals', 'Basic Azure cloud concepts', 'Cloud Computing', 'beginner', 6, 99.00, 8),
((SELECT id FROM public.certification_providers WHERE name = 'Google'), 'Google Cloud Digital Leader', 'Digital transformation fundamentals', 'Cloud Computing', 'beginner', 4, 99.00, 8)
ON CONFLICT DO NOTHING;

-- Insert supported languages
INSERT INTO public.supported_languages (language_code, language_name, native_name, is_default) VALUES
('en', 'English', 'English', true),
('hi', 'Hindi', 'हिन्दी', false),
('ta', 'Tamil', 'தமிழ்', false),
('bn', 'Bengali', 'বাংলা', false),
('te', 'Telugu', 'తెలుగు', false),
('mr', 'Marathi', 'मराठी', false),
('gu', 'Gujarati', 'ગુજરાતી', false),
('kn', 'Kannada', 'ಕನ್ನಡ', false),
('ml', 'Malayalam', 'മലയാളം', false),
('pa', 'Punjabi', 'ਪੰਜਾਬੀ', false)
ON CONFLICT (language_code) DO NOTHING;

-- =====================================================
-- FINAL MISSING FEATURE: SKILL CATEGORIES SYSTEM
-- =====================================================

-- Skill categories for better organization
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color_hex TEXT DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default skill categories
INSERT INTO public.skill_categories (name, description, color_hex, sort_order) VALUES
('Programming', 'Software development and coding skills', '#3B82F6', 1),
('Data Science', 'Data analysis, machine learning, and statistics', '#10B981', 2),
('Design', 'UI/UX, graphic design, and visual arts', '#F59E0B', 3),
('Business', 'Management, marketing, and entrepreneurship', '#8B5CF6', 4),
('Creative Arts', 'Writing, music, and creative expression', '#EC4899', 5),
('Languages', 'Foreign language proficiency', '#06B6D4', 6),
('Science', 'Scientific research and technical knowledge', '#84CC16', 7),
('Health & Wellness', 'Physical and mental health skills', '#EF4444', 8)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on skill categories
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;

-- Skill categories policies
CREATE POLICY "Anyone can view active skill categories" ON public.skill_categories FOR SELECT USING (is_active = true);

-- Updated_at trigger for skill categories
CREATE TRIGGER update_skill_categories_updated_at BEFORE UPDATE ON public.skill_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for skill categories
CREATE INDEX IF NOT EXISTS idx_skill_categories_sort_order ON public.skill_categories(sort_order);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Log completion
-- =====================================================
-- ADDITIONAL TABLES FROM SCRIPTS FOLDER
-- =====================================================

-- =====================================================
-- CONTENT MANAGEMENT SYSTEM (PHASE 3)
-- =====================================================

-- Learning Content Table
CREATE TABLE IF NOT EXISTS public.learning_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    duration INTEGER NOT NULL, -- in minutes
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    type TEXT NOT NULL CHECK (type IN ('video', 'article', 'interactive', 'quiz', 'project')),
    source TEXT NOT NULL,
    source_url TEXT,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    learning_objectives TEXT[] DEFAULT '{}',
    content_data JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_id UUID REFERENCES public.learning_content(id) ON DELETE CASCADE NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent INTEGER DEFAULT 0, -- in minutes
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    UNIQUE(user_id, content_id)
);

-- Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    category TEXT CHECK (category IN ('learning', 'achievement', 'milestone', 'special')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) NOT NULL,
    requirements JSONB, -- JSON data for badge requirements
    xp_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Learning Paths
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER, -- in hours
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Path Modules
CREATE TABLE IF NOT EXISTS public.path_modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
    content_id UUID REFERENCES public.learning_content(id) ON DELETE CASCADE NOT NULL,
    module_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Learning Paths
CREATE TABLE IF NOT EXISTS public.user_learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    is_completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, path_id)
);

-- =====================================================
-- MENTORSHIP SYSTEM (PHASE 4) - ENHANCED TABLES
-- =====================================================

-- Mentor profiles (enhanced version)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, category, skill)
);

-- Mentor availability
CREATE TABLE IF NOT EXISTS public.mentor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    session_types TEXT[] DEFAULT '{}', -- 'one_time', 'ongoing', 'project_based'
    max_duration_minutes INTEGER DEFAULT 60,
    hourly_rate DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentorship sessions (enhanced version)
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_url TEXT,
    meeting_password TEXT,
    agenda JSONB DEFAULT '[]',
    notes TEXT,
    action_items JSONB DEFAULT '[]',
    resources_shared JSONB DEFAULT '[]',
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    mentor_rating INTEGER CHECK (mentor_rating BETWEEN 1 AND 5),
    mentee_rating INTEGER CHECK (mentee_rating BETWEEN 1 AND 5),
    mentor_feedback TEXT,
    mentee_feedback TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMMUNITY FEATURES (PHASE 4)
-- =====================================================

-- User connections (follow/following) - REMOVED DUPLICATE

-- Direct messages
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'link'
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum categories
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum replies
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    is_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study groups
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    max_members INTEGER DEFAULT 20,
    current_members INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study group members
CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) DEFAULT 'member', -- 'member', 'moderator', 'admin'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Peer reviews
CREATE TABLE IF NOT EXISTS public.peer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    review_type VARCHAR(50) NOT NULL, -- 'project', 'skill', 'mentorship', 'general'
    content_id UUID, -- Optional: reference to specific content
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    areas_for_improvement TEXT[] DEFAULT '{}',
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI COACHING SYSTEM (PHASE 4)
-- =====================================================

-- AI coaching sessions
CREATE TABLE IF NOT EXISTS public.ai_coaching_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_type VARCHAR(50) DEFAULT 'career_coach', -- 'career_coach', 'skill_guidance', 'project_help'
    title TEXT,
    context JSONB DEFAULT '{}', -- User context for AI
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI coaching messages
CREATE TABLE IF NOT EXISTS public.ai_coaching_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.ai_coaching_sessions(id) ON DELETE CASCADE NOT NULL,
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'ai', 'system'
    content TEXT NOT NULL,
    message_data JSONB DEFAULT '{}', -- Additional message metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill gap analyses (enhanced version)
CREATE TABLE IF NOT EXISTS public.skill_gap_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    target_role TEXT NOT NULL,
    current_skills_assessment JSONB NOT NULL DEFAULT '{}',
    target_skills_required JSONB NOT NULL DEFAULT '{}',
    skill_gaps JSONB NOT NULL DEFAULT '{}',
    recommended_courses JSONB DEFAULT '[]',
    recommended_projects JSONB DEFAULT '[]',
    learning_path JSONB DEFAULT '[]',
    estimated_time_to_target TEXT,
    priority_skills TEXT[] DEFAULT '{}',
    market_demand_scores JSONB DEFAULT '{}',
    overall_match_score DECIMAL(3,2),
    is_active BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION SETTINGS (ENHANCED)
-- =====================================================

-- Notification settings for user preferences
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Notification Settings
    settings JSONB NOT NULL DEFAULT '{
        "emailNotifications": true,
        "pushNotifications": true,
        "reminderNotifications": true,
        "achievementNotifications": true,
        "socialNotifications": true,
        "mentorNotifications": true,
        "systemNotifications": true,
        "reminderTime": "09:00",
        "reminderDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
        "quietHours": {
            "enabled": true,
            "start": "22:00",
            "end": "08:00"
        },
        "frequency": "immediate"
    }',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADDITIONAL RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Anyone can view published learning content" ON public.learning_content FOR SELECT USING (is_published = true);
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active badges" ON public.badges FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own badges" ON public.user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view published learning paths" ON public.learning_paths FOR SELECT USING (is_published = true);
CREATE POLICY "Users can view own learning paths" ON public.user_learning_paths FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own learning paths" ON public.user_learning_paths FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active mentors" ON public.mentor_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create own mentor profile" ON public.mentor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mentor profile" ON public.mentor_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own connections" ON public.user_connections FOR SELECT USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
CREATE POLICY "Users can create connections" ON public.user_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own messages" ON public.direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Anyone can view forum categories" ON public.forum_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Users can create forum posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own forum posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Anyone can view forum replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Users can create forum replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own forum replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view active study groups" ON public.study_groups FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create study groups" ON public.study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view own study group memberships" ON public.study_group_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join study groups" ON public.study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own peer reviews" ON public.peer_reviews FOR SELECT USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);
CREATE POLICY "Users can create peer reviews" ON public.peer_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can view own coaching sessions" ON public.ai_coaching_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own coaching sessions" ON public.ai_coaching_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can view own skill analyses" ON public.skill_gap_analyses FOR SELECT USING (auth.uid() = user_id); -- REMOVED DUPLICATE
-- CREATE POLICY "Users can create own skill analyses" ON public.skill_gap_analyses FOR INSERT WITH CHECK (auth.uid() = user_id); -- REMOVED DUPLICATE

CREATE POLICY "Users can view own notification settings" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notification settings" ON public.notification_settings FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- ADDITIONAL TRIGGERS FOR NEW TABLES
-- =====================================================

-- Updated_at triggers for new tables - REMOVED DUPLICATES
-- These triggers are already created earlier in the schema

-- =====================================================
-- ADDITIONAL INDEXES FOR NEW TABLES
-- =====================================================

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_learning_content_category ON public.learning_content(category);
CREATE INDEX IF NOT EXISTS idx_learning_content_difficulty ON public.learning_content(difficulty);
CREATE INDEX IF NOT EXISTS idx_learning_content_published ON public.learning_content(is_published);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_content_id ON public.user_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_category ON public.learning_paths(category);
CREATE INDEX IF NOT EXISTS idx_learning_paths_published ON public.learning_paths(is_published);
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_user_id ON public.user_learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_active ON public.mentor_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_mentor_specializations_mentor_id ON public.mentor_specializations(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor_id ON public.mentor_availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_id ON public.mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentee_id ON public.mentor_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON public.user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON public.user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON public.direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON public.forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON public.forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_category ON public.study_groups(category);
CREATE INDEX IF NOT EXISTS idx_study_groups_active ON public.study_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON public.study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON public.study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewer ON public.peer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewee ON public.peer_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_sessions_user ON public.ai_coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_messages_session ON public.ai_coaching_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_skill_gap_analyses_user ON public.skill_gap_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================
-- SAMPLE DATA FOR NEW TABLES
-- =====================================================

-- Insert sample forum categories
INSERT INTO public.forum_categories (name, description, color, icon) VALUES
('General Discussion', 'General questions and discussions', '#3B82F6', '💬'),
('Technical Help', 'Technical questions and support', '#10B981', '🔧'),
('Career Advice', 'Career guidance and mentorship', '#F59E0B', '💼'),
('Project Showcase', 'Share your projects and get feedback', '#8B5CF6', '🚀'),
('Learning Resources', 'Share and discover learning materials', '#06B6D4', '📚')
ON CONFLICT DO NOTHING;

-- Insert sample badges
INSERT INTO public.badges (name, description, category, rarity, xp_reward) VALUES
('First Steps', 'Complete your first lesson', 'learning', 'common', 50),
('Code Master', 'Complete 10 coding projects', 'achievement', 'rare', 200),
('Mentor Helper', 'Help 5 other users', 'milestone', 'epic', 500),
('Community Champion', 'Most active forum contributor', 'special', 'legendary', 1000)
ON CONFLICT DO NOTHING;

-- Insert sample notifications for testing (only if users exist)
DO $$
BEGIN
    -- Only insert sample notifications if there are users in auth.users
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
        -- Add welcome notification for first user
        INSERT INTO public.notifications (user_id, type, title, message, priority, action_url, action_text, data)
        SELECT 
            u.id,
            'system',
            'Welcome to Nexa!',
            'Start your learning journey by completing your first lesson.',
            'high',
            '/learning-paths',
            'Start Learning',
            '{"icon": "🎉", "category": "welcome"}'
        FROM auth.users u
        WHERE u.id NOT IN (
            SELECT DISTINCT user_id FROM public.notifications WHERE type = 'system' AND data->>'category' = 'welcome'
        )
        LIMIT 1;
        
        -- Add achievement notification
        INSERT INTO public.notifications (user_id, type, title, message, priority, action_url, action_text, data)
        SELECT 
            u.id,
            'achievement',
            'Achievement Unlocked!',
            'You''ve completed your first lesson. Keep up the great work!',
            'medium',
            '/achievements',
            'View Achievements',
            '{"icon": "🏆", "category": "achievement"}'
        FROM auth.users u
        WHERE u.id NOT IN (
            SELECT DISTINCT user_id FROM public.notifications WHERE type = 'achievement' AND data->>'category' = 'achievement'
        )
        LIMIT 1;
        
        -- Add mentor notification
        INSERT INTO public.notifications (user_id, type, title, message, priority, action_url, action_text, data)
        SELECT 
            u.id,
            'mentor',
            'New Mentor Available',
            'Sarah Johnson is now available for mentorship in React development.',
            'low',
            '/mentor-matchmaking',
            'Connect',
            '{"icon": "👩‍💻", "category": "mentorship"}'
        FROM auth.users u
        WHERE u.id NOT IN (
            SELECT DISTINCT user_id FROM public.notifications WHERE type = 'mentor' AND data->>'category' = 'mentorship'
        )
        LIMIT 1;
    END IF;
END $$;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Nexa database schema created successfully!';
    RAISE NOTICE 'Tables created: profiles, roadmaps, projects, mentors, chat_conversations, and more';
    RAISE NOTICE 'Additional features: courses, teams, skill gaps, resumes, gamification, and more';
    RAISE NOTICE 'Phase 3 & 4 features: learning content, mentorship, community, AI coaching';
    RAISE NOTICE 'RLS policies enabled for data security';
    RAISE NOTICE 'Triggers and functions configured';
    RAISE NOTICE 'Ready for your complete Nexa platform!';
END $$;
