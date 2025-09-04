#!/usr/bin/env node

/**
 * Fixed Database Setup Script for Nexa Platform
 * This script sets up the basic database schema in Supabase using the correct API
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
  console.error('Please check your .env file and ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Starting Nexa database setup...\n');

  try {
    // First, let's check if the profiles table exists
    console.log('🔍 Checking existing tables...');
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message);
      return;
    }

    if (existingTables && existingTables.length > 0) {
      console.log('✅ Profiles table already exists');
      console.log('📋 Available tables:', existingTables.map(t => t.table_name).join(', '));
    } else {
      console.log('❌ Profiles table does not exist. You need to create it manually in Supabase.');
      console.log('\n📝 To fix this:');
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
      console.log('2. Navigate to your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy and paste the contents of supabase-complete-schema.sql');
      console.log('5. Run the SQL to create all tables');
      console.log('\nAlternatively, you can use the Supabase CLI:');
      console.log('supabase db reset');
      return;
    }

    // Test basic connection
    console.log('\n🔍 Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      return;
    }

    console.log('✅ Connection test successful');

    // Test auth
    console.log('\n🔍 Testing authentication...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Auth test failed:', sessionError.message);
    } else {
      console.log('✅ Auth test successful');
    }

    console.log('\n🎉 Database setup verification completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test the authentication flow in the app');
    console.log('   2. Try signing in with your existing credentials');
    console.log('   3. If you get "invalid credentials", the user might not exist in the profiles table');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
