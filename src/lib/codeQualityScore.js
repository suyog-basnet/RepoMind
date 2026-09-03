// Scores real code-analysis data from the backend (/api/analyze),
// separate from scoreReadme, which scores the generated README's completeness.

function scoreComplexity(complexity) {
  if (!complexity?.length) return 100;
  const allFns = complexity.flatMap((f) => f.functions);
  if (!allFns.length) return 100;
  const avg = allFns.reduce((sum, fn) => sum + fn.complexity, 0) / allFns.length;
  // Simple, transparent curve: avg complexity of 1-5 is great, 15+ is poor
  if (avg <= 5) return 100;
  if (avg >= 15) return 40;
  return Math.round(100 - ((avg - 5) / 10) * 60);
}

function scoreDeadCode(deadCode, totalFiles) {
  if (!totalFiles) return 100;
  const ratio = (deadCode?.length ?? 0) / totalFiles;
  return Math.max(0, Math.round(100 - ratio * 200));
}

function scoreDuplicates(duplicates, totalFiles) {
  if (!totalFiles) return 100;
  const duplicateFileCount = new Set(
    (duplicates ?? []).flatMap((group) => group.map((d) => d.file))
  ).size;
  const ratio = duplicateFileCount / totalFiles;
  return Math.max(0, Math.round(100 - ratio * 150));
}

function scoreLargeFiles(fileStats) {
  if (!fileStats?.length) return 100;
  const largeCount = fileStats.filter((f) => f.isLarge).length;
  const ratio = largeCount / fileStats.length;
  return Math.max(0, Math.round(100 - ratio * 200));
}

export function scoreCodeQuality(analysis) {
  const totalFiles = analysis.fileCount ?? analysis.graph?.length ?? 0;

  const scores = {
    complexity: scoreComplexity(analysis.complexity),
    deadCode: scoreDeadCode(analysis.deadCode, totalFiles),
    duplicates: scoreDuplicates(analysis.duplicates, totalFiles),
    largeFiles: scoreLargeFiles(analysis.fileStats),
  };

  const overall = Math.round(
    (scores.complexity + scores.deadCode + scores.duplicates + scores.largeFiles) / 4
  );

  return { overall, breakdown: scores };
}