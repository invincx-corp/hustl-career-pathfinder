-- PHASE 4: ESCALATION SYSTEM - DATABASE SCHEMA
-- This script creates the database schema for the escalation system

-- Create 'escalation_requests' table for tracking escalation requests
CREATE TABLE IF NOT EXISTS public.escalation_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    original_message TEXT NOT NULL,
    escalation_reason TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'accepted', 'in_session', 'resolved', 'cancelled')),
    factors JSONB DEFAULT '{}',
    assigned_mentor_id UUID REFERENCES public.mentors(id),
    assigned_by UUID REFERENCES auth.users(id),
    accepted_by UUID REFERENCES auth.users(id),
    resolved_by UUID REFERENCES auth.users(id),
    session_id UUID REFERENCES public.mentorship_sessions(id),
    resolution TEXT,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    acceptance_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    session_started_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    rated_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'escalation_notifications' table for tracking notifications
CREATE TABLE IF NOT EXISTS public.escalation_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    escalation_id UUID REFERENCES public.escalation_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('escalation_created', 'mentor_assigned', 'session_scheduled', 'escalation_resolved', 'rating_requested')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create 'escalation_analytics' table for tracking escalation metrics
CREATE TABLE IF NOT EXISTS public.escalation_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    total_escalations INTEGER DEFAULT 0,
    pending_escalations INTEGER DEFAULT 0,
    assigned_escalations INTEGER DEFAULT 0,
    resolved_escalations INTEGER DEFAULT 0,
    cancelled_escalations INTEGER DEFAULT 0,
    urgent_escalations INTEGER DEFAULT 0,
    high_priority_escalations INTEGER DEFAULT 0,
    medium_priority_escalations INTEGER DEFAULT 0,
    low_priority_escalations INTEGER DEFAULT 0,
    average_resolution_time INTEGER DEFAULT 0, -- in minutes
    mentor_assignments INTEGER DEFAULT 0,
    user_satisfaction_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Create 'escalation_templates' table for common escalation responses
CREATE TABLE IF NOT EXISTS public.escalation_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    escalation_reason TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    template_message TEXT NOT NULL,
    suggested_mentor_skills TEXT[],
    auto_assign_rules JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'escalation_workflows' table for automated escalation workflows
CREATE TABLE IF NOT EXISTS public.escalation_workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    trigger_conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'escalation_sla' table for service level agreements
CREATE TABLE IF NOT EXISTS public.escalation_sla (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    response_time_minutes INTEGER NOT NULL,
    resolution_time_minutes INTEGER NOT NULL,
    escalation_time_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(priority)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_escalation_requests_user_id ON public.escalation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_escalation_requests_status ON public.escalation_requests(status);
CREATE INDEX IF NOT EXISTS idx_escalation_requests_priority ON public.escalation_requests(priority);
CREATE INDEX IF NOT EXISTS idx_escalation_requests_assigned_mentor_id ON public.escalation_requests(assigned_mentor_id);
CREATE INDEX IF NOT EXISTS idx_escalation_requests_created_at ON public.escalation_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_escalation_notifications_escalation_id ON public.escalation_notifications(escalation_id);
CREATE INDEX IF NOT EXISTS idx_escalation_notifications_user_id ON public.escalation_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_escalation_notifications_is_read ON public.escalation_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_escalation_notifications_created_at ON public.escalation_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_escalation_analytics_date ON public.escalation_analytics(date);

CREATE INDEX IF NOT EXISTS idx_escalation_templates_escalation_reason ON public.escalation_templates(escalation_reason);
CREATE INDEX IF NOT EXISTS idx_escalation_templates_priority ON public.escalation_templates(priority);
CREATE INDEX IF NOT EXISTS idx_escalation_templates_is_active ON public.escalation_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_escalation_workflows_is_active ON public.escalation_workflows(is_active);

CREATE INDEX IF NOT EXISTS idx_escalation_sla_priority ON public.escalation_sla(priority);
CREATE INDEX IF NOT EXISTS idx_escalation_sla_is_active ON public.escalation_sla(is_active);

-- Add RLS policies
ALTER TABLE public.escalation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_sla ENABLE ROW LEVEL SECURITY;

-- Users can view their own escalation requests
CREATE POLICY "Users can view their own escalation requests" ON public.escalation_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own escalation notifications
CREATE POLICY "Users can view their own escalation notifications" ON public.escalation_notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Mentors can view escalations assigned to them
CREATE POLICY "Mentors can view assigned escalations" ON public.escalation_requests
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.mentors 
            WHERE id = assigned_mentor_id
        )
    );

