#!/usr/bin/env node

/**
 * Simple Database Setup Script for Nexa Platform
 * This script sets up the basic database schema in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
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
    // Read the complete schema file
    const schemaPath = path.join(__dirname, '..', 'supabase-complete-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Executing database schema...');
    
    // Split the schema into individual statements and execute them
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        // Skip comments and empty statements
        if (statement.trim().startsWith('--') || statement.trim().length === 0) {
          continue;
        }

        const { error } = await supabase.rpc('exec', { sql: statement });
        if (error) {
          // Some errors are expected (like "already exists")
          if (!error.message.includes('already exists') && !error.message.includes('does not exist')) {
            console.error(`❌ Error executing statement: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error executing statement: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`✅ Executed ${successCount} statements successfully`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements had errors (this might be normal for existing objects)`);
    }

    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'profiles', 'roadmaps', 'projects', 'mentors', 'chat_conversations',
        'skill_categories', 'skills', 'achievements', 'notifications'
      ]);

    if (tablesError) {
      console.error('❌ Error verifying tables:', tablesError.message);
    } else {
      console.log(`✅ Found ${tables.length} core tables created`);
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // Insert sample data
    console.log('\n🌱 Inserting sample data...');
    await insertSampleData();

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test the authentication flow');
    console.log('   2. Verify the dashboard loads correctly');
    console.log('   3. Test user registration and onboarding');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

async function insertSampleData() {
  try {
    // Insert sample skill categories
    const { error: categoriesError } = await supabase
      .from('skill_categories')
      .upsert([
        { name: 'Programming', description: 'Software development and coding skills', color_hex: '#3B82F6' },
        { name: 'Design', description: 'UI/UX design and creative skills', color_hex: '#8B5CF6' },
        { name: 'Data Science', description: 'Data analysis and machine learning', color_hex: '#10B981' },
        { name: 'Marketing', description: 'Digital marketing and growth skills', color_hex: '#F59E0B' },
        { name: 'Business', description: 'Entrepreneurship and business skills', color_hex: '#EF4444' }
      ], { onConflict: 'name' });

    if (categoriesError) {
      console.log('⚠️  Could not insert skill categories:', categoriesError.message);
    } else {
      console.log('✅ Sample skill categories inserted');
    }

    // Insert sample career domains
    const { error: domainsError } = await supabase
      .from('career_domains')
      .upsert([
        {
          name: 'Web Development',
          description: 'Build websites and web applications',
          category: 'Technology',
          typical_roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer'],
          required_skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
          learning_difficulty: 'beginner',
          time_to_proficiency_months: 12
        },
        {
          name: 'Data Science',
          description: 'Analyze data to extract insights and build predictive models',
          category: 'Technology',
          typical_roles: ['Data Scientist', 'Data Analyst', 'ML Engineer'],
          required_skills: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization'],
          learning_difficulty: 'intermediate',
          time_to_proficiency_months: 18
        }
      ], { onConflict: 'name' });

    if (domainsError) {
      console.log('⚠️  Could not insert career domains:', domainsError.message);
    } else {
      console.log('✅ Sample career domains inserted');
    }

  } catch (error) {
    console.log('⚠️  Error inserting sample data:', error.message);
  }
}

// Run the setup
setupDatabase();



