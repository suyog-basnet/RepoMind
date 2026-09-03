import { describe, it, expect } from "vitest";
import { graphToMermaid } from "../lib/mermaidGraph.js";

describe("graphToMermaid", () => {
  it("produces valid mermaid syntax for a small graph", () => {
    const graph = [
      { id: "src/main.jsx", imports: ["src/App.jsx"], importedBy: [] },
      { id: "src/App.jsx", imports: [], importedBy: ["src/main.jsx"] },
    ];
    const result = graphToMermaid(graph);

    expect(result.diagram).toContain("graph TD");
    expect(result.diagram).toContain('["main.jsx"]');
    expect(result.diagram).toContain('["App.jsx"]');
    expect(result.diagram).toMatch(/n0 --> n1|n1 --> n0/);
    expect(result.truncated).toBe(false);
  });

  it("truncates graphs larger than maxNodes and flags it", () => {
    const graph = Array.from({ length: 100 }, (_, i) => ({
      id: `src/file${i}.js`,
      imports: [],
      importedBy: [],
    }));
    const result = graphToMermaid(graph, { maxNodes: 10 });

    expect(result.truncated).toBe(true);
    expect(result.renderedCount).toBe(10);
    expect(result.totalCount).toBe(100);
  });

  it("does not reference edges pointing to truncated-out nodes", () => {
    const graph = [
      { id: "a.js", imports: ["b.js"], importedBy: [] },
      { id: "b.js", imports: [], importedBy: ["a.js"] },
    ];
    const result = graphToMermaid(graph, { maxNodes: 1 });

    expect(result.diagram).not.toContain("-->");
  });
});