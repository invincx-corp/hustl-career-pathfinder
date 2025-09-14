-- PHASE 4: FUNCTIONS AND TRIGGERS
-- Database functions and triggers for Phase 4 features

-- Mentor Functions
CREATE OR REPLACE FUNCTION update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.mentor_profiles 
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM public.mentor_reviews 
            WHERE mentor_id = NEW.mentor_id
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM public.mentor_reviews 
            WHERE mentor_id = NEW.mentor_id
        )
    WHERE id = NEW.mentor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_mentor_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.mentor_profiles 
        SET current_students = current_students + 1 
        WHERE id = NEW.mentor_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.mentor_profiles 
        SET current_students = current_students - 1 
        WHERE id = OLD.mentor_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Messaging Functions
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET 
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_message_notifications()
RETURNS TRIGGER AS $$
DECLARE
    participant RECORD;
BEGIN
    -- Create notifications for all participants except the sender
    FOR participant IN 
        SELECT user_id FROM public.conversation_participants 
        WHERE conversation_id = NEW.conversation_id 
        AND user_id != NEW.sender_id 
        AND is_active = true
    LOOP
        INSERT INTO public.message_notifications (
            user_id,
            conversation_id,
            message_id,
            notification_type,
            title,
            message
        ) VALUES (
            participant.user_id,
            NEW.conversation_id,
            NEW.id,
            'new_message',
            'New Message',
            'You have a new message'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove typing indicators older than 30 seconds
    DELETE FROM public.typing_indicators 
    WHERE last_typing_at < NOW() - INTERVAL '30 seconds';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Forum Functions
CREATE OR REPLACE FUNCTION update_forum_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forums 
        SET post_count = post_count + 1 
        WHERE id = NEW.forum_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forums 
        SET post_count = post_count - 1 
        WHERE id = OLD.forum_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_forum_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forum_posts 
        SET 
            reply_count = reply_count + 1,
            last_activity_at = NEW.created_at
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forum_posts 
        SET reply_count = reply_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_forum_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'forum_post_likes' THEN
            UPDATE public.forum_posts 
            SET like_count = like_count + 1 
            WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'forum_reply_likes' THEN
            UPDATE public.forum_post_replies 
            SET like_count = like_count + 1 
            WHERE id = NEW.reply_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'forum_post_likes' THEN
            UPDATE public.forum_posts 
            SET like_count = like_count - 1 
            WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'forum_reply_likes' THEN
            UPDATE public.forum_post_replies 
            SET like_count = like_count - 1 
            WHERE id = OLD.reply_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
DECLARE
    tag_name TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        FOREACH tag_name IN ARRAY NEW.tags
        LOOP
            INSERT INTO public.forum_tags (name, usage_count)
            VALUES (tag_name, 1)
            ON CONFLICT (name) 
            DO UPDATE SET usage_count = forum_tags.usage_count + 1;
        END LOOP;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        FOREACH tag_name IN ARRAY OLD.tags
        LOOP
            UPDATE public.forum_tags 
            SET usage_count = usage_count - 1 
            WHERE name = tag_name;
        END LOOP;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle removed tags
        FOREACH tag_name IN ARRAY OLD.tags
        LOOP
            IF NOT (tag_name = ANY(NEW.tags)) THEN
                UPDATE public.forum_tags 
                SET usage_count = usage_count - 1 
                WHERE name = tag_name;
            END IF;
        END LOOP;
        
        -- Handle new tags
        FOREACH tag_name IN ARRAY NEW.tags
        LOOP
            IF NOT (tag_name = ANY(OLD.tags)) THEN
                INSERT INTO public.forum_tags (name, usage_count)
                VALUES (tag_name, 1)
                ON CONFLICT (name) 
                DO UPDATE SET usage_count = forum_tags.usage_count + 1;
            END IF;
        END LOOP;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_mentor_rating_trigger ON public.mentor_reviews;
DROP TRIGGER IF EXISTS update_mentor_student_count_trigger ON public.mentor_sessions;
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON public.messages;
DROP TRIGGER IF EXISTS create_message_notifications_trigger ON public.messages;
DROP TRIGGER IF EXISTS cleanup_typing_indicators_trigger ON public.typing_indicators;
DROP TRIGGER IF EXISTS update_forum_post_count_trigger ON public.forum_posts;
DROP TRIGGER IF EXISTS update_forum_reply_count_trigger ON public.forum_post_replies;
DROP TRIGGER IF EXISTS update_forum_like_count_trigger ON public.forum_post_likes;
DROP TRIGGER IF EXISTS update_forum_reply_like_count_trigger ON public.forum_reply_likes;
DROP TRIGGER IF EXISTS update_tag_usage_count_trigger ON public.forum_posts;

-- Create triggers
CREATE TRIGGER update_mentor_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.mentor_reviews
    FOR EACH ROW EXECUTE FUNCTION update_mentor_rating();

CREATE TRIGGER update_mentor_student_count_trigger
    AFTER INSERT OR DELETE ON public.mentor_sessions
    FOR EACH ROW EXECUTE FUNCTION update_mentor_student_count();

CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

CREATE TRIGGER create_message_notifications_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION create_message_notifications();

CREATE TRIGGER cleanup_typing_indicators_trigger
    AFTER INSERT OR UPDATE ON public.typing_indicators
    FOR EACH ROW EXECUTE FUNCTION cleanup_typing_indicators();

CREATE TRIGGER update_forum_post_count_trigger
    AFTER INSERT OR DELETE ON public.forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_forum_post_count();

CREATE TRIGGER update_forum_reply_count_trigger
    AFTER INSERT OR DELETE ON public.forum_post_replies
    FOR EACH ROW EXECUTE FUNCTION update_forum_reply_count();

CREATE TRIGGER update_forum_like_count_trigger
    AFTER INSERT OR DELETE ON public.forum_post_likes
    FOR EACH ROW EXECUTE FUNCTION update_forum_like_count();

CREATE TRIGGER update_forum_reply_like_count_trigger
    AFTER INSERT OR DELETE ON public.forum_reply_likes
    FOR EACH ROW EXECUTE FUNCTION update_forum_like_count();

CREATE TRIGGER update_tag_usage_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Success message
SELECT 'Phase 4 functions and triggers setup completed successfully!' as message;
