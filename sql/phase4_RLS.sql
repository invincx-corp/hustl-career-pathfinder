-- PHASE 4: RLS POLICIES
-- Row Level Security policies for all Phase 4 tables

-- Mentor Profiles Policies
DROP POLICY IF EXISTS "Users can view public mentor profiles" ON public.mentor_profiles;
CREATE POLICY "Users can view public mentor profiles" ON public.mentor_profiles
    FOR SELECT USING (is_verified = true AND is_available = true);

DROP POLICY IF EXISTS "Users can view their own mentor profile" ON public.mentor_profiles;
CREATE POLICY "Users can view their own mentor profile" ON public.mentor_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own mentor profile" ON public.mentor_profiles;
CREATE POLICY "Users can create their own mentor profile" ON public.mentor_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own mentor profile" ON public.mentor_profiles;
CREATE POLICY "Users can update their own mentor profile" ON public.mentor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all mentor profiles" ON public.mentor_profiles;
CREATE POLICY "Admins can view all mentor profiles" ON public.mentor_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Mentor Specializations Policies
DROP POLICY IF EXISTS "Users can view mentor specializations" ON public.mentor_specializations;
CREATE POLICY "Users can view mentor specializations" ON public.mentor_specializations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mentors can manage their specializations" ON public.mentor_specializations;
CREATE POLICY "Mentors can manage their specializations" ON public.mentor_specializations
    FOR ALL USING (
        mentor_id IN (
            SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()
        )
    );

-- Mentor Sessions Policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.mentor_sessions;
CREATE POLICY "Users can view their own sessions" ON public.mentor_sessions
    FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = student_id);

