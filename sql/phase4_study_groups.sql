-- PHASE 4: STUDY GROUPS SYSTEM
-- Database schema for study groups and community features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create study_groups table
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    max_members INTEGER DEFAULT 10 CHECK (max_members >= 2 AND max_members <= 50),
    current_members INTEGER DEFAULT 0,
    meeting_schedule TEXT,
    meeting_location TEXT,
    meeting_type VARCHAR(20) DEFAULT 'online' CHECK (meeting_type IN ('online', 'in_person', 'hybrid')),
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_group_members table
CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    study_group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(study_group_id, user_id)
);

-- Create user_connections table
CREATE TABLE IF NOT EXISTS public.user_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    connected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'rejected', 'blocked')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, connected_user_id)
);

-- Create user_activity_feed table
CREATE TABLE IF NOT EXISTS public.user_activity_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table (if not exists)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON public.study_groups(subject);
CREATE INDEX IF NOT EXISTS idx_study_groups_level ON public.study_groups(level);
CREATE INDEX IF NOT EXISTS idx_study_groups_meeting_type ON public.study_groups(meeting_type);
CREATE INDEX IF NOT EXISTS idx_study_groups_is_public ON public.study_groups(is_public);
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON public.study_groups(created_by);

CREATE INDEX IF NOT EXISTS idx_study_group_members_group ON public.study_group_members(study_group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user ON public.study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_role ON public.study_group_members(role);

CREATE INDEX IF NOT EXISTS idx_user_connections_user ON public.user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected ON public.user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);

CREATE INDEX IF NOT EXISTS idx_user_activity_feed_user ON public.user_activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_type ON public.user_activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_created_at ON public.user_activity_feed(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Enable RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_groups
CREATE POLICY "Anyone can view public study groups" ON public.study_groups
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own study groups" ON public.study_groups
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can view study groups they are members of" ON public.study_groups
    FOR SELECT USING (
        id IN (
            SELECT study_group_id FROM public.study_group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create study groups" ON public.study_groups
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can update their groups" ON public.study_groups
    FOR UPDATE USING (
        created_by = auth.uid() OR
        id IN (
            SELECT study_group_id FROM public.study_group_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Group admins can delete their groups" ON public.study_groups
    FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for study_group_members
CREATE POLICY "Users can view members of their groups" ON public.study_group_members
    FOR SELECT USING (
        study_group_id IN (
            SELECT id FROM public.study_groups 
            WHERE created_by = auth.uid() OR is_public = true
        ) OR
        user_id = auth.uid()
    );

CREATE POLICY "Users can join public study groups" ON public.study_group_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        study_group_id IN (
            SELECT id FROM public.study_groups WHERE is_public = true
        )
    );

CREATE POLICY "Users can leave study groups" ON public.study_group_members
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for user_connections
CREATE POLICY "Users can view their own connections" ON public.user_connections
    FOR SELECT USING (user_id = auth.uid() OR connected_user_id = auth.uid());

CREATE POLICY "Users can create connection requests" ON public.user_connections
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own connections" ON public.user_connections
    FOR UPDATE USING (user_id = auth.uid() OR connected_user_id = auth.uid());

-- RLS Policies for user_activity_feed
CREATE POLICY "Users can view public activities" ON public.user_activity_feed
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view their own activities" ON public.user_activity_feed
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own activities" ON public.user_activity_feed
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION update_study_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.study_groups 
        SET current_members = current_members + 1,
            updated_at = NOW()
        WHERE id = NEW.study_group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.study_groups 
        SET current_members = current_members - 1,
            updated_at = NOW()
        WHERE id = OLD.study_group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_study_group_member_count_trigger
    AFTER INSERT OR DELETE ON public.study_group_members
    FOR EACH ROW EXECUTE FUNCTION update_study_group_member_count();

-- Function to create activity feed entry
CREATE OR REPLACE FUNCTION create_activity_feed_entry(
    p_user_id UUID,
    p_activity_type VARCHAR(50),
    p_activity_data JSONB,
    p_visibility VARCHAR(20) DEFAULT 'public'
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_activity_feed (
        user_id,
        activity_type,
        activity_data,
        visibility
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_activity_data,
        p_visibility
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(200),
    p_message TEXT,
    p_data JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_data
    );
END;
$$ LANGUAGE plpgsql;

-- Sample data
INSERT INTO public.study_groups (name, description, subject, level, max_members, meeting_schedule, meeting_location, meeting_type, created_by) VALUES
('React Study Group', 'Learn React fundamentals and build projects together', 'Web Development', 'beginner', 8, 'Every Tuesday 7-9 PM', 'Zoom: https://zoom.us/j/123456789', 'online', (SELECT id FROM auth.users LIMIT 1)),
('Data Science Advanced', 'Advanced data science concepts and machine learning', 'Data Science', 'advanced', 6, 'Every Saturday 2-4 PM', 'Room 101, Tech Building', 'in_person', (SELECT id FROM auth.users LIMIT 1)),
('UI/UX Design Workshop', 'Design thinking and user experience principles', 'Design', 'intermediate', 10, 'Every Thursday 6-8 PM', 'Design Studio', 'hybrid', (SELECT id FROM auth.users LIMIT 1));

-- Success message
SELECT 'Study groups system database setup completed successfully!' as message;
