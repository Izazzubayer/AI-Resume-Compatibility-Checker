export interface Resume {
    text: string;
    fileName: string;
    fileSize: number;
    uploadedAt: Date;
}

export interface ParsedResume {
    skills: string[];
    experience: ExperienceItem[];
    education: EducationItem[];
    keywords: string[];
    rawText: string;
}

export interface ExperienceItem {
    title?: string;
    company?: string;
    duration?: string;
    description?: string;
}

export interface EducationItem {
    degree?: string;
    institution?: string;
    year?: string;
}
