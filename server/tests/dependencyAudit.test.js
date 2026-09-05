import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { auditDependencies } from "../lib/dependencyAudit.js";

describe("auditDependencies", () => {
  it("returns scanned:false when no package.json exists", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "test-"));
    const result = auditDependencies(dir);
    expect(result.scanned).toBe(false);
    expect(result.vulnerabilities).toEqual([]);
    rmSync(dir, { recursive: true, force: true });
  });

  it("finds package.json in a common backend subdirectory", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "test-"));
  fs.mkdirSync(path.join(dir, "backend"));
  fs.writeFileSync(path.join(dir, "backend", "package.json"), JSON.stringify({ name: "x" }));
  // Not asserting scanned:true here since real npm install would run — 
  // just confirming it doesn't fall through to "No package.json found"
  const result = auditDependencies(dir);
  expect(result.reason).not.toBe("No package.json found");
  rmSync(dir, { recursive: true, force: true });
});
});