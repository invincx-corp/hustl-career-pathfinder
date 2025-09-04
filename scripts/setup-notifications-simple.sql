-- Simple notification setup that works with existing auth.users table
-- This script will work even if profiles table doesn't exist yet

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create notifications table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification Details
    type TEXT NOT NULL CHECK (type IN ('achievement', 'mentorship', 'project', 'system', 'reminder', 'social')),
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

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
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

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings" ON public.notification_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" ON public.notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON public.notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification settings" ON public.notification_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);

-- Add trigger to update updated_at timestamp for notification_settings
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

-- Add some sample notifications for testing (only if users exist)
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

        -- Add achievement notification for first user
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

        -- Add mentor notification for first user
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
