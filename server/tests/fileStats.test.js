import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { mkdtempSync, rmSync } from "fs";
import { getFileStats } from "../lib/fileStats.js";

describe("getFileStats", () => {
  it("flags a file over the line threshold as large", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "test-"));
    const bigContent = Array(400).fill("console.log('x');").join("\n");
    fs.writeFileSync(path.join(dir, "big.js"), bigContent);

    const graph = [{ id: "big.js", imports: [], importedBy: [] }];
    const stats = getFileStats(graph, dir);

    expect(stats[0].isLarge).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it("does not flag a small file", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "test-"));
    fs.writeFileSync(path.join(dir, "small.js"), "console.log('x');");

    const graph = [{ id: "small.js", imports: [], importedBy: [] }];
    const stats = getFileStats(graph, dir);

    expect(stats[0].isLarge).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });
});