-- Admins can manage all escalation requests
CREATE POLICY "Admins can manage all escalation requests" ON public.escalation_requests
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all escalation notifications" ON public.escalation_notifications
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all escalation analytics" ON public.escalation_analytics
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all escalation templates" ON public.escalation_templates
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all escalation workflows" ON public.escalation_workflows
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all escalation SLA" ON public.escalation_sla
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_escalation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_escalation_requests_updated_at 
    BEFORE UPDATE ON public.escalation_requests 
    FOR EACH ROW EXECUTE FUNCTION update_escalation_updated_at();

CREATE TRIGGER update_escalation_analytics_updated_at 
    BEFORE UPDATE ON public.escalation_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_escalation_updated_at();

CREATE TRIGGER update_escalation_templates_updated_at 
    BEFORE UPDATE ON public.escalation_templates 
    FOR EACH ROW EXECUTE FUNCTION update_escalation_updated_at();

CREATE TRIGGER update_escalation_workflows_updated_at 
    BEFORE UPDATE ON public.escalation_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_escalation_updated_at();

CREATE TRIGGER update_escalation_sla_updated_at 
    BEFORE UPDATE ON public.escalation_sla 
    FOR EACH ROW EXECUTE FUNCTION update_escalation_updated_at();

-- Create function to automatically create escalation notifications
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

-- Create trigger for escalation notifications
CREATE TRIGGER escalation_notification_trigger
    AFTER INSERT OR UPDATE ON public.escalation_requests
    FOR EACH ROW EXECUTE FUNCTION create_escalation_notification();

-- Create function to update escalation analytics
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
            CASE NEW.priority
                WHEN 'urgent' THEN urgent_escalations = urgent_escalations + 1
                WHEN 'high' THEN high_priority_escalations = high_priority_escalations + 1
                WHEN 'medium' THEN medium_priority_escalations = medium_priority_escalations + 1
                WHEN 'low' THEN low_priority_escalations = low_priority_escalations + 1
            END,
            updated_at = NOW()
        WHERE date = current_date;
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

-- Create trigger for analytics updates
CREATE TRIGGER escalation_analytics_trigger
    AFTER INSERT OR UPDATE ON public.escalation_requests
    FOR EACH ROW EXECUTE FUNCTION update_escalation_analytics();

-- Insert default SLA values
INSERT INTO public.escalation_sla (priority, response_time_minutes, resolution_time_minutes, escalation_time_minutes) VALUES
('urgent', 5, 60, 15),
('high', 15, 240, 60),
('medium', 30, 480, 120),
('low', 60, 1440, 240)
ON CONFLICT (priority) DO NOTHING;

-- Insert default escalation templates
INSERT INTO public.escalation_templates (name, description, escalation_reason, priority, template_message, suggested_mentor_skills) VALUES
('Crisis Support', 'Template for crisis situations', 'crisis_keywords', 'urgent', 'This appears to be a crisis situation. A mentor will be assigned immediately to provide support.', ARRAY['crisis_intervention', 'mental_health', 'support']),
('Career Confusion', 'Template for career guidance needs', 'complex_question', 'medium', 'You have complex career questions that would benefit from one-on-one guidance with a mentor.', ARRAY['career_guidance', 'coaching', 'mentoring']),
('Technical Help', 'Template for technical assistance', 'complex_question', 'medium', 'Your technical question requires specialized knowledge. A mentor with relevant expertise will be assigned.', ARRAY['technical_skills', 'programming', 'engineering']),
('Stress Support', 'Template for stress-related escalations', 'high_stress', 'high', 'We understand you are experiencing high stress. A mentor will help you work through this situation.', ARRAY['stress_management', 'work_life_balance', 'support'])
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.escalation_requests TO authenticated;
GRANT SELECT ON public.escalation_notifications TO authenticated;
GRANT SELECT ON public.escalation_analytics TO authenticated;
GRANT SELECT ON public.escalation_templates TO authenticated;
GRANT SELECT ON public.escalation_sla TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.escalation_requests IS 'Tracks escalation requests from users to human mentors';
COMMENT ON TABLE public.escalation_notifications IS 'Notifications related to escalation requests';
COMMENT ON TABLE public.escalation_analytics IS 'Daily analytics for escalation system performance';
COMMENT ON TABLE public.escalation_templates IS 'Templates for common escalation responses';
COMMENT ON TABLE public.escalation_workflows IS 'Automated workflows for escalation handling';
COMMENT ON TABLE public.escalation_sla IS 'Service level agreements for escalation response times';
COMMENT ON FUNCTION create_escalation_notification() IS 'Automatically creates notifications for escalation events';
COMMENT ON FUNCTION update_escalation_analytics() IS 'Updates daily analytics when escalation status changes';
