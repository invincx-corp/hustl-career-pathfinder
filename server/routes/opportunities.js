import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Job Matching API routes
router.get('/jobs', async (req, res) => {
  try {
    const { userId, type, experience, domain, search, matchScore } = req.query;
    
    // Mock jobs data
    const jobs = [
      {
        id: '1',
        title: 'Frontend Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        type: 'full-time',
        experience: 'mid',
        salary: {
          min: 80000,
          max: 120000,
          currency: 'USD'
        },
        matchScore: 92,
        description: 'We are looking for a passionate Frontend Developer to join our team.',
        requirements: [
          '3+ years of React experience',
          'Strong JavaScript skills',
          'Experience with TypeScript'
        ],
        benefits: [
          'Health insurance',
          '401k matching',
          'Flexible work hours'
        ],
        skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
        postedDate: '2024-01-10',
        applicationDeadline: '2024-02-10',
        isBookmarked: false,
        isApplied: false,
        remote: true,
        domain: 'Frontend Development'
      },
      {
        id: '2',
        title: 'UI/UX Design Intern',
        company: 'DesignStudio',
        location: 'New York, NY',
        type: 'internship',
        experience: 'entry',
        salary: {
          min: 3000,
          max: 4000,
          currency: 'USD'
        },
        matchScore: 85,
        description: 'Join our design team as an intern and work on exciting projects.',
        requirements: [
          'Portfolio of design work',
          'Familiarity with Figma',
          'Basic understanding of design principles'
        ],
        benefits: [
          'Mentorship program',
          'Learning opportunities',
          'Networking events'
        ],
        skills: ['Figma', 'Adobe Creative Suite', 'Design Thinking', 'Prototyping'],
        postedDate: '2024-01-12',
        applicationDeadline: '2024-01-25',
        isBookmarked: true,
        isApplied: false,
        remote: false,
        domain: 'Design'
      }
    ];

    let filteredJobs = jobs;

    if (type && type !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }

    if (experience && experience !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.experience === experience);
    }

    if (domain && domain !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.domain === domain);
    }

    if (search) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (matchScore) {
      const minScore = parseInt(matchScore);
      filteredJobs = filteredJobs.filter(job => job.matchScore >= minScore);
    }

    res.json({ jobs: filteredJobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.post('/jobs/:id/bookmark', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, bookmarked } = req.body;

    // Mock bookmark - in real implementation, update database
    res.json({ 
      success: true, 
      message: bookmarked ? 'Job bookmarked successfully' : 'Job unbookmarked successfully',
      jobId: id,
      bookmarked
    });
  } catch (error) {
    console.error('Error bookmarking job:', error);
    res.status(500).json({ error: 'Failed to bookmark job' });
  }
});

router.post('/jobs/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, resumeVersion, coverLetter } = req.body;

    // Mock application - in real implementation, create application record
    res.json({ 
      success: true, 
      message: 'Application submitted successfully',
      jobId: id,
      applicationId: Date.now().toString(),
      status: 'submitted'
    });
  } catch (error) {
    console.error('Error applying to job:', error);
    res.status(500).json({ error: 'Failed to apply to job' });
  }
});

// Domain Supply & Demand API routes
router.get('/domains', async (req, res) => {
  try {
    // Mock domain data
    const domains = [
      {
        id: '1',
        name: 'Frontend Development',
        demand: 85,
        supply: 60,
        growth: 12,
        averageSalary: {
          min: 60000,
          max: 120000,
          currency: 'USD'
        },
        topSkills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
        opportunities: 245,
        talent: 180,
        trend: 'up',
        description: 'High demand for frontend developers with modern framework experience',
        companies: ['Google', 'Meta', 'Netflix', 'Airbnb', 'Stripe'],
        locations: ['San Francisco', 'New York', 'Seattle', 'Austin', 'Remote']
      },
      {
        id: '2',
        name: 'Data Science',
        demand: 78,
        supply: 45,
        growth: 18,
        averageSalary: {
          min: 70000,
          max: 140000,
          currency: 'USD'
        },
        topSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'R'],
        opportunities: 189,
        talent: 120,
        trend: 'up',
        description: 'Growing demand for data scientists across all industries',
        companies: ['Amazon', 'Microsoft', 'Tesla', 'Uber', 'Spotify'],
        locations: ['Seattle', 'San Francisco', 'Boston', 'Chicago', 'Remote']
      }
    ];

    res.json({ domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

router.get('/domains/:id/opportunities', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock opportunities for specific domain
    const opportunities = [
      {
        id: '1',
        title: 'Senior React Developer',
        company: 'TechCorp',
        domain: 'Frontend Development',
        type: 'job',
        location: 'San Francisco, CA',
        salary: {
          min: 100000,
          max: 150000,
          currency: 'USD'
        },
        skills: ['React', 'TypeScript', 'GraphQL', 'AWS'],
        postedDate: '2024-01-15',
        applicants: 45,
        urgency: 'high'
      }
    ];

    res.json({ opportunities });
  } catch (error) {
    console.error('Error fetching domain opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch domain opportunities' });
  }
});

router.get('/domains/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const { timeframe = '30d' } = req.query;
    
    // Mock analytics data
    const analytics = {
      domainId: id,
      timeframe,
      demandTrend: [
        { date: '2024-01-01', value: 80 },
        { date: '2024-01-08', value: 82 },
        { date: '2024-01-15', value: 85 }
      ],
      supplyTrend: [
        { date: '2024-01-01', value: 55 },
        { date: '2024-01-08', value: 58 },
        { date: '2024-01-15', value: 60 }
      ],
      salaryTrend: [
        { date: '2024-01-01', value: 90000 },
        { date: '2024-01-08', value: 92000 },
        { date: '2024-01-15', value: 95000 }
      ],
      topSkills: [
        { skill: 'React', demand: 95, supply: 70 },
        { skill: 'JavaScript', demand: 90, supply: 85 },
        { skill: 'TypeScript', demand: 85, supply: 60 }
      ]
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching domain analytics:', error);
    res.status(500).json({ error: 'Failed to fetch domain analytics' });
  }
});

export default router;





