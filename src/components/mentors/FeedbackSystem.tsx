import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  TrendingUp, 
  Award,
  Users,
  Clock,
  Target,
  CheckCircle
} from 'lucide-react';

interface Feedback {
  id: string;
  sessionId: string;
  mentorId: string;
  menteeId: string;
  overallRating: number;
  comment: string;
  categories: {
    communication: number;
    expertise: number;
    helpfulness: number;
    punctuality: number;
    value: number;
  };
  isAnonymous: boolean;
  createdAt: string;
  mentee: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  session: {
    id: string;
    title: string;
    sessionType: string;
    scheduledAt: string;
  };
}

interface FeedbackSystemProps {
  mentorId: string;
  userId: string;
  userRole: 'mentor' | 'mentee';
  onFeedbackSubmitted?: (feedback: Feedback) => void;
}

export function FeedbackSystem({ mentorId, userId, userRole, onFeedbackSubmitted }: FeedbackSystemProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState({
    overallRating: 0,
    comment: '',
    categories: {
      communication: 0,
      expertise: 0,
      helpfulness: 0,
      punctuality: 0,
      value: 0
    },
    isAnonymous: false
  });

  useEffect(() => {
    fetchFeedbacks();
  }, [mentorId]);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/mentors/${mentorId}/feedback`);
      const data = await response.json();
      
      if (data.success) {
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!selectedSessionId) return;

    try {
      const response = await fetch(`/api/mentors/${mentorId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          menteeId: userId,
          ...feedbackData
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowFeedbackDialog(false);
        setSelectedSessionId(null);
        setFeedbackData({
          overallRating: 0,
          comment: '',
          categories: {
            communication: 0,
            expertise: 0,
            helpfulness: 0,
            punctuality: 0,
            value: 0
          },
          isAnonymous: false
        });
        fetchFeedbacks();
        if (onFeedbackSubmitted) onFeedbackSubmitted(data.feedback);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleRatingChange = (rating: number, category?: string) => {
    if (category) {
      setFeedbackData(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [category]: rating
        }
      }));
    } else {
      setFeedbackData(prev => ({
        ...prev,
        overallRating: rating
      }));
    }
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum, feedback) => sum + feedback.overallRating, 0);
    return total / feedbacks.length;
  };

  const getCategoryAverage = (category: keyof Feedback['categories']) => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum, feedback) => sum + feedback.categories[category], 0);
    return total / feedbacks.length;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach(feedback => {
      distribution[feedback.overallRating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    maxRating = 5, 
    size = 'md' 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void; 
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex gap-1">
        {Array.from({ length: maxRating }, (_, i) => (
          <button
            key={i}
            onClick={() => onRatingChange(i + 1)}
            className={`${sizeClasses[size]} ${
              i < rating ? 'text-yellow-500' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const ReadOnlyStarRating = ({ 
    rating, 
    maxRating = 5, 
    size = 'md' 
  }: { 
    rating: number; 
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex gap-1">
        {Array.from({ length: maxRating }, (_, i) => (
          <span
            key={i}
            className={`${sizeClasses[size]} ${
              i < rating ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Mentor Feedback Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {getAverageRating().toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Rating</div>
              <ReadOnlyStarRating rating={Math.round(getAverageRating())} size="lg" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {feedbacks.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round((feedbacks.filter(f => f.overallRating >= 4).length / feedbacks.length) * 100) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Positive Reviews</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Math.round(getCategoryAverage('communication'))}
              </div>
              <div className="text-sm text-muted-foreground">Communication</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(getRatingDistribution()).reverse().map(([rating, count]) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(feedbacks[0]?.categories || {}).map(([category, _]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">
                    {category.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ReadOnlyStarRating rating={Math.round(getCategoryAverage(category as keyof Feedback['categories']))} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    {getCategoryAverage(category as keyof Feedback['categories']).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Form */}
      {userRole === 'mentee' && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Rate Your Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Overall Rating */}
                  <div>
                    <Label className="text-base font-semibold">Overall Rating</Label>
                    <div className="mt-2">
                      <StarRating
                        rating={feedbackData.overallRating}
                        onRatingChange={(rating) => handleRatingChange(rating)}
                        size="lg"
                      />
                    </div>
                  </div>

                  {/* Category Ratings */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Rate by Category</Label>
                    <div className="space-y-4">
                      {Object.entries(feedbackData.categories).map(([category, rating]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {category.replace('_', ' ')}
                          </span>
                          <StarRating
                            rating={rating}
                            onRatingChange={(rating) => handleRatingChange(rating, category)}
                            size="md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <Label htmlFor="comment">Your Review</Label>
                    <Textarea
                      id="comment"
                      value={feedbackData.comment}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this mentor..."
                      rows={4}
                    />
                  </div>

                  {/* Anonymous Option */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={feedbackData.isAnonymous}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      Submit anonymously
                    </Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={submitFeedback}
                      disabled={feedbackData.overallRating === 0}
                    >
                      Submit Review
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                This mentor hasn't received any feedback yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.slice(0, 5).map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {!feedback.isAnonymous ? (
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {feedback.mentee.full_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      ) : (
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">A</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {feedback.isAnonymous ? 'Anonymous' : feedback.mentee.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <ReadOnlyStarRating rating={feedback.overallRating} size="sm" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {feedback.comment}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {Object.entries(feedback.categories).map(([category, rating]) => (
                      <div key={category} className="flex items-center gap-1">
                        <span className="capitalize">{category.replace('_', ' ')}:</span>
                        <ReadOnlyStarRating rating={rating} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
