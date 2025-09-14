-- PHASE 5: OPPORTUNITIES & CAREER DATABASE SETUP
-- Comprehensive setup for job matching, talent pools, and career opportunities

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing Phase 5 tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.job_applications CASCADE;
DROP TABLE IF EXISTS public.job_bookmarks CASCADE;
DROP TABLE IF EXISTS public.job_views CASCADE;
DROP TABLE IF EXISTS public.job_skills CASCADE;
DROP TABLE IF EXISTS public.job_benefits CASCADE;
DROP TABLE IF EXISTS public.job_requirements CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.recruiter_profiles CASCADE;
DROP TABLE IF EXISTS public.recruiter_verification_requests CASCADE;
DROP TABLE IF EXISTS public.recruiter_subscriptions CASCADE;
DROP TABLE IF EXISTS public.recruiter_analytics CASCADE;
DROP TABLE IF EXISTS public.talent_pools CASCADE;
DROP TABLE IF EXISTS public.talent_pool_members CASCADE;
DROP TABLE IF EXISTS public.domain_categories CASCADE;
DROP TABLE IF EXISTS public.opportunity_recommendations CASCADE;
DROP TABLE IF EXISTS public.interview_preparations CASCADE;
DROP TABLE IF EXISTS public.interview_sessions CASCADE;
DROP TABLE IF EXISTS public.interview_feedback CASCADE;
DROP TABLE IF EXISTS public.referral_requests CASCADE;
DROP TABLE IF EXISTS public.referral_rewards CASCADE;

-- Create domain categories table
CREATE TABLE public.domain_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#6B7280',
    parent_id UUID REFERENCES public.domain_categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recruiter profiles table
CREATE TABLE public.recruiter_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')) DEFAULT 'medium',
    industry TEXT NOT NULL,
    website TEXT,
    description TEXT,
    logo_url TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
    verification_documents JSONB DEFAULT '[]',
    verification_notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    subscription_plan TEXT CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')) DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    max_job_postings INTEGER DEFAULT 5,
    current_job_postings INTEGER DEFAULT 0,
    max_candidate_searches INTEGER DEFAULT 10,
    current_candidate_searches INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create recruiter verification requests table
CREATE TABLE public.recruiter_verification_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recruiter_id UUID REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE NOT NULL,
    request_type TEXT CHECK (request_type IN ('initial', 'renewal', 'upgrade', 'document_update')) NOT NULL,
    documents JSONB NOT NULL,
    supporting_evidence TEXT,
    request_notes TEXT,
    status TEXT CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'needs_more_info')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recruiter subscriptions table
CREATE TABLE public.recruiter_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recruiter_id UUID REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE NOT NULL,
    plan_name TEXT NOT NULL,
    plan_type TEXT CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise')) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
    max_job_postings INTEGER NOT NULL,
    max_candidate_searches INTEGER NOT NULL,
    advanced_analytics BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    custom_branding BOOLEAN DEFAULT FALSE,
    api_access BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recruiter_id UUID REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    location TEXT NOT NULL,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'internship', 'contract', 'freelance')) NOT NULL,
    experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')) NOT NULL,
    domain_id UUID REFERENCES public.domain_categories(id) ON DELETE SET NULL,
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    salary_currency TEXT DEFAULT 'INR',
    salary_period TEXT CHECK (salary_period IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'yearly',
    is_salary_negotiable BOOLEAN DEFAULT TRUE,
    is_salary_public BOOLEAN DEFAULT TRUE,
    application_deadline TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    duration_months INTEGER, -- For contract/internship roles
    max_applications INTEGER DEFAULT 100,
    current_applications INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT CHECK (status IN ('draft', 'published', 'paused', 'closed', 'filled')) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job requirements table
CREATE TABLE public.job_requirements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    requirement_type TEXT CHECK (requirement_type IN ('education', 'experience', 'skill', 'certification', 'language', 'other')) NOT NULL,
    requirement_text TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1, -- 1 = high, 2 = medium, 3 = low
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job benefits table
CREATE TABLE public.job_benefits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    benefit_type TEXT CHECK (benefit_type IN ('health', 'dental', 'vision', 'retirement', 'vacation', 'sick_leave', 'flexible_hours', 'remote_work', 'learning', 'transportation', 'meal', 'other')) NOT NULL,
    benefit_text TEXT NOT NULL,
    is_highlighted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job skills table
CREATE TABLE public.job_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    skill_name TEXT NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job views table
CREATE TABLE public.job_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job bookmarks table
CREATE TABLE public.job_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, user_id)
);

