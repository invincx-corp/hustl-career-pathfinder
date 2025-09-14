// Mock data service for development and testing
export const mockData = {
  users: [
    {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: null,
      created_at: new Date().toISOString(),
      user_metadata: {
        age: '20-25',
        interests: ['Technology', 'Learning', 'Career Development'],
        goals: ['Become a Software Engineer', 'Learn React', 'Build Projects'],
        experience_level: 'beginner',
        skills: ['HTML', 'CSS', 'JavaScript']
      }
    }
  ],

  roadmaps: [
    {
      id: '1',
      user_id: '1',
      title: 'Frontend Development Path',
      description: 'Complete roadmap to become a frontend developer',
      category: 'Web Development',
      progress: 45,
      status: 'in_progress',
      steps: [
        { id: '1', title: 'Learn HTML & CSS', completed: true, duration: '2 weeks' },
        { id: '2', title: 'Master JavaScript', completed: true, duration: '4 weeks' },
        { id: '3', title: 'Learn React', completed: false, duration: '6 weeks' },
        { id: '4', title: 'Build Projects', completed: false, duration: '4 weeks' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  projects: [
    {
      id: '1',
      user_id: '1',
      title: 'Personal Portfolio',
      description: 'A responsive portfolio website built with React',
      status: 'completed',
      technologies: ['React', 'CSS', 'JavaScript'],
      github_url: 'https://github.com/example/portfolio',
      live_url: 'https://example.com',
      created_at: new Date().toISOString()
    }
  ],

  skills: [
    {
      id: '1',
      user_id: '1',
      skill_name: 'JavaScript',
      level: 7,
      category: 'Programming',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: '1',
      skill_name: 'React',
      level: 5,
      category: 'Frontend',
      created_at: new Date().toISOString()
    }
  ],

  achievements: [
    {
      id: '1',
      user_id: '1',
      title: 'First Project',
      description: 'Completed your first coding project',
      points: 100,
      type: 'milestone',
      earned_at: new Date().toISOString()
    }
  ],

  notifications: [
    {
      id: '1',
      user_id: '1',
      title: 'Welcome to Nexa Pathfinder!',
      message: 'Start your learning journey by completing the onboarding.',
      type: 'welcome',
      read: false,
      created_at: new Date().toISOString()
    }
  ]
};

// Mock API responses
export const mockResponses = {
  getUserProfile: (userId) => {
    const user = mockData.users.find(u => u.id === userId);
    return user ? { success: true, data: user } : { success: false, error: 'User not found' };
  },

  getDashboardData: (userId) => {
    const user = mockData.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    const userRoadmaps = mockData.roadmaps.filter(r => r.user_id === userId);
    const userProjects = mockData.projects.filter(p => p.user_id === userId);
    const userSkills = mockData.skills.filter(s => s.user_id === userId);
    const userAchievements = mockData.achievements.filter(a => a.user_id === userId);

    return {
      success: true,
      data: {
        user,
        roadmaps: userRoadmaps,
        projects: userProjects,
        skills: userSkills,
        achievements: userAchievements,
        stats: {
          totalRoadmaps: userRoadmaps.length,
          completedRoadmaps: userRoadmaps.filter(r => r.status === 'completed').length,
          totalProjects: userProjects.length,
          completedProjects: userProjects.filter(p => p.status === 'completed').length,
          totalSkills: userSkills.length,
          totalPoints: userAchievements.reduce((sum, a) => sum + a.points, 0)
        }
      }
    };
  },

  getRoadmaps: (userId) => {
    const roadmaps = mockData.roadmaps.filter(r => r.user_id === userId);
    return { success: true, data: roadmaps };
  },

  getProjects: (userId) => {
    const projects = mockData.projects.filter(p => p.user_id === userId);
    return { success: true, data: projects };
  },

  getSkills: (userId) => {
    const skills = mockData.skills.filter(s => s.user_id === userId);
    return { success: true, data: skills };
  },

  getNotifications: (userId) => {
    const notifications = mockData.notifications.filter(n => n.user_id === userId);
    return { success: true, data: notifications };
  }
};

export default mockData;










