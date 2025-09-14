// =====================================================
// COMPREHENSIVE SEARCH SERVICE FOR CURIOSITY COMPASS
// =====================================================

import { ApiService } from './api-services';
import { searchCareers, getCareersByDomain } from './universal-career-database';

export interface SearchResult {
  id: string;
  type: 'domain' | 'career' | 'skill' | 'subject';
  title: string;
  description: string;
  category?: string;
  icon?: string;
  color?: string;
  metadata?: {
    salary?: string;
    growth?: number;
    difficulty?: string;
    skills?: string[];
    demand?: string;
  };
}

export interface SearchFilters {
  type?: 'domain' | 'career' | 'skill' | 'subject' | 'all';
  category?: string;
  difficulty?: string;
  demand?: string;
}

export class SearchService {
  private static searchCache = new Map<string, SearchResult[]>();
  private static cacheExpiry = 5 * 60 * 1000; // 5 minutes

  // Main search function that searches across all content types
  static async search(
    query: string, 
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const cacheKey = `${query}-${JSON.stringify(filters)}-${limit}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - (cached as any).timestamp < this.cacheExpiry) {
      return cached;
    }

    try {
      const results: SearchResult[] = [];

      // Search domains
      if (!filters.type || filters.type === 'domain' || filters.type === 'all') {
        const domainResults = await this.searchDomains(query, filters);
        results.push(...domainResults);
      }

      // Search careers
      if (!filters.type || filters.type === 'career' || filters.type === 'all') {
        const careerResults = await this.searchCareers(query, filters);
        results.push(...careerResults);
      }

      // Search skills
      if (!filters.type || filters.type === 'skill' || filters.type === 'all') {
        const skillResults = await this.searchSkills(query, filters);
        results.push(...skillResults);
      }

      // Search subjects/topics
      if (!filters.type || filters.type === 'subject' || filters.type === 'all') {
        const subjectResults = await this.searchSubjects(query, filters);
        results.push(...subjectResults);
      }

      // Sort by relevance and apply limit
      const sortedResults = this.sortByRelevance(results, query).slice(0, limit);
      
      // Cache results
      this.searchCache.set(cacheKey, sortedResults as any);
      
      return sortedResults;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Search career domains
  private static async searchDomains(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      const domainsResult = await ApiService.getCareerDomains();
      if (!domainsResult.success || !domainsResult.data) return [];

      const domains = domainsResult.data;
      const lowercaseQuery = query.toLowerCase();

      return domains
        .filter((domain: any) => {
          const matchesQuery = 
            domain.name.toLowerCase().includes(lowercaseQuery) ||
            domain.description.toLowerCase().includes(lowercaseQuery) ||
            domain.category.toLowerCase().includes(lowercaseQuery) ||
            (domain.typical_roles || []).some((role: string) => 
              role.toLowerCase().includes(lowercaseQuery)
            ) ||
            (domain.required_skills || []).some((skill: string) => 
              skill.toLowerCase().includes(lowercaseQuery)
            );

          const matchesCategory = !filters.category || 
            domain.category.toLowerCase().includes(filters.category.toLowerCase());

          return matchesQuery && matchesCategory;
        })
        .map((domain: any) => ({
          id: domain.id,
          type: 'domain' as const,
          title: domain.name,
          description: domain.description,
          category: domain.category,
          icon: this.getDomainIcon(domain.category),
          color: this.getDomainColor(domain.category),
          metadata: {
            salary: domain.salary_range_min && domain.salary_range_max 
              ? `₹${domain.salary_range_min/100000}L-${domain.salary_range_max/100000}L`
              : undefined,
            growth: domain.growth_rate,
            difficulty: domain.learning_difficulty,
            skills: domain.required_skills || [],
            demand: domain.job_outlook
          }
        }));
    } catch (error) {
      console.error('Error searching domains:', error);
      return [];
    }
  }

  // Search careers
  private static async searchCareers(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // Use universal career database for comprehensive search
      const careers = searchCareers(query);
      const lowercaseQuery = query.toLowerCase();

      return careers
        .filter(career => {
          const matchesQuery = 
            career.name.toLowerCase().includes(lowercaseQuery) ||
            career.description.toLowerCase().includes(lowercaseQuery) ||
            career.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery));

          const matchesDifficulty = !filters.difficulty || career.level === filters.difficulty;
          const matchesDemand = !filters.demand || career.demand === filters.demand;

          return matchesQuery && matchesDifficulty && matchesDemand;
        })
        .map(career => ({
          id: career.id,
          type: 'career' as const,
          title: career.name,
          description: career.description,
          category: this.getCareerCategory(career.name),
          icon: this.getCareerIcon(career.name),
          color: this.getCareerColor(career.name),
          metadata: {
            salary: career.salaryRange,
            growth: parseFloat(career.growthRate.replace('%', '')),
            difficulty: career.level,
            skills: career.skills,
            demand: career.demand
          }
        }));
    } catch (error) {
      console.error('Error searching careers:', error);
      return [];
    }
  }

  // Search skills
  private static async searchSkills(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // Get all skills from domains and careers
      const domainsResult = await ApiService.getCareerDomains();
      const allSkills = new Set<string>();

      if (domainsResult.success && domainsResult.data) {
        domainsResult.data.forEach((domain: any) => {
          (domain.required_skills || []).forEach((skill: string) => allSkills.add(skill));
        });
      }

      // Add skills from universal career database
      const careers = searchCareers(query);
      careers.forEach(career => {
        career.skills.forEach(skill => allSkills.add(skill));
      });

      const lowercaseQuery = query.toLowerCase();
      const matchingSkills = Array.from(allSkills)
        .filter(skill => skill.toLowerCase().includes(lowercaseQuery))
        .slice(0, 10); // Limit to top 10 skills

      return matchingSkills.map(skill => ({
        id: `skill_${skill.toLowerCase().replace(/\s+/g, '_')}`,
        type: 'skill' as const,
        title: skill,
        description: `Skill in ${skill}`,
        category: 'Skills',
        icon: '🎯',
        color: 'bg-purple-500',
        metadata: {
          skills: [skill]
        }
      }));
    } catch (error) {
      console.error('Error searching skills:', error);
      return [];
    }
  }

  // Search subjects/topics
  private static async searchSubjects(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // Define common subjects/topics by domain
      const subjectsByDomain = {
        'Technology': [
          'Web Development', 'Mobile Development', 'AI/ML', 'Data Science', 'Cybersecurity',
          'Cloud Computing', 'DevOps', 'Blockchain', 'IoT', 'Game Development'
        ],
        'Healthcare': [
          'Nursing', 'Medicine', 'Physical Therapy', 'Mental Health', 'Public Health',
          'Medical Technology', 'Pharmacy', 'Dentistry', 'Veterinary', 'Nutrition'
        ],
        'Business': [
          'Marketing', 'Finance', 'Management', 'Entrepreneurship', 'Sales',
          'Human Resources', 'Operations', 'Strategy', 'Consulting', 'Analytics'
        ],
        'Creative Arts': [
          'Graphic Design', 'UI/UX Design', 'Photography', 'Video Production', 'Animation',
          'Writing', 'Music', 'Fine Arts', 'Fashion Design', 'Interior Design'
        ],
        'Education': [
          'Teaching', 'Curriculum Development', 'Educational Technology', 'Special Education',
          'Higher Education', 'Training', 'Counseling', 'Research', 'Administration'
        ]
      };

      const lowercaseQuery = query.toLowerCase();
      const matchingSubjects: SearchResult[] = [];

      Object.entries(subjectsByDomain).forEach(([domain, subjects]) => {
        subjects
          .filter(subject => subject.toLowerCase().includes(lowercaseQuery))
          .forEach(subject => {
            matchingSubjects.push({
              id: `subject_${subject.toLowerCase().replace(/\s+/g, '_')}`,
              type: 'subject' as const,
              title: subject,
              description: `${subject} in ${domain}`,
              category: domain,
              icon: this.getSubjectIcon(subject),
              color: this.getDomainColor(domain),
              metadata: {
                skills: [subject]
              }
            });
          });
      });

      return matchingSubjects.slice(0, 15); // Limit to top 15 subjects
    } catch (error) {
      console.error('Error searching subjects:', error);
      return [];
    }
  }

  // Sort results by relevance
  private static sortByRelevance(results: SearchResult[], query: string): SearchResult[] {
    const lowercaseQuery = query.toLowerCase();
    
    return results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(lowercaseQuery);
      const bTitleMatch = b.title.toLowerCase().includes(lowercaseQuery);
      
      const aDescMatch = a.description.toLowerCase().includes(lowercaseQuery);
      const bDescMatch = b.description.toLowerCase().includes(lowercaseQuery);
      
      // Prioritize title matches over description matches
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      // If both or neither have title matches, check description
      if (aDescMatch && !bDescMatch) return -1;
      if (!aDescMatch && bDescMatch) return 1;
      
      // If relevance is equal, sort by type priority
      const typePriority = { domain: 0, career: 1, skill: 2, subject: 3 };
      return typePriority[a.type] - typePriority[b.type];
    });
  }

  // Helper methods for icons and colors
  private static getDomainIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Technology': '💻',
      'Healthcare': '🏥',
      'Business': '💼',
      'Creative Arts': '🎨',
      'Education': '🎓',
      'Science': '🔬',
      'Engineering': '⚙️',
      'Marketing': '📈',
      'Finance': '💰',
      'Design': '🎨'
    };
    return icons[category] || '🌟';
  }

  private static getDomainColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Technology': 'bg-blue-500',
      'Healthcare': 'bg-red-500',
      'Business': 'bg-yellow-500',
      'Creative Arts': 'bg-pink-500',
      'Education': 'bg-green-500',
      'Science': 'bg-purple-500',
      'Engineering': 'bg-orange-500',
      'Marketing': 'bg-indigo-500',
      'Finance': 'bg-emerald-500',
      'Design': 'bg-rose-500'
    };
    return colors[category] || 'bg-gray-500';
  }

  private static getCareerCategory(careerName: string): string {
    const techCareers = ['Developer', 'Engineer', 'Scientist', 'Analyst', 'Architect'];
    const healthcareCareers = ['Doctor', 'Nurse', 'Therapist', 'Technician', 'Specialist'];
    const businessCareers = ['Manager', 'Analyst', 'Consultant', 'Director', 'Executive'];
    
    if (techCareers.some(term => careerName.includes(term))) return 'Technology';
    if (healthcareCareers.some(term => careerName.includes(term))) return 'Healthcare';
    if (businessCareers.some(term => careerName.includes(term))) return 'Business';
    
    return 'General';
  }

  private static getCareerIcon(careerName: string): string {
    if (careerName.includes('Developer') || careerName.includes('Engineer')) return '💻';
    if (careerName.includes('Designer')) return '🎨';
    if (careerName.includes('Manager') || careerName.includes('Director')) return '👔';
    if (careerName.includes('Analyst')) return '📊';
    if (careerName.includes('Doctor') || careerName.includes('Nurse')) return '🏥';
    return '💼';
  }

  private static getCareerColor(careerName: string): string {
    const category = this.getCareerCategory(careerName);
    return this.getDomainColor(category);
  }

  private static getSubjectIcon(subject: string): string {
    const icons: { [key: string]: string } = {
      'Web Development': '🌐',
      'Mobile Development': '📱',
      'AI/ML': '🤖',
      'Data Science': '📊',
      'Cybersecurity': '🔒',
      'Cloud Computing': '☁️',
      'DevOps': '⚙️',
      'Blockchain': '⛓️',
      'Game Development': '🎮',
      'UI/UX Design': '🎨',
      'Photography': '📸',
      'Video Production': '🎬',
      'Animation': '🎭',
      'Writing': '✍️',
      'Music': '🎵',
      'Teaching': '👨‍🏫',
      'Marketing': '📈',
      'Finance': '💰'
    };
    return icons[subject] || '📚';
  }

  // Clear search cache
  static clearCache(): void {
    this.searchCache.clear();
  }

  // Get search suggestions
  static async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query.trim()) return [];
    
    try {
      const results = await this.search(query, {}, limit);
      return results.map(result => result.title);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }
}
