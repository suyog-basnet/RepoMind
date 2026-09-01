import { loadProject } from "../lib/parseProject.js";
import { buildDependencyGraph } from "../lib/buildGraph.js";
import { findDeadCode } from "../lib/deadCode.js";
import { getProjectComplexity } from "../lib/complexity.js";

export function analyzeJsProject(rootDir) {
  const project = loadProject(rootDir);
  const graph = buildDependencyGraph(project, rootDir);
  const deadCode = findDeadCode(graph);

const complexity = getProjectComplexity(project, rootDir);
  return {
    fileCount: project.getSourceFiles().length,
    graph,
    deadCode,
    complexity,
  };
}