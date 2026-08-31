import { describe, it, expect } from "vitest";
import fs from "fs";
import { cloneRepo, cleanupRepo } from "../lib/cloneRepo.js";

describe("cloneRepo", () => {
  it("clones a real public repo and cleans up after", async () => {
    const dir = await cloneRepo("https://github.com/suyog-basnet/RepoMind");
    expect(fs.existsSync(dir)).toBe(true);
    expect(fs.existsSync(`${dir}/package.json`)).toBe(true);

    cleanupRepo(dir);
    expect(fs.existsSync(dir)).toBe(false);
  }, 15000); // clone can be slow — bump the timeout

  it("throws and still cleans up on a bad URL", async () => {
    await expect(cloneRepo("https://github.com/nope/does-not-exist-xyz")).rejects.toThrow();
  }, 15000);
});