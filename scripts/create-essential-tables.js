#!/usr/bin/env node

/**
 * Create Essential Tables Script for Nexa Platform
 * This script creates the essential tables needed for authentication
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createEssentialTables() {
  console.log('🚀 Creating essential tables for Nexa...\n');

  try {
    // Test connection first
    console.log('🔍 Testing Supabase connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.message !== 'Auth session missing!') {
      console.error('❌ Connection test failed:', authError.message);
      return;
    }
    
    console.log('✅ Supabase connection successful');

    // Since we can't create tables via the client API, we need to provide instructions
    console.log('\n📋 IMPORTANT: You need to create the database tables manually in Supabase.');
    console.log('\n🔧 Here\'s what you need to do:');
    console.log('\n1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to the SQL Editor (left sidebar)');
    console.log('4. Copy and paste the following SQL:');
    
    console.log('\n' + '='.repeat(80));
    console.log('-- ESSENTIAL TABLES FOR NEXA PLATFORM');
    console.log('='.repeat(80));
    
    const essentialSQL = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    age INTEGER CHECK (age >= 13 AND age <= 100),
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    country TEXT,
    city TEXT,
    timezone TEXT DEFAULT 'UTC',
    
    -- Career & Learning Profile
    interests JSONB DEFAULT '[]',
    skills JSONB DEFAULT '[]',
    goals JSONB DEFAULT '[]',
    experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    preferred_learning_style TEXT CHECK (preferred_learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
    
    -- Compliance & Safety
    requires_parental_consent BOOLEAN DEFAULT FALSE,
    parental_consent_given BOOLEAN DEFAULT FALSE,
    parental_email TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE,
    privacy_policy_accepted BOOLEAN DEFAULT FALSE,
    marketing_emails_consent BOOLEAN DEFAULT FALSE,
    
    -- Onboarding & Status
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    selected_roadmaps JSONB DEFAULT '[]',
    skill_assessment_results JSONB DEFAULT '{}',
    is_mentor BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Role-Based Access Control
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin', 'recruiter', 'moderator')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, age, interests, goals, experience_level, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        (NEW.raw_user_meta_data->>'age')::integer,
        COALESCE(NEW.raw_user_meta_data->'interests', '[]'::jsonb),
        COALESCE(NEW.raw_user_meta_data->'goals', '[]'::jsonb),
        COALESCE(NEW.raw_user_meta_data->>'experience_level', 'beginner'),
        'student'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

    console.log(essentialSQL);
    console.log('\n' + '='.repeat(80));
    
    console.log('\n5. Click "Run" to execute the SQL');
    console.log('6. Wait for the tables to be created');
    console.log('7. Come back and test the authentication');
    
    console.log('\n🎯 After creating the tables, your authentication should work!');
    console.log('\n📝 The tables created will include:');
    console.log('   - profiles (user profiles)');
    console.log('   - Proper RLS policies');
    console.log('   - Automatic profile creation on signup');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the setup
createEssentialTables();
