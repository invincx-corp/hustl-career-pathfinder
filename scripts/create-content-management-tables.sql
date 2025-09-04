-- Content Management System Tables for Phase 3

-- Learning Content Table
CREATE TABLE IF NOT EXISTS learning_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    duration INTEGER NOT NULL, -- in minutes
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('video', 'article', 'interactive', 'quiz', 'project')) NOT NULL,
    source VARCHAR(255) NOT NULL,
    source_url TEXT,
    thumbnail_url TEXT,
    tags TEXT[], -- Array of tags
    prerequisites TEXT[], -- Array of prerequisite content IDs
    learning_objectives TEXT[], -- Array of learning objectives
    content_data JSONB, -- JSON data for the actual content
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES learning_content(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent INTEGER DEFAULT 0, -- in minutes
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    UNIQUE(user_id, content_id)
);

-- Badges Table
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(50) CHECK (category IN ('learning', 'achievement', 'milestone', 'special')) NOT NULL,
    rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) NOT NULL,
    requirements JSONB, -- JSON data for badge requirements
    xp_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0, -- for progress-based badges
    UNIQUE(user_id, badge_id)
);

-- Offline Content Table
CREATE TABLE IF NOT EXISTS offline_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES learning_content(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size INTEGER, -- in bytes
    file_path TEXT,
    is_synced BOOLEAN DEFAULT false,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- Content Categories Table
CREATE TABLE IF NOT EXISTS content_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- hex color code
    parent_id UUID REFERENCES content_categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Learning Paths Table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER, -- in hours
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Path Content Table (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS learning_path_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    content_id UUID REFERENCES learning_content(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    UNIQUE(learning_path_id, content_id)
);

-- User Learning Paths Table
CREATE TABLE IF NOT EXISTS user_learning_paths (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, learning_path_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_content_category ON learning_content(category);
CREATE INDEX IF NOT EXISTS idx_learning_content_difficulty ON learning_content(difficulty);
CREATE INDEX IF NOT EXISTS idx_learning_content_type ON learning_content(type);
CREATE INDEX IF NOT EXISTS idx_learning_content_published ON learning_content(is_published);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_content_id ON user_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_content_user_id ON offline_content(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_category ON learning_paths(category);
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_user_id ON user_learning_paths(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_paths ENABLE ROW LEVEL SECURITY;

-- Learning Content Policies
CREATE POLICY "Anyone can view published learning content" ON learning_content
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view their own created content" ON learning_content
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Content creators can manage their content" ON learning_content
    FOR ALL USING (auth.uid() = created_by);

-- User Progress Policies
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

-- User Badges Policies
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own badge progress" ON user_badges
    FOR UPDATE USING (auth.uid() = user_id);

-- Offline Content Policies
CREATE POLICY "Users can manage their own offline content" ON offline_content
    FOR ALL USING (auth.uid() = user_id);

-- Learning Paths Policies
CREATE POLICY "Anyone can view published learning paths" ON learning_paths
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view their own created learning paths" ON learning_paths
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Learning path creators can manage their paths" ON learning_paths
    FOR ALL USING (auth.uid() = created_by);

-- User Learning Paths Policies
CREATE POLICY "Users can view their own learning paths" ON user_learning_paths
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own learning paths" ON user_learning_paths
    FOR ALL USING (auth.uid() = user_id);

-- Insert default content categories
INSERT INTO content_categories (name, description, icon, color, sort_order) VALUES
('Frontend Development', 'Web frontend technologies and frameworks', 'code', '#3B82F6', 1),
('Backend Development', 'Server-side development and APIs', 'server', '#10B981', 2),
('Data Science', 'Data analysis, machine learning, and AI', 'bar-chart', '#8B5CF6', 3),
('Design', 'UI/UX design and visual design principles', 'palette', '#F59E0B', 4),
('Mobile Development', 'Mobile app development for iOS and Android', 'smartphone', '#EF4444', 5),
('DevOps', 'Deployment, infrastructure, and automation', 'settings', '#6B7280', 6),
('Soft Skills', 'Communication, leadership, and teamwork', 'users', '#EC4899', 7),
('Business', 'Entrepreneurship, marketing, and strategy', 'briefcase', '#14B8A6', 8)
ON CONFLICT (name) DO NOTHING;

-- Insert default badges
INSERT INTO badges (name, description, category, rarity, xp_reward, requirements) VALUES
('First Steps', 'Complete your first learning capsule', 'learning', 'common', 10, '{"type": "completion", "count": 1}'),
('Learning Streak', 'Complete capsules for 7 consecutive days', 'achievement', 'rare', 50, '{"type": "streak", "days": 7}'),
('Knowledge Seeker', 'Complete 10 learning capsules', 'milestone', 'common', 100, '{"type": "completion", "count": 10}'),
('Expert Learner', 'Complete 50 learning capsules', 'milestone', 'epic', 500, '{"type": "completion", "count": 50}'),
('Master of All', 'Complete 100 learning capsules', 'milestone', 'legendary', 1000, '{"type": "completion", "count": 100}'),
('Speed Learner', 'Complete a capsule in under 30 minutes', 'special', 'rare', 25, '{"type": "speed", "minutes": 30}'),
('Perfect Score', 'Get 100% on a quiz', 'achievement', 'rare', 30, '{"type": "quiz_score", "percentage": 100}'),
('Early Bird', 'Complete a capsule before 8 AM', 'special', 'common', 15, '{"type": "time", "hour": 8}'),
('Night Owl', 'Complete a capsule after 10 PM', 'special', 'common', 15, '{"type": "time", "hour": 22}'),
('Weekend Warrior', 'Complete 5 capsules on weekends', 'achievement', 'rare', 40, '{"type": "weekend", "count": 5}')
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_learning_content_updated_at BEFORE UPDATE ON learning_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to award badges automatically
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
    badge_record RECORD;
    user_completion_count INTEGER;
    user_streak_count INTEGER;
BEGIN
    -- Check completion-based badges
    IF NEW.is_completed = true AND OLD.is_completed = false THEN
        -- Count total completions for user
        SELECT COUNT(*) INTO user_completion_count
        FROM user_progress
        WHERE user_id = NEW.user_id AND is_completed = true;
        
        -- Award badges based on completion count
        FOR badge_record IN 
            SELECT * FROM badges 
            WHERE category = 'milestone' 
            AND requirements->>'type' = 'completion'
            AND (requirements->>'count')::integer <= user_completion_count
        LOOP
            INSERT INTO user_badges (user_id, badge_id, earned_at)
            VALUES (NEW.user_id, badge_record.id, NOW())
            ON CONFLICT (user_id, badge_id) DO NOTHING;
        END LOOP;
        
        -- Award "First Steps" badge
        IF user_completion_count = 1 THEN
            INSERT INTO user_badges (user_id, badge_id, earned_at)
            SELECT NEW.user_id, id, NOW()
            FROM badges 
            WHERE name = 'First Steps'
            ON CONFLICT (user_id, badge_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_check_badges AFTER UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
