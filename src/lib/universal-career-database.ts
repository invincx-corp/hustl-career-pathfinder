// =====================================================
// NEXA UNIVERSAL CAREER DATABASE
// =====================================================
// Legacy database - Now using CareerAPIService for comprehensive data
// This file is maintained for backward compatibility
// For new implementations, use careerAPIService from career-api-service.ts

export interface CareerDomain {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  trending: boolean;
  demandLevel: 'high' | 'medium' | 'low';
  salaryRange: {
    entry: string;
    mid: string;
    senior: string;
  };
  growthRate: string;
  subDomains: CareerSubDomain[];
}

export interface CareerSubDomain {
  id: string;
  name: string;
  description: string;
  careers: Career[];
  skills: string[];
  education: string[];
  certifications: string[];
}

export interface Career {
  id: string;
  name: string;
  description: string;
  level: 'entry' | 'mid' | 'senior' | 'executive';
  salaryRange: string;
  growthRate: string;
  demand: 'high' | 'medium' | 'low';
  trending: boolean;
  underrated: boolean;
  skills: string[];
  education: string[];
  experience: string;
  workEnvironment: string[];
  personalityTraits: string[];
  dailyTasks: string[];
  careerPath: string[];
  alternativeTitles: string[];
  relatedCareers: string[];
}

