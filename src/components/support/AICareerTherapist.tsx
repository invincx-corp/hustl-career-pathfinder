import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Brain, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Calendar,
  Users,
  BookOpen,
  Phone,
  Mail,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface MoodEntry {
  id: string;
  date: string;
  mood: 'happy' | 'neutral' | 'sad' | 'anxious' | 'frustrated';
  energy: number;
  stress: number;
  notes?: string;
}

interface WellnessCheck {
  id: string;
  date: string;
  overallScore: number;
  stressLevel: number;
  motivation: number;
  confidence: number;
  sleep: number;
  social: number;
  work: number;
  recommendations: string[];
}

interface Resource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'exercise' | 'meditation' | 'helpline';
  description: string;
  duration: string;
  category: 'stress' | 'anxiety' | 'motivation' | 'general';
  url?: string;
}

const mockMoodEntries: MoodEntry[] = [
  {
    id: '1',
    date: '2024-01-15',
    mood: 'happy',
    energy: 8,
    stress: 3,
    notes: 'Had a great mentor session today!'
  },
  {
    id: '2',
    date: '2024-01-14',
    mood: 'neutral',
    energy: 6,
    stress: 5,
    notes: 'Feeling a bit overwhelmed with the new project'
  },
  {
    id: '3',
    date: '2024-01-13',
    mood: 'anxious',
    energy: 4,
    stress: 7,
    notes: 'Worried about the upcoming interview'
  }
];

const mockWellnessChecks: WellnessCheck[] = [
  {
    id: '1',
    date: '2024-01-15',
    overallScore: 7.5,
    stressLevel: 4,
    motivation: 8,
    confidence: 7,
    sleep: 6,
    social: 8,
    work: 7,
    recommendations: [
      'Consider practicing mindfulness for 10 minutes daily',
      'Schedule regular breaks during work sessions',
      'Connect with your mentor about interview preparation'
    ]
  }
];

const mockResources: Resource[] = [
  {
    id: '1',
    title: '5-Minute Breathing Exercise',
    type: 'meditation',
    description: 'A quick breathing exercise to reduce stress and anxiety',
    duration: '5 minutes',
    category: 'stress',
    url: '#'
  },
  {
    id: '2',
    title: 'Building Confidence in Interviews',
    type: 'article',
    description: 'Tips and techniques to boost your confidence during interviews',
    duration: '10 minutes',
    category: 'anxiety',
    url: '#'
  },
  {
    id: '3',
    title: 'Motivation Boost Workout',
    type: 'exercise',
    description: 'Light physical activity to increase energy and motivation',
    duration: '15 minutes',
    category: 'motivation',
    url: '#'
  },
  {
    id: '4',
    title: 'Crisis Support Helpline',
    type: 'helpline',
    description: '24/7 support for immediate help and guidance',
    duration: 'Available 24/7',
    category: 'general',
    url: 'tel:988'
  }
];

