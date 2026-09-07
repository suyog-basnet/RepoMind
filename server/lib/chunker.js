import { SyntaxKind } from "ts-morph";
import path from "path";

const CHUNKABLE_KINDS = [
  SyntaxKind.FunctionDeclaration,
  SyntaxKind.FunctionExpression,
  SyntaxKind.ArrowFunction,
  SyntaxKind.MethodDeclaration,
  SyntaxKind.ClassDeclaration,
];

export function chunkFile(sourceFile, filePath) {
  const chunks = [];

  sourceFile.forEachDescendant((node) => {
    if (!CHUNKABLE_KINDS.includes(node.getKind())) return;

    const name = node.getName ? node.getName() || "<anonymous>" : "<anonymous>";
    const text = node.getText();

    if (text.length < 40) return;

    chunks.push({
      filePath,
      name,
      startLine: node.getStartLineNumber(),
      endLine: node.getEndLineNumber(),
      content: text.slice(0, 1500),
    });
  });

  if (chunks.length === 0) {
    const text = sourceFile.getFullText();
    if (text.trim().length > 0) {
      chunks.push({
        filePath,
        name: "<file>",
        startLine: 1,
        endLine: sourceFile.getEndLineNumber(),
        content: text.slice(0, 1500),
      });
    }
  }

  return chunks;
}

export function chunkProject(project, rootDir) {
  const allChunks = [];
  for (const sf of project.getSourceFiles()) {
    const relativePath = path.relative(rootDir, sf.getFilePath());
    allChunks.push(...chunkFile(sf, relativePath));
  }
  return allChunks;
}