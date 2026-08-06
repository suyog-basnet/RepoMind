import { badgeMarkdown, LICENSES } from '../data/badgeOptions';
import { THEMES, SECTION_EMOJI } from '../data/themes';

function linesToList(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function heading(theme, level, key, text) {
  const emoji = theme.emojiHeadings ? `${SECTION_EMOJI[key] || ''} ` : '';
  const prefix = theme.terminalHeadings && level === 2 ? '$ ' : '';
  return `${'#'.repeat(level)} ${emoji}${prefix}${text}`;
}

function buildMermaidDiagram(arch) {
  const { frontend, backend, database } = arch;
  const nodes = [frontend, backend, database].filter(Boolean);
  if (nodes.length < 2) return '';
  const lines = ['```mermaid', 'flowchart TD'];
  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i].replace(/"/g, "'");
    const to = nodes[i + 1].replace(/"/g, "'");
    lines.push(`    ${String.fromCharCode(65 + i)}["${from}"] --> ${String.fromCharCode(66 + i)}["${to}"]`);
  }
  lines.push('```');
  return lines.join('\n');
}

export function generateMarkdown(state) {
  const theme = THEMES.find((t) => t.id === state.themeId) || THEMES[0];
  const {
    projectName,
    tagline,
    description,
    githubUser,
    repoName,
    badges,
    features,
    installSteps,
    usageLang,
    usageCode,
    screenshots,
    folderTree,
    architecture,
    contributing,
    licenseId,
    authorName,
    authorLinks,
    includeToc,
    roadmap,
  } = state;

  const license = LICENSES.find((l) => l.id === licenseId);
  const sections = [];
  const toc = [];

  // ---- Header ----
  let header = '';
  if (theme.typingHeader && githubUser) {
    const encodedTagline = encodeURIComponent(tagline || projectName || 'Welcome');
    header += `<p align="center">\n  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&center=true&vCenter=true&width=600&lines=${encodedTagline}" alt="Typing SVG" />\n</p>\n\n`;
  }

  const titleLine = `# ${projectName || 'Project Name'}`;
  header += theme.centeredHeader
    ? `<h1 align="center">${projectName || 'Project Name'}</h1>\n`
    : `${titleLine}\n`;

  if (tagline) {
    header += theme.centeredHeader
      ? `<p align="center"><em>${tagline}</em></p>\n`
      : `\n> ${tagline}\n`;
  }

  const badgeLine = badges.length
    ? '\n' + badges.map((b) => badgeMarkdown(b, theme.badgeStyle)).join(' ') + '\n'
    : '';

  const statusBadges = [];
  if (githubUser && repoName) {
    statusBadges.push(
      `![Last Commit](https://img.shields.io/github/last-commit/${githubUser}/${repoName}?style=${theme.badgeStyle}&color=a6e3a1)`
    );
    statusBadges.push(
      `![Issues](https://img.shields.io/github/issues/${githubUser}/${repoName}?style=${theme.badgeStyle}&color=f38ba8)`
    );
    statusBadges.push(
      `![Stars](https://img.shields.io/github/stars/${githubUser}/${repoName}?style=${theme.badgeStyle}&color=f9e2af)`
    );
    statusBadges.push(
      `![Forks](https://img.shields.io/github/forks/${githubUser}/${repoName}?style=${theme.badgeStyle}&color=89b4fa)`
    );
  }
  if (license?.badge) {
    statusBadges.push(
      `![License](https://img.shields.io/badge/license-${license.badge}-89b4fa?style=${theme.badgeStyle})`
    );
  }
  const statusLine = statusBadges.length ? '\n' + statusBadges.join(' ') + '\n' : '';

  const headerBlock = theme.centeredHeader
    ? `<div align="center">\n\n${header}${statusLine}${badgeLine}\n</div>\n`
    : `${header}${statusLine}${badgeLine}`;

  sections.push(headerBlock);

  // ---- About ----
  if (description) {
    sections.push(`${heading(theme, 2, 'about', 'About')}\n\n${description}\n`);
    toc.push('- [About](#about)');
  }

  // ---- Screenshots ----
  const screenshotList = linesToList(screenshots);
  if (screenshotList.length) {
    const imgs = screenshotList.map((url, i) => `![Screenshot ${i + 1}](${url})`).join('\n\n');
    sections.push(`${heading(theme, 2, 'screenshots', 'Screenshots')}\n\n${imgs}\n`);
    toc.push('- [Screenshots](#screenshots)');
  }

  // ---- Features ----
  const featureList = linesToList(features);
  if (featureList.length) {
    const items = featureList.map((f) => `- ${theme.emojiHeadings ? '✓ ' : ''}${f}`).join('\n');
    sections.push(`${heading(theme, 2, 'features', 'Features')}\n\n${items}\n`);
    toc.push('- [Features](#features)');
  }

  // ---- Tech stack (as a table, in addition to badges) ----
  if (badges.length) {
    const items = badges.map((b) => `- ${b.name}`).join('\n');
    sections.push(`${heading(theme, 2, 'techstack', 'Tech Stack')}\n\n${items}\n`);
    toc.push('- [Tech Stack](#tech-stack)');
  }

  // ---- Installation ----
  const installList = linesToList(installSteps);
  if (installList.length) {
    sections.push(
      `${heading(theme, 2, 'installation', 'Installation')}\n\n\`\`\`bash\n${installList.join('\n')}\n\`\`\`\n`
    );
    toc.push('- [Installation](#installation)');
  }

  // ---- Usage ----
  if (usageCode.trim()) {
    sections.push(`${heading(theme, 2, 'usage', 'Usage')}\n\n\`\`\`${usageLang}\n${usageCode}\n\`\`\`\n`);
    toc.push('- [Usage](#usage)');
  }

  // ---- Folder structure ----
  if (folderTree && folderTree.trim()) {
    sections.push(`${heading(theme, 2, 'folderstructure', 'Folder Structure')}\n\n\`\`\`\n${folderTree}\n\`\`\`\n`);
    toc.push('- [Folder Structure](#folder-structure)');
  }

  // ---- Architecture diagram ----
  const diagram = buildMermaidDiagram(architecture || {});
  if (diagram) {
    sections.push(`${heading(theme, 2, 'architecture', 'Architecture')}\n\n${diagram}\n`);
    toc.push('- [Architecture](#architecture)');
  }

  // ---- Roadmap ----
  const roadmapList = linesToList(roadmap);
  if (roadmapList.length) {
    const items = roadmapList.map((r) => `- [ ] ${r}`).join('\n');
    sections.push(`${heading(theme, 2, 'roadmap', 'Roadmap')}\n\n${items}\n`);
    toc.push('- [Roadmap](#roadmap)');
  }

  // ---- Contributing ----
  if (contributing) {
    sections.push(`${heading(theme, 2, 'contributing', 'Contributing')}\n\n${contributing}\n`);
    toc.push('- [Contributing](#contributing)');
  }

  // ---- License ----
  if (license && license.id !== 'none') {
    sections.push(
      `${heading(theme, 2, 'license', 'License')}\n\nThis project is licensed under the ${license.name} License. See [LICENSE](${license.url}) for details.\n`
    );
    toc.push('- [License](#license)');
  }

  // ---- Author ----
  if (authorName || authorLinks) {
    let authorBlock = `${heading(theme, 2, 'author', 'Author')}\n\n`;
    if (authorName) authorBlock += `**${authorName}**\n\n`;
    if (authorLinks) {
      const links = linesToList(authorLinks).map((l) => `- ${l}`).join('\n');
      authorBlock += `${links}\n`;
    }
    sections.push(authorBlock);
    toc.push('- [Author](#author)');
  }

  const tocBlock =
    includeToc && toc.length
      ? `${heading(theme, 2, 'toc', 'Table of Contents')}\n\n${toc.join('\n')}\n`
      : '';

  const divider = theme.dividers ? '\n---\n\n' : '\n\n';
  const body = [sections[0], tocBlock, ...sections.slice(1)].filter(Boolean).join(divider);

  return body.trim() + '\n';
}
