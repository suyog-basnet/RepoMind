import path from "path";

export function buildDependencyGraph(project, rootDir) {
  const nodes = new Map();

  for (const sf of project.getSourceFiles()) {
    const filePath = path.relative(rootDir, sf.getFilePath());
    nodes.set(filePath, { id: filePath, imports: [], importedBy: [] });
  }

  for (const sf of project.getSourceFiles()) {
    const fromPath = path.relative(rootDir, sf.getFilePath());

    for (const imp of sf.getImportDeclarations()) {
      const spec = imp.getModuleSpecifierValue();
      if (!spec.startsWith(".")) continue;

      const resolved = imp.getModuleSpecifierSourceFile();
      if (!resolved) continue;

      const toPath = path.relative(rootDir, resolved.getFilePath());

      const fromNode = nodes.get(fromPath);
      const toNode = nodes.get(toPath);

      if (fromNode && !fromNode.imports.includes(toPath)) {
        fromNode.imports.push(toPath);
      }
      if (toNode && !toNode.importedBy.includes(fromPath)) {
        toNode.importedBy.push(fromPath);
      }
    }
  }

  return Array.from(nodes.values());
}