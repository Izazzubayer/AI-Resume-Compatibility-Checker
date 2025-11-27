import { HfInference } from '@huggingface/inference';
import { cosineSimilarity } from '../utils';

const API_KEY = process.env.HUGGING_FACE_API_KEY;

if (!API_KEY) {
    console.warn('⚠️ HUGGING_FACE_API_KEY not found! Using fallback analysis only.');
} else {
    console.log('✅ Hugging Face API Key loaded:', API_KEY.substring(0, 10) + '...');
}

const hf = new HfInference(API_KEY);

export async function getTextEmbedding(text: string): Promise<number[]> {
    if (!API_KEY) {
        throw new Error('Hugging Face API key not configured');
    }

    try {
        console.log('🔄 Calling Hugging Face Embeddings API...');
        // Default to resume-specific MiniLM fine-tune
        const model = process.env.HUGGING_FACE_MODEL_EMBEDDINGS || 'anass1209/resume-job-matcher-all-MiniLM-L6-v2';
        console.log('Using model:', model);

        const result = await hf.featureExtraction({
            model,
            inputs: text.substring(0, 1000),
        });

        console.log('✅ Hugging Face API call successful!');

        // Handle different response formats
        if (Array.isArray(result)) {
            return result as number[];
        } else if (Array.isArray((result as any)[0])) {
            return (result as any)[0] as number[];
        }

        throw new Error('Unexpected embedding format');
    } catch (error) {
        console.error('❌ Hugging Face API Error:', error);
        throw error;
    }
}

export async function compareTexts(text1: string, text2: string): Promise<number> {
    try {
        console.log('🚀 Starting semantic similarity analysis with Hugging Face...');
        const [embedding1, embedding2] = await Promise.all([
            getTextEmbedding(text1),
            getTextEmbedding(text2),
        ]);

        const similarity = cosineSimilarity(embedding1, embedding2);
        console.log('✅ Similarity calculated:', (similarity * 100).toFixed(2) + '%');
        return similarity;
    } catch (error) {
        console.error('❌ Text comparison failed:', error);
        throw error;
    }
}

export async function analyzeSkillMatch(
    resumeText: string,
    skills: string[]
): Promise<{ skill: string; confidence: number; present: boolean }[]> {
    if (!API_KEY) {
        throw new Error('Hugging Face API key not configured');
    }

    try {
        console.log('🔄 Calling Hugging Face Classification API for skill matching...');
        const model = process.env.HUGGING_FACE_MODEL_CLASSIFICATION || 'facebook/bart-large-mnli';
        console.log('Using model:', model);

        const result = await hf.zeroShotClassification({
            model,
            inputs: resumeText.substring(0, 1000),
            parameters: {
                candidate_labels: skills.slice(0, 10),
            },
        }) as any; // Type assertion needed for runtime API response

        console.log('✅ Skill matching successful!');

        // Runtime response has labels and scores arrays
        const labels = result.labels || [];
        const scores = result.scores || [];

        return labels.map((label: string, idx: number) => ({
            skill: label,
            confidence: scores[idx] || 0,
            present: (scores[idx] || 0) > 0.5,
        }));
    } catch (error) {
        console.error('❌ Skill analysis failed:', error);
        throw error;
    }
}

export async function batchCompareTexts(
    baseText: string,
    comparisons: string[]
): Promise<number[]> {
    try {
        console.log('🔄 Batch comparing texts with Hugging Face...');
        const baseEmbedding = await getTextEmbedding(baseText);

        const scores = await Promise.all(
            comparisons.map(async (text) => {
                const embedding = await getTextEmbedding(text);
                return cosineSimilarity(baseEmbedding, embedding);
            })
        );

        console.log('✅ Batch comparison complete!');
        return scores;
    } catch (error) {
        console.error('❌ Batch comparison failed:', error);
        throw error;
    }
}

/**
 * AI-Powered Keyword Extraction using Zero-Shot Classification
 * Extracts keywords from text and categorizes them intelligently
 */
