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
        const model = process.env.HUGGING_FACE_MODEL_EMBEDDINGS || 'sentence-transformers/all-MiniLM-L6-v2';
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
        });

        console.log('✅ Skill matching successful!');

        return result.labels.map((label, idx) => ({
            skill: label,
            confidence: result.scores[idx],
            present: result.scores[idx] > 0.5,
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
