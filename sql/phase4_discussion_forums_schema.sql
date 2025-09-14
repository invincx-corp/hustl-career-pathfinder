-- PHASE 4: DISCUSSION FORUMS DATABASE SCHEMA
-- Topic-based discussions and Q&A system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create forums table
CREATE TABLE IF NOT EXISTS public.forums (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    post_count INTEGER DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum categories table
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#6B7280',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    forum_id UUID REFERENCES public.forums(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT CHECK (post_type IN ('discussion', 'question', 'announcement', 'poll', 'resource')) DEFAULT 'discussion',
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum post replies table
CREATE TABLE IF NOT EXISTS public.forum_post_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES public.forum_post_replies(id) ON DELETE CASCADE,
    is_solution BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum post likes table
CREATE TABLE IF NOT EXISTS public.forum_post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create forum reply likes table
CREATE TABLE IF NOT EXISTS public.forum_reply_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reply_id UUID REFERENCES public.forum_post_replies(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reply_id, user_id)
);

-- Create forum subscriptions table
CREATE TABLE IF NOT EXISTS public.forum_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    forum_id UUID REFERENCES public.forums(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_type TEXT CHECK (subscription_type IN ('all', 'mentions', 'none')) DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(forum_id, user_id)
);

-- Create forum post bookmarks table
CREATE TABLE IF NOT EXISTS public.forum_post_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create forum moderators table
CREATE TABLE IF NOT EXISTS public.forum_moderators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    forum_id UUID REFERENCES public.forums(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'moderator')) DEFAULT 'moderator',
    permissions JSONB DEFAULT '{"can_edit_posts": true, "can_delete_posts": true, "can_lock_posts": true, "can_pin_posts": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(forum_id, user_id)
);

