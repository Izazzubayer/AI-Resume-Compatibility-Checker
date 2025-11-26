import type { AnalysisResult, CategoryScores, Recommendation, SkillMatch } from '@/types/analysis';
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
import { analyzeSkillMatch, compareTexts, extractAndCategorizeKeywords, analyzeRequirementCoverage } from './huggingface';
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
    const hasHuggingFaceKey = !!process.env.HUGGING_FACE_API_KEY;

    // Step 1: Extract keywords from job description (fallback)
    const jobKeywords = extractKeywords(jobDescription, 30);
    const { matched: matchedKeywords, missing: missingKeywords } = findKeywordMatches(
        resumeText,
        jobKeywords
    );
    
    // Step 1b: Use AI to categorize keywords if API key is available
    let categorizedKeywordsResult;
    
    if (hasHuggingFaceKey) {
        try {
            console.log('🤖 Using AI to extract and categorize keywords...');
            const aiCategorized = await extractAndCategorizeKeywords(jobDescription, resumeText);
            
            // Transform AI results to match our interface
            categorizedKeywordsResult = {
                technicalSkills: {
                    matched: aiCategorized.technicalSkills
                        .filter(k => k.inResume)
                        .map(k => k.keyword),
                    missing: aiCategorized.technicalSkills
                        .filter(k => !k.inResume)
                        .map(k => k.keyword)
                },
                abilities: {
                    matched: aiCategorized.abilities
                        .filter(k => k.inResume)
                        .map(k => k.keyword),
                    missing: aiCategorized.abilities
                        .filter(k => !k.inResume)
                        .map(k => k.keyword)
                },
                significantKeywords: {
                    matched: aiCategorized.significantKeywords
                        .filter(k => k.inResume)
                        .map(k => k.keyword),
                    missing: aiCategorized.significantKeywords
                        .filter(k => !k.inResume)
                        .map(k => k.keyword)
                }
            };
            
            console.log('✅ AI categorization successful!');
        } catch (error) {
            console.error('AI categorization failed, using fallback:', error);
            // Fallback to simple categorization
            categorizedKeywordsResult = {
                technicalSkills: { matched: [], missing: [] },
                abilities: { matched: [], missing: [] },
                significantKeywords: {
                    matched: matchedKeywords,
                    missing: missingKeywords
                }
            };
        }
    } else {
        console.log('ℹ️ No AI key - using fallback keyword extraction');
        // Fallback: put everything in significant keywords
        categorizedKeywordsResult = {
            technicalSkills: { matched: [], missing: [] },
            abilities: { matched: [], missing: [] },
            significantKeywords: {
                matched: matchedKeywords,
                missing: missingKeywords
            }
        };
    }

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
    let similarityScore: number | null = null;
    let similarityUsed = false;
    let similarityNote: string | undefined;

    if (hasHuggingFaceKey) {
        try {
            similarityScore = await compareTexts(resumeText, jobDescription);
            similarityScore = normalizeScore(similarityScore * 100);
            similarityUsed = true;
        } catch (error) {
            similarityNote = 'Similarity unavailable—Hugging Face comparison failed; scoring excludes this signal.';
            console.error('Similarity analysis failed, excluding from score:', error);
        }
    } else {
        similarityNote = 'Similarity unavailable—HUGGING_FACE_API_KEY not set; scoring excludes this signal.';
    }

    // Step 6: Calculate category scores
    const categoryScores: CategoryScores = {
        skills: normalizeScore(calculateSkillsScore(skillsMatch.matched.length, jobSkills.length)),
        experience: normalizeScore(calculateExperienceScore(resumeYears, requiredYears)),
        keywords: normalizeScore(calculateKeywordScore(matchedKeywords.length, jobKeywords.length)),
        ats: normalizeScore(atsCheck.score),
    };

    // Attempt to derive skill confidence from model output when available
    let skillConfidenceSource: 'huggingface' | 'heuristic' = 'heuristic';
    let skillsWithConfidence: SkillMatch[] = skillsMatch.matched.map(skill => ({
        skill,
        confidence: undefined,
        present: true,
    }));

    if (hasHuggingFaceKey && jobSkills.length > 0) {
        try {
            const hfSkillResults = await analyzeSkillMatch(resumeText, jobSkills.slice(0, 10));
            const confidenceMap = new Map<string, number>();

            hfSkillResults.forEach(result => {
                confidenceMap.set(result.skill.toLowerCase(), result.confidence);
            });

            skillsWithConfidence = skillsMatch.matched.map(skill => {
                const confidence = confidenceMap.get(skill.toLowerCase());
                return {
                    skill,
                    confidence,
                    present: confidence !== undefined ? confidence >= 0.5 : true,
                };
            });

            skillConfidenceSource = 'huggingface';
        } catch (error) {
            console.error('Skill confidence analysis failed; falling back to heuristic matches:', error);
        }
    }

    // Step 6b: Analyze per-requirement coverage (AI-powered)
    let requirementCoverageResults;
    
    if (hasHuggingFaceKey) {
        try {
            const requirements = extractRequirementsFromJD(jobDescription);
            
            if (requirements.length > 0) {
                console.log(`📋 Found ${requirements.length} requirements in job description`);
                requirementCoverageResults = await analyzeRequirementCoverage(resumeText, requirements);
                console.log(`✅ Analyzed coverage for ${requirementCoverageResults.length} requirements`);
            }
        } catch (error) {
            console.error('Requirement coverage analysis failed:', error);
            // Continue without requirement coverage if it fails
        }
    }

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
        matchedKeywords: matchedKeywords.slice(0, 15),
        missingKeywords: missingKeywords.slice(0, 10),
        categorizedKeywords: categorizedKeywordsResult,
        recommendations,
        skillsAnalysis: {
            matched: skillsWithConfidence,
            missing: skillsMatch.missing.slice(0, 10),
            matchPercentage: skillsMatch.matchPercentage,
        },
        atsCompatibility: {
            score: atsCheck.score,
            issues: atsCheck.failed,
            passedChecks: atsCheck.passed,
        },
        requirementCoverage: requirementCoverageResults,
        meta: {
            similarityUsed,
            similarityScore,
            similarityNote,
            skillConfidenceSource,
        },
        createdAt: new Date(),
    };

    return result;
}

