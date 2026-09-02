import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import path from "path";
import { findDuplicateFunctions } from "../lib/duplicateCode.js";

function makeProject(files) {
  const project = new Project({ useInMemoryFileSystem: true });
  for (const [name, content] of Object.entries(files)) {
    project.createSourceFile(name, content);
  }
  return project;
}

describe("findDuplicateFunctions", () => {
  it("flags identical function bodies across two files", () => {
    const code = `
      function calculateTotal(items) {
        let sum = 0;
        for (const item of items) {
          sum += item.price;
        }
        return sum;
      }
    `;
    const project = makeProject({ "a.ts": code, "b.ts": code });
    const dupes = findDuplicateFunctions(project, "/", path);

    expect(dupes.length).toBe(1);
    expect(dupes[0].length).toBe(2);
  });

  it("does not flag distinct functions", () => {
    const project = makeProject({
      "a.ts": `function foo() { let x = 1; x++; return x; }`,
      "b.ts": `function bar() { let y = 2; y--; return y * 2; }`,
    });
    const dupes = findDuplicateFunctions(project, "/", path);
    expect(dupes.length).toBe(0);
  });

  it("ignores trivial functions below the statement threshold", () => {
    const project = makeProject({
      "a.ts": `function foo() { return 1; }`,
      "b.ts": `function bar() { return 1; }`,
    });
    const dupes = findDuplicateFunctions(project, "/", path);
    expect(dupes.length).toBe(0); // only 1 statement each, below MIN_STATEMENTS
  });
});