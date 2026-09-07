import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { chunkFile } from "../lib/chunker.js";

function makeSourceFile(code) {
  const project = new Project({ useInMemoryFileSystem: true });
  return project.createSourceFile("test.ts", code);
}

describe("chunkFile", () => {
  it("chunks a top-level function", () => {
    const sf = makeSourceFile(`
      function calculateTotal(items) {
        return items.reduce((a, b) => a + b.price, 0);
      }
    `);
    const chunks = chunkFile(sf, "test.ts");
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].name).toBe("calculateTotal");
  });

  it("chunks a class as its own chunk", () => {
    const sf = makeSourceFile(`
      class UserService {
        findAll() { return []; }
      }
    `);
    const chunks = chunkFile(sf, "test.ts");
    const classChunk = chunks.find((c) => c.name === "UserService");
    expect(classChunk).toBeDefined();
  });

  it("skips trivial one-liner functions but still returns a whole-file fallback chunk", () => {
    const sf = makeSourceFile(`function noop() {}`);
    const chunks = chunkFile(sf, "test.ts");
    expect(chunks.length).toBe(1);
    expect(chunks[0].name).toBe("<file>");
    });

  it("falls back to whole-file chunk for files with no functions/classes", () => {
    const sf = makeSourceFile(`export const CONFIG = { apiUrl: "https://example.com", timeout: 5000 };`);
    const chunks = chunkFile(sf, "config.ts");
    expect(chunks.length).toBe(1);
    expect(chunks[0].name).toBe("<file>");
  });
});