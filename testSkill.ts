import { extractSkillsFromText } from './lib/utils/skill-matcher';
const text = 'I have good communication skills and experience with Go and AI.';
console.log('Extracted skills:', extractSkillsFromText(text));
