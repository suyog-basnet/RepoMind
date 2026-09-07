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

    if (text.length < 40) return; // skip trivial one-liners, not useful context

    chunks.push({
      filePath,
      name,
      startLine: node.getStartLineNumber(),
      endLine: node.getEndLineNumber(),
      content: text.slice(0, 4000), // cap chunk size to keep embedding requests reasonable
    });
  });

  // fallback: if a file has no function/class-level chunks at all (e.g. pure config/data file),
  // chunk the whole file as one piece so it's still searchable
  if (chunks.length === 0) {
    const text = sourceFile.getFullText();
    if (text.trim().length > 0) {
      chunks.push({
        filePath,
        name: "<file>",
        startLine: 1,
        endLine: sourceFile.getEndLineNumber(),
        content: text.slice(0, 4000),
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