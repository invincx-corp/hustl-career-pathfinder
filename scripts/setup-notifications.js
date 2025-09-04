const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupNotifications() {
  console.log('🚀 Setting up notification system...');

  try {
    // Read and execute the SQL migration
    const fs = require('fs');
    const path = require('path');
    
    const sqlPath = path.join(__dirname, 'add-notification-settings-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing notification settings migration...');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error executing migration:', error);
      return;
    }

    console.log('✅ Notification settings table created successfully');

    // Test the notification service
    console.log('🧪 Testing notification system...');
    
    // Get a test user
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.log('⚠️  No users found to test with. Please create a user account first.');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Testing with user: ${testUser.full_name} (${testUser.email})`);

    // Check if notifications exist
    const { data: notifications, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUser.id)
      .limit(5);

    if (notificationError) {
      console.error('❌ Error fetching notifications:', notificationError);
      return;
    }

    console.log(`📬 Found ${notifications?.length || 0} notifications for test user`);

    // Check notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', testUser.id)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('❌ Error fetching notification settings:', settingsError);
      return;
    }

    if (settings) {
      console.log('⚙️  Notification settings found for test user');
    } else {
      console.log('⚠️  No notification settings found for test user (will use defaults)');
    }

    console.log('✅ Notification system setup complete!');
    console.log('');
    console.log('🎉 What you can do now:');
    console.log('1. The bell icon in the top navigation now shows real-time notifications');
    console.log('2. Visit /achievements to see your achievement system');
    console.log('3. Visit /notifications to manage all your notifications');
    console.log('4. Notifications will update in real-time as you use the platform');
    console.log('');
    console.log('💡 Pro tip: The notification system uses Supabase real-time subscriptions');
    console.log('   to provide instant updates without page refreshes!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupNotifications();
