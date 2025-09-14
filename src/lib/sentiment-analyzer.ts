// Sentiment Analysis for AI Career Coach
// Analyzes user emotional state and provides appropriate support responses

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: string[];
  supportLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface EmotionalState {
  mood: 'excited' | 'frustrated' | 'confused' | 'motivated' | 'overwhelmed' | 'confident' | 'anxious' | 'curious';
  intensity: 'low' | 'medium' | 'high';
  triggers: string[];
  supportNeeded: boolean;
}

export class SentimentAnalyzer {
  private emotionKeywords = {
    excited: ['excited', 'awesome', 'amazing', 'fantastic', 'love', 'great', 'wonderful', 'brilliant'],
    frustrated: ['frustrated', 'stuck', 'confused', 'difficult', 'hard', 'struggling', 'problem', 'error', 'bug'],
    confused: ['confused', 'unclear', 'don\'t understand', 'lost', 'help', 'explain', 'what', 'how'],
    motivated: ['motivated', 'ready', 'determined', 'focused', 'goal', 'achieve', 'success', 'progress'],
    overwhelmed: ['overwhelmed', 'too much', 'stress', 'pressure', 'anxiety', 'panic', 'drowning', 'stressed'],
    confident: ['confident', 'sure', 'know', 'understand', 'mastered', 'expert', 'skilled', 'capable'],
    anxious: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'concerned', 'doubt', 'uncertain'],
    curious: ['curious', 'interested', 'wonder', 'explore', 'learn', 'discover', 'question', 'investigate']
  };

  private supportKeywords = {
    low: ['fine', 'okay', 'good', 'alright', 'manageable'],
    medium: ['help', 'guidance', 'advice', 'support', 'assistance'],
    high: ['urgent', 'emergency', 'critical', 'desperate', 'stuck', 'failing', 'crisis']
  };

  private positiveWords = [
    'great', 'awesome', 'amazing', 'fantastic', 'wonderful', 'brilliant', 'excellent',
    'love', 'enjoy', 'excited', 'motivated', 'confident', 'proud', 'happy', 'satisfied',
    'success', 'progress', 'improvement', 'achievement', 'milestone', 'breakthrough'
  ];

  private negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'hate', 'frustrated', 'angry', 'upset',
    'sad', 'disappointed', 'discouraged', 'stuck', 'confused', 'lost', 'overwhelmed',
    'stressed', 'anxious', 'worried', 'scared', 'afraid', 'nervous', 'panic'
  ];

  private neutralWords = [
    'okay', 'fine', 'alright', 'normal', 'regular', 'standard', 'typical', 'usual',
    'question', 'ask', 'wonder', 'curious', 'interested', 'learn', 'study'
  ];

  // Analyze sentiment of text
  analyzeSentiment(text: string): SentimentAnalysis {
    const textLower = text.toLowerCase();
    
    // Count positive, negative, and neutral words
    const positiveCount = this.countWords(textLower, this.positiveWords);
    const negativeCount = this.countWords(textLower, this.negativeWords);
    const neutralCount = this.countWords(textLower, this.neutralWords);
    
    // Determine sentiment
    let sentiment: 'positive' | 'negative' | 'neutral';
    let confidence: number;
    
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      sentiment = 'positive';
      confidence = positiveCount / (positiveCount + negativeCount + neutralCount);
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      sentiment = 'negative';
      confidence = negativeCount / (positiveCount + negativeCount + neutralCount);
    } else {
      sentiment = 'neutral';
      confidence = neutralCount / (positiveCount + negativeCount + neutralCount);
    }
    
    // Detect emotions
    const emotions = this.detectEmotions(textLower);
    
    // Determine support level
    const supportLevel = this.determineSupportLevel(textLower, sentiment, emotions);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(sentiment, emotions, supportLevel);
    
    return {
      sentiment,
      confidence: Math.min(1, confidence),
      emotions,
      supportLevel,
      recommendations
    };
  }

  // Detect emotional state
  detectEmotionalState(text: string): EmotionalState {
    const textLower = text.toLowerCase();
    const emotions = this.detectEmotions(textLower);
    
    // Determine primary mood
    let mood: EmotionalState['mood'] = 'curious';
    let maxScore = 0;
    
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      const score = this.countWords(textLower, keywords);
      if (score > maxScore) {
        maxScore = score;
        mood = emotion as EmotionalState['mood'];
      }
    });
    
    // Determine intensity
    const intensity = this.determineIntensity(textLower, emotions);
    
    // Identify triggers
    const triggers = this.identifyTriggers(textLower);
    
    // Determine if support is needed
    const supportNeeded = this.needsSupport(sentiment, emotions, intensity);
    
    return {
      mood,
      intensity,
      triggers,
      supportNeeded
    };
  }

  // Count occurrences of words in text
  private countWords(text: string, words: string[]): number {
    return words.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  // Detect emotions from text
  private detectEmotions(text: string): string[] {
    const emotions: string[] = [];
    
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      if (this.countWords(text, keywords) > 0) {
        emotions.push(emotion);
      }
    });
    
    return emotions;
  }

  // Determine support level needed
  private determineSupportLevel(text: string, sentiment: string, emotions: string[]): 'low' | 'medium' | 'high' {
    // Check for high support keywords
    if (this.countWords(text, this.supportKeywords.high) > 0) {
      return 'high';
    }
    
    // Check for negative emotions that need support
    const negativeEmotions = ['frustrated', 'overwhelmed', 'anxious', 'confused'];
    const hasNegativeEmotions = emotions.some(emotion => negativeEmotions.includes(emotion));
    
    if (hasNegativeEmotions || sentiment === 'negative') {
      return 'medium';
    }
    
    // Check for medium support keywords
    if (this.countWords(text, this.supportKeywords.medium) > 0) {
      return 'medium';
    }
    
    return 'low';
  }

  // Determine emotional intensity
  private determineIntensity(text: string, emotions: string[]): 'low' | 'medium' | 'high' {
    const intensityWords = {
      low: ['slightly', 'a bit', 'somewhat', 'kind of', 'maybe'],
      medium: ['quite', 'pretty', 'rather', 'fairly', 'moderately'],
      high: ['very', 'extremely', 'incredibly', 'totally', 'completely', 'absolutely']
    };
    
    const highIntensity = this.countWords(text, intensityWords.high);
    const mediumIntensity = this.countWords(text, intensityWords.medium);
    const lowIntensity = this.countWords(text, intensityWords.low);
    
    if (highIntensity > 0) return 'high';
    if (mediumIntensity > 0) return 'medium';
    if (lowIntensity > 0) return 'low';
    
    // Default based on emotion count
    if (emotions.length > 3) return 'high';
    if (emotions.length > 1) return 'medium';
    return 'low';
  }

  // Identify emotional triggers
  private identifyTriggers(text: string): string[] {
    const triggers: string[] = [];
    
    const triggerPatterns = {
      'technical_difficulty': ['error', 'bug', 'broken', 'not working', 'failed', 'crash'],
      'learning_overwhelm': ['too much', 'overwhelmed', 'confused', 'lost', 'drowning'],
      'time_pressure': ['deadline', 'urgent', 'rush', 'time', 'quickly', 'fast'],
      'perfectionism': ['perfect', 'flawless', 'mistake', 'wrong', 'correct', 'right'],
      'comparison': ['better', 'worse', 'compare', 'others', 'everyone', 'people'],
      'uncertainty': ['unsure', 'don\'t know', 'unclear', 'confused', 'lost', 'stuck']
    };
    
    Object.entries(triggerPatterns).forEach(([trigger, keywords]) => {
      if (this.countWords(text, keywords) > 0) {
        triggers.push(trigger);
      }
    });
    
    return triggers;
  }

  // Determine if user needs support
  private needsSupport(sentiment: string, emotions: string[], intensity: string): boolean {
    if (sentiment === 'negative' && intensity === 'high') return true;
    if (emotions.includes('overwhelmed') || emotions.includes('anxious')) return true;
    if (emotions.includes('frustrated') && intensity === 'medium') return true;
    return false;
  }

  // Generate support recommendations
  private generateRecommendations(sentiment: string, emotions: string[], supportLevel: string): string[] {
    const recommendations: string[] = [];
    
    // Sentiment-based recommendations
    if (sentiment === 'negative') {
      recommendations.push('Take a break and come back with fresh perspective');
      recommendations.push('Break down the problem into smaller, manageable steps');
    }
    
    if (sentiment === 'positive') {
      recommendations.push('Keep up the great momentum!');
      recommendations.push('Consider sharing your success with others');
    }
    
    // Emotion-based recommendations
    if (emotions.includes('frustrated')) {
      recommendations.push('Try a different approach or ask for help');
      recommendations.push('Remember that every expert was once a beginner');
    }
    
    if (emotions.includes('overwhelmed')) {
      recommendations.push('Focus on one thing at a time');
      recommendations.push('Create a priority list and tackle items one by one');
    }
    
    if (emotions.includes('confused')) {
      recommendations.push('Ask specific questions to clarify your understanding');
      recommendations.push('Look for examples or tutorials to guide you');
    }
    
    if (emotions.includes('anxious')) {
      recommendations.push('Practice deep breathing or mindfulness techniques');
      recommendations.push('Remember that it\'s okay to make mistakes while learning');
    }
    
    // Support level recommendations
    if (supportLevel === 'high') {
      recommendations.push('Consider reaching out to a mentor or peer for immediate help');
      recommendations.push('Take a step back and reassess your approach');
    }
    
    if (supportLevel === 'medium') {
      recommendations.push('I\'m here to help guide you through this');
      recommendations.push('Let\'s work through this together step by step');
    }
    
    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }

  // Generate empathetic response based on sentiment
  generateEmpatheticResponse(sentiment: string, emotions: string[], supportLevel: string): string {
    const responses = {
      positive: [
        "That's fantastic! I can feel your enthusiasm and it's contagious!",
        "I love hearing about your progress and excitement!",
        "Your positive energy is amazing - keep it up!",
        "That's wonderful! Your dedication is really paying off!"
      ],
      negative: [
        "I understand this can be challenging, but you're not alone in this journey.",
        "It's completely normal to feel frustrated - every learner goes through this.",
        "I can hear that you're struggling, and I want you to know that it's okay.",
        "Let's work through this together - we'll find a way forward."
      ],
      neutral: [
        "I appreciate you sharing this with me. Let's explore this together.",
        "That's a great question - I'm here to help you find the answers.",
        "I can see you're thinking through this carefully - that's a great approach.",
        "Let's break this down and work through it step by step."
      ]
    };
    
    const emotionResponses = {
      frustrated: "I can sense your frustration, and I want you to know that it's completely understandable. Learning new things can be challenging, but you're making progress even when it doesn't feel like it.",
      overwhelmed: "It sounds like you might be feeling overwhelmed, and that's a very common feeling when learning something new. Let's take this one step at a time.",
      confused: "Confusion is a natural part of the learning process. It means you're pushing yourself to understand something new, which is actually a good sign!",
      anxious: "I can hear some anxiety in your message, and I want you to know that it's okay to feel uncertain. Learning is a journey, and it's normal to have these feelings.",
      excited: "Your excitement is wonderful to see! That kind of enthusiasm is what drives great learning and achievement.",
      motivated: "I love seeing your motivation! That determination will take you far in your learning journey."
    };
    
    // Start with sentiment-based response
    const sentimentResponses = responses[sentiment as keyof typeof responses];
    let response = sentimentResponses[Math.floor(Math.random() * sentimentResponses.length)];
    
    // Add emotion-specific response if applicable
    const primaryEmotion = emotions[0];
    if (primaryEmotion && emotionResponses[primaryEmotion as keyof typeof emotionResponses]) {
      response += " " + emotionResponses[primaryEmotion as keyof typeof emotionResponses];
    }
    
    return response;
  }

  // Generate support suggestions based on emotional state
  generateSupportSuggestions(emotionalState: EmotionalState): string[] {
    const suggestions: string[] = [];
    
    const { mood, intensity, triggers, supportNeeded } = emotionalState;
    
    // Mood-specific suggestions
    switch (mood) {
      case 'frustrated':
        suggestions.push('Try a different learning approach or resource');
        suggestions.push('Take a short break and come back with fresh eyes');
        suggestions.push('Ask for help from a mentor or peer');
        break;
      case 'overwhelmed':
        suggestions.push('Break down your learning into smaller, manageable chunks');
        suggestions.push('Create a priority list and focus on one thing at a time');
        suggestions.push('Consider reducing your learning load temporarily');
        break;
      case 'confused':
        suggestions.push('Ask specific questions to clarify your understanding');
        suggestions.push('Look for additional examples or explanations');
        suggestions.push('Try explaining the concept to someone else');
        break;
      case 'anxious':
        suggestions.push('Practice relaxation techniques like deep breathing');
        suggestions.push('Remember that making mistakes is part of learning');
        suggestions.push('Focus on progress rather than perfection');
        break;
      case 'excited':
        suggestions.push('Channel this energy into focused learning sessions');
        suggestions.push('Share your excitement with others in the community');
        suggestions.push('Set ambitious but achievable goals');
        break;
      case 'motivated':
        suggestions.push('Use this motivation to tackle challenging topics');
        suggestions.push('Set specific, time-bound goals');
        suggestions.push('Track your progress to maintain momentum');
        break;
    }
    
    // Intensity-based suggestions
    if (intensity === 'high') {
      suggestions.push('Consider taking a step back to process your feelings');
      suggestions.push('Reach out to a mentor or counselor for additional support');
    }
    
    // Trigger-specific suggestions
    if (triggers.includes('technical_difficulty')) {
      suggestions.push('Try debugging step by step or ask for technical help');
    }
    if (triggers.includes('learning_overwhelm')) {
      suggestions.push('Focus on mastering one concept at a time');
    }
    if (triggers.includes('time_pressure')) {
      suggestions.push('Prioritize the most important tasks and let go of perfectionism');
    }
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
  }
}

// Export singleton instance
export const sentimentAnalyzer = new SentimentAnalyzer();
