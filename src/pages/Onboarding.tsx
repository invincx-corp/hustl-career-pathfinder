import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Target, 
  BookOpen, 
  MapPin, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Brain,
  Map
} from 'lucide-react';
import SkillAssessment from '@/components/assessment/SkillAssessment';
import RoadmapGenerator from '@/components/roadmap/RoadmapGenerator';

import { UNIVERSAL_CAREER_DATABASE, getAllCareers } from '@/lib/universal-career-database';

// Generate comprehensive interests from all career domains
const INTERESTS = [
  // Technology & Digital
  'Programming', 'Data Science', 'AI/ML', 'Cybersecurity', 'Web Development', 'Mobile Development',
  'Software Engineering', 'DevOps', 'Cloud Computing', 'Blockchain',
  
  // Healthcare & Medical
  'Patient Care', 'Medical Research', 'Mental Health', 'Physical Therapy', 'Nursing', 'Public Health',
  'Pharmaceuticals', 'Medical Technology', 'Healthcare Administration',
  
  // Education & Training
  'Teaching', 'Educational Technology', 'Curriculum Development', 'Student Counseling', 'Academic Research',
  'Training & Development', 'Educational Leadership',
  
  // Creative Arts & Design
  'Graphic Design', 'UI/UX Design', 'Photography', 'Video Production', 'Animation', 'Illustration',
  'Branding', 'Content Creation', 'Digital Art', 'Fashion Design',
  
  // Business & Finance
  'Business Analysis', 'Financial Planning', 'Investment', 'Marketing', 'Sales', 'Entrepreneurship',
  'Project Management', 'Operations', 'Strategy', 'Consulting',
  
  // Agriculture & Environment
  'Sustainable Agriculture', 'Environmental Science', 'Conservation', 'Food Science', 'Agricultural Technology',
  'Renewable Energy', 'Climate Change', 'Wildlife Biology',
  
  // Hospitality & Tourism
  'Hotel Management', 'Event Planning', 'Travel', 'Culinary Arts', 'Customer Service', 'Tourism',
  'Restaurant Management', 'Catering',
  
  // Manufacturing & Engineering
  'Mechanical Engineering', 'Industrial Design', 'Quality Control', 'Manufacturing', 'Product Development',
  'Aerospace', 'Automotive', 'Robotics',
  
  // Arts & Entertainment
  'Acting', 'Music', 'Dance', 'Theater', 'Film Production', 'Writing', 'Journalism', 'Broadcasting',
  'Gaming', 'Sports', 'Fitness',
  
  // Public Service & Government
  'Law Enforcement', 'Public Policy', 'Social Work', 'Non-profit', 'Government Administration',
  'Legal Services', 'Emergency Services',
  
  // Transportation & Logistics
  'Logistics', 'Supply Chain', 'Transportation', 'Shipping', 'Warehousing', 'Fleet Management',
  'International Trade',
  
  // General Skills
  'Communication', 'Leadership', 'Problem Solving', 'Creativity', 'Analytical Thinking',
  'Teamwork', 'Time Management', 'Adaptability', 'Languages', 'Research'
];

// Generate comprehensive skills from all career domains
const SKILLS = [
  // Technology Skills
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'HTML/CSS', 'SQL', 'Git',
  'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis',
  
  // Design Skills
  'Adobe Creative Suite', 'Figma', 'Sketch', 'Photoshop', 'Illustrator', 'InDesign',
  'UI/UX Design', 'Typography', 'Color Theory', 'Branding',
  
  // Business Skills
  'Project Management', 'Financial Analysis', 'Marketing', 'Sales', 'Business Strategy',
  'Excel', 'PowerBI', 'Tableau', 'CRM', 'Digital Marketing',
  
  // Healthcare Skills
  'Patient Care', 'Medical Terminology', 'Clinical Skills', 'Healthcare Administration',
  'Medical Records', 'HIPAA Compliance', 'Emergency Response',
  
  // Education Skills
  'Curriculum Development', 'Classroom Management', 'Educational Technology', 'Assessment',
  'Student Counseling', 'Training Design', 'Learning Management Systems',
  
  // Creative Skills
  'Photography', 'Video Editing', 'Animation', 'Writing', 'Content Creation', 'Social Media',
  'Graphic Design', 'Illustration', 'Music Production',
  
  // Engineering Skills
  'CAD', 'Engineering Design', 'Manufacturing', 'Quality Control', 'Process Improvement',
  'Technical Writing', 'System Analysis',
  
  // Communication Skills
  'Public Speaking', 'Written Communication', 'Presentation Skills', 'Negotiation',
  'Cross-cultural Communication', 'Conflict Resolution',
  
  // Soft Skills
  'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking', 'Time Management',
  'Adaptability', 'Emotional Intelligence', 'Customer Service'
];

