import { describe, it, expect } from "vitest";
import { findDeadCode } from "../lib/deadCode.js";

describe("findDeadCode", () => {
  it("flags a file with no importers as dead code", () => {
    const graph = [
      { id: "src/main.jsx", imports: ["src/App.jsx"], importedBy: [] },
      { id: "src/App.jsx", imports: [], importedBy: ["src/main.jsx"] },
      { id: "src/utils/unused.js", imports: [], importedBy: [] },
    ];
    expect(findDeadCode(graph)).toEqual(["src/utils/unused.js"]);
  });

  it("does not flag entry points even with no importers", () => {
    const graph = [
      { id: "src/main.jsx", imports: [], importedBy: [] },
      { id: "vite.config.js", imports: [], importedBy: [] },
    ];
    expect(findDeadCode(graph)).toEqual([]);
  });
});