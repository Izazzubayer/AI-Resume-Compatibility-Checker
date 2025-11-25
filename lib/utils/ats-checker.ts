import { ATS_CHECKS } from '../constants';

export interface ATSCheckResult {
    score: number;
    passed: string[];
    failed: string[];
    warnings: string[];
}

export function checkATSCompatibility(
    resumeText: string,
    fileName: string
): ATSCheckResult {
    const passed: string[] = [];
    const failed: string[] = [];
    const warnings: string[] = [];

    // Check 1: File format
    const fileExt = fileName.toLowerCase().split('.').pop();
    if (fileExt === 'pdf' || fileExt === 'docx') {
        passed.push('Standard file format (PDF or DOCX)');
    } else {
        failed.push('Non-standard file format - use PDF or DOCX');
    }

    // Check 2: Contact information
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);

    if (hasEmail && hasPhone) {
        passed.push('Contact information present (email and phone)');
    } else if (hasEmail || hasPhone) {
        warnings.push('Consider adding both email and phone number');
    } else {
        failed.push('Missing contact information');
    }

    // Check 3: Section headings
    const commonHeadings = ['experience', 'education', 'skills'];
    const textLower = resumeText.toLowerCase();
    const foundHeadings = commonHeadings.filter(heading => textLower.includes(heading));

    if (foundHeadings.length >= 2) {
        passed.push('Proper section headings detected');
    } else {
        warnings.push('Add clear section headings (Experience, Education, Skills)');
    }

    // Check 4: Special characters
    const specialCharCount = (resumeText.match(/[•●○▪▫♦◊★☆]/g) || []).length;
    if (specialCharCount < 10) {
        passed.push('Minimal use of special characters');
    } else {
        warnings.push('Reduce special characters - ATS may not parse them correctly');
    }

    // Check 5: Length check
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount >= 200 && wordCount <= 800) {
        passed.push('Appropriate resume length');
    } else if (wordCount < 200) {
        warnings.push('Resume appears short - consider adding more details');
    } else {
        warnings.push('Resume appears long - consider condensing');
    }

    // Check 6: Keywords presence
    const keywordDensity = calculateOverallKeywordDensity(resumeText);
    if (keywordDensity >= 2 && keywordDensity <= 5) {
        passed.push('Good keyword density');
    } else if (keywordDensity < 2) {
        warnings.push('Add more relevant keywords from job description');
    } else {
        warnings.push('Keyword density too high - may appear as keyword stuffing');
    }

    // Check 7: No images (check for common image indicators)
    const imageIndicators = ['[image]', '<img', 'data:image'];
    const hasImages = imageIndicators.some(indicator =>
        resumeText.toLowerCase().includes(indicator)
    );

    if (!hasImages) {
        passed.push('No embedded images detected');
    } else {
        failed.push('Remove images - ATS cannot parse them');
    }

    // Check 8: Standard fonts (we can only check if special unicode characters are used)
    const nonStandardChars = (resumeText.match(/[^\x00-\x7F]/g) || []).length;
    if (nonStandardChars < resumeText.length * 0.05) {
        passed.push('Standard character encoding');
    } else {
        warnings.push('Consider using standard ASCII characters');
    }

    // Calculate score
    const totalChecks = passed.length + failed.length + warnings.length;
    const score = totalChecks > 0
        ? Math.round(((passed.length + warnings.length * 0.5) / totalChecks) * 100)
        : 0;

    return {
        score,
        passed,
        failed,
        warnings,
    };
}

function calculateOverallKeywordDensity(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    if (totalWords === 0) return 0;

    // Count unique meaningful words (longer than 3 characters)
    const meaningfulWords = words.filter(word => word.length > 3);
    const uniqueWords = new Set(meaningfulWords);

    return (uniqueWords.size / totalWords) * 100;
}

export function generateATSRecommendations(result: ATSCheckResult): string[] {
    const recommendations: string[] = [];

    if (result.failed.length > 0) {
        recommendations.push('🔴 Critical: ' + result.failed[0]);
    }

    if (result.warnings.length > 0) {
        recommendations.push('⚠️ Warning: ' + result.warnings[0]);
    }

    if (result.score >= 80) {
        recommendations.push('✅ Your resume is well-optimized for ATS systems');
    } else if (result.score >= 60) {
        recommendations.push('💡 Good ATS compatibility - a few improvements recommended');
    } else {
        recommendations.push('❌ Significant ATS optimization needed');
    }

    return recommendations;
}
