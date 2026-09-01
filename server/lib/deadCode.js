const ENTRY_POINT_PATTERNS = [
  /^src\/main\.(jsx?|tsx?)$/,
  /^src\/index\.(jsx?|tsx?)$/,
  /^index\.(jsx?|tsx?)$/,
  /\.config\.(js|ts)$/,
  /^vite\.config\./,
  /^index\.js$/,           
  /^server\/index\.js$/,  
];

const EXCLUDED_PATTERNS = [
  /\.test\.(js|jsx|ts|tsx)$/,
  /\.spec\.(js|jsx|ts|tsx)$/,
  /^tests?\//,
  /\/tests?\//,
];

function isLikelyEntryPoint(filePath) {
  return ENTRY_POINT_PATTERNS.some((pattern) => pattern.test(filePath));
}

function isExcludedFromDeadCodeCheck(filePath) {
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(filePath));
}

export function findDeadCode(graph) {
  return graph
    .filter(
      (node) =>
        node.importedBy.length === 0 &&
        !isLikelyEntryPoint(node.id) &&
        !isExcludedFromDeadCodeCheck(node.id)
    )
    .map((node) => node.id);
}