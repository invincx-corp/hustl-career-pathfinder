// AI Provider using Hugging Face (Free Alternative)
export class HuggingFaceAIProvider {
  private apiKey: string | null = null;
  private isConfigured = false;
  private baseUrl = 'https://api-inference.huggingface.co/models';
  // Models that are actually available for public inference
  private workingModels = [
    'microsoft/DialoGPT-small',
    'microsoft/DialoGPT-medium',
    'gpt2',
    'distilgpt2'
  ];
  
  // Simple test model that should always work
  private testModel = 'microsoft/DialoGPT-small';
  
  // Alternative models that are more likely to work
  private alternativeModels = [
    'microsoft/DialoGPT-small',
    'microsoft/DialoGPT-medium'
  ];
  
  // Simple test to find working models
  private async findWorkingModel(): Promise<string | null> {
    console.log('🔍 Searching for working Hugging Face models...');
    
    // Try a simple test with a basic model
    const testModels = ['microsoft/DialoGPT-small', 'gpt2'];
    
    for (const model of testModels) {
      try {
        console.log(`🔍 Testing model: ${model}`);
        const response = await fetch(`${this.baseUrl}/${model}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          }
        });
        
        if (response.status === 200) {
          console.log(`✅ Found working model: ${model}`);
          return model;
        } else if (response.status === 503) {
          console.log(`⏳ Model ${model} is loading, could work later`);
          return model; // This might work after loading
        } else {
          console.log(`⚠️ Model ${model} returned ${response.status}`);
        }
      } catch (error) {
        console.log(`⚠️ Model ${model} test failed:`, error.message);
      }
    }
    
    console.log('❌ No working models found');
    return null;
  }

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    
    if (apiKey && apiKey !== 'your_huggingface_api_key_here') {
      this.apiKey = apiKey;
      this.isConfigured = true;
      console.log('🤗 Hugging Face AI Provider configured with real API key');
      
      // Test API connectivity
      this.testAPIConnectivity();
    } else {
      console.warn('Hugging Face API key not found or not configured. AI features will be simulated.');
      this.isConfigured = false;
    }
  }

  // Test if Hugging Face API is accessible
  private async testAPIConnectivity() {
    try {
      console.log('🔍 Testing Hugging Face API connectivity...');
      
      // Let's test with a simple, reliable model
      try {
        const testResponse = await fetch(`${this.baseUrl}/microsoft/DialoGPT-small`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          }
        });
        
        console.log(`🔍 Test API Status: ${testResponse.status} - ${testResponse.statusText}`);
        
        if (testResponse.status === 200) {
          console.log('✅ Hugging Face API is working with a test model!');
          this.isConfigured = true;
        } else if (testResponse.status === 503) {
          console.log('⏳ Model is loading, will retry on first use');
          this.isConfigured = true;
        } else {
          console.log('⚠️ Model not accessible, will use alternative approach');
          this.isConfigured = true; // Still try to use API
        }
      } catch (error) {
        console.log('⚠️ API test failed, will use alternative approach');
        this.isConfigured = true; // Still try to use API
      }
      
      console.log('💡 Will attempt AI requests and fallback gracefully if needed');
      
    } catch (error) {
      console.warn('⚠️ Hugging Face API connectivity test failed:', error.message);
      this.isConfigured = false;
    }
  }

  // Generate AI roadmap using Hugging Face
  async generateRoadmap(goal: string, userProfile: any): Promise<any> {
    if (!this.isConfigured || !this.apiKey) {
      return this.simulateRoadmapGeneration(goal, userProfile);
    }

    try {
      const prompt = `Create a learning roadmap for: ${goal}. User profile: ${JSON.stringify(userProfile)}. 
      Return JSON with: steps (array), estimatedTime (string), difficulty (beginner/intermediate/advanced), skills (array).`;

      // Try to use Hugging Face API
      console.log(`🤗 Attempting Hugging Face AI for roadmap generation...`);
      
      // First, try to find a working model
      const workingModel = await this.findWorkingModel();
      
      if (workingModel) {
        try {
          console.log(`🔄 Using working model: ${workingModel}`);
          const response = await fetch(`${this.baseUrl}/${workingModel}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_length: 500,
                temperature: 0.7,
                return_full_text: false
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedText = data[0]?.generated_text || '';
            
            // Try to parse JSON from response
            try {
              const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                console.log(`✅ Successfully generated AI roadmap using ${workingModel}`);
                return JSON.parse(jsonMatch[0]);
              }
            } catch (parseError) {
              console.warn('Failed to parse AI response, using simulated response');
            }
          } else if (response.status === 503) {
            console.log(`⏳ Model ${workingModel} is loading, will retry in 5 seconds...`);
            // Model is loading, wait and retry
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            try {
              const retryResponse = await fetch(`${this.baseUrl}/${workingModel}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${this.apiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  inputs: prompt,
                  parameters: {
                    max_length: 500,
                    temperature: 0.7,
                    return_full_text: false
                  }
                })
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                const retryText = retryData[0]?.generated_text || '';
                
                try {
                  const jsonMatch = retryText.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    console.log(`✅ Successfully generated AI roadmap using ${workingModel} after retry`);
                    return JSON.parse(jsonMatch[0]);
                  }
                } catch (parseError) {
                  console.warn('Failed to parse AI response after retry, using simulated response');
                }
              }
            } catch (retryError) {
              console.warn('Retry failed:', retryError.message);
            }
          } else {
            console.warn(`Model ${workingModel} returned ${response.status}: ${response.statusText}`);
          }
        } catch (apiError) {
          console.warn('API call failed:', apiError.message);
        }
      }
      
      // If AI fails, use simulation
      console.log('🔄 Falling back to simulated roadmap generation');
      return this.simulateRoadmapGeneration(goal, userProfile);
    } catch (error: any) {
      console.warn('Hugging Face AI failed, using simulated response:', error.message);
      return this.simulateRoadmapGeneration(goal, userProfile);
    }
  }

  // Generate skill gap analysis
  async analyzeSkillGaps(currentSkills: string[], targetRole: string): Promise<any> {
    if (!this.isConfigured || !this.apiKey) {
      return this.simulateSkillAnalysis(currentSkills, targetRole);
    }

    try {
      const prompt = `Analyze skill gaps for current skills: ${currentSkills.join(', ')} pursuing: ${targetRole}. 
      Return JSON with: missingSkills (array), prioritySkills (array), learningPath (array), estimatedTime (string).`;

      // Try to use Hugging Face API
      console.log(`🤗 Attempting Hugging Face AI for skill analysis...`);
      
      // Try the working test model first, then fallback to others
      const modelsToTry = [this.testModel, ...this.workingModels.filter(m => m !== this.testModel)];
      
      for (const model of modelsToTry) {
        try {
          console.log(`🔄 Trying model: ${model}`);
          const response = await fetch(`${this.baseUrl}/${model}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_length: 400,
                temperature: 0.7,
                return_full_text: false
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedText = data[0]?.generated_text || '';
            
            try {
              const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                console.log(`✅ Successfully generated AI skill analysis using ${model}`);
                return JSON.parse(jsonMatch[0]);
              }
            } catch (parseError) {
              console.warn(`Failed to parse AI response from ${model}, trying next model`);
              continue;
            }
          } else if (response.status === 503) {
            console.log(`⏳ Model ${model} is loading, will retry in 5 seconds...`);
            // Model is loading, wait and retry this model
            await new Promise(resolve => setTimeout(resolve, 5000));
            try {
              const retryResponse = await fetch(`${this.baseUrl}/${model}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${this.apiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  inputs: prompt,
                  parameters: {
                    max_length: 400,
                    temperature: 0.7,
                    return_full_text: false
                  }
                })
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                const retryText = retryData[0]?.generated_text || '';
                
                try {
                  const jsonMatch = retryText.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    console.log(`✅ Successfully generated AI skill analysis using ${model} after retry`);
                    return JSON.parse(jsonMatch[0]);
                  }
                } catch (parseError) {
                  console.warn(`Failed to parse AI response from ${model} after retry, trying next model`);
                  continue;
                }
              }
            } catch (retryError) {
              console.warn(`Retry failed for ${model}:`, retryError.message);
              continue;
            }
          } else {
            console.warn(`Model ${model} returned ${response.status}: ${response.statusText}`);
          }
        } catch (apiError) {
          console.warn(`Model ${model} failed:`, apiError.message);
          continue;
        }
      }
      
      // If AI fails, use simulation
      console.log('🔄 Falling back to simulated skill analysis');
      return this.simulateSkillAnalysis(currentSkills, targetRole);
    } catch (error: any) {
      console.warn('Hugging Face AI failed, using simulated response:', error.message);
      return this.simulateSkillAnalysis(currentSkills, targetRole);
    }
  }

  // Generate career coach response
  async generateCoachResponse(userMessage: string, context: any): Promise<string> {
    if (!this.isConfigured || !this.apiKey) {
      return this.simulateCoachResponse(userMessage);
    }

    try {
      const prompt = `You are a supportive career coach for young learners. User: "${userMessage}". Context: ${JSON.stringify(context)}. 
      Provide helpful, encouraging guidance.`;

      // Try to use Hugging Face API
      console.log(`🤗 Attempting Hugging Face AI for career coaching...`);
      
      // Try the working test model first, then fallback to others
      const modelsToTry = [this.testModel, ...this.workingModels.filter(m => m !== this.testModel)];
      
      for (const model of modelsToTry) {
        try {
          console.log(`🔄 Trying model: ${model}`);
          const response = await fetch(`${this.baseUrl}/${model}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_length: 200,
                temperature: 0.8,
                return_full_text: false
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedText = data[0]?.generated_text || '';
            
            if (generatedText.trim()) {
              console.log(`✅ Successfully generated AI career coach response using ${model}`);
              return generatedText.trim();
            }
          } else if (response.status === 503) {
            console.log(`⏳ Model ${model} is loading, will retry in 5 seconds...`);
            // Model is loading, wait and retry this model
            await new Promise(resolve => setTimeout(resolve, 5000));
            try {
              const retryResponse = await fetch(`${this.baseUrl}/${model}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${this.apiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  inputs: prompt,
                  parameters: {
                    max_length: 200,
                    temperature: 0.8,
                    return_full_text: false
                  }
                })
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                const retryText = retryData[0]?.generated_text || '';
                
                if (retryText.trim()) {
                  console.log(`✅ Successfully generated AI career coach response using ${model} after retry`);
                  return retryText.trim();
                }
              }
            } catch (retryError) {
              console.warn(`Retry failed for ${model}:`, retryError.message);
              continue;
            }
          } else {
            console.warn(`Model ${model} returned ${response.status}: ${response.statusText}`);
          }
        } catch (apiError) {
          console.warn(`Model ${model} failed:`, apiError.message);
          continue;
        }
      }
      
      // If AI fails, use simulation
      console.log('🔄 Falling back to simulated career coach response');
      return this.simulateCoachResponse(userMessage);
    } catch (error: any) {
      console.warn('Hugging Face AI failed, using simulated response:', error.message);
      return this.simulateCoachResponse(userMessage);
    }
  }

  // Enhanced career coach response with real-time analysis
  async generateEnhancedCoachResponse(userMessage: string, context: any): Promise<string> {
    if (!this.isConfigured || !this.apiKey) {
      return this.simulateEnhancedCoachResponse(userMessage, context);
    }

    try {
      // Enhanced prompt engineering for better AI responses
      const enhancedPrompt = this.createEnhancedPrompt(userMessage, context);
      
      console.log(`🤗 Attempting enhanced Hugging Face AI for career coaching...`);
      
      // Try the working test model first, then fallback to others
      const modelsToTry = [this.testModel, ...this.workingModels.filter(m => m !== this.testModel)];
      
      for (const model of modelsToTry) {
        try {
          console.log(`🔄 Trying enhanced model: ${model}`);
          const response = await fetch(`${this.baseUrl}/${model}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: enhancedPrompt,
              parameters: {
                max_length: 300,
                temperature: 0.7,
                return_full_text: false,
                do_sample: true,
                top_p: 0.9
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedText = data[0]?.generated_text || '';
            
            if (generatedText.trim()) {
              console.log(`✅ Successfully generated enhanced AI career coach response using ${model}`);
              return this.cleanAndEnhanceResponse(generatedText, userMessage, context);
            }
          } else if (response.status === 503) {
            console.log(`⏳ Enhanced model ${model} is loading, will retry in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            try {
              const retryResponse = await fetch(`${this.baseUrl}/${model}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${this.apiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  inputs: enhancedPrompt,
                  parameters: {
                    max_length: 300,
                    temperature: 0.7,
                    return_full_text: false,
                    do_sample: true,
                    top_p: 0.9
                  }
                })
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                const retryText = retryData[0]?.generated_text || '';
                
                if (retryText.trim()) {
                  console.log(`✅ Successfully generated enhanced AI career coach response using ${model} after retry`);
                  return this.cleanAndEnhanceResponse(retryText, userMessage, context);
                }
              }
            } catch (retryError) {
              console.warn(`Enhanced retry failed for ${model}:`, retryError.message);
              continue;
            }
          } else {
            console.warn(`Enhanced model ${model} returned ${response.status}: ${response.statusText}`);
          }
        } catch (apiError) {
          console.warn(`Enhanced model ${model} failed:`, apiError.message);
          continue;
        }
      }
      
      // If AI fails, use enhanced simulation
      console.log('🔄 Falling back to enhanced simulated career coach response');
      return this.simulateEnhancedCoachResponse(userMessage, context);
    } catch (error: any) {
      console.warn('Enhanced Hugging Face AI failed, using simulated response:', error.message);
      return this.simulateEnhancedCoachResponse(userMessage, context);
    }
  }

  // Create enhanced prompt with career intelligence
  private createEnhancedPrompt(userMessage: string, context: any): string {
    const { learningPatterns, skillGaps, nextSteps, careerTrajectory } = context;
    
    let prompt = `You are an expert career coach specializing in technology careers for young learners (15-25 years old). `;
    prompt += `You provide personalized, actionable advice based on real-time analysis of the user's learning patterns, skill gaps, and career trajectory.\n\n`;
    
    prompt += `User Message: "${userMessage}"\n\n`;
    
    if (learningPatterns) {
      prompt += `Learning Pattern Analysis: ${learningPatterns.pattern} (confidence: ${learningPatterns.confidence})\n`;
      prompt += `Question Distribution: ${JSON.stringify(learningPatterns.questionDistribution)}\n`;
    }
    
    if (skillGaps && skillGaps.missing.length > 0) {
      prompt += `Skill Gaps Identified: ${skillGaps.missing.join(', ')}\n`;
      prompt += `Priority Skills: ${skillGaps.priority.join(', ')}\n`;
      prompt += `Estimated Learning Time: ${skillGaps.estimatedTime}\n`;
    }
    
    if (nextSteps) {
      prompt += `Recommended Next Step: ${nextSteps.action} - ${nextSteps.focus}\n`;
      prompt += `Learning Path: ${nextSteps.path.join(' → ')}\n`;
    }
    
    if (careerTrajectory) {
      prompt += `Career Stage: ${careerTrajectory.stage}\n`;
      prompt += `Skill Level: ${careerTrajectory.skillLevel}/10\n`;
      prompt += `Market Readiness: ${careerTrajectory.marketReadiness}\n`;
    }
    
    prompt += `\nProvide a comprehensive, encouraging response that:\n`;
    prompt += `1. Directly addresses the user's question\n`;
    prompt += `2. Incorporates the analyzed context\n`;
    prompt += `3. Offers specific, actionable next steps\n`;
    prompt += `4. Motivates and builds confidence\n`;
    prompt += `5. Uses a friendly, supportive tone\n\n`;
    
    prompt += `Response:`;
    
    return prompt;
  }

  // Clean and enhance AI response
  private cleanAndEnhanceResponse(generatedText: string, userMessage: string, context: any): string {
    // Clean the generated text
    let cleanedText = generatedText.trim();
    
    // Remove any incomplete sentences at the end
    const sentences = cleanedText.split(/[.!?]+/);
    if (sentences.length > 1) {
      const lastSentence = sentences[sentences.length - 1].trim();
      if (lastSentence.length < 10) { // Remove very short incomplete sentences
        cleanedText = sentences.slice(0, -1).join('. ') + '.';
      }
    }
    
    // Ensure the response ends with proper punctuation
    if (!cleanedText.match(/[.!?]$/)) {
      cleanedText += '.';
    }
    
    // Add context-specific enhancements
    const { learningPatterns, skillGaps } = context;
    
    if (learningPatterns?.pattern === 'technical' && skillGaps?.missing.length > 0) {
      cleanedText += ` Remember, mastering ${skillGaps.priority[0]} will open up many opportunities for you!`;
    }
    
    if (learningPatterns?.pattern === 'career') {
      cleanedText += ` You're on the right track - keep building your skills and network!`;
    }
    
    return cleanedText;
  }

  // Enhanced simulated response
  private simulateEnhancedCoachResponse(userMessage: string, context: any): string {
    const { learningPatterns, skillGaps, nextSteps, careerTrajectory } = context;
    
    let response = this.simulateCoachResponse(userMessage);
    
    // Enhance with context information
    if (skillGaps?.missing.length > 0) {
      response += ` Based on your current skills, I recommend focusing on ${skillGaps.priority[0]} next. This will help you ${nextSteps?.focus ? `move towards ${nextSteps.focus}` : 'advance your career'}.`;
    }
    
    if (careerTrajectory?.stage === 'beginner') {
      response += ` Since you're just starting out, remember to take it one step at a time. Every expert was once a beginner!`;
    }
    
    return response;
  }

  // Simulate responses when AI is not configured
  private simulateRoadmapGeneration(goal: string, userProfile: any) {
    return {
      steps: [
        {
          id: "1",
          title: "Research and Planning",
          description: "Understand the requirements and create a learning plan",
          duration: "2 weeks",
          type: "course",
          completed: false
        },
        {
          id: "2", 
          title: "Foundation Skills",
          description: "Build core skills needed for your goal",
          duration: "4 weeks",
          type: "course",
          completed: false
        },
        {
          id: "3",
          title: "Practical Project",
          description: "Apply your skills in a real project",
          duration: "3 weeks", 
          type: "project",
          completed: false
        }
      ],
      estimatedTime: "9 weeks",
      difficulty: "beginner",
      skills: ["Planning", "Core Skills", "Project Management"]
    };
  }

  private simulateSkillAnalysis(currentSkills: string[], targetRole: string) {
    return {
      missingSkills: ["Advanced Programming", "System Design", "Team Leadership"],
      prioritySkills: ["Advanced Programming", "System Design"],
      learningPath: ["Programming Fundamentals", "Advanced Concepts", "System Design"],
      estimatedTime: "6 months"
    };
  }

  private simulateCoachResponse(userMessage: string): string {
    const responses = [
      "That's a great question! Let's break this down into smaller, manageable steps.",
      "I'm excited about your progress! Have you considered exploring this area further?",
      "Remember, every expert was once a beginner. You're on the right track!",
      "That's a thoughtful approach. Let me help you think through this step by step.",
      "Your enthusiasm is contagious! Let's create a plan to achieve your goals."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Check if AI is properly configured
  isReady(): boolean {
    return this.isConfigured;
  }

  // Get configuration status
  getStatus(): { configured: boolean; provider: string } {
    return {
      configured: this.isConfigured,
      provider: this.isConfigured ? 'Hugging Face (Free)' : 'Simulated'
    };
  }
}

// Export singleton instance
export const huggingFaceAIProvider = new HuggingFaceAIProvider();
