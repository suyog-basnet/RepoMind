import path from "path";
import { loadProject } from "../lib/parseProject.js";
import { buildDependencyGraph } from "../lib/buildGraph.js";
import { findDeadCode } from "../lib/deadCode.js";
import { getFileStats } from "../lib/fileStats.js";
import { getProjectComplexity } from "../lib/complexity.js";
import { findDuplicateFunctions } from "../lib/duplicateCode.js";
import { graphToMermaid, graphToFolderMermaid } from "../lib/mermaidGraph.js";
import { findNestJsEndpoints, findExpressEndpoints } from "../lib/apiEndpoints.js";
import { extractEntities } from "../lib/schemaExtractor.js";
import {schemaToMermaid} from "../lib/schemaToMermaid.js";
import { extractPrismaEntities } from "../lib/prismaExtractor.js";
import { scanProjectForSecrets } from "../lib/secretScanner.js";


export function analyzeJsProject(rootDir) {
  const project = loadProject(rootDir);
  const graph = buildDependencyGraph(project, rootDir);
  const deadCode = findDeadCode(graph);
  const fileStats = getFileStats(graph, rootDir);
  const complexity = getProjectComplexity(project, rootDir);
  const duplicates = findDuplicateFunctions(project, rootDir, path);
  const architecture = graphToMermaid(graph, { maxNodes: 25 });
  const architectureFull = graphToFolderMermaid(graph);
  const apiEndpoints = [
    ...findNestJsEndpoints(project, rootDir, path),
    ...findExpressEndpoints(project, rootDir, path),
  ];
  const typeORMEntities = extractEntities(project, rootDir, path);
  const prismaEntities = extractPrismaEntities(rootDir);
  const entities = [...typeORMEntities, ...prismaEntities];
  const schema = schemaToMermaid(entities);
  const secretFindings = scanProjectForSecrets(project, rootDir, path);

  return {
    fileCount: project.getSourceFiles().length,
    graph,
    deadCode,
    fileStats,
    complexity,
    duplicates,
    architecture,
    architectureFull,
    apiEndpoints,
    entities,
    schema,
    secretFindings,
  };
}