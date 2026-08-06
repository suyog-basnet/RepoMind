// Curated shields.io badge definitions. Each item's `id` doubles as the
// key used for dependency-based auto-detection (see techStackMap.js).
export const BADGE_CATEGORIES = [
  {
    label: 'Languages',
    items: [
      { id: 'javascript', name: 'JavaScript', color: 'F7DF1E', logo: 'javascript', logoColor: '000' },
      { id: 'typescript', name: 'TypeScript', color: '3178C6', logo: 'typescript', logoColor: 'white' },
      { id: 'python', name: 'Python', color: '3776AB', logo: 'python', logoColor: 'white' },
      { id: 'java', name: 'Java', color: 'ED8B00', logo: 'openjdk', logoColor: 'white' },
      { id: 'go', name: 'Go', color: '00ADD8', logo: 'go', logoColor: 'white' },
      { id: 'rust', name: 'Rust', color: '000000', logo: 'rust', logoColor: 'white' },
      { id: 'dart', name: 'Dart', color: '0175C2', logo: 'dart', logoColor: 'white' },
      { id: 'cpp', name: 'C++', color: '00599C', logo: 'cplusplus', logoColor: 'white' },
    ],
  },
  {
    label: 'Frontend',
    items: [
      { id: 'react', name: 'React', color: '20232A', logo: 'react', logoColor: '61DAFB' },
      { id: 'vue', name: 'Vue.js', color: '4FC08D', logo: 'vuedotjs', logoColor: 'white' },
      { id: 'nextjs', name: 'Next.js', color: '000000', logo: 'nextdotjs', logoColor: 'white' },
      { id: 'flutter', name: 'Flutter', color: '02569B', logo: 'flutter', logoColor: 'white' },
      { id: 'reactnative', name: 'React Native', color: '20232A', logo: 'react', logoColor: '61DAFB' },
      { id: 'tailwind', name: 'Tailwind CSS', color: '06B6D4', logo: 'tailwindcss', logoColor: 'white' },
      { id: 'vite', name: 'Vite', color: '646CFF', logo: 'vite', logoColor: 'white' },
      { id: 'redux', name: 'Redux', color: '764ABC', logo: 'redux', logoColor: 'white' },
    ],
  },
  {
    label: 'Backend & Data',
    items: [
      { id: 'nodejs', name: 'Node.js', color: '339933', logo: 'nodedotjs', logoColor: 'white' },
      { id: 'express', name: 'Express', color: '000000', logo: 'express', logoColor: 'white' },
      { id: 'nestjs', name: 'NestJS', color: 'E0234E', logo: 'nestjs', logoColor: 'white' },
      { id: 'django', name: 'Django', color: '092E20', logo: 'django', logoColor: 'white' },
      { id: 'flask', name: 'Flask', color: '000000', logo: 'flask', logoColor: 'white' },
      { id: 'mongodb', name: 'MongoDB', color: '47A248', logo: 'mongodb', logoColor: 'white' },
      { id: 'postgresql', name: 'PostgreSQL', color: '4169E1', logo: 'postgresql', logoColor: 'white' },
      { id: 'mysql', name: 'MySQL', color: '4479A1', logo: 'mysql', logoColor: 'white' },
      { id: 'redis', name: 'Redis', color: 'DC382D', logo: 'redis', logoColor: 'white' },
      { id: 'prisma', name: 'Prisma', color: '2D3748', logo: 'prisma', logoColor: 'white' },
      { id: 'graphql', name: 'GraphQL', color: 'E10098', logo: 'graphql', logoColor: 'white' },
      { id: 'firebase', name: 'Firebase', color: 'FFCA28', logo: 'firebase', logoColor: 'black' },
    ],
  },
  {
    label: 'Tools & Platform',
    items: [
      { id: 'docker', name: 'Docker', color: '2496ED', logo: 'docker', logoColor: 'white' },
      { id: 'git', name: 'Git', color: 'F05032', logo: 'git', logoColor: 'white' },
      { id: 'vercel', name: 'Vercel', color: '000000', logo: 'vercel', logoColor: 'white' },
      { id: 'aws', name: 'AWS', color: '232F3E', logo: 'amazonaws', logoColor: 'white' },
      { id: 'figma', name: 'Figma', color: 'F24E1E', logo: 'figma', logoColor: 'white' },
      { id: 'jest', name: 'Jest', color: 'C21325', logo: 'jest', logoColor: 'white' },
    ],
  },
];

export const ALL_BADGES = BADGE_CATEGORIES.flatMap((c) => c.items);

export function badgeMarkdown(badge, style = 'for-the-badge') {
  const label = encodeURIComponent(badge.name);
  return `![${badge.name}](https://img.shields.io/badge/${label}-${badge.color}?style=${style}&logo=${badge.logo}&logoColor=${badge.logoColor})`;
}

export const LICENSES = [
  { id: 'mit', name: 'MIT', badge: 'MIT', url: 'https://choosealicense.com/licenses/mit/' },
  { id: 'apache-2.0', name: 'Apache 2.0', badge: 'Apache%202.0', url: 'https://choosealicense.com/licenses/apache-2.0/' },
  { id: 'gpl-3.0', name: 'GPL v3', badge: 'GPLv3', url: 'https://choosealicense.com/licenses/gpl-3.0/' },
  { id: 'bsd-3-clause', name: 'BSD 3-Clause', badge: 'BSD%203--Clause', url: 'https://choosealicense.com/licenses/bsd-3-clause/' },
  { id: 'none', name: 'No License', badge: null, url: null },
];

// Maps SPDX-ish license identifiers that come back from the GitHub API
// to our local LICENSES list.
export function matchLicenseFromGithub(spdxId) {
  if (!spdxId) return 'none';
  const map = {
    MIT: 'mit',
    'Apache-2.0': 'apache-2.0',
    'GPL-3.0': 'gpl-3.0',
    'BSD-3-Clause': 'bsd-3-clause',
  };
  return map[spdxId] || 'none';
}