export const UNIVERSAL_CAREER_DATABASE: CareerDomain[] = [
  // TECHNOLOGY & DIGITAL
  {
    id: 'technology',
    name: 'Technology & Digital',
    description: 'Build the future with code, AI, and digital innovation',
    icon: '💻',
    color: 'bg-blue-500',
    trending: true,
    demandLevel: 'high',
    salaryRange: { entry: '$50K-80K', mid: '$80K-150K', senior: '$150K-300K+' },
    growthRate: '15-25%',
    subDomains: [
      {
        id: 'software-development',
        name: 'Software Development',
        description: 'Creating applications, websites, and digital solutions',
        careers: [
          {
            id: 'frontend-developer',
            name: 'Frontend Developer',
            description: 'Build user interfaces and client-side applications',
            level: 'entry',
            salaryRange: '$60K-120K',
            growthRate: '22%',
            demand: 'high',
            trending: true,
            underrated: false,
            skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular', 'TypeScript'],
            education: ['Computer Science', 'Web Development', 'Bootcamp', 'Self-taught'],
            experience: '0-2 years',
            workEnvironment: ['Remote', 'Office', 'Hybrid'],
            personalityTraits: ['Detail-oriented', 'Creative', 'Problem-solver', 'Collaborative'],
            dailyTasks: ['Code review', 'UI implementation', 'Bug fixing', 'Testing'],
            careerPath: ['Junior Developer', 'Senior Developer', 'Lead Developer', 'Tech Lead'],
            alternativeTitles: ['UI Developer', 'Client-side Developer', 'Web Developer'],
            relatedCareers: ['Backend Developer', 'Full-stack Developer', 'UX Designer']
          },
          {
            id: 'backend-developer',
            name: 'Backend Developer',
            description: 'Build server-side applications and APIs',
            level: 'entry',
            salaryRange: '$70K-130K',
            growthRate: '20%',
            demand: 'high',
            trending: true,
            underrated: false,
            skills: ['Python', 'Java', 'Node.js', 'SQL', 'REST APIs', 'Microservices'],
            education: ['Computer Science', 'Software Engineering', 'Bootcamp'],
            experience: '0-3 years',
            workEnvironment: ['Remote', 'Office', 'Hybrid'],
            personalityTraits: ['Logical', 'Systematic', 'Analytical', 'Patient'],
            dailyTasks: ['API development', 'Database design', 'Server maintenance', 'Code optimization'],
            careerPath: ['Junior Developer', 'Senior Developer', 'Architect', 'CTO'],
            alternativeTitles: ['Server Developer', 'API Developer', 'Systems Developer'],
            relatedCareers: ['Frontend Developer', 'DevOps Engineer', 'Database Administrator']
          },
          {
            id: 'mobile-developer',
            name: 'Mobile App Developer',
            description: 'Create applications for iOS and Android devices',
            level: 'entry',
            salaryRange: '$65K-125K',
            growthRate: '18%',
            demand: 'high',
            trending: true,
            underrated: false,
            skills: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'iOS', 'Android'],
            education: ['Computer Science', 'Mobile Development', 'Bootcamp'],
            experience: '0-2 years',
            workEnvironment: ['Remote', 'Office', 'Hybrid'],
            personalityTraits: ['User-focused', 'Innovative', 'Adaptable', 'Detail-oriented'],
            dailyTasks: ['App development', 'Testing', 'Store submissions', 'Performance optimization'],
            careerPath: ['Junior Developer', 'Senior Developer', 'Lead Developer', 'Mobile Architect'],
            alternativeTitles: ['iOS Developer', 'Android Developer', 'App Developer'],
            relatedCareers: ['Frontend Developer', 'UX Designer', 'Product Manager']
          }
        ],
        skills: ['Programming', 'Problem Solving', 'System Design', 'Version Control'],
        education: ['Computer Science', 'Software Engineering', 'Bootcamp', 'Self-taught'],
        certifications: ['AWS Certified Developer', 'Google Cloud Developer', 'Microsoft Azure Developer']
      },
      {
        id: 'data-science',
        name: 'Data Science & Analytics',
        description: 'Extract insights from data to drive business decisions',
        careers: [
          {
            id: 'data-scientist',
            name: 'Data Scientist',
            description: 'Analyze complex data to solve business problems',
            level: 'mid',
            salaryRange: '$90K-160K',
            growthRate: '35%',
            demand: 'high',
            trending: true,
            underrated: false,
            skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
            education: ['Data Science', 'Statistics', 'Computer Science', 'Mathematics'],
            experience: '2-5 years',
            workEnvironment: ['Remote', 'Office', 'Hybrid'],
            personalityTraits: ['Analytical', 'Curious', 'Detail-oriented', 'Problem-solver'],
            dailyTasks: ['Data analysis', 'Model building', 'Report creation', 'Stakeholder meetings'],
            careerPath: ['Junior Data Scientist', 'Senior Data Scientist', 'Lead Data Scientist', 'Chief Data Officer'],
            alternativeTitles: ['ML Engineer', 'Data Analyst', 'Research Scientist'],
            relatedCareers: ['Data Engineer', 'Business Analyst', 'Statistician']
          }
        ],
        skills: ['Statistics', 'Programming', 'Data Analysis', 'Machine Learning'],
        education: ['Data Science', 'Statistics', 'Mathematics', 'Computer Science'],
        certifications: ['AWS Machine Learning', 'Google Data Analytics', 'Microsoft Data Science']
      }
    ]
  },

  // HEALTHCARE & MEDICAL
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    description: 'Heal, care, and improve quality of life for people worldwide',
    icon: '🏥',
    color: 'bg-red-500',
    trending: true,
    demandLevel: 'high',
    salaryRange: { entry: '$40K-70K', mid: '$70K-120K', senior: '$120K-250K+' },
    growthRate: '12-18%',
    subDomains: [
      {
        id: 'clinical-care',
        name: 'Clinical Care',
        description: 'Direct patient care and medical treatment',
        careers: [
          {
            id: 'registered-nurse',
            name: 'Registered Nurse',
            description: 'Provide direct patient care and medical support',
            level: 'entry',
            salaryRange: '$55K-85K',
            growthRate: '9%',
            demand: 'high',
            trending: true,
            underrated: false,
            skills: ['Patient Care', 'Medical Knowledge', 'Communication', 'Critical Thinking'],
            education: ['Nursing Degree', 'BSN', 'Associate Degree'],
            experience: '0-1 years',
            workEnvironment: ['Hospital', 'Clinic', 'Home Care', 'School'],
            personalityTraits: ['Compassionate', 'Detail-oriented', 'Stress-resistant', 'Empathetic'],
            dailyTasks: ['Patient assessment', 'Medication administration', 'Documentation', 'Family communication'],
            careerPath: ['Staff Nurse', 'Charge Nurse', 'Nurse Manager', 'Director of Nursing'],
            alternativeTitles: ['RN', 'Staff Nurse', 'Clinical Nurse'],
            relatedCareers: ['Nurse Practitioner', 'Physician Assistant', 'Medical Assistant']
          },
          {
            id: 'physical-therapist',
            name: 'Physical Therapist',
            description: 'Help patients recover from injuries and improve mobility',
            level: 'mid',
            salaryRange: '$70K-100K',
            growthRate: '18%',
            demand: 'high',
            trending: true,
            underrated: false,
            skills: ['Anatomy', 'Physiology', 'Exercise Therapy', 'Patient Assessment'],
            education: ['Doctor of Physical Therapy', 'Master\'s in PT'],
            experience: '0-2 years',
            workEnvironment: ['Hospital', 'Clinic', 'Private Practice', 'Sports Facility'],
            personalityTraits: ['Patient', 'Motivational', 'Analytical', 'Compassionate'],
            dailyTasks: ['Patient evaluation', 'Treatment planning', 'Exercise instruction', 'Progress monitoring'],
            careerPath: ['Staff PT', 'Senior PT', 'Clinic Director', 'Private Practice Owner'],
            alternativeTitles: ['PT', 'Physiotherapist', 'Rehabilitation Specialist'],
            relatedCareers: ['Occupational Therapist', 'Athletic Trainer', 'Massage Therapist']
          }
        ],
        skills: ['Medical Knowledge', 'Patient Care', 'Communication', 'Critical Thinking'],
        education: ['Medical Degree', 'Nursing', 'Allied Health', 'Specialized Training'],
        certifications: ['Board Certification', 'Specialty Certifications', 'Continuing Education']
      },
      {
        id: 'mental-health',
        name: 'Mental Health & Wellness',
        description: 'Support mental health and emotional well-being',
        careers: [
          {
            id: 'clinical-psychologist',
            name: 'Clinical Psychologist',
            description: 'Diagnose and treat mental health disorders',
            level: 'senior',
            salaryRange: '$80K-120K',
            growthRate: '14%',
            demand: 'high',
            trending: true,
            underrated: false,
            skills: ['Psychology', 'Therapy', 'Assessment', 'Research'],
            education: ['PhD in Psychology', 'PsyD', 'Master\'s in Clinical Psychology'],
            experience: '2-4 years',
            workEnvironment: ['Private Practice', 'Hospital', 'Clinic', 'Research'],
            personalityTraits: ['Empathetic', 'Analytical', 'Patient', 'Non-judgmental'],
            dailyTasks: ['Patient therapy', 'Psychological testing', 'Treatment planning', 'Documentation'],
            careerPath: ['Postdoc', 'Licensed Psychologist', 'Senior Psychologist', 'Practice Owner'],
            alternativeTitles: ['Therapist', 'Counselor', 'Clinical Psychologist'],
            relatedCareers: ['Psychiatrist', 'Social Worker', 'Counselor']
          }
        ],
        skills: ['Psychology', 'Therapy', 'Assessment', 'Communication'],
        education: ['Psychology', 'Social Work', 'Counseling', 'Psychiatry'],
        certifications: ['Licensed Psychologist', 'Licensed Clinical Social Worker', 'Board Certification']
      }
    ]
  },

  // EDUCATION & TRAINING
  {
    id: 'education',
    name: 'Education & Training',
    description: 'Shape minds, inspire learning, and build the next generation',
    icon: '🎓',
    color: 'bg-green-500',
    trending: false,
    demandLevel: 'medium',
    salaryRange: { entry: '$35K-55K', mid: '$55K-80K', senior: '$80K-120K+' },
    growthRate: '4-8%',
    subDomains: [
      {
        id: 'k12-education',
        name: 'K-12 Education',
        description: 'Teaching and supporting students in primary and secondary education',
        careers: [
          {
            id: 'elementary-teacher',
            name: 'Elementary School Teacher',
            description: 'Teach and nurture young students in grades K-5',
            level: 'entry',
            salaryRange: '$40K-65K',
            growthRate: '4%',
            demand: 'medium',
            trending: false,
            underrated: true,
            skills: ['Teaching', 'Classroom Management', 'Curriculum Development', 'Communication'],
            education: ['Education Degree', 'Teaching Certification', 'Subject Matter Expertise'],
            experience: '0-1 years',
            workEnvironment: ['School', 'Classroom', 'Remote Teaching'],
            personalityTraits: ['Patient', 'Creative', 'Enthusiastic', 'Organized'],
            dailyTasks: ['Lesson planning', 'Teaching', 'Grading', 'Parent communication'],
            careerPath: ['Teacher', 'Lead Teacher', 'Department Head', 'Principal'],
            alternativeTitles: ['Grade School Teacher', 'Primary Teacher', 'Classroom Teacher'],
            relatedCareers: ['Special Education Teacher', 'School Counselor', 'Curriculum Specialist']
          }
        ],
        skills: ['Teaching', 'Classroom Management', 'Curriculum Development', 'Communication'],
        education: ['Education Degree', 'Teaching Certification', 'Subject Matter Expertise'],
        certifications: ['Teaching License', 'Subject Matter Certification', 'Continuing Education']
      }
    ]
  },

  // CREATIVE ARTS & DESIGN
  {
    id: 'creative-arts',
    name: 'Creative Arts & Design',
    description: 'Express creativity through visual, digital, and performing arts',
    icon: '🎨',
    color: 'bg-pink-500',
    trending: true,
    demandLevel: 'medium',
    salaryRange: { entry: '$35K-60K', mid: '$60K-100K', senior: '$100K-200K+' },
    growthRate: '8-15%',
    subDomains: [
      {
        id: 'graphic-design',
        name: 'Graphic Design & Visual Arts',
        description: 'Create visual content and brand identities',
        careers: [
          {
            id: 'graphic-designer',
            name: 'Graphic Designer',
            description: 'Create visual concepts and designs for various media',
            level: 'entry',
            salaryRange: '$40K-70K',
            growthRate: '3%',
            demand: 'medium',
            trending: false,
            underrated: false,
            skills: ['Adobe Creative Suite', 'Typography', 'Color Theory', 'Branding'],
            education: ['Graphic Design', 'Visual Arts', 'Fine Arts', 'Self-taught'],
            experience: '0-2 years',
            workEnvironment: ['Agency', 'In-house', 'Freelance', 'Remote'],
            personalityTraits: ['Creative', 'Detail-oriented', 'Visual', 'Collaborative'],
            dailyTasks: ['Design creation', 'Client meetings', 'Revision work', 'File preparation'],
            careerPath: ['Junior Designer', 'Senior Designer', 'Art Director', 'Creative Director'],
            alternativeTitles: ['Visual Designer', 'Brand Designer', 'Creative Designer'],
            relatedCareers: ['UX Designer', 'Web Designer', 'Illustrator']
          }
        ],
        skills: ['Design Software', 'Typography', 'Color Theory', 'Creativity'],
        education: ['Graphic Design', 'Visual Arts', 'Fine Arts', 'Self-taught'],
        certifications: ['Adobe Certified Expert', 'Design Thinking', 'Portfolio Development']
      }
    ]
  },

  // BUSINESS & FINANCE
  {
    id: 'business-finance',
    name: 'Business & Finance',
    description: 'Drive economic growth, manage resources, and build successful organizations',
    icon: '💼',
    color: 'bg-yellow-500',
    trending: true,
    demandLevel: 'high',
    salaryRange: { entry: '$45K-75K', mid: '$75K-130K', senior: '$130K-300K+' },
    growthRate: '10-20%',
    subDomains: [
      {
        id: 'finance',
        name: 'Finance & Accounting',
        description: 'Manage money, investments, and financial planning',
        careers: [
          {
            id: 'financial-analyst',
            name: 'Financial Analyst',
            description: 'Analyze financial data to guide business decisions',
            level: 'entry',
            salaryRange: '$55K-85K',
            growthRate: '6%',
            demand: 'high',
            trending: true,
            underrated: false,
            skills: ['Financial Modeling', 'Excel', 'Data Analysis', 'Accounting'],
            education: ['Finance', 'Accounting', 'Economics', 'Business'],
            experience: '0-2 years',
            workEnvironment: ['Office', 'Remote', 'Hybrid'],
            personalityTraits: ['Analytical', 'Detail-oriented', 'Numerical', 'Strategic'],
            dailyTasks: ['Financial modeling', 'Report creation', 'Data analysis', 'Presentation'],
            careerPath: ['Analyst', 'Senior Analyst', 'Manager', 'Director'],
            alternativeTitles: ['Investment Analyst', 'Business Analyst', 'Financial Planner'],
            relatedCareers: ['Accountant', 'Investment Banker', 'Portfolio Manager']
          }
        ],
        skills: ['Financial Analysis', 'Excel', 'Accounting', 'Data Analysis'],
        education: ['Finance', 'Accounting', 'Economics', 'Business'],
        certifications: ['CFA', 'CPA', 'FRM', 'CFP']
      }
    ]
  },

  // AGRICULTURE & ENVIRONMENT
  {
    id: 'agriculture-environment',
    name: 'Agriculture & Environment',
    description: 'Feed the world, protect the planet, and ensure sustainable future',
    icon: '🌱',
    color: 'bg-green-600',
    trending: true,
    demandLevel: 'medium',
    salaryRange: { entry: '$30K-50K', mid: '$50K-80K', senior: '$80K-150K+' },
    growthRate: '5-12%',
    subDomains: [
      {
        id: 'sustainable-agriculture',
        name: 'Sustainable Agriculture',
        description: 'Develop eco-friendly farming and food production methods',
        careers: [
          {
            id: 'agricultural-engineer',
            name: 'Agricultural Engineer',
            description: 'Design and improve farming equipment and systems',
            level: 'entry',
            salaryRange: '$55K-85K',
            growthRate: '5%',
            demand: 'medium',
            trending: false,
            underrated: true,
            skills: ['Engineering', 'Agriculture', 'Problem Solving', 'Technology'],
            education: ['Agricultural Engineering', 'Mechanical Engineering', 'Agricultural Science'],
            experience: '0-2 years',
            workEnvironment: ['Farm', 'Office', 'Field', 'Laboratory'],
            personalityTraits: ['Practical', 'Innovative', 'Problem-solver', 'Environmentally conscious'],
            dailyTasks: ['Equipment design', 'System optimization', 'Research', 'Field testing'],
            careerPath: ['Junior Engineer', 'Senior Engineer', 'Project Manager', 'Director'],
            alternativeTitles: ['Farm Engineer', 'Agricultural Systems Engineer', 'Precision Agriculture Engineer'],
            relatedCareers: ['Environmental Engineer', 'Mechanical Engineer', 'Agricultural Scientist']
          }
        ],
        skills: ['Engineering', 'Agriculture', 'Sustainability', 'Technology'],
        education: ['Agricultural Engineering', 'Environmental Science', 'Agricultural Science'],
        certifications: ['Professional Engineer', 'Sustainable Agriculture', 'Precision Agriculture']
      }
    ]
  },

  // HOSPITALITY & TOURISM
  {
    id: 'hospitality-tourism',
    name: 'Hospitality & Tourism',
    description: 'Create memorable experiences and serve people from around the world',
    icon: '🏨',
    color: 'bg-orange-500',
    trending: false,
    demandLevel: 'medium',
    salaryRange: { entry: '$25K-45K', mid: '$45K-75K', senior: '$75K-150K+' },
    growthRate: '3-8%',
    subDomains: [
      {
        id: 'hotel-management',
        name: 'Hotel & Resort Management',
        description: 'Manage hospitality operations and guest experiences',
        careers: [
          {
            id: 'hotel-manager',
            name: 'Hotel Manager',
            description: 'Oversee daily operations and guest satisfaction',
            level: 'mid',
            salaryRange: '$45K-80K',
            growthRate: '4%',
            demand: 'medium',
            trending: false,
            underrated: true,
            skills: ['Customer Service', 'Operations Management', 'Leadership', 'Problem Solving'],
            education: ['Hospitality Management', 'Business Administration', 'Hotel Management'],
            experience: '3-5 years',
            workEnvironment: ['Hotel', 'Resort', 'Office', 'Guest Areas'],
            personalityTraits: ['Service-oriented', 'Leadership', 'Multitasking', 'Calm under pressure'],
            dailyTasks: ['Staff management', 'Guest relations', 'Operations oversight', 'Budget management'],
            careerPath: ['Assistant Manager', 'Manager', 'General Manager', 'Regional Manager'],
            alternativeTitles: ['General Manager', 'Operations Manager', 'Property Manager'],
            relatedCareers: ['Event Manager', 'Restaurant Manager', 'Travel Agent']
          }
        ],
        skills: ['Customer Service', 'Operations Management', 'Leadership', 'Communication'],
        education: ['Hospitality Management', 'Business Administration', 'Tourism'],
        certifications: ['Certified Hotel Administrator', 'Hospitality Management', 'Customer Service']
      }
    ]
  },

  // MANUFACTURING & ENGINEERING
  {
    id: 'manufacturing-engineering',
    name: 'Manufacturing & Engineering',
    description: 'Build, innovate, and create the products that shape our world',
    icon: '⚙️',
    color: 'bg-gray-600',
    trending: false,
    demandLevel: 'medium',
    salaryRange: { entry: '$40K-70K', mid: '$70K-110K', senior: '$110K-200K+' },
    growthRate: '2-6%',
    subDomains: [
      {
        id: 'mechanical-engineering',
        name: 'Mechanical Engineering',
        description: 'Design and build mechanical systems and products',
        careers: [
          {
            id: 'mechanical-engineer',
            name: 'Mechanical Engineer',
            description: 'Design, analyze, and manufacture mechanical systems',
            level: 'entry',
            salaryRange: '$60K-90K',
            growthRate: '4%',
            demand: 'medium',
            trending: false,
            underrated: false,
            skills: ['CAD', 'Engineering Design', 'Problem Solving', 'Manufacturing'],
            education: ['Mechanical Engineering', 'Engineering Technology'],
            experience: '0-2 years',
            workEnvironment: ['Office', 'Manufacturing Plant', 'Field', 'Laboratory'],
            personalityTraits: ['Analytical', 'Detail-oriented', 'Creative', 'Practical'],
            dailyTasks: ['Design work', 'Analysis', 'Testing', 'Project management'],
            careerPath: ['Junior Engineer', 'Senior Engineer', 'Lead Engineer', 'Engineering Manager'],
            alternativeTitles: ['Design Engineer', 'Manufacturing Engineer', 'Product Engineer'],
            relatedCareers: ['Aerospace Engineer', 'Civil Engineer', 'Industrial Engineer']
          }
        ],
        skills: ['CAD Software', 'Engineering Design', 'Problem Solving', 'Manufacturing'],
        education: ['Mechanical Engineering', 'Engineering Technology', 'Manufacturing'],
        certifications: ['Professional Engineer', 'CAD Certification', 'Manufacturing Certification']
      }
    ]
  },

  // ARTS & ENTERTAINMENT
  {
    id: 'arts-entertainment',
    name: 'Arts & Entertainment',
    description: 'Entertain, inspire, and create cultural experiences',
    icon: '🎭',
    color: 'bg-purple-500',
    trending: true,
    demandLevel: 'low',
    salaryRange: { entry: '$25K-50K', mid: '$50K-100K', senior: '$100K-500K+' },
    growthRate: '8-15%',
    subDomains: [
      {
        id: 'performing-arts',
        name: 'Performing Arts',
        description: 'Act, dance, sing, and perform for live audiences',
        careers: [
          {
            id: 'actor',
            name: 'Actor/Actress',
            description: 'Perform in theater, film, television, and other media',
            level: 'entry',
            salaryRange: '$30K-100K+',
            growthRate: '10%',
            demand: 'low',
            trending: false,
            underrated: false,
            skills: ['Acting', 'Voice Training', 'Movement', 'Memorization'],
            education: ['Theater Arts', 'Acting School', 'Drama', 'Self-taught'],
            experience: '0-5 years',
            workEnvironment: ['Theater', 'Film Set', 'TV Studio', 'Audition Rooms'],
            personalityTraits: ['Creative', 'Confident', 'Expressive', 'Resilient'],
            dailyTasks: ['Rehearsals', 'Performances', 'Auditions', 'Character study'],
            careerPath: ['Background Actor', 'Supporting Actor', 'Lead Actor', 'Star'],
            alternativeTitles: ['Performer', 'Thespian', 'Artist'],
            relatedCareers: ['Voice Actor', 'Stunt Performer', 'Theater Director']
          }
        ],
        skills: ['Performance', 'Creativity', 'Communication', 'Discipline'],
        education: ['Theater Arts', 'Drama', 'Music', 'Dance', 'Self-taught'],
        certifications: ['Acting Certification', 'Voice Training', 'Movement Certification']
      }
    ]
  },

  // PUBLIC SERVICE & GOVERNMENT
  {
    id: 'public-service',
    name: 'Public Service & Government',
    description: 'Serve communities, protect citizens, and shape public policy',
    icon: '🏛️',
    color: 'bg-blue-600',
    trending: false,
    demandLevel: 'medium',
    salaryRange: { entry: '$35K-60K', mid: '$60K-100K', senior: '$100K-200K+' },
    growthRate: '2-5%',
    subDomains: [
      {
        id: 'law-enforcement',
        name: 'Law Enforcement & Public Safety',
        description: 'Protect and serve communities through law enforcement',
        careers: [
          {
            id: 'police-officer',
            name: 'Police Officer',
            description: 'Enforce laws, protect citizens, and maintain public safety',
            level: 'entry',
            salaryRange: '$45K-80K',
            growthRate: '5%',
            demand: 'medium',
            trending: false,
            underrated: true,
            skills: ['Law Enforcement', 'Communication', 'Physical Fitness', 'Problem Solving'],
            education: ['High School', 'Criminal Justice', 'Police Academy'],
            experience: '0-1 years',
            workEnvironment: ['Patrol', 'Station', 'Court', 'Community'],
            personalityTraits: ['Courageous', 'Ethical', 'Calm under pressure', 'Service-oriented'],
            dailyTasks: ['Patrol', 'Investigation', 'Report writing', 'Community engagement'],
            careerPath: ['Officer', 'Detective', 'Sergeant', 'Lieutenant'],
            alternativeTitles: ['Law Enforcement Officer', 'Peace Officer', 'Constable'],
            relatedCareers: ['Detective', 'FBI Agent', 'Security Guard']
          }
        ],
        skills: ['Law Enforcement', 'Communication', 'Physical Fitness', 'Ethics'],
        education: ['Criminal Justice', 'Police Academy', 'Law Enforcement Training'],
        certifications: ['Police Certification', 'Firearms Training', 'Emergency Response']
      }
    ]
  },

  // TRANSPORTATION & LOGISTICS
  {
    id: 'transportation-logistics',
    name: 'Transportation & Logistics',
    description: 'Move people and goods efficiently around the world',
    icon: '🚛',
    color: 'bg-indigo-500',
    trending: false,
    demandLevel: 'medium',
    salaryRange: { entry: '$30K-55K', mid: '$55K-85K', senior: '$85K-150K+' },
    growthRate: '4-8%',
    subDomains: [
      {
        id: 'logistics',
        name: 'Logistics & Supply Chain',
        description: 'Manage the flow of goods from production to consumption',
        careers: [
          {
            id: 'logistics-coordinator',
            name: 'Logistics Coordinator',
            description: 'Coordinate the movement and storage of goods',
            level: 'entry',
            salaryRange: '$40K-65K',
            growthRate: '6%',
            demand: 'medium',
            trending: false,
            underrated: true,
            skills: ['Supply Chain', 'Organization', 'Communication', 'Problem Solving'],
            education: ['Business', 'Logistics', 'Supply Chain Management'],
            experience: '0-2 years',
            workEnvironment: ['Office', 'Warehouse', 'Distribution Center'],
            personalityTraits: ['Organized', 'Detail-oriented', 'Multitasking', 'Analytical'],
            dailyTasks: ['Shipment tracking', 'Vendor coordination', 'Inventory management', 'Route planning'],
            careerPath: ['Coordinator', 'Specialist', 'Manager', 'Director'],
            alternativeTitles: ['Supply Chain Coordinator', 'Operations Coordinator', 'Shipping Coordinator'],
            relatedCareers: ['Supply Chain Manager', 'Operations Manager', 'Procurement Specialist']
          }
        ],
        skills: ['Supply Chain', 'Organization', 'Communication', 'Analytics'],
        education: ['Business', 'Logistics', 'Supply Chain Management', 'Operations'],
        certifications: ['APICS Certification', 'Supply Chain Management', 'Logistics Certification']
      }
    ]
  }
];

