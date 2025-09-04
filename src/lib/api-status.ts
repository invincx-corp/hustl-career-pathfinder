// =====================================================
// API STATUS CHECKER
// =====================================================

export interface APIStatus {
  name: string;
  configured: boolean;
  status: 'working' | 'error' | 'not_configured' | 'unknown';
  message: string;
}

export class APIStatusChecker {
  static checkAPIStatus(): APIStatus[] {
    const statuses: APIStatus[] = [];

    // Check GROQ API
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    statuses.push({
      name: 'GROQ AI',
      configured: !!groqKey,
      status: groqKey ? 'working' : 'not_configured',
      message: groqKey ? 'GROQ API key configured' : 'GROQ API key not found in environment variables'
    });

    // Check OpenAI API
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    statuses.push({
      name: 'OpenAI',
      configured: !!openaiKey,
      status: openaiKey ? 'working' : 'not_configured',
      message: openaiKey ? 'OpenAI API key configured' : 'OpenAI API key not found in environment variables'
    });

    // Check Hugging Face API
    const hfKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    statuses.push({
      name: 'Hugging Face',
      configured: !!hfKey,
      status: hfKey ? 'working' : 'not_configured',
      message: hfKey ? 'Hugging Face API key configured' : 'Hugging Face API key not found in environment variables'
    });

    // Check Together AI API
    const togetherKey = import.meta.env.VITE_TOGETHER_API_KEY;
    statuses.push({
      name: 'Together AI',
      configured: !!togetherKey,
      status: togetherKey ? 'working' : 'not_configured',
      message: togetherKey ? 'Together AI API key configured' : 'Together AI API key not found in environment variables'
    });

    // Check Ollama
    const ollamaUrl = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
    statuses.push({
      name: 'Ollama',
      configured: true, // Always available if running locally
      status: 'unknown',
      message: `Ollama URL: ${ollamaUrl} (requires local installation)`
    });

    return statuses;
  }

  static logAPIStatus(): void {
    const statuses = this.checkAPIStatus();
    
    console.log('🔍 API Configuration Status:');
    console.log('================================');
    
    statuses.forEach(status => {
      const icon = status.configured ? '✅' : '❌';
      const statusIcon = status.status === 'working' ? '🟢' : 
                        status.status === 'error' ? '🔴' : 
                        status.status === 'not_configured' ? '🟡' : '⚪';
      
      console.log(`${icon} ${statusIcon} ${status.name}: ${status.message}`);
    });
    
    console.log('================================');
    
    // Show recommendations
    const configuredAPIs = statuses.filter(s => s.configured);
    if (configuredAPIs.length === 0) {
      console.log('⚠️ No AI APIs configured! The app will use fallback responses.');
      console.log('💡 To enable AI features, add at least one API key to your .env file:');
      console.log('   - GROQ_API_KEY (FREE - Recommended)');
      console.log('   - OPENAI_API_KEY (Paid)');
      console.log('   - VITE_HUGGINGFACE_API_KEY (FREE)');
    } else {
      console.log(`✅ ${configuredAPIs.length} AI API(s) configured and ready to use!`);
    }
  }
}

// Auto-log status on import
if (typeof window !== 'undefined') {
  APIStatusChecker.logAPIStatus();
}
