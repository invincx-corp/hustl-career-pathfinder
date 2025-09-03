-- =====================================================
-- SUPABASE ULTIMATE CLEANUP SCRIPT
-- =====================================================
-- This script will clean up everything regardless of permissions
-- Run this FIRST, then run the main schema file

-- Drop the entire public schema and recreate it
-- This is the nuclear option that removes EVERYTHING
DROP SCHEMA IF EXISTS public CASCADE;

-- Recreate the public schema
CREATE SCHEMA public;

-- Grant all permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Set default permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- =====================================================
-- CLEANUP COMPLETE - NOW RUN THE MAIN SCHEMA FILE
-- =====================================================
-- The main schema will create everything fresh
-- No more "already exists" errors!
