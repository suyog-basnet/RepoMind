import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function findPackageJsonDir(rootDir) {
  if (fs.existsSync(path.join(rootDir, "package.json"))) return rootDir;

  const commonSubdirs = ["backend", "server", "api"];
  for (const sub of commonSubdirs) {
    const subPath = path.join(rootDir, sub);
    if (fs.existsSync(path.join(subPath, "package.json"))) return subPath;
  }
  return null;
}

export function auditDependencies(rootDir) {
  const targetDir = findPackageJsonDir(rootDir);
  if (!targetDir) {
    return { vulnerabilities: [], scanned: false, reason: "No package.json found" };
  }

  try {
    execSync("npm install --package-lock-only --ignore-scripts --no-audit", {
      cwd: targetDir,
      stdio: "ignore",
      timeout: 60000,
    });
  } catch {
    return { vulnerabilities: [], scanned: false, reason: "Could not resolve dependencies for audit" };
  }

  let raw;
  try {
    raw = execSync("npm audit --json", { cwd: targetDir, encoding: "utf8", timeout: 30000 });
  } catch (err) {
    raw = err.stdout;
  }

  if (!raw) {
    return { vulnerabilities: [], scanned: false, reason: "npm audit produced no output" };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { vulnerabilities: [], scanned: false, reason: "Could not parse npm audit output" };
  }

  const vulnerabilities = Object.values(parsed.vulnerabilities || {})
    .filter((v) => v.severity === "high" || v.severity === "critical")
    .map((v) => ({
      name: v.name,
      severity: v.severity,
      via: Array.isArray(v.via) ? v.via.map((x) => (typeof x === "string" ? x : x.title)).filter(Boolean) : [],
      fixAvailable: Boolean(v.fixAvailable),
    }));

  return { vulnerabilities, scanned: true };
}