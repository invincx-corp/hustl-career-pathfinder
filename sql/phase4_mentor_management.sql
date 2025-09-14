-- PHASE 4: MENTOR PROFILES & VERIFICATION DATABASE SCHEMA
-- Complete mentor profile system with verification and availability

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create mentor profiles table (extended from basic mentors table)
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    bio TEXT,
    expertise_areas TEXT[] NOT NULL,
    experience_years INTEGER DEFAULT 0,
    education TEXT[],
    certifications TEXT[],
    languages TEXT[] DEFAULT ARRAY['English'],
    hourly_rate DECIMAL(10,2),
    currency TEXT DEFAULT 'INR',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    availability_schedule JSONB DEFAULT '{}',
    max_students INTEGER DEFAULT 5,
    current_students INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
    verification_documents JSONB DEFAULT '[]',
    verification_notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_ratings INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    response_time_hours INTEGER DEFAULT 24,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT TRUE,
    profile_completeness INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create mentor specializations table
CREATE TABLE IF NOT EXISTS public.mentor_specializations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    specialization_name TEXT NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5) DEFAULT 3,
    years_experience INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor availability table
CREATE TABLE IF NOT EXISTS public.mentor_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL, -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, day_of_week, start_time)
);

-- Create mentor sessions table
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_type TEXT CHECK (session_type IN ('consultation', 'review', 'guidance', 'project_help', 'career_advice')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    session_notes TEXT,
    student_feedback TEXT,
    mentor_feedback TEXT,
    student_rating INTEGER CHECK (student_rating >= 1 AND student_rating <= 5),
    mentor_rating INTEGER CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor verification requests table
CREATE TABLE IF NOT EXISTS public.mentor_verification_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
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

-- Create mentor reviews table
CREATE TABLE IF NOT EXISTS public.mentor_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.mentor_sessions(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    expertise_rating INTEGER CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
    helpfulness_rating INTEGER CHECK (helpfulness_rating >= 1 AND helpfulness_rating <= 5),
    would_recommend BOOLEAN,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, student_id, session_id)
);

-- Create mentor matching preferences table
CREATE TABLE IF NOT EXISTS public.mentor_matching_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    preferred_student_levels TEXT[] DEFAULT ARRAY['beginner', 'intermediate', 'advanced'],
    preferred_domains TEXT[],
    max_students_per_domain INTEGER DEFAULT 3,
    preferred_session_types TEXT[] DEFAULT ARRAY['consultation', 'review', 'guidance'],
    timezone_preference TEXT DEFAULT 'Asia/Kolkata',
    language_preference TEXT[] DEFAULT ARRAY['English'],
    auto_accept_requests BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id)
);

