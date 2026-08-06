// A transparent, rule-based quality score (not an AI judgment call).
// Each check is worth a fixed number of points; the reasoning is visible
// so the score is trustworthy rather than a black box.
const CHECKS = [
  { id: 'description', label: 'Add a description', points: 15, test: (s) => s.description.trim().length >= 40 },
  { id: 'badges', label: 'Add tech stack badges', points: 10, test: (s) => s.badges.length > 0 },
  { id: 'features', label: 'List key features', points: 15, test: (s) => s.features.trim().split('\n').filter(Boolean).length >= 3 },
  { id: 'installation', label: 'Add installation steps', points: 15, test: (s) => s.installSteps.trim().length > 0 },
  { id: 'usage', label: 'Add a usage example', points: 10, test: (s) => s.usageCode.trim().length > 0 },
  { id: 'screenshots', label: 'Add screenshots', points: 10, test: (s) => s.screenshots.trim().length > 0 },
  { id: 'license', label: 'Add a license', points: 10, test: (s) => s.licenseId !== 'none' },
  { id: 'contributing', label: 'Add a contributing section', points: 5, test: (s) => s.contributing.trim().length > 0 },
  { id: 'author', label: 'Add author / contact info', points: 5, test: (s) => Boolean(s.authorName.trim() || s.authorLinks.trim()) },
  { id: 'toc', label: 'Include a table of contents', points: 5, test: (s) => s.includeToc },
];

export function scoreReadme(state) {
  let score = 0;
  const passed = [];
  const missing = [];

  for (const check of CHECKS) {
    if (check.test(state)) {
      score += check.points;
      passed.push(check);
    } else {
      missing.push(check);
    }
  }

  return { score, maxScore: 100, passed, missing };
}

export function scoreToStars(score) {
  return Math.max(1, Math.min(5, Math.round((score / 100) * 5)));
}
