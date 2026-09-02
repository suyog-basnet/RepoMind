import crypto from "crypto";
import { SyntaxKind } from "ts-morph";

const MIN_STATEMENTS = 3; // ignore trivial 1-2 line functions, too noisy

function normalize(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/["'`]/g, '"')
    .trim();
}

function hashText(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

export function findDuplicateFunctions(project, rootDir, pathModule) {
  const seen = new Map(); // hash -> [{ file, name, line }]

  for (const sf of project.getSourceFiles()) {
    sf.forEachDescendant((node) => {
      const kind = node.getKind();
      const isFunctionLike =
        kind === SyntaxKind.FunctionDeclaration ||
        kind === SyntaxKind.FunctionExpression ||
        kind === SyntaxKind.ArrowFunction ||
        kind === SyntaxKind.MethodDeclaration;

      if (!isFunctionLike) return;

      const body = node.getBody?.();
      if (!body) return;

      const statementCount = body.getStatements?.().length ?? 0;
      if (statementCount < MIN_STATEMENTS) return;

      const normalized = normalize(body.getText());
      const hash = hashText(normalized);

      const entry = {
        file: pathModule.relative(rootDir, sf.getFilePath()),
        name: node.getName?.() || "<anonymous>",
        line: node.getStartLineNumber(),
      };

      if (!seen.has(hash)) seen.set(hash, []);
      seen.get(hash).push(entry);
    });
  }

  return Array.from(seen.values()).filter((group) => group.length > 1);
}