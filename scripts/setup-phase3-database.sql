-- Phase 3 Database Setup: Learning & Project System
-- This script creates all necessary tables for Adaptive Capsules, Project Playground, and Living Resume

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- LEARNING CONTENT SYSTEM
-- ==============================================

-- Learning Content Table
CREATE TABLE IF NOT EXISTS public.learning_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    duration INTEGER NOT NULL, -- in minutes
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    type TEXT NOT NULL CHECK (type IN ('video', 'article', 'interactive', 'quiz', 'project')),
    source TEXT NOT NULL,
    source_url TEXT,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    learning_objectives TEXT[] DEFAULT '{}',
    content_data JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_id UUID REFERENCES public.learning_content(id) ON DELETE CASCADE NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent INTEGER DEFAULT 0, -- in minutes
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    UNIQUE(user_id, content_id)
);

-- Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('learning', 'achievement', 'milestone', 'special')),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    requirements JSONB NOT NULL DEFAULT '{}',
    xp_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0, -- for progress-based badges
    UNIQUE(user_id, badge_id)
);

-- Offline Content Table
CREATE TABLE IF NOT EXISTS public.offline_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_id UUID REFERENCES public.learning_content(id) ON DELETE CASCADE NOT NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size INTEGER DEFAULT 0,
    file_path TEXT NOT NULL,
    is_synced BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- ==============================================
-- PROJECT SYSTEM
-- ==============================================

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('web', 'mobile', 'desktop', 'data', 'design', 'other')),
    status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold')),
    technologies TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    repository_url TEXT,
    live_url TEXT,
    thumbnail_url TEXT,
    features TEXT[] DEFAULT '{}',
    challenges TEXT[] DEFAULT '{}',
    learnings TEXT[] DEFAULT '{}',
    resources TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    tags TEXT[] DEFAULT '{}'
);

-- Project Team Members Table
CREATE TABLE IF NOT EXISTS public.project_team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(project_id, user_id)
);

-- Project Templates Table
CREATE TABLE IF NOT EXISTS public.project_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    technologies TEXT[] DEFAULT '{}',
    estimated_duration TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    features TEXT[] DEFAULT '{}',
    resources TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Reviews Table
CREATE TABLE IF NOT EXISTS public.project_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- LIVING RESUME SYSTEM
-- ==============================================

-- Resume Sections Table
CREATE TABLE IF NOT EXISTS public.resume_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('personal', 'experience', 'education', 'skills', 'projects', 'achievements', 'certifications')),
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    is_visible BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, type)
);

-- Resume Analytics Table
CREATE TABLE IF NOT EXISTS public.resume_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    view_count INTEGER DEFAULT 0,
    last_viewed TIMESTAMP WITH TIME ZONE,
    view_source TEXT, -- 'direct', 'linkedin', 'github', etc.
    viewer_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume Templates Table
CREATE TABLE IF NOT EXISTS public.resume_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    template_data JSONB NOT NULL DEFAULT '{}',
    preview_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Learning Content RLS
ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published learning content" ON public.learning_content
    FOR SELECT USING (is_published = true);
CREATE POLICY "Users can view their own content" ON public.learning_content
    FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Content creators can manage their content" ON public.learning_content
    FOR ALL USING (auth.uid() = created_by);

-- User Progress RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- Badges RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active badges" ON public.badges
    FOR SELECT USING (is_active = true);

-- User Badges RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can award badges" ON public.user_badges
    FOR INSERT WITH CHECK (true);

-- Offline Content RLS
ALTER TABLE public.offline_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own offline content" ON public.offline_content
    FOR ALL USING (auth.uid() = user_id);

-- Projects RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public projects" ON public.projects
    FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Project creators can manage their projects" ON public.projects
    FOR ALL USING (auth.uid() = created_by);

-- Project Team Members RLS
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view project teams" ON public.project_team_members
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT created_by FROM public.projects WHERE id = project_id)
    );
CREATE POLICY "Project creators can manage team members" ON public.project_team_members
    FOR ALL USING (auth.uid() IN (SELECT created_by FROM public.projects WHERE id = project_id));

