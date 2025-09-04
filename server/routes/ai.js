import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// AI Roadmap Generation
router.post('/roadmap/generate', async (req, res) => {
  try {
    const { userId, goal, category, difficulty, userProfile } = req.body;
    
    // Get user profile from database if not provided
    let profile = userProfile;
    if (!profile && userId) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        return res.status(404).json({ error: 'User not found' });
      }
      profile = profileData;
    }

    // Generate AI roadmap using the frontend AI provider logic
    const roadmap = await generateAIRoadmap(goal, profile);
    
    // Save roadmap to user's profile
    if (userId) {
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('selected_roadmaps')
        .eq('id', userId)
        .single();

      if (!profileError) {
        const roadmaps = currentProfile.selected_roadmaps || [];
        const newRoadmap = {
          id: `roadmap-${Date.now()}`,
          title: goal,
          goal,
          category: category || 'General',
          difficulty: difficulty || 'beginner',
          steps: roadmap.steps,
          estimatedTime: roadmap.estimatedTime,
          skills: roadmap.skills,
          currentStep: 0,
          progressPercentage: 0,
          status: 'active',
          aiGenerated: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        roadmaps.push(newRoadmap);

        await supabase
          .from('profiles')
          .update({ 
            selected_roadmaps: roadmaps,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }
    }

    res.json({ 
      success: true, 
      roadmap,
      message: 'AI roadmap generated successfully' 
    });
  } catch (error) {
    console.error('Error generating AI roadmap:', error);
    res.status(500).json({ error: 'Failed to generate AI roadmap' });
  }
});

// AI Skill Gap Analysis
router.post('/skills/analyze', async (req, res) => {
  try {
    const { userId, currentSkills, targetRole, userProfile } = req.body;
    
    // Get user profile from database if not provided
    let profile = userProfile;
    if (!profile && userId) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('skills, goals, experience_level')
        .eq('id', userId)
        .single();

      if (profileError) {
        return res.status(404).json({ error: 'User not found' });
      }
      profile = profileData;
    }

    const userSkills = currentSkills || profile?.skills || [];
    const analysis = await generateSkillGapAnalysis(userSkills, targetRole, profile);

    res.json({ 
      success: true, 
      analysis,
      message: 'Skill gap analysis completed successfully' 
    });
  } catch (error) {
    console.error('Error analyzing skill gaps:', error);
    res.status(500).json({ error: 'Failed to analyze skill gaps' });
  }
});