export async function extractAndCategorizeKeywords(
    jobDescriptionText: string,
    resumeText: string
): Promise<{
    technicalSkills: { keyword: string; inResume: boolean; confidence: number }[];
    abilities: { keyword: string; inResume: boolean; confidence: number }[];
    significantKeywords: { keyword: string; inResume: boolean; confidence: number }[];
}> {
    if (!API_KEY) {
        throw new Error('Hugging Face API key not configured');
    }

    try {
        console.log('🔄 AI: Extracting and categorizing keywords from job description...');

        // Step 1: Extract important phrases using the AI model
        // We'll use token classification to identify key terms
        const model = 'facebook/bart-large-mnli';
        
        // Extract potential keywords (simple tokenization for now, but AI will categorize)
        const words = jobDescriptionText
            .toLowerCase()
            .match(/\b[a-z][a-z0-9+#.\\-]*\b/g) || [];
        
        // Get unique keywords (frequency > 1 or length > 4)
        const wordFreq: { [key: string]: number } = {};
        words.forEach(word => {
            if (word.length > 3) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        const potentialKeywords = Object.entries(wordFreq)
            .filter(([_, freq]) => freq >= 2 || _.length > 5)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(([word]) => word);

        console.log('🔍 AI: Found', potentialKeywords.length, 'potential keywords');

        // Step 2: Use AI to categorize each keyword
        const categories = ['technical skill', 'soft skill or ability', 'general keyword'];
        
        const categorizedResults = await Promise.all(
            potentialKeywords.slice(0, 20).map(async (keyword) => {
                try {
                    const result = await hf.zeroShotClassification({
                        model,
                        inputs: `The term "${keyword}" in a job description context`,
                        parameters: {
                            candidate_labels: categories,
                        },
                    }) as any;

                    const labels = result.labels || [];
                    const scores = result.scores || [];
                    const topCategory = labels[0];
                    const confidence = scores[0];

                    // Check if keyword exists in resume
                    const inResume = resumeText.toLowerCase().includes(keyword);

                    return {
                        keyword,
                        category: topCategory,
                        confidence,
                        inResume
                    };
                } catch (error) {
                    console.error(`Error categorizing keyword "${keyword}":`, error);
                    return null;
                }
            })
        );

        // Filter out nulls and categorize
        const validResults = categorizedResults.filter(r => r !== null);

        const technicalSkills = validResults
            .filter(r => r!.category === 'technical skill')
            .map(r => ({
                keyword: r!.keyword,
                inResume: r!.inResume,
                confidence: r!.confidence
            }));

        const abilities = validResults
            .filter(r => r!.category === 'soft skill or ability')
            .map(r => ({
                keyword: r!.keyword,
                inResume: r!.inResume,
                confidence: r!.confidence
            }));

        const significantKeywords = validResults
            .filter(r => r!.category === 'general keyword')
            .map(r => ({
                keyword: r!.keyword,
                inResume: r!.inResume,
                confidence: r!.confidence
            }));

        console.log('✅ AI: Categorization complete!');
        console.log(`   - Technical Skills: ${technicalSkills.length}`);
        console.log(`   - Abilities: ${abilities.length}`);
        console.log(`   - Significant Keywords: ${significantKeywords.length}`);

        return {
            technicalSkills,
            abilities,
            significantKeywords
        };
    } catch (error) {
        console.error('❌ AI keyword extraction failed:', error);
        throw error;
    }
}

/**
 * Analyze how well a resume covers specific job requirements
 * Uses zero-shot classification to determine coverage level for each requirement
 */
export async function analyzeRequirementCoverage(
    resumeText: string,
    requirements: string[]
): Promise<{ 
    requirement: string; 
    coverage: 'fully covered' | 'partially covered' | 'not covered'; 
    confidence: number;
    userHas?: string;
    comparison?: string;
}[]> {
    if (!API_KEY) {
        throw new Error('Hugging Face API key not configured');
    }

    if (requirements.length === 0) {
        return [];
    }

    try {
        console.log('🔄 AI: Analyzing per-requirement coverage...');
        console.log(`   Requirements to analyze: ${requirements.length}`);

        const model = 'facebook/bart-large-mnli';
        const results = [];

        // Limit to first 8 requirements to avoid rate limits and keep response time reasonable
        const requirementsToAnalyze = requirements.slice(0, 8);
        
        // Use a shortened resume text for faster processing
        const resumeSnippet = resumeText.substring(0, 800);

        for (const req of requirementsToAnalyze) {
            try {
                const result = await hf.zeroShotClassification({
                    model,
                    inputs: `Resume: ${resumeSnippet}\n\nRequirement: ${req}`,
                    parameters: {
                        candidate_labels: ['fully covered', 'partially covered', 'not covered']
                    }
                }) as any;

                const labels = result.labels || [];
                const scores = result.scores || [];
                const coverage = (labels[0] as 'fully covered' | 'partially covered' | 'not covered') || 'not covered';

                // Extract what the user has for this requirement
                const { userHas, comparison } = extractUserMatch(resumeText, req, coverage);

                results.push({
                    requirement: req,
                    coverage,
                    confidence: scores[0] || 0,
                    userHas,
                    comparison
                });

                console.log(`   ✓ "${req.substring(0, 40)}..." → ${labels[0]}`);
            } catch (error) {
                console.error(`   ✗ Failed to analyze requirement: ${req}`, error);
                // Continue with other requirements even if one fails
                results.push({
                    requirement: req,
                    coverage: 'not covered' as const,
                    confidence: 0,
                    comparison: 'Unable to determine match'
                });
            }
        }

        console.log('✅ AI: Requirement coverage analysis complete!');
        console.log(`   Analyzed: ${results.length} requirements`);

        return results;
    } catch (error) {
        console.error('❌ AI requirement coverage analysis failed:', error);
        throw error;
    }
}

/**
 * Extract what the user has from their resume that matches the requirement
 */
function extractUserMatch(resumeText: string, requirement: string, coverage: string): { userHas: string; comparison: string } {
    const lowerResume = resumeText.toLowerCase();
    const lowerReq = requirement.toLowerCase();
    
    // Extract years of experience if mentioned in requirement
    const yearsMatch = requirement.match(/(\d+)\+?\s*years?/i);
    if (yearsMatch) {
        const requiredYears = parseInt(yearsMatch[1]);
        const resumeYearsMatch = resumeText.match(/(\d+)\+?\s*years?/i);
        const userYears = resumeYearsMatch ? parseInt(resumeYearsMatch[1]) : 0;
        
        if (userYears > 0) {
            const comparison = userYears >= requiredYears 
                ? `You have ${userYears} years of experience (meets ${requiredYears}+ years requirement)`
                : `You have ${userYears} years of experience (${requiredYears} years required)`;
            return { userHas: `${userYears} years of experience`, comparison };
        }
    }
    
    // Extract degree/education if mentioned
    if (lowerReq.includes('degree') || lowerReq.includes('bachelor') || lowerReq.includes('master')) {
        const degrees = ['phd', 'ph.d', 'doctorate', 'master', 'mba', 'bachelor', 'bs', 'ba', 'ms', 'ma'];
        const foundDegree = degrees.find(deg => lowerResume.includes(deg));
        if (foundDegree) {
            return {
                userHas: `${foundDegree.toUpperCase()} degree`,
                comparison: `You have a ${foundDegree.toUpperCase()} degree`
            };
        }
    }
    
    // Extract specific skills or tools mentioned in requirement
    const skills = extractSkillsFromRequirement(requirement);
    const matchedSkills = skills.filter(skill => lowerResume.includes(skill.toLowerCase()));
    
    if (matchedSkills.length > 0 && skills.length > 0) {
        const comparison = coverage === 'fully covered'
            ? `You have experience with ${matchedSkills.join(', ')}`
            : coverage === 'partially covered'
            ? `You have ${matchedSkills.length} of ${skills.length} skills: ${matchedSkills.join(', ')}`
            : `Missing: ${skills.filter(s => !matchedSkills.includes(s)).join(', ')}`;
        
        return { userHas: matchedSkills.join(', '), comparison };
    }
    
    // Default comparison based on coverage
    if (coverage === 'fully covered') {
        return { userHas: 'Relevant experience found', comparison: 'Your resume demonstrates this requirement' };
    } else if (coverage === 'partially covered') {
        return { userHas: 'Some relevant experience', comparison: 'Partial match found in your resume' };
    } else {
        return { userHas: 'Not found in resume', comparison: 'This requirement is not clearly addressed in your resume' };
    }
}

/**
 * Extract potential skills/keywords from a requirement text
 */
function extractSkillsFromRequirement(requirement: string): string[] {
    const skills: string[] = [];
    
    // Common technical skills and tools
    const techTerms = ['javascript', 'python', 'react', 'node', 'aws', 'docker', 'kubernetes', 'sql', 'java', 'c++', 'typescript', 'angular', 'vue', 'figma', 'sketch', 'photoshop', 'illustrator', 'ux', 'ui', 'agile', 'scrum', 'jira', 'git'];
    
    const lowerReq = requirement.toLowerCase();
    techTerms.forEach(term => {
        if (lowerReq.includes(term)) {
            skills.push(term);
        }
    });
    
    return skills;
}