-- Create job applications table
CREATE TABLE public.job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resume_version_id UUID, -- Reference to user's resume version
    cover_letter TEXT,
    application_status TEXT CHECK (application_status IN ('submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'rejected', 'withdrawn')) DEFAULT 'submitted',
    application_notes TEXT,
    recruiter_notes TEXT,
    interview_scheduled_at TIMESTAMP WITH TIME ZONE,
    interview_notes TEXT,
    offer_details JSONB DEFAULT '{}',
    rejection_reason TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, user_id)
);

-- Create talent pools table
CREATE TABLE public.talent_pools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    domain_id UUID REFERENCES public.domain_categories(id) ON DELETE CASCADE NOT NULL,
    recruiter_id UUID REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE NOT NULL,
    criteria JSONB NOT NULL, -- Search criteria for the talent pool
    is_public BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create talent pool members table
CREATE TABLE public.talent_pool_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    talent_pool_id UUID REFERENCES public.talent_pools(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    added_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(talent_pool_id, user_id)
);

-- Create opportunity recommendations table
CREATE TABLE public.opportunity_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    recommendation_score DECIMAL(5,2) NOT NULL,
    recommendation_reasons TEXT[] NOT NULL,
    is_viewed BOOLEAN DEFAULT FALSE,
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview preparations table
CREATE TABLE public.interview_preparations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    preparation_type TEXT CHECK (preparation_type IN ('mock_interview', 'question_practice', 'skill_assessment', 'company_research')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB DEFAULT '[]',
    answers JSONB DEFAULT '[]',
    feedback TEXT,
    score DECIMAL(5,2),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview sessions table
CREATE TABLE public.interview_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE NOT NULL,
    interviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_type TEXT CHECK (session_type IN ('phone', 'video', 'in_person', 'technical', 'hr', 'final')) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    meeting_notes TEXT,
    status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview feedback table
CREATE TABLE public.interview_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
    feedback_from UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feedback_for UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    technical_skills INTEGER CHECK (technical_skills >= 1 AND technical_skills <= 5),
    communication_skills INTEGER CHECK (communication_skills >= 1 AND communication_skills <= 5),
    problem_solving INTEGER CHECK (problem_solving >= 1 AND problem_solving <= 5),
    cultural_fit INTEGER CHECK (cultural_fit >= 1 AND cultural_fit <= 5),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    strengths TEXT[],
    areas_for_improvement TEXT[],
    recommendation TEXT CHECK (recommendation IN ('strong_hire', 'hire', 'no_hire', 'strong_no_hire')),
    additional_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral requests table
CREATE TABLE public.referral_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    message TEXT,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral rewards table
CREATE TABLE public.referral_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referral_request_id UUID REFERENCES public.referral_requests(id) ON DELETE CASCADE NOT NULL,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reward_type TEXT CHECK (reward_type IN ('cash', 'points', 'badge', 'discount')) NOT NULL,
    reward_value DECIMAL(10,2) NOT NULL,
    reward_currency TEXT DEFAULT 'INR',
    status TEXT CHECK (status IN ('pending', 'approved', 'paid', 'expired')) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recruiter analytics table
CREATE TABLE public.recruiter_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recruiter_id UUID REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_date DATE NOT NULL,
    additional_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domain_categories_parent ON public.domain_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_domain_categories_active ON public.domain_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_domain_categories_sort_order ON public.domain_categories(sort_order);

CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_user_id ON public.recruiter_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_verified ON public.recruiter_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_active ON public.recruiter_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_company ON public.recruiter_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_industry ON public.recruiter_profiles(industry);

CREATE INDEX IF NOT EXISTS idx_recruiter_verification_requests_recruiter ON public.recruiter_verification_requests(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_verification_requests_status ON public.recruiter_verification_requests(status);

CREATE INDEX IF NOT EXISTS idx_recruiter_subscriptions_recruiter ON public.recruiter_subscriptions(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_subscriptions_active ON public.recruiter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_recruiter_subscriptions_expires ON public.recruiter_subscriptions(expires_at);

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON public.jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_domain ON public.jobs(domain_id);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON public.jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience ON public.jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON public.jobs(is_remote);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON public.jobs(is_featured);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON public.jobs(published_at);
CREATE INDEX IF NOT EXISTS idx_jobs_salary ON public.jobs(salary_min, salary_max);

CREATE INDEX IF NOT EXISTS idx_job_requirements_job ON public.job_requirements(job_id);
CREATE INDEX IF NOT EXISTS idx_job_requirements_type ON public.job_requirements(requirement_type);
CREATE INDEX IF NOT EXISTS idx_job_requirements_mandatory ON public.job_requirements(is_mandatory);

CREATE INDEX IF NOT EXISTS idx_job_benefits_job ON public.job_benefits(job_id);
CREATE INDEX IF NOT EXISTS idx_job_benefits_type ON public.job_benefits(benefit_type);

CREATE INDEX IF NOT EXISTS idx_job_skills_job ON public.job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_name ON public.job_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_job_skills_level ON public.job_skills(skill_level);

CREATE INDEX IF NOT EXISTS idx_job_views_job ON public.job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_user ON public.job_views(user_id);
CREATE INDEX IF NOT EXISTS idx_job_views_viewed_at ON public.job_views(viewed_at);

CREATE INDEX IF NOT EXISTS idx_job_bookmarks_job ON public.job_bookmarks(job_id);
CREATE INDEX IF NOT EXISTS idx_job_bookmarks_user ON public.job_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications(applied_at);

CREATE INDEX IF NOT EXISTS idx_talent_pools_domain ON public.talent_pools(domain_id);
CREATE INDEX IF NOT EXISTS idx_talent_pools_recruiter ON public.talent_pools(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_talent_pools_active ON public.talent_pools(is_active);

CREATE INDEX IF NOT EXISTS idx_talent_pool_members_pool ON public.talent_pool_members(talent_pool_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_user ON public.talent_pool_members(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_active ON public.talent_pool_members(is_active);

CREATE INDEX IF NOT EXISTS idx_opportunity_recommendations_user ON public.opportunity_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_recommendations_job ON public.opportunity_recommendations(job_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_recommendations_score ON public.opportunity_recommendations(recommendation_score);
CREATE INDEX IF NOT EXISTS idx_opportunity_recommendations_viewed ON public.opportunity_recommendations(is_viewed);

CREATE INDEX IF NOT EXISTS idx_interview_preparations_user ON public.interview_preparations(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_preparations_job ON public.interview_preparations(job_id);
CREATE INDEX IF NOT EXISTS idx_interview_preparations_type ON public.interview_preparations(preparation_type);
CREATE INDEX IF NOT EXISTS idx_interview_preparations_completed ON public.interview_preparations(is_completed);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_application ON public.interview_sessions(job_application_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_interviewer ON public.interview_sessions(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_scheduled ON public.interview_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON public.interview_sessions(status);

CREATE INDEX IF NOT EXISTS idx_interview_feedback_session ON public.interview_feedback(interview_session_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_from ON public.interview_feedback(feedback_from);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_for ON public.interview_feedback(feedback_for);

CREATE INDEX IF NOT EXISTS idx_referral_requests_referrer ON public.referral_requests(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_referee ON public.referral_requests(referee_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_job ON public.referral_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_status ON public.referral_requests(status);
CREATE INDEX IF NOT EXISTS idx_referral_requests_expires ON public.referral_requests(expires_at);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_request ON public.referral_rewards(referral_request_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON public.referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON public.referral_rewards(status);

CREATE INDEX IF NOT EXISTS idx_recruiter_analytics_recruiter ON public.recruiter_analytics(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_analytics_metric ON public.recruiter_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_recruiter_analytics_date ON public.recruiter_analytics(metric_date);

-- Enable RLS on all tables
ALTER TABLE public.domain_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_preparations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_analytics ENABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'Phase 5 opportunities database setup completed successfully!' as message;
