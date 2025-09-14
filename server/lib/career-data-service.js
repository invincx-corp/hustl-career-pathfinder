// Career Data Service using Google APIs
// Generates real-time career information, market data, and industry insights

import GoogleAPIsService from './google-apis-service.js';

class CareerDataService {
  constructor() {
    this.googleAPIsService = new GoogleAPIsService();
    
    // Cache for career data
    this.cache = new Map();
    this.cacheTimeout = 60 * 60 * 1000; // 1 hour
  }

  // Generate real-time career cards using Google APIs
  async generateCareerCards(domain, userProfile, count = 25) {
    try {
      console.log(`🔍 Generating real-time career cards for domain: ${domain}`);
      
      const cacheKey = `career_cards_${domain}_${count}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        console.log('📋 Using cached career cards');
        return cached;
      }

      // Search for career information using Google APIs
      const careerQueries = this.generateCareerQueries(domain, userProfile);
      const allResults = [];

      for (const query of careerQueries) {
        try {
          const results = await this.googleAPIsService.searchPersonalizedLearningMaterials(
            query, domain, 'career', 'intermediate', userProfile
          );
          allResults.push(...results);
        } catch (error) {
          console.log(`Search failed for query: ${query}`, error.message);
        }
      }

      // Generate career cards from search results
      const careerCards = await this.generateCareerCardsFromResults(allResults, domain, userProfile, count);
      
      // Cache the results
      this.setCachedResult(cacheKey, careerCards);
      
      return careerCards;
    } catch (error) {
      console.error('Error generating career cards:', error);
      throw error;
    }
  }

  // Generate career search queries
  generateCareerQueries(domain, userProfile) {
    const baseQueries = [
      `${domain} careers job opportunities`,
      `${domain} career paths salary ranges`,
      `${domain} skills required job market`,
      `${domain} industry trends 2024`,
      `${domain} entry level jobs requirements`,
      `${domain} senior roles responsibilities`,
      `${domain} remote work opportunities`,
      `${domain} career growth prospects`
    ];

    // Add user-specific queries
    if (userProfile?.interests?.length > 0) {
      userProfile.interests.forEach(interest => {
        baseQueries.push(`${domain} ${interest} career opportunities`);
      });
    }

    if (userProfile?.skills?.length > 0) {
      userProfile.skills.forEach(skill => {
        baseQueries.push(`${domain} ${skill} jobs career paths`);
      });
    }

    return baseQueries;
  }

  // Generate career cards from search results
  async generateCareerCardsFromResults(results, domain, userProfile, count) {
    const careerCards = [];
    const processedTitles = new Set();

    for (const result of results.slice(0, count * 2)) { // Get more results to filter
      if (careerCards.length >= count) break;
      
      const careerTitle = this.extractCareerTitle(result.title, domain);
      if (processedTitles.has(careerTitle)) continue;
      
      processedTitles.add(careerTitle);

      try {
        const careerCard = await this.generateCareerCardFromResult(result, domain, userProfile);
        if (careerCard) {
          careerCards.push(careerCard);
        }
      } catch (error) {
        console.log(`Error generating career card for: ${careerTitle}`, error.message);
      }
    }

    return careerCards;
  }

  // Generate individual career card from search result
  async generateCareerCardFromResult(result, domain, userProfile) {
    try {
      const careerTitle = this.extractCareerTitle(result.title, domain);
      const careerDomain = this.extractCareerDomain(result.title, domain);
      
      // Use Gemini to generate comprehensive career data
      const careerData = await this.googleAPIsService.generateCareerInsights(
        careerTitle, 
        careerDomain, 
        userProfile, 
        { searchResult: result }
      );

      // Parse Gemini response to extract structured data
      const parsedData = this.parseCareerData(careerData, careerTitle, careerDomain);

      return {
        id: `career_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: careerTitle,
        domain: careerDomain,
        description: parsedData.description || result.description,
        coreSkills: parsedData.coreSkills || this.extractSkillsFromText(result.description),
        skillCategories: parsedData.skillCategories || this.categorizeSkills(parsedData.coreSkills),
        difficulty: parsedData.difficulty || this.assessDifficulty(careerTitle, result.description),
        growth: parsedData.growth || this.calculateGrowthScore(result),
        image: this.getCareerEmoji(careerTitle),
        skillProgression: parsedData.skillProgression || await this.generateSkillProgression(careerTitle, careerDomain, userProfile),
        learningPath: parsedData.learningPath || this.generateLearningPath(careerTitle, careerDomain),
        careerOpportunities: parsedData.careerOpportunities || await this.generateCareerOpportunities(careerTitle, careerDomain, userProfile),
        marketDemand: parsedData.marketDemand || await this.generateMarketDemand(careerTitle, careerDomain, userProfile),
        skillVersatility: parsedData.skillVersatility || this.generateSkillVersatility(careerTitle, careerDomain),
        futureRelevance: parsedData.futureRelevance || await this.generateFutureRelevance(careerTitle, careerDomain, userProfile)
      };
    } catch (error) {
      console.error('Error generating career card:', error);
      return null;
    }
  }

  // Extract career title from search result
  extractCareerTitle(title, domain) {
    // Remove common prefixes and clean up title
    let cleanTitle = title
      .replace(/^(\d+\.\s*)/, '') // Remove numbering
      .replace(/^(How to|What is|Guide to|Learn|Master|Become a|Become an)\s+/i, '') // Remove common prefixes
      .replace(/\s+(Career|Job|Role|Position|Path|Guide|Tutorial|Course|Training|Skills|Requirements|Salary|Opportunities|2024|2023)\s*$/i, '') // Remove common suffixes
      .trim();

    // If title is too generic, use domain + role
    if (cleanTitle.length < 5 || cleanTitle.toLowerCase().includes('career') || cleanTitle.toLowerCase().includes('job')) {
      cleanTitle = `${domain.charAt(0).toUpperCase() + domain.slice(1)} Professional`;
    }

    return cleanTitle;
  }

  // Extract career domain
  extractCareerDomain(title, fallbackDomain) {
    const domains = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Design', 'Engineering', 'Business', 'Science', 'Arts'];
    
    for (const domain of domains) {
      if (title.toLowerCase().includes(domain.toLowerCase())) {
        return domain;
      }
    }
    
    return fallbackDomain.charAt(0).toUpperCase() + fallbackDomain.slice(1);
  }

  // Parse career data from Gemini response
  parseCareerData(careerData, title, domain) {
    try {
      // This would parse the structured response from Gemini
      // For now, return basic structure
      return {
        description: careerData.substring(0, 200) + '...',
        coreSkills: this.extractSkillsFromText(careerData),
        skillCategories: this.categorizeSkills(this.extractSkillsFromText(careerData)),
        difficulty: this.assessDifficulty(title, careerData),
        growth: this.calculateGrowthScore({ description: careerData }),
        skillProgression: this.generateSkillProgression(title, domain),
        learningPath: this.generateLearningPath(title, domain),
        careerOpportunities: this.generateCareerOpportunities(title, domain),
        marketDemand: this.generateMarketDemand(title, domain),
        skillVersatility: this.generateSkillVersatility(title, domain),
        futureRelevance: this.generateFutureRelevance(title, domain)
      };
    } catch (error) {
      console.error('Error parsing career data:', error);
      return {};
    }
  }

  // Extract skills from text
  extractSkillsFromText(text) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
      'Communication', 'Leadership', 'Problem Solving', 'Analytics', 'Project Management',
      'Data Analysis', 'Machine Learning', 'Cloud Computing', 'DevOps', 'UI/UX Design'
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.length > 0 ? foundSkills : ['Core Skills', 'Industry Knowledge'];
  }

  // Categorize skills
  categorizeSkills(skills) {
    const categories = {
      'Technical': ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS'],
      'Soft Skills': ['Communication', 'Leadership', 'Problem Solving', 'Teamwork'],
      'Business': ['Analytics', 'Project Management', 'Strategy', 'Marketing'],
      'Data': ['Data Analysis', 'Machine Learning', 'Statistics', 'Research']
    };
    
    const skillCategories = [];
    for (const [category, categorySkills] of Object.entries(categories)) {
      if (skills.some(skill => categorySkills.includes(skill))) {
        skillCategories.push(category);
      }
    }
    
    return skillCategories.length > 0 ? skillCategories : ['Core Skills'];
  }

  // Assess difficulty level
  assessDifficulty(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('senior') || text.includes('lead') || text.includes('expert') || text.includes('advanced')) {
      return 'advanced';
    } else if (text.includes('mid') || text.includes('intermediate') || text.includes('experienced')) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  // Calculate growth score
  calculateGrowthScore(result) {
    const text = result.description.toLowerCase();
    let score = 50; // Base score
    
    if (text.includes('growing') || text.includes('high demand') || text.includes('increasing')) {
      score += 30;
    }
    if (text.includes('emerging') || text.includes('new') || text.includes('trending')) {
      score += 20;
    }
    if (text.includes('declining') || text.includes('decreasing') || text.includes('saturated')) {
      score -= 30;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // Generate real-time skill progression using Google APIs
  async generateSkillProgression(title, domain, userProfile) {
    try {
      console.log(`🎯 Generating real-time skill progression for: ${title} in ${domain}`);
      
      // Search for skill progression data using Google APIs
      const skillQueries = [
        `${title} skills roadmap beginner to advanced`,
        `${title} learning path ${domain}`,
        `${title} career progression skills`,
        `${title} essential skills development`,
        `${domain} skill requirements 2024`
      ];
      
      const allResults = [];
      for (const query of skillQueries) {
        try {
          const results = await this.googleAPIsService.searchPersonalizedLearningMaterials(
            query, domain, 'skills', 'intermediate', userProfile
          );
          allResults.push(...results);
        } catch (error) {
          console.log(`Skill search failed for query: ${query}`, error.message);
        }
      }
      
      // Use Gemini to generate skill progression
      const skillProgressionPrompt = `Generate a comprehensive skill progression roadmap for ${title} in ${domain} with beginner, intermediate, and advanced levels. Include specific skills, timeframes, and learning milestones.`;
      const context = { title, domain, userProfile, searchResults: allResults };
      
      const aiSkillProgression = await this.googleAPIsService.generateAIContent(skillProgressionPrompt, context);
      
      // Parse AI response and extract structured data
      const parsedProgression = this.parseSkillProgression(aiSkillProgression, title, domain);
      
      return {
        beginner: parsedProgression.beginner || this.extractBeginnerSkills(allResults, title),
        intermediate: parsedProgression.intermediate || this.extractIntermediateSkills(allResults, title),
        advanced: parsedProgression.advanced || this.extractAdvancedSkills(allResults, title),
        timeToIntermediate: parsedProgression.timeToIntermediate || this.assessTimeToIntermediate(allResults),
        timeToAdvanced: parsedProgression.timeToAdvanced || this.assessTimeToAdvanced(allResults),
        aiInsights: aiSkillProgression,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating skill progression:', error);
      // Fallback to basic progression
      return {
        beginner: [`Basic ${title} concepts`, 'Fundamental skills', 'Entry-level knowledge'],
        intermediate: [`Advanced ${title} techniques`, 'Professional skills', 'Industry experience'],
        advanced: [`Expert ${title} mastery`, 'Leadership skills', 'Strategic thinking'],
        timeToIntermediate: '6-12 months',
        timeToAdvanced: '2-3 years',
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Parse skill progression from AI response
  parseSkillProgression(aiResponse, title, domain) {
    try {
      const lines = aiResponse.split('\n').filter(line => line.trim().length > 0);
      
      const progression = {
        beginner: [],
        intermediate: [],
        advanced: [],
        timeToIntermediate: '6-12 months',
        timeToAdvanced: '2-3 years'
      };
      
      let currentLevel = null;
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('beginner') || lowerLine.includes('entry') || lowerLine.includes('basic')) {
          currentLevel = 'beginner';
        } else if (lowerLine.includes('intermediate') || lowerLine.includes('mid') || lowerLine.includes('professional')) {
          currentLevel = 'intermediate';
        } else if (lowerLine.includes('advanced') || lowerLine.includes('expert') || lowerLine.includes('senior')) {
          currentLevel = 'advanced';
        } else if (lowerLine.includes('time') || lowerLine.includes('months') || lowerLine.includes('years')) {
          // Extract timeframes
          if (lowerLine.includes('6') || lowerLine.includes('12')) {
            progression.timeToIntermediate = this.extractTimeframe(line);
          } else if (lowerLine.includes('2') || lowerLine.includes('3')) {
            progression.timeToAdvanced = this.extractTimeframe(line);
          }
        } else if (currentLevel && line.includes('-') || line.includes('•') || line.includes('*')) {
          // Extract skill from bullet point
          const skill = line.replace(/^[-•*]\s*/, '').trim();
          if (skill.length > 5) {
            progression[currentLevel].push(skill);
          }
        }
      }
      
      return progression;
    } catch (error) {
      console.error('Error parsing skill progression:', error);
      return {};
    }
  }

  // Extract timeframe from text
  extractTimeframe(text) {
    const timeMatch = text.match(/(\d+)\s*-\s*(\d+)\s*(months?|years?)/i);
    if (timeMatch) {
      return `${timeMatch[1]}-${timeMatch[2]} ${timeMatch[3]}`;
    }
    return '6-12 months';
  }

  // Extract beginner skills from search results
  extractBeginnerSkills(results, title) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    const skills = [];
    
    const beginnerKeywords = ['basic', 'fundamental', 'introduction', 'beginner', 'entry', 'essential'];
    
    for (const keyword of beginnerKeywords) {
      if (text.includes(keyword)) {
        skills.push(`Master basic ${title} concepts`);
        skills.push(`Learn fundamental ${title} skills`);
        skills.push(`Understand ${title} principles`);
        break;
      }
    }
    
    return skills.length > 0 ? skills : [`Basic ${title} concepts`, 'Fundamental skills', 'Entry-level knowledge'];
  }

  // Extract intermediate skills from search results
  extractIntermediateSkills(results, title) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    const skills = [];
    
    const intermediateKeywords = ['intermediate', 'professional', 'advanced', 'practical', 'hands-on'];
    
    for (const keyword of intermediateKeywords) {
      if (text.includes(keyword)) {
        skills.push(`Apply ${title} in real projects`);
        skills.push(`Master professional ${title} techniques`);
        skills.push(`Build industry-relevant ${title} skills`);
        break;
      }
    }
    
    return skills.length > 0 ? skills : [`Advanced ${title} techniques`, 'Professional skills', 'Industry experience'];
  }

  // Extract advanced skills from search results
  extractAdvancedSkills(results, title) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    const skills = [];
    
    const advancedKeywords = ['expert', 'senior', 'leadership', 'strategic', 'mastery'];
    
    for (const keyword of advancedKeywords) {
      if (text.includes(keyword)) {
        skills.push(`Achieve ${title} expertise`);
        skills.push(`Lead ${title} initiatives`);
        skills.push(`Develop strategic ${title} solutions`);
        break;
      }
    }
    
    return skills.length > 0 ? skills : [`Expert ${title} mastery`, 'Leadership skills', 'Strategic thinking'];
  }

  // Assess time to intermediate level
  assessTimeToIntermediate(results) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    
    if (text.includes('3 months') || text.includes('3-6 months')) {
      return '3-6 months';
    } else if (text.includes('1 year') || text.includes('12 months')) {
      return '6-12 months';
    } else {
      return '6-12 months';
    }
  }

  // Assess time to advanced level
  assessTimeToAdvanced(results) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    
    if (text.includes('2 years') || text.includes('24 months')) {
      return '2-3 years';
    } else if (text.includes('5 years') || text.includes('5+ years')) {
      return '3-5 years';
    } else {
      return '2-3 years';
    }
  }

  // Generate learning path
  generateLearningPath(title, domain) {
    return {
      fundamentals: [`${title} basics`, 'Core concepts', 'Essential skills'],
      intermediate: [`Advanced ${title}`, 'Professional development', 'Industry practices'],
      advanced: [`${title} mastery`, 'Leadership skills', 'Strategic expertise'],
      recommendedResources: ['Industry courses', 'Professional certifications', 'Mentorship programs']
    };
  }

  // Generate real-time career opportunities using Google APIs
  async generateCareerOpportunities(title, domain, userProfile) {
    try {
      console.log(`💼 Generating real-time career opportunities for: ${title} in ${domain}`);
      
      // Search for job opportunities using Google APIs
      const jobQueries = [
        `${title} jobs entry level ${domain}`,
        `${title} careers mid level senior`,
        `${title} job titles roles ${domain}`,
        `${title} career path progression`,
        `${domain} job market opportunities`,
        `${title} remote jobs work from home`
      ];
      
      const allResults = [];
      for (const query of jobQueries) {
        try {
          const results = await this.googleAPIsService.searchPersonalizedLearningMaterials(
            query, domain, 'jobs', 'intermediate', userProfile
          );
          allResults.push(...results);
        } catch (error) {
          console.log(`Job search failed for query: ${query}`, error.message);
        }
      }
      
      // Use Gemini to analyze job opportunities
      const jobAnalysisPrompt = `Generate comprehensive career opportunities for ${title} in ${domain}. Include entry-level, mid-level, and senior roles, along with relevant industries and job market insights.`;
      const context = { title, domain, userProfile, searchResults: allResults };
      
      const aiJobAnalysis = await this.googleAPIsService.generateAIContent(jobAnalysisPrompt, context);
      
      // Extract job opportunities from search results
      const jobData = this.extractJobOpportunitiesFromResults(allResults, title, domain);
      
      return {
        entryRoles: jobData.entryRoles || this.extractEntryLevelRoles(allResults, title),
        midLevelRoles: jobData.midLevelRoles || this.extractMidLevelRoles(allResults, title),
        seniorRoles: jobData.seniorRoles || this.extractSeniorRoles(allResults, title),
        industries: jobData.industries || this.extractIndustries(allResults, domain),
        jobAnalysis: aiJobAnalysis,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating career opportunities:', error);
      // Fallback to basic opportunities
      return {
        entryRoles: [`Junior ${title}`, `Entry-level ${title}`, `${title} Assistant`],
        midLevelRoles: [`${title} Specialist`, `Senior ${title}`, `${title} Manager`],
        seniorRoles: [`${title} Director`, `VP of ${title}`, `Chief ${title} Officer`],
        industries: [domain, 'Technology', 'Business', 'Healthcare', 'Finance'],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Extract job opportunities from search results
  extractJobOpportunitiesFromResults(results, title, domain) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    
    return {
      entryRoles: this.extractEntryLevelRoles(results, title),
      midLevelRoles: this.extractMidLevelRoles(results, title),
      seniorRoles: this.extractSeniorRoles(results, title),
      industries: this.extractIndustries(results, domain)
    };
  }

  // Extract entry-level roles from results
  extractEntryLevelRoles(results, title) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    const roles = [];
    
    const entryKeywords = ['junior', 'entry', 'assistant', 'trainee', 'intern', 'associate', 'coordinator'];
    
    for (const keyword of entryKeywords) {
      if (text.includes(keyword)) {
        roles.push(`${keyword.charAt(0).toUpperCase() + keyword.slice(1)} ${title}`);
      }
    }
    
    // Add common entry-level variations
    roles.push(`Entry-level ${title}`, `${title} Assistant`, `Junior ${title}`);
    
    return [...new Set(roles)].slice(0, 5);
  }

  // Extract mid-level roles from results
  extractMidLevelRoles(results, title) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    const roles = [];
    
    const midKeywords = ['specialist', 'analyst', 'coordinator', 'manager', 'lead', 'senior'];
    
    for (const keyword of midKeywords) {
      if (text.includes(keyword)) {
        roles.push(`${title} ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`);
      }
    }
    
    // Add common mid-level variations
    roles.push(`${title} Specialist`, `Senior ${title}`, `${title} Manager`);
    
    return [...new Set(roles)].slice(0, 5);
  }

  // Extract senior roles from results
  extractSeniorRoles(results, title) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    const roles = [];
    
    const seniorKeywords = ['director', 'vp', 'vice president', 'chief', 'head', 'principal', 'architect'];
    
    for (const keyword of seniorKeywords) {
      if (text.includes(keyword)) {
        roles.push(`${keyword.charAt(0).toUpperCase() + keyword.slice(1)} of ${title}`);
      }
    }
    
    // Add common senior variations
    roles.push(`${title} Director`, `VP of ${title}`, `Chief ${title} Officer`);
    
    return [...new Set(roles)].slice(0, 5);
  }

  // Extract industries from results
  extractIndustries(results, domain) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    const industries = [];
    
    const industryKeywords = [
      'technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing',
      'consulting', 'government', 'nonprofit', 'startup', 'enterprise', 'media',
      'entertainment', 'real estate', 'logistics', 'energy', 'automotive'
    ];
    
    for (const keyword of industryKeywords) {
      if (text.includes(keyword)) {
        industries.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
    
    // Add domain-specific industries
    if (domain.toLowerCase().includes('tech') || domain.toLowerCase().includes('software')) {
      industries.push('Technology', 'Software', 'SaaS', 'Fintech', 'Edtech');
    }
    
    if (domain.toLowerCase().includes('data') || domain.toLowerCase().includes('analytics')) {
      industries.push('Data & Analytics', 'Business Intelligence', 'Research');
    }
    
    if (domain.toLowerCase().includes('design') || domain.toLowerCase().includes('creative')) {
      industries.push('Design', 'Creative', 'Marketing', 'Advertising');
    }
    
    return [...new Set(industries)].slice(0, 6);
  }

  // Generate real-time market demand using Google APIs
  async generateMarketDemand(title, domain, userProfile) {
    try {
      console.log(`📊 Generating real-time market demand for: ${title} in ${domain}`);
      
      // Search for market data using Google APIs
      const marketQueries = [
        `${title} salary range 2024`,
        `${title} job market demand ${domain}`,
        `${title} remote work opportunities`,
        `${domain} industry growth trends`,
        `${title} career prospects future outlook`
      ];
      
      const allResults = [];
      for (const query of marketQueries) {
        try {
          const results = await this.googleAPIsService.searchPersonalizedLearningMaterials(
            query, domain, 'market', 'intermediate', userProfile
          );
          allResults.push(...results);
        } catch (error) {
          console.log(`Market search failed for query: ${query}`, error.message);
        }
      }
      
      // Use Gemini to analyze market data
      const marketAnalysis = await this.googleAPIsService.generateMarketAnalysis(
        domain, 'global', userProfile
      );
      
      // Extract market insights from search results
      const marketData = this.extractMarketDataFromResults(allResults, title, domain);
      
      return {
        currentDemand: marketData.currentDemand || this.assessCurrentDemand(allResults),
        futureOutlook: marketData.futureOutlook || this.assessFutureOutlook(allResults),
        salaryRange: marketData.salaryRange || this.extractSalaryRange(allResults, title),
        remoteOpportunities: marketData.remoteOpportunities || this.assessRemoteOpportunities(allResults),
        marketAnalysis: marketAnalysis,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating market demand:', error);
      // Fallback to basic assessment
      return {
        currentDemand: 'medium',
        futureOutlook: 'stable',
        salaryRange: '₹5-20 LPA',
        remoteOpportunities: 60,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Extract market data from search results
  extractMarketDataFromResults(results, title, domain) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    
    return {
      currentDemand: this.assessCurrentDemand(results),
      futureOutlook: this.assessFutureOutlook(results),
      salaryRange: this.extractSalaryRange(results, title),
      remoteOpportunities: this.assessRemoteOpportunities(results)
    };
  }

  // Assess current demand from results
  assessCurrentDemand(results) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    
    if (text.includes('high demand') || text.includes('growing rapidly') || text.includes('shortage')) {
      return 'high';
    } else if (text.includes('saturated') || text.includes('declining') || text.includes('oversupply')) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  // Assess future outlook from results
  assessFutureOutlook(results) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    
    if (text.includes('growing') || text.includes('expanding') || text.includes('increasing demand')) {
      return 'growing';
    } else if (text.includes('declining') || text.includes('shrinking') || text.includes('decreasing')) {
      return 'declining';
    } else {
      return 'stable';
    }
  }

  // Extract salary range from results
  extractSalaryRange(results, title) {
    const text = results.map(r => r.description).join(' ');
    const salaryPatterns = [
      /₹(\d+)\s*-\s*₹(\d+)\s*(?:LPA|lakh|cr)/gi,
      /\$(\d+)\s*-\s*\$(\d+)\s*(?:k|thousand|million)/gi,
      /(\d+)\s*-\s*(\d+)\s*(?:LPA|lakh)/gi
    ];
    
    for (const pattern of salaryPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    // Default salary range based on title
    if (title.toLowerCase().includes('senior') || title.toLowerCase().includes('lead')) {
      return '₹15-40 LPA';
    } else if (title.toLowerCase().includes('junior') || title.toLowerCase().includes('entry')) {
      return '₹3-8 LPA';
    } else {
      return '₹5-20 LPA';
    }
  }

  // Assess remote opportunities from results
  assessRemoteOpportunities(results) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    
    if (text.includes('remote') || text.includes('work from home') || text.includes('hybrid')) {
      if (text.includes('fully remote') || text.includes('100% remote')) {
        return 90;
      } else if (text.includes('hybrid') || text.includes('flexible')) {
        return 70;
      } else {
        return 50;
      }
    }
    
    return 60; // Default
  }

  // Generate skill versatility
  generateSkillVersatility(title, domain) {
    return {
      transferableSkills: ['Communication', 'Problem Solving', 'Analytics'],
      complementaryDomains: [domain, 'Business', 'Technology'],
      crossIndustryValue: 4
    };
  }

  // Generate real-time future relevance using Google APIs
  async generateFutureRelevance(title, domain, userProfile) {
    try {
      console.log(`🔮 Generating real-time future relevance for: ${title} in ${domain}`);
      
      // Search for future trends and automation data using Google APIs
      const trendQueries = [
        `${title} future trends 2024 2025`,
        `${title} automation AI impact`,
        `${domain} industry future outlook`,
        `${title} career future prospects`,
        `${title} emerging technologies`,
        `${domain} digital transformation trends`
      ];
      
      const allResults = [];
      for (const query of trendQueries) {
        try {
          const results = await this.googleAPIsService.searchPersonalizedLearningMaterials(
            query, domain, 'trends', 'intermediate', userProfile
          );
          allResults.push(...results);
        } catch (error) {
          console.log(`Trend search failed for query: ${query}`, error.message);
        }
      }
      
      // Use Gemini to analyze future trends
      const trendAnalysisPrompt = `Analyze the future relevance and trends for ${title} in ${domain}. Assess automation resistance, AI enhancement potential, and emerging trends.`;
      const context = { title, domain, userProfile, searchResults: allResults };
      
      const aiTrendAnalysis = await this.googleAPIsService.generateAIContent(trendAnalysisPrompt, context);
      
      // Extract future relevance data from search results
      const futureData = this.extractFutureRelevanceFromResults(allResults, title, domain);
      
      return {
        automationResistance: futureData.automationResistance || this.assessAutomationResistance(allResults, title),
        aiEnhancement: futureData.aiEnhancement || this.assessAIEnhancement(allResults, title),
        emergingTrends: futureData.emergingTrends || this.extractEmergingTrends(allResults, title, domain),
        trendAnalysis: aiTrendAnalysis,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating future relevance:', error);
      // Fallback to basic assessment
      return {
        automationResistance: 'medium',
        aiEnhancement: 'high',
        emergingTrends: ['AI Integration', 'Remote Work', 'Digital Transformation'],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Extract future relevance from search results
  extractFutureRelevanceFromResults(results, title, domain) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    
    return {
      automationResistance: this.assessAutomationResistance(results, title),
      aiEnhancement: this.assessAIEnhancement(results, title),
      emergingTrends: this.extractEmergingTrends(results, title, domain)
    };
  }

  // Assess automation resistance from results
  assessAutomationResistance(results, title) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    
    if (text.includes('highly automated') || text.includes('replaced by ai') || text.includes('obsolete')) {
      return 'low';
    } else if (text.includes('human skills') || text.includes('creative') || text.includes('leadership') || text.includes('strategic')) {
      return 'high';
    } else if (text.includes('augmented') || text.includes('enhanced by ai') || text.includes('ai-assisted')) {
      return 'medium';
    } else {
      return 'medium';
    }
  }

  // Assess AI enhancement potential from results
  assessAIEnhancement(results, title) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    
    if (text.includes('ai-powered') || text.includes('machine learning') || text.includes('ai tools') || text.includes('automation')) {
      return 'high';
    } else if (text.includes('manual') || text.includes('traditional') || text.includes('human-only')) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  // Extract emerging trends from results
  extractEmergingTrends(results, title, domain) {
    const text = results.map(r => r.description).join(' ').toLowerCase();
    const trends = [];
    
    const trendKeywords = [
      'artificial intelligence', 'machine learning', 'automation', 'digital transformation',
      'remote work', 'hybrid work', 'sustainability', 'green technology',
      'blockchain', 'cryptocurrency', 'metaverse', 'virtual reality',
      'cloud computing', 'edge computing', 'iot', 'internet of things',
      'cybersecurity', 'data privacy', 'quantum computing', '5g'
    ];
    
    for (const keyword of trendKeywords) {
      if (text.includes(keyword)) {
        trends.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
    
    // Add domain-specific trends
    if (domain.toLowerCase().includes('tech') || domain.toLowerCase().includes('software')) {
      trends.push('Cloud Computing', 'DevOps', 'Microservices');
    }
    
    if (domain.toLowerCase().includes('data') || domain.toLowerCase().includes('analytics')) {
      trends.push('Big Data', 'Data Science', 'Business Intelligence');
    }
    
    if (domain.toLowerCase().includes('design') || domain.toLowerCase().includes('creative')) {
      trends.push('UI/UX Design', 'Design Systems', 'User Research');
    }
    
    return trends.length > 0 ? trends.slice(0, 5) : ['AI Integration', 'Remote Work', 'Digital Transformation'];
  }

  // Get career emoji
  getCareerEmoji(title) {
    const emojiMap = {
      'engineer': '⚙️',
      'developer': '💻',
      'designer': '🎨',
      'manager': '👔',
      'analyst': '📊',
      'consultant': '💼',
      'researcher': '🔬',
      'teacher': '👨‍🏫',
      'writer': '✍️',
      'marketer': '📈'
    };
    
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (title.toLowerCase().includes(keyword)) {
        return emoji;
      }
    }
    
    return '💼';
  }

  // Cache management
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export default CareerDataService;
