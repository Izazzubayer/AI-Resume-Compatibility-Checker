import type { AnalysisResult, CategoryScores, Recommendation } from '@/types/analysis';
import { extractKeywords, findKeywordMatches } from '../utils/keyword-extractor';
import { extractSkillsFromText, matchSkills } from '../utils/skill-matcher';
import { checkATSCompatibility, generateATSRecommendations } from '../utils/ats-checker';
import { extractYearsOfExperience } from '../parsers/text-processor';
import {
    calculateOverallScore,
    calculateSkillsScore,
    calculateExperienceScore,
    calculateKeywordScore,
    normalizeScore,
} from './scorer';
import { compareTexts } from './huggingface';
import { generateId } from '../utils';

interface AnalyzeResumeParams {
    resumeText: string;
    jobDescription: string;
    jobTitle: string;
    seniority: string;
    fileName?: string;
}

export async function analyzeResume(
    params: AnalyzeResumeParams
): Promise<AnalysisResult> {
    const { resumeText, jobDescription, jobTitle, seniority, fileName = 'resume.pdf' } = params;

    // Step 1: Extract keywords from job description
    const jobKeywords = extractKeywords(jobDescription, 30);
    const { matched: matchedKeywords, missing: missingKeywords } = findKeywordMatches(
        resumeText,
        jobKeywords
    );

    // Step 2: Extract and match skills
    const resumeSkills = extractSkillsFromText(resumeText);
    const jobSkills = extractSkillsFromText(jobDescription);
    const skillsMatch = matchSkills(resumeSkills, jobSkills);

    // Step 3: Experience analysis
    const resumeYears = extractYearsOfExperience(resumeText);
    const requiredYears = getRequiredYears(seniority);

    // Step 4: ATS Compatibility check
    const atsCheck = checkATSCompatibility(resumeText, fileName);

    // Step 5: AI-powered similarity analysis
    let similarityScore = 50; // Default fallback
    try {
        similarityScore = await compareTexts(resumeText, jobDescription);
        similarityScore = normalizeScore(similarityScore * 100);
    } catch (error) {
        console.error('Similarity analysis failed, using fallback:', error);
    }

    // Step 6: Calculate category scores
    const categoryScores: CategoryScores = {
        skills: normalizeScore(calculateSkillsScore(skillsMatch.matched.length, jobSkills.length)),
        experience: normalizeScore(calculateExperienceScore(resumeYears, requiredYears)),
        keywords: normalizeScore(calculateKeywordScore(matchedKeywords.length, jobKeywords.length)),
        education: normalizeScore(similarityScore * 0.8), // Using similarity as proxy for education
        ats: normalizeScore(atsCheck.score),
    };

    // Step 7: Calculate overall score
    const overallScore = calculateOverallScore(categoryScores);

    // Step 8: Identify strengths and weaknesses
    const { strengths, weaknesses } = identifyStrengthsWeaknesses(categoryScores);

    // Step 9: Generate recommendations
    const recommendations = generateRecommendations({
        categoryScores,
        missingKeywords,
        missingSkills: skillsMatch.missing,
        atsCheck,
        resumeYears,
        requiredYears,
    });

    // Step 10: Build result
    const result: AnalysisResult = {
        id: generateId(),
        overallScore,
        categoryScores,
        strengths,
        weaknesses,
        missingKeywords: missingKeywords.slice(0, 10),
        recommendations,
        skillsAnalysis: {
            matched: skillsMatch.matched.map(skill => ({
                skill,
                confidence: 0.9,
                present: true,
            })),
            missing: skillsMatch.missing.slice(0, 10),
            matchPercentage: skillsMatch.matchPercentage,
        },
        atsCompatibility: {
            score: atsCheck.score,
            issues: atsCheck.failed,
            passedChecks: atsCheck.passed,
        },
        createdAt: new Date(),
    };

    return result;
}

function getRequiredYears(seniority: string): number {
    switch (seniority.toLowerCase()) {
        case 'entry':
            return 1;
        case 'mid':
            return 4;
        case 'senior':
            return 8;
        case 'lead':
            return 12;
        default:
            return 3;
    }
}

function identifyStrengthsWeaknesses(scores: CategoryScores): {
    strengths: string[];
    weaknesses: string[];
} {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.entries(scores).forEach(([category, score]) => {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

        if (score >= 80) {
            strengths.push(`Strong ${categoryName} match (${score}%)`);
        } else if (score < 60) {
            weaknesses.push(`Weak ${categoryName} match (${score}%)`);
        }
    });

    if (strengths.length === 0) {
        strengths.push('Opportunity for optimization across all categories');
    }

    return { strengths, weaknesses };
}

function generateRecommendations(params: {
    categoryScores: CategoryScores;
    missingKeywords: string[];
    missingSkills: string[];
    atsCheck: any;
    resumeYears: number | null;
    requiredYears: number;
}): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Skills recommendations
    if (params.categoryScores.skills < 70 && params.missingSkills.length > 0) {
        recommendations.push({
            category: 'Skills',
            title: 'Add Missing Skills',
            description: `Consider highlighting these skills if you have them: ${params.missingSkills.slice(0, 5).join(', ')}`,
            priority: 'high',
        });
    }

    // Keywords recommendations
    if (params.categoryScores.keywords < 70 && params.missingKeywords.length > 0) {
        recommendations.push({
            category: 'Keywords',
            title: 'Incorporate Key Terms',
            description: `Add relevant keywords: ${params.missingKeywords.slice(0, 5).join(', ')}`,
            priority: 'high',
        });
    }

    // Experience recommendations
    if (params.categoryScores.experience < 70) {
        if (params.resumeYears && params.resumeYears < params.requiredYears) {
            recommendations.push({
                category: 'Experience',
                title: 'Highlight Relevant Experience',
                description: 'Emphasize relevant projects and achievements to compensate for experience gap',
                priority: 'medium',
            });
        } else {
            recommendations.push({
                category: 'Experience',
                title: 'Better Format Experience Section',
                description: 'Make your experience more prominent and use action verbs',
                priority: 'medium',
            });
        }
    }

    // ATS recommendations
    if (params.categoryScores.ats < 70) {
        const atsRecs = generateATSRecommendations(params.atsCheck);
        atsRecs.forEach(rec => {
            recommendations.push({
                category: 'ATS',
                title: 'Improve ATS Compatibility',
                description: rec,
                priority: 'high',
            });
        });
    }

    // General recommendations
    if (recommendations.length === 0) {
        recommendations.push({
            category: 'General',
            title: 'Fine-tune Your Resume',
            description: 'Your resume looks good! Consider minor adjustments based on specific job requirements.',
            priority: 'low',
        });
    }

    return recommendations.slice(0, 8); // Limit to 8 recommendations
}
