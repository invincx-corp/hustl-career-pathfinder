import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, Clock, Target, CheckCircle, Play, ExternalLink,
  Edit, ChevronLeft, ChevronRight, List, Grid3X3, Kanban,
  Hourglass, Award, Zap, Users, Code, Palette, Calculator, 
  Heart, Briefcase, ThumbsUp, ThumbsDown, X, Eye, Calendar,
  TrendingUp, Star, Bookmark, Share2, Download
} from 'lucide-react';

// Interfaces
interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'course' | 'article' | 'video' | 'book' | 'tool';
  description?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  status: 'draft' | 'active' | 'completed';
}

interface Capsule {
  id: string;
  title: string;
  duration: string;
  difficulty: string;
  completed: boolean;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'project' | 'peer_review' | 'certification';
  skills_tested: string[];
  estimated_time: string;
  passing_score: number;
  retake_allowed: boolean;
}

interface LearningStep {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  estimatedTime: string;
  completed: boolean;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  evidenceType: 'project' | 'certification' | 'portfolio' | 'assessment';
  status: 'todo' | 'in_progress' | 'done';
  startedAt?: string;
  completedAt?: string;
  skills: string[];
  projects?: Project[];
  capsules?: Capsule[];
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  progress: number;
  steps: LearningStep[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isGenerated?: boolean;
  mlConfidence?: number;
}

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: Roadmap | null;
  allRoadmaps: Roadmap[];
  onRoadmapSelect: (roadmap: Roadmap) => void;
  onStepUpdate: (stepId: string, updates: Partial<LearningStep>) => void;
  onStepStart: (stepId: string) => void;
  onStepComplete: (stepId: string) => void;
  onStepEdit: (stepId: string) => void;
}

const RoadmapModal: React.FC<RoadmapModalProps> = ({
  isOpen,
  onClose,
  roadmap,
  allRoadmaps,
  onRoadmapSelect,
  onStepUpdate,
  onStepStart,
  onStepComplete,
  onStepEdit
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'learning-path'>('roadmap');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!roadmap) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'project': return <Code className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'portfolio': return <BookOpen className="h-4 w-4" />;
      case 'assessment': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'article': return <BookOpen className="h-4 w-4" />;
      case 'video': return <Play className="h-4 w-4" />;
      case 'book': return <BookOpen className="h-4 w-4" />;
      case 'tool': return <Code className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const completedSteps = roadmap.steps.filter(step => step.completed).length;
  const totalSteps = roadmap.steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar - Roadmap List */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Learning Roadmaps</h2>
              <p className="text-sm text-gray-600">Follow your personalized paths to achieve your career goals.</p>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {allRoadmaps.map((rm) => (
                  <Card 
                    key={rm.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      rm.id === roadmap.id 
                        ? 'ring-2 ring-purple-500 bg-gradient-to-r from-purple-50 to-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onRoadmapSelect(rm)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight">
                          {rm.title}
                        </h3>
                        {rm.isGenerated && (
                          <Badge variant="secondary" className="text-xs">
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(rm.difficulty)}`}
                        >
                          {rm.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Progress</span>
                          <span>{Math.round(rm.progress)}%</span>
                        </div>
                        <Progress value={rm.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{roadmap.title}</h1>
                  <p className="text-gray-600 mb-4">{roadmap.description}</p>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{roadmap.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span className="capitalize">{roadmap.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>{completedSteps}/{totalSteps} steps</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="w-full justify-start rounded-none border-0 bg-transparent">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="roadmap" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Roadmap
                  </TabsTrigger>
                  <TabsTrigger 
                    value="learning-path" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Learning Path
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Tab Content */}
            <ScrollArea className="flex-1 p-6">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-600" />
                          Progress Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Completed Steps</span>
                            <span className="font-medium">{completedSteps}/{totalSteps}</span>
                          </div>
                          <Progress value={progressPercentage} className="h-3" />
                          <div className="text-xs text-gray-600">
                            {totalSteps - completedSteps} steps remaining
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          Time Investment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {roadmap.estimatedDuration}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total estimated time
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="h-5 w-5 text-green-600" />
                          Difficulty
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Badge className={`${getDifficultyColor(roadmap.difficulty)} text-sm px-3 py-1`}>
                            {roadmap.difficulty.charAt(0).toUpperCase() + roadmap.difficulty.slice(1)}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            Skill level required
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skills You'll Learn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {roadmap.steps.flatMap(step => step.skills).slice(0, 20).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {roadmap.steps.flatMap(step => step.skills).length > 20 && (
                          <Badge variant="outline" className="text-xs">
                            +{roadmap.steps.flatMap(step => step.skills).length - 20} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Roadmap Tab */}
                <TabsContent value="roadmap" className="space-y-6">
                  <div className="space-y-6">
                    {roadmap.steps.map((step, index) => (
                      <Card key={step.id} className="overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  step.completed 
                                    ? 'bg-green-100 text-green-700' 
                                    : step.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                                  <div className="flex items-center gap-4 mt-1">
                                    <Badge className={`text-xs ${getDifficultyColor(step.difficulty)}`}>
                                      {step.difficulty}
                                    </Badge>
                                    <Badge className={`text-xs ${getStatusColor(step.status)}`}>
                                      {step.status.replace('_', ' ')}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <Clock className="h-3 w-3" />
                                      {step.estimatedTime}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-600 mt-2">{step.description}</p>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          {/* Resources */}
                          {step.resources && step.resources.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Resources</h4>
                              <div className="flex flex-wrap gap-2">
                                {step.resources.map((resource) => (
                                  <Button
                                    key={resource.id}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={() => window.open(resource.url, '_blank')}
                                  >
                                    {getResourceIcon(resource.type)}
                                    <span className="ml-1">{resource.title}</span>
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {step.skills && step.skills.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                              <div className="flex flex-wrap gap-1">
                                {step.skills.map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Prerequisites */}
                          {step.prerequisites && step.prerequisites.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Prerequisites</h4>
                              <div className="flex flex-wrap gap-1">
                                {step.prerequisites.map((prereq, prereqIndex) => (
                                  <Badge key={prereqIndex} variant="outline" className="text-xs">
                                    {prereq}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                            {!step.completed && step.status === 'todo' && (
                              <Button
                                size="sm"
                                onClick={() => onStepStart(step.id)}
                                className="text-xs"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start Step
                              </Button>
                            )}
                            {step.status === 'in_progress' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStepComplete(step.id)}
                                className="text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onStepEdit(step.id)}
                              className="text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Learning Path Tab */}
                <TabsContent value="learning-path" className="space-y-6">
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Learning Path View</h3>
                    <p className="text-gray-600">
                      This view will show your personalized learning journey with adaptive recommendations.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoadmapModal;
