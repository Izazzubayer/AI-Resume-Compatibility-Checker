# AI Resume Compatibility Checker

A modern Next.js web application that analyzes resume compatibility with job descriptions using AI, providing detailed scoring and recommendations to help job seekers optimize their applications.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## 🌟 Features

- **Resume Upload**: Drag-and-drop support for PDF, DOC, and DOCX files
- **AI-Powered Analysis**: Uses Hugging Face models for intelligent text comparison
- **Comprehensive Scoring**: 
  - Skills Match (30%)
  - Experience Match (25%)
  - Keyword Optimization (20%)
  - Education Match (15%)
  - ATS Compatibility (10%)
- **Detailed Reports**: Visual score presentation with strengths, weaknesses, and recommendations
- **ATS Optimization**: Checks for Applicant Tracking System compatibility
- **Modern UI**: Premium design with glassmorphism, gradients, and smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. **Clone or navigate to the project directory**:
```bash
cd "AI Resume Compatibility Tester"
```

2. **Install dependencies** (if not already installed):
```bash
npm install
```

3. **Set up environment variables**:

Create a `.env.local` file in the root directory:

```env
# Hugging Face API (Optional - get your key from https://huggingface.co/settings/tokens)
# The app will work without this, but AI features will use fallback logic
HUGGING_FACE_API_KEY=

# Models (these are the defaults)
HUGGING_FACE_MODEL_CLASSIFICATION=facebook/bart-large-mnli
HUGGING_FACE_MODEL_EMBEDDINGS=sentence-transformers/all-MiniLM-L6-v2

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.doc,.docx
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Upload Resume**: 
   - Drag and drop your resume or click to browse
   - Supports PDF, DOC, DOCX (max 5MB)

2. **Add Job Details**:
   - Enter the job title
   - Select seniority level
   - Paste the complete job description

3. **Analyze**:
   - Click "Analyze Resume"
   - Wait 10-30 seconds for AI analysis

4. **Review Results**:
   - View overall compatibility score
   - Check category breakdowns
   - Review missing keywords and skills
   - Read actionable recommendations
   - Check ATS compatibility

## 🛠 Tech Stack

### Frontend
- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Framer Motion** (animations)
- **Radix UI** (components)
- **Lucide React** (icons)

### Backend
- **Next.js API Routes**
- **Mammoth.js** (DOCX parsing)
- **PDF-parse** (PDF parsing)
- **Natural** (NLP processing)

### AI Integration
- **Hugging Face Inference API** (optional)
  - Text embeddings with sentence-transformers
  - Zero-shot classification

## 📁 Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── analyze/          # Main analysis endpoint
│   │   └── parse-resume/     # Resume parsing endpoint
│   ├── results/[id]/         # Results page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── ai/                   # AI integration
│   │   ├── analyzer.ts       # Main analysis logic
│   │   ├── huggingface.ts    # HF API client
│   │   └── scorer.ts         # Scoring algorithms
│   ├── parsers/              # File parsers
│   │   ├── pdf-parser.ts
│   │   ├── docx-parser.ts
│   │   └── text-processor.ts
│   ├── utils/                # Utility functions
│   │   ├── keyword-extractor.ts
│   │   ├── skill-matcher.ts
│   │   └── ats-checker.ts
│   ├── constants.ts
│   └── utils.ts
└── types/                    # TypeScript definitions
    ├── analysis.ts
    ├── job.ts
    └── resume.ts
```

## 🔧 Configuration

### Getting Hugging Face API Key (Optional)

1. Go to [Hugging Face](https://huggingface.co/)
2. Create a free account
3. Navigate to Settings → Access Tokens
4. Create a new token with "Read" access
5. Copy the token to your `.env.local` file

**Note**: The application works without the API key using fallback analysis methods, but AI features will be limited.

### File Processing Limits

- **Max file size**: 5MB
- **Supported formats**: PDF, DOC, DOCX
- **Timeout**: 60 seconds for analysis

## 🎨 Design Features

- **Glassmorphism effects** for modern UI
- **Animated gradients** for visual appeal
- **Responsive design** for all screen sizes
- **Dark mode ready** with proper color schemes
- **Smooth transitions** and micro-animations
- **Premium color palettes** using HSL color spaces

## 📊 Scoring Algorithm

The overall compatibility score is calculated using weighted categories:

```typescript
Overall Score = 
  Skills Match × 30% +
  Experience Match × 25% +
  Keywords × 20% +
  Education × 15% +
  ATS Compatibility × 10%
```

### Score Interpretation

- **90-100%**: Excellent match - highly likely to pass ATS
- **75-89%**: Good match - strong chance of consideration
- **60-74%**: Fair match - some optimization needed
- **45-59%**: Poor match - significant improvements required
- **0-44%**: Very poor match - major revision needed

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

Compatible with:
- Railway
- Netlify
- Render
- Any Node.js hosting platform

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Hugging Face for AI models
- Vercel for Next.js framework
- shadcn/ui for component inspiration
- Radix UI for accessible components

## 📞 Support

For issues or questions:
- Create a GitHub issue
- Check existing documentation
- Review the PRD.md file for detailed specifications

---

**Built with ❤️ using Next.js and AI**
