// =====================================================
// NEXA CAREER API SERVICE
// =====================================================
// Comprehensive career data integration using multiple APIs
// Provides access to thousands of career paths worldwide

export interface CareerAPIResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  skills: string[];
  education: string[];
  experience: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  growthRate: number;
  demand: 'high' | 'medium' | 'low';
  trending: boolean;
  alternativeTitles: string[];
  relatedCareers: string[];
  workEnvironment: string[];
  personalityTraits: string[];
  dailyTasks: string[];
  careerPath: string[];
  certifications: string[];
  location: string[];
  remote: boolean;
  fullTime: boolean;
  partTime: boolean;
  contract: boolean;
}

export interface CareerSearchFilters {
  query?: string;
  category?: string;
  industry?: string;
  experience?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  education?: string[];
  location?: string;
  remote?: boolean;
  trending?: boolean;
  demand?: 'high' | 'medium' | 'low';
  limit?: number;
  offset?: number;
}

class CareerAPIService {
  private baseURL = 'https://api.careernexa.com'; // Placeholder - will be replaced with actual APIs
  private cache = new Map<string, any>();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  // Primary API: O*NET API (Free, comprehensive)
  private async fetchONETData(socCode?: string): Promise<CareerAPIResponse[]> {
    try {
      const url = socCode 
        ? `https://api.onetcenter.org/ws/online/occupations/${socCode}/details`
        : 'https://api.onetcenter.org/ws/online/occupations';
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NexaPathfinder/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`O*NET API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformONETData(data);
    } catch (error) {
      console.warn('O*NET API unavailable, falling back to local data:', error.message);
      return this.fetchLocalCareerData();
    }
  }

  // Backup API: Job Positions API
  private async fetchJobPositionsAPI(query?: string): Promise<CareerAPIResponse[]> {
    try {
      const url = query 
        ? `https://api.sharpapi.com/job-positions/search?q=${encodeURIComponent(query)}`
        : 'https://api.sharpapi.com/job-positions';
      
      const response = await fetch(url, {
        headers: {
          'X-API-Key': process.env.VITE_SHARPAPI_KEY || '',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Job Positions API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformJobPositionsData(data);
    } catch (error) {
      console.warn('Job Positions API unavailable:', error);
      return this.fetchLocalCareerData();
    }
  }

  // Fallback: Local comprehensive career data
  private async fetchLocalCareerData(): Promise<CareerAPIResponse[]> {
    // This would contain a much larger local dataset
    // For now, we'll return the existing data but expanded
    return this.getExpandedLocalCareers();
  }

  // Transform O*NET data to our format
  private transformONETData(data: any): CareerAPIResponse[] {
    if (!data.occupation || !Array.isArray(data.occupation)) {
      return [];
    }

    return data.occupation.map((occ: any) => ({
      id: occ.code || occ.id,
      title: occ.title || 'Unknown Title',
      description: occ.description || '',
      category: occ.category || 'General',
      industry: occ.industry || 'Various',
      skills: occ.skills || [],
      education: occ.education || [],
      experience: occ.experience || 'Varies',
      salary: {
        min: occ.salary?.min || 0,
        max: occ.salary?.max || 0,
        currency: 'USD'
      },
      growthRate: occ.growthRate || 0,
      demand: occ.demand || 'medium',
      trending: occ.trending || false,
      alternativeTitles: occ.alternativeTitles || [],
      relatedCareers: occ.relatedCareers || [],
      workEnvironment: occ.workEnvironment || [],
      personalityTraits: occ.personalityTraits || [],
      dailyTasks: occ.dailyTasks || [],
      careerPath: occ.careerPath || [],
      certifications: occ.certifications || [],
      location: occ.location || ['Various'],
      remote: occ.remote || false,
      fullTime: occ.fullTime !== false,
      partTime: occ.partTime || false,
      contract: occ.contract || false
    }));
  }

  // Transform Job Positions API data
  private transformJobPositionsData(data: any): CareerAPIResponse[] {
    if (!data.positions || !Array.isArray(data.positions)) {
      return [];
    }

    return data.positions.map((pos: any) => ({
      id: pos.id || pos.title?.toLowerCase().replace(/\s+/g, '-'),
      title: pos.title || 'Unknown Title',
      description: pos.description || '',
      category: pos.category || 'General',
      industry: pos.industry || 'Various',
      skills: pos.skills || [],
      education: pos.education || [],
      experience: pos.experience || 'Varies',
      salary: {
        min: pos.salary?.min || 0,
        max: pos.salary?.max || 0,
        currency: pos.salary?.currency || 'USD'
      },
      growthRate: pos.growthRate || 0,
      demand: pos.demand || 'medium',
      trending: pos.trending || false,
      alternativeTitles: pos.alternativeTitles || [],
      relatedCareers: pos.relatedCareers || [],
      workEnvironment: pos.workEnvironment || [],
      personalityTraits: pos.personalityTraits || [],
      dailyTasks: pos.dailyTasks || [],
      careerPath: pos.careerPath || [],
      certifications: pos.certifications || [],
      location: pos.location || ['Various'],
      remote: pos.remote || false,
      fullTime: pos.fullTime !== false,
      partTime: pos.partTime || false,
      contract: pos.contract || false
    }));
  }

  // Get expanded local career data (much larger dataset)
  private getExpandedLocalCareers(): CareerAPIResponse[] {
    // This would contain thousands of careers
    // For demonstration, returning a sample of expanded data
    return [
      // Technology careers (expanded)
      {
        id: 'software-engineer',
        title: 'Software Engineer',
        description: 'Design, develop, and maintain software applications and systems',
        category: 'Technology',
        industry: 'Software Development',
        skills: ['Programming', 'System Design', 'Problem Solving', 'Algorithms'],
        education: ['Computer Science', 'Software Engineering', 'Bootcamp'],
        experience: '0-5 years',
        salary: { min: 60000, max: 150000, currency: 'USD' },
        growthRate: 22,
        demand: 'high',
        trending: true,
        alternativeTitles: ['Developer', 'Programmer', 'Software Developer'],
        relatedCareers: ['DevOps Engineer', 'Product Manager', 'Technical Lead'],
        workEnvironment: ['Office', 'Remote', 'Hybrid'],
        personalityTraits: ['Analytical', 'Creative', 'Detail-oriented'],
        dailyTasks: ['Code Review', 'Testing', 'Documentation', 'Meetings'],
        careerPath: ['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal'],
        certifications: ['AWS', 'Google Cloud', 'Microsoft Azure'],
        location: ['Global'],
        remote: true,
        fullTime: true,
        partTime: true,
        contract: true
      },
      // Add thousands more careers here...
    ];
  }

  // Main search method
  async searchCareers(filters: CareerSearchFilters = {}): Promise<CareerAPIResponse[]> {
    const cacheKey = JSON.stringify(filters);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      let results: CareerAPIResponse[] = [];

      // Try O*NET API first
      if (filters.query) {
        results = await this.fetchONETData();
      } else {
        results = await this.fetchONETData();
      }

      // If O*NET fails, try Job Positions API
      if (results.length === 0) {
        try {
          results = await this.fetchJobPositionsAPI(filters.query);
        } catch (error) {
          console.warn('Job Positions API failed, using local data:', error.message);
        }
      }

      // If both fail, use local data
      if (results.length === 0) {
        results = await this.fetchLocalCareerData();
      }

      // Apply filters
      results = this.applyFilters(results, filters);

      // Cache results
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error('Career search error:', error);
      return this.fetchLocalCareerData();
    }
  }

  // Apply search filters
  private applyFilters(careers: CareerAPIResponse[], filters: CareerSearchFilters): CareerAPIResponse[] {
    let filtered = [...careers];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(career => 
        career.title.toLowerCase().includes(query) ||
        career.description.toLowerCase().includes(query) ||
        career.skills.some(skill => skill.toLowerCase().includes(query)) ||
        career.alternativeTitles.some(title => title.toLowerCase().includes(query))
      );
    }

    if (filters.category) {
      filtered = filtered.filter(career => 
        career.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters.industry) {
      filtered = filtered.filter(career => 
        career.industry.toLowerCase().includes(filters.industry!.toLowerCase())
      );
    }

    if (filters.experience) {
      filtered = filtered.filter(career => 
        career.experience.toLowerCase().includes(filters.experience!.toLowerCase())
      );
    }

    if (filters.salaryMin) {
      filtered = filtered.filter(career => career.salary.min >= filters.salaryMin!);
    }

    if (filters.salaryMax) {
      filtered = filtered.filter(career => career.salary.max <= filters.salaryMax!);
    }

    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(career => 
        filters.skills!.some(skill => 
          career.skills.some(careerSkill => 
            careerSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    if (filters.trending !== undefined) {
      filtered = filtered.filter(career => career.trending === filters.trending);
    }

    if (filters.demand) {
      filtered = filtered.filter(career => career.demand === filters.demand);
    }

    if (filters.remote !== undefined) {
      filtered = filtered.filter(career => career.remote === filters.remote);
    }

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    
    return filtered.slice(offset, offset + limit);
  }

  // Get career by ID
  async getCareerById(id: string): Promise<CareerAPIResponse | null> {
    const careers = await this.searchCareers({ limit: 1000 });
    return careers.find(career => career.id === id) || null;
  }

  // Get trending careers
  async getTrendingCareers(limit: number = 20): Promise<CareerAPIResponse[]> {
    return this.searchCareers({ trending: true, limit });
  }

  // Get high demand careers
  async getHighDemandCareers(limit: number = 20): Promise<CareerAPIResponse[]> {
    return this.searchCareers({ demand: 'high', limit });
  }

  // Get careers by category
  async getCareersByCategory(category: string, limit: number = 50): Promise<CareerAPIResponse[]> {
    return this.searchCareers({ category, limit });
  }

  // Get career recommendations based on skills
  async getCareerRecommendations(skills: string[], limit: number = 10): Promise<CareerAPIResponse[]> {
    const allCareers = await this.searchCareers({ limit: 1000 });
    
    const scoredCareers = allCareers.map(career => {
      const skillMatches = career.skills.filter(careerSkill => 
        skills.some(userSkill => 
          careerSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
          userSkill.toLowerCase().includes(careerSkill.toLowerCase())
        )
      ).length;
      
      return { career, score: skillMatches };
    });

    return scoredCareers
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.career);
  }

  // Get all available categories
  async getCategories(): Promise<string[]> {
    const careers = await this.searchCareers({ limit: 1000 });
    const categories = new Set(careers.map(career => career.category));
    return Array.from(categories).sort();
  }

  // Get all available industries
  async getIndustries(): Promise<string[]> {
    const careers = await this.searchCareers({ limit: 1000 });
    const industries = new Set(careers.map(career => career.industry));
    return Array.from(industries).sort();
  }

  // Get all available skills
  async getSkills(): Promise<string[]> {
    const careers = await this.searchCareers({ limit: 1000 });
    const skills = new Set(careers.flatMap(career => career.skills));
    return Array.from(skills).sort();
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const careerAPIService = new CareerAPIService();

// Export types and service
export default careerAPIService;
