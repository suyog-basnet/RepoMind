import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { mkdtempSync, rmSync } from "fs";
import { loadProject } from "../lib/parseProject.js";
import { buildDependencyGraph } from "../lib/buildGraph.js";

describe("buildDependencyGraph", () => {
  it("links a->b when a imports b", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "test-"));
    fs.writeFileSync(path.join(dir, "b.js"), "export const x = 1;");
    fs.writeFileSync(path.join(dir, "a.js"), "import { x } from './b.js';");

    const project = loadProject(dir);
    const graph = buildDependencyGraph(project, dir);

    const a = graph.find((n) => n.id === "a.js");
    const b = graph.find((n) => n.id === "b.js");

    expect(a.imports).toContain("b.js");
    expect(b.importedBy).toContain("a.js");

    rmSync(dir, { recursive: true, force: true });
  });
});