-- PHASE 4: FINAL DATABASE SETUP
-- Comprehensive setup with error handling for existing objects

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing Phase 4 tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.mentor_notifications CASCADE;
DROP TABLE IF EXISTS public.mentor_matching_preferences CASCADE;
DROP TABLE IF EXISTS public.mentor_reviews CASCADE;
DROP TABLE IF EXISTS public.mentor_verification_requests CASCADE;
DROP TABLE IF EXISTS public.mentor_sessions CASCADE;
DROP TABLE IF EXISTS public.mentor_availability CASCADE;
DROP TABLE IF EXISTS public.mentor_specializations CASCADE;
DROP TABLE IF EXISTS public.mentor_profiles CASCADE;

DROP TABLE IF EXISTS public.conversation_settings CASCADE;
DROP TABLE IF EXISTS public.message_notifications CASCADE;
DROP TABLE IF EXISTS public.typing_indicators CASCADE;
DROP TABLE IF EXISTS public.message_read_status CASCADE;
DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.message_attachments CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

DROP TABLE IF EXISTS public.forum_post_views CASCADE;
DROP TABLE IF EXISTS public.forum_tags CASCADE;
DROP TABLE IF EXISTS public.forum_notifications CASCADE;
DROP TABLE IF EXISTS public.forum_moderators CASCADE;
DROP TABLE IF EXISTS public.forum_post_bookmarks CASCADE;
DROP TABLE IF EXISTS public.forum_subscriptions CASCADE;
DROP TABLE IF EXISTS public.forum_reply_likes CASCADE;
DROP TABLE IF EXISTS public.forum_post_likes CASCADE;
DROP TABLE IF EXISTS public.forum_post_replies CASCADE;
DROP TABLE IF EXISTS public.forum_posts CASCADE;
DROP TABLE IF EXISTS public.forums CASCADE;
DROP TABLE IF EXISTS public.forum_categories CASCADE;

-- Create mentor profiles table
CREATE TABLE public.mentor_profiles (
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
CREATE TABLE public.mentor_specializations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    specialization_name TEXT NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5) DEFAULT 3,
    years_experience INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor availability table
CREATE TABLE public.mentor_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, day_of_week, start_time)
);

