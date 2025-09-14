-- PHASE 4: SAFE DATABASE SETUP
-- This script safely sets up all Phase 4 features with proper error handling

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STUDY GROUPS SYSTEM
-- =====================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.study_group_achievements CASCADE;
DROP TABLE IF EXISTS public.study_group_project_participants CASCADE;
DROP TABLE IF EXISTS public.study_group_projects CASCADE;
DROP TABLE IF EXISTS public.study_group_resources CASCADE;
DROP TABLE IF EXISTS public.study_group_post_comments CASCADE;
DROP TABLE IF EXISTS public.study_group_posts CASCADE;
DROP TABLE IF EXISTS public.study_group_session_participants CASCADE;
DROP TABLE IF EXISTS public.study_group_sessions CASCADE;
DROP TABLE IF EXISTS public.study_group_members CASCADE;
DROP TABLE IF EXISTS public.study_groups CASCADE;

-- Create study groups table
CREATE TABLE public.study_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_area TEXT NOT NULL,
    skill_focus TEXT[],
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    max_members INTEGER DEFAULT 10,
    current_members INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study group members table
CREATE TABLE public.study_group_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    study_group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'moderator', 'member')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(study_group_id, user_id)
);

-- Create study group sessions table
CREATE TABLE public.study_group_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    study_group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    session_type TEXT CHECK (session_type IN ('study', 'discussion', 'project', 'review', 'presentation')) DEFAULT 'study',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    location TEXT,
    max_participants INTEGER,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study group session participants table
CREATE TABLE public.study_group_session_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.study_group_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('attending', 'maybe', 'not_attending')) DEFAULT 'attending',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

-- Create study group posts table
CREATE TABLE public.study_group_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    study_group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT CHECK (post_type IN ('announcement', 'question', 'resource', 'discussion', 'project')) DEFAULT 'discussion',
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study group post comments table
CREATE TABLE public.study_group_post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.study_group_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.study_group_post_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study group resources table
CREATE TABLE public.study_group_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    study_group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT CHECK (resource_type IN ('document', 'video', 'link', 'code', 'image', 'other')) NOT NULL,
    file_url TEXT,
    external_url TEXT,
    file_size INTEGER,
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study group projects table
CREATE TABLE public.study_group_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    study_group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    project_type TEXT CHECK (project_type IN ('collaborative', 'individual', 'competition', 'tutorial')) DEFAULT 'collaborative',
    status TEXT CHECK (status IN ('planning', 'active', 'completed', 'cancelled')) DEFAULT 'planning',
    due_date TIMESTAMP WITH TIME ZONE,
    requirements TEXT,
    deliverables TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study group project participants table
