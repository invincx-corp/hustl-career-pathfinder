import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// SelfGraph API routes
router.get('/selfgraph/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock data for now - in real implementation, fetch from database
    const selfGraphData = {
      id: '1',
      timestamp: '2024-01-15',
      interests: [
        { name: 'Frontend Development', intensity: 85, trend: 'up', category: 'Technical' },
        { name: 'UI/UX Design', intensity: 72, trend: 'up', category: 'Creative' },
        { name: 'Data Science', intensity: 45, trend: 'down', category: 'Technical' },
        { name: 'Leadership', intensity: 68, trend: 'stable', category: 'Soft Skills' }
      ],
      skills: [
        { name: 'React', level: 7, confidence: 8, lastPracticed: '2024-01-14', category: 'Technical' },
        { name: 'JavaScript', level: 8, confidence: 9, lastPracticed: '2024-01-15', category: 'Technical' },
        { name: 'Communication', level: 6, confidence: 7, lastPracticed: '2024-01-10', category: 'Soft Skills' },
        { name: 'Problem Solving', level: 8, confidence: 8, lastPracticed: '2024-01-12', category: 'Soft Skills' }
      ],
      values: [
        { name: 'Innovation', importance: 9, alignment: 8, category: 'Work' },
        { name: 'Work-Life Balance', importance: 8, alignment: 6, category: 'Life' },
        { name: 'Learning', importance: 9, alignment: 9, category: 'Growth' },
        { name: 'Impact', importance: 7, alignment: 5, category: 'Purpose' }
      ],
      confidence: 75,
      energy: 80,
      decisionMaking: 70,
      collaboration: 65,
      learning: 85,
      creativity: 78
    };

    res.json({ selfGraphData });
  } catch (error) {
    console.error('Error fetching SelfGraph data:', error);
    res.status(500).json({ error: 'Failed to fetch SelfGraph data' });
  }
});

router.post('/selfgraph/:userId/update', async (req, res) => {
  try {
    const { userId } = req.params;
    const { interests, skills, values, metrics } = req.body;

    // Mock update - in real implementation, update database
    res.json({ 
      success: true, 
      message: 'SelfGraph updated successfully',
      userId,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating SelfGraph:', error);
    res.status(500).json({ error: 'Failed to update SelfGraph' });
  }
});

router.get('/selfgraph/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = '30d' } = req.query;
    
    // Mock historical data
    const history = [
      {
        date: '2024-01-15',
        confidence: 75,
        energy: 80,
        decisionMaking: 70,
        collaboration: 65,
        learning: 85,
        creativity: 78
      },
      {
        date: '2024-01-14',
        confidence: 72,
        energy: 75,
        decisionMaking: 68,
        collaboration: 62,
        learning: 82,
        creativity: 75
      },
      {
        date: '2024-01-13',
        confidence: 70,
        energy: 78,
        decisionMaking: 65,
        collaboration: 60,
        learning: 80,
        creativity: 72
      }
    ];

    res.json({ history });
  } catch (error) {
    console.error('Error fetching SelfGraph history:', error);
    res.status(500).json({ error: 'Failed to fetch SelfGraph history' });
  }
});

// Living Resume API routes
router.get('/resume/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock resume data
    const resume = {
      id: '1',
      userId,
      summary: 'Passionate frontend developer with 3+ years of experience in React and modern web technologies.',
      skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js'],
      projects: [
        {
          id: 'p1',
          title: 'E-commerce Platform',
          description: 'Built a full-stack e-commerce platform using React and Node.js',
          technologies: ['React', 'Node.js', 'MongoDB'],
          url: 'https://github.com/user/ecommerce',
          completedAt: '2024-01-10'
        }
      ],
      achievements: [
        {
          id: 'a1',
          title: 'React Certification',
          issuer: 'Meta',
          date: '2024-01-05',
          credentialId: 'META-REACT-2024'
        }
      ],
      experience: [
        {
          id: 'e1',
          title: 'Frontend Developer',
          company: 'TechCorp',
          startDate: '2022-01-01',
          endDate: null,
          description: 'Developed user-facing features and ensured great user experience'
        }
      ],
      education: [
        {
          id: 'ed1',
          degree: 'Bachelor of Computer Science',
          institution: 'University of Technology',
          graduationYear: 2021
        }
      ],
      lastUpdated: '2024-01-15T10:30:00Z'
    };

    res.json({ resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

router.post('/resume/:userId/update', async (req, res) => {
  try {
    const { userId } = req.params;
    const { resumeData } = req.body;

    // Mock update - in real implementation, update database
    res.json({ 
      success: true, 
      message: 'Resume updated successfully',
      userId,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

router.post('/resume/:userId/export', async (req, res) => {
  try {
    const { userId } = req.params;
    const { format = 'pdf' } = req.body;

    // Mock export - in real implementation, generate actual file
    const exportUrl = `https://nexa-pathfinder.com/exports/resume-${userId}-${Date.now()}.${format}`;
    
    res.json({ 
      success: true, 
      message: 'Resume exported successfully',
      downloadUrl: exportUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
  } catch (error) {
    console.error('Error exporting resume:', error);
    res.status(500).json({ error: 'Failed to export resume' });
  }
});

export default router;



