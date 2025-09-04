-- First, ensure the profiles table exists (in case it doesn't)
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

-- Add notification_settings table for user notification preferences
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

-- Add RLS policies
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own notification settings
CREATE POLICY "Users can view own notification settings" ON public.notification_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" ON public.notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON public.notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification settings" ON public.notification_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_settings_updated_at
    BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_settings_updated_at();

-- Add some sample notifications for testing
INSERT INTO public.notifications (user_id, type, title, message, priority, action_url, action_text, icon, category)
SELECT 
    p.id,
    'system',
    'Welcome to Nexa!',
    'Start your learning journey by completing your first lesson.',
    'high',
    '/learning-paths',
    'Start Learning',
    '🎉',
    'welcome'
FROM public.profiles p
WHERE p.id NOT IN (
    SELECT DISTINCT user_id FROM public.notifications WHERE type = 'system' AND category = 'welcome'
)
LIMIT 10;

-- Add achievement notification
INSERT INTO public.notifications (user_id, type, title, message, priority, action_url, action_text, icon, category)
SELECT 
    p.id,
    'achievement',
    'Achievement Unlocked!',
    'You''ve completed your first lesson. Keep up the great work!',
    'medium',
    '/achievements',
    'View Achievements',
    '🏆',
    'achievement'
FROM public.profiles p
WHERE p.id NOT IN (
    SELECT DISTINCT user_id FROM public.notifications WHERE type = 'achievement' AND category = 'achievement'
)
LIMIT 5;

-- Add mentor notification
INSERT INTO public.notifications (user_id, type, title, message, priority, action_url, action_text, icon, category)
SELECT 
    p.id,
    'mentor',
    'New Mentor Available',
    'Sarah Johnson is now available for mentorship in React development.',
    'low',
    '/mentor-matchmaking',
    'Connect',
    '👩‍💻',
    'mentorship'
FROM public.profiles p
WHERE p.id NOT IN (
    SELECT DISTINCT user_id FROM public.notifications WHERE type = 'mentor' AND category = 'mentorship'
)
LIMIT 3;