DROP POLICY IF EXISTS "Mentors can create sessions" ON public.mentor_sessions;
CREATE POLICY "Mentors can create sessions" ON public.mentor_sessions
    FOR INSERT WITH CHECK (
        mentor_id IN (
            SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their sessions" ON public.mentor_sessions;
CREATE POLICY "Users can update their sessions" ON public.mentor_sessions
    FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- Mentor Reviews Policies
DROP POLICY IF EXISTS "Users can view mentor reviews" ON public.mentor_reviews;
CREATE POLICY "Users can view mentor reviews" ON public.mentor_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can create reviews" ON public.mentor_reviews;
CREATE POLICY "Students can create reviews" ON public.mentor_reviews
    FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.mentor_reviews;
CREATE POLICY "Users can update their own reviews" ON public.mentor_reviews
    FOR UPDATE USING (auth.uid() = student_id);

-- Conversations Policies
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);

-- Conversation Participants Policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;
CREATE POLICY "Users can join conversations" ON public.conversation_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their participation" ON public.conversation_participants;
CREATE POLICY "Users can update their participation" ON public.conversation_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- Messages Policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
CREATE POLICY "Users can create messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Message Attachments Policies
DROP POLICY IF EXISTS "Users can view attachments for their messages" ON public.message_attachments;
CREATE POLICY "Users can view attachments for their messages" ON public.message_attachments
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM public.messages 
            WHERE conversation_id IN (
                SELECT conversation_id FROM public.conversation_participants 
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

DROP POLICY IF EXISTS "Users can create attachments for their messages" ON public.message_attachments;
CREATE POLICY "Users can create attachments for their messages" ON public.message_attachments
    FOR INSERT WITH CHECK (
        message_id IN (
            SELECT id FROM public.messages 
            WHERE sender_id = auth.uid()
        )
    );

-- Message Reactions Policies
DROP POLICY IF EXISTS "Users can view reactions in their conversations" ON public.message_reactions;
CREATE POLICY "Users can view reactions in their conversations" ON public.message_reactions
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM public.messages 
            WHERE conversation_id IN (
                SELECT conversation_id FROM public.conversation_participants 
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

DROP POLICY IF EXISTS "Users can create reactions" ON public.message_reactions;
CREATE POLICY "Users can create reactions" ON public.message_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.message_reactions;
CREATE POLICY "Users can delete their own reactions" ON public.message_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Message Read Status Policies
DROP POLICY IF EXISTS "Users can view read status for their conversations" ON public.message_read_status;
CREATE POLICY "Users can view read status for their conversations" ON public.message_read_status
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM public.messages 
            WHERE conversation_id IN (
                SELECT conversation_id FROM public.conversation_participants 
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

DROP POLICY IF EXISTS "Users can update their read status" ON public.message_read_status;
CREATE POLICY "Users can update their read status" ON public.message_read_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Typing Indicators Policies
DROP POLICY IF EXISTS "Users can view typing indicators in their conversations" ON public.typing_indicators;
CREATE POLICY "Users can view typing indicators in their conversations" ON public.typing_indicators
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can update their typing status" ON public.typing_indicators;
CREATE POLICY "Users can update their typing status" ON public.typing_indicators
    FOR ALL USING (auth.uid() = user_id);

-- Message Notifications Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.message_notifications;
CREATE POLICY "Users can view their own notifications" ON public.message_notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.message_notifications;
CREATE POLICY "Users can update their notifications" ON public.message_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Conversation Settings Policies
DROP POLICY IF EXISTS "Users can view settings for their conversations" ON public.conversation_settings;
CREATE POLICY "Users can view settings for their conversations" ON public.conversation_settings
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can update their conversation settings" ON public.conversation_settings;
CREATE POLICY "Users can update their conversation settings" ON public.conversation_settings
    FOR ALL USING (auth.uid() = user_id);

-- Forums Policies
DROP POLICY IF EXISTS "Users can view public forums" ON public.forums;
CREATE POLICY "Users can view public forums" ON public.forums
    FOR SELECT USING (is_public = true AND is_active = true);

DROP POLICY IF EXISTS "Users can view forums they created" ON public.forums;
CREATE POLICY "Users can view forums they created" ON public.forums
    FOR SELECT USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can create forums" ON public.forums;
CREATE POLICY "Users can create forums" ON public.forums
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Forum creators can update their forums" ON public.forums;
CREATE POLICY "Forum creators can update their forums" ON public.forums
    FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Forum moderators can update forums" ON public.forums;
CREATE POLICY "Forum moderators can update forums" ON public.forums
    FOR UPDATE USING (
        id IN (
            SELECT forum_id FROM public.forum_moderators 
            WHERE user_id = auth.uid()
        )
    );

-- Forum Categories Policies
DROP POLICY IF EXISTS "Users can view forum categories" ON public.forum_categories;
CREATE POLICY "Users can view forum categories" ON public.forum_categories
    FOR SELECT USING (is_active = true);

-- Forum Posts Policies
DROP POLICY IF EXISTS "Users can view posts in public forums" ON public.forum_posts;
CREATE POLICY "Users can view posts in public forums" ON public.forum_posts
    FOR SELECT USING (
        forum_id IN (
            SELECT id FROM public.forums WHERE is_public = true AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can view their own posts" ON public.forum_posts;
CREATE POLICY "Users can view their own posts" ON public.forum_posts
    FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can create posts" ON public.forum_posts;
CREATE POLICY "Users can create posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.forum_posts;
CREATE POLICY "Users can update their own posts" ON public.forum_posts
    FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Forum moderators can update posts" ON public.forum_posts;
CREATE POLICY "Forum moderators can update posts" ON public.forum_posts
    FOR UPDATE USING (
        forum_id IN (
            SELECT forum_id FROM public.forum_moderators 
            WHERE user_id = auth.uid()
        )
    );

-- Forum Post Replies Policies
DROP POLICY IF EXISTS "Users can view replies to accessible posts" ON public.forum_post_replies;
CREATE POLICY "Users can view replies to accessible posts" ON public.forum_post_replies
    FOR SELECT USING (
        post_id IN (
            SELECT id FROM public.forum_posts 
            WHERE forum_id IN (
                SELECT id FROM public.forums WHERE is_public = true AND is_active = true
            )
        )
    );

DROP POLICY IF EXISTS "Users can create replies" ON public.forum_post_replies;
CREATE POLICY "Users can create replies" ON public.forum_post_replies
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own replies" ON public.forum_post_replies;
CREATE POLICY "Users can update their own replies" ON public.forum_post_replies
    FOR UPDATE USING (auth.uid() = author_id);

-- Forum Likes Policies
DROP POLICY IF EXISTS "Users can view likes" ON public.forum_post_likes;
CREATE POLICY "Users can view likes" ON public.forum_post_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own likes" ON public.forum_post_likes;
CREATE POLICY "Users can create their own likes" ON public.forum_post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON public.forum_post_likes;
CREATE POLICY "Users can delete their own likes" ON public.forum_post_likes
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view reply likes" ON public.forum_reply_likes;
CREATE POLICY "Users can view reply likes" ON public.forum_reply_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own reply likes" ON public.forum_reply_likes;
CREATE POLICY "Users can create their own reply likes" ON public.forum_reply_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reply likes" ON public.forum_reply_likes;
CREATE POLICY "Users can delete their own reply likes" ON public.forum_reply_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Forum Subscriptions Policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.forum_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.forum_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.forum_subscriptions;
CREATE POLICY "Users can create their own subscriptions" ON public.forum_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.forum_subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON public.forum_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.forum_subscriptions;
CREATE POLICY "Users can delete their own subscriptions" ON public.forum_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Forum Bookmarks Policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.forum_post_bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON public.forum_post_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.forum_post_bookmarks;
CREATE POLICY "Users can create their own bookmarks" ON public.forum_post_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.forum_post_bookmarks;
CREATE POLICY "Users can delete their own bookmarks" ON public.forum_post_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Forum Notifications Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.forum_notifications;
CREATE POLICY "Users can view their own notifications" ON public.forum_notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.forum_notifications;
CREATE POLICY "Users can update their own notifications" ON public.forum_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Forum Tags Policies
DROP POLICY IF EXISTS "Users can view forum tags" ON public.forum_tags;
CREATE POLICY "Users can view forum tags" ON public.forum_tags
    FOR SELECT USING (true);

-- Forum Post Views Policies
DROP POLICY IF EXISTS "Users can view post views" ON public.forum_post_views;
CREATE POLICY "Users can view post views" ON public.forum_post_views
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create post views" ON public.forum_post_views;
CREATE POLICY "Users can create post views" ON public.forum_post_views
    FOR INSERT WITH CHECK (true);

-- Success message
SELECT 'Phase 4 RLS policies setup completed successfully!' as message;
