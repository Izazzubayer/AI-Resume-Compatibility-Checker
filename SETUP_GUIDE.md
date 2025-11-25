# Setup Guide - API Keys & Accounts

## 📋 Account Requirements

### Option 1: Basic Setup (NO ACCOUNTS NEEDED)
**The app works WITHOUT any API keys!**

The application uses intelligent fallback logic and will:
- Parse PDF and DOCX files locally
- Extract keywords using NLP algorithms
- Match skills using pattern matching
- Check ATS compatibility
- Generate recommendations

✅ **You can test the app immediately without creating any accounts!**

---

### Option 2: Full AI Features (RECOMMENDED)
For enhanced AI-powered analysis with semantic understanding:

#### Hugging Face API (FREE - Recommended)

**What it does:**
- Advanced text similarity analysis using AI embeddings
- Semantic skill matching
- More accurate resume-job description comparison

**How to get it:**

1. **Create Account:**
   - Go to: https://huggingface.co/join
   - Sign up with email (free)
   - Verify your email

2. **Get API Key:**
   - After login, go to: https://huggingface.co/settings/tokens
   - Click "New token"
   - Give it a name (e.g., "Resume Checker")
   - Select role: "Read" (default)
   - Click "Generate token"

3. **Copy the token** (looks like: `hf_xxxxxxxxxxxxxxxxxxxxx`)

4. **Add to your project:**
   - Create a file called `.env.local` in the project root
   - Add this line:
   ```
   HUGGING_FACE_API_KEY=hf_your_actual_token_here
   ```

**Free Tier Limits:**
- ✅ 30,000 requests per month
- ✅ No credit card required
- ✅ Permanent free access

---

## 🚀 Quick Start Instructions

### If you want to use the app RIGHT NOW (No API keys):

1. The dev server is already running!
2. Open your browser: **http://localhost:3000**
3. Upload a resume and paste a job description
4. Click "Analyze Resume"
5. The app will work perfectly with fallback analysis

### If you want FULL AI features:

1. **Create Hugging Face account** (5 minutes):
   - https://huggingface.co/join
   
2. **Get API key** (1 minute):
   - settings/tokens → "New token" → Copy it
   
3. **Create `.env.local` file** in project root:
   ```bash
   HUGGING_FACE_API_KEY=hf_your_token_here
   HUGGING_FACE_MODEL_CLASSIFICATION=facebook/bart-large-mnli
   HUGGING_FACE_MODEL_EMBEDDINGS=sentence-transformers/all-MiniLM-L6-v2
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_MAX_FILE_SIZE=5242880
   NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.doc,.docx
   ```

4. **Restart the dev server**:
   ```bash
   # Stop current server (Ctrl+C in terminal)
   npm run dev
   ```

5. **That's it!** The app now has full AI capabilities

---

## 🔍 How to Tell if AI Features are Active

**Without API Key:**
- App works fine
- Uses rule-based analysis
- Results appear instantly (1-2 seconds)

**With API Key:**
- Enhanced accuracy
- Semantic text understanding
- Takes 10-30 seconds (AI processing time)
- Better skill matching

Both modes produce great results!

---

## ❓ Troubleshooting

### "Analysis failed" error:
- Check if API key is correct (starts with `hf_`)
- Ensure `.env.local` file is in the root folder
- Restart dev server after adding API key

### File upload not working:
- Make sure file is PDF or DOCX
- File must be under 5MB
- Try a different browser if issues persist

### App won't start:
- Check if port 3000 is already in use
- Try: `npm run dev -- -p 3001` (use different port)

---

## 📊 What Each Mode Provides

| Feature | Without API Key | With Hugging Face API |
|---------|----------------|----------------------|
| Resume Parsing | ✅ | ✅ |
| Keyword Extraction | ✅ | ✅ |
| Skill Matching | ✅ Basic | ✅ AI-Enhanced |
| ATS Checking | ✅ | ✅ |
| Similarity Score | ✅ Rule-based | ✅ AI-Powered |
| Recommendations | ✅ | ✅ Better |
| Speed | ⚡ Instant | 🔄 10-30s |

---

## 🎯 Recommendation

**For testing/development:** 
- Start without API key
- Test all features first
- App works perfectly!

**For production/best results:**
- Add Hugging Face API key
- Get more accurate AI analysis
- Still completely free!

---

**Current Status:**
✅ App is running at: http://localhost:3000
✅ Ready to use without any accounts
💡 Add Hugging Face key later for AI boost
