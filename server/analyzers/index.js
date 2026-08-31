import { analyzeJsProject } from "./jsProject.js";
import { analyzePythonProject } from "./pythonProject.js";

const jsTypes = ["react", "nextjs", "express-node", "vue", "node"];
const pyTypes = ["fastapi", "flask", "django", "python"];

export function runAnalyzer(projectType, rootDir) {
  if (jsTypes.includes(projectType)) return analyzeJsProject(rootDir);
  if (pyTypes.includes(projectType)) return analyzePythonProject(rootDir);

  return { fileCount: 0, graph: [], note: `Unsupported project type: ${projectType}` };
}