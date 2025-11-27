/**
 * Analysis Insights - Derive actionable intelligence from raw analysis data
 * All insights are mathematically derived from real API data
 */

import type { AnalysisResult, RequirementCoverage } from '@/types/analysis';

export interface ApplicationReadiness {
    status: 'READY TO APPLY' | 'IMPROVE FIRST' | 'NEEDS WORK';
    color: 'green' | 'amber' | 'red';
    message: string;
    actionLabel: string;
}

export interface PriorityAction {
    priority: number;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    action: string;
    reason: string;
    estimatedImprovement: number;
}

export interface MatchStrength {
    name: string;
    score: number;
    label: string;
    description: string;
}

export interface ImprovementPotential {
    current: number;
    potential: number;
    gain: number;
    breakdown: { item: string; points: number }[];
}

export interface ConfidenceLevel {
    score: number;
    level: 'HIGH' | 'MODERATE' | 'LOW';
    message: string;
}

export interface ResumeHealth {
    score: number;
    grade: string;
    issues: number;
    strengths: number;
    message: string;
}

export interface SkillGap {
    youHave: { skill: string; confidence?: number }[];
    jobNeeds: { skill: string; found: boolean }[];
    matchCount: number;
    totalNeeded: number;
    matchPercentage: number;
}

export interface KeywordDensity {
    matchRate: number;
    coverage: 'EXCELLENT' | 'GOOD' | 'NEEDS WORK';
    distribution: {
        technical: { matched: number; total: number };
        abilities: { matched: number; total: number };
        contextual: { matched: number; total: number };
    };
}

export interface CompetitivePosition {
    position: string;
    score: number;
    percentile: string;
    message: string;
}

/**
 * Calculate application readiness based on multiple factors
 */
export function calculateApplicationReadiness(analysis: AnalysisResult): ApplicationReadiness {
    const { overallScore, requirementCoverage, categorizedKeywords } = analysis;
    
    const reqCoverage = requirementCoverage || [];
    const fullyCovered = reqCoverage.filter(r => r.coverage === 'fully covered').length;
    const total = reqCoverage.length || 1;
    const coverageRate = fullyCovered / total;
    
    const criticalSkillsMissing = categorizedKeywords?.technicalSkills?.missing?.length || 0;
    
    // Decision logic
    if (overallScore >= 80 && coverageRate >= 0.7 && criticalSkillsMissing === 0) {
        return {
            status: 'READY TO APPLY',
            color: 'green',
            message: 'Your profile strongly matches this role. Apply with confidence.',
            actionLabel: 'Apply Now'
        };
    } else if (overallScore >= 60 && criticalSkillsMissing <= 2) {
        return {
            status: 'IMPROVE FIRST',
            color: 'amber',
            message: 'You\'re competitive but addressing 2-3 key gaps would significantly improve your chances.',
            actionLabel: 'View Action Items'
        };
    } else {
        return {
            status: 'NEEDS WORK',
            color: 'red',
            message: 'Significant improvements needed to be competitive for this role.',
            actionLabel: 'See Recommendations'
        };
    }
}

/**
 * Generate top priority actions ranked by impact
 */
export function generatePriorityActions(analysis: AnalysisResult): PriorityAction[] {
    const actions: PriorityAction[] = [];
    const { categorizedKeywords, requirementCoverage, categoryScores, atsCompatibility } = analysis;
    
    // Critical technical skills missing
    const missingTechSkills = categorizedKeywords?.technicalSkills?.missing || [];
    if (missingTechSkills.length > 0) {
        missingTechSkills.slice(0, 2).forEach((skill, idx) => {
            actions.push({
                priority: idx + 1,
                impact: 'HIGH',
                action: `Add ${skill} experience to your resume`,
                reason: 'Critical technical requirement not found',
                estimatedImprovement: 15 - (idx * 3)
            });
        });
    }
    
    // Not covered requirements with high confidence
    const reqGaps = (requirementCoverage || [])
        .filter(r => r.coverage === 'not covered' && r.confidence > 0.5)
        .slice(0, 2);
    
    reqGaps.forEach(gap => {
        actions.push({
            priority: actions.length + 1,
            impact: 'HIGH',
            action: `Address requirement: "${gap.requirement.substring(0, 60)}${gap.requirement.length > 60 ? '...' : ''}"`,
            reason: 'Job requirement gap detected',
            estimatedImprovement: 12
        });
    });
    
    // Low ATS score
    if (categoryScores.ats < 70 && atsCompatibility.issues.length > 0) {
        actions.push({
            priority: actions.length + 1,
            impact: 'MEDIUM',
            action: `Fix ATS issue: ${atsCompatibility.issues[0]}`,
            reason: 'May not pass automated screening',
            estimatedImprovement: 8
        });
    }
    
    // Missing abilities
    const missingAbilities = categorizedKeywords?.abilities?.missing || [];
    if (missingAbilities.length > 0) {
        actions.push({
            priority: actions.length + 1,
            impact: 'MEDIUM',
            action: `Add ${missingAbilities[0]} examples`,
            reason: 'Soft skill gap identified',
            estimatedImprovement: 6
        });
    }
    
    // Low keyword score - show specific missing keywords
    if (categoryScores.keywords < 60) {
        const missingKws = (categorizedKeywords?.technicalSkills?.missing || [])
            .concat(categorizedKeywords?.abilities?.missing || [])
            .concat(categorizedKeywords?.significantKeywords?.missing || [])
            .slice(0, 5);
        
        if (missingKws.length > 0) {
            const kwList = missingKws.join(', ');
            actions.push({
                priority: actions.length + 1,
                impact: 'MEDIUM',
                action: `Add these keywords: ${kwList}`,
                reason: 'Important keywords missing from your resume',
                estimatedImprovement: Math.min(missingKws.length * 2, 10)
            });
        }
    }
    
    return actions.slice(0, 5).sort((a, b) => b.estimatedImprovement - a.estimatedImprovement);
}

