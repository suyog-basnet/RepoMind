import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { getFileComplexity } from "../lib/complexity.js";

function makeSourceFile(code) {
  const project = new Project({ useInMemoryFileSystem: true });
  return project.createSourceFile("test.ts", code);
}

describe("getFileComplexity", () => {
  it("a function with no branches has complexity 1", () => {
    const sf = makeSourceFile(`
      function foo() {
        return 1;
      }
    `);
    const result = getFileComplexity(sf);
    expect(result.functions[0].complexity).toBe(1);
  });

  it("a single if statement adds 1", () => {
    const sf = makeSourceFile(`
      function foo(x) {
        if (x) {
          return 1;
        }
        return 0;
      }
    `);
    const result = getFileComplexity(sf);
    expect(result.functions[0].complexity).toBe(2);
  });

  it("if/else if/else counts each branch", () => {
    const sf = makeSourceFile(`
      function foo(x) {
        if (x === 1) return "a";
        else if (x === 2) return "b";
        else return "c";
      }
    `);
    const result = getFileComplexity(sf);
    expect(result.functions[0].complexity).toBe(3);
  });

  it("logical && / || each add 1", () => {
    const sf = makeSourceFile(`
      function foo(a, b) {
        if (a && b) return 1;
        return 0;
      }
    `);
    const result = getFileComplexity(sf);
    // 1 base + 1 for if + 1 for && = 3
    expect(result.functions[0].complexity).toBe(3);
  });

  it("sums complexity across multiple functions in a file", () => {
    const sf = makeSourceFile(`
      function a() { return 1; }
      function b(x) { if (x) return 1; return 0; }
    `);
    const result = getFileComplexity(sf);
    expect(result.totalComplexity).toBe(3); // 1 + 2
  });
});