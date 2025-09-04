const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPhase3Database() {
  try {
    console.log('🚀 Setting up Phase 3 database...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-phase3-database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }
    
    console.log('✅ Phase 3 database setup completed successfully!');
    console.log('📊 Created tables:');
    console.log('   - learning_content');
    console.log('   - user_progress');
    console.log('   - badges');
    console.log('   - user_badges');
    console.log('   - offline_content');
    console.log('   - projects');
    console.log('   - project_team_members');
    console.log('   - project_templates');
    console.log('   - project_reviews');
    console.log('   - resume_sections');
    console.log('   - resume_analytics');
    console.log('   - resume_templates');
    console.log('🎯 Sample data inserted for badges, templates, and learning content');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupPhase3Database();