// Helper functions for career database
export const getCareerById = (careerId: string): Career | null => {
  for (const domain of UNIVERSAL_CAREER_DATABASE) {
    for (const subDomain of domain.subDomains) {
      const career = subDomain.careers.find(c => c.id === careerId);
      if (career) return career;
    }
  }
  return null;
};

export const getDomainById = (domainId: string): CareerDomain | null => {
  return UNIVERSAL_CAREER_DATABASE.find(d => d.id === domainId) || null;
};

export const getSubDomainById = (subDomainId: string): CareerSubDomain | null => {
  for (const domain of UNIVERSAL_CAREER_DATABASE) {
    const subDomain = domain.subDomains.find(sd => sd.id === subDomainId);
    if (subDomain) return subDomain;
  }
  return null;
};

export const getAllCareers = (): Career[] => {
  const careers: Career[] = [];
  for (const domain of UNIVERSAL_CAREER_DATABASE) {
    for (const subDomain of domain.subDomains) {
      careers.push(...subDomain.careers);
    }
  }
  return careers;
};

export const getTrendingCareers = (): Career[] => {
  return getAllCareers().filter(career => career.trending);
};

export const getUnderratedCareers = (): Career[] => {
  return getAllCareers().filter(career => career.underrated);
};

export const getHighDemandCareers = (): Career[] => {
  return getAllCareers().filter(career => career.demand === 'high');
};

export const searchCareers = (query: string): Career[] => {
  const lowercaseQuery = query.toLowerCase();
  return getAllCareers().filter(career => 
    career.name.toLowerCase().includes(lowercaseQuery) ||
    career.description.toLowerCase().includes(lowercaseQuery) ||
    career.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery))
  );
};

export const getCareersByDomain = (domainId: string): Career[] => {
  const domain = getDomainById(domainId);
  if (!domain) return [];
  
  const careers: Career[] = [];
  for (const subDomain of domain.subDomains) {
    careers.push(...subDomain.careers);
  }
  return careers;
};

export const getCareersBySkill = (skill: string): Career[] => {
  return getAllCareers().filter(career => 
    career.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
  );
};

export const getCareerRecommendations = (userSkills: string[], userInterests: string[]): Career[] => {
  const allCareers = getAllCareers();
  
  return allCareers
    .map(career => {
      const skillMatches = career.skills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      ).length;
      
      const interestMatches = userInterests.some(interest => 
        career.description.toLowerCase().includes(interest.toLowerCase()) ||
        career.name.toLowerCase().includes(interest.toLowerCase())
      ) ? 1 : 0;
      
      const score = skillMatches + (interestMatches * 2);
      
      return { career, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(item => item.career);
};
