export interface JobDescription {
    title: string;
    seniority: 'entry' | 'mid' | 'senior' | 'lead';
    description: string;
    requiredSkills: string[];
    optionalSkills: string[];
    experienceRequired: string;
    educationRequired: string;
}

export interface JobRequirements {
    skills: string[];
    experience: string[];
    education: string[];
    keywords: string[];
}
