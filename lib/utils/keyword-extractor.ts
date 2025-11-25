import natural from 'natural';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Common stop words to exclude
const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
    'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how',
]);

export function extractKeywords(text: string, maxKeywords: number = 20): string[] {
    // Tokenize and clean
    const tokens = tokenizer.tokenize(text.toLowerCase()) || [];

    // Filter out stop words and short words
    const filteredTokens = tokens.filter(
        token => token.length > 2 && !STOP_WORDS.has(token) && /^[a-z]+$/.test(token)
    );

    // Count frequency
    const frequency: { [key: string]: number } = {};
    filteredTokens.forEach(token => {
        frequency[token] = (frequency[token] || 0) + 1;
    });

    // Sort by frequency and get top keywords
    const sortedKeywords = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxKeywords)
        .map(([keyword]) => keyword);

    return sortedKeywords;
}

export function extractKeywordsWithTfIdf(
    documents: string[],
    maxKeywords: number = 20
): string[][] {
    const tfidf = new TfIdf();

    // Add documents
    documents.forEach(doc => tfidf.addDocument(doc.toLowerCase()));

    // Extract keywords for each document
    return documents.map((_, docIndex) => {
        const keywords: Array<{ term: string; score: number }> = [];

        tfidf.listTerms(docIndex).forEach(item => {
            if (
                item.term.length > 2 &&
                !STOP_WORDS.has(item.term) &&
                /^[a-z]+$/.test(item.term)
            ) {
                keywords.push({ term: item.term, score: item.tfidf });
            }
        });

        return keywords
            .sort((a, b) => b.score - a.score)
            .slice(0, maxKeywords)
            .map(k => k.term);
    });
}

export function findKeywordMatches(
    resumeText: string,
    jobKeywords: string[]
): { matched: string[]; missing: string[] } {
    const resumeLower = resumeText.toLowerCase();
    const matched: string[] = [];
    const missing: string[] = [];

    jobKeywords.forEach(keyword => {
        if (resumeLower.includes(keyword.toLowerCase())) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    return { matched, missing };
}

export function calculateKeywordDensity(text: string, keyword: string): number {
    const textLower = text.toLowerCase();
    const keywordLower = keyword.toLowerCase();

    const occurrences = (textLower.match(new RegExp(keywordLower, 'g')) || []).length;
    const totalWords = text.split(/\s+/).length;

    return totalWords > 0 ? (occurrences / totalWords) * 100 : 0;
}
