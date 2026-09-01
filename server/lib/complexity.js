import { SyntaxKind } from "ts-morph";
import path from "path";

const DECISION_KINDS = new Set([
  SyntaxKind.IfStatement,
  SyntaxKind.ForStatement,
  SyntaxKind.ForInStatement,
  SyntaxKind.ForOfStatement,
  SyntaxKind.WhileStatement,
  SyntaxKind.DoStatement,
  SyntaxKind.CaseClause,
  SyntaxKind.CatchClause,
  SyntaxKind.ConditionalExpression, 
  SyntaxKind.BinaryExpression,     
]);

function isLogicalBinary(node) {
  if (node.getKind() !== SyntaxKind.BinaryExpression) return false;
  const op = node.getOperatorToken().getText();
  return op === "&&" || op === "||";
}

function complexityOfNode(node) {
  let count = 1; // base complexity
  node.forEachDescendant((desc) => {
    if (desc.getKind() === SyntaxKind.BinaryExpression) {
      if (isLogicalBinary(desc)) count++;
    } else if (DECISION_KINDS.has(desc.getKind())) {
      count++;
    }
  });
  return count;
}

export function getFileComplexity(sourceFile) {
  let total = 0;
  const functions = [];

  sourceFile.forEachDescendant((node) => {
    const kind = node.getKind();
    const isFunctionLike =
      kind === SyntaxKind.FunctionDeclaration ||
      kind === SyntaxKind.FunctionExpression ||
      kind === SyntaxKind.ArrowFunction ||
      kind === SyntaxKind.MethodDeclaration;

    if (isFunctionLike) {
      const score = complexityOfNode(node);
      total += score;
      functions.push({
        name: node.getName?.() || "<anonymous>",
        complexity: score,
      });
    }
  });

  return { totalComplexity: total, functions };
}

export function getProjectComplexity(project, rootDir) {
  return project.getSourceFiles().map((sf) => ({
    id: path.relative(rootDir, sf.getFilePath()),
    ...getFileComplexity(sf),
  }));
}