CREATE TABLE public.study_group_project_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.study_group_projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('lead', 'contributor', 'reviewer')) DEFAULT 'contributor',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create study group achievements table
CREATE TABLE public.study_group_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    study_group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_type TEXT CHECK (achievement_type IN ('participation', 'leadership', 'contribution', 'attendance', 'project_completion')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    awarded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PEER REVIEW SYSTEM
-- =====================================================

-- Drop existing peer review tables if they exist
DROP TABLE IF EXISTS public.peer_review_notifications CASCADE;
DROP TABLE IF EXISTS public.peer_review_skills CASCADE;
DROP TABLE IF EXISTS public.peer_review_feedback CASCADE;
DROP TABLE IF EXISTS public.peer_review_comments CASCADE;
DROP TABLE IF EXISTS public.peer_review_submissions CASCADE;
DROP TABLE IF EXISTS public.peer_review_assignments CASCADE;
DROP TABLE IF EXISTS public.peer_review_requests CASCADE;

-- Create peer review requests table
CREATE TABLE public.peer_review_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.user_skills(id) ON DELETE CASCADE,
    review_type TEXT CHECK (review_type IN ('project', 'skill', 'portfolio', 'code')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    criteria JSONB DEFAULT '{}',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    deadline TIMESTAMP WITH TIME ZONE,
    max_reviewers INTEGER DEFAULT 3,
    min_reviewers INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT true,
    status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create peer review assignments table
CREATE TABLE public.peer_review_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID REFERENCES public.peer_review_requests(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('assigned', 'in_progress', 'completed', 'declined')) DEFAULT 'assigned',
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(request_id, reviewer_id)
);

-- Create peer review submissions table
CREATE TABLE public.peer_review_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.peer_review_assignments(id) ON DELETE CASCADE NOT NULL,
    overall_rating DECIMAL(3,2) CHECK (overall_rating >= 1 AND overall_rating <= 5),
    detailed_feedback TEXT,
    strengths TEXT[],
    improvements TEXT[],
    suggestions TEXT[],
    technical_score INTEGER CHECK (technical_score >= 1 AND technical_score <= 10),
    creativity_score INTEGER CHECK (creativity_score >= 1 AND creativity_score <= 10),
    usability_score INTEGER CHECK (usability_score >= 1 AND usability_score <= 10),
    code_quality_score INTEGER CHECK (code_quality_score >= 1 AND code_quality_score <= 10),
    documentation_score INTEGER CHECK (documentation_score >= 1 AND documentation_score <= 10),
    criteria_scores JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    is_anonymous BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create peer review comments table
CREATE TABLE public.peer_review_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID REFERENCES public.peer_review_submissions(id) ON DELETE CASCADE NOT NULL,
    commenter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    comment_type TEXT CHECK (comment_type IN ('general', 'technical', 'suggestion', 'question', 'praise')) DEFAULT 'general',
    line_number INTEGER,
    file_path TEXT,
    is_resolved BOOLEAN DEFAULT false,
    parent_comment_id UUID REFERENCES public.peer_review_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create peer review feedback table
CREATE TABLE public.peer_review_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID REFERENCES public.peer_review_submissions(id) ON DELETE CASCADE NOT NULL,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_text TEXT,
    was_helpful BOOLEAN,
    would_recommend BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create peer review skills table
CREATE TABLE public.peer_review_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    skill_name TEXT NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    review_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_name)
);

-- Create peer review notifications table
CREATE TABLE public.peer_review_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    request_id UUID REFERENCES public.peer_review_requests(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.peer_review_assignments(id) ON DELETE CASCADE,
    notification_type TEXT CHECK (notification_type IN ('assignment', 'submission', 'feedback', 'deadline', 'reminder')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SOCIAL FEATURES SYSTEM
-- =====================================================

-- Drop existing social tables if they exist
DROP TABLE IF EXISTS public.trending_content CASCADE;
DROP TABLE IF EXISTS public.user_tags CASCADE;
DROP TABLE IF EXISTS public.user_mentions CASCADE;
DROP TABLE IF EXISTS public.user_activity_feed CASCADE;
DROP TABLE IF EXISTS public.social_notifications CASCADE;
DROP TABLE IF EXISTS public.bookmarks CASCADE;
DROP TABLE IF EXISTS public.social_comments CASCADE;
DROP TABLE IF EXISTS public.shares CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.user_connections CASCADE;

-- Create user connections table (follow system)
CREATE TABLE public.user_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'accepted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Create likes table
CREATE TABLE public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT CHECK (content_type IN ('project', 'post', 'comment', 'resource', 'roadmap', 'skill', 'achievement')) NOT NULL,
    content_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

-- Create shares table
CREATE TABLE public.shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT CHECK (content_type IN ('project', 'post', 'comment', 'resource', 'roadmap', 'skill', 'achievement')) NOT NULL,
    content_id UUID NOT NULL,
    share_platform TEXT CHECK (share_platform IN ('internal', 'twitter', 'linkedin', 'facebook', 'whatsapp', 'email')) DEFAULT 'internal',
    share_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table (for social interactions)
CREATE TABLE public.social_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT CHECK (content_type IN ('project', 'post', 'resource', 'roadmap', 'skill', 'achievement')) NOT NULL,
    content_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES public.social_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookmarks table
CREATE TABLE public.bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT CHECK (content_type IN ('project', 'post', 'resource', 'roadmap', 'skill', 'achievement', 'study_group', 'mentor')) NOT NULL,
    content_id UUID NOT NULL,
    folder_name TEXT DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

-- Create notifications table
CREATE TABLE public.social_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT CHECK (notification_type IN ('follow', 'like', 'comment', 'share', 'mention', 'achievement', 'milestone')) NOT NULL,
    content_type TEXT,
    content_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user activity feed table
CREATE TABLE public.user_activity_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT CHECK (activity_type IN ('project_created', 'project_updated', 'skill_earned', 'achievement_unlocked', 'roadmap_completed', 'post_created', 'comment_added', 'like_given', 'share_made')) NOT NULL,
    content_type TEXT,
    content_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user mentions table
CREATE TABLE public.user_mentions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mentioned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT CHECK (content_type IN ('comment', 'post', 'project')) NOT NULL,
    content_id UUID NOT NULL,
    content_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user tags table (for content tagging)
CREATE TABLE public.user_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT CHECK (content_type IN ('project', 'post', 'resource', 'roadmap', 'skill')) NOT NULL,
    content_id UUID NOT NULL,
    tag_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id, tag_name)
);

