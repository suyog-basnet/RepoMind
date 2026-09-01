import fs from "fs";
import path from "path";

const LARGE_FILE_THRESHOLD = 300; // lines

export function getFileStats(graph, rootDir) {
  return graph.map((node) => {
    const fullPath = path.join(rootDir, node.id);
    let lineCount = 0;
    try {
      lineCount = fs.readFileSync(fullPath, "utf8").split("\n").length;
    } catch {
      lineCount = 0;
    }
    return {
      id: node.id,
      lineCount,
      isLarge: lineCount > LARGE_FILE_THRESHOLD,
    };
  });
}