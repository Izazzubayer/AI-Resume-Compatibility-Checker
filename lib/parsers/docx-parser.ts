import mammoth from 'mammoth';

export async function parseDOCX(fileBuffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value;
    } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to parse DOCX file. Please ensure it\'s a valid Word document.');
    }
}

export function extractTextFromDOCX(text: string): string {
    // Clean up the text
    return text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();
}
