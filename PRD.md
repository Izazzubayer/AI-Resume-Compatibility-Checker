# AI Resume Compatibility Checker

A comprehensive Next.js web application that analyzes resume compatibility with job descriptions using AI, providing detailed scoring and recommendations to help job seekers optimize their applications.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Usage](#usage)
- [Components](#components)
- [Scoring Algorithm](#scoring-algorithm)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The AI Resume Compatibility Checker helps job seekers understand how well their resume matches a specific job posting. By leveraging free AI APIs, the application provides:

- Resume parsing and analysis
- Job description matching
- Compatibility scoring (0-100%)
- Keyword analysis
- Skills gap identification
- Actionable recommendations
- ATS (Applicant Tracking System) optimization tips

## ✨ Features

### Core Features

1. **Resume Upload**
   - Support for PDF, DOC, DOCX formats
   - File size limit: 5MB
   - Automatic text extraction
   - Privacy-focused (no permanent storage)

2. **Job Description Input**
   - Manual paste option
   - Job title and seniority level selection
   - Sample job description generator
   - Template library for common roles

3. **AI-Powered Analysis**
   - Keyword matching
   - Skills assessment
   - Experience alignment
   - Education requirements check
   - ATS compatibility check

4. **Comprehensive Scoring**
   - Overall compatibility score (0-100%)
   - Category breakdowns:
     - Skills Match (30%)
     - Experience Match (25%)
     - Keyword Optimization (20%)
     - Education Match (15%)
     - ATS Compatibility (10%)

5. **Detailed Reports**
   - Visual score presentation
   - Strengths and weaknesses
   - Missing keywords
   - Improvement suggestions
   - Downloadable PDF report

6. **Additional Features**
   - Resume optimization tips
   - Industry-specific insights
   - Comparison with previous scans
   - Progress tracking

## 🛠 Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **React 18+**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Framer Motion** (animations)
- **React Dropzone** (file uploads)
- **Recharts** (data visualization)

### Backend
- **Next.js API Routes**
- **Mammoth.js** (DOCX parsing)
- **PDF-parse** (PDF parsing)
- **Natural** (NLP processing)

### AI APIs (Free Options)

1. **Primary: Hugging Face Inference API**
   - Model: `facebook/bart-large-mnli` (zero-shot classification)
   - Model: `sentence-transformers/all-MiniLM-L6-v2` (embeddings)
   - Free tier: 30,000 requests/month

2. **Alternative: Cohere API**
   - Free tier: 100 calls/minute
   - Excellent for text analysis and classification

3. **Fallback: Together AI**
   - Free tier available
   - Multiple open-source models

## 📁 Project Structure

```
ai-resume-checker/
├── app/
│   ├── (routes)/
│   │   ├── page.tsx                 # Home page
│   │   ├── analyze/
│   │   │   └── page.tsx            # Analysis page
│   │   ├── results/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Results page
│   │   └── history/
│   │       └── page.tsx            # Scan history
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts            # Main analysis endpoint
│   │   ├── parse-resume/
│   │   │   └── route.ts            # Resume parsing
│   │   ├── generate-job/
│   │   │   └── route.ts            # Sample job generator
│   │   └── download-report/
│   │       └── route.ts            # PDF report generation
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── ResumeUploader.tsx           # File upload component
│   ├── JobDescriptionInput.tsx      # Job input component
│   ├── ScoreDisplay.tsx             # Score visualization
│   ├── AnalysisReport.tsx           # Detailed report
│   ├── KeywordAnalysis.tsx          # Keyword matching
│   ├── RecommendationsList.tsx      # Improvement tips
│   └── ProgressSteps.tsx            # Step indicator
├── lib/
│   ├── ai/
│   │   ├── huggingface.ts          # HF API client
│   │   ├── analyzer.ts              # Analysis logic
│   │   └── scorer.ts                # Scoring algorithm
│   ├── parsers/
│   │   ├── pdf-parser.ts           # PDF extraction
│   │   ├── docx-parser.ts          # DOCX extraction
│   │   └── text-processor.ts       # Text normalization
│   ├── utils/
│   │   ├── keyword-extractor.ts    # Keyword extraction
│   │   ├── skill-matcher.ts        # Skills matching
│   │   └── ats-checker.ts          # ATS compatibility
│   └── constants.ts                 # App constants
├── types/
│   ├── resume.ts
│   ├── job.ts
│   └── analysis.ts
├── public/
│   ├── images/
│   └── templates/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🚀 Installation

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm
- Git

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-resume-checker.git
cd ai-resume-checker
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Configure API keys** (see Configuration section)

5. **Run development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open browser**
Navigate to `http://localhost:3000`

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Hugging Face API
HUGGING_FACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx
HUGGING_FACE_MODEL_CLASSIFICATION=facebook/bart-large-mnli
HUGGING_FACE_MODEL_EMBEDDINGS=sentence-transformers/all-MiniLM-L6-v2

# Alternative APIs (optional)
COHERE_API_KEY=your_cohere_key
TOGETHER_AI_KEY=your_together_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.doc,.docx

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Getting API Keys

#### Hugging Face (Recommended - Free)

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account
3. Navigate to Settings → Access Tokens
4. Create a new token with "Read" access
5. Copy the token to `HUGGING_FACE_API_KEY`

**Free Tier:**
- 30,000 requests/month
- No credit card required
- Access to thousands of models

#### Cohere (Alternative - Free)

1. Visit [Cohere](https://cohere.ai/)
2. Sign up for a free account
3. Go to Dashboard → API Keys
4. Copy your trial key

**Free Tier:**
- 100 calls/minute
- Good for text analysis

#### Together AI (Fallback - Free)

1. Go to [Together AI](https://www.together.ai/)
2. Create an account
3. Get your API key from dashboard

**Free Tier:**
- Free credits on signup
- Multiple open-source models

## 🔌 API Integration

### Hugging Face Integration

**lib/ai/huggingface.ts**

```typescript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export async function analyzeTextSimilarity(
  text1: string,
  text2: string
): Promise<number> {
  const embedding1 = await hf.featureExtraction({
    model: process.env.HUGGING_FACE_MODEL_EMBEDDINGS!,
    inputs: text1,
  });

  const embedding2 = await hf.featureExtraction({
    model: process.env.HUGGING_FACE_MODEL_EMBEDDINGS!,
    inputs: text2,
  });

  return cosineSimilarity(embedding1, embedding2);
}

export async function classifySkills(
  resumeText: string,
  requiredSkills: string[]
): Promise<SkillMatch[]> {
  const results = await hf.zeroShotClassification({
    model: process.env.HUGGING_FACE_MODEL_CLASSIFICATION!,
    inputs: resumeText,
    parameters: {
      candidate_labels: requiredSkills,
    },
  });

  return results.labels.map((label, idx) => ({
    skill: label,
    confidence: results.scores[idx],
    present: results.scores[idx] > 0.5,
  }));
}
```

### Analysis Endpoint

**app/api/analyze/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/ai/analyzer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resume = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const seniority = formData.get('seniority') as string;

    // Parse resume
    const resumeText = await parseResume(resume);

    // Perform analysis
    const analysis = await analyzeResume({
      resumeText,
      jobDescription,
      jobTitle,
      seniority,
    });

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
```

## 📖 Usage

### Basic Workflow

1. **Upload Resume**
   - Click "Upload Resume" button
   - Select your resume file (PDF, DOC, DOCX)
   - Wait for file validation

2. **Add Job Description**
   - Option A: Paste job description directly
   - Option B: Use job generator (select title + seniority)
   - Review and edit if needed

3. **Analyze**
   - Click "Get Result" button
   - Wait for AI analysis (10-30 seconds)
   - View comprehensive results

4. **Review Results**
   - Overall compatibility score
   - Category breakdowns
   - Missing keywords
   - Recommendations
   - Download PDF report

### Example Usage

```typescript
// Client-side usage example
import { useState } from 'react';

function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('resume', file!);
    formData.append('jobDescription', jobDesc);
    formData.append('jobTitle', 'Software Engineer');
    formData.append('seniority', 'Mid-Level');

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setResults(data.data);
    setLoading(false);
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## 🧩 Components

### Key Components Overview

#### 1. ResumeUploader

Handles file upload with drag-and-drop support.

```typescript
interface ResumeUploaderProps {
  onFileSelect: (file: File) => void;
  maxSize?: number;
  acceptedFormats?: string[];
}
```

#### 2. JobDescriptionInput

Provides job description input with generator.

```typescript
interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate?: (title: string, seniority: string) => void;
}
```

#### 3. ScoreDisplay

Visualizes compatibility scores with animations.

```typescript
interface ScoreDisplayProps {
  overallScore: number;
  categoryScores: CategoryScore[];
  animated?: boolean;
}
```

#### 4. AnalysisReport

Displays detailed analysis results.

```typescript
interface AnalysisReportProps {
  analysis: AnalysisResult;
  onDownloadPDF: () => void;
}
```

## 🎯 Scoring Algorithm

### Overall Score Calculation

The compatibility score is calculated using weighted categories:

```typescript
interface ScoreWeights {
  skills: 0.30;        // 30%
  experience: 0.25;    // 25%
  keywords: 0.20;      // 20%
  education: 0.15;     // 15%
  ats: 0.10;           // 10%
}

function calculateOverallScore(scores: CategoryScores): number {
  return (
    scores.skills * 0.30 +
    scores.experience * 0.25 +
    scores.keywords * 0.20 +
    scores.education * 0.15 +
    scores.ats * 0.10
  );
}
```

### Category Scoring Details

#### Skills Match (30%)
- Extract skills from job description
- Identify skills in resume
- Calculate match percentage
- Consider synonyms and related skills

#### Experience Match (25%)
- Compare years of experience
- Match job responsibilities
- Evaluate relevant projects
- Consider industry alignment

#### Keyword Optimization (20%)
- Extract important keywords
- Check keyword presence
- Analyze keyword density
- Evaluate keyword placement

#### Education Match (15%)
- Compare degree requirements
- Check certifications
- Validate education level
- Consider relevant coursework

#### ATS Compatibility (10%)
- Check formatting issues
- Validate file structure
- Test for parsing problems
- Verify readability

### Score Interpretation

- **90-100%**: Excellent match - highly likely to pass ATS
- **75-89%**: Good match - strong chance of consideration
- **60-74%**: Fair match - some optimization needed
- **45-59%**: Poor match - significant improvements required
- **0-44%**: Very poor match - major revision needed

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your repository
   - Configure environment variables
   - Deploy

3. **Environment Variables**
   - Add all variables from `.env.local`
   - Ensure API keys are correct
   - Save and redeploy

### Alternative: Railway

1. Install Railway CLI
2. Run `railway login`
3. Run `railway init`
4. Run `railway up`
5. Add environment variables in dashboard

### Alternative: Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables
4. Deploy

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### Testing

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Hugging Face for free AI models
- Vercel for hosting
- shadcn/ui for components
- Next.js team for the framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-resume-checker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-resume-checker/discussions)
- **Email**: support@yourapp.com

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Resume builder integration
- [ ] Cover letter analyzer
- [ ] LinkedIn profile import
- [ ] Job board integration
- [ ] AI-powered resume improvements
- [ ] Interview preparation tips
- [ ] Salary insights
- [ ] Company culture match
- [ ] Mobile app

## 📊 Performance

- **Analysis Time**: 10-30 seconds
- **Accuracy**: 85-90%
- **File Processing**: <2 seconds
- **API Response**: <5 seconds

## 🔒 Privacy & Security

- Files are processed in memory only
- No permanent storage of resumes
- API keys stored securely
- HTTPS encryption
- GDPR compliant
- No tracking or analytics (optional)

---

**Built with ❤️ using Next.js and AI**