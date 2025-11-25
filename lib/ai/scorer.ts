import { SCORE_WEIGHTS, SCORE_RANGES } from '../constants';
import type { CategoryScores, ScoreInterpretation } from '@/types/analysis';

export function calculateOverallScore(scores: CategoryScores): number {
    return Math.round(
        scores.skills * SCORE_WEIGHTS.skills +
        scores.experience * SCORE_WEIGHTS.experience +
        scores.keywords * SCORE_WEIGHTS.keywords +
        scores.education * SCORE_WEIGHTS.education +
        scores.ats * SCORE_WEIGHTS.ats
    );
}

export function getScoreInterpretation(score: number): ScoreInterpretation {
    if (score >= SCORE_RANGES.excellent.min) {
        return {
            level: 'excellent',
            message: 'Excellent match! Your resume is highly aligned with this job.',
            color: SCORE_RANGES.excellent.color,
        };
    } else if (score >= SCORE_RANGES.good.min) {
        return {
            level: 'good',
            message: 'Good match! You have a strong chance of consideration.',
            color: SCORE_RANGES.good.color,
        };
    } else if (score >= SCORE_RANGES.fair.min) {
        return {
            level: 'fair',
            message: 'Fair match. Some optimization recommended.',
            color: SCORE_RANGES.fair.color,
        };
    } else if (score >= SCORE_RANGES.poor.min) {
        return {
            level: 'poor',
            message: 'Poor match. Significant improvements needed.',
            color: SCORE_RANGES.poor.color,
        };
    } else {
        return {
            level: 'very-poor',
            message: 'Very poor match. Major revision required.',
            color: SCORE_RANGES.veryPoor.color,
        };
    }
}

export function calculateSkillsScore(
    matchedCount: number,
    totalRequired: number
): number {
    if (totalRequired === 0) return 100;
    return Math.round((matchedCount / totalRequired) * 100);
}

export function calculateExperienceScore(
    resumeYears: number | null,
    requiredYears: number
): number {
    if (resumeYears === null) return 50; // Default if we can't determine

    if (resumeYears >= requiredYears) {
        return 100;
    } else if (resumeYears >= requiredYears * 0.75) {
        return 85;
    } else if (resumeYears >= requiredYears * 0.5) {
        return 70;
    } else if (resumeYears >= requiredYears * 0.25) {
        return 50;
    } else {
        return 30;
    }
}

export function calculateKeywordScore(
    matchedKeywords: number,
    totalKeywords: number
): number {
    if (totalKeywords === 0) return 100;
    return Math.round((matchedKeywords / totalKeywords) * 100);
}

export function calculateEducationScore(
    hasRequiredEducation: boolean,
    hasSimilarField: boolean
): number {
    if (hasRequiredEducation) return 100;
    if (hasSimilarField) return 75;
    return 50;
}

export function normalizeScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
}

export function weightedAverage(scores: number[], weights: number[]): number {
    if (scores.length !== weights.length) {
        throw new Error('Scores and weights must have the same length');
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const weightedSum = scores.reduce((sum, score, i) => sum + score * weights[i], 0);

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
