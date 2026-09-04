export function getFolderStats(analysis, folderName) {
  const prefix = folderName === "root" ? null : `${folderName}/`;
  const matches = (id) => (prefix ? id.startsWith(prefix) : !id.includes("/"));

  const files = (analysis.graph ?? []).filter((n) => matches(n.id));
  const deadCode = (analysis.deadCode ?? []).filter((id) => matches(id));
  const fileStats = (analysis.fileStats ?? []).filter((f) => matches(f.id));
  const complexity = (analysis.complexity ?? []).filter((c) => matches(c.id));
  const duplicates = (analysis.duplicates ?? []).filter((group) =>
    group.some((d) => matches(d.file))
  );

  const allFns = complexity.flatMap((c) => c.functions);
  const avgComplexity = allFns.length
    ? (allFns.reduce((sum, fn) => sum + fn.complexity, 0) / allFns.length).toFixed(1)
    : "0";

  return {
    folderName,
    fileCount: files.length,
    deadCodeCount: deadCode.length,
    largeFileCount: fileStats.filter((f) => f.isLarge).length,
    duplicateCount: duplicates.length,
    avgComplexity,
  };
}