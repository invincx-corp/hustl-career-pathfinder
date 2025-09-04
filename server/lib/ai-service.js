import fetch from 'node-fetch';

// =====================================================
// AI SERVICE - REAL AI INTEGRATION
// =====================================================

class AIService {
  constructor() {
    this.huggingfaceApiKey = process.env.VITE_HUGGINGFACE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.togetherApiKey = process.env.TOGETHER_API_KEY;
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  }

  // =====================================================
  // HUGGING FACE INTEGRATION
  // =====================================================

  async generateHuggingFaceResponse(message, context = {}) {
    if (!this.huggingfaceApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      // Use a conversational AI model from Hugging Face
      const model = "microsoft/DialoGPT-medium"; // Good for conversational AI
      
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingfaceApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            do_sample: true,
            pad_token_id: 50256
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        return data[0].generated_text || data[0].text || "I'm here to help you with your career and learning journey!";
      }
      
      return "I'm here to help you with your career and learning journey!";
    } catch (error) {
      console.error('Hugging Face API error:', error);
      throw error;
    }
  }

  // =====================================================
  // OPENAI INTEGRATION
  // =====================================================

  async generateOpenAIResponse(message, conversationHistory = [], context = {}) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Build conversation context
      const messages = [
        {
          role: "system",
          content: `You are Nexa, an AI career coach and learning companion. You help students and young professionals with:
          - Career guidance and planning
          - Skill development and learning paths
          - Goal setting and motivation
          - Emotional support and encouragement
          - Study strategies and productivity tips
          
          You are supportive, encouraging, and provide practical advice. Keep responses concise but helpful.
          If someone seems to be in crisis or needs professional help, gently suggest they speak with a human mentor or counselor.
          
          User context: ${JSON.stringify(context)}`
        }
      ];

      // Add conversation history
      conversationHistory.forEach(msg => {
        if (msg.message_type === 'user') {
          messages.push({ role: "user", content: msg.content });
        } else if (msg.message_type === 'ai') {
          messages.push({ role: "assistant", content: msg.content });
        }
      });

      // Add current message
      messages.push({ role: "user", content: message });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: messages,
          max_tokens: 300,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  // =====================================================
  // GROQ INTEGRATION (FREE - Very Fast)
  // =====================================================

  async generateGroqResponse(message, conversationHistory = [], context = {}) {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      // Build conversation context
      const messages = [
        {
          role: "system",
          content: `You are Nexa, an AI career coach and learning companion. You help students and young professionals with:
          - Career guidance and planning
          - Skill development and learning paths
          - Goal setting and motivation
          - Emotional support and encouragement
          - Study strategies and productivity tips
          
          You are supportive, encouraging, and provide practical advice. Keep responses concise but helpful.
          If someone seems to be in crisis or needs professional help, gently suggest they speak with a human mentor or counselor.
          
          User context: ${JSON.stringify(context)}`
        }
      ];

      // Add conversation history
      conversationHistory.forEach(msg => {
        if (msg.message_type === 'user') {
          messages.push({ role: "user", content: msg.content });
        } else if (msg.message_type === 'ai') {
          messages.push({ role: "assistant", content: msg.content });
        }
      });

      // Add current message
      messages.push({ role: "user", content: message });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // Free and very fast
          messages: messages,
          max_tokens: 300,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  // =====================================================
  // TOGETHER AI INTEGRATION (FREE TIER)
  // =====================================================

  async generateTogetherResponse(message, conversationHistory = [], context = {}) {
    if (!this.togetherApiKey) {
      throw new Error('Together AI API key not configured');
    }

    try {
      // Build conversation context
      const messages = [
        {
          role: "system",
          content: `You are Nexa, an AI career coach and learning companion. You help students and young professionals with:
          - Career guidance and planning
          - Skill development and learning paths
          - Goal setting and motivation
          - Emotional support and encouragement
          - Study strategies and productivity tips
          
          You are supportive, encouraging, and provide practical advice. Keep responses concise but helpful.
          If someone seems to be in crisis or needs professional help, gently suggest they speak with a human mentor or counselor.
          
          User context: ${JSON.stringify(context)}`
        }
      ];

      // Add conversation history
      conversationHistory.forEach(msg => {
        if (msg.message_type === 'user') {
          messages.push({ role: "user", content: msg.content });
        } else if (msg.message_type === 'ai') {
          messages.push({ role: "assistant", content: msg.content });
        }
      });

      // Add current message
      messages.push({ role: "user", content: message });

      const response = await fetch('https://api.together.xyz/inference', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.togetherApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-2-7b-chat-hf", // Free tier model
          messages: messages,
          max_tokens: 300,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Together AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Together AI API error:', error);
      throw error;
    }
  }

  // =====================================================
  // OLLAMA INTEGRATION (COMPLETELY FREE - LOCAL)
  // =====================================================

  async generateOllamaResponse(message, conversationHistory = [], context = {}) {
    try {
      // Build conversation context
      const messages = [
        {
          role: "system",
          content: `You are Nexa, an AI career coach and learning companion. You help students and young professionals with:
          - Career guidance and planning
          - Skill development and learning paths
          - Goal setting and motivation
          - Emotional support and encouragement
          - Study strategies and productivity tips
          
          You are supportive, encouraging, and provide practical advice. Keep responses concise but helpful.
          If someone seems to be in crisis or needs professional help, gently suggest they speak with a human mentor or counselor.
          
          User context: ${JSON.stringify(context)}`
        }
      ];

      // Add conversation history
      conversationHistory.forEach(msg => {
        if (msg.message_type === 'user') {
          messages.push({ role: "user", content: msg.content });
        } else if (msg.message_type === 'ai') {
          messages.push({ role: "assistant", content: msg.content });
        }
      });

      // Add current message
      messages.push({ role: "user", content: message });

      const response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3.1:8b", // Free local model
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 300
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.message.content.trim();
    } catch (error) {
      console.error('Ollama API error:', error);
      throw error;
    }
  }

  // =====================================================
  // ANTHROPIC CLAUDE INTEGRATION
  // =====================================================

  async generateClaudeResponse(message, conversationHistory = [], context = {}) {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      // Build conversation context
      let conversationText = "";
      conversationHistory.forEach(msg => {
        if (msg.message_type === 'user') {
          conversationText += `Human: ${msg.content}\n`;
        } else if (msg.message_type === 'ai') {
          conversationText += `Assistant: ${msg.content}\n`;
        }
      });

      const prompt = `You are Nexa, an AI career coach and learning companion. You help students and young professionals with career guidance, skill development, goal setting, and emotional support.

User context: ${JSON.stringify(context)}

Previous conversation:
${conversationText}

Human: ${message}

Assistant:`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.content[0].text.trim();
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  // =====================================================
  // MAIN AI RESPONSE GENERATOR
  // =====================================================

  async generateAIResponse(message, conversationHistory = [], context = {}) {
    try {
      // Try different AI providers in order of preference (FREE FIRST!)
      
      // 1. GROQ (FREE - Very Fast, High Quality)
      if (this.groqApiKey) {
        try {
          return await this.generateGroqResponse(message, conversationHistory, context);
        } catch (error) {
          console.warn('Groq failed, trying next provider:', error.message);
        }
      }
      
      // 2. TOGETHER AI (FREE TIER)
      if (this.togetherApiKey) {
        try {
          return await this.generateTogetherResponse(message, conversationHistory, context);
        } catch (error) {
          console.warn('Together AI failed, trying next provider:', error.message);
        }
      }
      
      // 3. OLLAMA (COMPLETELY FREE - LOCAL)
      try {
        return await this.generateOllamaResponse(message, conversationHistory, context);
      } catch (error) {
        console.warn('Ollama failed, trying next provider:', error.message);
      }
      
      // 4. HUGGING FACE (FREE)
      if (this.huggingfaceApiKey) {
        try {
          return await this.generateHuggingFaceResponse(message, context);
        } catch (error) {
          console.warn('Hugging Face failed, trying next provider:', error.message);
        }
      }
      
      // 5. OPENAI (PAID - HIGH QUALITY)
      if (this.openaiApiKey) {
        try {
          return await this.generateOpenAIResponse(message, conversationHistory, context);
        } catch (error) {
          console.warn('OpenAI failed, trying next provider:', error.message);
        }
      }
      
      // 6. ANTHROPIC CLAUDE (PAID - HIGH QUALITY)
      if (this.anthropicApiKey) {
        try {
          return await this.generateClaudeResponse(message, conversationHistory, context);
        } catch (error) {
          console.warn('Anthropic failed, trying fallback:', error.message);
        }
      }
      
      // 7. FALLBACK TO RULE-BASED RESPONSES
      return this.generateFallbackResponse(message, context);
      
    } catch (error) {
      console.error('All AI services failed:', error);
      // Final fallback to rule-based responses
      return this.generateFallbackResponse(message, context);
    }
  }

  // =====================================================
  // FALLBACK RESPONSES (Rule-based)
  // =====================================================

  generateFallbackResponse(message, context) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
      return "I'd be happy to help you with your career guidance! Based on your message, it sounds like you're looking for direction in your professional journey. Let me help you explore your options and create a plan.";
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('study')) {
      return "Skill development is a key part of personal and professional growth! I can help you identify the skills you need to develop and find the best resources to learn them.";
    }
    
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxious') || lowerMessage.includes('overwhelmed')) {
      return "I understand you're going through a challenging time. It's important to remember that you're not alone, and it's okay to ask for help. Let's work through this together.";
    }
    
    if (lowerMessage.includes('goal') || lowerMessage.includes('plan') || lowerMessage.includes('achieve')) {
      return "Setting clear goals is the first step toward achieving your dreams! I can help you break down your big goals into manageable steps and create a timeline for success.";
    }
    
    return "I'm here to help you on your learning and career journey! What would you like to work on today?";
  }

  // =====================================================
  // INTENT ANALYSIS
  // =====================================================

  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
      return 'career_guidance';
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('study')) {
      return 'skill_development';
    }
    
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxious') || lowerMessage.includes('overwhelmed')) {
      return 'crisis_support';
    }
    
    if (lowerMessage.includes('goal') || lowerMessage.includes('plan') || lowerMessage.includes('achieve')) {
      return 'goal_setting';
    }
    
    return 'general';
  }

  // =====================================================
  // SENTIMENT ANALYSIS
  // =====================================================

  analyzeSentiment(message) {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'excited', 'confident', 'motivated', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'sad', 'frustrated', 'stressed', 'anxious', 'overwhelmed', 'awful', 'horrible'];
    
    const lowerMessage = message.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) score += 0.2;
    });
    
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) score -= 0.2;
    });
    
    return Math.max(-1, Math.min(1, score));
  }

  // =====================================================
  // SUGGESTIONS GENERATOR
  // =====================================================

  generateSuggestions(intent, context = {}) {
    const suggestions = {
      career_guidance: [
        'Explore career paths in your field',
        'Update your resume and portfolio',
        'Connect with industry professionals',
        'Take relevant skill assessments'
      ],
      skill_development: [
        'Find relevant learning resources',
        'Join study groups',
        'Practice with projects',
        'Get feedback from mentors'
      ],
      crisis_support: [
        'Take a break and practice self-care',
        'Connect with a human mentor',
        'Join a support community',
        'Consider professional counseling'
      ],
      goal_setting: [
        'Break down your goals into smaller steps',
        'Set specific deadlines',
        'Track your progress regularly',
        'Celebrate small wins'
      ],
      general: [
        'How can I help you today?',
        'What would you like to work on?',
        'Tell me about your current challenges'
      ]
    };

    return suggestions[intent] || suggestions.general;
  }
}

export default new AIService();
