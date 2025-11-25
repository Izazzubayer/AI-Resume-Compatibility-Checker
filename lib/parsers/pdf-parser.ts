const pdfParse = require('pdf-parse-fork');

export async function parsePDF(fileBuffer: Buffer): Promise<string> {
    try {
        console.log('📄 Starting PDF parse with pdf-parse-fork...');
        const data = await pdfParse(fileBuffer);

        if (!data.text || data.text.trim().length === 0) {
            throw new Error('No text content found in PDF');
        }

        console.log(`✅ PDF parsed successfully: ${data.numpages} pages, ${data.text.length} characters`);
        return data.text;
    } catch (error) {
        console.error('❌ PDF parsing error:', error);
        throw new Error('Failed to parse PDF file. Please ensure it\'s a valid, text-based PDF.');
    }
}

export function extractTextFromPDF(text: string): string {
    // Clean up the text
    return text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();
}
