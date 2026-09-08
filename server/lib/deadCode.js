const ENTRY_POINT_PATTERNS = [
  /(^|\/)main\.(jsx?|tsx?)$/,
  /(^|\/)index\.(jsx?|tsx?)$/,
  /(^|\/)server\.(js|ts)$/,
  /(^|\/)app\.(js|ts)$/,
  /\.config\.(js|ts)$/,
  /^vite\.config\./,
  /\.d\.ts$/,
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