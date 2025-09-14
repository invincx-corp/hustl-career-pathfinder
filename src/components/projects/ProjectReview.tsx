import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, ExternalLink, Github, FileText, Eye, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ApiService from '@/lib/api-services';

interface ProjectReview {
  id: string;
  project_id: string;
  reviewer_notes: string;
  technical_score: number;
  creativity_score: number;
  presentation_score: number;
  overall_score: number;
  recommendations: string[];
  created_at: string;
  reviewer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  demo_url?: string;
  github_url?: string;
  documentation_url?: string;
  review_score?: number;
  created_at: string;
  created_by: string;
  creator: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ProjectReviewProps {
  projectId?: string;
  showAllProjects?: boolean;
}

const ProjectReview: React.FC<ProjectReviewProps> = ({ projectId, showAllProjects = false }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<ProjectReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    reviewer_notes: '',
    technical_score: 0,
    creativity_score: 0,
    presentation_score: 0,
    overall_score: 0,
    recommendations: [] as string[]
  });
  const [recommendationInput, setRecommendationInput] = useState('');

  useEffect(() => {
    loadData();
  }, [projectId, showAllProjects]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      if (showAllProjects) {
        // Load all submitted projects for review
        const projectsResult = await ApiService.getUserProjects(user.id, { 
          limit: 100,
          status: 'submitted'
        });
        
        if (projectsResult.success) {
          setProjects(projectsResult.data || []);
        }
      } else if (projectId) {
        // Load specific project and its reviews
        const [projectResult, reviewsResult] = await Promise.all([
          ApiService.getUserProjects(user.id, { limit: 1 }).then(result => {
            if (result.success) {
              const project = result.data?.find(p => p.id === projectId);
              return { success: true, data: project };
            }
            return result;
          }),
          ApiService.getProjectReviews(projectId)
        ]);

        if (projectResult.success && projectResult.data) {
          setSelectedProject(projectResult.data);
        }

        if (reviewsResult.success) {
          setReviews(reviewsResult.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedProject || !newReview.reviewer_notes) {
      alert('Please provide review notes');
      return;
    }

    if (newReview.technical_score === 0 || newReview.creativity_score === 0 || 
        newReview.presentation_score === 0 || newReview.overall_score === 0) {
      alert('Please provide all scores');
      return;
    }

    try {
      const result = await ApiService.submitProjectReview(selectedProject.id, {
        reviewer_notes: newReview.reviewer_notes,
        technical_score: newReview.technical_score,
        creativity_score: newReview.creativity_score,
        presentation_score: newReview.presentation_score,
        overall_score: newReview.overall_score,
        recommendations: newReview.recommendations
      });

      if (result.success) {
        setNewReview({
          reviewer_notes: '',
          technical_score: 0,
          creativity_score: 0,
          presentation_score: 0,
          overall_score: 0,
          recommendations: []
        });
        setIsReviewDialogOpen(false);
        await loadData();
        alert('Review submitted successfully!');
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const addRecommendation = () => {
    if (recommendationInput.trim()) {
      setNewReview({
        ...newReview,
        recommendations: [...newReview.recommendations, recommendationInput.trim()]
      });
      setRecommendationInput('');
    }
  };

  const removeRecommendation = (index: number) => {
    setNewReview({
      ...newReview,
      recommendations: newReview.recommendations.filter((_, i) => i !== index)
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < score ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Reviews</h2>
        {selectedProject && (
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Review: {selectedProject.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Review Notes *</label>
                  <Textarea
                    value={newReview.reviewer_notes}
                    onChange={(e) => setNewReview({ ...newReview, reviewer_notes: e.target.value })}
                    placeholder="Provide detailed feedback on the project..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Technical Score *</label>
                    <Select
                      value={newReview.technical_score.toString()}
                      onValueChange={(value) => setNewReview({ ...newReview, technical_score: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select score" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                          <SelectItem key={score} value={score.toString()}>
                            {score} - {getScoreStars(score)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Creativity Score *</label>
                    <Select
                      value={newReview.creativity_score.toString()}
                      onValueChange={(value) => setNewReview({ ...newReview, creativity_score: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select score" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                          <SelectItem key={score} value={score.toString()}>
                            {score} - {getScoreStars(score)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Presentation Score *</label>
                    <Select
                      value={newReview.presentation_score.toString()}
                      onValueChange={(value) => setNewReview({ ...newReview, presentation_score: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select score" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                          <SelectItem key={score} value={score.toString()}>
                            {score} - {getScoreStars(score)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Overall Score *</label>
                    <Select
                      value={newReview.overall_score.toString()}
                      onValueChange={(value) => setNewReview({ ...newReview, overall_score: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select score" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                          <SelectItem key={score} value={score.toString()}>
                            {score} - {getScoreStars(score)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Recommendations</label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={recommendationInput}
                      onChange={(e) => setRecommendationInput(e.target.value)}
                      placeholder="Add a recommendation..."
                      onKeyPress={(e) => e.key === 'Enter' && addRecommendation()}
                    />
                    <Button onClick={addRecommendation} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {newReview.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{rec}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRecommendation(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSubmitReview} className="w-full">
                  Submit Review
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {showAllProjects && (
        <Card>
          <CardHeader>
            <CardTitle>Projects Awaiting Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{project.description}</p>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={project.creator.avatar_url} />
                        <AvatarFallback>{project.creator.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{project.creator.full_name}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.demo_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-3 w-3 mr-1" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {project.github_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3 w-3 mr-1" />
                            Code
                          </a>
                        </Button>
                      )}
                      {project.documentation_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.documentation_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-3 w-3 mr-1" />
                            Docs
                          </a>
                        </Button>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setSelectedProject(project);
                        setIsReviewDialogOpen(true);
                      }}
                    >
                      Review Project
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedProject.title}</h3>
                <p className="text-gray-600">{selectedProject.description}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={selectedProject.creator.avatar_url} />
                    <AvatarFallback>{selectedProject.creator.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{selectedProject.creator.full_name}</span>
                </div>
                <Badge variant="outline">{selectedProject.status}</Badge>
                {selectedProject.review_score && (
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">Score:</span>
                    <span className={`font-semibold ${getScoreColor(selectedProject.review_score)}`}>
                      {selectedProject.review_score.toFixed(1)}
                    </span>
                    <div className="flex">
                      {getScoreStars(Math.round(selectedProject.review_score))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedProject.demo_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={selectedProject.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Demo
                    </a>
                  </Button>
                )}
                {selectedProject.github_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={selectedProject.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-3 w-3 mr-1" />
                      View Code
                    </a>
                  </Button>
                )}
                {selectedProject.documentation_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={selectedProject.documentation_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3 w-3 mr-1" />
                      View Docs
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={review.reviewer.avatar_url} />
                        <AvatarFallback>{review.reviewer.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.reviewer.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(review.overall_score)}`}>
                        {review.overall_score}/10
                      </div>
                      <div className="flex">
                        {getScoreStars(review.overall_score)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Technical</p>
                      <p className={`font-semibold ${getScoreColor(review.technical_score)}`}>
                        {review.technical_score}/10
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Creativity</p>
                      <p className={`font-semibold ${getScoreColor(review.creativity_score)}`}>
                        {review.creativity_score}/10
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Presentation</p>
                      <p className={`font-semibold ${getScoreColor(review.presentation_score)}`}>
                        {review.presentation_score}/10
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{review.reviewer_notes}</p>

                  {review.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Recommendations:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {review.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectReview;