/**
 * Calculate match strength across different dimensions
 */
export function calculateMatchStrength(analysis: AnalysisResult): MatchStrength[] {
    const { categoryScores, requirementCoverage, meta, skillsAnalysis } = analysis;
    
    const reqCoverage = requirementCoverage || [];
    const requirementScore = reqCoverage.length > 0 
        ? (reqCoverage.filter(r => r.coverage === 'fully covered').length / reqCoverage.length) * 100
        : 0;
    
    const getLabel = (score: number): string => {
        if (score >= 90) return 'EXCELLENT';
        if (score >= 80) return 'STRONG';
        if (score >= 70) return 'GOOD';
        if (score >= 60) return 'MODERATE';
        return 'WEAK';
    };
    
    return [
        {
            name: 'Technical Skills',
            score: categoryScores.skills,
            label: getLabel(categoryScores.skills),
            description: 'How well your technical skills match the required skills for this role'
        },
        {
            name: 'Requirements Met',
            score: Math.round(requirementScore),
            label: getLabel(requirementScore),
            description: 'Percentage of job requirements covered by your resume based on AI analysis'
        },
        {
            name: 'Semantic Fit',
            score: meta.similarityScore || 0,
            label: getLabel(meta.similarityScore || 0),
            description: 'AI-measured similarity between your resume content and the job description'
        },
        {
            name: 'Experience Level',
            score: categoryScores.experience,
            label: getLabel(categoryScores.experience),
            description: 'How your years of experience align with the seniority level of this position'
        },
        {
            name: 'ATS Compatibility',
            score: categoryScores.ats,
            label: getLabel(categoryScores.ats),
            description: 'How likely your resume is to pass Applicant Tracking System screening'
        }
    ];
}

/**
 * Calculate improvement potential
 */
export function calculateImprovementPotential(analysis: AnalysisResult): ImprovementPotential {
    const { overallScore, categorizedKeywords, requirementCoverage, atsCompatibility } = analysis;
    const breakdown: { item: string; points: number }[] = [];
    
    // Missing critical skills
    const missingTech = categorizedKeywords?.technicalSkills?.missing || [];
    if (missingTech.length > 0) {
        const points = Math.min(missingTech.length * 5, 20);
        breakdown.push({
            item: `${missingTech.length} missing technical skill${missingTech.length > 1 ? 's' : ''}`,
            points
        });
    }
    
    // Not covered requirements
    const notCovered = (requirementCoverage || []).filter(r => r.coverage === 'not covered').length;
    if (notCovered > 0) {
        const points = Math.min(notCovered * 3, 15);
        breakdown.push({
            item: `${notCovered} requirement${notCovered > 1 ? 's' : ''} not covered`,
            points
        });
    }
    
    // ATS issues
    const issues = atsCompatibility.issues.length;
    if (issues > 0) {
        const points = Math.min(issues * 5, 10);
        breakdown.push({
            item: `${issues} ATS issue${issues > 1 ? 's' : ''}`,
            points
        });
    }
    
    const totalGain = breakdown.reduce((sum, item) => sum + item.points, 0);
    const potential = Math.min(100, overallScore + totalGain);
    
    return {
        current: overallScore,
        potential,
        gain: totalGain,
        breakdown
    };
}

/**
 * Calculate application confidence level
 */
