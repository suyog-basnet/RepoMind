import JSZip from 'jszip';
import { ALL_BADGES } from '../data/badgeOptions';
import { detectBadgesFromPackageJson, detectInstallStepsFromPackageJson } from '../data/techStackMap';

function buildFolderTree(paths, maxDepth = 3, maxEntries = 40) {
  const dirs = new Set();
  for (const p of paths) {
    const parts = p.split('/').filter(Boolean);
    for (let i = 1; i <= Math.min(parts.length, maxDepth); i++) {
      const segment = parts.slice(0, i).join('/');
      if (/(^|\/)(node_modules|\.git|dist|build|\.next|coverage)(\/|$)/.test(segment)) continue;
      dirs.add(segment);
    }
  }
  const sorted = [...dirs].sort().slice(0, maxEntries);
  return sorted
    .map((d) => {
      const depth = d.split('/').length - 1;
      const name = d.split('/').pop();
      return `${'  '.repeat(depth)}${depth === 0 ? '' : '└── '}${name}/`;
    })
    .join('\n');
}

/**
 * Reads an uploaded .zip file entirely client-side (nothing is
 * uploaded anywhere) and extracts the same signals the GitHub
 * importer looks for: package.json contents and folder structure.
 */
export async function analyzeZipFile(file) {
  const zip = await JSZip.loadAsync(file);
  const paths = Object.keys(zip.files);

  // Find package.json at, or one level below, the archive root.
  const pkgEntry = paths.find((p) => /^([^/]+\/)?package\.json$/.test(p));
  let pkg = null;
  if (pkgEntry) {
    try {
      const raw = await zip.files[pkgEntry].async('string');
      pkg = JSON.parse(raw);
    } catch {
      pkg = null;
    }
  }

  const badgeIds = pkg ? detectBadgesFromPackageJson(pkg) : [];
  const badges = ALL_BADGES.filter((b) => badgeIds.includes(b.id));
  const installSteps = pkg
    ? detectInstallStepsFromPackageJson(pkg, null).join('\n')
    : 'npm install';

  const scripts = pkg?.scripts || {};
  const usageCommand = scripts.dev ? 'npm run dev' : scripts.start ? 'npm start' : '';

  const folderTree = buildFolderTree(paths);
  const guessedName = pkg?.name || file.name.replace(/\.zip$/i, '');

  return {
    projectName: guessedName,
    description: pkg?.description || '',
    badges,
    installSteps,
    usageLang: 'bash',
    usageCode: usageCommand,
    folderTree,
    hasPackageJson: Boolean(pkg),
  };
}
