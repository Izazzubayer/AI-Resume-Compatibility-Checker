export interface KeywordCategory {
    matched: string[];
    missing: string[];
}

export interface CategorizedKeywords {
    technicalSkills: KeywordCategory;
    abilities: KeywordCategory;
    significantKeywords: KeywordCategory;
}

export interface RequirementCoverage {
    requirement: string;
    coverage: 'fully covered' | 'partially covered' | 'not covered';
    confidence: number;
    userHas?: string; // What the user actually has based on resume
    comparison?: string; // AI-generated comparison text
}

export interface AnalysisResult {
    id: string;
    overallScore: number;
    categoryScores: CategoryScores;
    strengths: string[];
    weaknesses: string[];
    matchedKeywords: string[];
    missingKeywords: string[];
    categorizedKeywords: CategorizedKeywords;
    recommendations: Recommendation[];
    skillsAnalysis: SkillAnalysis;
    atsCompatibility: ATSAnalysis;
    requirementCoverage?: RequirementCoverage[];
    meta: AnalysisMeta;
    createdAt: Date;
}

export interface CategoryScores {
    skills: number;
    experience: number;
    keywords: number;
    ats: number;
}

export interface Recommendation {
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
}

export interface SkillAnalysis {
    matched: SkillMatch[];
    missing: string[];
    matchPercentage: number;
}

export interface SkillMatch {
    skill: string;
    confidence?: number;
    present: boolean;
    source?: string;
}

export interface ATSAnalysis {
    score: number;
    issues: string[];
    passedChecks: string[];
}

export interface ScoreInterpretation {
    level: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';
    message: string;
    color: string;
}

export interface AnalysisMeta {
    similarityUsed: boolean;
    similarityScore?: number | null;
    similarityNote?: string;
    skillConfidenceSource: 'huggingface' | 'heuristic';
}
