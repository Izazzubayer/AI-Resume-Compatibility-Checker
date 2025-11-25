import { HfInference } from '@huggingface/inference';
import { cosineSimilarity } from '../utils';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export async function getTextEmbedding(text: string): Promise<number[]> {
    try {
        const result = await hf.featureExtraction({
            model: process.env.HUGGING_FACE_MODEL_EMBEDDINGS || 'sentence-transformers/all-MiniLM-L6-v2',
            inputs: text.substring(0, 1000), // Limit to first 1000 chars
        });

        // Handle different response formats
        if (Array.isArray(result)) {
            return result as number[];
        } else if (Array.isArray((result as any)[0])) {
            return (result as any)[0] as number[];
        }

        throw new Error('Unexpected embedding format');
    } catch (error) {
        console.error('Error getting text embedding:', error);
        throw new Error('Failed to generate text embedding');
    }
}

export async function compareTexts(text1: string, text2: string): Promise<number> {
    try {
        const [embedding1, embedding2] = await Promise.all([
            getTextEmbedding(text1),
            getTextEmbedding(text2),
        ]);

        return cosineSimilarity(embedding1, embedding2);
    } catch (error) {
        console.error('Error comparing texts:', error);
        return 0;
    }
}

export async function analyzeSkillMatch(
    resumeText: string,
    skills: string[]
): Promise<{ skill: string; confidence: number; present: boolean }[]> {
    try {
        const result = await hf.zeroShotClassification({
            model: process.env.HUGGING_FACE_MODEL_CLASSIFICATION || 'facebook/bart-large-mnli',
            inputs: resumeText.substring(0, 1000),
            parameters: {
                candidate_labels: skills.slice(0, 10), // Limit to 10 skills per request
            },
        });

        return result.labels.map((label, idx) => ({
            skill: label,
            confidence: result.scores[idx],
            present: result.scores[idx] > 0.5,
        }));
    } catch (error) {
        console.error('Error analyzing skill match:', error);
        // Return default response on error
        return skills.map(skill => ({
            skill,
            confidence: 0,
            present: false,
        }));
    }
}

export async function batchCompareTexts(
    baseText: string,
    comparisons: string[]
): Promise<number[]> {
    try {
        const baseEmbedding = await getTextEmbedding(baseText);

        const scores = await Promise.all(
            comparisons.map(async (text) => {
                const embedding = await getTextEmbedding(text);
                return cosineSimilarity(baseEmbedding, embedding);
            })
        );

        return scores;
    } catch (error) {
        console.error('Error in batch text comparison:', error);
        return comparisons.map(() => 0);
    }
}
