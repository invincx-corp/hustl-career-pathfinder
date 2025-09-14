-- PHASE 5: FUNCTIONS AND TRIGGERS FOR OPPORTUNITIES & CAREER FEATURES
-- Comprehensive functions and triggers for all Phase 5 tables

-- Function to update job application count
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.jobs 
        SET current_applications = current_applications + 1,
            updated_at = NOW()
        WHERE id = NEW.job_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.jobs 
        SET current_applications = current_applications - 1,
            updated_at = NOW()
        WHERE id = OLD.job_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for job application count
CREATE TRIGGER trigger_update_job_application_count
    AFTER INSERT OR DELETE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- Function to update job view count
CREATE OR REPLACE FUNCTION update_job_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.jobs 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = NEW.job_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for job view count
CREATE TRIGGER trigger_update_job_view_count
    AFTER INSERT ON public.job_views
    FOR EACH ROW EXECUTE FUNCTION update_job_view_count();

-- Function to update talent pool member count
CREATE OR REPLACE FUNCTION update_talent_pool_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
        UPDATE public.talent_pools 
        SET member_count = member_count + 1,
            updated_at = NOW()
        WHERE id = NEW.talent_pool_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_active = false AND NEW.is_active = true THEN
            UPDATE public.talent_pools 
            SET member_count = member_count + 1,
                updated_at = NOW()
            WHERE id = NEW.talent_pool_id;
        ELSIF OLD.is_active = true AND NEW.is_active = false THEN
            UPDATE public.talent_pools 
            SET member_count = member_count - 1,
                updated_at = NOW()
            WHERE id = NEW.talent_pool_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.is_active = true THEN
        UPDATE public.talent_pools 
        SET member_count = member_count - 1,
            updated_at = NOW()
        WHERE id = OLD.talent_pool_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for talent pool member count
CREATE TRIGGER trigger_update_talent_pool_member_count
    AFTER INSERT OR UPDATE OR DELETE ON public.talent_pool_members
    FOR EACH ROW EXECUTE FUNCTION update_talent_pool_member_count();

