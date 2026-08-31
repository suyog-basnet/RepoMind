import simpleGit from "simple-git";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";

export async function cloneRepo(repoUrl) {
  const dir = mkdtempSync(path.join(tmpdir(), "repomind-"));
  try {
    await simpleGit().clone(repoUrl, dir, ["--depth", "1"]);
    return dir;
  } catch (err) {
    rmSync(dir, { recursive: true, force: true });
    throw new Error(`Failed to clone ${repoUrl}: ${err.message}`);
  }
}

export function cleanupRepo(dir) {
  rmSync(dir, { recursive: true, force: true });
}