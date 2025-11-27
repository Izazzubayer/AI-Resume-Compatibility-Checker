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

        const model = 'facebook/bart-large-mnli';
        
        // Step 1: Intelligent keyword extraction from job description
        // Extract different types of keywords/phrases
        const candidateKeywords = new Set<string>();
        
        // A. Extract capitalized terms (technologies, frameworks, tools)
        // Matches: React, Python, AWS, Machine Learning, etc.
        const capitalizedTerms = jobDescriptionText.match(/\b[A-Z][a-zA-Z]*(?:[\s.-][A-Z][a-zA-Z]*)*\b/g) || [];
        capitalizedTerms.forEach(term => {
            if (term.length > 2 && term.length < 30 && !/^(The|We|Our|You|Your|This|That|These|Those|Are|Is|Will|Must|Should|For|And|But|Or)$/i.test(term)) {
                candidateKeywords.add(term);
            }
        });
        
        // B. Extract technical terms (lowercase with special chars)
        // Matches: javascript, node.js, python, c++, react.js, etc.
        const technicalTerms = jobDescriptionText.match(/\b[a-z]+(?:[+#]|\.js|script|SQL|DB)?\b/gi) || [];
        technicalTerms.forEach(term => {
            if ((term.includes('+') || term.includes('#') || term.includes('.') || term.toLowerCase().endsWith('script') || term.toLowerCase().endsWith('sql')) && term.length > 2) {
                candidateKeywords.add(term);
            }
        });
        
        // C. Extract from bullet points (often contain key requirements)
        const bulletPoints = jobDescriptionText.match(/[-•*]\s*([^\n.]+)/g) || [];
        bulletPoints.forEach(point => {
            // Extract noun phrases and important words
            const cleanPoint = point.replace(/[-•*]\s*/, '');
            const words = cleanPoint.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
            words.forEach(phrase => {
                if (phrase.length > 3 && phrase.length < 30) {
                    candidateKeywords.add(phrase);
                }
            });
            
            // Also extract strong keywords (min 4 chars, appears significant)
            const strongWords = cleanPoint.match(/\b[a-z]{4,15}\b/gi) || [];
            strongWords.forEach(word => {
                if (!/^(with|have|must|should|will|able|good|strong|experience|years?|work|team|role|person|candidate)$/i.test(word)) {
                    candidateKeywords.add(word);
                }
            });
        });
        
        // Get unique keywords, prioritize multi-word terms
        const potentialKeywords = Array.from(candidateKeywords)
            .filter(kw => kw.length >= 3 && kw.length < 30)
            .sort((a, b) => {
                // Prioritize: multi-word > special chars > longer words
                const aWords = a.split(/\s+/).length;
                const bWords = b.split(/\s+/).length;
                if (aWords !== bWords) return bWords - aWords;
                
                const aSpecial = /[+#.]/.test(a);
                const bSpecial = /[+#.]/.test(b);
                if (aSpecial !== bSpecial) return bSpecial ? 1 : -1;
                
                return b.length - a.length;
            })
            .slice(0, 30);

        console.log('🔍 AI: Analyzing', potentialKeywords.length, 'extracted terms');

        // Step 2: Use AI to determine if each term is important and categorize it
        const categorizedResults = await Promise.all(
            potentialKeywords.slice(0, 25).map(async (keyword) => {
                try {
                    // Ask AI to classify the keyword
                    const result = await hf.zeroShotClassification({
                        model,
                        inputs: `"${keyword}" is a`,
                        parameters: {
                            candidate_labels: [
                                'technical skill or technology',
                                'soft skill or ability',
                                'job requirement or qualification'
                            ],
                        },
                    }) as any;

                    const labels = result.labels || [];
                    const scores = result.scores || [];
                    const topCategory = labels[0];
                    const confidence = scores[0];
                    
                    // Only keep if AI is reasonably confident
                    if (confidence < 0.35) {
                        return null;
                    }

                    // Check if keyword exists in resume (whole word match)
                    const resumeLower = resumeText.toLowerCase();
                    const keywordLower = keyword.toLowerCase();
                    const keywordRegex = new RegExp(`\\b${keywordLower.replace(/[+#.]/g, '\\$&')}\\b`, 'i');
                    const inResume = keywordRegex.test(resumeLower);

                    return {
                        keyword,
                        category: topCategory,
                        confidence,
                        inResume
                    };
                } catch (error) {
                    console.error(`Error analyzing keyword "${keyword}":`, error);
                    return null;
                }
            })
        );

        // Filter out nulls and low-confidence results
        const validResults = categorizedResults.filter(r => r !== null);

        const technicalSkills = validResults
            .filter(r => r!.category === 'technical skill or technology')
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
            .filter(r => r!.category === 'job requirement or qualification')
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
): Promise<{ requirement: string; coverage: 'fully covered' | 'partially covered' | 'not covered'; confidence: number }[]> {
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

                results.push({
                    requirement: req,
                    coverage: (labels[0] as 'fully covered' | 'partially covered' | 'not covered') || 'not covered',
                    confidence: scores[0] || 0
                });

                console.log(`   ✓ "${req.substring(0, 40)}..." → ${labels[0]}`);
            } catch (error) {
                console.error(`   ✗ Failed to analyze requirement: ${req}`, error);
                // Continue with other requirements even if one fails
                results.push({
                    requirement: req,
                    coverage: 'not covered' as const,
                    confidence: 0
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
