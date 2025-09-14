-- =====================================================
-- PHASE 4: DISCUSSION FORUMS - MINIMAL VERSION
-- =====================================================

-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS public.forum_views CASCADE;
DROP TABLE IF EXISTS public.forum_reports CASCADE;
DROP TABLE IF EXISTS public.forum_moderators CASCADE;
DROP TABLE IF EXISTS public.forum_subscriptions CASCADE;
DROP TABLE IF EXISTS public.forum_votes CASCADE;
DROP TABLE IF EXISTS public.forum_replies CASCADE;
DROP TABLE IF EXISTS public.forum_topics CASCADE;
DROP TABLE IF EXISTS public.forum_tags CASCADE;
DROP TABLE IF EXISTS public.forums CASCADE;

-- Create forums table
CREATE TABLE public.forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_topics table
CREATE TABLE public.forum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL,
    author_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    topic_type VARCHAR(20) DEFAULT 'discussion',
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP WITH TIME ZONE,
    last_reply_by UUID,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_replies table
CREATE TABLE public.forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL,
    author_id UUID NOT NULL,
    content TEXT NOT NULL,
    reply_to_id UUID,
    is_solution BOOLEAN DEFAULT false,
    is_helpful BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_votes table
CREATE TABLE public.forum_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    topic_id UUID,
    reply_id UUID,
    vote_type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_subscriptions table
CREATE TABLE public.forum_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    forum_id UUID,
    topic_id UUID,
    subscription_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_moderators table
CREATE TABLE public.forum_moderators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) DEFAULT 'moderator',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_reports table
CREATE TABLE public.forum_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL,
    reported_user_id UUID,
    topic_id UUID,
    reply_id UUID,
    report_type VARCHAR(50) NOT NULL,
    report_reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID
);

-- Create forum_tags table
CREATE TABLE public.forum_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_views table
CREATE TABLE public.forum_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    topic_id UUID NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create basic indexes
CREATE INDEX idx_forums_category ON public.forums(category);
CREATE INDEX idx_forums_is_active ON public.forums(is_active);

CREATE INDEX idx_forum_topics_forum_id ON public.forum_topics(forum_id);
CREATE INDEX idx_forum_topics_author_id ON public.forum_topics(author_id);
CREATE INDEX idx_forum_topics_created_at ON public.forum_topics(created_at);

CREATE INDEX idx_forum_replies_topic_id ON public.forum_replies(topic_id);
CREATE INDEX idx_forum_replies_author_id ON public.forum_replies(author_id);
CREATE INDEX idx_forum_replies_created_at ON public.forum_replies(created_at);

CREATE INDEX idx_forum_votes_user_id ON public.forum_votes(user_id);
CREATE INDEX idx_forum_votes_topic_id ON public.forum_votes(topic_id);
CREATE INDEX idx_forum_votes_reply_id ON public.forum_votes(reply_id);

CREATE INDEX idx_forum_subscriptions_user_id ON public.forum_subscriptions(user_id);
CREATE INDEX idx_forum_subscriptions_forum_id ON public.forum_subscriptions(forum_id);
CREATE INDEX idx_forum_subscriptions_topic_id ON public.forum_subscriptions(topic_id);

CREATE INDEX idx_forum_moderators_forum_id ON public.forum_moderators(forum_id);
CREATE INDEX idx_forum_moderators_user_id ON public.forum_moderators(user_id);

CREATE INDEX idx_forum_reports_reporter_id ON public.forum_reports(reporter_id);
CREATE INDEX idx_forum_reports_status ON public.forum_reports(status);

CREATE INDEX idx_forum_tags_name ON public.forum_tags(name);

CREATE INDEX idx_forum_views_user_id ON public.forum_views(user_id);
CREATE INDEX idx_forum_views_topic_id ON public.forum_views(topic_id);

-- Enable RLS
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_views ENABLE ROW LEVEL SECURITY;
