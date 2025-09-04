import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return { success: false, error: sessionError.message };
    }
    
    console.log('✅ Session check successful:', session?.user?.email || 'No user');
    
    return { success: true, session };
  } catch (error) {
    console.error('❌ Test error:', error);
    return { success: false, error: 'Connection test failed' };
  }
}

export async function testSignIn(email: string, password: string) {
  console.log('🔍 Testing sign in...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Sign in successful:', data.user?.email);
    
    // Test profile fetch
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      return { success: false, error: profileError.message };
    }
    
    console.log('✅ Profile fetch successful:', profile);
    
    return { success: true, user: data.user, profile };
  } catch (error) {
    console.error('❌ Test sign in error:', error);
    return { success: false, error: 'Sign in test failed' };
  }
}