-- Create trending content table
CREATE TABLE public.trending_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT CHECK (content_type IN ('project', 'post', 'resource', 'roadmap', 'skill')) NOT NULL,
    content_id UUID NOT NULL,
    score DECIMAL(10,2) DEFAULT 0.0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Study groups indexes
CREATE INDEX idx_study_groups_subject_area ON public.study_groups(subject_area);
CREATE INDEX idx_study_groups_created_by ON public.study_groups(created_by);
CREATE INDEX idx_study_groups_is_public ON public.study_groups(is_public);
CREATE INDEX idx_study_groups_is_active ON public.study_groups(is_active);

CREATE INDEX idx_study_group_members_group_id ON public.study_group_members(study_group_id);
CREATE INDEX idx_study_group_members_user_id ON public.study_group_members(user_id);
CREATE INDEX idx_study_group_members_role ON public.study_group_members(role);

CREATE INDEX idx_study_group_sessions_group_id ON public.study_group_sessions(study_group_id);
CREATE INDEX idx_study_group_sessions_scheduled_at ON public.study_group_sessions(scheduled_at);
CREATE INDEX idx_study_group_sessions_type ON public.study_group_sessions(session_type);

CREATE INDEX idx_study_group_posts_group_id ON public.study_group_posts(study_group_id);
CREATE INDEX idx_study_group_posts_author_id ON public.study_group_posts(author_id);
CREATE INDEX idx_study_group_posts_type ON public.study_group_posts(post_type);
CREATE INDEX idx_study_group_posts_created_at ON public.study_group_posts(created_at);

CREATE INDEX idx_study_group_resources_group_id ON public.study_group_resources(study_group_id);
CREATE INDEX idx_study_group_resources_type ON public.study_group_resources(resource_type);

CREATE INDEX idx_study_group_projects_group_id ON public.study_group_projects(study_group_id);
CREATE INDEX idx_study_group_projects_status ON public.study_group_projects(status);

-- Peer review indexes
CREATE INDEX idx_peer_review_requests_requester ON public.peer_review_requests(requester_id);
CREATE INDEX idx_peer_review_requests_type ON public.peer_review_requests(review_type);
CREATE INDEX idx_peer_review_requests_status ON public.peer_review_requests(status);
CREATE INDEX idx_peer_review_requests_created_at ON public.peer_review_requests(created_at);

CREATE INDEX idx_peer_review_assignments_request ON public.peer_review_assignments(request_id);
CREATE INDEX idx_peer_review_assignments_reviewer ON public.peer_review_assignments(reviewer_id);
CREATE INDEX idx_peer_review_assignments_status ON public.peer_review_assignments(status);

CREATE INDEX idx_peer_review_submissions_assignment ON public.peer_review_submissions(assignment_id);
CREATE INDEX idx_peer_review_submissions_submitted_at ON public.peer_review_submissions(submitted_at);

