import express from 'express';
import { supabase } from '../lib/supabase.js';
import aiService from '../lib/ai-service.js';

const router = express.Router();

// =====================================================
// PEER REVIEW SYSTEM
// =====================================================

// Get peer reviews for a user
router.get('/user/:userId/reviews', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('peer_reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, email, user_metadata),
        reviewee:reviewee_id(id, email, user_metadata)
      `)
      .eq('reviewee_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('review_type', type);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching peer reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    res.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Error fetching peer reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get reviews written by a user
router.get('/user/:userId/written', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('peer_reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, email, user_metadata),
        reviewee:reviewee_id(id, email, user_metadata)
      `)
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('review_type', type);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching written reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    res.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Error fetching written reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create a peer review
router.post('/reviews', async (req, res) => {
  try {
    const {
      reviewer_id,
      reviewee_id,
      review_type,
      target_id,
      rating,
      feedback,
      categories,
      is_anonymous = false,
      is_public = true
    } = req.body;

    if (!reviewer_id || !reviewee_id || !review_type || !feedback) {
      return res.status(400).json({ error: 'Reviewer ID, reviewee ID, review type, and feedback are required' });
    }

    if (reviewer_id === reviewee_id) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }

    // Check if reviewer has already reviewed this target
    if (target_id) {
      const { data: existingReview } = await supabase
        .from('peer_reviews')
        .select('id')
        .eq('reviewer_id', reviewer_id)
        .eq('target_id', target_id)
        .eq('review_type', review_type)
        .single();

      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this item' });
      }
    }

    // Generate AI-enhanced feedback analysis
    const aiAnalysis = await generateFeedbackAnalysis(feedback, review_type, categories);

    const review = {
      reviewer_id,
      reviewee_id,
      review_type,
      target_id,
      rating: rating || null,
      feedback,
      categories: categories || {},
      is_anonymous,
      is_public,
      created_at: new Date().toISOString(),
      ai_analysis: aiAnalysis
    };

    const { data: newReview, error } = await supabase
      .from('peer_reviews')
      .insert(review)
      .select(`
        *,
        reviewer:reviewer_id(id, email, user_metadata),
        reviewee:reviewee_id(id, email, user_metadata)
      `)
      .single();

    if (error) {
      console.error('Error creating peer review:', error);
      return res.status(500).json({ error: 'Failed to create review' });
    }

    // Update target statistics if applicable
    if (target_id) {
      await updateTargetStatistics(target_id, review_type, rating);
    }

    res.json({
      success: true,
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating peer review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get review statistics for a user
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get review statistics
    const { data: reviews, error } = await supabase
      .from('peer_reviews')
      .select('rating, review_type, created_at')
      .eq('reviewee_id', userId)
      .eq('is_public', true);

    if (error) {
      console.error('Error fetching review statistics:', error);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    const stats = calculateReviewStatistics(reviews || []);

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get review requests (items that need reviews)
router.get('/requests', async (req, res) => {
  try {
    const { userId, type, limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let requests = [];

    // Get project review requests
    if (!type || type === 'project') {
      const { data: projectRequests, error: projectError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          status,
          technologies,
          created_at,
          author:user_id(id, email, user_metadata)
        `)
        .eq('status', 'completed')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!projectError && projectRequests) {
        // Filter out projects already reviewed by this user
        const projectIds = projectRequests.map(p => p.id);
        const { data: existingReviews } = await supabase
          .from('peer_reviews')
          .select('target_id')
          .eq('reviewer_id', userId)
          .eq('review_type', 'project')
          .in('target_id', projectIds);

        const reviewedIds = existingReviews?.map(r => r.target_id) || [];
        const availableProjects = projectRequests.filter(p => !reviewedIds.includes(p.id));

        requests.push(...availableProjects.map(project => ({
          id: project.id,
          type: 'project',
          title: project.title,
          description: project.description,
          author: project.author,
          created_at: project.created_at,
          metadata: {
            technologies: project.technologies,
            status: project.status
          }
        })));
      }
    }

    // Get skill review requests
    if (!type || type === 'skill') {
      // This would require a skills table - for now, we'll use user profiles
      const { data: skillRequests, error: skillError } = await supabase
        .from('user_public_profiles')
        .select(`
          id,
          user_id,
          display_name,
          skills,
          created_at
        `)
        .neq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!skillError && skillRequests) {
        // Filter out users already reviewed by this user
        const userIds = skillRequests.map(u => u.user_id);
        const { data: existingReviews } = await supabase
          .from('peer_reviews')
          .select('reviewee_id')
          .eq('reviewer_id', userId)
          .eq('review_type', 'skill')
          .in('reviewee_id', userIds);

        const reviewedIds = existingReviews?.map(r => r.reviewee_id) || [];
        const availableUsers = skillRequests.filter(u => !reviewedIds.includes(u.user_id));

        requests.push(...availableUsers.map(user => ({
          id: user.user_id,
          type: 'skill',
          title: `${user.display_name}'s Skills`,
          description: `Review ${user.display_name}'s skills: ${user.skills?.join(', ') || 'No skills listed'}`,
          author: { id: user.user_id, user_metadata: { full_name: user.display_name } },
          created_at: user.created_at,
          metadata: {
            skills: user.skills
          }
        })));
      }
    }

    // Sort by creation date and apply pagination
    requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const paginatedRequests = requests.slice(offset, offset + limit);

    res.json({
      requests: paginatedRequests,
      total: requests.length
    });
  } catch (error) {
    console.error('Error fetching review requests:', error);
    res.status(500).json({ error: 'Failed to fetch review requests' });
  }
});

// Get detailed review by ID
router.get('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    const { data: review, error } = await supabase
      .from('peer_reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, email, user_metadata),
        reviewee:reviewee_id(id, email, user_metadata)
      `)
      .eq('id', reviewId)
      .single();

    if (error) {
      console.error('Error fetching review:', error);
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Update review (only by reviewer)
router.patch('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId, rating, feedback, categories, is_public } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify user is the reviewer
    const { data: review, error: fetchError } = await supabase
      .from('peer_reviews')
      .select('reviewer_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || review.reviewer_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    const updates = {};
    if (rating !== undefined) updates.rating = rating;
    if (feedback) updates.feedback = feedback;
    if (categories) updates.categories = categories;
    if (is_public !== undefined) updates.is_public = is_public;

    // Regenerate AI analysis if feedback changed
    if (feedback) {
      updates.ai_analysis = await generateFeedbackAnalysis(feedback, review.review_type, categories);
    }

    const { data: updatedReview, error } = await supabase
      .from('peer_reviews')
      .update(updates)
      .eq('id', reviewId)
      .select(`
        *,
        reviewer:reviewer_id(id, email, user_metadata),
        reviewee:reviewee_id(id, email, user_metadata)
      `)
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return res.status(500).json({ error: 'Failed to update review' });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review (only by reviewer)
router.delete('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify user is the reviewer
    const { data: review, error: fetchError } = await supabase
      .from('peer_reviews')
      .select('reviewer_id, target_id, review_type, rating')
      .eq('id', reviewId)
      .single();

    if (fetchError || review.reviewer_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    const { error } = await supabase
      .from('peer_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      return res.status(500).json({ error: 'Failed to delete review' });
    }

    // Update target statistics
    if (review.target_id) {
      await updateTargetStatistics(review.target_id, review.review_type, null, true);
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function generateFeedbackAnalysis(feedback, reviewType, categories) {
  try {
    const prompt = `Analyze this peer review feedback and provide insights:

Review Type: ${reviewType}
Feedback: ${feedback}
Categories: ${JSON.stringify(categories || {})}

Provide analysis in JSON format with:
- sentiment_score: -1 to 1 (negative to positive)
- key_strengths: array of identified strengths
- areas_for_improvement: array of improvement suggestions
- overall_tone: "constructive", "positive", "negative", or "neutral"
- actionable_insights: array of specific actionable advice

Focus on being helpful and constructive.`;

    const response = await aiService.generateAIResponse(prompt, [], {});
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      return {
        sentiment_score: 0.5,
        key_strengths: [],
        areas_for_improvement: [],
        overall_tone: "neutral",
        actionable_insights: []
      };
    }
  } catch (error) {
    console.error('Error generating feedback analysis:', error);
    return {
      sentiment_score: 0.5,
      key_strengths: [],
      areas_for_improvement: [],
      overall_tone: "neutral",
      actionable_insights: []
    };
  }
}

function calculateReviewStatistics(reviews) {
  const stats = {
    total_reviews: reviews.length,
    average_rating: 0,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    review_types: {},
    recent_reviews: 0,
    sentiment_analysis: {
      positive: 0,
      neutral: 0,
      negative: 0
    }
  };

  if (reviews.length === 0) return stats;

  // Calculate average rating
  const ratings = reviews.filter(r => r.rating).map(r => r.rating);
  if (ratings.length > 0) {
    stats.average_rating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  // Rating distribution
  ratings.forEach(rating => {
    if (rating >= 1 && rating <= 5) {
      stats.rating_distribution[rating]++;
    }
  });

  // Review types
  reviews.forEach(review => {
    stats.review_types[review.review_type] = (stats.review_types[review.review_type] || 0) + 1;
  });

  // Recent reviews (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  stats.recent_reviews = reviews.filter(r => new Date(r.created_at) > thirtyDaysAgo).length;

  return stats;
}

async function updateTargetStatistics(targetId, reviewType, rating, isDeletion = false) {
  try {
    if (reviewType === 'project') {
      // Update project statistics
      const { data: project } = await supabase
        .from('projects')
        .select('reviews_count, average_rating')
        .eq('id', targetId)
        .single();

      if (project) {
        const newReviewsCount = isDeletion ? 
          Math.max(0, (project.reviews_count || 0) - 1) : 
          (project.reviews_count || 0) + 1;

        let newAverageRating = project.average_rating || 0;
        if (rating && !isDeletion) {
          const totalRating = (project.average_rating || 0) * (project.reviews_count || 0) + rating;
          newAverageRating = totalRating / newReviewsCount;
        } else if (isDeletion && project.reviews_count > 1) {
          const totalRating = (project.average_rating || 0) * (project.reviews_count || 0) - (rating || 0);
          newAverageRating = totalRating / (newReviewsCount || 1);
        }

        await supabase
          .from('projects')
          .update({
            reviews_count: newReviewsCount,
            average_rating: Math.round(newAverageRating * 10) / 10
          })
          .eq('id', targetId);
      }
    }
  } catch (error) {
    console.error('Error updating target statistics:', error);
  }
}

export default router;