-- Create forum notifications table
CREATE TABLE IF NOT EXISTS public.forum_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    forum_id UUID REFERENCES public.forums(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.forum_post_replies(id) ON DELETE CASCADE,
    notification_type TEXT CHECK (notification_type IN ('new_post', 'new_reply', 'post_liked', 'reply_liked', 'mentioned', 'solution_accepted')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum tags table
CREATE TABLE IF NOT EXISTS public.forum_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum post views table
CREATE TABLE IF NOT EXISTS public.forum_post_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_forums_category ON public.forums(category);
CREATE INDEX idx_forums_public ON public.forums(is_public);
CREATE INDEX idx_forums_active ON public.forums(is_active);
CREATE INDEX idx_forums_created_by ON public.forums(created_by);

CREATE INDEX idx_forum_categories_sort_order ON public.forum_categories(sort_order);
CREATE INDEX idx_forum_categories_active ON public.forum_categories(is_active);

CREATE INDEX idx_forum_posts_forum ON public.forum_posts(forum_id);
CREATE INDEX idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX idx_forum_posts_type ON public.forum_posts(post_type);
CREATE INDEX idx_forum_posts_pinned ON public.forum_posts(is_pinned);
CREATE INDEX idx_forum_posts_created_at ON public.forum_posts(created_at);
CREATE INDEX idx_forum_posts_last_activity ON public.forum_posts(last_activity_at);
CREATE INDEX idx_forum_posts_tags ON public.forum_posts USING GIN(tags);

CREATE INDEX idx_forum_post_replies_post ON public.forum_post_replies(post_id);
CREATE INDEX idx_forum_post_replies_author ON public.forum_post_replies(author_id);
CREATE INDEX idx_forum_post_replies_parent ON public.forum_post_replies(parent_reply_id);
CREATE INDEX idx_forum_post_replies_solution ON public.forum_post_replies(is_solution);
CREATE INDEX idx_forum_post_replies_created_at ON public.forum_post_replies(created_at);

CREATE INDEX idx_forum_post_likes_post ON public.forum_post_likes(post_id);
CREATE INDEX idx_forum_post_likes_user ON public.forum_post_likes(user_id);

CREATE INDEX idx_forum_reply_likes_reply ON public.forum_reply_likes(reply_id);
CREATE INDEX idx_forum_reply_likes_user ON public.forum_reply_likes(user_id);

CREATE INDEX idx_forum_subscriptions_forum ON public.forum_subscriptions(forum_id);
CREATE INDEX idx_forum_subscriptions_user ON public.forum_subscriptions(user_id);

CREATE INDEX idx_forum_post_bookmarks_post ON public.forum_post_bookmarks(post_id);
CREATE INDEX idx_forum_post_bookmarks_user ON public.forum_post_bookmarks(user_id);

CREATE INDEX idx_forum_moderators_forum ON public.forum_moderators(forum_id);
CREATE INDEX idx_forum_moderators_user ON public.forum_moderators(user_id);

CREATE INDEX idx_forum_notifications_user ON public.forum_notifications(user_id);
CREATE INDEX idx_forum_notifications_read ON public.forum_notifications(is_read);
CREATE INDEX idx_forum_notifications_created_at ON public.forum_notifications(created_at);

CREATE INDEX idx_forum_tags_name ON public.forum_tags(name);
CREATE INDEX idx_forum_tags_usage ON public.forum_tags(usage_count);

CREATE INDEX idx_forum_post_views_post ON public.forum_post_views(post_id);
CREATE INDEX idx_forum_post_views_user ON public.forum_post_views(user_id);
CREATE INDEX idx_forum_post_views_viewed_at ON public.forum_post_views(viewed_at);

-- Enable RLS on all tables
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view public forums" ON public.forums
    FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Users can view forums they created" ON public.forums
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create forums" ON public.forums
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Forum creators can update their forums" ON public.forums
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Forum moderators can update forums" ON public.forums
    FOR UPDATE USING (
        id IN (
            SELECT forum_id FROM public.forum_moderators 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view forum categories" ON public.forum_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view posts in public forums" ON public.forum_posts
    FOR SELECT USING (
        forum_id IN (
            SELECT id FROM public.forums WHERE is_public = true AND is_active = true
        )
    );

CREATE POLICY "Users can view their own posts" ON public.forum_posts
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON public.forum_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Forum moderators can update posts" ON public.forum_posts
    FOR UPDATE USING (
        forum_id IN (
            SELECT forum_id FROM public.forum_moderators 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view replies to accessible posts" ON public.forum_post_replies
    FOR SELECT USING (
        post_id IN (
            SELECT id FROM public.forum_posts 
            WHERE forum_id IN (
                SELECT id FROM public.forums WHERE is_public = true AND is_active = true
            )
        )
    );

CREATE POLICY "Users can create replies" ON public.forum_post_replies
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own replies" ON public.forum_post_replies
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can view likes" ON public.forum_post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON public.forum_post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.forum_post_likes
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view reply likes" ON public.forum_reply_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own reply likes" ON public.forum_reply_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reply likes" ON public.forum_reply_likes
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions" ON public.forum_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.forum_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.forum_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" ON public.forum_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookmarks" ON public.forum_post_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON public.forum_post_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.forum_post_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications" ON public.forum_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.forum_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view forum tags" ON public.forum_tags
    FOR SELECT USING (true);

CREATE POLICY "Users can view post views" ON public.forum_post_views
    FOR SELECT USING (true);

CREATE POLICY "Users can create post views" ON public.forum_post_views
    FOR INSERT WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION update_forum_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forums 
        SET post_count = post_count + 1 
        WHERE id = NEW.forum_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forums 
        SET post_count = post_count - 1 
        WHERE id = OLD.forum_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_forum_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forum_posts 
        SET 
            reply_count = reply_count + 1,
            last_activity_at = NEW.created_at
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forum_posts 
        SET reply_count = reply_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_forum_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'forum_post_likes' THEN
            UPDATE public.forum_posts 
            SET like_count = like_count + 1 
            WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'forum_reply_likes' THEN
            UPDATE public.forum_post_replies 
            SET like_count = like_count + 1 
            WHERE id = NEW.reply_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'forum_post_likes' THEN
            UPDATE public.forum_posts 
            SET like_count = like_count - 1 
            WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'forum_reply_likes' THEN
            UPDATE public.forum_post_replies 
            SET like_count = like_count - 1 
            WHERE id = OLD.reply_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
DECLARE
    tag_name TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        FOREACH tag_name IN ARRAY NEW.tags
        LOOP
            INSERT INTO public.forum_tags (name, usage_count)
            VALUES (tag_name, 1)
            ON CONFLICT (name) 
            DO UPDATE SET usage_count = forum_tags.usage_count + 1;
        END LOOP;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        FOREACH tag_name IN ARRAY OLD.tags
        LOOP
            UPDATE public.forum_tags 
            SET usage_count = usage_count - 1 
            WHERE name = tag_name;
        END LOOP;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle removed tags
        FOREACH tag_name IN ARRAY OLD.tags
        LOOP
            IF NOT (tag_name = ANY(NEW.tags)) THEN
                UPDATE public.forum_tags 
                SET usage_count = usage_count - 1 
                WHERE name = tag_name;
            END IF;
        END LOOP;
        
        -- Handle new tags
        FOREACH tag_name IN ARRAY NEW.tags
        LOOP
            IF NOT (tag_name = ANY(OLD.tags)) THEN
                INSERT INTO public.forum_tags (name, usage_count)
                VALUES (tag_name, 1)
                ON CONFLICT (name) 
                DO UPDATE SET usage_count = forum_tags.usage_count + 1;
            END IF;
        END LOOP;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_forum_post_count_trigger
    AFTER INSERT OR DELETE ON public.forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_forum_post_count();

CREATE TRIGGER update_forum_reply_count_trigger
    AFTER INSERT OR DELETE ON public.forum_post_replies
    FOR EACH ROW EXECUTE FUNCTION update_forum_reply_count();

CREATE TRIGGER update_forum_like_count_trigger
    AFTER INSERT OR DELETE ON public.forum_post_likes
    FOR EACH ROW EXECUTE FUNCTION update_forum_like_count();

CREATE TRIGGER update_forum_reply_like_count_trigger
    AFTER INSERT OR DELETE ON public.forum_reply_likes
    FOR EACH ROW EXECUTE FUNCTION update_forum_like_count();

CREATE TRIGGER update_tag_usage_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Sample data
INSERT INTO public.forum_categories (name, description, icon, color, sort_order) VALUES
('General Discussion', 'General topics and discussions', '💬', '#3B82F6', 1),
('Technical Help', 'Technical questions and support', '🔧', '#10B981', 2),
('Career Advice', 'Career guidance and mentorship', '💼', '#F59E0B', 3),
('Project Showcase', 'Share your projects and get feedback', '🚀', '#8B5CF6', 4),
('Announcements', 'Important updates and announcements', '📢', '#EF4444', 5);

INSERT INTO public.forums (name, description, category, icon, color, created_by) VALUES
('JavaScript Help', 'Get help with JavaScript programming', 'Technical Help', '🟨', '#F7DF1E', (SELECT id FROM auth.users LIMIT 1)),
('React Community', 'Discuss React and related technologies', 'Technical Help', '⚛️', '#61DAFB', (SELECT id FROM auth.users LIMIT 1)),
('Career Guidance', 'Career advice and mentorship discussions', 'Career Advice', '🎯', '#10B981', (SELECT id FROM auth.users LIMIT 1)),
('Project Showcase', 'Share and discuss your projects', 'Project Showcase', '🚀', '#8B5CF6', (SELECT id FROM auth.users LIMIT 1));

-- Success message
SELECT 'Discussion forums database setup completed successfully!' as message;