// AI Career Coach Chat
router.post('/coach/chat', async (req, res) => {
  try {
    const { userId, message, context } = req.body;
    
    // Get user profile and context
    let userContext = context || {};
    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profileError) {
        userContext = {
          ...userContext,
          userProfile: profile,
          currentSkills: profile.skills || [],
          goals: profile.goals || [],
          experienceLevel: profile.experience_level || 'beginner'
        };
      }
    }

    // Generate AI coach response
    const response = await generateCoachResponse(message, userContext);

    // Log the conversation (you might want to create a conversations table)
    if (userId) {
      // Update last activity
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    }

    res.json({ 
      success: true, 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing coach chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// AI Learning Recommendations
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'all' } = req.query;
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate personalized recommendations
    const recommendations = await generatePersonalizedRecommendations(profile, type);

    res.json({ 
      success: true, 
      recommendations,
      message: 'Personalized recommendations generated successfully' 
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// AI Career Path Suggestions
router.post('/career/paths', async (req, res) => {
  try {
    const { userId, interests, skills, goals, experienceLevel } = req.body;
    
    // Get user profile if userId provided
    let userProfile = { interests, skills, goals, experienceLevel };
    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('interests, skills, goals, experience_level')
        .eq('id', userId)
        .single();

      if (!profileError) {
        userProfile = {
          interests: interests || profile.interests || [],
          skills: skills || profile.skills || [],
          goals: goals || profile.goals || [],
          experienceLevel: experienceLevel || profile.experience_level || 'beginner'
        };
      }
    }

    // Generate career path suggestions
    const careerPaths = await generateCareerPathSuggestions(userProfile);

    res.json({ 
      success: true, 
      careerPaths,
      message: 'Career path suggestions generated successfully' 
    });
  } catch (error) {
    console.error('Error generating career paths:', error);
    res.status(500).json({ error: 'Failed to generate career paths' });
  }
});

// Helper functions that implement the AI logic
async function generateAIRoadmap(goal, userProfile) {
  // This would integrate with the AI provider from the frontend
  // For now, we'll use a sophisticated simulation based on the goal and profile
  
  const skillCategories = {
    'frontend': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Responsive Design'],
    'backend': ['Node.js', 'Python', 'Database Design', 'API Development', 'Server Management'],
    'fullstack': ['Frontend Skills', 'Backend Skills', 'Database Management', 'DevOps Basics'],
    'data': ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization'],
    'design': ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
    'mobile': ['React Native', 'Flutter', 'iOS Development', 'Android Development', 'Mobile Design']
  };

  const goalLower = goal.toLowerCase();
  let relevantSkills = [];
  let category = 'General';

  // Determine category and skills based on goal
  if (goalLower.includes('frontend') || goalLower.includes('web design')) {
    category = 'Frontend Development';
    relevantSkills = skillCategories.frontend;
  } else if (goalLower.includes('backend') || goalLower.includes('server')) {
    category = 'Backend Development';
    relevantSkills = skillCategories.backend;
  } else if (goalLower.includes('fullstack') || goalLower.includes('full stack')) {
    category = 'Full Stack Development';
    relevantSkills = skillCategories.fullstack;
  } else if (goalLower.includes('data') || goalLower.includes('analytics')) {
    category = 'Data Science';
    relevantSkills = skillCategories.data;
  } else if (goalLower.includes('design') || goalLower.includes('ui') || goalLower.includes('ux')) {
    category = 'Design';
    relevantSkills = skillCategories.design;
  } else if (goalLower.includes('mobile') || goalLower.includes('app')) {
    category = 'Mobile Development';
    relevantSkills = skillCategories.mobile;
  }

  // Generate steps based on skills and user profile
  const steps = relevantSkills.map((skill, index) => ({
    id: (index + 1).toString(),
    title: `Learn ${skill}`,
    description: `Master the fundamentals of ${skill} and apply them in practical projects`,
    duration: index < 2 ? '2-3 weeks' : '3-4 weeks',
    type: index < 2 ? 'foundation' : 'advanced',
    completed: false,
    resources: [
      {
        title: `${skill} Fundamentals Course`,
        type: 'course',
        duration: '10 hours',
        difficulty: 'beginner'
      },
      {
        title: `${skill} Practice Project`,
        type: 'project',
        duration: '1 week',
        difficulty: 'intermediate'
      }
    ]
  }));

  // Add final project step
  steps.push({
    id: (steps.length + 1).toString(),
    title: 'Capstone Project',
    description: `Build a comprehensive ${category.toLowerCase()} project that showcases all your skills`,
    duration: '4-6 weeks',
    type: 'capstone',
    completed: false,
    resources: [
      {
        title: 'Project Planning Guide',
        type: 'guide',
        duration: '2 hours',
        difficulty: 'intermediate'
      }
    ]
  });

  return {
    steps,
    estimatedTime: `${Math.ceil(steps.length * 3)}-${Math.ceil(steps.length * 4)} weeks`,
    difficulty: userProfile?.experience_level || 'beginner',
    skills: relevantSkills,
    category
  };
}

async function generateSkillGapAnalysis(currentSkills, targetRole, userProfile) {
  const roleSkillRequirements = {
    'frontend developer': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Git'],
    'backend developer': ['Node.js', 'Python', 'SQL', 'API Development', 'Database Design', 'Git'],
    'full stack developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    'data scientist': ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization', 'Jupyter'],
    'ui/ux designer': ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'],
    'mobile developer': ['React Native', 'Flutter', 'iOS Development', 'Android Development', 'Mobile Design']
  };

  const requiredSkills = roleSkillRequirements[targetRole.toLowerCase()] || [];
  const userSkillsLower = (currentSkills || []).map(skill => skill.toLowerCase());
  
  const missingSkills = requiredSkills.filter(skill => 
    !userSkillsLower.some(userSkill => 
      userSkill.includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(userSkill)
    )
  );

  const prioritySkills = missingSkills.slice(0, 3); // Top 3 priority skills
  
  const learningPath = prioritySkills.map(skill => ({
    skill,
    estimatedTime: '3-4 weeks',
    difficulty: 'intermediate',
    resources: [
      { type: 'course', title: `${skill} Fundamentals` },
      { type: 'project', title: `${skill} Practice Project` },
      { type: 'certification', title: `${skill} Certification` }
    ]
  }));

  return {
    missingSkills,
    prioritySkills,
    learningPath,
    estimatedTime: `${Math.ceil(missingSkills.length * 3)}-${Math.ceil(missingSkills.length * 4)} months`,
    currentSkillLevel: Math.round((requiredSkills.length - missingSkills.length) / requiredSkills.length * 100),
    recommendations: [
      `Focus on ${prioritySkills[0]} first as it's fundamental to ${targetRole}`,
      'Build practical projects to reinforce learning',
      'Consider getting certified in your priority skills'
    ]
  };
}

async function generateCoachResponse(message, context) {
  const { userProfile, currentSkills, goals, experienceLevel } = context;
  
  // Analyze the message to determine the type of question
  const messageLower = message.toLowerCase();
  
  let response = '';
  let suggestions = [];
  let actionItems = [];

  if (messageLower.includes('learn') || messageLower.includes('study')) {
    response = `Great question about learning! Based on your current skills in ${(currentSkills || []).join(', ')}, I recommend focusing on building a strong foundation first.`;
    suggestions = [
      { title: 'Create a learning schedule', type: 'action', description: 'Set aside dedicated time each day' },
      { title: 'Find a study buddy', type: 'action', description: 'Connect with other learners' },
      { title: 'Join online communities', type: 'action', description: 'Get support from experienced developers' }
    ];
  } else if (messageLower.includes('career') || messageLower.includes('job')) {
    response = `Career planning is exciting! With your ${experienceLevel || 'beginner'} level and interests in ${(goals || []).join(', ')}, you have several promising paths ahead.`;
    suggestions = [
      { title: 'Build a portfolio', type: 'action', description: 'Showcase your projects and skills' },
      { title: 'Network with professionals', type: 'action', description: 'Connect with people in your target field' },
      { title: 'Apply for internships', type: 'action', description: 'Gain real-world experience' }
    ];
  } else if (messageLower.includes('stuck') || messageLower.includes('difficult')) {
    response = `It's completely normal to feel stuck sometimes! Every developer faces challenges. The key is to break problems into smaller pieces and keep moving forward.`;
    suggestions = [
      { title: 'Take a break', type: 'action', description: 'Sometimes stepping away helps' },
      { title: 'Ask for help', type: 'action', description: 'Reach out to mentors or communities' },
      { title: 'Review fundamentals', type: 'action', description: 'Go back to basics if needed' }
    ];
  } else {
    response = `That's a thoughtful question! I'm here to help you navigate your learning journey. Whether it's choosing the right path, overcoming challenges, or planning your career, we can work through it together.`;
    suggestions = [
      { title: 'Set clear goals', type: 'action', description: 'Define what you want to achieve' },
      { title: 'Create a roadmap', type: 'action', description: 'Plan your learning journey' },
      { title: 'Track your progress', type: 'action', description: 'Monitor your development' }
    ];
  }

  // Add personalized action items based on user profile
  if (currentSkills && currentSkills.length > 0) {
    actionItems.push({
      id: Date.now().toString(),
      title: 'Practice current skills',
      type: 'learning',
      dueDate: 'This week',
      priority: 'high',
      estimatedTime: '2 hours'
    });
  }

  if (goals && goals.length > 0) {
    actionItems.push({
      id: (Date.now() + 1).toString(),
      title: 'Work towards career goals',
      type: 'career',
      dueDate: 'This month',
      priority: 'medium',
      estimatedTime: '1 hour'
    });
  }

  return {
    content: response,
    suggestions,
    actionItems,
    context: {
      userLevel: experienceLevel || 'beginner',
      skillCount: (currentSkills || []).length,
      goalCount: (goals || []).length
    }
  };
}

async function generatePersonalizedRecommendations(profile, type) {
  const { skills, interests, goals, experience_level } = profile;
  
  const recommendations = {
    courses: [],
    projects: [],
    resources: [],
    mentors: []
  };

  // Course recommendations based on skills and goals
  if (type === 'all' || type === 'courses') {
    recommendations.courses = [
      {
        id: '1',
        title: 'Advanced JavaScript Concepts',
        provider: 'Nexa Learning',
        duration: '6 weeks',
        difficulty: 'intermediate',
        matchScore: 95,
        description: 'Deep dive into advanced JavaScript patterns and modern development practices'
      },
      {
        id: '2',
        title: 'React Best Practices',
        provider: 'Nexa Learning',
        duration: '4 weeks',
        difficulty: 'intermediate',
        matchScore: 90,
        description: 'Learn industry-standard React patterns and performance optimization'
      }
    ];
  }

  // Project recommendations
  if (type === 'all' || type === 'projects') {
    recommendations.projects = [
      {
        id: '1',
        title: 'Personal Portfolio Website',
        description: 'Build a responsive portfolio showcasing your skills and projects',
        difficulty: 'beginner',
        estimatedTime: '2-3 weeks',
        skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
        matchScore: 85
      },
      {
        id: '2',
        title: 'Task Management App',
        description: 'Create a full-stack application for managing personal tasks',
        difficulty: 'intermediate',
        estimatedTime: '4-6 weeks',
        skills: ['React', 'Node.js', 'Database', 'API Development'],
        matchScore: 92
      }
    ];
  }

  // Resource recommendations
  if (type === 'all' || type === 'resources') {
    recommendations.resources = [
      {
        id: '1',
        title: 'JavaScript MDN Documentation',
        type: 'documentation',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        description: 'Comprehensive JavaScript reference and guides',
        matchScore: 88
      },
      {
        id: '2',
        title: 'React Official Tutorial',
        type: 'tutorial',
        url: 'https://react.dev/learn',
        description: 'Official React learning path and tutorials',
        matchScore: 90
      }
    ];
  }

  return recommendations;
}

async function generateCareerPathSuggestions(userProfile) {
  const { interests, skills, goals, experienceLevel } = userProfile;
  
  const careerPaths = [
    {
      id: '1',
      title: 'Frontend Developer',
      description: 'Build user-facing web applications and interfaces',
      matchScore: 85,
      requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
      currentSkills: (skills || []).filter(skill => 
        ['HTML', 'CSS', 'JavaScript', 'React'].some(req => 
          skill.toLowerCase().includes(req.toLowerCase())
        )
      ),
      missingSkills: ['HTML', 'CSS', 'JavaScript', 'React'].filter(req => 
        !(skills || []).some(skill => 
          skill.toLowerCase().includes(req.toLowerCase())
        )
      ),
      salaryRange: { min: 50000, max: 100000, currency: 'USD' },
      growth: 'High',
      timeline: '6-12 months'
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      description: 'Develop both frontend and backend applications',
      matchScore: 78,
      requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Database'],
      currentSkills: (skills || []).filter(skill => 
        ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Database'].some(req => 
          skill.toLowerCase().includes(req.toLowerCase())
        )
      ),
      missingSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Database'].filter(req => 
        !(skills || []).some(skill => 
          skill.toLowerCase().includes(req.toLowerCase())
        )
      ),
      salaryRange: { min: 60000, max: 120000, currency: 'USD' },
      growth: 'Very High',
      timeline: '8-15 months'
    }
  ];

  // Sort by match score
  careerPaths.sort((a, b) => b.matchScore - a.matchScore);

  return careerPaths;
}

export default router;
