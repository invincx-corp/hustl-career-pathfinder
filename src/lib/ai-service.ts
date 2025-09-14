const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class AIService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api/ai${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async generateRoadmap(goal: string, userProfile: any): Promise<any> {
    try {
      const response = await this.makeRequest('/roadmap/generate', {
        method: 'POST',
        body: JSON.stringify({
          goal,
          userProfile,
          category: 'General',
          difficulty: userProfile?.experience_level || 'beginner'
        }),
      });

      return response.roadmap;
    } catch (error) {
      console.error('Error generating AI roadmap:', error);
      // Fallback to basic roadmap
      return {
        title: `Personalized ${goal} Roadmap`,
        description: `A customized learning path for ${goal}`,
        steps: [
          {
            id: '1',
            title: 'Foundation Concepts',
            description: 'Learn the basics',
            duration: '2-3 weeks',
            type: 'foundation',
            completed: false
          }
        ],
        estimatedTime: '6-8 weeks',
        difficulty: 'beginner',
        skills: ['Skill 1', 'Skill 2'],
        category: 'General'
      };
    }
  }

  async analyzeInterestPatterns(profile: any): Promise<any> {
    try {
      const response = await this.makeRequest('/coach/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Analyze my interest patterns and provide career suggestions',
          context: { userProfile: profile },
          userId: profile?.id
        }),
      });

      return {
        top_interests: profile?.interests || [],
        learning_style: 'balanced',
        career_suggestions: response.response?.suggestions || [],
        next_steps: response.response?.actionItems || ['Explore career domains', 'Take skill assessment']
      };
    } catch (error) {
      console.error('Error analyzing interest patterns:', error);
      return {
        top_interests: profile?.interests || [],
        learning_style: 'balanced',
        career_suggestions: [],
        next_steps: ['Explore career domains', 'Take skill assessment']
      };
    }
  }

  async generateResumeContent(data: any): Promise<any> {
    try {
      const response = await this.makeRequest('/coach/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Help me generate resume content based on my profile',
          context: { userProfile: data },
          userId: data?.id
        }),
      });

      return {
        summary: response.response?.content || 'Dedicated professional committed to continuous learning',
        experience: data?.experience || [],
        education: data?.education || [],
        skills: data?.skills || {},
        achievements: response.response?.suggestions || []
      };
    } catch (error) {
      console.error('Error generating resume content:', error);
      return {
        summary: 'Dedicated professional committed to continuous learning',
        experience: data?.experience || [],
        education: data?.education || [],
        skills: data?.skills || {},
        achievements: []
      };
    }
  }

  async getPersonalizedRecommendations(userId: string, type: string = 'all'): Promise<any> {
    try {
      const response = await this.makeRequest(`/recommendations/${userId}?type=${type}`);
      return response.recommendations;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return {
        courses: [],
        projects: [],
        resources: [],
        mentors: []
      };
    }
  }

  async getCareerPathSuggestions(userProfile: any): Promise<any> {
    try {
      const response = await this.makeRequest('/career/paths', {
        method: 'POST',
        body: JSON.stringify({
          userId: userProfile?.id,
          interests: userProfile?.interests || [],
          skills: userProfile?.skills || [],
          goals: userProfile?.goals || [],
          experienceLevel: userProfile?.experience_level || 'beginner'
        }),
      });

      return response.careerPaths;
    } catch (error) {
      console.error('Error getting career path suggestions:', error);
      return [];
    }
  }

  async analyzeSkillGaps(currentSkills: string[], targetRole: string, userProfile: any): Promise<any> {
    try {
      const response = await this.makeRequest('/skills/analyze', {
        method: 'POST',
        body: JSON.stringify({
          userId: userProfile?.id,
          currentSkills,
          targetRole,
          userProfile
        }),
      });

      return response.analysis;
    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      return {
        missingSkills: [],
        prioritySkills: [],
        learningPath: [],
        estimatedTime: '6-12 months',
        currentSkillLevel: 0,
        recommendations: []
      };
    }
  }

  async getProjectSuggestions(userProfile: any, projectType: string = 'all'): Promise<any> {
    try {
      const response = await this.makeRequest('/projects/suggestions', {
        method: 'POST',
        body: JSON.stringify({
          userProfile,
          projectType
        }),
      });

      return response.suggestions;
    } catch (error) {
      console.error('Error getting project suggestions:', error);
      return { projects: [] };
    }
  }

  async getReviewFeedback(projectData: any, reviewCriteria: any): Promise<any> {
    try {
      const response = await this.makeRequest('/reviews/feedback', {
        method: 'POST',
        body: JSON.stringify({
          projectData,
          reviewCriteria
        }),
      });

      return response.feedback;
    } catch (error) {
      console.error('Error getting review feedback:', error);
      return {
        overallScore: 7,
        strengths: ['Good project structure'],
        improvements: ['Add more error handling'],
        technicalFeedback: 'The project shows good understanding of the technologies used.',
        suggestions: ['Add unit tests'],
        nextSteps: ['Refactor code for better maintainability'],
        constructiveCriticism: 'This is a solid project with room for improvement.'
      };
    }
  }
}
