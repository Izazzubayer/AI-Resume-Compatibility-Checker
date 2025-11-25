import { COMMON_SKILLS } from '../constants';

// Skill synonyms for better matching
const SKILL_SYNONYMS: { [key: string]: string[] } = {
    'javascript': ['js', 'ecmascript', 'es6', 'es2015'],
    'typescript': ['ts'],
    'react': ['reactjs', 'react.js'],
    'angular': ['angularjs', 'angular.js'],
    'vue': ['vuejs', 'vue.js'],
    'node': ['nodejs', 'node.js'],
    'python': ['py'],
    'postgresql': ['postgres', 'psql'],
    'mongodb': ['mongo'],
    'aws': ['amazon web services'],
    'gcp': ['google cloud platform'],
};

export function extractSkillsFromText(text: string): string[] {
    const textLower = text.toLowerCase();
    const foundSkills = new Set<string>();

    // Check all common skills
    [...COMMON_SKILLS.technical, ...COMMON_SKILLS.soft].forEach(skill => {
        const skillLower = skill.toLowerCase();

        // Check main skill
        if (textLower.includes(skillLower)) {
            foundSkills.add(skill);
            return;
        }

        // Check synonyms
        const synonyms = SKILL_SYNONYMS[skillLower] || [];
        for (const synonym of synonyms) {
            if (textLower.includes(synonym)) {
                foundSkills.add(skill);
                return;
            }
        }
    });

    return Array.from(foundSkills);
}

export function matchSkills(
    resumeSkills: string[],
    requiredSkills: string[]
): {
    matched: string[];
    missing: string[];
    matchPercentage: number;
} {
    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
    const matched: string[] = [];
    const missing: string[] = [];

    requiredSkills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        let found = false;

        // Direct match
        if (resumeSkillsLower.includes(skillLower)) {
            matched.push(skill);
            found = true;
            return;
        }

        // Synonym match
        const synonyms = SKILL_SYNONYMS[skillLower] || [];
        for (const synonym of synonyms) {
            if (resumeSkillsLower.some(rs => rs.includes(synonym))) {
                matched.push(skill);
                found = true;
                break;
            }
        }

        if (!found) {
            missing.push(skill);
        }
    });

    const matchPercentage = requiredSkills.length > 0
        ? (matched.length / requiredSkills.length) * 100
        : 0;

    return { matched, missing, matchPercentage };
}

export function categorizeSkills(skills: string[]): {
    technical: string[];
    soft: string[];
    other: string[];
} {
    const technical: string[] = [];
    const soft: string[] = [];
    const other: string[] = [];

    skills.forEach(skill => {
        const skillLower = skill.toLowerCase();

        if (COMMON_SKILLS.technical.some(ts => ts.toLowerCase() === skillLower)) {
            technical.push(skill);
        } else if (COMMON_SKILLS.soft.some(ss => ss.toLowerCase() === skillLower)) {
            soft.push(skill);
        } else {
            other.push(skill);
        }
    });

    return { technical, soft, other };
}

export function suggestMissingSkills(
    currentSkills: string[],
    jobTitle: string
): string[] {
    const suggestions: string[] = [];
    const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

    // Suggest based on job title
    const titleLower = jobTitle.toLowerCase();

    if (titleLower.includes('frontend') || titleLower.includes('front-end')) {
        const frontendSkills = ['React', 'TypeScript', 'CSS', 'HTML'];
        frontendSkills.forEach(skill => {
            if (!currentSkillsLower.includes(skill.toLowerCase())) {
                suggestions.push(skill);
            }
        });
    }

    if (titleLower.includes('backend') || titleLower.includes('back-end')) {
        const backendSkills = ['Node.js', 'Python', 'SQL', 'API Design'];
        backendSkills.forEach(skill => {
            if (!currentSkillsLower.includes(skill.toLowerCase())) {
                suggestions.push(skill);
            }
        });
    }

    if (titleLower.includes('fullstack') || titleLower.includes('full-stack')) {
        const fullstackSkills = ['React', 'Node.js', 'TypeScript', 'SQL', 'Git'];
        fullstackSkills.forEach(skill => {
            if (!currentSkillsLower.includes(skill.toLowerCase())) {
                suggestions.push(skill);
            }
        });
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
}
