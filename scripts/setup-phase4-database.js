#!/usr/bin/env node

/**
 * Phase 4 Database Setup Script
 * Sets up all database tables, indexes, and policies for Phase 4: Mentorship & Community
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPhase4Database() {
  try {
    console.log('🚀 Starting Phase 4 Database Setup...');
    console.log('📋 Setting up: Mentorship & Community features');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'setup-phase4-database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📖 Reading SQL file...');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Skip empty statements and comments
        if (!statement || statement.startsWith('--')) {
          continue;
        }
        
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation already exists')) {
            console.log(`⚠️  Statement ${i + 1}: ${error.message}`);
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1} failed:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Setup Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Phase 4 Database Setup Completed Successfully!');
      console.log('\n📋 What was created:');
      console.log('   • Mentor profiles and specializations');
      console.log('   • Mentor availability and session management');
      console.log('   • AI conversation and coaching systems');
      console.log('   • Community features (profiles, messaging, forums)');
      console.log('   • Study groups and peer review systems');
      console.log('   • All necessary indexes and RLS policies');
      console.log('   • Sample data for testing');
    } else {
      console.log('\n⚠️  Setup completed with some errors. Check the logs above.');
    }
    
  } catch (error) {
    console.error('💥 Fatal error during setup:', error);
    process.exit(1);
  }
}

// Run the setup
setupPhase4Database();
