import { ALL_BADGES, matchLicenseFromGithub } from '../data/badgeOptions';
import { detectBadgesFromPackageJson, detectInstallStepsFromPackageJson } from '../data/techStackMap';

const GITHUB_API = 'https://api.github.com';

/**
 * Parses a pasted GitHub URL (or "owner/repo" shorthand) into its parts.
 * Returns null if the input doesn't look like a valid GitHub reference.
 */
export function parseGithubUrl(input) {
  const trimmed = input.trim().replace(/\.git$/, '').replace(/\/$/, '');
  const shorthand = /^([\w.-]+)\/([\w.-]+)$/;
  const fullUrl = /github\.com\/([\w.-]+)\/([\w.-]+)/;

  let match = trimmed.match(fullUrl) || trimmed.match(shorthand);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function githubFetch(path) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Repository not found. Check the URL and try again.');
    if (res.status === 403) throw new Error('GitHub API rate limit reached. Try again in a few minutes.');
    throw new Error(`GitHub API error (${res.status}).`);
  }
  return res.json();
}

async function fetchFileContent(owner, repo, path, branch) {
  try {
    const data = await githubFetch(
      `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    );
    if (data.encoding === 'base64') {
      return decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
    }
    return null;
  } catch {
    return null; // File simply doesn't exist in this repo — not fatal.
  }
}

/**
 * Builds a simple indented folder-tree string from a flat list of paths,
 * limited to a sensible depth so generated READMEs stay readable.
 */
function buildFolderTree(paths, maxDepth = 3, maxEntries = 40) {
  const dirs = new Set();
  for (const p of paths) {
    const parts = p.split('/');
    for (let i = 1; i <= Math.min(parts.length, maxDepth); i++) {
      // Skip noisy/irrelevant directories.
      const segment = parts.slice(0, i).join('/');
      if (/(^|\/)(node_modules|\.git|dist|build|\.next|coverage)(\/|$)/.test(segment)) continue;
      dirs.add(segment);
    }
  }
  const sorted = [...dirs].sort().slice(0, maxEntries);
  const lines = sorted.map((d) => {
    const depth = d.split('/').length - 1;
    const name = d.split('/').pop();
    return `${'  '.repeat(depth)}${depth === 0 ? '' : '└── '}${name}/`;
  });
  return lines.join('\n');
}

/**
 * Analyzes a public GitHub repository: pulls metadata, package.json (if
 * present), and a folder-structure overview, then derives badges and
 * install steps automatically. Returns a plain object the app's form
 * state can be initialized from.
 */
export async function analyzeGithubRepo(input) {
  const parsed = parseGithubUrl(input);
  if (!parsed) {
    throw new Error('That doesn\u2019t look like a valid GitHub repository URL.');
  }
  const { owner, repo } = parsed;

  const repoInfo = await githubFetch(`/repos/${owner}/${repo}`);
  const branch = repoInfo.default_branch || 'main';

  const [pkgRaw, tree] = await Promise.all([
    fetchFileContent(owner, repo, 'package.json', branch),
    githubFetch(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`).catch(() => null),
  ]);

  let pkg = null;
  if (pkgRaw) {
    try {
      pkg = JSON.parse(pkgRaw);
    } catch {
      pkg = null;
    }
  }

  const badgeIds = pkg ? detectBadgesFromPackageJson(pkg) : [];
  if (repoInfo.language) {
    const langBadge = ALL_BADGES.find(
      (b) => b.name.toLowerCase() === repoInfo.language.toLowerCase()
    );
    if (langBadge && !badgeIds.includes(langBadge.id)) badgeIds.push(langBadge.id);
  }
  const badges = ALL_BADGES.filter((b) => badgeIds.includes(b.id));

  const installSteps = pkg
    ? detectInstallStepsFromPackageJson(pkg, repoInfo.html_url).join('\n')
    : `git clone ${repoInfo.html_url}.git\ncd ${repo}`;

  const folderPaths = tree?.tree?.map((t) => t.path) || [];
  const folderTree = folderPaths.length ? buildFolderTree(folderPaths) : '';

  const scripts = pkg?.scripts || {};
  const usageCommand = scripts.dev
    ? 'npm run dev'
    : scripts.start
    ? 'npm start'
    : '';

  return {
    projectName: repoInfo.name,
    tagline: repoInfo.description || '',
    description: repoInfo.description || '',
    githubUser: owner,
    repoName: repo,
    badges,
    installSteps,
    usageLang: 'bash',
    usageCode: usageCommand,
    licenseId: matchLicenseFromGithub(repoInfo.license?.spdx_id),
    folderTree,
    stars: repoInfo.stargazers_count,
    topics: repoInfo.topics || [],
    hasPackageJson: Boolean(pkg),
  };
}