-- Project Templates RLS
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active templates" ON public.project_templates
    FOR SELECT USING (is_active = true);

-- Project Reviews RLS
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public reviews" ON public.project_reviews
    FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage their own reviews" ON public.project_reviews
    FOR ALL USING (auth.uid() = reviewer_id);

-- Resume Sections RLS
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own resume sections" ON public.resume_sections
    FOR ALL USING (auth.uid() = user_id);

-- Resume Analytics RLS
ALTER TABLE public.resume_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own analytics" ON public.resume_analytics
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can track resume views" ON public.resume_analytics
    FOR INSERT WITH CHECK (true);

-- Resume Templates RLS
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active templates" ON public.resume_templates
    FOR SELECT USING (is_active = true);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Learning Content Indexes
CREATE INDEX IF NOT EXISTS idx_learning_content_category ON public.learning_content(category);
CREATE INDEX IF NOT EXISTS idx_learning_content_difficulty ON public.learning_content(difficulty);
CREATE INDEX IF NOT EXISTS idx_learning_content_type ON public.learning_content(type);
CREATE INDEX IF NOT EXISTS idx_learning_content_published ON public.learning_content(is_published);
CREATE INDEX IF NOT EXISTS idx_learning_content_created_at ON public.learning_content(created_at DESC);

-- User Progress Indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_content_id ON public.user_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON public.user_progress(is_completed);

-- Projects Indexes
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_public ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Project Team Members Indexes
CREATE INDEX IF NOT EXISTS idx_project_team_members_project_id ON public.project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user_id ON public.project_team_members(user_id);

