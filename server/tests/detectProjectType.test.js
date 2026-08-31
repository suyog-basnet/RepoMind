import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { mkdtempSync, rmSync } from "fs";
import { detectProjectType } from "../lib/detectProjectType.js";

describe("detectProjectType", () => {
  it("detects a react project", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "test-"));
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ dependencies: { react: "^18.0.0" } })
    );
    expect(detectProjectType(dir)).toBe("react");
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns unknown for empty dir", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "test-"));
    expect(detectProjectType(dir)).toBe("unknown");
    rmSync(dir, { recursive: true, force: true });
  });
});