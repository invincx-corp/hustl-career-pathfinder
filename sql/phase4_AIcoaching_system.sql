-- PHASE 4: AI COACHING SYSTEM - DATABASE SCHEMA
-- This script creates the database schema for AI coaching conversations and analytics

-- Create 'ai_coaching_conversations' table
CREATE TABLE IF NOT EXISTS public.ai_coaching_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    sentiment JSONB,
    insights JSONB,
    needs_escalation BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    escalation_priority TEXT CHECK (escalation_priority IN ('low', 'medium', 'high')),
    escalation_status TEXT DEFAULT 'pending' CHECK (escalation_status IN ('pending', 'in_progress', 'resolved', 'dismissed')),
    assigned_mentor_id UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    resolution_notes TEXT,
    escalation_handled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'ai_coaching_summaries' table
CREATE TABLE IF NOT EXISTS public.ai_coaching_summaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'ai_coaching_preferences' table
CREATE TABLE IF NOT EXISTS public.ai_coaching_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    coaching_style TEXT DEFAULT 'balanced' CHECK (coaching_style IN ('supportive', 'direct', 'balanced', 'analytical')),
    response_length TEXT DEFAULT 'medium' CHECK (response_length IN ('brief', 'medium', 'detailed')),
    topics_of_interest TEXT[] DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    escalation_threshold DECIMAL(3,2) DEFAULT 0.7 CHECK (escalation_threshold >= 0 AND escalation_threshold <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'ai_coaching_insights' table for storing extracted insights
CREATE TABLE IF NOT EXISTS public.ai_coaching_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.ai_coaching_conversations(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('career_goal', 'skill_gap', 'opportunity', 'challenge', 'achievement', 'recommendation')),
    insight_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    is_actionable BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'ai_coaching_action_items' table
CREATE TABLE IF NOT EXISTS public.ai_coaching_action_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.ai_coaching_conversations(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    due_date DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 'ai_coaching_escalations' table for tracking escalations
CREATE TABLE IF NOT EXISTS public.ai_coaching_escalations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.ai_coaching_conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    escalation_reason TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'dismissed')),
    assigned_mentor_id UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    resolution_notes TEXT,
    escalated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_coaching_conversations_user_id 
    ON public.ai_coaching_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_conversations_conversation_id 
    ON public.ai_coaching_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_conversations_created_at 
    ON public.ai_coaching_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_conversations_needs_escalation 
    ON public.ai_coaching_conversations(needs_escalation);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_conversations_escalation_status 
    ON public.ai_coaching_conversations(escalation_status);

CREATE INDEX IF NOT EXISTS idx_ai_coaching_summaries_user_id 
    ON public.ai_coaching_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_summaries_session_id 
    ON public.ai_coaching_summaries(session_id);

