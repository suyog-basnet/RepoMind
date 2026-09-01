import { loadProject } from "../lib/parseProject.js";
import { buildDependencyGraph } from "../lib/buildGraph.js";
import { findDeadCode } from "../lib/deadCode.js";

export function analyzeJsProject(rootDir) {
  const project = loadProject(rootDir);
  const graph = buildDependencyGraph(project, rootDir);
  const deadCode = findDeadCode(graph);

  return {
    fileCount: project.getSourceFiles().length,
    graph,
    deadCode,
  };
}