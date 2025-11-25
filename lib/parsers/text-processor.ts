export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

export function extractSections(text: string): { [key: string]: string } {
    const sections: { [key: string]: string } = {};

    // Common section headers
    const sectionPatterns = [
        { key: 'experience', patterns: ['experience', 'work history', 'employment', 'professional experience'] },
        { key: 'education', patterns: ['education', 'academic background', 'qualifications'] },
        { key: 'skills', patterns: ['skills', 'technical skills', 'competencies', 'expertise'] },
        { key: 'summary', patterns: ['summary', 'objective', 'profile', 'about'] },
    ];

    const lowerText = text.toLowerCase();

    sectionPatterns.forEach(({ key, patterns }) => {
        for (const pattern of patterns) {
            const regex = new RegExp(`${pattern}[:\\s]*([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
            const match = lowerText.match(regex);
            if (match && match[1]) {
                sections[key] = match[1].trim();
                break;
            }
        }
    });

    return sections;
}

export function extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
}

export function extractPhones(text: string): string[] {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    return text.match(phoneRegex) || [];
}

export function extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
}

export function countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

export function extractYearsOfExperience(text: string): number | null {
    const patterns = [
        /(\d+)\+?\s*years?\s*(?:of)?\s*experience/i,
        /experience:\s*(\d+)\+?\s*years?/i,
        /(\d+)\+?\s*years?\s*in/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
    }

    return null;
}