-- Create mentor sessions table
CREATE TABLE public.mentor_sessions (
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
CREATE TABLE public.mentor_verification_requests (
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
CREATE TABLE public.mentor_reviews (
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
CREATE TABLE public.mentor_matching_preferences (
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
CREATE TABLE public.mentor_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT CHECK (notification_type IN ('session_request', 'session_reminder', 'session_cancelled', 'review_received', 'verification_update', 'student_message')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_type TEXT CHECK (conversation_type IN ('direct', 'group', 'mentor_session')) DEFAULT 'direct',
    title TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation participants table
CREATE TABLE public.conversation_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'member', 'mentor', 'student')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'system', 'mentor_note')) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message attachments table
CREATE TABLE public.message_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message reactions table
CREATE TABLE public.message_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Create message read status table
CREATE TABLE public.message_read_status (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Create typing indicators table
CREATE TABLE public.typing_indicators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_typing BOOLEAN DEFAULT TRUE,
    last_typing_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create message notifications table
CREATE TABLE public.message_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT CHECK (notification_type IN ('new_message', 'mention', 'reaction', 'reply')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation settings table
CREATE TABLE public.conversation_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_muted BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    notification_settings JSONB DEFAULT '{"new_messages": true, "mentions": true, "reactions": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create forum categories table
CREATE TABLE public.forum_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#6B7280',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forums table
CREATE TABLE public.forums (
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

-- Create forum posts table
CREATE TABLE public.forum_posts (
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
CREATE TABLE public.forum_post_replies (
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
CREATE TABLE public.forum_post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create forum reply likes table
CREATE TABLE public.forum_reply_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reply_id UUID REFERENCES public.forum_post_replies(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reply_id, user_id)
);

-- Create forum subscriptions table
CREATE TABLE public.forum_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    forum_id UUID REFERENCES public.forums(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_type TEXT CHECK (subscription_type IN ('all', 'mentions', 'none')) DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(forum_id, user_id)
);

-- Create forum post bookmarks table
CREATE TABLE public.forum_post_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create forum moderators table
CREATE TABLE public.forum_moderators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    forum_id UUID REFERENCES public.forums(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'moderator')) DEFAULT 'moderator',
    permissions JSONB DEFAULT '{"can_edit_posts": true, "can_delete_posts": true, "can_lock_posts": true, "can_pin_posts": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(forum_id, user_id)
);

-- Create forum notifications table
CREATE TABLE public.forum_notifications (
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
CREATE TABLE public.forum_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum post views table
CREATE TABLE public.forum_post_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes (with IF NOT EXISTS to avoid conflicts)
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_verified ON public.mentor_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_available ON public.mentor_profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_rating ON public.mentor_profiles(rating);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_expertise ON public.mentor_profiles USING GIN(expertise_areas);

CREATE INDEX IF NOT EXISTS idx_mentor_specializations_mentor ON public.mentor_specializations(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_specializations_name ON public.mentor_specializations(specialization_name);

CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor ON public.mentor_availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_availability_day ON public.mentor_availability(day_of_week);

CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor ON public.mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_student ON public.mentor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_scheduled ON public.mentor_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_status ON public.mentor_sessions(status);

CREATE INDEX IF NOT EXISTS idx_mentor_verification_requests_mentor ON public.mentor_verification_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_verification_requests_status ON public.mentor_verification_requests(status);

CREATE INDEX IF NOT EXISTS idx_mentor_reviews_mentor ON public.mentor_reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_student ON public.mentor_reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_rating ON public.mentor_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_mentor_matching_preferences_mentor ON public.mentor_matching_preferences(mentor_id);

CREATE INDEX IF NOT EXISTS idx_mentor_notifications_mentor ON public.mentor_notifications(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_notifications_read ON public.mentor_notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_active ON public.conversation_participants(is_active);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to_id);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON public.message_attachments(message_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON public.message_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_message_read_status_message ON public.message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user ON public.message_read_status(user_id);

CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation ON public.typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user ON public.typing_indicators(user_id);

CREATE INDEX IF NOT EXISTS idx_message_notifications_user ON public.message_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_read ON public.message_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_message_notifications_created_at ON public.message_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_conversation_settings_conversation ON public.conversation_settings(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_settings_user ON public.conversation_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_forums_category ON public.forums(category);
CREATE INDEX IF NOT EXISTS idx_forums_public ON public.forums(is_public);
CREATE INDEX IF NOT EXISTS idx_forums_active ON public.forums(is_active);
CREATE INDEX IF NOT EXISTS idx_forums_created_by ON public.forums(created_by);

CREATE INDEX IF NOT EXISTS idx_forum_categories_sort_order ON public.forum_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_forum_categories_active ON public.forum_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_forum_posts_forum ON public.forum_posts(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_type ON public.forum_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON public.forum_posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_last_activity ON public.forum_posts(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_tags ON public.forum_posts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_forum_post_replies_post ON public.forum_post_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_replies_author ON public.forum_post_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_replies_parent ON public.forum_post_replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_replies_solution ON public.forum_post_replies(is_solution);
CREATE INDEX IF NOT EXISTS idx_forum_post_replies_created_at ON public.forum_post_replies(created_at);

CREATE INDEX IF NOT EXISTS idx_forum_post_likes_post ON public.forum_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_user ON public.forum_post_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_reply ON public.forum_reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_user ON public.forum_reply_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_subscriptions_forum ON public.forum_subscriptions(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_subscriptions_user ON public.forum_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_post_bookmarks_post ON public.forum_post_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_bookmarks_user ON public.forum_post_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_moderators_forum ON public.forum_moderators(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_moderators_user ON public.forum_moderators(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_notifications_user ON public.forum_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_read ON public.forum_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_created_at ON public.forum_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_forum_tags_name ON public.forum_tags(name);
CREATE INDEX IF NOT EXISTS idx_forum_tags_usage ON public.forum_tags(usage_count);

CREATE INDEX IF NOT EXISTS idx_forum_post_views_post ON public.forum_post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_views_user ON public.forum_post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_views_viewed_at ON public.forum_post_views(viewed_at);

-- Enable RLS on all tables
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_matching_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_settings ENABLE ROW LEVEL SECURITY;

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

-- Success message
SELECT 'Phase 4 database setup completed successfully!' as message;
