// =====================================================
// FIX ONBOARDING DATABASE SCRIPT
// =====================================================
// Run this script to fix the missing selected_roadmaps column
// This script can be run in the browser console or as a Node.js script

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://rolhokxettlvjcysbdki.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbGhva3hldHRsdmpjeXNiZGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTgwMTMsImV4cCI6MjA3MjI5NDAxM30.0NS-noCHSuBWJUm_0279JW7oEt0FIKtlpYEBu9155p0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOnboardingDatabase() {
  console.log('🔧 Fixing onboarding database...');
  
  try {
    // Check if the column exists by trying to query it
    const { data, error } = await supabase
      .from('profiles')
      .select('selected_roadmaps')
      .limit(1);

    if (error && error.message.includes('selected_roadmaps')) {
      console.log('❌ selected_roadmaps column not found. Please run the SQL migration:');
      console.log(`
-- Run this in Supabase SQL Editor:
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_roadmaps JSONB DEFAULT '[]';

UPDATE public.profiles 
SET selected_roadmaps = '[]' 
WHERE selected_roadmaps IS NULL;
      `);
      return false;
    } else if (error) {
      console.error('❌ Error checking database:', error);
      return false;
    } else {
      console.log('✅ selected_roadmaps column exists!');
      
      // Test updating a profile with selected_roadmaps
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ selected_roadmaps: [] })
          .eq('id', user.id);
          
        if (updateError) {
          console.error('❌ Error updating profile:', updateError);
          return false;
        } else {
          console.log('✅ Profile update test successful!');
        }
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the fix
fixOnboardingDatabase().then(success => {
  if (success) {
    console.log('🎉 Database is ready for onboarding!');
  } else {
    console.log('⚠️ Please run the SQL migration in Supabase SQL Editor');
  }
});

export { fixOnboardingDatabase };
