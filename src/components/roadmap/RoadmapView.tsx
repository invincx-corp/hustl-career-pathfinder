import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  Play, 
  Pause,
  Edit3,
  ExternalLink,
  BookOpen,
  Target,
  Award,
  Users,
  Calendar,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Plus,
  Filter,
  Search
} from 'lucide-react';

interface RoadmapStep {
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

interface Resource {
  id: string;
  title: string;
  type: 'course' | 'article' | 'video' | 'book' | 'practice';
  url: string;
  platform: string;
  rating?: number;
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

interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  tags: string[];
  steps: RoadmapStep[];
  projects?: Project[];
  assessments?: any[];
  estimatedHours: number;
  successProbability: number;
  createdAt: string;
  lastUpdated: string;
  learningStyle?: string;
  skillGaps?: string[];
  marketDemand?: { [key: string]: number };
  personalizationScore?: number;
}

interface RoadmapViewProps {
  roadmap: Roadmap;
  onStepUpdate: (stepId: string, updates: Partial<RoadmapStep>) => void;
  onStepStart: (stepId: string) => void;
  onStepComplete: (stepId: string) => void;
  onStepEdit: (stepId: string) => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({
  roadmap,
  onStepUpdate,
  onStepStart,
  onStepComplete,
  onStepEdit
}) => {
  const [activeView, setActiveView] = useState<'timeline' | 'kanban' | 'list'>('timeline');
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'project': return <Target className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'portfolio': return <BookOpen className="h-4 w-4" />;
      case 'assessment': return <CheckCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const handleStepClick = (step: RoadmapStep) => {
    setSelectedStep(step);
    setIsDrawerOpen(true);
  };

  const handleStepAction = (stepId: string, action: 'start' | 'complete' | 'edit') => {
    switch (action) {
      case 'start':
        onStepStart(stepId);
        break;
      case 'complete':
        onStepComplete(stepId);
        break;
      case 'edit':
        onStepEdit(stepId);
        break;
    }
  };

  // Timeline View Component
  const TimelineView = () => (
    <div className="space-y-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {roadmap.steps.map((step, index) => (
          <div key={step.id} className="relative flex items-start space-x-4 pb-8">
            {/* Timeline dot */}
            <div className={`relative z-10 w-4 h-4 rounded-full border-2 ${
              step.status === 'done' 
                ? 'bg-green-500 border-green-500' 
                : step.status === 'in_progress'
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white border-gray-300'
            }`}>
              {step.status === 'done' && <CheckCircle className="h-3 w-3 text-white absolute -top-0.5 -left-0.5" />}
            </div>
            
            {/* Step content */}
            <Card 
              className={`flex-1 cursor-pointer transition-all duration-200 hover:shadow-md ${
                step.status === 'in_progress' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleStepClick(step)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <Badge className={getDifficultyColor(step.difficulty)}>
                        {step.difficulty}
                      </Badge>
                      <Badge className={getStatusColor(step.status)}>
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{step.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getEvidenceIcon(step.evidenceType)}
                        <span className="capitalize">{step.evidenceType}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>Step {step.order}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    {step.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {step.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {step.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{step.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Prerequisites */}
                    {step.prerequisites.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
                        <div className="flex flex-wrap gap-1">
                          {step.prerequisites.map((prereq) => (
                            <Badge key={prereq} variant="secondary" className="text-xs">
                              {prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    {step.status === 'todo' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStepAction(step.id, 'start');
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {step.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStepAction(step.id, 'complete');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStepAction(step.id, 'edit');
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Resources */}
                {step.resources.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Resources:</p>
                    <div className="flex flex-wrap gap-2">
                      {step.resources.slice(0, 3).map((resource) => (
                        <Button
                          key={resource.id}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(resource.url, '_blank');
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {resource.title}
                        </Button>
                      ))}
                      {step.resources.length > 3 && (
                        <Button variant="outline" size="sm" className="text-xs">
                          +{step.resources.length - 3} more
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  // Kanban View Component
  const KanbanView = () => {
    const todoSteps = roadmap.steps.filter(step => step.status === 'todo');
    const inProgressSteps = roadmap.steps.filter(step => step.status === 'in_progress');
    const doneSteps = roadmap.steps.filter(step => step.status === 'done');

    const StepCard = ({ step }: { step: RoadmapStep }) => (
      <Card 
        className="mb-3 cursor-pointer hover:shadow-md transition-all duration-200"
        onClick={() => handleStepClick(step)}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-sm line-clamp-2">{step.title}</h4>
            <Badge className={getDifficultyColor(step.difficulty)} size="sm">
              {step.difficulty}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{step.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{step.estimatedTime}</span>
            <span>Step {step.order}</span>
          </div>
        </CardContent>
      </Card>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">To Do</h3>
            <Badge variant="outline">{todoSteps.length}</Badge>
          </div>
          <div className="space-y-2">
            {todoSteps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">In Progress</h3>
            <Badge variant="outline">{inProgressSteps.length}</Badge>
          </div>
          <div className="space-y-2">
            {inProgressSteps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Done</h3>
            <Badge variant="outline">{doneSteps.length}</Badge>
          </div>
          <div className="space-y-2">
            {doneSteps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // List View Component
  const ListView = () => (
    <div className="space-y-4">
      {roadmap.steps.map((step) => (
        <Card 
          key={step.id} 
          className="cursor-pointer hover:shadow-md transition-all duration-200"
          onClick={() => handleStepClick(step)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => handleStepAction(step.id, step.completed ? 'start' : 'complete')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>{step.estimatedTime}</span>
                    <Badge className={getDifficultyColor(step.difficulty)}>
                      {step.difficulty}
                    </Badge>
                    <Badge className={getStatusColor(step.status)}>
                      {step.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {step.status === 'todo' && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStepAction(step.id, 'start');
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                {step.status === 'in_progress' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStepAction(step.id, 'complete');
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStepAction(step.id, 'edit');
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
        </div>
      </div>

      {/* Roadmap Content */}
      {activeView === 'timeline' && <TimelineView />}
      {activeView === 'kanban' && <KanbanView />}
      {activeView === 'list' && <ListView />}

      {/* Step Detail Drawer */}
      {isDrawerOpen && selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">{selectedStep.title}</CardTitle>
                <CardDescription>{selectedStep.description}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(false)}
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Estimated Time:</span>
                      <span>{selectedStep.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <Badge className={getDifficultyColor(selectedStep.difficulty)}>
                        {selectedStep.difficulty}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedStep.status)}>
                        {selectedStep.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Evidence Type:</span>
                      <span className="capitalize">{selectedStep.evidenceType}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedStep.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              {selectedStep.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Prerequisites</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedStep.prerequisites.map((prereq) => (
                      <Badge key={prereq} variant="secondary" className="text-xs">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {selectedStep.resources.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Resources</h4>
                  <div className="space-y-2">
                    {selectedStep.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{resource.type === 'course' ? '📚' : resource.type === 'video' ? '🎥' : '📄'}</span>
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-gray-600">{resource.platform}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(resource.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                {selectedStep.status === 'todo' && (
                  <Button
                    onClick={() => {
                      handleStepAction(selectedStep.id, 'start');
                      setIsDrawerOpen(false);
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Step
                  </Button>
                )}
                {selectedStep.status === 'in_progress' && (
                  <Button
                    onClick={() => {
                      handleStepAction(selectedStep.id, 'complete');
                      setIsDrawerOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleStepAction(selectedStep.id, 'edit');
                    setIsDrawerOpen(false);
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Step
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoadmapView;