const AICareerTherapist = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(mockMoodEntries);
  const [wellnessChecks, setWellnessChecks] = useState<WellnessCheck[]>(mockWellnessChecks);
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [stressLevel, setStressLevel] = useState<number>(5);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="h-5 w-5 text-green-600" />;
      case 'neutral': return <Meh className="h-5 w-5 text-yellow-600" />;
      case 'sad': return <Frown className="h-5 w-5 text-red-600" />;
      case 'anxious': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'frustrated': return <Frown className="h-5 w-5 text-red-600" />;
      default: return <Meh className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'bg-green-100 text-green-800 border-green-200';
      case 'neutral': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sad': return 'bg-red-100 text-red-800 border-red-200';
      case 'anxious': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'frustrated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="h-4 w-4" />;
      case 'video': return <MessageCircle className="h-4 w-4" />;
      case 'exercise': return <Activity className="h-4 w-4" />;
      case 'meditation': return <Brain className="h-4 w-4" />;
      case 'helpline': return <Phone className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getResourceColor = (category: string) => {
    switch (category) {
      case 'stress': return 'bg-blue-100 text-blue-800';
      case 'anxiety': return 'bg-orange-100 text-orange-800';
      case 'motivation': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-600';
    if (score >= 6) return 'bg-yellow-600';
    if (score >= 4) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const handleMoodSubmit = () => {
    if (!selectedMood) return;

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood as any,
      energy: energyLevel,
      stress: stressLevel,
      notes: ''
    };

    setMoodEntries(prev => [newEntry, ...prev]);
    setSelectedMood('');
    setEnergyLevel(5);
    setStressLevel(5);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          AI Career Therapist
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your emotional well-being companion, here to support you through the ups and downs of your career journey
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mood">Mood Tracking</TabsTrigger>
          <TabsTrigger value="wellness">Wellness Check</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span>Overall Well-being</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(wellnessChecks[0]?.overallScore || 0)}`}>
                  {wellnessChecks[0]?.overallScore || 0}/10
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getScoreBgColor(wellnessChecks[0]?.overallScore || 0)}`}
                    style={{ width: `${(wellnessChecks[0]?.overallScore || 0) * 10}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on your recent wellness check
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Stress Level</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(10 - (wellnessChecks[0]?.stressLevel || 0))}`}>
                  {wellnessChecks[0]?.stressLevel || 0}/10
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getScoreBgColor(10 - (wellnessChecks[0]?.stressLevel || 0))}`}
                    style={{ width: `${(wellnessChecks[0]?.stressLevel || 0) * 10}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Lower is better for stress levels
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span>Motivation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(wellnessChecks[0]?.motivation || 0)}`}>
                  {wellnessChecks[0]?.motivation || 0}/10
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getScoreBgColor(wellnessChecks[0]?.motivation || 0)}`}
                    style={{ width: `${(wellnessChecks[0]?.motivation || 0) * 10}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your current motivation level
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Safety & Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">You're doing well!</span>
                </div>
                <p className="text-sm text-green-700">
                  Your recent mood and wellness indicators show you're managing well. 
                  Remember to take breaks and reach out if you need support.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How are you feeling today?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Select your mood:</label>
                <div className="grid grid-cols-5 gap-3">
                  {['happy', 'neutral', 'sad', 'anxious', 'frustrated'].map((mood) => (
                    <Button
                      key={mood}
                      variant={selectedMood === mood ? 'default' : 'outline'}
                      className="flex flex-col items-center space-y-2 h-20"
                      onClick={() => setSelectedMood(mood)}
                    >
                      {getMoodIcon(mood)}
                      <span className="text-xs capitalize">{mood}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Energy Level: {energyLevel}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stress Level: {stressLevel}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <Button onClick={handleMoodSubmit} disabled={!selectedMood} className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Record Mood
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Mood Entries</h3>
            {moodEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMoodIcon(entry.mood)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium capitalize">{entry.mood}</span>
                          <Badge className={getMoodColor(entry.mood)}>
                            {entry.mood}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Energy: {entry.energy}/10 • Stress: {entry.stress}/10
                        </p>
                        {entry.notes && (
                          <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wellness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wellness Check Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {wellnessChecks.map((check) => (
                  <div key={check.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Overall Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(check.overallScore)}`}>
                        {check.overallScore}/10
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Stress Level</span>
                        <span>{check.stressLevel}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreBgColor(10 - check.stressLevel)}`}
                          style={{ width: `${check.stressLevel * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Motivation</span>
                        <span>{check.motivation}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreBgColor(check.motivation)}`}
                          style={{ width: `${check.motivation * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Confidence</span>
                        <span>{check.confidence}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreBgColor(check.confidence)}`}
                          style={{ width: `${check.confidence * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wellnessChecks[0]?.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={getResourceColor(resource.category)}>
                              {resource.category}
                            </Badge>
                            <span className="text-sm text-gray-600">{resource.duration}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{resource.description}</p>
                      <div className="flex space-x-2">
                        <Button size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Access Resource
                        </Button>
                        {resource.type === 'helpline' && (
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AICareerTherapist;