-- Create mentor notifications table
CREATE TABLE IF NOT EXISTS public.mentor_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT CHECK (notification_type IN ('session_request', 'session_reminder', 'session_cancelled', 'review_received', 'verification_update', 'student_message')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_mentor_profiles_user_id ON public.mentor_profiles(user_id);
CREATE INDEX idx_mentor_profiles_verified ON public.mentor_profiles(is_verified);
CREATE INDEX idx_mentor_profiles_available ON public.mentor_profiles(is_available);
CREATE INDEX idx_mentor_profiles_rating ON public.mentor_profiles(rating);
CREATE INDEX idx_mentor_profiles_expertise ON public.mentor_profiles USING GIN(expertise_areas);

CREATE INDEX idx_mentor_specializations_mentor ON public.mentor_specializations(mentor_id);
CREATE INDEX idx_mentor_specializations_name ON public.mentor_specializations(specialization_name);

CREATE INDEX idx_mentor_availability_mentor ON public.mentor_availability(mentor_id);
CREATE INDEX idx_mentor_availability_day ON public.mentor_availability(day_of_week);

CREATE INDEX idx_mentor_sessions_mentor ON public.mentor_sessions(mentor_id);
CREATE INDEX idx_mentor_sessions_student ON public.mentor_sessions(student_id);
CREATE INDEX idx_mentor_sessions_scheduled ON public.mentor_sessions(scheduled_at);
CREATE INDEX idx_mentor_sessions_status ON public.mentor_sessions(status);

CREATE INDEX idx_mentor_verification_requests_mentor ON public.mentor_verification_requests(mentor_id);
CREATE INDEX idx_mentor_verification_requests_status ON public.mentor_verification_requests(status);

CREATE INDEX idx_mentor_reviews_mentor ON public.mentor_reviews(mentor_id);
CREATE INDEX idx_mentor_reviews_student ON public.mentor_reviews(student_id);
CREATE INDEX idx_mentor_reviews_rating ON public.mentor_reviews(rating);

CREATE INDEX idx_mentor_matching_preferences_mentor ON public.mentor_matching_preferences(mentor_id);

CREATE INDEX idx_mentor_notifications_mentor ON public.mentor_notifications(mentor_id);
CREATE INDEX idx_mentor_notifications_read ON public.mentor_notifications(is_read);

-- Enable RLS on all tables
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_matching_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view public mentor profiles" ON public.mentor_profiles
    FOR SELECT USING (is_verified = true AND is_available = true);

CREATE POLICY "Users can view their own mentor profile" ON public.mentor_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mentor profile" ON public.mentor_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor profile" ON public.mentor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all mentor profiles" ON public.mentor_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Mentor specializations policies
CREATE POLICY "Users can view mentor specializations" ON public.mentor_specializations
    FOR SELECT USING (true);

CREATE POLICY "Mentors can manage their specializations" ON public.mentor_specializations
    FOR ALL USING (
        mentor_id IN (
            SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()
        )
    );

-- Mentor sessions policies
CREATE POLICY "Users can view their own sessions" ON public.mentor_sessions
    FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = student_id);

CREATE POLICY "Mentors can create sessions" ON public.mentor_sessions
    FOR INSERT WITH CHECK (
        mentor_id IN (
            SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their sessions" ON public.mentor_sessions
    FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- Mentor reviews policies
CREATE POLICY "Users can view mentor reviews" ON public.mentor_reviews
    FOR SELECT USING (true);

CREATE POLICY "Students can create reviews" ON public.mentor_reviews
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own reviews" ON public.mentor_reviews
    FOR UPDATE USING (auth.uid() = student_id);

-- Functions
CREATE OR REPLACE FUNCTION update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.mentor_profiles 
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM public.mentor_reviews 
            WHERE mentor_id = NEW.mentor_id
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM public.mentor_reviews 
            WHERE mentor_id = NEW.mentor_id
        )
    WHERE id = NEW.mentor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_mentor_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.mentor_profiles 
        SET current_students = current_students + 1 
        WHERE id = NEW.mentor_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.mentor_profiles 
        SET current_students = current_students - 1 
        WHERE id = OLD.mentor_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_mentor_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.mentor_reviews
    FOR EACH ROW EXECUTE FUNCTION update_mentor_rating();

CREATE TRIGGER update_mentor_student_count_trigger
    AFTER INSERT OR DELETE ON public.mentor_sessions
    FOR EACH ROW EXECUTE FUNCTION update_mentor_student_count();

-- Sample data
INSERT INTO public.mentor_profiles (
    user_id, bio, expertise_areas, experience_years, education, 
    certifications, hourly_rate, is_verified, verification_status
) VALUES
((SELECT id FROM auth.users LIMIT 1), 
 'Senior Software Engineer with 8+ years experience in full-stack development. Passionate about mentoring new developers.',
 ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'AWS'], 
 8, 
 ARRAY['B.Tech Computer Science', 'M.S. Software Engineering'],
 ARRAY['AWS Certified Developer', 'Google Cloud Professional'],
 1500.00, 
 true, 
 'approved'
);

-- Success message
SELECT 'Mentor profiles database setup completed successfully!' as message;