-- Function to calculate job match score
CREATE OR REPLACE FUNCTION calculate_job_match_score(
    p_job_id UUID,
    p_user_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    match_score DECIMAL(5,2) := 0;
    total_skills INTEGER := 0;
    matched_skills INTEGER := 0;
    skill_weight DECIMAL(5,2) := 0.4;
    experience_weight DECIMAL(5,2) := 0.3;
    location_weight DECIMAL(5,2) := 0.2;
    salary_weight DECIMAL(5,2) := 0.1;
    skill_score DECIMAL(5,2) := 0;
    experience_score DECIMAL(5,2) := 0;
    location_score DECIMAL(5,2) := 0;
    salary_score DECIMAL(5,2) := 0;
    job_record RECORD;
    user_skills TEXT[];
    user_experience TEXT;
    user_location TEXT;
    user_salary_expectation DECIMAL(10,2);
BEGIN
    -- Get job details
    SELECT * INTO job_record FROM public.jobs WHERE id = p_job_id;
    
    -- Get user skills from user profile
    SELECT skills INTO user_skills FROM public.user_profiles WHERE user_id = p_user_id;
    
    -- Get user experience level
    SELECT experience_level INTO user_experience FROM public.user_profiles WHERE user_id = p_user_id;
    
    -- Get user location
    SELECT location INTO user_location FROM public.user_profiles WHERE user_id = p_user_id;
    
    -- Get user salary expectation
    SELECT salary_expectation INTO user_salary_expectation FROM public.user_profiles WHERE user_id = p_user_id;
    
    -- Calculate skill match score
    IF user_skills IS NOT NULL THEN
        SELECT COUNT(*) INTO total_skills FROM public.job_skills WHERE job_id = p_job_id AND is_required = true;
        
        SELECT COUNT(*) INTO matched_skills 
        FROM public.job_skills js
        WHERE js.job_id = p_job_id 
        AND js.is_required = true
        AND js.skill_name = ANY(user_skills);
        
        IF total_skills > 0 THEN
            skill_score := (matched_skills::DECIMAL / total_skills::DECIMAL) * 100;
        END IF;
    END IF;
    
    -- Calculate experience match score
    CASE job_record.experience_level
        WHEN 'entry' THEN
            experience_score := CASE user_experience
                WHEN 'entry' THEN 100
                WHEN 'mid' THEN 80
                WHEN 'senior' THEN 60
                ELSE 40
            END;
        WHEN 'mid' THEN
            experience_score := CASE user_experience
                WHEN 'entry' THEN 60
                WHEN 'mid' THEN 100
                WHEN 'senior' THEN 90
                ELSE 70
            END;
        WHEN 'senior' THEN
            experience_score := CASE user_experience
                WHEN 'entry' THEN 40
                WHEN 'mid' THEN 70
                WHEN 'senior' THEN 100
                ELSE 90
            END;
        ELSE
            experience_score := 50;
    END CASE;
    
    -- Calculate location match score
    IF job_record.is_remote THEN
        location_score := 100;
    ELSIF user_location IS NOT NULL AND job_record.location ILIKE '%' || user_location || '%' THEN
        location_score := 100;
    ELSE
        location_score := 50;
    END IF;
    
    -- Calculate salary match score
    IF user_salary_expectation IS NOT NULL AND job_record.salary_min IS NOT NULL THEN
        IF user_salary_expectation BETWEEN job_record.salary_min AND job_record.salary_max THEN
            salary_score := 100;
        ELSIF user_salary_expectation < job_record.salary_min THEN
            salary_score := 80;
        ELSE
            salary_score := 60;
        END IF;
    ELSE
        salary_score := 50;
    END IF;
    
    -- Calculate final match score
    match_score := (skill_score * skill_weight) + 
                   (experience_score * experience_weight) + 
                   (location_score * location_weight) + 
                   (salary_score * salary_weight);
    
    RETURN LEAST(match_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to generate job recommendations
CREATE OR REPLACE FUNCTION generate_job_recommendations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE(
    job_id UUID,
    recommendation_score DECIMAL(5,2),
    recommendation_reasons TEXT[]
) AS $$
DECLARE
    user_skills TEXT[];
    user_experience TEXT;
    user_location TEXT;
    user_salary_expectation DECIMAL(10,2);
    job_record RECORD;
    match_score DECIMAL(5,2);
    reasons TEXT[];
BEGIN
    -- Get user profile data
    SELECT skills, experience_level, location, salary_expectation 
    INTO user_skills, user_experience, user_location, user_salary_expectation
    FROM public.user_profiles 
    WHERE user_id = p_user_id;
    
    -- Loop through published jobs
    FOR job_record IN 
        SELECT * FROM public.jobs 
        WHERE status = 'published' 
        AND is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM public.job_applications 
            WHERE job_applications.job_id = jobs.id 
            AND job_applications.user_id = p_user_id
        )
        ORDER BY created_at DESC
        LIMIT p_limit * 3 -- Get more jobs to filter
    LOOP
        -- Calculate match score
        match_score := calculate_job_match_score(job_record.id, p_user_id);
        
        -- Only recommend jobs with score >= 60
        IF match_score >= 60 THEN
            reasons := ARRAY[]::TEXT[];
            
            -- Add reasons based on match factors
            IF match_score >= 80 THEN
                reasons := array_append(reasons, 'High skill match');
            END IF;
            
            IF job_record.is_remote THEN
                reasons := array_append(reasons, 'Remote work available');
            END IF;
            
            IF job_record.is_featured THEN
                reasons := array_append(reasons, 'Featured opportunity');
            END IF;
            
            IF job_record.is_urgent THEN
                reasons := array_append(reasons, 'Urgent hiring');
            END IF;
            
            -- Return the recommendation
            job_id := job_record.id;
            recommendation_score := match_score;
            recommendation_reasons := reasons;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update recruiter analytics
CREATE OR REPLACE FUNCTION update_recruiter_analytics(
    p_recruiter_id UUID,
    p_metric_name TEXT,
    p_metric_value DECIMAL(15,2),
    p_additional_data JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.recruiter_analytics (
        recruiter_id,
        metric_name,
        metric_value,
        metric_date,
        additional_data
    ) VALUES (
        p_recruiter_id,
        p_metric_name,
        p_metric_value,
        CURRENT_DATE,
        p_additional_data
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can apply to job
CREATE OR REPLACE FUNCTION can_user_apply_to_job(
    p_user_id UUID,
    p_job_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    job_record RECORD;
    application_count INTEGER;
BEGIN
    -- Get job details
    SELECT * INTO job_record FROM public.jobs WHERE id = p_job_id;
    
    -- Check if job is published and active
    IF job_record.status != 'published' OR NOT job_record.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- Check if application deadline has passed
    IF job_record.application_deadline IS NOT NULL AND job_record.application_deadline < NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Check if max applications reached
    IF job_record.current_applications >= job_record.max_applications THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user already applied
    SELECT COUNT(*) INTO application_count 
    FROM public.job_applications 
    WHERE job_id = p_job_id AND user_id = p_user_id;
    
    IF application_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get job statistics
CREATE OR REPLACE FUNCTION get_job_statistics(p_job_id UUID)
RETURNS TABLE(
    total_views INTEGER,
    total_applications INTEGER,
    total_bookmarks INTEGER,
    average_match_score DECIMAL(5,2),
    top_applicant_skills TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(j.view_count, 0)::INTEGER as total_views,
        COALESCE(j.current_applications, 0)::INTEGER as total_applications,
        COALESCE(bookmark_count.count, 0)::INTEGER as total_bookmarks,
        COALESCE(avg_score.avg_score, 0)::DECIMAL(5,2) as average_match_score,
        COALESCE(top_skills.skills, ARRAY[]::TEXT[]) as top_applicant_skills
    FROM public.jobs j
    LEFT JOIN (
        SELECT job_id, COUNT(*) as count
        FROM public.job_bookmarks
        GROUP BY job_id
    ) bookmark_count ON bookmark_count.job_id = j.id
    LEFT JOIN (
        SELECT job_id, AVG(recommendation_score) as avg_score
        FROM public.opportunity_recommendations
        WHERE job_id = p_job_id
        GROUP BY job_id
    ) avg_score ON avg_score.job_id = j.id
    LEFT JOIN (
        SELECT job_id, ARRAY_AGG(skill_name ORDER BY skill_count DESC) as skills
        FROM (
            SELECT js.job_id, js.skill_name, COUNT(*) as skill_count
            FROM public.job_skills js
            JOIN public.job_applications ja ON ja.job_id = js.job_id
            JOIN public.user_profiles up ON up.user_id = ja.user_id
            WHERE js.job_id = p_job_id
            AND js.skill_name = ANY(up.skills)
            GROUP BY js.job_id, js.skill_name
            ORDER BY skill_count DESC
            LIMIT 5
        ) skill_stats
        GROUP BY job_id
    ) top_skills ON top_skills.job_id = j.id
    WHERE j.id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Function to search jobs with filters
CREATE OR REPLACE FUNCTION search_jobs(
    p_search_term TEXT DEFAULT NULL,
    p_job_type TEXT DEFAULT NULL,
    p_experience_level TEXT DEFAULT NULL,
    p_domain_id UUID DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_is_remote BOOLEAN DEFAULT NULL,
    p_salary_min DECIMAL(10,2) DEFAULT NULL,
    p_salary_max DECIMAL(10,2) DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE(
    job_id UUID,
    title TEXT,
    company_name TEXT,
    location TEXT,
    job_type TEXT,
    experience_level TEXT,
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    salary_currency TEXT,
    is_remote BOOLEAN,
    match_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id as job_id,
        j.title,
        j.company_name,
        j.location,
        j.job_type,
        j.experience_level,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.is_remote,
        COALESCE(calculate_job_match_score(j.id, auth.uid()), 0) as match_score
    FROM public.jobs j
    WHERE j.status = 'published'
    AND j.is_active = true
    AND (p_search_term IS NULL OR (
        j.title ILIKE '%' || p_search_term || '%' OR
        j.description ILIKE '%' || p_search_term || '%' OR
        j.company_name ILIKE '%' || p_search_term || '%'
    ))
    AND (p_job_type IS NULL OR j.job_type = p_job_type)
    AND (p_experience_level IS NULL OR j.experience_level = p_experience_level)
    AND (p_domain_id IS NULL OR j.domain_id = p_domain_id)
    AND (p_location IS NULL OR j.location ILIKE '%' || p_location || '%')
    AND (p_is_remote IS NULL OR j.is_remote = p_is_remote)
    AND (p_salary_min IS NULL OR j.salary_max >= p_salary_min)
    AND (p_salary_max IS NULL OR j.salary_min <= p_salary_max)
    ORDER BY 
        j.is_featured DESC,
        j.is_urgent DESC,
        match_score DESC,
        j.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to update job status based on applications
CREATE OR REPLACE FUNCTION update_job_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If job is filled, update status
    IF NEW.application_status = 'offered' THEN
        UPDATE public.jobs 
        SET status = 'filled',
            closed_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.job_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for job status update
CREATE TRIGGER trigger_update_job_status
    AFTER UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION update_job_status();

-- Function to clean up expired referral requests
CREATE OR REPLACE FUNCTION cleanup_expired_referrals()
RETURNS VOID AS $$
BEGIN
    UPDATE public.referral_requests 
    SET status = 'expired'
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user's job application history
CREATE OR REPLACE FUNCTION get_user_application_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE(
    application_id UUID,
    job_id UUID,
    job_title TEXT,
    company_name TEXT,
    application_status TEXT,
    applied_at TIMESTAMP WITH TIME ZONE,
    match_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ja.id as application_id,
        ja.job_id,
        j.title as job_title,
        j.company_name,
        ja.application_status,
        ja.applied_at,
        COALESCE(calculate_job_match_score(j.id, p_user_id), 0) as match_score
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE ja.user_id = p_user_id
    ORDER BY ja.applied_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Phase 5 functions and triggers created successfully!' as message;