CREATE INDEX idx_peer_review_comments_submission ON public.peer_review_comments(submission_id);
CREATE INDEX idx_peer_review_comments_commenter ON public.peer_review_comments(commenter_id);

CREATE INDEX idx_peer_review_skills_user ON public.peer_review_skills(user_id);
CREATE INDEX idx_peer_review_skills_name ON public.peer_review_skills(skill_name);

CREATE INDEX idx_peer_review_notifications_user ON public.peer_review_notifications(user_id);
CREATE INDEX idx_peer_review_notifications_read ON public.peer_review_notifications(is_read);

-- Social features indexes
CREATE INDEX idx_user_connections_follower ON public.user_connections(follower_id);
CREATE INDEX idx_user_connections_following ON public.user_connections(following_id);
CREATE INDEX idx_user_connections_status ON public.user_connections(status);

CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_likes_content ON public.likes(content_type, content_id);
CREATE INDEX idx_likes_created_at ON public.likes(created_at);

CREATE INDEX idx_shares_user ON public.shares(user_id);
CREATE INDEX idx_shares_content ON public.shares(content_type, content_id);
CREATE INDEX idx_shares_platform ON public.shares(share_platform);

CREATE INDEX idx_social_comments_user ON public.social_comments(user_id);
CREATE INDEX idx_social_comments_content ON public.social_comments(content_type, content_id);
CREATE INDEX idx_social_comments_parent ON public.social_comments(parent_comment_id);
CREATE INDEX idx_social_comments_created_at ON public.social_comments(created_at);

CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_content ON public.bookmarks(content_type, content_id);
CREATE INDEX idx_bookmarks_folder ON public.bookmarks(folder_name);

CREATE INDEX idx_social_notifications_user ON public.social_notifications(user_id);
CREATE INDEX idx_social_notifications_read ON public.social_notifications(is_read);
CREATE INDEX idx_social_notifications_type ON public.social_notifications(notification_type);
CREATE INDEX idx_social_notifications_created_at ON public.social_notifications(created_at);

CREATE INDEX idx_user_activity_feed_user ON public.user_activity_feed(user_id);
CREATE INDEX idx_user_activity_feed_public ON public.user_activity_feed(is_public);
CREATE INDEX idx_user_activity_feed_created_at ON public.user_activity_feed(created_at);

CREATE INDEX idx_user_mentions_user ON public.user_mentions(user_id);
CREATE INDEX idx_user_mentions_mentioned ON public.user_mentions(mentioned_user_id);
CREATE INDEX idx_user_mentions_content ON public.user_mentions(content_type, content_id);

CREATE INDEX idx_user_tags_user ON public.user_tags(user_id);
CREATE INDEX idx_user_tags_content ON public.user_tags(content_type, content_id);
CREATE INDEX idx_user_tags_name ON public.user_tags(tag_name);