export function calculateApplicationConfidence(analysis: AnalysisResult): ConfidenceLevel {
    const { overallScore, meta, requirementCoverage, categorizedKeywords } = analysis;
    
    const weights = {
        overallScore: 0.3,
        semanticSimilarity: 0.25,
        requirementCoverage: 0.25,
        criticalSkills: 0.2
    };
    
    const reqCoverage = requirementCoverage || [];
    const reqRate = reqCoverage.length > 0
        ? reqCoverage.filter(r => r.coverage === 'fully covered').length / reqCoverage.length
        : 0.5;
    
    const missingCritical = categorizedKeywords?.technicalSkills?.missing?.length || 0;
    const hasCriticalSkills = missingCritical === 0 ? 1 : Math.max(0.3, 1 - (missingCritical * 0.2));
    
    const confidence = (
        (overallScore / 100) * weights.overallScore +
        ((meta.similarityScore || 0) / 100) * weights.semanticSimilarity +
        reqRate * weights.requirementCoverage +
        hasCriticalSkills * weights.criticalSkills
    ) * 100;
    
    let level: 'HIGH' | 'MODERATE' | 'LOW';
    let message: string;
    
    if (confidence >= 75) {
        level = 'HIGH';
        message = 'Strong candidate. You should feel confident applying to this role.';
    } else if (confidence >= 50) {
        level = 'MODERATE';
        message = 'Competitive candidate. Addressing key gaps would boost your chances significantly.';
    } else {
        level = 'LOW';
        message = 'Significant improvements needed to be competitive for this role.';
    }
    
    return {
        score: Math.round(confidence),
        level,
        message
    };
}

/**
 * Calculate resume health score
 */
export function calculateResumeHealth(analysis: AnalysisResult): ResumeHealth {
    const { categoryScores, atsCompatibility } = analysis;
    const score = categoryScores.ats;
    
    let grade: string;
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';
    
    const issues = atsCompatibility.issues.length;
    const strengths = atsCompatibility.passedChecks.length;
    
    let message: string;
    if (score >= 80) {
        message = 'Excellent formatting. Your resume is highly optimized for ATS systems.';
    } else if (score >= 70) {
        message = 'Good formatting with minor issues. Your resume should pass most ATS systems.';
    } else {
        message = 'Formatting issues detected. Your resume may not pass ATS screening.';
    }
    
    return {
        score,
        grade,
        issues,
        strengths,
        message
    };
}

/**
 * Analyze skill gaps
 */
export function analyzeSkillGaps(analysis: AnalysisResult): SkillGap {
    const { skillsAnalysis } = analysis;
    
    const youHave = skillsAnalysis.matched.map(m => ({
        skill: m.skill,
        confidence: m.confidence
    }));
    
    const allJobSkills = [
        ...skillsAnalysis.matched.map(m => m.skill),
        ...skillsAnalysis.missing
    ];
    
    const jobNeeds = allJobSkills.map(skill => ({
        skill,
        found: skillsAnalysis.matched.some(m => m.skill === skill)
    }));
    
    return {
        youHave,
        jobNeeds,
        matchCount: skillsAnalysis.matched.length,
        totalNeeded: allJobSkills.length,
        matchPercentage: skillsAnalysis.matchPercentage
    };
}

/**
 * Analyze keyword density
 */
export function analyzeKeywordDensity(analysis: AnalysisResult): KeywordDensity {
    const { matchedKeywords, missingKeywords, categorizedKeywords } = analysis;
    
    const totalKeywords = matchedKeywords.length + missingKeywords.length;
    const matchRate = totalKeywords > 0 ? (matchedKeywords.length / totalKeywords) * 100 : 0;
    
    let coverage: 'EXCELLENT' | 'GOOD' | 'NEEDS WORK';
    if (matchRate >= 70) coverage = 'EXCELLENT';
    else if (matchRate >= 50) coverage = 'GOOD';
    else coverage = 'NEEDS WORK';
    
    const tech = categorizedKeywords?.technicalSkills || { matched: [], missing: [] };
    const abilities = categorizedKeywords?.abilities || { matched: [], missing: [] };
    const contextual = categorizedKeywords?.significantKeywords || { matched: [], missing: [] };
    
    return {
        matchRate: Math.round(matchRate),
        coverage,
        distribution: {
            technical: {
                matched: tech.matched.length,
                total: tech.matched.length + tech.missing.length
            },
            abilities: {
                matched: abilities.matched.length,
                total: abilities.matched.length + abilities.missing.length
            },
            contextual: {
                matched: contextual.matched.length,
                total: contextual.matched.length + contextual.missing.length
            }
        }
    };
}

/**
 * Determine competitive position
 */
export function determineCompetitivePosition(analysis: AnalysisResult): CompetitivePosition {
    const { overallScore } = analysis;
    
    // Research-based thresholds
    const thresholds = {
        topTier: 85,
        strong: 75,
        competitive: 65,
        marginal: 50
    };
    
    let position: string;
    let percentile: string;
    let message: string;
    
    if (overallScore >= thresholds.topTier) {
        position = 'TOP TIER';
        percentile = 'Top 10%';
        message = 'You\'re in the top tier of applicants. Excellent match.';
    } else if (overallScore >= thresholds.strong) {
        position = 'STRONG';
        percentile = 'Top 25%';
        message = 'You\'re a strong candidate with competitive qualifications.';
    } else if (overallScore >= thresholds.competitive) {
        position = 'COMPETITIVE';
        percentile = 'Top 50%';
        message = 'You meet basic qualifications. Improvements would help you stand out.';
    } else {
        position = 'BELOW AVERAGE';
        percentile = 'Bottom 50%';
        message = 'Significant improvements needed to be competitive.';
    }
    
    return {
        position,
        score: overallScore,
        percentile,
        message
    };
}

