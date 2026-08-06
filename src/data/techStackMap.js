// Maps dependency names (as they appear in package.json "dependencies" /
// "devDependencies", or common Python requirement names) to a badge id
// from ALL_BADGES. Used to auto-detect a project's tech stack instead of
// requiring the user to pick badges by hand.

export const NPM_PACKAGE_TO_BADGE = {
  react: 'react',
  'react-dom': 'react',
  'react-native': 'reactnative',
  next: 'nextjs',
  vue: 'vue',
  vite: 'vite',
  typescript: 'typescript',
  tailwindcss: 'tailwind',
  redux: 'redux',
  '@reduxjs/toolkit': 'redux',
  express: 'express',
  '@nestjs/core': 'nestjs',
  mongoose: 'mongodb',
  mongodb: 'mongodb',
  pg: 'postgresql',
  mysql: 'mysql',
  mysql2: 'mysql',
  redis: 'redis',
  ioredis: 'redis',
  prisma: 'prisma',
  '@prisma/client': 'prisma',
  graphql: 'graphql',
  'apollo-server': 'graphql',
  firebase: 'firebase',
  'firebase-admin': 'firebase',
  jest: 'jest',
  vitest: 'jest',
  docker: 'docker',
};

export const PY_PACKAGE_TO_BADGE = {
  django: 'django',
  flask: 'flask',
  fastapi: 'python',
  psycopg2: 'postgresql',
  pymongo: 'mongodb',
  redis: 'redis',
};

// Detects badges from a parsed package.json object.
export function detectBadgesFromPackageJson(pkg) {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const ids = new Set(['nodejs']);
  for (const depName of Object.keys(deps)) {
    const badgeId = NPM_PACKAGE_TO_BADGE[depName];
    if (badgeId) ids.add(badgeId);
  }
  return [...ids];
}

// Detects badges from a requirements.txt-style list of package names.
export function detectBadgesFromRequirements(lines) {
  const ids = new Set(['python']);
  for (const line of lines) {
    const name = line.split(/[=<>!~ ]/)[0].trim().toLowerCase();
    const badgeId = PY_PACKAGE_TO_BADGE[name];
    if (badgeId) ids.add(badgeId);
  }
  return [...ids];
}

// Turns package.json "scripts" into a best-effort install/run command list.
export function detectInstallStepsFromPackageJson(pkg, cloneUrl) {
  const steps = [];
  if (cloneUrl) steps.push(`git clone ${cloneUrl}.git`);
  const folderGuess = pkg.name ? pkg.name.replace(/^@.*\//, '') : 'project';
  if (cloneUrl) steps.push(`cd ${folderGuess}`);
  steps.push('npm install');
  const scripts = pkg.scripts || {};
  if (scripts.dev) steps.push('npm run dev');
  else if (scripts.start) steps.push('npm start');
  return steps;
}
