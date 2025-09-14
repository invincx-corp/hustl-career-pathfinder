// Feedback Form Component
// Form for submitting session feedback and ratings

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Target,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Heart,
  Zap
} from 'lucide-react';
import { feedbackSystem, SessionFeedback } from '@/lib/feedback-system';
import { useAuth } from '@/hooks/useAuth';

interface FeedbackFormProps {
  sessionId: string;
  revieweeId: string;
  reviewerType: 'mentor' | 'mentee';
  onFeedbackSubmitted?: (feedback: SessionFeedback) => void;
  onCancel?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  sessionId,
  revieweeId,
  reviewerType,
  onFeedbackSubmitted,
  onCancel
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    review: '',
    categories: {
      communication: 0,
      expertise: 0,
      helpfulness: 0,
      punctuality: 0,
      preparation: 0
    },
    tags: [] as string[],
    suggestions: [] as string[],
    wouldRecommend: false,
    sessionValue: 'good' as 'excellent' | 'good' | 'average' | 'poor',
    highlights: [] as string[],
    areasForImprovement: [] as string[],
    followUpNeeded: false
  });

  const [newTag, setNewTag] = useState('');
  const [newSuggestion, setNewSuggestion] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [newImprovement, setNewImprovement] = useState('');

  const availableTags = [
    'Knowledgeable', 'Patient', 'Clear Communication', 'Helpful',
    'Professional', 'Engaging', 'Well-prepared', 'Punctual',
    'Encouraging', 'Challenging', 'Supportive', 'Expert'
  ];

  const availableSuggestions = [
    'More examples', 'Additional resources', 'Follow-up session',
    'Different approach', 'More practice exercises', 'Slower pace',
    'Faster pace', 'More interaction', 'Less theory', 'More hands-on'
  ];

  const handleRatingChange = (rating: number) => {
    setFeedbackData(prev => ({ ...prev, rating }));
  };

  const handleCategoryRatingChange = (category: string, rating: number) => {
    setFeedbackData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: rating
      }
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFeedbackData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addCustomTag = () => {
    if (newTag.trim() && !feedbackData.tags.includes(newTag.trim())) {
      setFeedbackData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const addSuggestion = () => {
    if (newSuggestion.trim() && !feedbackData.suggestions.includes(newSuggestion.trim())) {
      setFeedbackData(prev => ({
        ...prev,
        suggestions: [...prev.suggestions, newSuggestion.trim()]
      }));
      setNewSuggestion('');
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim() && !feedbackData.highlights.includes(newHighlight.trim())) {
      setFeedbackData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }));
      setNewHighlight('');
    }
  };

  const addImprovement = () => {
    if (newImprovement.trim() && !feedbackData.areasForImprovement.includes(newImprovement.trim())) {
      setFeedbackData(prev => ({
        ...prev,
        areasForImprovement: [...prev.areasForImprovement, newImprovement.trim()]
      }));
      setNewImprovement('');
    }
  };

  const removeItem = (list: string[], item: string, setter: (items: string[]) => void) => {
    setter(list.filter(i => i !== item));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const feedback = feedbackSystem.submitFeedback(
        sessionId,
        user.id,
        revieweeId,
        reviewerType,
        feedbackData
      );

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(feedback);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return feedbackData.rating > 0;
      case 2:
        return Object.values(feedbackData.categories).every(rating => rating > 0);
      case 3:
        return feedbackData.review.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8';
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`${sizeClass} ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Session Feedback</CardTitle>
          <p className="text-center text-gray-600">
            Help improve the mentoring experience by sharing your feedback
          </p>
        </CardHeader>
        <CardContent>
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Tabs value={currentStep.toString()} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="1">Overall Rating</TabsTrigger>
              <TabsTrigger value="2">Categories</TabsTrigger>
              <TabsTrigger value="3">Review</TabsTrigger>
              <TabsTrigger value="4">Additional</TabsTrigger>
            </TabsList>

            {/* Step 1: Overall Rating */}
            <TabsContent value="1" className="space-y-6">
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    How would you rate this session overall?
                  </h3>
                  <div className="flex justify-center">
                    {renderStars(feedbackData.rating, handleRatingChange, 'lg')}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {feedbackData.rating === 0 && 'Please select a rating'}
                    {feedbackData.rating === 1 && 'Poor - Not helpful at all'}
                    {feedbackData.rating === 2 && 'Fair - Somewhat helpful'}
                    {feedbackData.rating === 3 && 'Good - Generally helpful'}
                    {feedbackData.rating === 4 && 'Very Good - Very helpful'}
                    {feedbackData.rating === 5 && 'Excellent - Extremely helpful'}
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-medium mb-3">How would you describe the session value?</h4>
                  <RadioGroup
                    value={feedbackData.sessionValue}
                    onValueChange={(value) => setFeedbackData(prev => ({ ...prev, sessionValue: value as any }))}
                    className="flex justify-center space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excellent" id="excellent" />
                      <Label htmlFor="excellent" className="flex items-center space-x-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>Excellent</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="good" id="good" />
                      <Label htmlFor="good" className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span>Good</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="average" id="average" />
                      <Label htmlFor="average" className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                        <span>Average</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="poor" id="poor" />
                      <Label htmlFor="poor" className="flex items-center space-x-1">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        <span>Poor</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>

            {/* Step 2: Category Ratings */}
            <TabsContent value="2" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-6">Rate specific aspects of the session</h3>
                <div className="space-y-6">
                  {Object.entries(feedbackData.categories).map(([category, rating]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <span className="text-sm text-gray-600">{rating}/5</span>
                      </div>
                      <div className="flex justify-center">
                        {renderStars(rating, (newRating) => handleCategoryRatingChange(category, newRating))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Step 3: Written Review */}
            <TabsContent value="3" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Share your detailed feedback</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="review">Your Review *</Label>
                    <Textarea
                      id="review"
                      value={feedbackData.review}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, review: e.target.value }))}
                      placeholder="Share your thoughts about the session, what went well, and what could be improved..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label>Session Highlights</Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="What went particularly well?"
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
                        />
                        <Button onClick={addHighlight} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {feedbackData.highlights.map((highlight, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <span>{highlight}</span>
                            <button
                              onClick={() => removeItem(feedbackData.highlights, highlight, (items) => 
                                setFeedbackData(prev => ({ ...prev, highlights: items }))
                              )}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Areas for Improvement</Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="What could be improved?"
                          value={newImprovement}
                          onChange={(e) => setNewImprovement(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addImprovement()}
                        />
                        <Button onClick={addImprovement} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {feedbackData.areasForImprovement.map((improvement, index) => (
                          <Badge key={index} variant="outline" className="flex items-center space-x-1">
                            <span>{improvement}</span>
                            <button
                              onClick={() => removeItem(feedbackData.areasForImprovement, improvement, (items) => 
                                setFeedbackData(prev => ({ ...prev, areasForImprovement: items }))
                              )}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Step 4: Additional Feedback */}
            <TabsContent value="4" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Feedback</h3>
                <div className="space-y-6">
                  {/* Tags */}
                  <div>
                    <Label>Session Tags</Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a custom tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                        />
                        <Button onClick={addCustomTag} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              feedbackData.tags.includes(tag)
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      {feedbackData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {feedbackData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                              <span>{tag}</span>
                              <button
                                onClick={() => removeItem(feedbackData.tags, tag, (items) => 
                                  setFeedbackData(prev => ({ ...prev, tags: items }))
                                )}
                                className="ml-1 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <Label>Suggestions for Improvement</Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a suggestion..."
                          value={newSuggestion}
                          onChange={(e) => setNewSuggestion(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSuggestion()}
                        />
                        <Button onClick={addSuggestion} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              if (!feedbackData.suggestions.includes(suggestion)) {
                                setFeedbackData(prev => ({
                                  ...prev,
                                  suggestions: [...prev.suggestions, suggestion]
                                }));
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              feedbackData.suggestions.includes(suggestion)
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                      {feedbackData.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {feedbackData.suggestions.map((suggestion, index) => (
                            <Badge key={index} variant="outline" className="flex items-center space-x-1">
                              <span>{suggestion}</span>
                              <button
                                onClick={() => removeItem(feedbackData.suggestions, suggestion, (items) => 
                                  setFeedbackData(prev => ({ ...prev, suggestions: items }))
                                )}
                                className="ml-1 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recommend"
                        checked={feedbackData.wouldRecommend}
                        onCheckedChange={(checked) => setFeedbackData(prev => ({ ...prev, wouldRecommend: !!checked }))}
                      />
                      <Label htmlFor="recommend" className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>Would you recommend this mentor to others?</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="followUp"
                        checked={feedbackData.followUpNeeded}
                        onCheckedChange={(checked) => setFeedbackData(prev => ({ ...prev, followUpNeeded: !!checked }))}
                      />
                      <Label htmlFor="followUp" className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span>Would you like a follow-up session?</span>
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep) || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