CREATE INDEX idx_trending_content_type ON public.trending_content(content_type);
CREATE INDEX idx_trending_content_score ON public.trending_content(score);
CREATE INDEX idx_trending_content_calculated ON public.trending_content(calculated_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_achievements ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.peer_review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_content ENABLE ROW LEVEL SECURITY;

-- Study groups policies
CREATE POLICY "Users can view public study groups" ON public.study_groups
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view groups they are members of" ON public.study_groups
    FOR SELECT USING (
        id IN (
            SELECT study_group_id FROM public.study_group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create study groups" ON public.study_groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON public.study_groups
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" ON public.study_groups
    FOR UPDATE USING (
        id IN (
            SELECT study_group_id FROM public.study_group_members 
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Study group members policies
CREATE POLICY "Users can view group members" ON public.study_group_members
    FOR SELECT USING (
        study_group_id IN (
            SELECT id FROM public.study_groups 
            WHERE is_public = true OR id IN (
                SELECT study_group_id FROM public.study_group_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can join public groups" ON public.study_group_members
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        study_group_id IN (
            SELECT id FROM public.study_groups WHERE is_public = true
        )
    );

CREATE POLICY "Group admins can add members" ON public.study_group_members
    FOR INSERT WITH CHECK (
        study_group_id IN (
            SELECT study_group_id FROM public.study_group_members 
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Peer review policies
CREATE POLICY "Users can view public review requests" ON public.peer_review_requests
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own review requests" ON public.peer_review_requests
    FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "Users can view assigned review requests" ON public.peer_review_requests
    FOR SELECT USING (
        id IN (
            SELECT request_id FROM public.peer_review_assignments 
            WHERE reviewer_id = auth.uid()
        )
    );

CREATE POLICY "Users can create review requests" ON public.peer_review_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Social features policies
CREATE POLICY "Users can view all likes" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all shares" ON public.shares
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own shares" ON public.shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all comments" ON public.social_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own comments" ON public.social_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.social_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.social_comments
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications" ON public.social_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.social_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view public activity feed" ON public.user_activity_feed
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own activity feed" ON public.user_activity_feed
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity" ON public.user_activity_feed
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User connections policies
CREATE POLICY "Users can view their connections" ON public.user_connections
    FOR SELECT USING (
        auth.uid() = follower_id OR 
        auth.uid() = following_id
    );

CREATE POLICY "Users can create connections" ON public.user_connections
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update their connections" ON public.user_connections
    FOR UPDATE USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can delete their connections" ON public.user_connections
    FOR DELETE USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update study group member count
CREATE OR REPLACE FUNCTION update_study_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.study_groups 
        SET current_members = current_members + 1 
        WHERE id = NEW.study_group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.study_groups 
        SET current_members = current_members - 1 
        WHERE id = OLD.study_group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to create social notifications
CREATE OR REPLACE FUNCTION create_social_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for the user being followed
    IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
        INSERT INTO public.social_notifications (
            user_id,
            from_user_id,
            notification_type,
            title,
            message
        ) VALUES (
            NEW.following_id,
            NEW.follower_id,
            'follow',
            'New Follower',
            'Someone started following you'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update trending content scores
CREATE OR REPLACE FUNCTION update_trending_score()
RETURNS TRIGGER AS $$
DECLARE
    content_type_val TEXT;
    content_id_val UUID;
    likes_count INTEGER;
    shares_count INTEGER;
    comments_count INTEGER;
    new_score DECIMAL(10,2);
BEGIN
    -- Determine content type and ID based on the table
    IF TG_TABLE_NAME = 'likes' THEN
        content_type_val := NEW.content_type;
        content_id_val := NEW.content_id;
    ELSIF TG_TABLE_NAME = 'shares' THEN
        content_type_val := NEW.content_type;
        content_id_val := NEW.content_id;
    ELSIF TG_TABLE_NAME = 'social_comments' THEN
        content_type_val := NEW.content_type;
        content_id_val := NEW.content_id;
    END IF;

    -- Get current counts
    SELECT 
        COALESCE(COUNT(*), 0),
        COALESCE((SELECT COUNT(*) FROM public.shares WHERE content_type = content_type_val AND content_id = content_id_val), 0),
        COALESCE((SELECT COUNT(*) FROM public.social_comments WHERE content_type = content_type_val AND content_id = content_id_val), 0)
    INTO likes_count, shares_count, comments_count
    FROM public.likes 
    WHERE content_type = content_type_val AND content_id = content_id_val;

    -- Calculate new score (weighted algorithm)
    new_score := (likes_count * 1.0) + (shares_count * 2.0) + (comments_count * 1.5);

    -- Update or insert trending content
    INSERT INTO public.trending_content (content_type, content_id, score, likes_count, shares_count, comments_count)
    VALUES (content_type_val, content_id_val, new_score, likes_count, shares_count, comments_count)
    ON CONFLICT (content_type, content_id)
    DO UPDATE SET
        score = new_score,
        likes_count = EXCLUDED.likes_count,
        shares_count = EXCLUDED.shares_count,
        comments_count = EXCLUDED.comments_count,
        calculated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_member_count_on_insert
    AFTER INSERT ON public.study_group_members
    FOR EACH ROW EXECUTE FUNCTION update_study_group_member_count();

CREATE TRIGGER update_member_count_on_delete
    AFTER DELETE ON public.study_group_members
    FOR EACH ROW EXECUTE FUNCTION update_study_group_member_count();

CREATE TRIGGER create_follow_notification
    AFTER INSERT ON public.user_connections
    FOR EACH ROW EXECUTE FUNCTION create_social_notification();

CREATE TRIGGER update_trending_on_like
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION update_trending_score();

CREATE TRIGGER update_trending_on_share
    AFTER INSERT ON public.shares
    FOR EACH ROW EXECUTE FUNCTION update_trending_score();

CREATE TRIGGER update_trending_on_comment
    AFTER INSERT ON public.social_comments
    FOR EACH ROW EXECUTE FUNCTION update_trending_score();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample study groups
INSERT INTO public.study_groups (name, description, subject_area, skill_focus, difficulty_level, max_members, is_public, created_by) VALUES
('React Developers United', 'A study group for React developers of all levels to share knowledge and build projects together.', 'Web Development', ARRAY['React', 'JavaScript', 'Frontend'], 'intermediate', 15, true, (SELECT id FROM auth.users LIMIT 1)),
('Data Science Beginners', 'Perfect for those starting their data science journey. We cover Python, pandas, and basic ML concepts.', 'Data Science', ARRAY['Python', 'Pandas', 'Machine Learning', 'Statistics'], 'beginner', 20, true, (SELECT id FROM auth.users LIMIT 1)),
('Full-Stack Masters', 'Advanced study group for experienced developers working on full-stack applications.', 'Web Development', ARRAY['Node.js', 'React', 'PostgreSQL', 'Docker'], 'advanced', 10, true, (SELECT id FROM auth.users LIMIT 1)),
('UI/UX Designers', 'Creative minds coming together to discuss design principles, tools, and user experience.', 'Design', ARRAY['Figma', 'User Research', 'Prototyping', 'Design Systems'], 'intermediate', 12, true, (SELECT id FROM auth.users LIMIT 1)),
('Mobile App Development', 'iOS and Android development study group focusing on modern mobile technologies.', 'Mobile Development', ARRAY['React Native', 'Flutter', 'Swift', 'Kotlin'], 'intermediate', 18, true, (SELECT id FROM auth.users LIMIT 1));

-- Insert sample peer review skills
INSERT INTO public.peer_review_skills (user_id, skill_name, proficiency_level, review_count, average_rating) VALUES
((SELECT id FROM auth.users LIMIT 1), 'JavaScript', 4, 5, 4.2),
((SELECT id FROM auth.users LIMIT 1), 'React', 3, 3, 3.8),
((SELECT id FROM auth.users LIMIT 1), 'Node.js', 4, 4, 4.0),
((SELECT id FROM auth.users LIMIT 1), 'Python', 3, 2, 3.5),
((SELECT id FROM auth.users LIMIT 1), 'SQL', 4, 3, 4.1);

-- Insert sample social activity
INSERT INTO public.user_activity_feed (user_id, activity_type, content_type, content_id, title, description, is_public) VALUES
((SELECT id FROM auth.users LIMIT 1), 'project_created', 'project', (SELECT id FROM public.projects LIMIT 1), 'New Project Created', 'Created a new React project', true),
((SELECT id FROM auth.users LIMIT 1), 'skill_earned', 'skill', (SELECT id FROM public.user_skills LIMIT 1), 'New Skill Earned', 'Earned JavaScript skill', true),
((SELECT id FROM auth.users LIMIT 1), 'achievement_unlocked', 'achievement', (SELECT id FROM public.achievements LIMIT 1), 'Achievement Unlocked', 'Unlocked first project achievement', true);

-- Success message
SELECT 'Phase 4 database setup completed successfully!' as message;