// Generate comprehensive goals from all career domains
const GOALS = [
  // Career Development
  'Get a job in my field', 'Change careers', 'Get promoted', 'Start my own business',
  'Become a manager', 'Become an expert in my field', 'Work internationally',
  
  // Learning & Growth
  'Learn new skills', 'Earn certifications', 'Complete a degree', 'Attend conferences',
  'Join professional organizations', 'Find a mentor', 'Become a mentor',
  
  // Financial Goals
  'Increase my salary', 'Achieve financial independence', 'Save for retirement',
  'Pay off student loans', 'Invest in my future',
  
  // Work-Life Balance
  'Achieve work-life balance', 'Work remotely', 'Have flexible hours',
  'Spend more time with family', 'Travel while working',
  
  // Impact & Purpose
  'Make a positive impact', 'Help others', 'Contribute to society', 'Work for a cause',
  'Create something meaningful', 'Leave a legacy',
  
  // Personal Development
  'Build confidence', 'Improve communication', 'Develop leadership skills',
  'Network with professionals', 'Build a strong reputation', 'Overcome challenges'
];

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skillAssessmentResults, setSkillAssessmentResults] = useState<any[]>([]);
  const [selectedRoadmaps, setSelectedRoadmaps] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    experience_level: user?.experience_level || 'beginner',
    interests: user?.interests || [],
    skills: user?.skills || [],
    goals: user?.goals || [],
    preferred_learning_style: '',
    country: '',
    city: '',
    timezone: 'UTC',

    skill_assessment_results: [],
    selected_roadmaps: []
  });

  const totalSteps = 7; // Added success step
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const result = await completeOnboarding({
        ...formData,
        skill_assessment_results: skillAssessmentResults,
        selected_roadmaps: selectedRoadmaps
      });
      if (result.success) {
        // Show success message and redirect to dashboard
        console.log('Onboarding completed successfully!');
        
        // Show success state briefly
        setCurrentStep(7); // Success step
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        console.error('Onboarding completion failed:', result.error);
        alert(`Onboarding failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAssessmentComplete = (results: any[]) => {
    setSkillAssessmentResults(results);
    setFormData(prev => ({
      ...prev,
      skill_assessment_results: results
    }));
    // Automatically advance to the next step (roadmap selection)
    setCurrentStep(currentStep + 1);
  };

  const handleRoadmapSelect = (roadmap: any) => {
    setSelectedRoadmaps(prev => [...prev, roadmap]);
    setFormData(prev => ({
      ...prev,
      selected_roadmaps: [...prev.selected_roadmaps, roadmap]
    }));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600">Let's get to know you better</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Choose a unique username"
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => setFormData({ ...formData, experience_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>


            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Interests</h2>
              <p className="text-gray-600">What are you passionate about?</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.interests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer p-2 text-center"
                    onClick={() => setFormData({
                      ...formData,
                      interests: toggleArrayItem(formData.interests, interest)
                    })}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Skills & Goals</h2>
              <p className="text-gray-600">What can you do and what do you want to achieve?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Current Skills</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {SKILLS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={formData.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer p-2 text-center"
                      onClick={() => setFormData({
                        ...formData,
                        skills: toggleArrayItem(formData.skills, skill)
                      })}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Career Goals</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {GOALS.map((goal) => (
                    <Badge
                      key={goal}
                      variant={formData.goals.includes(goal) ? "default" : "outline"}
                      className="cursor-pointer p-2 text-center"
                      onClick={() => setFormData({
                        ...formData,
                        goals: toggleArrayItem(formData.goals, goal)
                      })}
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Location & Preferences</h2>
              <p className="text-gray-600">Help us personalize your experience</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Your country"
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Your city"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="learning-style">Preferred Learning Style</Label>
                <Select
                  value={formData.preferred_learning_style}
                  onValueChange={(value) => setFormData({ ...formData, preferred_learning_style: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How do you learn best?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual (Videos, diagrams, charts)</SelectItem>
                    <SelectItem value="auditory">Auditory (Podcasts, discussions)</SelectItem>
                    <SelectItem value="kinesthetic">Hands-on (Projects, practice)</SelectItem>
                    <SelectItem value="reading">Reading (Books, articles, documentation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" defaultChecked />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <SkillAssessment 
            onComplete={handleSkillAssessmentComplete}
            onSkip={() => setCurrentStep(currentStep + 1)}
          />
        );

      case 6:
        return (
          <RoadmapGenerator
            userInterests={formData.interests}
            userSkills={formData.skills}
            skillLevels={skillAssessmentResults.reduce((acc, result) => {
              acc[result.category] = result.level;
              return acc;
            }, {} as Record<string, string>)}
            skillAssessmentResults={skillAssessmentResults}
            onRoadmapSelect={handleRoadmapSelect}
          />
        );

      case 7:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Nexa! 🎉</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your onboarding is complete! We've created your personalized learning journey based on your interests and skills.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                <ul className="text-left text-blue-800 space-y-1">
                  <li>• Explore your personalized roadmaps</li>
                  <li>• Start your first learning project</li>
                  <li>• Connect with mentors in your field</li>
                  <li>• Track your progress and achievements</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                Redirecting to your dashboard in a moment...
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Welcome to Nexa!</CardTitle>
              <CardDescription>
                Let's set up your personalized learning journey
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
          

          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          {currentStep !== 7 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 6 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
