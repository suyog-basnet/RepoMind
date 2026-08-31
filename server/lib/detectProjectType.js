import fs from "fs";
import path from "path";

function detectFromDir(dir) {
  const has = (f) => fs.existsSync(path.join(dir, f));

  if (has("package.json")) {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps.next) return "nextjs";
    if (deps.react) return "react";
    if (deps.express) return "express-node";
    if (deps.vue) return "vue";
    return "node";
  }

  if (has("requirements.txt") || has("pyproject.toml")) {
    const file = has("requirements.txt") ? "requirements.txt" : "pyproject.toml";
    const text = fs.readFileSync(path.join(dir, file), "utf8");

    if (/fastapi/i.test(text)) return "fastapi";
    if (/flask/i.test(text)) return "flask";
    if (/django/i.test(text)) return "django";
    return "python";
  }

  return null;
}

export function detectProjectType(rootDir) {
  const rootType = detectFromDir(rootDir);
  if (rootType) return rootType;

  // Common monorepo layout: check subdirectories for a recognizable stack
  const commonSubdirs = ["frontend", "client", "backend", "server", "api", "web", "app"];
  for (const sub of commonSubdirs) {
    const subPath = path.join(rootDir, sub);
    if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
      const subType = detectFromDir(subPath);
      if (subType) return subType;
    }
  }

  return "unknown";
}