-- PHASE 4: MESSAGING SYSTEM DATABASE SCHEMA
-- Direct messaging system between users

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT CHECK (type IN ('direct', 'group', 'mentor_session')) DEFAULT 'direct',
    title TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'member', 'mentor', 'student')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'system', 'mentor_note')) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Create message read status table
CREATE TABLE IF NOT EXISTS public.message_read_status (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS public.typing_indicators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_typing BOOLEAN DEFAULT TRUE,
    last_typing_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create message notifications table
CREATE TABLE IF NOT EXISTS public.message_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT CHECK (notification_type IN ('new_message', 'mention', 'reaction', 'reply')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation settings table
CREATE TABLE IF NOT EXISTS public.conversation_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_muted BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    notification_settings JSONB DEFAULT '{"new_messages": true, "mentions": true, "reactions": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_type ON public.conversations(type);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at);

CREATE INDEX idx_conversation_participants_conversation ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_active ON public.conversation_participants(is_active);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_type ON public.messages(message_type);
CREATE INDEX idx_messages_reply_to ON public.messages(reply_to_id);

CREATE INDEX idx_message_attachments_message ON public.message_attachments(message_id);

CREATE INDEX idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX idx_message_reactions_user ON public.message_reactions(user_id);

CREATE INDEX idx_message_read_status_message ON public.message_read_status(message_id);
CREATE INDEX idx_message_read_status_user ON public.message_read_status(user_id);

CREATE INDEX idx_typing_indicators_conversation ON public.typing_indicators(conversation_id);
CREATE INDEX idx_typing_indicators_user ON public.typing_indicators(user_id);

CREATE INDEX idx_message_notifications_user ON public.message_notifications(user_id);
CREATE INDEX idx_message_notifications_read ON public.message_notifications(is_read);
CREATE INDEX idx_message_notifications_created_at ON public.message_notifications(created_at);

CREATE INDEX idx_conversation_settings_conversation ON public.conversation_settings(conversation_id);
CREATE INDEX idx_conversation_settings_user ON public.conversation_settings(user_id);

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can join conversations" ON public.conversation_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON public.conversation_participants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

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

CREATE POLICY "Users can create attachments for their messages" ON public.message_attachments
    FOR INSERT WITH CHECK (
        message_id IN (
            SELECT id FROM public.messages 
            WHERE sender_id = auth.uid()
        )
    );

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

CREATE POLICY "Users can create reactions" ON public.message_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.message_reactions
    FOR DELETE USING (auth.uid() = user_id);

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

CREATE POLICY "Users can update their read status" ON public.message_read_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view typing indicators in their conversations" ON public.typing_indicators
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update their typing status" ON public.typing_indicators
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications" ON public.message_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.message_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view settings for their conversations" ON public.conversation_settings
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update their conversation settings" ON public.conversation_settings
    FOR ALL USING (auth.uid() = user_id);

-- Functions
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

-- Triggers
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

CREATE TRIGGER create_message_notifications_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION create_message_notifications();

CREATE TRIGGER cleanup_typing_indicators_trigger
    AFTER INSERT OR UPDATE ON public.typing_indicators
    FOR EACH ROW EXECUTE FUNCTION cleanup_typing_indicators();

-- Sample data
INSERT INTO public.conversations (type, title) VALUES
('direct', 'Direct Message'),
('group', 'Study Group Chat'),
('mentor_session', 'Mentor Session');

-- Success message
SELECT 'Messaging system database setup completed successfully!' as message;