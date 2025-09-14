-- Phase 4: Enhanced Mentor Profile System Database Schema
-- This extends the existing mentor system with comprehensive profile features

-- =====================================================
-- ENHANCED MENTOR PROFILES TABLE
-- =====================================================

-- First, ensure the mentors table has all necessary columns
ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS expertise_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT '24 hours',
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- =====================================================
-- MENTOR VERIFICATION SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mentor_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'education', 'experience', 'certification', 'company')),
    document_type TEXT NOT NULL,
    document_url TEXT,
    document_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENTOR AVAILABILITY SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mentor_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 1 = Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    is_recurring BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENTOR SESSIONS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT DEFAULT 'one-time' CHECK (session_type IN ('one-time', 'ongoing', 'group')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show')),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_url TEXT,
    meeting_id TEXT,
    meeting_password TEXT,
    notes TEXT,
    mentee_goals TEXT[],
    session_outcomes JSONB DEFAULT '{}',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENTOR FEEDBACK SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mentor_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.mentorship_sessions(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    expertise_rating INTEGER CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
    helpfulness_rating INTEGER CHECK (helpfulness_rating >= 1 AND helpfulness_rating <= 5),
    overall_feedback TEXT,
    strengths TEXT[],
    improvements TEXT[],
    would_recommend BOOLEAN,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENTOR MATCHING SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mentor_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    match_score DECIMAL(5,2) NOT NULL,
    match_reasons JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    mentee_goals TEXT[],
    preferred_communication TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENTOR REQUESTS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mentorship_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT DEFAULT 'mentorship' CHECK (request_type IN ('mentorship', 'consultation', 'review', 'guidance')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    goals TEXT[],
    preferred_time TEXT,
    duration_minutes INTEGER DEFAULT 60,
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    mentor_response TEXT,
    scheduled_session_id UUID REFERENCES public.mentorship_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENTOR SPECIALIZATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mentor_specializations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    proficiency_level TEXT DEFAULT 'expert' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER DEFAULT 0,
    certifications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENTOR ACHIEVEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mentor_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    organization TEXT,
    year INTEGER,
    verification_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Mentor table indexes
CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON public.mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_expertise ON public.mentors USING GIN(expertise_areas);
CREATE INDEX IF NOT EXISTS idx_mentors_available ON public.mentors(is_available);
CREATE INDEX IF NOT EXISTS idx_mentors_verified ON public.mentors(is_verified);
CREATE INDEX IF NOT EXISTS idx_mentors_rating ON public.mentors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_mentors_location ON public.mentors(location);
CREATE INDEX IF NOT EXISTS idx_mentors_online ON public.mentors(is_online);

-- Verification indexes
CREATE INDEX IF NOT EXISTS idx_mentor_verifications_mentor_id ON public.mentor_verifications(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_verifications_status ON public.mentor_verifications(status);
CREATE INDEX IF NOT EXISTS idx_mentor_verifications_type ON public.mentor_verifications(verification_type);

-- Availability indexes
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor_id ON public.mentor_availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_availability_day ON public.mentor_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_mentor_availability_available ON public.mentor_availability(is_available);

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentor_id ON public.mentorship_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentee_id ON public.mentorship_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_status ON public.mentorship_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_scheduled ON public.mentorship_sessions(scheduled_at);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_mentor_id ON public.mentor_feedback(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_session_id ON public.mentor_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_rating ON public.mentor_feedback(rating);

-- Match indexes
CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentor_id ON public.mentor_matches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentee_id ON public.mentor_matches(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_matches_score ON public.mentor_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_matches_status ON public.mentor_matches(status);

-- Request indexes
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor_id ON public.mentorship_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee_id ON public.mentorship_requests(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON public.mentorship_requests(status);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_type ON public.mentorship_requests(request_type);

-- Specialization indexes
CREATE INDEX IF NOT EXISTS idx_mentor_specializations_mentor_id ON public.mentor_specializations(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_specializations_specialization ON public.mentor_specializations(specialization);

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_mentor_achievements_mentor_id ON public.mentor_achievements(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_achievements_type ON public.mentor_achievements(achievement_type);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.mentor_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_achievements ENABLE ROW LEVEL SECURITY;

-- Mentor verifications policies
CREATE POLICY "Users can view own verifications" ON public.mentor_verifications
    FOR SELECT USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own verifications" ON public.mentor_verifications
    FOR INSERT WITH CHECK (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own verifications" ON public.mentor_verifications
    FOR UPDATE USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

-- Mentor availability policies
CREATE POLICY "Users can view mentor availability" ON public.mentor_availability
    FOR SELECT USING (true);

CREATE POLICY "Mentors can manage own availability" ON public.mentor_availability
    FOR ALL USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

-- Mentorship sessions policies
CREATE POLICY "Users can view own sessions" ON public.mentorship_sessions
    FOR SELECT USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()) OR mentee_id = auth.uid());

CREATE POLICY "Mentors can manage sessions" ON public.mentorship_sessions
    FOR ALL USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

CREATE POLICY "Mentees can create sessions" ON public.mentorship_sessions
    FOR INSERT WITH CHECK (mentee_id = auth.uid());

-- Mentor feedback policies
CREATE POLICY "Users can view own feedback" ON public.mentor_feedback
    FOR SELECT USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()) OR mentee_id = auth.uid());

CREATE POLICY "Mentees can create feedback" ON public.mentor_feedback
    FOR INSERT WITH CHECK (mentee_id = auth.uid());

-- Mentor matches policies
CREATE POLICY "Users can view own matches" ON public.mentor_matches
    FOR SELECT USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()) OR mentee_id = auth.uid());

CREATE POLICY "Users can create matches" ON public.mentor_matches
    FOR INSERT WITH CHECK (mentee_id = auth.uid());

-- Mentorship requests policies
CREATE POLICY "Users can view own requests" ON public.mentorship_requests
    FOR SELECT USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()) OR mentee_id = auth.uid());

CREATE POLICY "Mentees can create requests" ON public.mentorship_requests
    FOR INSERT WITH CHECK (mentee_id = auth.uid());

CREATE POLICY "Mentors can update requests" ON public.mentorship_requests
    FOR UPDATE USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

-- Mentor specializations policies
CREATE POLICY "Users can view specializations" ON public.mentor_specializations
    FOR SELECT USING (true);

CREATE POLICY "Mentors can manage own specializations" ON public.mentor_specializations
    FOR ALL USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

-- Mentor achievements policies
CREATE POLICY "Users can view achievements" ON public.mentor_achievements
    FOR SELECT USING (true);

CREATE POLICY "Mentors can manage own achievements" ON public.mentor_achievements
    FOR ALL USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

-- =====================================================
-- FUNCTIONS FOR MENTOR PROFILE COMPLETENESS
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_mentor_profile_completeness(mentor_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completeness INTEGER := 0;
    mentor_record RECORD;
BEGIN
    SELECT * INTO mentor_record FROM public.mentors WHERE id = mentor_id;
    
    -- Basic profile (20 points)
    IF mentor_record.bio IS NOT NULL AND LENGTH(mentor_record.bio) > 50 THEN
        completeness := completeness + 5;
    END IF;
    
    IF mentor_record.expertise_areas IS NOT NULL AND array_length(mentor_record.expertise_areas, 1) > 0 THEN
        completeness := completeness + 5;
    END IF;
    
    IF mentor_record.experience_years > 0 THEN
        completeness := completeness + 5;
    END IF;
    
    IF mentor_record.hourly_rate > 0 THEN
        completeness := completeness + 5;
    END IF;
    
    -- Availability (20 points)
    IF EXISTS (SELECT 1 FROM public.mentor_availability WHERE mentor_id = mentor_record.id) THEN
        completeness := completeness + 20;
    END IF;
    
    -- Specializations (20 points)
    IF EXISTS (SELECT 1 FROM public.mentor_specializations WHERE mentor_id = mentor_record.id) THEN
        completeness := completeness + 20;
    END IF;
    
    -- Achievements (20 points)
    IF EXISTS (SELECT 1 FROM public.mentor_achievements WHERE mentor_id = mentor_record.id) THEN
        completeness := completeness + 20;
    END IF;
    
    -- Verification (20 points)
    IF mentor_record.is_verified THEN
        completeness := completeness + 20;
    ELSIF EXISTS (SELECT 1 FROM public.mentor_verifications WHERE mentor_id = mentor_record.id AND status = 'approved') THEN
        completeness := completeness + 10;
    END IF;
    
    RETURN LEAST(completeness, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update mentor rating when feedback is added
CREATE OR REPLACE FUNCTION public.update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.mentors 
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM public.mentor_feedback 
            WHERE mentor_id = NEW.mentor_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM public.mentor_feedback 
            WHERE mentor_id = NEW.mentor_id
        ),
        updated_at = NOW()
    WHERE id = NEW.mentor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mentor_rating_trigger
    AFTER INSERT OR UPDATE ON public.mentor_feedback
    FOR EACH ROW
    EXECUTE FUNCTION public.update_mentor_rating();

-- Update mentor profile completeness
CREATE OR REPLACE FUNCTION public.update_mentor_completeness()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.mentors 
    SET 
        profile_completeness = public.calculate_mentor_profile_completeness(NEW.id),
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mentor_completeness_trigger
    AFTER INSERT OR UPDATE ON public.mentors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_mentor_completeness();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample mentor specializations
INSERT INTO public.mentor_specializations (mentor_id, specialization, proficiency_level, years_experience, certifications)
SELECT 
    m.id,
    'Web Development',
    'expert',
    8,
    ARRAY['AWS Certified Developer', 'React Professional']
FROM public.mentors m
WHERE m.user_id IN (SELECT id FROM auth.users WHERE email LIKE '%mentor%')
LIMIT 3;

-- Insert sample achievements
INSERT INTO public.mentor_achievements (mentor_id, achievement_type, title, description, organization, year, is_verified)
SELECT 
    m.id,
    'award',
    'Best Mentor 2023',
    'Recognized for outstanding mentorship and student success',
    'Tech Education Awards',
    2023,
    true
FROM public.mentors m
WHERE m.user_id IN (SELECT id FROM auth.users WHERE email LIKE '%mentor%')
LIMIT 2;

-- Insert sample availability
INSERT INTO public.mentor_availability (mentor_id, day_of_week, start_time, end_time, timezone)
SELECT 
    m.id,
    generate_series(1, 5), -- Monday to Friday
    '09:00'::TIME,
    '17:00'::TIME,
    'UTC'
FROM public.mentors m
WHERE m.user_id IN (SELECT id FROM auth.users WHERE email LIKE '%mentor%')
LIMIT 3;

COMMIT;