CREATE INDEX IF NOT EXISTS idx_ai_coaching_preferences_user_id 
    ON public.ai_coaching_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_coaching_insights_user_id 
    ON public.ai_coaching_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_insights_conversation_id 
    ON public.ai_coaching_insights(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_insights_insight_type 
    ON public.ai_coaching_insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_ai_coaching_action_items_user_id 
    ON public.ai_coaching_action_items(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_action_items_status 
    ON public.ai_coaching_action_items(status);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_action_items_due_date 
    ON public.ai_coaching_action_items(due_date);

CREATE INDEX IF NOT EXISTS idx_ai_coaching_escalations_conversation_id 
    ON public.ai_coaching_escalations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_escalations_user_id 
    ON public.ai_coaching_escalations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_escalations_status 
    ON public.ai_coaching_escalations(status);

-- Add RLS policies
ALTER TABLE public.ai_coaching_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_escalations ENABLE ROW LEVEL SECURITY;

-- Users can manage their own conversations
CREATE POLICY "Users can manage their own conversations" ON public.ai_coaching_conversations
    FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own summaries
CREATE POLICY "Users can manage their own summaries" ON public.ai_coaching_summaries
    FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own preferences
CREATE POLICY "Users can manage their own preferences" ON public.ai_coaching_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own insights
CREATE POLICY "Users can manage their own insights" ON public.ai_coaching_insights
    FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own action items
CREATE POLICY "Users can manage their own action items" ON public.ai_coaching_action_items
    FOR ALL USING (auth.uid() = user_id);

-- Users can view their own escalations
CREATE POLICY "Users can view their own escalations" ON public.ai_coaching_escalations
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all data
CREATE POLICY "Admins can manage all AI coaching data" ON public.ai_coaching_conversations
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all summaries" ON public.ai_coaching_summaries
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all preferences" ON public.ai_coaching_preferences
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all insights" ON public.ai_coaching_insights
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all action items" ON public.ai_coaching_action_items
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all escalations" ON public.ai_coaching_escalations
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_coaching_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ai_coaching_conversations_updated_at 
    BEFORE UPDATE ON public.ai_coaching_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_ai_coaching_updated_at();

CREATE TRIGGER update_ai_coaching_summaries_updated_at 
    BEFORE UPDATE ON public.ai_coaching_summaries 
    FOR EACH ROW EXECUTE FUNCTION update_ai_coaching_updated_at();

CREATE TRIGGER update_ai_coaching_preferences_updated_at 
    BEFORE UPDATE ON public.ai_coaching_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_ai_coaching_updated_at();

CREATE TRIGGER update_ai_coaching_insights_updated_at 
    BEFORE UPDATE ON public.ai_coaching_insights 
    FOR EACH ROW EXECUTE FUNCTION update_ai_coaching_updated_at();

CREATE TRIGGER update_ai_coaching_action_items_updated_at 
    BEFORE UPDATE ON public.ai_coaching_action_items 
    FOR EACH ROW EXECUTE FUNCTION update_ai_coaching_updated_at();

CREATE TRIGGER update_ai_coaching_escalations_updated_at 
    BEFORE UPDATE ON public.ai_coaching_escalations 
    FOR EACH ROW EXECUTE FUNCTION update_ai_coaching_updated_at();

-- Create function to extract insights from conversations
CREATE OR REPLACE FUNCTION extract_conversation_insights(conv_id UUID)
RETURNS void AS $$
DECLARE
    conv_record RECORD;
    insight_text TEXT;
    action_text TEXT;
BEGIN
    -- Get conversation record
    SELECT * INTO conv_record 
    FROM public.ai_coaching_conversations 
    WHERE id = conv_id;
    
    -- Extract insights if available
    IF conv_record.insights IS NOT NULL THEN
        -- Insert insights
        IF conv_record.insights->'insights' IS NOT NULL THEN
            FOR insight_text IN SELECT jsonb_array_elements_text(conv_record.insights->'insights')
            LOOP
                INSERT INTO public.ai_coaching_insights (
                    user_id, conversation_id, insight_type, insight_text, confidence_score
                ) VALUES (
                    conv_record.user_id, conv_id, 'recommendation', insight_text, 0.8
                );
            END LOOP;
        END IF;
        
        -- Insert action items
        IF conv_record.insights->'actionItems' IS NOT NULL THEN
            FOR action_text IN SELECT jsonb_array_elements_text(conv_record.insights->'actionItems')
            LOOP
                INSERT INTO public.ai_coaching_action_items (
                    user_id, conversation_id, action_text, priority
                ) VALUES (
                    conv_record.user_id, conv_id, action_text, 'medium'
                );
            END LOOP;
        END IF;
    END IF;
END;
$$ language 'plpgsql';

-- Create function to get conversation analytics
CREATE OR REPLACE FUNCTION get_conversation_analytics(user_uuid UUID, period_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_conversations BIGINT,
    total_messages BIGINT,
    escalations BIGINT,
    average_sentiment NUMERIC,
    top_topics TEXT[],
    engagement_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH conversation_stats AS (
        SELECT 
            COUNT(*) as total_conv,
            COUNT(*) * 2 as total_msg, -- user + AI messages
            COUNT(*) FILTER (WHERE needs_escalation = true) as escalations,
            AVG((sentiment->>'confidence')::NUMERIC) as avg_confidence
        FROM public.ai_coaching_conversations
        WHERE user_id = user_uuid
        AND created_at >= NOW() - (period_days || ' days')::INTERVAL
    ),
    topic_stats AS (
        SELECT ARRAY_AGG(insight_text ORDER BY confidence_score DESC LIMIT 5) as topics
        FROM public.ai_coaching_insights
        WHERE user_id = user_uuid
        AND created_at >= NOW() - (period_days || ' days')::INTERVAL
    )
    SELECT 
        cs.total_conv,
        cs.total_msg,
        cs.escalations,
        COALESCE(cs.avg_confidence, 0),
        COALESCE(ts.topics, ARRAY[]::TEXT[]),
        LEAST(100, (cs.total_conv::NUMERIC / period_days) * 10)
    FROM conversation_stats cs, topic_stats ts;
END;
$$ language 'plpgsql';

-- Create function to check for escalation triggers
CREATE OR REPLACE FUNCTION check_escalation_triggers()
RETURNS TRIGGER AS $$
DECLARE
    escalation_needed BOOLEAN := FALSE;
    escalation_reason TEXT := '';
    escalation_priority TEXT := 'medium';
BEGIN
    -- Check for escalation keywords
    IF NEW.user_message ILIKE '%crisis%' OR NEW.user_message ILIKE '%emergency%' OR 
       NEW.user_message ILIKE '%urgent%' OR NEW.user_message ILIKE '%depressed%' OR
       NEW.user_message ILIKE '%anxious%' OR NEW.user_message ILIKE '%stressed%' OR
       NEW.user_message ILIKE '%overwhelmed%' OR NEW.user_message ILIKE '%burnout%' OR
       NEW.user_message ILIKE '%fired%' OR NEW.user_message ILIKE '%laid off%' OR
       NEW.user_message ILIKE '%discrimination%' OR NEW.user_message ILIKE '%harassment%' OR
       NEW.user_message ILIKE '%suicide%' OR NEW.user_message ILIKE '%self-harm%' OR
       NEW.user_message ILIKE '%therapy%' OR NEW.user_message ILIKE '%counselor%' THEN
        escalation_needed := TRUE;
        escalation_reason := 'Keywords detected';
        escalation_priority := 'high';
    END IF;
    
    -- Check for negative sentiment
    IF NEW.sentiment IS NOT NULL AND 
       (NEW.sentiment->>'sentiment')::TEXT = 'negative' AND 
       (NEW.sentiment->>'confidence')::NUMERIC > 0.7 THEN
        escalation_needed := TRUE;
        escalation_reason := 'Negative sentiment detected';
        escalation_priority := 'medium';
    END IF;
    
    -- Update escalation fields
    NEW.needs_escalation := escalation_needed;
    NEW.escalation_reason := escalation_reason;
    NEW.escalation_priority := escalation_priority;
    
    -- Create escalation record if needed
    IF escalation_needed THEN
        INSERT INTO public.ai_coaching_escalations (
            conversation_id, user_id, escalation_reason, priority, status
        ) VALUES (
            NEW.id, NEW.user_id, escalation_reason, escalation_priority, 'pending'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for escalation checking
CREATE TRIGGER check_escalation_triggers_trigger
    BEFORE INSERT ON public.ai_coaching_conversations
    FOR EACH ROW EXECUTE FUNCTION check_escalation_triggers();

-- Create view for AI coaching dashboard
CREATE OR REPLACE VIEW public.ai_coaching_dashboard AS
SELECT 
    acc.id as conversation_id,
    acc.user_id,
    p.full_name as user_name,
    p.email as user_email,
    acc.conversation_id as session_id,
    acc.user_message,
    acc.ai_response,
    acc.sentiment,
    acc.needs_escalation,
    acc.escalation_reason,
    acc.escalation_status,
    acc.assigned_mentor_id,
    acc.created_at,
    COUNT(aci.id) as insight_count,
    COUNT(acai.id) as action_item_count
FROM public.ai_coaching_conversations acc
JOIN public.profiles p ON acc.user_id = p.id
LEFT JOIN public.ai_coaching_insights aci ON acc.id = aci.conversation_id
LEFT JOIN public.ai_coaching_action_items acai ON acc.id = acai.conversation_id
GROUP BY acc.id, acc.user_id, p.full_name, p.email, acc.conversation_id, 
         acc.user_message, acc.ai_response, acc.sentiment, acc.needs_escalation,
         acc.escalation_reason, acc.escalation_status, acc.assigned_mentor_id, acc.created_at;

-- Grant permissions
GRANT SELECT ON public.ai_coaching_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_analytics(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION extract_conversation_insights(UUID) TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.ai_coaching_conversations IS 'Stores AI coaching conversations and responses';
COMMENT ON TABLE public.ai_coaching_summaries IS 'Stores AI-generated session summaries';
COMMENT ON TABLE public.ai_coaching_preferences IS 'Stores user preferences for AI coaching';
COMMENT ON TABLE public.ai_coaching_insights IS 'Stores extracted insights from conversations';
COMMENT ON TABLE public.ai_coaching_action_items IS 'Stores action items from AI coaching sessions';
COMMENT ON TABLE public.ai_coaching_escalations IS 'Stores escalation requests for human intervention';
COMMENT ON FUNCTION get_conversation_analytics(UUID, INTEGER) IS 'Returns analytics for user conversations';
COMMENT ON FUNCTION extract_conversation_insights(UUID) IS 'Extracts and stores insights from a conversation';
COMMENT ON VIEW public.ai_coaching_dashboard IS 'Dashboard view for AI coaching conversations with insights';
