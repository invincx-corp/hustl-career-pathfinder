-- Simple fix for notification constraints
-- This script only fixes the constraints without recreating tables

-- Fix the type constraint to match what we're actually using
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('achievement', 'mentor', 'project', 'system', 'reminder', 'social'));

-- Fix the priority constraint to include 'medium'
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_priority_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_priority_check 
    CHECK (priority IN ('low', 'medium', 'normal', 'high', 'urgent'));

-- Now insert the sample notifications
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