/**
 * Extract requirements from job description
 * Looks for bullet points, numbered lists, and requirement sections
 */
function extractRequirementsFromJD(jobDescription: string): string[] {
    const requirements: string[] = [];
    
    // Split by lines
    const lines = jobDescription.split('\n');
    
    for (let line of lines) {
        line = line.trim();
        
        // Skip empty lines or very short lines
        if (!line || line.length < 10) continue;
        
        // Match bullet points: - • * ○ ▪
        // Match numbered lists: 1. 2) 1:
        // Match requirements that start with common prefixes
        const isBullet = /^[-•*○▪]\s+/.test(line);
        const isNumbered = /^\d+[\.\):\]]\s+/.test(line);
        const isRequirement = /^(required|must have|should have|preferred|experience with|knowledge of|proficiency in|strong|expertise in)/i.test(line);
        
        if (isBullet || isNumbered || isRequirement) {
            // Clean up the line
            let requirement = line
                .replace(/^[-•*○▪]\s+/, '') // Remove bullet
                .replace(/^\d+[\.\):\]]\s+/, '') // Remove number
                .trim();
            
            // Only add if meaningful length (not too short, not too long)
            if (requirement.length >= 15 && requirement.length <= 200) {
                requirements.push(requirement);
            }
        }
    }
    
    // If we didn't find many requirements via bullets, try splitting by common delimiters
    if (requirements.length < 3) {
        const sections = jobDescription.split(/\n\n+/);
        for (const section of sections) {
            const sentences = section.split(/[.;]\s+/);
            for (const sentence of sentences) {
                const trimmed = sentence.trim();
                if (trimmed.length >= 20 && trimmed.length <= 200) {
                    // Check if it looks like a requirement
                    if (/\b(experience|skill|knowledge|ability|proficient|familiar|must|required|should)\b/i.test(trimmed)) {
                        requirements.push(trimmed);
                    }
                }
            }
        }
    }
    
    // Return unique requirements, limited to top 10
    return Array.from(new Set(requirements)).slice(0, 10);
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
