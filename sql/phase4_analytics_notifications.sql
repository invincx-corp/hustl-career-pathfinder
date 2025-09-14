-- PHASE 4: CLEAN FUNCTIONS
-- This script creates functions after all tables are created

-- Create AI coaching analytics function
CREATE OR REPLACE FUNCTION get_ai_coaching_analytics(user_uuid UUID, period_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_conversations BIGINT,
    average_sentiment DECIMAL(3,2),
    escalation_rate DECIMAL(5,2),
    top_topics TEXT[],
    engagement_trend TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH conversation_stats AS (
        SELECT 
            COUNT(*) as total_conv,
            AVG(COALESCE((sentiment->>'confidence')::DECIMAL, 0.5)) as avg_sent,
            COUNT(*) FILTER (WHERE needs_escalation = true) as escalations
        FROM public.ai_coaching_conversations
        WHERE user_id = user_uuid
        AND created_at >= NOW() - INTERVAL '1 day' * period_days
    ),
    topic_analysis AS (
        SELECT ARRAY_AGG(insight_text ORDER BY confidence_score DESC) as topics
        FROM (
            SELECT 
                unnest(COALESCE(insights->>'insights', '[]'::jsonb)::text[]) as insight_text,
                0.8 as confidence_score
            FROM public.ai_coaching_conversations
            WHERE user_id = user_uuid
            AND created_at >= NOW() - INTERVAL '1 day' * period_days
            LIMIT 5
        ) t
    )
    SELECT 
        cs.total_conv::BIGINT,
        COALESCE(cs.avg_sent, 0.5)::DECIMAL(3,2),
        CASE 
            WHEN cs.total_conv > 0 THEN (cs.escalations::DECIMAL / cs.total_conv * 100)::DECIMAL(5,2)
            ELSE 0::DECIMAL(5,2)
        END,
        COALESCE(ta.topics, ARRAY[]::TEXT[]),
        'stable'::TEXT
    FROM conversation_stats cs, topic_analysis ta;
END;
$$ language 'plpgsql';

-- Create escalation analytics function
CREATE OR REPLACE FUNCTION update_escalation_analytics()
RETURNS TRIGGER AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    analytics_record RECORD;
BEGIN
    -- Get or create analytics record for today
    SELECT * INTO analytics_record
    FROM public.escalation_analytics
    WHERE date = current_date;
    
    IF NOT FOUND THEN
        -- Create new analytics record
        INSERT INTO public.escalation_analytics (date) VALUES (current_date);
        SELECT * INTO analytics_record
        FROM public.escalation_analytics
        WHERE date = current_date;
    END IF;
    
    -- Update analytics based on the change
    IF TG_OP = 'INSERT' THEN
        UPDATE public.escalation_analytics
        SET 
            total_escalations = total_escalations + 1,
            pending_escalations = pending_escalations + 1,
            updated_at = NOW()
        WHERE date = current_date;
        
        -- Update priority counts
        IF NEW.priority = 'urgent' THEN
            UPDATE public.escalation_analytics
            SET urgent_escalations = urgent_escalations + 1
            WHERE date = current_date;
        ELSIF NEW.priority = 'high' THEN
            UPDATE public.escalation_analytics
            SET high_priority_escalations = high_priority_escalations + 1
            WHERE date = current_date;
        ELSIF NEW.priority = 'medium' THEN
            UPDATE public.escalation_analytics
            SET medium_priority_escalations = medium_priority_escalations + 1
            WHERE date = current_date;
        ELSIF NEW.priority = 'low' THEN
            UPDATE public.escalation_analytics
            SET low_priority_escalations = low_priority_escalations + 1
            WHERE date = current_date;
        END IF;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status = 'pending' AND NEW.status = 'assigned' THEN
            UPDATE public.escalation_analytics
            SET 
                pending_escalations = pending_escalations - 1,
                assigned_escalations = assigned_escalations + 1,
                mentor_assignments = mentor_assignments + 1,
                updated_at = NOW()
            WHERE date = current_date;
        ELSIF OLD.status != 'resolved' AND NEW.status = 'resolved' THEN
            UPDATE public.escalation_analytics
            SET 
                resolved_escalations = resolved_escalations + 1,
                updated_at = NOW()
            WHERE date = current_date;
        ELSIF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
            UPDATE public.escalation_analytics
            SET 
                cancelled_escalations = cancelled_escalations + 1,
                updated_at = NOW()
            WHERE date = current_date;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create escalation notification function
CREATE OR REPLACE FUNCTION create_escalation_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for user when escalation is created
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.escalation_notifications (
            escalation_id,
            user_id,
            notification_type,
            title,
            message,
            data
        ) VALUES (
            NEW.id,
            NEW.user_id,
            'escalation_created',
            'Escalation Request Submitted',
            'Your request for human support has been submitted and is being reviewed.',
            json_build_object(
                'escalation_id', NEW.id,
                'priority', NEW.priority,
                'reason', NEW.escalation_reason
            )
        );
    END IF;
    
    -- Create notification when mentor is assigned
    IF TG_OP = 'UPDATE' AND OLD.assigned_mentor_id IS NULL AND NEW.assigned_mentor_id IS NOT NULL THEN
        INSERT INTO public.escalation_notifications (
            escalation_id,
            user_id,
            notification_type,
            title,
            message,
            data
        ) VALUES (
            NEW.id,
            NEW.user_id,
            'mentor_assigned',
            'Mentor Assigned',
            'A mentor has been assigned to help you with your request.',
            json_build_object(
                'escalation_id', NEW.id,
                'mentor_id', NEW.assigned_mentor_id
            )
        );
    END IF;
    
    -- Create notification when escalation is resolved
    IF TG_OP = 'UPDATE' AND OLD.status != 'resolved' AND NEW.status = 'resolved' THEN
        INSERT INTO public.escalation_notifications (
            escalation_id,
            user_id,
            notification_type,
            title,
            message,
            data
        ) VALUES (
            NEW.id,
            NEW.user_id,
            'escalation_resolved',
            'Escalation Resolved',
            'Your escalation request has been resolved. Please rate your experience.',
            json_build_object(
                'escalation_id', NEW.id,
                'resolution', NEW.resolution
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user context summary function
CREATE OR REPLACE FUNCTION get_user_context_summary(user_uuid UUID)
RETURNS TABLE (
    profile_completeness INTEGER,
    learning_progress DECIMAL(5,2),
    career_stage TEXT,
    emotional_state TEXT,
    engagement_level TEXT,
    last_active TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH profile_data AS (
        SELECT 
            CASE 
                WHEN p.full_name IS NOT NULL THEN 1 ELSE 0
            END +
            CASE 
                WHEN p.role IS NOT NULL THEN 1 ELSE 0
            END +
            CASE 
                WHEN p.industry IS NOT NULL THEN 1 ELSE 0
            END +
            CASE 
                WHEN p.location IS NOT NULL THEN 1 ELSE 0
            END +
            CASE 
                WHEN p.bio IS NOT NULL THEN 1 ELSE 0
            END as completeness
        FROM public.profiles p
        WHERE p.id = user_uuid
    ),
    learning_data AS (
        SELECT AVG(progress_percentage) as avg_progress
        FROM public.learning_progress
        WHERE user_id = user_uuid
    ),
    career_data AS (
        SELECT 
            CASE 
                WHEN COUNT(*) = 0 THEN 'early'
                WHEN COUNT(*) FILTER (WHERE goal_title ILIKE '%senior%' OR goal_title ILIKE '%lead%') > 0 THEN 'senior'
                WHEN COUNT(*) FILTER (WHERE goal_title ILIKE '%mid%' OR goal_title ILIKE '%intermediate%') > 0 THEN 'mid'
                ELSE 'early'
            END as stage
        FROM public.career_goals
        WHERE user_id = user_uuid
    ),
    emotional_data AS (
        SELECT 
            CASE 
                WHEN AVG(mood_level) >= 4 THEN 'positive'
                WHEN AVG(mood_level) <= 2 THEN 'negative'
                ELSE 'neutral'
            END as state
        FROM public.mood_tracking
        WHERE user_id = user_uuid
        AND created_at >= NOW() - INTERVAL '7 days'
    ),
    engagement_data AS (
        SELECT 
            CASE 
                WHEN AVG(engagement_score) >= 0.7 THEN 'high'
                WHEN AVG(engagement_score) >= 0.4 THEN 'medium'
                ELSE 'low'
            END as level
        FROM public.user_engagement
        WHERE user_id = user_uuid
        AND date >= CURRENT_DATE - INTERVAL '7 days'
    ),
    activity_data AS (
        SELECT MAX(created_at) as last_activity
        FROM public.user_activity_log
        WHERE user_id = user_uuid
    )
    SELECT 
        COALESCE(pd.completeness * 20, 0)::INTEGER,
        COALESCE(ld.avg_progress, 0.0),
        COALESCE(cd.stage, 'unknown'),
        COALESCE(ed.state, 'neutral'),
        COALESCE(eng.level, 'low'),
        COALESCE(ad.last_activity, NOW())
    FROM profile_data pd, learning_data ld, career_data cd, emotional_data ed, engagement_data eng, activity_data ad;
END;
$$ language 'plpgsql';

-- Create engagement score calculation function
CREATE OR REPLACE FUNCTION calculate_user_engagement_score(user_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    engagement_score DECIMAL(3,2) := 0.0;
    sessions_count INTEGER := 0;
    time_spent INTEGER := 0;
    features_used_count INTEGER := 0;
BEGIN
    -- Get engagement data for the target date
    SELECT 
        COALESCE(sessions_count, 0),
        COALESCE(time_spent, 0),
        COALESCE(array_length(features_used, 1), 0)
    INTO sessions_count, time_spent, features_used_count
    FROM public.user_engagement
    WHERE user_id = user_uuid AND date = target_date;
    
    -- Calculate engagement score based on multiple factors
    -- Sessions weight: 0.3, Time spent weight: 0.4, Features used weight: 0.3
    engagement_score := 
        (LEAST(sessions_count, 10) / 10.0) * 0.3 +
        (LEAST(time_spent, 120) / 120.0) * 0.4 +
        (LEAST(features_used_count, 5) / 5.0) * 0.3;
    
    -- Ensure score is between 0 and 1
    engagement_score := GREATEST(0.0, LEAST(1.0, engagement_score));
    
    RETURN engagement_score;
END;
$$ language 'plpgsql';

-- Create triggers for escalation analytics (only if they don't exist)
DO $$ 
BEGIN
    -- Create trigger for escalation analytics if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'escalation_analytics_trigger' 
        AND event_object_table = 'escalation_requests'
        AND event_object_schema = 'public'
    ) THEN
        CREATE TRIGGER escalation_analytics_trigger
            AFTER INSERT OR UPDATE ON public.escalation_requests
            FOR EACH ROW EXECUTE FUNCTION update_escalation_analytics();
    END IF;
    
    -- Create trigger for escalation notifications if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'escalation_notification_trigger' 
        AND event_object_table = 'escalation_requests'
        AND event_object_schema = 'public'
    ) THEN
        CREATE TRIGGER escalation_notification_trigger
            AFTER INSERT OR UPDATE ON public.escalation_requests
            FOR EACH ROW EXECUTE FUNCTION create_escalation_notification();
    END IF;
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_ai_coaching_analytics(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_context_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_engagement_score(UUID, DATE) TO authenticated;

-- Success message
SELECT 'Phase 4 clean functions created successfully!' as status;
