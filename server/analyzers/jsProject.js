import path from "path";
import { loadProject } from "../lib/parseProject.js";
import { buildDependencyGraph } from "../lib/buildGraph.js";
import { findDeadCode } from "../lib/deadCode.js";
import { getFileStats } from "../lib/fileStats.js";
import { getProjectComplexity } from "../lib/complexity.js";
import { findDuplicateFunctions } from "../lib/duplicateCode.js";
import { graphToMermaid } from "../lib/mermaidGraph.js";

export function analyzeJsProject(rootDir) {
  const project = loadProject(rootDir);
  const graph = buildDependencyGraph(project, rootDir);
  const deadCode = findDeadCode(graph);
  const fileStats = getFileStats(graph, rootDir);
  const complexity = getProjectComplexity(project, rootDir);
  const duplicates = findDuplicateFunctions(project, rootDir, path);
  const architectureDiagram = graphToMermaid(graph, {maxNodes: 25 });

  return {
    fileCount: project.getSourceFiles().length,
    graph,
    deadCode,
    fileStats,
    complexity,
    duplicates,
    architectureDiagram,
  };
}