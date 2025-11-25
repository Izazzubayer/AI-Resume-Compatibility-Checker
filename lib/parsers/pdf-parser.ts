import pdf from 'pdf-parse';

export async function parsePDF(fileBuffer: Buffer): Promise<string> {
    try {
        const data = await pdf(fileBuffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF file. Please ensure it\'s a valid PDF.');
    }
}

export function extractTextFromPDF(text: string): string {
    // Clean up the text
    return text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();
}
