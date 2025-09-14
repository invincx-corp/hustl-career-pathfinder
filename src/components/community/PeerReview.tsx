import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Star, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award,
  Target,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Edit
} from 'lucide-react';

interface PeerReview {
  id: string;
  reviewerId: string;
  revieweeId: string;
  projectId?: string;
  skillId?: string;
  reviewType: 'project' | 'skill';
  overallRating: number;
  comment: string;
  categories: {
    quality: number;
    creativity: number;
    technical_skill: number;
    communication: number;
    collaboration: number;
  };
  isAnonymous: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  reviewee: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  project?: {
    id: string;
    title: string;
    description: string;
    technologies: string[];
  };
  skill?: {
    id: string;
    name: string;
    category: string;
  };
}

interface PeerReviewProps {
  userId: string;
  onReviewSubmitted?: (review: PeerReview) => void;
}

export function PeerReview({ userId, onReviewSubmitted }: PeerReviewProps) {
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PeerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'project' | 'skill' } | null>(null);
  const [reviewData, setReviewData] = useState({
    overallRating: 0,
    comment: '',
    categories: {
      quality: 0,
      creativity: 0,
      technical_skill: 0,
      communication: 0,
      collaboration: 0
    },
    isAnonymous: false
  });

  useEffect(() => {
    fetchReviews();
    fetchPendingReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/community/peer-reviews?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const response = await fetch(`/api/community/pending-reviews?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setPendingReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  };

  const submitReview = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch(`/api/community/peer-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerId: userId,
          revieweeId: selectedItem.id,
          projectId: selectedItem.type === 'project' ? selectedItem.id : undefined,
          skillId: selectedItem.type === 'skill' ? selectedItem.id : undefined,
          reviewType: selectedItem.type,
          ...reviewData
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowReviewDialog(false);
        setSelectedItem(null);
        setReviewData({
          overallRating: 0,
          comment: '',
          categories: {
            quality: 0,
            creativity: 0,
            technical_skill: 0,
            communication: 0,
            collaboration: 0
          },
          isAnonymous: false
        });
        fetchReviews();
        fetchPendingReviews();
        if (onReviewSubmitted) onReviewSubmitted(data.review);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleRatingChange = (rating: number, category?: string) => {
    if (category) {
      setReviewData(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [category]: rating
        }
      }));
    } else {
      setReviewData(prev => ({
        ...prev,
        overallRating: rating
      }));
    }
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

  const getAverageRating = (reviews: PeerReview[]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.overallRating, 0);
    return total / reviews.length;
  };

  const getCategoryAverage = (reviews: PeerReview[], category: keyof PeerReview['categories']) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.categories[category], 0);
    return total / reviews.length;
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Peer Review System</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {reviews.length} Reviews Given
          </Badge>
          <Badge variant="outline">
            {pendingReviews.length} Pending
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="received">Received Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground">
                  You haven't submitted any peer reviews yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {review.reviewType === 'project' ? review.project?.title : review.skill?.name}
                          </h3>
                          <Badge variant="outline">
                            {review.reviewType}
                          </Badge>
                          <Badge className={
                            review.status === 'approved' ? 'bg-green-100 text-green-800' :
                            review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {review.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          Review for {review.reviewee.full_name}
                        </p>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Overall:</span>
                            <ReadOnlyStarRating rating={review.overallRating} size="sm" />
                            <span className="text-sm text-muted-foreground">
                              {review.overallRating}/5
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {review.comment}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {Object.entries(review.categories).map(([category, rating]) => (
                            <div key={category} className="flex items-center gap-1">
                              <span className="capitalize">{category.replace('_', ' ')}:</span>
                              <ReadOnlyStarRating rating={rating} size="sm" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Reviews</h3>
                <p className="text-muted-foreground">
                  You don't have any pending review requests.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {review.reviewType === 'project' ? review.project?.title : review.skill?.name}
                          </h3>
                          <Badge variant="outline">
                            {review.reviewType}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          Review request from {review.reviewer.full_name}
                        </p>

                        {review.reviewType === 'project' && review.project && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-2">
                              {review.project.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {review.project.technologies.map((tech, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedItem({
                                id: review.reviewType === 'project' ? review.projectId! : review.skillId!,
                                type: review.reviewType
                              });
                              setShowReviewDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Write Review
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <Card>
            <CardContent className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Received Reviews</h3>
              <p className="text-muted-foreground">
                Reviews you've received from peers will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write Peer Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedItem && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">
                    Reviewing {selectedItem.type}: {selectedItem.id}
                  </span>
                </div>
              </div>
            )}

            {/* Overall Rating */}
            <div>
              <Label className="text-base font-semibold">Overall Rating</Label>
              <div className="mt-2">
                <StarRating
                  rating={reviewData.overallRating}
                  onRatingChange={(rating) => handleRatingChange(rating)}
                  size="lg"
                />
              </div>
            </div>

            {/* Category Ratings */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Rate by Category</Label>
              <div className="space-y-4">
                {Object.entries(reviewData.categories).map(([category, rating]) => (
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
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your honest feedback about this work..."
                rows={4}
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={reviewData.isAnonymous}
                onChange={(e) => setReviewData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
              />
              <Label htmlFor="anonymous" className="text-sm">
                Submit anonymously
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitReview}
                disabled={reviewData.overallRating === 0}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
