-- FINAL FIX: Proper RLS policies to prevent infinite recursion
-- Run this in your Supabase SQL Editor to fix the infinite recursion issue

-- Step 1: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Step 2: Create proper, safe RLS policies
CREATE POLICY "profiles_select_policy" ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Clean up any problematic data
DELETE FROM public.profiles 
WHERE id NOT IN (
  SELECT id FROM auth.users
);

-- Step 5: Ensure all profiles have proper defaults
UPDATE public.profiles 
SET 
  role = COALESCE(role, 'student'),
  selected_roadmaps = COALESCE(selected_roadmaps, '[]'::jsonb),
  interests = COALESCE(interests, '{}'),
  skills = COALESCE(skills, '{}'),
  goals = COALESCE(goals, '{}'),
  experience_level = COALESCE(experience_level, 'beginner'),
  onboarding_completed = COALESCE(onboarding_completed, false),
  onboarding_step = COALESCE(onboarding_step, 0),
  terms_accepted = COALESCE(terms_accepted, false),
  privacy_policy_accepted = COALESCE(privacy_policy_accepted, false),
  is_active = COALESCE(is_active, true)
WHERE 
  role IS NULL OR 
  selected_roadmaps IS NULL OR 
  interests IS NULL OR 
  skills IS NULL OR 
  goals IS NULL OR 
  experience_level IS NULL OR 
  onboarding_completed IS NULL OR 
  onboarding_step IS NULL OR 
  terms_accepted IS NULL OR 
  privacy_policy_accepted IS NULL OR 
  is_active IS NULL;

-- Step 6: Add unique constraints to prevent duplicates
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_email_unique;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Step 7: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Step 8: Verify the fix
SELECT 
  COUNT(*) as total_profiles,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(DISTINCT id) as unique_ids
FROM public.profiles;
