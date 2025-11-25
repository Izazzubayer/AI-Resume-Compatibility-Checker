export interface AnalysisResult {
    id: string;
    overallScore: number;
    categoryScores: CategoryScores;
    strengths: string[];
    weaknesses: string[];
    missingKeywords: string[];
    recommendations: Recommendation[];
    skillsAnalysis: SkillAnalysis;
    atsCompatibility: ATSAnalysis;
    createdAt: Date;
}

export interface CategoryScores {
    skills: number;
    experience: number;
    keywords: number;
    education: number;
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
    confidence: number;
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
