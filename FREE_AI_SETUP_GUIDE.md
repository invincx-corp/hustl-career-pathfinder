# 🆓 **FREE AI SETUP GUIDE** - Replace Anthropic Claude

This guide shows you how to set up powerful **FREE** AI services that are as good as (or better than) Anthropic Claude for your Nexa Pathfinder Virtual Career Coach.

## 🏆 **RECOMMENDED FREE OPTIONS** (In Order of Preference)

### 1. **GROQ** ⭐ **BEST FREE OPTION**
- **Cost**: Completely FREE
- **Speed**: Extremely fast (up to 500 tokens/second)
- **Quality**: High quality responses
- **Models**: Llama 3.1 8B, Mixtral 8x7B
- **Setup**: 2 minutes

#### How to Get GROQ API Key:
1. Go to [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up with Google/GitHub (free)
3. Click "Create API Key"
4. Copy the key and add to your `.env` file:
   ```bash
   GROQ_API_KEY=your_groq_api_key_here
   ```

---

### 2. **TOGETHER AI** ⭐ **GREAT FREE TIER**
- **Cost**: $25 free credit (lasts months for normal usage)
- **Speed**: Fast
- **Quality**: High quality responses
- **Models**: Llama 2, CodeLlama, Mistral
- **Setup**: 2 minutes

#### How to Get TOGETHER AI API Key:
1. Go to [https://api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys)
2. Sign up (free)
3. Click "Create API Key"
4. Copy the key and add to your `.env` file:
   ```bash
   TOGETHER_API_KEY=your_key_here
   ```

---

### 3. **OLLAMA** ⭐ **COMPLETELY FREE - LOCAL**
- **Cost**: 100% FREE (runs on your computer)
- **Speed**: Fast (depends on your hardware)
- **Quality**: High quality responses
- **Models**: Llama 3.1, Mistral, CodeLlama, and many more
- **Setup**: 5 minutes

#### How to Set Up OLLAMA:
1. **Install Ollama**: [https://ollama.ai/download](https://ollama.ai/download)
2. **Download a model**:
   ```bash
   ollama pull llama3.1:8b
   ```
3. **Start Ollama** (it runs automatically after installation)
4. **Add to your `.env` file**:
   ```bash
   OLLAMA_URL=http://localhost:11434
   ```

---

### 4. **HUGGING FACE** ⭐ **FREE COMMUNITY MODELS**
- **Cost**: Completely FREE
- **Speed**: Medium
- **Quality**: Good quality responses
- **Models**: Many community models
- **Setup**: 2 minutes

#### How to Get HUGGING FACE API Key:
1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Sign up (free)
3. Click "New token"
4. Copy the key and add to your `.env` file:
   ```bash
   VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

---

## 🚀 **QUICK SETUP (Choose One)**

### **Option A: GROQ (Recommended)**
```bash
# 1. Get free API key from https://console.groq.com/keys
# 2. Add to your .env file:
GROQ_API_KEY=your_groq_api_key_here

# 3. That's it! Your AI coach will now use GROQ
```

### **Option B: OLLAMA (100% Free, No API Key)**
```bash
# 1. Install Ollama: https://ollama.ai/download
# 2. Download model:
ollama pull llama3.1:8b

# 3. Add to your .env file:
OLLAMA_URL=http://localhost:11434

# 4. That's it! Your AI coach will now use local AI
```

### **Option C: TOGETHER AI**
```bash
# 1. Get free API key from https://api.together.xyz/settings/api-keys
# 2. Add to your .env file:
TOGETHER_API_KEY=your_key_here

# 3. That's it! Your AI coach will now use TOGETHER AI
```

---

## 📊 **COMPARISON TABLE**

| Service | Cost | Speed | Quality | Setup Time | Best For |
|---------|------|-------|---------|------------|----------|
| **GROQ** | FREE | ⚡⚡⚡ | ⭐⭐⭐⭐ | 2 min | **Recommended** |
| **OLLAMA** | FREE | ⚡⚡ | ⭐⭐⭐⭐ | 5 min | Privacy-focused |
| **TOGETHER AI** | $25 credit | ⚡⚡ | ⭐⭐⭐⭐ | 2 min | High usage |
| **Hugging Face** | FREE | ⚡ | ⭐⭐⭐ | 2 min | Experimentation |
| Anthropic Claude | $15/month | ⚡⚡ | ⭐⭐⭐⭐⭐ | 2 min | Premium quality |

---

## 🔧 **HOW IT WORKS**

The AI service automatically tries providers in this order:
1. **GROQ** (if API key provided)
2. **TOGETHER AI** (if API key provided)
3. **OLLAMA** (if running locally)
4. **Hugging Face** (if API key provided)
5. **OpenAI** (if API key provided)
6. **Anthropic Claude** (if API key provided)
7. **Fallback** (rule-based responses)

So you can set up multiple providers for redundancy!

---

## 🎯 **RECOMMENDED SETUP**

For the best free experience, I recommend:

1. **Primary**: GROQ (fastest, highest quality)
2. **Backup**: OLLAMA (completely free, no internet needed)
3. **Optional**: TOGETHER AI (for high usage periods)

```bash
# Your .env file should look like this:
GROQ_API_KEY=gsk_your_groq_key_here
OLLAMA_URL=http://localhost:11434
TOGETHER_API_KEY=your_together_key_here
```

---

## 🆘 **TROUBLESHOOTING**

### GROQ Issues:
- Make sure your API key is valid
- Check your usage limits at [console.groq.com](https://console.groq.com)

### OLLAMA Issues:
- Make sure Ollama is running: `ollama list`
- Check if model is downloaded: `ollama list`
- Restart Ollama if needed

### TOGETHER AI Issues:
- Check your credit balance at [api.together.xyz](https://api.together.xyz)
- Make sure you're using the correct API key

---

## 🎉 **RESULT**

With any of these free options, your Virtual Career Coach will provide:
- ✅ Intelligent, contextual responses
- ✅ Career guidance and advice
- ✅ Emotional support
- ✅ Learning recommendations
- ✅ Goal setting assistance
- ✅ **All for FREE!**

**No more need for expensive Anthropic Claude!** 🎊
