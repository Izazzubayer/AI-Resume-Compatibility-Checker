# Architecture Documentation
## AI Resume Compatibility Checker

> **Version**: 1.0.0  
> **Last Updated**: November 2025  
> **Framework**: Next.js 16 with App Router

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Data Flow](#data-flow)
6. [Component Architecture](#component-architecture)
7. [API Design](#api-design)
8. [Core Algorithms](#core-algorithms)
9. [File Structure](#file-structure)
10. [Integration Points](#integration-points)
11. [Security & Privacy](#security--privacy)
12. [Performance Considerations](#performance-considerations)
13. [Deployment Architecture](#deployment-architecture)
14. [Future Extensibility](#future-extensibility)

---

## System Overview

### Purpose
A web application that analyzes resume compatibility with job descriptions using AI and NLP techniques, providing actionable insights to help job seekers optimize their applications.

### Key Capabilities
- Resume parsing (PDF, DOC, DOCX)
- AI-powered text similarity analysis
- Multi-dimensional scoring (Skills, Experience, Keywords, ATS)
- Intelligent recommendations generation
- ATS compatibility checking

### Design Philosophy
1. **Privacy-First**: No permanent storage, in-memory processing only
2. **Graceful Degradation**: Works without AI API keys using fallback logic
3. **Transparency**: Clear indication of analysis methods used
4. **Performance**: Client-side file handling, optimized API calls
5. **User Experience**: Clean, minimalist UI with clear actionable insights

---

## Architecture Principles

### 1. Separation of Concerns
- **Presentation Layer**: React components (`app/`, `components/`)
- **API Layer**: Next.js route handlers (`app/api/`)
- **Business Logic**: Pure functions (`lib/`)
- **Type Definitions**: Centralized types (`types/`)

### 2. Modular Design
Each module has a single responsibility:
- Parsers handle file extraction only
- Analyzers perform text analysis
- Scorers calculate numerical results
- UI components render without business logic

### 3. Fail-Safe Architecture
```
Primary Path (AI)  →  Fallback Path (Heuristic)  →  Error Handling
```
Every AI operation has a non-AI alternative.

### 4. Client-Server Balance
- File validation: Client-side
- File parsing: Server-side
- Result storage: Client-side (localStorage)
- Heavy computation: Server-side with timeout protection

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.4 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 4.1.17 | Styling |
| Framer Motion | 12.23.24 | Animations |
| Lucide React | 0.554.0 | Icons |

### UI Components
| Library | Purpose |
|---------|---------|
| Radix UI | Accessible component primitives |
| shadcn/ui | Pre-built component library |
| class-variance-authority | Component variant styling |

### Backend / Processing
| Technology | Version | Purpose |
|------------|---------|---------|
| Mammoth.js | 1.11.0 | DOCX parsing |
| pdf-parse-fork | 1.2.0 | PDF text extraction |
| Natural | 8.1.0 | NLP processing |
| @huggingface/inference | 4.13.3 | AI model integration |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  HomePage    │  │  ResultsPage │  │  LocalStorage│     │
│  │  (Upload)    │  │  (Display)   │  │  (Cache)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP/JSON
             │
┌────────────┼────────────────────────────────────────────────┐
│            │         Next.js Server (Edge/Node)             │
├────────────┼────────────────────────────────────────────────┤
│            │                                                 │
│  ┌─────────▼──────────┐      ┌─────────────────────┐       │
│  │  API Routes        │      │  Server Components  │       │
│  ├────────────────────┤      └─────────────────────┘       │
│  │ /api/parse-resume  │                                     │
│  │ /api/analyze       │                                     │
│  └─────────┬──────────┘                                     │
│            │                                                 │
│  ┌─────────▼──────────────────────────────────────────┐    │
│  │              Core Business Logic (lib/)             │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌───────────┐  ┌─────────────┐     │    │
│  │  │ Parsers  │  │ Analyzers │  │  Utilities  │     │    │
│  │  └─────┬────┘  └─────┬─────┘  └──────┬──────┘     │    │
│  │        │             │                │             │    │
│  │        └─────────────┼────────────────┘             │    │
│  │                      │                              │    │
│  └──────────────────────┼──────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ HTTPS API
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              External Services (Optional)                    │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐           │
│  │         Hugging Face Inference API           │           │
│  ├──────────────────────────────────────────────┤           │
│  │  • sentence-transformers (embeddings)        │           │
│  │  • facebook/bart-large-mnli (classification) │           │
│  └──────────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Complete Analysis Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: File Upload (Client)                                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ 1a. Validate file type (PDF, DOC, DOCX)
                  │ 1b. Validate file size (< 5MB)
                  │ 1c. Create FormData
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Parse Resume (Server: /api/parse-resume)                │
├─────────────────────────────────────────────────────────────────┤
│  • Detect file type                                             │
│  • Route to appropriate parser                                  │
│    ├─ PDF: pdf-parse-fork                                       │
│    ├─ DOCX: mammoth.js                                          │
│    └─ DOC: mammoth.js with conversion                           │
│  • Extract raw text                                             │
│  • Return: { text: string }                                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Analyze (Server: /api/analyze)                          │
├─────────────────────────────────────────────────────────────────┤
│  Input: { resumeText, jobDescription, jobTitle, seniority }     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 3a. Keyword Extraction (lib/utils/keyword-extractor)   │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • Extract keywords from job description (TF-IDF)      │    │
│  │  • Find matches in resume text                         │    │
│  │  • Identify missing keywords                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 3b. Skill Matching (lib/utils/skill-matcher)           │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • Extract skills from both texts                      │    │
│  │  • Match with synonym support                          │    │
│  │  • Calculate match percentage                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 3c. Experience Analysis (lib/parsers/text-processor)   │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • Parse years of experience from resume               │    │
│  │  • Compare with seniority requirements                 │    │
│  │  • Calculate experience score                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 3d. ATS Check (lib/utils/ats-checker)                  │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • Check minimum text length                           │    │
│  │  • Validate special characters                         │    │
│  │  • Check for common ATS issues                         │    │
│  │  • Generate ATS score                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 3e. AI Analysis (lib/ai/huggingface) [OPTIONAL]        │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  IF API_KEY exists:                                    │    │
│  │    • Get text embeddings (both texts)                  │    │
│  │    • Calculate cosine similarity                       │    │
│  │    • Perform zero-shot skill classification            │    │
│  │    • Add confidence scores to skills                   │    │
│  │  ELSE:                                                 │    │
│  │    • Use heuristic matching only                       │    │
│  │    • Set similarity unavailable                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 3f. Score Calculation (lib/ai/scorer)                  │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • Normalize all category scores (0-100)               │    │
│  │  • Calculate weighted average                          │    │
│  │  • Identify strengths/weaknesses                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 3g. Generate Recommendations                            │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • Analyze weak categories                             │    │
│  │  • Prioritize improvements (high/medium/low)           │    │
│  │  • Generate actionable suggestions                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Output: AnalysisResult (typed object)                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Store & Navigate (Client)                               │
├─────────────────────────────────────────────────────────────────┤
│  • Store result in localStorage                                 │
│  • Navigate to /results/[id]                                    │
│  • Render results page with analysis data                       │
└─────────────────────────────────────────────────────────────────┘
```

### Scoring Algorithm Flow

```
Category Scores (0-100 each)
│
├─ Skills Score (30% weight)
│  └─ (matched skills / total required skills) × 100
│
├─ Experience Score (25% weight)
│  └─ Comparison of resume years vs required years
│
├─ Keywords Score (20% weight)
│  └─ (matched keywords / total keywords) × 100
│
└─ ATS Score (10% weight)
   └─ Sum of passed checks / total checks × 100

Overall Score = (Skills × 0.30) + (Experience × 0.25) 
              + (Keywords × 0.20) + (ATS × 0.10)
```

---

## Component Architecture

### Page Components

#### `app/page.tsx` - Home Page
**Responsibilities:**
- File upload with drag-and-drop
- Job description input
- Form validation
- API orchestration

**State Management:**
```typescript
{
  file: File | null,              // Uploaded resume file
  jobDescription: string,         // Job posting text
  loading: boolean,               // Analysis in progress
  error: string,                  // Error messages
  dragActive: boolean             // Drag-and-drop state
}
```

**User Flow:**
1. Upload resume → Validate → Store in state
2. Enter job description → Validate
3. Click "Analyze" → Call APIs → Navigate to results

#### `app/results/[id]/page.tsx` - Results Page
**Responsibilities:**
- Display analysis results
- Visualize scores
- Show recommendations
- Present skill matches/gaps

**Data Source:**
- Retrieves from localStorage using ID from URL params
- Falls back gracefully if data not found

**Sections:**
1. Hero: Overall score with interpretation
2. Category Scores: Detailed breakdown with progress bars
3. Skills Analysis: Matched vs. missing skills
4. Recommendations: Prioritized action items
5. Keywords: Terms to add to resume
6. ATS Report: Compatibility issues and passed checks

---

## API Design

### POST `/api/parse-resume`

**Purpose**: Extract text from uploaded resume file

**Request:**
```typescript
Content-Type: multipart/form-data

FormData {
  file: File  // PDF, DOC, or DOCX
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    text: string,      // Extracted text content
    fileName: string,  // Original file name
    fileType: string   // MIME type
  }
}
```

**Error Response:**
```typescript
{
  error: string,       // Error message
  details?: string     // Additional error info
}
```

**Processing Logic:**
1. Validate file type and size
2. Detect file format from MIME type
3. Route to appropriate parser:
   - PDF → `lib/parsers/pdf-parser.ts`
   - DOCX → `lib/parsers/docx-parser.ts`
4. Extract and clean text
5. Return structured response

**Timeout**: 30 seconds (default)

---

### POST `/api/analyze`

**Purpose**: Perform comprehensive resume analysis

**Request:**
```typescript
Content-Type: application/json

{
  resumeText: string,        // Extracted resume text
  jobDescription: string,    // Job posting text
  jobTitle: string,          // Role title
  seniority: string,         // 'entry' | 'mid' | 'senior' | 'lead'
  fileName?: string          // Optional file name
}
```

**Response:**
```typescript
{
  success: boolean,
  data: AnalysisResult {
    id: string,                    // Unique analysis ID
    overallScore: number,          // 0-100
    categoryScores: {
      skills: number,
      experience: number,
      keywords: number,
      ats: number
    },
    strengths: string[],
    weaknesses: string[],
    missingKeywords: string[],
    recommendations: Recommendation[],
    skillsAnalysis: {
      matched: SkillMatch[],
      missing: string[],
      matchPercentage: number
    },
    atsCompatibility: {
      score: number,
      issues: string[],
      passedChecks: string[]
    },
    meta: {
      similarityUsed: boolean,
      similarityScore?: number,
      similarityNote?: string,
      skillConfidenceSource: 'huggingface' | 'heuristic'
    },
    createdAt: Date
  }
}
```

**Error Response:**
```typescript
{
  error: string,
  details?: string
}
```

**Processing Time:**
- Without AI: 1-3 seconds
- With AI: 10-30 seconds

**Timeout**: 60 seconds (configured via `maxDuration`)

---

## Core Algorithms

### 1. Keyword Extraction (TF-IDF)

**File**: `lib/utils/keyword-extractor.ts`

**Algorithm:**
```
1. Tokenize text into words
2. Remove stopwords (common words like "the", "and")
3. Calculate term frequency (TF) for each word
4. Calculate inverse document frequency (IDF)
5. Score = TF × IDF
6. Sort by score and return top N keywords
```

**Implementation:**
```typescript
function extractKeywords(text: string, limit: number): string[] {
  // Uses Natural.js TfIdf
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(text);
  
  // Extract and sort terms
  const terms = [];
  tfidf.listTerms(0).forEach(item => {
    if (item.term.length > 2) {  // Filter short words
      terms.push(item.term);
    }
  });
  
  return terms.slice(0, limit);
}
```

---

### 2. Skill Matching with Synonyms

**File**: `lib/utils/skill-matcher.ts`

**Algorithm:**
```
1. Define skill synonym mappings
2. For each skill in COMMON_SKILLS:
   a. Check if skill appears in text (word boundary regex)
   b. If not found, check synonyms
   c. If found via any method, add to matched list
3. Compare resume skills vs job skills
4. Calculate match percentage
```

**Key Features:**
- Word boundary matching (prevents "Go" matching "Good")
- Synonym support (e.g., "JS" → "JavaScript")
- Case-insensitive matching

**Synonym Examples:**
```typescript
{
  'javascript': ['js', 'ecmascript', 'es6'],
  'typescript': ['ts'],
  'react': ['reactjs', 'react.js'],
  'postgresql': ['postgres', 'psql'],
  'aws': ['amazon web services']
}
```

---

### 3. Cosine Similarity (AI Mode)

**File**: `lib/utils.ts`

**Purpose**: Measure semantic similarity between resume and job description

**Algorithm:**
```
Given two vectors A and B (embeddings):

similarity = (A · B) / (||A|| × ||B||)

Where:
  • A · B = dot product
  • ||A|| = magnitude of A
  • ||B|| = magnitude of B
  
Result: Value between 0 (no similarity) and 1 (identical)
```

**Implementation:**
```typescript
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  // Dot product
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  
  // Magnitudes
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  return dotProduct / (magA * magB);
}
```

---

### 4. ATS Compatibility Checks

**File**: `lib/utils/ats-checker.ts`

**Checks Performed:**
```typescript
[
  {
    name: 'Minimum Length',
    test: text.length >= 500,
    message: 'Resume is too short for proper parsing'
  },
  {
    name: 'Contact Information',
    test: /email|phone|@/.test(text),
    message: 'No clear contact information found'
  },
  {
    name: 'Special Characters',
    test: specialCharCount < textLength * 0.05,
    message: 'Too many special characters may confuse parsers'
  },
  {
    name: 'Readable Text',
    test: alphaNumericCount > textLength * 0.7,
    message: 'Text may not be properly extracted'
  },
  // ... more checks
]
```

**Score Calculation:**
```typescript
const score = (passedChecks / totalChecks) × 100
```

---

### 5. Score Normalization

**File**: `lib/ai/scorer.ts`

**Purpose**: Ensure all scores are within 0-100 range

```typescript
function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
```

**Category Score Calculations:**

```typescript
// Skills Score
function calculateSkillsScore(matched: number, total: number): number {
  if (total === 0) return 0;
  return (matched / total) * 100;
}

// Experience Score
function calculateExperienceScore(
  resumeYears: number, 
  requiredYears: number
): number {
  if (resumeYears >= requiredYears) return 100;
  if (resumeYears === 0) return 0;
  return (resumeYears / requiredYears) * 100;
}

// Keyword Score
function calculateKeywordScore(matched: number, total: number): number {
  if (total === 0) return 50;  // Default if no keywords
  return (matched / total) * 100;
}

// Overall Score (Weighted Average)
function calculateOverallScore(scores: CategoryScores): number {
  return normalizeScore(
    scores.skills * 0.30 +
    scores.experience * 0.25 +
    scores.keywords * 0.20 +
    scores.ats * 0.10
  );
}
```

---

## File Structure

```
/
├── app/                          # Next.js App Router
│   ├── api/                      # API Route Handlers
│   │   ├── analyze/
│   │   │   └── route.ts          # Main analysis endpoint (60s timeout)
│   │   └── parse-resume/
│   │       └── route.ts          # Resume parsing endpoint
│   ├── results/
│   │   └── [id]/
│   │       └── page.tsx          # Results display (client component)
│   ├── privacy/
│   │   └── page.tsx              # Privacy policy page
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home page (upload & input)
│   └── globals.css               # Global styles & Tailwind imports
│
├── components/
│   └── ui/                       # Reusable UI components (shadcn/ui)
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── separator.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
│
├── lib/                          # Core Business Logic
│   ├── ai/                       # AI & Analysis
│   │   ├── analyzer.ts           # Main orchestrator - analyzeResume()
│   │   ├── huggingface.ts        # Hugging Face API client
│   │   └── scorer.ts             # Score calculation functions
│   ├── parsers/                  # File Parsing
│   │   ├── pdf-parser.ts         # PDF text extraction
│   │   ├── docx-parser.ts        # DOCX text extraction
│   │   └── text-processor.ts    # Text cleaning & processing
│   ├── utils/                    # Utility Functions
│   │   ├── keyword-extractor.ts  # TF-IDF keyword extraction
│   │   ├── skill-matcher.ts      # Skill matching with synonyms
│   │   └── ats-checker.ts        # ATS compatibility checks
│   ├── constants.ts              # App constants (skills list, etc.)
│   └── utils.ts                  # General utilities (cosine similarity)
│
├── types/                        # TypeScript Type Definitions
│   ├── analysis.ts               # Analysis result types
│   ├── job.ts                    # Job description types
│   └── resume.ts                 # Resume data types
│
├── public/                       # Static Assets (if any)
│
├── .env.local                    # Environment variables (not in git)
├── components.json               # shadcn/ui configuration
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # User documentation
├── PRD.md                        # Product requirements
├── SETUP_GUIDE.md                # Setup instructions
└── ARCHITECTURE.md               # This file
```

### Key File Descriptions

#### `lib/ai/analyzer.ts` - Core Orchestrator
**Exports**: `analyzeResume(params) => AnalysisResult`

**Responsibilities:**
- Orchestrates entire analysis pipeline
- Calls all utility functions in sequence
- Handles AI vs fallback logic
- Aggregates results into typed response

**Dependencies:**
- All utility modules (keyword, skill, ATS)
- Hugging Face client (optional)
- Scorer functions

---

#### `lib/ai/huggingface.ts` - AI Integration
**Exports**:
- `getTextEmbedding(text) => number[]`
- `compareTexts(text1, text2) => number`
- `analyzeSkillMatch(resume, skills) => SkillMatch[]`

**Models Used:**
- `anass1209/resume-job-matcher-all-MiniLM-L6-v2` - Embeddings
- `facebook/bart-large-mnli` - Zero-shot classification

**Error Handling:**
- Throws errors if API key missing
- Errors are caught in analyzer.ts and handled gracefully

---

#### `lib/ai/scorer.ts` - Scoring Logic
**Exports**:
- `calculateSkillsScore()`
- `calculateExperienceScore()`
- `calculateKeywordScore()`
- `calculateOverallScore()`
- `normalizeScore()`

**Pure Functions**: No side effects, fully testable

---

## Integration Points

### Hugging Face API

**Authentication:**
```typescript
// Environment variable
HUGGING_FACE_API_KEY=hf_xxxxxxxxxxxxx

// Client initialization
import { HfInference } from '@huggingface/inference';
const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);
```

**API Calls:**

1. **Feature Extraction (Embeddings)**
```typescript
const result = await hf.featureExtraction({
  model: 'anass1209/resume-job-matcher-all-MiniLM-L6-v2',
  inputs: text.substring(0, 1000)  // Max 1000 chars
});
// Returns: number[] (embedding vector)
```

2. **Zero-Shot Classification (Skill Matching)**
```typescript
const result = await hf.zeroShotClassification({
  model: 'facebook/bart-large-mnli',
  inputs: resumeText.substring(0, 1000),
  parameters: {
    candidate_labels: skills.slice(0, 10)  // Max 10 skills
  }
});
// Returns: { labels: string[], scores: number[] }
```

**Rate Limits:**
- Free tier: 30,000 requests/month
- No request throttling implemented (assumes free tier sufficient)

**Fallback Strategy:**
```typescript
if (!process.env.HUGGING_FACE_API_KEY) {
  // Use heuristic analysis only
  similarityUsed = false;
  skillConfidenceSource = 'heuristic';
}
```

---

### Natural.js NLP Library

**Usage:**
```typescript
import natural from 'natural';

// TF-IDF for keyword extraction
const tfidf = new natural.TfIdf();
tfidf.addDocument(text);

// Tokenization
const tokenizer = new natural.WordTokenizer();
const tokens = tokenizer.tokenize(text);
```

**No API key required** - Runs locally

---

### File Parsing Libraries

**PDF Parsing:**
```typescript
import pdfParse from 'pdf-parse-fork';

const data = await pdfParse(buffer);
const text = data.text;
```

**DOCX Parsing:**
```typescript
import mammoth from 'mammoth';

const result = await mammoth.extractRawText({ buffer });
const text = result.value;
```

---

## Security & Privacy

### Data Handling
1. **No Persistent Storage**: Files processed in memory only
2. **No Database**: No resume data stored server-side
3. **Client-Side Cache**: Results stored in localStorage only
4. **Session-Based**: Data cleared on browser close (if not saved)

### API Security
1. **Input Validation**: File size, type, content validation
2. **Timeout Protection**: 60-second max for analysis
3. **Error Sanitization**: No sensitive data in error messages
4. **CORS**: Default Next.js CORS settings

### Environment Variables
```bash
# Server-side only (never exposed to client)
HUGGING_FACE_API_KEY=xxx
HUGGING_FACE_MODEL_CLASSIFICATION=xxx
HUGGING_FACE_MODEL_EMBEDDINGS=xxx

# Client-side (prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_APP_URL=xxx
NEXT_PUBLIC_MAX_FILE_SIZE=xxx
NEXT_PUBLIC_ALLOWED_FILE_TYPES=xxx
```

### Privacy Considerations
- **No Analytics**: No tracking by default
- **No Third-Party Scripts**: Clean HTML output
- **GDPR Compliant**: No personal data retention
- **Transparent Processing**: Clear indication of AI usage

---

## Performance Considerations

### Optimization Strategies

#### 1. Client-Side Validation
**Benefit**: Reduces unnecessary server requests
```typescript
// File validation before upload
- Type check (PDF, DOC, DOCX)
- Size check (< 5MB)
- User feedback immediate
```

#### 2. Lazy Loading
```typescript
// Results page only loads when needed
// No heavy components on home page
```

#### 3. Text Truncation for AI
```typescript
// Limit text sent to AI (cost & speed)
inputs: text.substring(0, 1000)  // Max 1000 chars
```

#### 4. Parallel Processing
```typescript
// Multiple AI calls in parallel
const [embedding1, embedding2] = await Promise.all([
  getTextEmbedding(text1),
  getTextEmbedding(text2)
]);
```

#### 5. Memoization Opportunities
**Future Enhancement:**
```typescript
// Cache embeddings for common skills
// Cache TF-IDF results for similar texts
```

### Performance Metrics

| Operation | Time | Bottleneck |
|-----------|------|------------|
| File Upload | < 100ms | Network |
| File Parsing | 1-2s | CPU (parsing) |
| Analysis (No AI) | 1-3s | CPU (NLP) |
| Analysis (With AI) | 10-30s | Network (API) |
| Results Rendering | < 500ms | Browser |

### Scalability Considerations

1. **Stateless Architecture**: Easy horizontal scaling
2. **No Database**: No database bottleneck
3. **Edge Deployment**: Can run on Vercel Edge for global latency
4. **API Rate Limits**: Hugging Face free tier (30k/month)
   - With 1000 users/month: 30 analyses per user
   - Need paid tier for higher volume

---

## Deployment Architecture

### Recommended: Vercel

**Configuration:**
```javascript
// next.config.mjs
const nextConfig = {
  // Edge runtime for faster cold starts
  experimental: {
    runtime: 'nodejs'  // Required for file parsing libraries
  }
};
```

**Environment Variables (Production):**
```bash
# Set in Vercel Dashboard → Settings → Environment Variables
HUGGING_FACE_API_KEY=xxx
HUGGING_FACE_MODEL_CLASSIFICATION=facebook/bart-large-mnli
HUGGING_FACE_MODEL_EMBEDDINGS=anass1209/resume-job-matcher-all-MiniLM-L6-v2
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.doc,.docx
```

**Build Command:**
```bash
npm run build
```

**Deployment Steps:**
1. Push to GitHub
2. Import in Vercel
3. Configure environment variables
4. Deploy (automatic on push)

---

### Alternative: Self-Hosted (Docker)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - HUGGING_FACE_API_KEY=${HUGGING_FACE_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped
```

---

## Future Extensibility

### Planned Enhancements

#### 1. Database Integration
**Current**: localStorage only  
**Future**: PostgreSQL + Prisma
```typescript
// Store analysis history
// User accounts
// Compare multiple analyses
```

#### 2. Additional AI Providers
```typescript
// Modular AI adapter pattern
interface AIProvider {
  getEmbedding(text: string): Promise<number[]>;
  classifyText(text: string, labels: string[]): Promise<Result>;
}

// Implementations: Hugging Face, OpenAI, Cohere, etc.
```

#### 3. Real-Time Collaboration
```typescript
// Socket.io for live analysis updates
// Share results with colleagues
```

#### 4. Advanced Analytics
```typescript
// Track improvement over time
// Industry benchmarks
// Success rate metrics
```

#### 5. Resume Builder Integration
```typescript
// Edit resume inline
// Apply suggestions automatically
// Export to various formats
```

#### 6. Multi-Language Support
```typescript
// i18n integration
// Support non-English resumes
// Multilingual skill databases
```

---

### Extension Points

#### Adding a New Skill Category
**File**: `lib/constants.ts`
```typescript
export const COMMON_SKILLS = {
  technical: [...],
  soft: [...],
  newCategory: [...]  // Add here
};
```

#### Adding a New ATS Check
**File**: `lib/utils/ats-checker.ts`
```typescript
const checks = [
  ...existingChecks,
  {
    name: 'New Check',
    test: (text) => /* your logic */,
    message: 'Description'
  }
];
```

#### Custom Scoring Weights
**File**: `lib/ai/scorer.ts`
```typescript
// Modify weights in calculateOverallScore()
export const SCORE_WEIGHTS = {
  skills: 0.30,
  experience: 0.25,
  keywords: 0.20,
  ats: 0.10
};
```

---

## Troubleshooting Guide

### Common Issues

#### 1. "Analysis Failed" Error
**Cause**: Hugging Face API timeout or rate limit  
**Solution**: 
- Check API key validity
- Verify network connectivity
- Falls back to heuristic mode automatically

#### 2. PDF Parsing Returns Empty Text
**Cause**: Scanned PDF (image-based)  
**Solution**: 
- Add OCR library (tesseract.js)
- Inform user to use text-based PDF

#### 3. Slow Analysis (> 30s)
**Cause**: Hugging Face API slow response  
**Solution**:
- Already handled with 60s timeout
- Consider caching embeddings
- Use smaller text inputs

#### 4. Skills Not Detected
**Cause**: Skill not in COMMON_SKILLS list  
**Solution**: 
- Add skill to `lib/constants.ts`
- Add synonyms to `lib/utils/skill-matcher.ts`

---

## Testing Strategy

### Unit Tests (Recommended)
```typescript
// lib/ai/scorer.test.ts
describe('Score Calculation', () => {
  test('normalizes scores to 0-100 range', () => {
    expect(normalizeScore(150)).toBe(100);
    expect(normalizeScore(-10)).toBe(0);
  });
});
```

### Integration Tests
```typescript
// app/api/analyze/route.test.ts
describe('/api/analyze', () => {
  test('returns valid analysis result', async () => {
    const response = await POST(mockRequest);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.overallScore).toBeGreaterThanOrEqual(0);
  });
});
```

### E2E Tests (Playwright)
```typescript
test('complete analysis flow', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type=file]', 'sample.pdf');
  await page.fill('textarea', 'Sample job description');
  await page.click('button:has-text("Analyze")');
  await expect(page).toHaveURL(/\/results\//);
});
```

---

## Monitoring & Logging

### Current Logging
```typescript
// Console logs in development
console.log('✅ Hugging Face API call successful');
console.error('❌ Analysis failed:', error);
```

### Recommended Production Logging
```typescript
// Add structured logging
import { logger } from '@/lib/logger';

logger.info('Analysis started', { 
  userId, 
  fileSize, 
  hasAIKey: !!process.env.HUGGING_FACE_API_KEY 
});

logger.error('Analysis failed', { 
  error: error.message, 
  stack: error.stack 
});
```

### Recommended Monitoring
- **Sentry**: Error tracking
- **Vercel Analytics**: Performance metrics
- **Posthog**: User behavior (opt-in)

---

## Glossary

| Term | Definition |
|------|------------|
| **ATS** | Applicant Tracking System - Software used by employers to filter resumes |
| **Cosine Similarity** | Mathematical measure of similarity between two vectors |
| **Embeddings** | Vector representation of text capturing semantic meaning |
| **TF-IDF** | Term Frequency-Inverse Document Frequency - Keyword importance measure |
| **Zero-Shot Classification** | AI technique to classify text without training examples |
| **Heuristic Analysis** | Rule-based analysis without machine learning |
| **NLP** | Natural Language Processing |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Nov 2025 | Initial architecture documentation |

---

## Maintainers

This architecture document should be updated when:
- New features are added
- API endpoints change
- Major refactoring occurs
- New integrations are added
- Performance characteristics change

**Last Reviewed**: November 26, 2025

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build           # Production build
npm run start           # Start production server

# Type Checking
npm run type-check      # Run TypeScript compiler

# Linting
npm run lint            # Run ESLint
```

---

**End of Architecture Documentation**

