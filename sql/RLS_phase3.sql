-- Phase 3 RLS Policies - Final Version
-- This file creates Row Level Security policies for Phase 3 tables
-- Run this AFTER creating the tables with PHASE3_ADDITIONAL_TABLES_FINAL.sql

-- =====================================================
-- MENTOR AND PEER REVIEW SYSTEM RLS POLICIES
-- =====================================================

-- RLS for mentors
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all mentors." ON public.mentors FOR SELECT USING (true);
CREATE POLICY "Users can insert their own mentor profile." ON public.mentors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mentor profile." ON public.mentors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mentor profile." ON public.mentors FOR DELETE USING (auth.uid() = user_id);

-- RLS for project_reviews
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews for their projects." ON public.project_reviews FOR SELECT USING (
    auth.uid() = reviewer_id OR
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Reviewers can insert reviews." ON public.project_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update their own reviews." ON public.project_reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can delete their own reviews." ON public.project_reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- RLS for project_submissions
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submissions." ON public.project_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view submissions for their projects." ON public.project_submissions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert their own submissions." ON public.project_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own submissions." ON public.project_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own submissions." ON public.project_submissions FOR DELETE USING (auth.uid() = user_id);

-- RLS for review_criteria
ALTER TABLE public.review_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active review criteria." ON public.review_criteria FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage review criteria." ON public.review_criteria FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- RLS for review_scores
ALTER TABLE public.review_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scores for their reviews." ON public.review_scores FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.project_reviews 
        WHERE id = review_id AND reviewer_id = auth.uid()
    )
);
CREATE POLICY "Reviewers can insert scores for their reviews." ON public.review_scores FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.project_reviews 
        WHERE id = review_id AND reviewer_id = auth.uid()
    )
);
CREATE POLICY "Reviewers can update scores for their reviews." ON public.review_scores FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.project_reviews 
        WHERE id = review_id AND reviewer_id = auth.uid()
    )
);

-- =====================================================
-- LIVING RESUME SYSTEM RLS POLICIES
-- =====================================================

-- RLS for living_resumes
ALTER TABLE public.living_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own living resumes." ON public.living_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own living resumes." ON public.living_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own living resumes." ON public.living_resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own living resumes." ON public.living_resumes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view published resumes." ON public.living_resumes FOR SELECT USING (is_public = TRUE);

-- RLS for resume_sections
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sections of their resumes." ON public.resume_sections FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert sections to their resumes." ON public.resume_sections FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Users can update sections of their resumes." ON public.resume_sections FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete sections of their resumes." ON public.resume_sections FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);

-- RLS for resume_templates
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active resume templates." ON public.resume_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage resume templates." ON public.resume_templates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- RLS for resume_analytics
ALTER TABLE public.resume_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics for their resumes." ON public.resume_analytics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);
CREATE POLICY "System can insert resume analytics." ON public.resume_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all resume analytics." ON public.resume_analytics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- RLS for resume_exports
ALTER TABLE public.resume_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exports of their resumes." ON public.resume_exports FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Users can create exports of their resumes." ON public.resume_exports FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete exports of their resumes." ON public.resume_exports FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);

-- =====================================================
-- AI PHASE 3 RLS POLICIES
-- =====================================================

-- RLS for ai_content_recommendations
ALTER TABLE public.ai_content_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content recommendations." ON public.ai_content_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert content recommendations." ON public.ai_content_recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own content recommendations." ON public.ai_content_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content recommendations." ON public.ai_content_recommendations FOR DELETE USING (auth.uid() = user_id);

-- RLS for ai_resume_suggestions
ALTER TABLE public.ai_resume_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view suggestions for their resumes." ON public.ai_resume_suggestions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);
CREATE POLICY "System can insert resume suggestions." ON public.ai_resume_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update suggestions for their resumes." ON public.ai_resume_suggestions FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete suggestions for their resumes." ON public.ai_resume_suggestions FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.living_resumes 
        WHERE id = resume_id AND user_id = auth.uid()
    )
);

-- RLS for ai_learning_analytics
ALTER TABLE public.ai_learning_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning analytics." ON public.ai_learning_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert learning analytics." ON public.ai_learning_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all learning analytics." ON public.ai_learning_analytics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- =====================================================
-- REAL-TIME FEATURES RLS POLICIES
-- =====================================================

-- RLS for realtime_notifications
ALTER TABLE public.realtime_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications." ON public.realtime_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications." ON public.realtime_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications." ON public.realtime_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications." ON public.realtime_notifications FOR DELETE USING (auth.uid() = user_id);

-- RLS for websocket_connections
ALTER TABLE public.websocket_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections." ON public.websocket_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert connections." ON public.websocket_connections FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update connections." ON public.websocket_connections FOR UPDATE WITH CHECK (true);
CREATE POLICY "System can delete connections." ON public.websocket_connections FOR DELETE WITH CHECK (true);
CREATE POLICY "Admins can view all connections." ON public.websocket_connections FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Users can view all mentors." ON public.mentors IS 'Allows all users to view mentor profiles for discovery';
COMMENT ON POLICY "Users can view their own living resumes." ON public.living_resumes IS 'Users can only see their own resumes by default';
COMMENT ON POLICY "Public can view published resumes." ON public.living_resumes IS 'Allows public access to resumes marked as public';
COMMENT ON POLICY "System can insert notifications." ON public.realtime_notifications IS 'Allows the system to create notifications for users';
COMMENT ON POLICY "System can insert content recommendations." ON public.ai_content_recommendations IS 'Allows AI system to create recommendations';
