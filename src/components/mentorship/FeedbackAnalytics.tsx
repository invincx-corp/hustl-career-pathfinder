// Feedback Analytics Dashboard Component
// Displays feedback analytics and insights

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Award,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { feedbackSystem, MentorFeedbackSummary, FeedbackAnalytics } from '@/lib/feedback-system';

interface FeedbackAnalyticsProps {
  mentorId?: string;
  sessionId?: string;
  showMentorView?: boolean;
}

export const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({
  mentorId,
  sessionId,
  showMentorView = false
}) => {
  const [mentorSummary, setMentorSummary] = useState<MentorFeedbackSummary | null>(null);
  const [sessionAnalytics, setSessionAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [platformSummary, setPlatformSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [mentorId, sessionId]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    
    try {
      if (mentorId) {
        const summary = feedbackSystem.getMentorFeedbackSummary(mentorId);
        setMentorSummary(summary);
      }
      
      if (sessionId) {
        const analytics = feedbackSystem.getFeedbackAnalytics(sessionId);
        setSessionAnalytics(analytics);
      }
      
      const platform = feedbackSystem.getPlatformFeedbackSummary();
      setPlatformSummary(platform);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100';
    if (rating >= 3.5) return 'bg-yellow-100';
    if (rating >= 2.5) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderCategoryChart = (categories: any) => {
    const maxRating = 5;
    
    return (
      <div className="space-y-4">
        {Object.entries(categories).map(([category, rating]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-bold ${getRatingColor(rating as number)}`}>
                  {rating}
                </span>
                <span className="text-xs text-gray-500">/5</span>
              </div>
            </div>
            <Progress 
              value={(rating as number / maxRating) * 100} 
              className="h-2"
            />
          </div>
        ))}
      </div>
    );
  };

  const renderTrendChart = (trends: number[], label: string) => {
    const maxValue = Math.max(...trends);
    const minValue = Math.min(...trends);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex items-center space-x-1">
            {trends[trends.length - 1] > trends[0] ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-gray-600">
              {trends[trends.length - 1] > trends[0] ? '+' : ''}
              {((trends[trends.length - 1] - trends[0]) / trends[0] * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex items-end space-x-1 h-16">
          {trends.map((value, index) => (
            <div
              key={index}
              className="bg-blue-500 rounded-t"
              style={{
                height: `${((value - minValue) / (maxValue - minValue)) * 100}%`,
                width: `${100 / trends.length}%`
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overall Rating */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`text-2xl font-bold ${getRatingColor(mentorSummary?.averageRating || 0)}`}>
                    {mentorSummary?.averageRating || 0}
                  </div>
                  <div className="text-sm text-gray-500">/5</div>
                </div>
                <div className="mt-2">
                  {renderStars(mentorSummary?.averageRating || 0, 'sm')}
                </div>
              </CardContent>
            </Card>

            {/* Total Sessions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {mentorSummary?.totalSessions || 0}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </CardContent>
            </Card>

            {/* Feedback Count */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Feedback Received</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {mentorSummary?.totalFeedback || 0}
                </div>
                <div className="text-sm text-gray-500">Reviews</div>
              </CardContent>
            </Card>

            {/* Recommendation Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Recommendation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((mentorSummary?.feedbackDistribution.excellent + mentorSummary?.feedbackDistribution.good) / 
                    (mentorSummary?.totalFeedback || 1) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Would Recommend</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Ratings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Category Ratings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mentorSummary?.categoryAverages && renderCategoryChart(mentorSummary.categoryAverages)}
            </CardContent>
          </Card>

          {/* Feedback Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Feedback Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mentorSummary?.feedbackDistribution && Object.entries(mentorSummary.feedbackDistribution).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className={`text-2xl font-bold ${
                      key === 'excellent' ? 'text-green-600' :
                      key === 'good' ? 'text-blue-600' :
                      key === 'average' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {value}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Tab */}
        <TabsContent value="detailed" className="space-y-6">
          {/* Strengths and Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span>Top Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mentorSummary?.topStrengths.map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                  {(!mentorSummary?.topStrengths || mentorSummary.topStrengths.length === 0) && (
                    <p className="text-sm text-gray-500">No strengths identified yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mentorSummary?.improvementAreas.map((area, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                  {(!mentorSummary?.improvementAreas || mentorSummary.improvementAreas.length === 0) && (
                    <p className="text-sm text-gray-500">No improvement areas identified</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Analytics */}
          {sessionAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Session Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Engagement</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Mentee Participation</span>
                        <span className="text-sm font-medium">{sessionAnalytics.engagement.menteeParticipation}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Mentor Participation</span>
                        <span className="text-sm font-medium">{sessionAnalytics.engagement.mentorParticipation}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Interactions</span>
                        <span className="text-sm font-medium">{sessionAnalytics.engagement.interactionCount}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Content</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Topics Covered</span>
                        <span className="text-sm font-medium">{sessionAnalytics.content.topicsCovered.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Action Items</span>
                        <span className="text-sm font-medium">{sessionAnalytics.content.actionItemsCreated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Resources Shared</span>
                        <span className="text-sm font-medium">{sessionAnalytics.content.resourcesShared}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Outcomes</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Goals Achieved</span>
                        <span className="text-sm font-medium">{sessionAnalytics.outcomes.goalsAchieved.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Next Steps</span>
                        <span className="text-sm font-medium">{sessionAnalytics.outcomes.nextSteps.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Satisfaction</span>
                        <span className="text-sm font-medium">{sessionAnalytics.outcomes.satisfactionScore}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {/* Rating Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Rating Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mentorSummary?.recentTrends && (
                <div className="space-y-6">
                  {renderTrendChart(mentorSummary.recentTrends.rating, 'Overall Rating')}
                  {renderTrendChart(mentorSummary.recentTrends.recommendationRate, 'Recommendation Rate')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Summary */}
          {platformSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Platform Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {platformSummary.totalFeedback}
                    </div>
                    <div className="text-sm text-gray-600">Total Feedback</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {platformSummary.averageRating}
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(platformSummary.recommendationRate * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Recommendation Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(platformSummary.responseRate * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Response Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