-- Resume Sections Indexes
CREATE INDEX IF NOT EXISTS idx_resume_sections_user_id ON public.resume_sections(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_sections_type ON public.resume_sections(type);
CREATE INDEX IF NOT EXISTS idx_resume_sections_order ON public.resume_sections(order_index);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_learning_content_updated_at
    BEFORE UPDATE ON public.learning_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- SAMPLE DATA
-- ==============================================

-- Insert sample badges
INSERT INTO public.badges (name, description, category, rarity, xp_reward, requirements) VALUES
('First Steps', 'Complete your first learning capsule', 'learning', 'common', 50, '{"type": "completion", "count": 1}'),
('Knowledge Seeker', 'Complete 10 learning capsules', 'learning', 'rare', 200, '{"type": "completion", "count": 10}'),
('Project Builder', 'Create your first project', 'achievement', 'common', 100, '{"type": "project_creation", "count": 1}'),
('Team Player', 'Join a collaborative project', 'achievement', 'common', 75, '{"type": "collaboration", "count": 1}'),
('Resume Master', 'Complete your living resume', 'milestone', 'rare', 150, '{"type": "resume_completion", "sections": 5}'),
('Learning Legend', 'Complete 50 learning capsules', 'learning', 'epic', 500, '{"type": "completion", "count": 50}'),
('Project Pro', 'Complete 5 projects', 'achievement', 'rare', 300, '{"type": "project_completion", "count": 5}'),
('Resume Rockstar', 'Get 100 resume views', 'milestone', 'epic', 400, '{"type": "resume_views", "count": 100}');

-- Insert sample project templates
INSERT INTO public.project_templates (name, description, category, technologies, estimated_duration, difficulty, features, resources) VALUES
('Todo App', 'A simple todo application with CRUD operations', 'web', '{"React", "Node.js", "MongoDB"}', '2-3 weeks', 'beginner', '{"Add/Edit/Delete todos", "Mark as complete", "Filter todos"}', '{"React tutorial", "MongoDB setup guide"}'),
('Weather Dashboard', 'A weather dashboard with real-time data', 'web', '{"Vue.js", "API Integration", "Chart.js"}', '1-2 weeks', 'beginner', '{"Current weather", "Forecast", "Location search", "Charts"}', '{"OpenWeather API", "Vue.js docs", "Chart.js tutorial"}'),
('Data Visualization Tool', 'A tool for creating interactive data visualizations', 'data', '{"Python", "D3.js", "Flask"}', '4-6 weeks', 'advanced', '{"Data import", "Chart creation", "Interactive dashboards"}', '{"D3.js documentation", "Python pandas", "Flask tutorial"}'),
('Mobile Fitness App', 'A React Native app for tracking workouts', 'mobile', '{"React Native", "Firebase", "Redux"}', '3-4 weeks', 'intermediate', '{"Workout tracking", "Progress charts", "Social features"}', '{"React Native docs", "Firebase tutorials"}'),
('E-commerce Platform', 'Full-stack e-commerce solution', 'web', '{"React", "Node.js", "PostgreSQL", "Stripe"}', '6-8 weeks', 'advanced', '{"User authentication", "Product catalog", "Shopping cart", "Payment processing"}', '{"React documentation", "Stripe API", "PostgreSQL guide"}');

-- Insert sample resume templates
INSERT INTO public.resume_templates (name, description, template_data) VALUES
('Modern Professional', 'Clean and modern design for tech professionals', '{"layout": "modern", "colors": {"primary": "#2563eb", "secondary": "#64748b"}, "sections": ["personal", "experience", "skills", "projects", "education"]}'),
('Creative Portfolio', 'Creative design for designers and artists', '{"layout": "creative", "colors": {"primary": "#7c3aed", "secondary": "#a855f7"}, "sections": ["personal", "portfolio", "skills", "experience", "education"]}'),
('Academic Focus', 'Traditional layout for academic and research positions', '{"layout": "academic", "colors": {"primary": "#059669", "secondary": "#10b981"}, "sections": ["personal", "education", "publications", "research", "experience"]}'),
('Startup Ready', 'Dynamic design for startup and entrepreneurial roles', '{"layout": "startup", "colors": {"primary": "#dc2626", "secondary": "#ef4444"}, "sections": ["personal", "experience", "projects", "skills", "achievements"]}');

-- Insert sample learning content
INSERT INTO public.learning_content (title, description, category, duration, difficulty, type, source, tags, learning_objectives, is_published, created_by) VALUES
('React Hooks Deep Dive', 'Master the fundamentals of React Hooks including useState, useEffect, and custom hooks.', 'Frontend Development', 45, 'intermediate', 'video', 'Nexa Learning', '{"React", "JavaScript", "Hooks"}', '{"Understand React Hooks", "Implement useState and useEffect", "Create custom hooks"}', true, (SELECT id FROM auth.users LIMIT 1)),
('Design Thinking Workshop', 'Learn the design thinking process and apply it to real-world problems.', 'Design', 120, 'beginner', 'interactive', 'Nexa Learning', '{"Design", "UX", "Problem Solving"}', '{"Learn design thinking principles", "Apply design thinking to problems"}', true, (SELECT id FROM auth.users LIMIT 1)),
('Python Data Analysis', 'Introduction to data analysis with Python using pandas and matplotlib.', 'Data Science', 90, 'beginner', 'video', 'Nexa Learning', '{"Python", "Data Analysis", "Pandas", "Matplotlib"}', '{"Learn pandas basics", "Create data visualizations", "Perform data analysis"}', true, (SELECT id FROM auth.users LIMIT 1)),
('Node.js API Development', 'Build RESTful APIs with Node.js and Express.', 'Backend Development', 75, 'intermediate', 'video', 'Nexa Learning', '{"Node.js", "Express", "API", "REST"}', '{"Build REST APIs", "Handle HTTP requests", "Implement middleware"}', true, (SELECT id FROM auth.users LIMIT 1)),
('Mobile App Design', 'Design principles for mobile applications using modern design tools.', 'Design', 60, 'beginner', 'interactive', 'Nexa Learning', '{"Mobile Design", "UI/UX", "Figma", "Prototyping"}', '{"Learn mobile design principles", "Create mobile prototypes", "Use design tools"}', true, (SELECT id FROM auth.users LIMIT 1));

COMMIT;
