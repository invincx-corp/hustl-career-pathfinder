-- =====================================================
-- PHASE 4: PUBLIC USER PROFILES - ULTRA SIMPLE VERSION
-- =====================================================

-- Create the main public profiles table first
CREATE TABLE IF NOT EXISTS public.public_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
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

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_public_profiles_user_id ON public.public_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_public_profiles_username ON public.public_profiles(username);
CREATE INDEX IF NOT EXISTS idx_public_profiles_is_public ON public.public_profiles(is_public);

-- Enable RLS
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;
