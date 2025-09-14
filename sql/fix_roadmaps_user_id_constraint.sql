-- Fix roadmaps table to allow NULL user_id for anonymous users
-- This allows roadmap generation for users who haven't logged in yet

-- First, check if the constraint exists
DO $$
BEGIN
    -- Check if the NOT NULL constraint exists on user_id column
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'roadmaps' 
        AND tc.constraint_type = 'CHECK'
        AND ccu.column_name = 'user_id'
    ) THEN
        -- Drop the existing NOT NULL constraint
        ALTER TABLE public.roadmaps DROP CONSTRAINT IF EXISTS roadmaps_user_id_check;
    END IF;
END $$;

-- Make user_id column nullable
ALTER TABLE public.roadmaps 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a comment to explain the change
COMMENT ON COLUMN public.roadmaps.user_id IS 'User ID for logged-in users, NULL for anonymous users';

-- Verify the change
SELECT 
    column_name, 
    is_nullable, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'roadmaps' 
AND column_name = 'user_id';
