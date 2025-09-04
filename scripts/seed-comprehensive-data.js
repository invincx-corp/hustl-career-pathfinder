/**
 * Comprehensive Seed Data Script for Nexa Platform
 * This script creates realistic test data for development and testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample data arrays
const sampleUsers = [
  {
    email: 'student1@nexa.com',
    full_name: 'Alice Johnson',
    username: 'alice_j',
    age: 20,
    interests: ['technology', 'web-development', 'design'],
    skills: ['javascript', 'react', 'css'],
    goals: ['become-fullstack-developer', 'get-internship'],
    experience_level: 'beginner',
    role: 'student'
  },
  {
    email: 'student2@nexa.com',
    full_name: 'Bob Smith',
    username: 'bob_smith',
    age: 22,
    interests: ['data-science', 'machine-learning', 'analytics'],
    skills: ['python', 'sql', 'statistics'],
    goals: ['data-scientist-career', 'learn-ml'],
    experience_level: 'intermediate',
    role: 'student'
  },
  {
    email: 'mentor1@nexa.com',
    full_name: 'Dr. Sarah Chen',
    username: 'sarah_chen',
    age: 35,
    interests: ['technology', 'leadership', 'mentoring'],
    skills: ['fullstack-development', 'team-leadership', 'architecture'],
    goals: ['mentor-students', 'share-knowledge'],
    experience_level: 'advanced',
    role: 'mentor',
    is_mentor: true
  },
  {
    email: 'mentor2@nexa.com',
    full_name: 'Michael Rodriguez',
    username: 'mike_rodriguez',
    age: 42,
    interests: ['data-science', 'ai', 'research'],
    skills: ['machine-learning', 'deep-learning', 'research'],
    goals: ['mentor-ai-students', 'research-collaboration'],
    experience_level: 'advanced',
    role: 'mentor',
    is_mentor: true
  },
  {
    email: 'recruiter1@nexa.com',
    full_name: 'Jennifer Lee',
    username: 'jen_lee',
    age: 30,
    interests: ['talent-acquisition', 'hr', 'networking'],
    skills: ['recruitment', 'interviewing', 'talent-assessment'],
    goals: ['find-great-talent', 'build-relationships'],
    experience_level: 'advanced',
    role: 'recruiter'
  },
  {
    email: 'admin@nexa.com',
    full_name: 'Admin User',
    username: 'admin',
    age: 28,
    interests: ['platform-management', 'user-experience'],
    skills: ['system-administration', 'user-management'],
    goals: ['platform-growth', 'user-satisfaction'],
    experience_level: 'advanced',
    role: 'admin'
  }
];

const sampleRoadmaps = [
  {
    title: 'Full-Stack Web Development',
    description: 'Complete roadmap to become a full-stack web developer',
    goal: 'Become a proficient full-stack developer',
    category: 'technology',
    difficulty: 'intermediate',
    skills_to_learn: ['html', 'css', 'javascript', 'react', 'nodejs', 'mongodb'],
    prerequisites: ['basic-programming', 'computer-literacy'],
    steps: [
      { title: 'Learn HTML & CSS', description: 'Master the basics of web markup and styling', estimated_time: '2 weeks' },
      { title: 'JavaScript Fundamentals', description: 'Learn JavaScript programming basics', estimated_time: '3 weeks' },
      { title: 'React Development', description: 'Build interactive user interfaces with React', estimated_time: '4 weeks' },
      { title: 'Backend with Node.js', description: 'Create server-side applications', estimated_time: '3 weeks' },
      { title: 'Database Integration', description: 'Connect your app to databases', estimated_time: '2 weeks' }
    ],
    estimated_total_time: '14 weeks',
    is_public: true
  },
  {
    title: 'Data Science Career Path',
    description: 'Comprehensive roadmap for aspiring data scientists',
    goal: 'Become a data scientist',
    category: 'data-science',
    difficulty: 'advanced',
    skills_to_learn: ['python', 'statistics', 'machine-learning', 'sql', 'data-visualization'],
    prerequisites: ['mathematics', 'programming-basics'],
    steps: [
      { title: 'Python for Data Science', description: 'Learn Python programming for data analysis', estimated_time: '4 weeks' },
      { title: 'Statistics & Probability', description: 'Master statistical concepts', estimated_time: '3 weeks' },
      { title: 'Data Manipulation', description: 'Learn pandas, numpy, and data cleaning', estimated_time: '2 weeks' },
      { title: 'Machine Learning', description: 'Introduction to ML algorithms', estimated_time: '5 weeks' },
      { title: 'Data Visualization', description: 'Create compelling data visualizations', estimated_time: '2 weeks' }
    ],
    estimated_total_time: '16 weeks',
    is_public: true
  }
];

const sampleProjects = [
  {
    title: 'Personal Portfolio Website',
    description: 'Build a responsive portfolio website to showcase your work',
    category: 'web-development',
    difficulty: 'beginner',
    skills_required: ['html', 'css', 'javascript'],
    skills_learned: ['responsive-design', 'git', 'deployment'],
    estimated_time: '2 weeks',
    is_public: true
  },
  {
    title: 'E-commerce Dashboard',
    description: 'Create an admin dashboard for an e-commerce platform',
    category: 'web-development',
    difficulty: 'intermediate',
    skills_required: ['react', 'nodejs', 'mongodb'],
    skills_learned: ['fullstack-development', 'api-design', 'authentication'],
    estimated_time: '4 weeks',
    is_public: true
  },
  {
    title: 'Customer Churn Prediction',
    description: 'Build a machine learning model to predict customer churn',
    category: 'data-science',
    difficulty: 'advanced',
    skills_required: ['python', 'machine-learning', 'pandas'],
    skills_learned: ['classification', 'feature-engineering', 'model-evaluation'],
    estimated_time: '3 weeks',
    is_public: true
  }
];

const sampleOpportunities = [
  {
    title: 'Frontend Developer Intern',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'internship',
    category: 'web-development',
    description: 'Join our team as a frontend developer intern and work on cutting-edge web applications',
    requirements: ['react', 'javascript', 'css'],
    salary_range: '$3000-4000/month',
    application_deadline: '2024-03-15',
    is_active: true
  },
  {
    title: 'Data Science Associate',
    company: 'DataFlow Solutions',
    location: 'New York, NY',
    type: 'full-time',
    category: 'data-science',
    description: 'Work with our data science team to build predictive models and insights',
    requirements: ['python', 'machine-learning', 'sql'],
    salary_range: '$80000-100000/year',
    application_deadline: '2024-04-01',
    is_active: true
  },
  {
    title: 'Full-Stack Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'full-time',
    category: 'web-development',
    description: 'Join our fast-growing startup as a full-stack developer',
    requirements: ['react', 'nodejs', 'mongodb', 'aws'],
    salary_range: '$70000-90000/year',
    application_deadline: '2024-03-30',
    is_active: true
  }
];

const sampleMentors = [
  {
    full_name: 'Dr. Sarah Chen',
    email: 'sarah.chen@mentor.com',
    username: 'sarah_chen_mentor',
    bio: 'Senior Software Engineer with 10+ years of experience in full-stack development',
    expertise_areas: ['web-development', 'javascript', 'react', 'nodejs'],
    experience_years: 10,
    hourly_rate: 75,
    availability: 'weekdays-evenings',
    languages: ['english', 'mandarin'],
    is_verified: true,
    rating: 4.9,
    total_sessions: 150
  },
  {
    full_name: 'Michael Rodriguez',
    email: 'michael.rodriguez@mentor.com',
    username: 'mike_rodriguez_mentor',
    bio: 'Data Science Lead with expertise in ML and AI. PhD in Computer Science',
    expertise_areas: ['data-science', 'machine-learning', 'python', 'ai'],
    experience_years: 8,
    hourly_rate: 100,
    availability: 'weekends',
    languages: ['english', 'spanish'],
    is_verified: true,
    rating: 4.8,
    total_sessions: 120
  }
];

// Helper function to create user profiles
async function createUserProfiles() {
  console.log('🌱 Creating user profiles...');
  
  for (const userData of sampleUsers) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          ...userData,
          onboarding_completed: true,
          onboarding_step: 100,
          terms_accepted: true,
          privacy_policy_accepted: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      } else {
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      }
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }
}

// Helper function to create roadmaps
async function createRoadmaps() {
  console.log('🌱 Creating roadmaps...');
  
  // Get user IDs for roadmaps
  const { data: users } = await supabase
    .from('profiles')
    .select('id, role')
    .in('role', ['student', 'mentor', 'admin']);

  if (!users || users.length === 0) {
    console.log('⚠️ No users found, skipping roadmaps creation');
    return;
  }

  for (const roadmapData of sampleRoadmaps) {
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .insert([{
          ...roadmapData,
          user_id: users[0].id, // Assign to first user
          total_steps: roadmapData.steps.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error(`❌ Error creating roadmap ${roadmapData.title}:`, error.message);
      } else {
        console.log(`✅ Created roadmap: ${roadmapData.title}`);
      }
    } catch (error) {
      console.error(`❌ Error creating roadmap ${roadmapData.title}:`, error);
    }
  }
}

// Helper function to create projects
async function createProjects() {
  console.log('🌱 Creating projects...');
  
  const { data: users } = await supabase
    .from('profiles')
    .select('id')
    .limit(3);

  if (!users || users.length === 0) {
    console.log('⚠️ No users found, skipping projects creation');
    return;
  }

  for (let i = 0; i < sampleProjects.length; i++) {
    const projectData = sampleProjects[i];
    const userId = users[i % users.length].id;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          user_id: userId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error(`❌ Error creating project ${projectData.title}:`, error.message);
      } else {
        console.log(`✅ Created project: ${projectData.title}`);
      }
    } catch (error) {
      console.error(`❌ Error creating project ${projectData.title}:`, error);
    }
  }
}

// Helper function to create opportunities
async function createOpportunities() {
  console.log('🌱 Creating opportunities...');
  
  const { data: recruiters } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'recruiter');

  if (!recruiters || recruiters.length === 0) {
    console.log('⚠️ No recruiters found, skipping opportunities creation');
    return;
  }

  for (const opportunityData of sampleOpportunities) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert([{
          ...opportunityData,
          posted_by: recruiters[0].id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error(`❌ Error creating opportunity ${opportunityData.title}:`, error.message);
      } else {
        console.log(`✅ Created opportunity: ${opportunityData.title}`);
      }
    } catch (error) {
      console.error(`❌ Error creating opportunity ${opportunityData.title}:`, error);
    }
  }
}

// Helper function to create mentors
async function createMentors() {
  console.log('🌱 Creating mentor profiles...');
  
  const { data: mentorUsers } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('role', 'mentor');

  if (!mentorUsers || mentorUsers.length === 0) {
    console.log('⚠️ No mentor users found, skipping mentor profiles creation');
    return;
  }

  for (let i = 0; i < sampleMentors.length && i < mentorUsers.length; i++) {
    const mentorData = sampleMentors[i];
    const mentorUser = mentorUsers[i];

    try {
      const { data, error } = await supabase
        .from('mentors')
        .insert([{
          ...mentorData,
          user_id: mentorUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error(`❌ Error creating mentor ${mentorData.full_name}:`, error.message);
      } else {
        console.log(`✅ Created mentor: ${mentorData.full_name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating mentor ${mentorData.full_name}:`, error);
    }
  }
}

// Main seeding function
async function seedDatabase() {
  console.log('🚀 Starting comprehensive database seeding...');
  console.log('=====================================');

  try {
    // Create user profiles
    await createUserProfiles();
    
    // Create roadmaps
    await createRoadmaps();
    
    // Create projects
    await createProjects();
    
    // Create opportunities
    await createOpportunities();
    
    // Create mentors
    await createMentors();

    console.log('=====================================');
    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Created:');
    console.log(`   - ${sampleUsers.length} user profiles`);
    console.log(`   - ${sampleRoadmaps.length} roadmaps`);
    console.log(`   - ${sampleProjects.length} projects`);
    console.log(`   - ${sampleOpportunities.length} opportunities`);
    console.log(`   - ${sampleMentors.length} mentor profiles`);
    console.log('');
    console.log('🔑 Test Accounts:');
    console.log('   - student1@nexa.com (Student)');
    console.log('   - mentor1@nexa.com (Mentor)');
    console.log('   - recruiter1@nexa.com (Recruiter)');
    console.log('   - admin@nexa.com (Admin)');
    console.log('');
    console.log('💡 Note: These are test accounts. Use your own signup flow for real users.');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
