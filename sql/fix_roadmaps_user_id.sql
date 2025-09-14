-- Fix roadmaps table to allow NULL user_id for anonymous roadmaps
-- This allows roadmaps to be created without requiring user authentication

-- First, drop the NOT NULL constraint
ALTER TABLE public.roadmaps ALTER COLUMN user_id DROP NOT NULL;

-- Update the foreign key constraint to allow NULL
ALTER TABLE public.roadmaps DROP CONSTRAINT IF EXISTS roadmaps_user_id_fkey;
ALTER TABLE public.roadmaps ADD CONSTRAINT roadmaps_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add a check constraint to ensure user_id is either NULL or a valid UUID
ALTER TABLE public.roadmaps ADD CONSTRAINT roadmaps_user_id_check 
    CHECK (user_id IS NULL OR user_id != '00000000-0000-0000-0000-000000000000');

-- Add an index for better performance when querying by user_id
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);

-- Add an index for anonymous roadmaps (user_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_roadmaps_anonymous ON public.roadmaps(user_id) WHERE user_id IS NULL;
