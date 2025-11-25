// App Configuration Constants
export const APP_CONFIG = {
    name: 'AI Resume Compatibility Checker',
    description: 'Analyze resume compatibility with job descriptions using AI',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'), // 5MB
    allowedFileTypes: ['.pdf', '.doc', '.docx'],
};

// Scoring Weights
export const SCORE_WEIGHTS = {
    skills: 0.30,
    experience: 0.25,
    keywords: 0.20,
    education: 0.15,
    ats: 0.10,
};

// Score Interpretation Ranges
export const SCORE_RANGES = {
    excellent: { min: 90, max: 100, color: 'bg-gradient-to-r from-emerald-500 to-green-500' },
    good: { min: 75, max: 89, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    fair: { min: 60, max: 74, color: 'bg-gradient-to-r from-yellow-500 to-amber-500' },
    poor: { min: 45, max: 59, color: 'bg-gradient-to-r from-orange-500 to-red-500' },
    veryPoor: { min: 0, max: 44, color: 'bg-gradient-to-r from-red-600 to-rose-700' },
};

// Common Skills Database
export const COMMON_SKILLS = {
    technical: [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Swift',
        'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
        'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch',
    ],
    soft: [
        'Communication', 'Leadership', 'Team Collaboration', 'Problem Solving',
        'Critical Thinking', 'Time Management', 'Adaptability', 'Creativity',
    ],
};

// Seniority Levels
export const SENIORITY_LEVELS = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6-10 years)' },
    { value: 'lead', label: 'Lead/Principal (10+ years)' },
];

// ATS Check Items
export const ATS_CHECKS = [
    'Standard fonts usage',
    'No images or graphics in text',
    'Proper section headings',
    'No tables or columns',
    'Standard file format',
    'Keyword density check',
    'Contact information present',
    'No special characters',
];
